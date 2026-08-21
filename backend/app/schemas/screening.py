from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .candidate import CandidateAssessmentRead


class ScreeningRunCreate(BaseModel):
    prompt_version: str = "v1"
    min_score_threshold: Optional[float] = Field(None, ge=1.0, le=10.0)


class ScreeningRunRead(BaseModel):
    id: str
    job_id: str
    job_title_snapshot: str
    job_description_snapshot: str
    must_have_skills_snapshot: List[str]
    min_score_threshold_snapshot: float
    prompt_version: str
    model_name: str
    provider_name: str
    status: str
    total_candidates: int
    screened_candidates: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    assessments: List[CandidateAssessmentRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ShortlistCandidateItem(BaseModel):
    candidate_id: str
    candidate_name: Optional[str] = None
    original_filename: str
    fit_score: float
    recommendation: str
    summary_justification: str
    score_breakdown: Dict[str, Any]
    matched_requirements: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]
    uncertainties: List[str]
    confidence: str
    is_fallback: bool
    skills_preview: List[str] = Field(default_factory=list)
    total_experience_years: Optional[float] = None
    assessed_at: datetime


class ShortlistResponse(BaseModel):
    job_id: str
    threshold: float
    total_screened: int
    shortlisted_count: int
    review_count: int
    do_not_shortlist_count: int
    shortlisted: List[ShortlistCandidateItem]
    review: List[ShortlistCandidateItem]
    do_not_shortlist: List[ShortlistCandidateItem]
