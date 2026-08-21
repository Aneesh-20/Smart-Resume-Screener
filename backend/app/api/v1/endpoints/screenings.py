from typing import List, Optional
from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.job_repo import JobRepository
from app.repositories.screening_repo import ScreeningRepository
from app.repositories.candidate_repo import CandidateRepository
from app.models.candidate import Candidate
from app.models.screening import CandidateAssessment, ScreeningRun
from app.models.task import ProcessingTask
from app.schemas.screening import (
    ScreeningRunCreate, ScreeningRunRead, ShortlistResponse, ShortlistCandidateItem
)
from app.core.errors import NotFoundError
from app.services.task_worker import process_screening_run_task
from app.services.audit_service import AuditService

router = APIRouter(tags=["Screenings & Shortlist"])


@router.post("/jobs/{job_id}/screenings", response_model=ScreeningRunRead, status_code=status.HTTP_202_ACCEPTED)
def start_screening_run(
    job_id: str,
    background_tasks: BackgroundTasks,
    run_in: Optional[ScreeningRunCreate] = None,
    db: Session = Depends(get_db)
):
    """
    Initiates an LLM/fallback candidate screening run for a job.
    Captures an immutable snapshot of job description and threshold.
    Scores all parsed candidates in the background.
    """
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)

    prompt_version = run_in.prompt_version if run_in else "v1"
    if run_in and run_in.min_score_threshold is not None:
        job.min_score_threshold = run_in.min_score_threshold
        db.commit()

    # Create immutable screening run record
    run = ScreeningRepository.create_run(db, job, prompt_version=prompt_version)

    AuditService.log_event(
        db=db,
        event_type="screening_run_started",
        entity_type="screening_run",
        entity_id=run.id,
        details={"job_id": job.id, "threshold": job.min_score_threshold, "prompt_version": prompt_version}
    )

    # Create task record and dispatch background task
    task = ProcessingTask(
        task_type="screen_job",
        entity_type="screening_run",
        entity_id=run.id,
        status="queued"
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    background_tasks.add_task(process_screening_run_task, task.id, run.id)

    return run


@router.get("/jobs/{job_id}/screenings/latest", response_model=ScreeningRunRead)
def get_latest_screening_run(job_id: str, db: Session = Depends(get_db)):
    """Retrieve the latest screening run and assessments for a job."""
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)

    latest_run = ScreeningRepository.get_latest_run_for_job(db, job_id)
    if not latest_run:
        raise NotFoundError("ScreeningRun for job", job_id)

    return latest_run


@router.get("/jobs/{job_id}/shortlist", response_model=ShortlistResponse)
def get_job_shortlist(job_id: str, db: Session = Depends(get_db)):
    """
    Returns ranked shortlisted candidates, candidates requiring review, and non-shortlisted candidates.
    Shortlist rule: score >= job.threshold AND recommendation == shortlist.
    """
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)

    candidates = db.query(Candidate).filter(Candidate.job_id == job.id).all()
    
    shortlisted_items: List[ShortlistCandidateItem] = []
    review_items: List[ShortlistCandidateItem] = []
    do_not_shortlist_items: List[ShortlistCandidateItem] = []

    for c in candidates:
        latest_assessment = (
            db.query(CandidateAssessment)
            .filter(CandidateAssessment.candidate_id == c.id)
            .order_by(CandidateAssessment.created_at.desc())
            .first()
        )
        if not latest_assessment:
            continue

        item = ShortlistCandidateItem(
            candidate_id=c.id,
            candidate_name=c.candidate_name,
            original_filename=c.original_filename,
            fit_score=latest_assessment.fit_score,
            recommendation=latest_assessment.recommendation,
            summary_justification=latest_assessment.summary_justification,
            score_breakdown=latest_assessment.score_breakdown or {},
            matched_requirements=latest_assessment.matched_requirements or [],
            gaps=latest_assessment.gaps or [],
            uncertainties=latest_assessment.uncertainties or [],
            confidence=latest_assessment.confidence,
            is_fallback=latest_assessment.is_fallback,
            skills_preview=[s.normalized_name for s in c.skills[:6]],
            total_experience_years=c.total_experience_years,
            assessed_at=latest_assessment.created_at
        )

        # Rule evaluation
        if latest_assessment.fit_score >= job.min_score_threshold and latest_assessment.recommendation == "shortlist":
            shortlisted_items.append(item)
        elif latest_assessment.recommendation == "review" or (latest_assessment.fit_score >= job.min_score_threshold and latest_assessment.recommendation != "do_not_shortlist"):
            review_items.append(item)
        else:
            do_not_shortlist_items.append(item)

    # Rank by fit score descending
    shortlisted_items.sort(key=lambda x: x.fit_score, reverse=True)
    review_items.sort(key=lambda x: x.fit_score, reverse=True)
    do_not_shortlist_items.sort(key=lambda x: x.fit_score, reverse=True)

    return ShortlistResponse(
        job_id=job.id,
        threshold=job.min_score_threshold,
        total_screened=len(shortlisted_items) + len(review_items) + len(do_not_shortlist_items),
        shortlisted_count=len(shortlisted_items),
        review_count=len(review_items),
        do_not_shortlist_count=len(do_not_shortlist_items),
        shortlisted=shortlisted_items,
        review=review_items,
        do_not_shortlist=do_not_shortlist_items
    )


@router.get("/screenings/{run_id}", response_model=ScreeningRunRead)
def get_screening_run_details(run_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed assessment records for a specific screening run."""
    run = ScreeningRepository.get_run_by_id(db, run_id)
    if not run:
        raise NotFoundError("ScreeningRun", run_id)
    return run
