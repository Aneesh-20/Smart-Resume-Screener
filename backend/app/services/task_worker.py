import asyncio
import os
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from ..db.session import SessionLocal
from ..models.candidate import (
    Candidate, CandidateSkill, ExperienceEntry, EducationEntry, CertificationEntry
)
from ..models.job import ScreeningJob
from ..models.screening import ScreeningRun
from ..models.task import ProcessingTask
from ..services.extractor_service import ResumeExtractorService
from ..services.llm_adapter import llm_adapter
from ..services.fallback_adapter import DeterministicFallbackAdapter
from ..services.scoring_service import ScoringService
from ..services.audit_service import AuditService
from ..core.logging import logger
from ..core.config import settings


async def process_parse_resume_task(task_id: str, candidate_id: str):
    """Processes resume file text extraction and structured parsing asynchronously."""
    db: Session = SessionLocal()
    task = db.query(ProcessingTask).filter(ProcessingTask.id == task_id).first()
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if not candidate:
        if task:
            task.status = "failed"
            task.error_message = "Candidate not found."
            task.completed_at = datetime.now(timezone.utc)
            db.commit()
        db.close()
        return

    try:
        if task:
            task.status = "running"
        candidate.status = "processing"
        db.commit()

        # Step 1: Text extraction
        file_path = os.path.join(settings.UPLOAD_DIR, candidate.stored_filename)
        raw_text, extraction_warnings = ResumeExtractorService.extract_text_from_file(file_path, candidate.file_type)
        candidate.raw_text = raw_text

        # Step 2: Structured extraction (LLM or fallback)
        parse_payload = None
        if llm_adapter.is_configured:
            try:
                payload, metadata = await llm_adapter.extract_resume(raw_text)
                parse_payload = payload
            except Exception as e:
                logger.warning(f"LLM extraction failed: {e}. Using deterministic fallback parser.")
                parse_payload = DeterministicFallbackAdapter.parse_resume(raw_text)
                parse_payload.warnings.append(f"LLM extraction fallback: {str(e)}")
        else:
            parse_payload = DeterministicFallbackAdapter.parse_resume(raw_text)

        # Merge warnings
        all_warnings = list(set(extraction_warnings + parse_payload.warnings))
        candidate.parse_warnings = all_warnings
        candidate.parse_payload = parse_payload.model_dump()

        # Step 3: Populate candidate structured fields
        candidate.candidate_name = parse_payload.candidate_name
        candidate.email = parse_payload.contact.email
        candidate.phone = parse_payload.contact.phone
        candidate.location = parse_payload.contact.location
        candidate.links = parse_payload.contact.links
        candidate.total_experience_years = parse_payload.total_experience_years
        candidate.summary = parse_payload.summary

        # Clear existing child records if re-parsing
        db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate.id).delete()
        db.query(ExperienceEntry).filter(ExperienceEntry.candidate_id == candidate.id).delete()
        db.query(EducationEntry).filter(EducationEntry.candidate_id == candidate.id).delete()
        db.query(CertificationEntry).filter(CertificationEntry.candidate_id == candidate.id).delete()

        # Insert normalized skills
        for s in parse_payload.skills:
            db.add(CandidateSkill(
                candidate_id=candidate.id,
                name=s.name,
                normalized_name=s.normalized_name,
                category=s.category,
                evidence=s.evidence
            ))

        # Insert experience
        for exp in parse_payload.experience:
            db.add(ExperienceEntry(
                candidate_id=candidate.id,
                title=exp.title,
                company=exp.company,
                start_date=exp.start_date,
                end_date=exp.end_date,
                is_current=exp.is_current,
                highlights=exp.highlights,
                skills=exp.skills,
                evidence=exp.evidence
            ))

        # Insert education
        for edu in parse_payload.education:
            db.add(EducationEntry(
                candidate_id=candidate.id,
                institution=edu.institution,
                degree=edu.degree,
                field_of_study=edu.field_of_study,
                end_year=edu.end_year,
                evidence=edu.evidence
            ))

        # Insert certifications
        for cert in parse_payload.certifications:
            db.add(CertificationEntry(
                candidate_id=candidate.id,
                name=cert.name,
                issuer=cert.issuer,
                year=cert.year,
                evidence=cert.evidence
            ))

        candidate.status = "parsed"
        candidate.status_message = "Parsed successfully"

        if task:
            task.status = "completed"
            task.completed_at = datetime.now(timezone.utc)

        AuditService.log_event(
            db=db,
            event_type="resume_parsed",
            entity_type="candidate",
            entity_id=candidate.id,
            details={"filename": candidate.original_filename, "warnings_count": len(all_warnings)}
        )

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error parsing resume {candidate_id}: {e}")
        candidate.status = "failed"
        candidate.status_message = str(e)
        if task:
            task.status = "failed"
            task.error_message = str(e)
            task.completed_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()


async def process_screening_run_task(task_id: str, run_id: str):
    """Processes candidate screening and scoring against immutable job snapshot."""
    db: Session = SessionLocal()
    task = db.query(ProcessingTask).filter(ProcessingTask.id == task_id).first()
    run = db.query(ScreeningRun).filter(ScreeningRun.id == run_id).first()

    if not run:
        if task:
            task.status = "failed"
            task.error_message = "Screening run not found."
            task.completed_at = datetime.now(timezone.utc)
            db.commit()
        db.close()
        return

    job = db.query(ScreeningJob).filter(ScreeningJob.id == run.job_id).first()
    candidates = db.query(Candidate).filter(
        Candidate.job_id == run.job_id,
        Candidate.status.in_(["parsed", "scored"])
    ).all()

    try:
        if task:
            task.status = "running"
        run.status = "running"
        run.total_candidates = len(candidates)
        db.commit()

        screened = 0
        for candidate in candidates:
            try:
                await ScoringService.evaluate_candidate(
                    db=db,
                    candidate=candidate,
                    job=job,
                    screening_run=run
                )
                screened += 1
                run.screened_candidates = screened
                db.commit()
            except Exception as cand_err:
                logger.error(f"Failed to score candidate {candidate.id}: {cand_err}")

        run.status = "completed"
        run.completed_at = datetime.now(timezone.utc)

        if task:
            task.status = "completed"
            task.completed_at = datetime.now(timezone.utc)

        AuditService.log_event(
            db=db,
            event_type="screening_run_completed",
            entity_type="screening_run",
            entity_id=run.id,
            details={"total": len(candidates), "screened": screened}
        )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Screening run {run_id} failed: {e}")
        run.status = "failed"
        if task:
            task.status = "failed"
            task.error_message = str(e)
            task.completed_at = datetime.now(timezone.utc)
        db.commit()
    finally:
        db.close()


def enqueue_task(task_type: str, entity_type: str, entity_id: str, db: Session) -> ProcessingTask:
    """Creates a queued task record and triggers background execution."""
    task = ProcessingTask(
        task_type=task_type,
        entity_type=entity_type,
        entity_id=entity_id,
        status="queued"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    if task_type == "parse_resume":
        asyncio.create_task(process_parse_resume_task(task.id, entity_id))
    elif task_type == "screen_job":
        asyncio.create_task(process_screening_run_task(task.id, entity_id))

    return task
