from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProcessingTaskRead(BaseModel):
    id: str
    task_type: str
    entity_type: str
    entity_id: str
    status: str
    retries: int
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
