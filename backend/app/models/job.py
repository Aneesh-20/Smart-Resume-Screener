from sqlalchemy import Column, String, Float, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from ..db.session import Base
from .base import TimestampMixin, generate_uuid


class ScreeningJob(Base, TimestampMixin):
    __tablename__ = "screening_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False, index=True)
    department = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    min_score_threshold = Column(Float, default=7.0, nullable=False)
    must_have_skills = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    candidates = relationship("Candidate", back_populates="job", cascade="all, delete-orphan")
    screening_runs = relationship("ScreeningRun", back_populates="job", cascade="all, delete-orphan")
