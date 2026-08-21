from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.candidate_repo import CandidateRepository
from app.repositories.job_repo import JobRepository
from app.repositories.screening_repo import ScreeningRepository
from app.schemas.candidate import CandidateDetailRead, CandidateUpdate
from app.core.errors import NotFoundError
from app.services.task_worker import enqueue_task
from app.services.scoring_service import ScoringService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.get("/{candidate_id}", response_model=CandidateDetailRead)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Retrieve full structured profile, parsed facts, and assessment history for a candidate."""
    candidate = CandidateRepository.get_by_id(db, candidate_id)
    if not candidate:
        raise NotFoundError("Candidate", candidate_id)

    detail = CandidateDetailRead.model_validate(candidate)
    if candidate.assessments:
        latest = sorted(candidate.assessments, key=lambda a: a.created_at, reverse=True)[0]
        detail.latest_assessment = latest
    return detail


@router.patch("/{candidate_id}", response_model=CandidateDetailRead)
def update_candidate(
    candidate_id: str,
    update_in: CandidateUpdate,
    db: Session = Depends(get_db)
):
    """
    Recruiter manual corrections.
    Enables human oversight to adjust extracted skills, experience, education, or contact details.
    """
    candidate = CandidateRepository.get_by_id(db, candidate_id)
    if not candidate:
        raise NotFoundError("Candidate", candidate_id)

    updated_candidate = CandidateRepository.update_corrections(db, candidate, update_in)

    AuditService.log_event(
        db=db,
        event_type="manual_correction",
        entity_type="candidate",
        entity_id=candidate.id,
        details={"fields_updated": list(update_in.model_dump(exclude_unset=True).keys())}
    )

    detail = CandidateDetailRead.model_validate(updated_candidate)
    if updated_candidate.assessments:
        latest = sorted(updated_candidate.assessments, key=lambda a: a.created_at, reverse=True)[0]
        detail.latest_assessment = latest
    return detail


@router.post("/{candidate_id}/reparse", status_code=status.HTTP_202_ACCEPTED)
def reparse_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Triggers re-extraction and re-parsing of raw resume text."""
    candidate = CandidateRepository.get_by_id(db, candidate_id)
    if not candidate:
        raise NotFoundError("Candidate", candidate_id)

    candidate.status = "queued"
    db.commit()

    enqueue_task("parse_resume", "candidate", candidate.id, db)
    return {"message": "Candidate re-parsing queued.", "candidate_id": candidate.id, "status": "queued"}


@router.post("/{candidate_id}/rescore", status_code=status.HTTP_200_OK)
async def rescore_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """Re-scores a candidate against the latest job criteria."""
    candidate = CandidateRepository.get_by_id(db, candidate_id)
    if not candidate:
        raise NotFoundError("Candidate", candidate_id)

    job = JobRepository.get_by_id(db, candidate.job_id)
    if not job:
        raise NotFoundError("ScreeningJob", candidate.job_id)

    # Get or create screening run
    latest_run = ScreeningRepository.get_latest_run_for_job(db, job.id)
    if not latest_run:
        latest_run = ScreeningRepository.create_run(db, job)

    assessment = await ScoringService.evaluate_candidate(
        db=db,
        candidate=candidate,
        job=job,
        screening_run=latest_run
    )

    AuditService.log_event(
        db=db,
        event_type="candidate_rescored",
        entity_type="candidate",
        entity_id=candidate.id,
        details={"score": assessment.fit_score, "recommendation": assessment.recommendation}
    )

    return {
        "candidate_id": candidate.id,
        "fit_score": assessment.fit_score,
        "recommendation": assessment.recommendation,
        "summary_justification": assessment.summary_justification
    }


@router.delete("/{candidate_id}", status_code=status.HTTP_200_OK)
def delete_candidate(candidate_id: str, db: Session = Depends(get_db)):
    """
    Deletes candidate data and purges stored resume file from server disk.
    Records audit entry for data governance.
    """
    candidate = CandidateRepository.get_by_id(db, candidate_id)
    if not candidate:
        raise NotFoundError("Candidate", candidate_id)

    job_id = candidate.job_id
    filename = candidate.original_filename
    cand_id = candidate.id

    CandidateRepository.delete(db, candidate)

    AuditService.log_event(
        db=db,
        event_type="candidate_deleted",
        entity_type="candidate",
        entity_id=cand_id,
        details={"job_id": job_id, "filename": filename}
    )

    return {"message": "Candidate and stored resume file deleted successfully.", "candidate_id": cand_id}
