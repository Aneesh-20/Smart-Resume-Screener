from sqlalchemy import Column, String, Float, Text, JSON, Boolean, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship
from ..db.session import Base
from .base import TimestampMixin, generate_uuid, utc_now


class ScreeningRun(Base, TimestampMixin):
    __tablename__ = "screening_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("screening_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Immutable snapshot of criteria at run time
    job_title_snapshot = Column(String(255), nullable=False)
    job_description_snapshot = Column(Text, nullable=False)
    must_have_skills_snapshot = Column(JSON, default=list, nullable=False)
    min_score_threshold_snapshot = Column(Float, default=7.0, nullable=False)
    
    # Model & Engine Metadata
    prompt_version = Column(String(50), nullable=False)
    model_name = Column(String(100), nullable=False)
    provider_name = Column(String(100), nullable=False)
    
    # Run Lifecycle
    status = Column(String(30), default="running", nullable=False)  # running, completed, failed
    total_candidates = Column(Integer, default=0, nullable=False)
    screened_candidates = Column(Integer, default=0, nullable=False)
    started_at = Column(DateTime, default=utc_now, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    job = relationship("ScreeningJob", back_populates="screening_runs")
    assessments = relationship("CandidateAssessment", back_populates="screening_run", cascade="all, delete-orphan")


class CandidateAssessment(Base, TimestampMixin):
    __tablename__ = "candidate_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("screening_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Assessment Results
    fit_score = Column(Float, nullable=False, index=True)  # 1.0 - 10.0
    recommendation = Column(String(30), nullable=False, index=True)  # shortlist, review, do_not_shortlist
    summary_justification = Column(Text, nullable=False)
    
    # Structured Components
    # score_breakdown: {skills: {score, max_score, rationale}, relevant_experience: {...}, education_certifications: {...}, role_specific_criteria: {...}}
    score_breakdown = Column(JSON, default=dict, nullable=False)
    
    # matched_requirements: [{requirement, evidence, strength}]
    matched_requirements = Column(JSON, default=list, nullable=False)
    
    # gaps: [{requirement, reason, severity}]
    gaps = Column(JSON, default=list, nullable=False)
    
    uncertainties = Column(JSON, default=list, nullable=False)
    follow_up_questions = Column(JSON, default=list, nullable=False)
    confidence = Column(String(20), default="medium", nullable=False)  # high, medium, low
    
    # Fallback status & provenance
    is_fallback = Column(Boolean, default=False, nullable=False)
    model_metadata = Column(JSON, default=dict, nullable=False)

    screening_run = relationship("ScreeningRun", back_populates="assessments")
    candidate = relationship("Candidate", back_populates="assessments")
