from sqlalchemy import Column, String, Integer, Text, DateTime
from ..db.session import Base
from .base import TimestampMixin, generate_uuid, utc_now


class ProcessingTask(Base, TimestampMixin):
    __tablename__ = "processing_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_type = Column(String(50), nullable=False, index=True)  # parse_resume, score_candidate, screen_job
    entity_type = Column(String(50), nullable=False)  # candidate, job, screening_run
    entity_id = Column(String(36), nullable=False, index=True)
    status = Column(String(30), default="queued", nullable=False, index=True)  # queued, running, completed, failed
    retries = Column(Integer, default=0, nullable=False)
    error_message = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
