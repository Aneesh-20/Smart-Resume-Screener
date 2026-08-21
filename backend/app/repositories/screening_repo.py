from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.screening import ScreeningRun, CandidateAssessment
from ..models.job import ScreeningJob
from ..core.config import settings


class ScreeningRepository:
    @staticmethod
    def get_run_by_id(db: Session, run_id: str) -> Optional[ScreeningRun]:
        return db.query(ScreeningRun).filter(ScreeningRun.id == run_id).first()

    @staticmethod
    def get_latest_run_for_job(db: Session, job_id: str) -> Optional[ScreeningRun]:
        return (
            db.query(ScreeningRun)
            .filter(ScreeningRun.job_id == job_id)
            .order_by(ScreeningRun.started_at.desc())
            .first()
        )

    @staticmethod
    def create_run(db: Session, job: ScreeningJob, prompt_version: str = "v1") -> ScreeningRun:
        run = ScreeningRun(
            job_id=job.id,
            job_title_snapshot=job.title,
            job_description_snapshot=job.description,
            must_have_skills_snapshot=job.must_have_skills or [],
            min_score_threshold_snapshot=job.min_score_threshold,
            prompt_version=prompt_version,
            model_name=settings.OPENAI_MODEL if settings.OPENAI_API_KEY else "deterministic_fallback",
            provider_name="openai_compatible" if settings.OPENAI_API_KEY else "local_fallback",
            status="running"
        )
        db.add(run)
        db.commit()
        db.refresh(run)
        return run

    @staticmethod
    def get_assessment_by_id(db: Session, assessment_id: str) -> Optional[CandidateAssessment]:
        return db.query(CandidateAssessment).filter(CandidateAssessment.id == assessment_id).first()

    @staticmethod
    def get_assessments_for_run(db: Session, run_id: str) -> List[CandidateAssessment]:
        return (
            db.query(CandidateAssessment)
            .filter(CandidateAssessment.run_id == run_id)
            .order_by(CandidateAssessment.fit_score.desc())
            .all()
        )
