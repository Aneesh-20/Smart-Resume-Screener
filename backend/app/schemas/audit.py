from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel


class AuditEventRead(BaseModel):
    id: str
    event_type: str
    entity_type: str
    entity_id: str
    actor: str
    details: Dict[str, Any]
    timestamp: datetime

    model_config = {"from_attributes": True}
