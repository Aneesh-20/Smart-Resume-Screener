from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.audit import AuditEvent
from ..core.logging import logger


class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        event_type: str,
        entity_type: str,
        entity_id: str,
        details: Optional[Dict[str, Any]] = None,
        actor: str = "recruiter"
    ) -> AuditEvent:
        """Records an auditable lifecycle action."""
        event = AuditEvent(
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            actor=actor,
            details=details or {}
        )
        db.add(event)
        try:
            db.commit()
            db.refresh(event)
            logger.info(f"[AUDIT] {event_type} on {entity_type}:{entity_id} by {actor}")
            return event
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to record audit event: {e}")
            return event
