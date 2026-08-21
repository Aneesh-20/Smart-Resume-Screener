from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from ..models.job import ScreeningJob
from ..models.candidate import Candidate
from ..models.screening import ScreeningRun, CandidateAssessment
from ..schemas.job import JobCreate, JobUpdate, JobSummaryStats


class JobRepository:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[ScreeningJob]:
        return db.query(ScreeningJob).order_by(ScreeningJob.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, job_id: str) -> Optional[ScreeningJob]:
        return db.query(ScreeningJob).filter(ScreeningJob.id == job_id).first()

    @staticmethod
    def create(db: Session, job_in: JobCreate) -> ScreeningJob:
        job = ScreeningJob(
            title=job_in.title,
            department=job_in.department,
            description=job_in.description,
            min_score_threshold=job_in.min_score_threshold,
            must_have_skills=job_in.must_have_skills,
            is_active=True
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def update(db: Session, job: ScreeningJob, job_in: JobUpdate) -> ScreeningJob:
        update_data = job_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(job, field, value)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def get_stats(db: Session, job: ScreeningJob) -> JobSummaryStats:
        candidates = db.query(Candidate).filter(Candidate.job_id == job.id).all()
        total = len(candidates)
        parsed = sum(1 for c in candidates if c.status in ["parsed", "scored"])
        scored = sum(1 for c in candidates if c.status == "scored")
        failed = sum(1 for c in candidates if c.status == "failed")
        
        # Check latest run
        latest_run = (
            db.query(ScreeningRun)
            .filter(ScreeningRun.job_id == job.id)
            .order_by(ScreeningRun.started_at.desc())
            .first()
        )
        
        # Calculate shortlisted candidates
        shortlisted = 0
        for c in candidates:
            latest_assessment = (
                db.query(CandidateAssessment)
                .filter(CandidateAssessment.candidate_id == c.id)
                .order_by(CandidateAssessment.created_at.desc())
                .first()
            )
            if latest_assessment:
                if latest_assessment.fit_score >= job.min_score_threshold and latest_assessment.recommendation == "shortlist":
                    shortlisted += 1

        return JobSummaryStats(
            total_candidates=total,
            parsed_candidates=parsed,
            scored_candidates=scored,
            shortlisted_candidates=shortlisted,
            failed_candidates=failed,
            latest_run_id=latest_run.id if latest_run else None,
            latest_run_status=latest_run.status if latest_run else None
        )
