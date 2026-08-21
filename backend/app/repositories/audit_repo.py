from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.audit import AuditEvent


class AuditRepository:
    @staticmethod
    def list_events(
        db: Session,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
        limit: int = 50
    ) -> List[AuditEvent]:
        query = db.query(AuditEvent)
        if entity_type:
            query = query.filter(AuditEvent.entity_type == entity_type)
        if entity_id:
            query = query.filter(AuditEvent.entity_id == entity_id)
        return query.order_by(AuditEvent.timestamp.desc()).limit(limit).all()
