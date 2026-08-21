import os
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Query, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.job_repo import JobRepository
from app.repositories.candidate_repo import CandidateRepository
from app.schemas.job import JobCreate, JobUpdate, JobRead, JobSummaryStats
from app.schemas.candidate import CandidateListItemRead
from app.models.candidate import Candidate
from app.models.task import ProcessingTask
from app.core.errors import NotFoundError, UnsupportedFileError, FileSizeExceededError, DuplicateResumeError
from app.core.security import calculate_content_hash, generate_safe_filename
from app.core.config import settings
from app.services.task_worker import process_parse_resume_task
from app.services.audit_service import AuditService

router = APIRouter(prefix="/jobs", tags=["Screening Jobs"])


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate, db: Session = Depends(get_db)):
    """Create a new screening job with job description and threshold."""
    job = JobRepository.create(db, job_in)
    AuditService.log_event(
        db=db,
        event_type="job_created",
        entity_type="screening_job",
        entity_id=job.id,
        details={"title": job.title, "threshold": job.min_score_threshold}
    )
    stats = JobRepository.get_stats(db, job)
    job_read = JobRead.model_validate(job)
    job_read.stats = stats
    return job_read


@router.get("", response_model=List[JobRead])
def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all screening jobs with live candidate statistics."""
    jobs = JobRepository.get_all(db, skip=skip, limit=limit)
    results = []
    for job in jobs:
        stats = JobRepository.get_stats(db, job)
        job_read = JobRead.model_validate(job)
        job_read.stats = stats
        results.append(job_read)
    return results


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: str, db: Session = Depends(get_db)):
    """Get single screening job details and statistics."""
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)
    stats = JobRepository.get_stats(db, job)
    job_read = JobRead.model_validate(job)
    job_read.stats = stats
    return job_read


@router.patch("/{job_id}", response_model=JobRead)
def update_job(job_id: str, job_in: JobUpdate, db: Session = Depends(get_db)):
    """Update job title, description, or shortlist threshold."""
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)
    updated_job = JobRepository.update(db, job, job_in)
    AuditService.log_event(
        db=db,
        event_type="job_updated",
        entity_type="screening_job",
        entity_id=job.id,
        details=job_in.model_dump(exclude_unset=True)
    )
    stats = JobRepository.get_stats(db, updated_job)
    job_read = JobRead.model_validate(updated_job)
    job_read.stats = stats
    return job_read


@router.post("/{job_id}/resumes", status_code=status.HTTP_202_ACCEPTED)
async def upload_resumes(
    job_id: str,
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """
    Multi-file upload of PDF and TXT resumes.
    Enforces file size, allowed extensions, and content hash deduplication.
    Queues background text extraction and structured parsing.
    """
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)

    uploaded_candidates = []
    errors = []

    for file in files:
        original_name = file.filename or "unknown_resume.pdf"
        safe_name, ext = generate_safe_filename(original_name)

        if ext not in settings.ALLOWED_EXTENSIONS:
            errors.append({
                "filename": original_name,
                "error": f"Unsupported format '{ext}'. Only .pdf and .txt files are allowed."
            })
            continue

        try:
            content = await file.read()
            if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
                errors.append({
                    "filename": original_name,
                    "error": f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
                })
                continue

            content_hash = calculate_content_hash(content)

            # Check duplicate in this job
            existing_candidate = CandidateRepository.find_by_content_hash(db, job.id, content_hash)
            if existing_candidate:
                errors.append({
                    "filename": original_name,
                    "error": f"Duplicate resume: an identical file was already uploaded for this job ({existing_candidate.candidate_name or existing_candidate.original_filename})."
                })
                continue

            # Save file to disk
            file_path = os.path.join(settings.UPLOAD_DIR, safe_name)
            with open(file_path, "wb") as f:
                f.write(content)

            # Create candidate record
            candidate = Candidate(
                job_id=job.id,
                original_filename=original_name,
                stored_filename=safe_name,
                file_type=ext.lstrip("."),
                file_size_bytes=len(content),
                content_hash=content_hash,
                raw_text="",
                status="queued"
            )
            db.add(candidate)
            db.commit()
            db.refresh(candidate)

            AuditService.log_event(
                db=db,
                event_type="resume_uploaded",
                entity_type="candidate",
                entity_id=candidate.id,
                details={"filename": original_name, "size_bytes": len(content)}
            )

            # Create task record and dispatch background task
            task = ProcessingTask(
                task_type="parse_resume",
                entity_type="candidate",
                entity_id=candidate.id,
                status="queued"
            )
            db.add(task)
            db.commit()
            db.refresh(task)

            background_tasks.add_task(process_parse_resume_task, task.id, candidate.id)

            uploaded_candidates.append({
                "candidate_id": candidate.id,
                "original_filename": candidate.original_filename,
                "status": candidate.status
            })

        except Exception as e:
            errors.append({
                "filename": original_name,
                "error": f"Failed to upload file: {str(e)}"
            })

    return {
        "job_id": job.id,
        "uploaded_count": len(uploaded_candidates),
        "error_count": len(errors),
        "uploaded": uploaded_candidates,
        "errors": errors
    }


@router.get("/{job_id}/candidates", response_model=List[CandidateListItemRead])
def list_job_candidates(
    job_id: str,
    status: Optional[str] = Query(None),
    recommendation: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("created_at"),
    sort_dir: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """List candidates for a job with filtering and latest screening scores."""
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)

    pairs = CandidateRepository.list_by_job(
        db=db,
        job_id=job.id,
        status=status,
        recommendation=recommendation,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir
    )

    results = []
    for c, assessment in pairs:
        skills_preview = [s.normalized_name for s in c.skills[:5]]
        is_shortlisted = bool(
            assessment and
            assessment.fit_score >= job.min_score_threshold and
            assessment.recommendation == "shortlist"
        )
        results.append(CandidateListItemRead(
            id=c.id,
            job_id=c.job_id,
            original_filename=c.original_filename,
            file_type=c.file_type,
            file_size_bytes=c.file_size_bytes,
            status=c.status,
            status_message=c.status_message,
            candidate_name=c.candidate_name,
            email=c.email,
            location=c.location,
            total_experience_years=c.total_experience_years,
            skills_count=len(c.skills),
            skills_preview=skills_preview,
            latest_score=assessment.fit_score if assessment else None,
            latest_recommendation=assessment.recommendation if assessment else None,
            latest_justification=assessment.summary_justification if assessment else None,
            is_shortlisted=is_shortlisted,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))

    return results
