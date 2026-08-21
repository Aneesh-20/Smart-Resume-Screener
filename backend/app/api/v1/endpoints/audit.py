from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.audit_repo import AuditRepository
from app.schemas.audit import AuditEventRead

router = APIRouter(prefix="/audit", tags=["Audit Trail"])


@router.get("", response_model=List[AuditEventRead])
def list_audit_events(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve system and recruiter action audit logs."""
    return AuditRepository.list_events(db, entity_type=entity_type, entity_id=entity_id, limit=limit)
