from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Job title")
    department: Optional[str] = Field(None, max_length=255)
    description: str = Field(..., min_length=20, description="Full job description")
    min_score_threshold: float = Field(7.0, ge=1.0, le=10.0, description="Minimum fit score threshold for shortlist")
    must_have_skills: List[str] = Field(default_factory=list, description="Must-have skills for candidate matching")


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    department: Optional[str] = None
    description: Optional[str] = Field(None, min_length=20)
    min_score_threshold: Optional[float] = Field(None, ge=1.0, le=10.0)
    must_have_skills: Optional[List[str]] = None
    is_active: Optional[bool] = None


class JobSummaryStats(BaseModel):
    total_candidates: int = 0
    parsed_candidates: int = 0
    scored_candidates: int = 0
    shortlisted_candidates: int = 0
    failed_candidates: int = 0
    latest_run_id: Optional[str] = None
    latest_run_status: Optional[str] = None


class JobRead(JobBase):
    id: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    stats: Optional[JobSummaryStats] = None

    model_config = {"from_attributes": True}
