from sqlalchemy import Column, String, Text, JSON, DateTime
from ..db.session import Base
from .base import generate_uuid, utc_now


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_type = Column(String(50), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False, index=True)
    actor = Column(String(100), default="recruiter", nullable=False)
    details = Column(JSON, default=dict, nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False, index=True)
