from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.job_repo import JobRepository
from app.core.errors import NotFoundError
from app.services.export_service import ExportService
from app.services.audit_service import AuditService

router = APIRouter(tags=["Export"])


@router.get("/jobs/{job_id}/export.csv")
def export_job_candidates_csv(job_id: str, db: Session = Depends(get_db)):
    """Export all candidates, scores, justifications, and structured assessments to CSV."""
    job = JobRepository.get_by_id(db, job_id)
    if not job:
        raise NotFoundError("ScreeningJob", job_id)

    csv_content = ExportService.generate_job_csv(db, job)

    AuditService.log_event(
        db=db,
        event_type="data_exported",
        entity_type="screening_job",
        entity_id=job.id,
        details={"format": "csv", "job_title": job.title}
    )

    clean_title = "".join(c for c in job.title if c.isalnum() or c in (' ', '_', '-')).rstrip().replace(' ', '_')
    filename = f"shortlist_{clean_title}_{job_id[:8]}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
