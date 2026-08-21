from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from .extraction import ExtractedSkill, ExtractedExperience, ExtractedEducation, ExtractedCertification, ContactInfo
from .assessment import CandidateAssessmentPayload


class CandidateSkillRead(BaseModel):
    id: str
    name: str
    normalized_name: str
    category: str
    evidence: Optional[str] = None

    model_config = {"from_attributes": True}


class ExperienceEntryRead(BaseModel):
    id: str
    title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    highlights: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    evidence: Optional[str] = None

    model_config = {"from_attributes": True}


class EducationEntryRead(BaseModel):
    id: str
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    end_year: Optional[int] = None
    evidence: Optional[str] = None

    model_config = {"from_attributes": True}


class CertificationEntryRead(BaseModel):
    id: str
    name: str
    issuer: Optional[str] = None
    year: Optional[int] = None
    evidence: Optional[str] = None

    model_config = {"from_attributes": True}


class CandidateAssessmentRead(BaseModel):
    id: str
    run_id: str
    candidate_id: str
    fit_score: float
    recommendation: str
    summary_justification: str
    score_breakdown: Dict[str, Any]
    matched_requirements: List[Dict[str, Any]]
    gaps: List[Dict[str, Any]]
    uncertainties: List[str]
    follow_up_questions: List[str]
    confidence: str
    is_fallback: bool
    model_metadata: Dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateListItemRead(BaseModel):
    id: str
    job_id: str
    original_filename: str
    file_type: str
    file_size_bytes: int
    status: str
    status_message: Optional[str] = None
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    location: Optional[str] = None
    total_experience_years: Optional[float] = None
    skills_count: int = 0
    skills_preview: List[str] = Field(default_factory=list)
    latest_score: Optional[float] = None
    latest_recommendation: Optional[str] = None
    latest_justification: Optional[str] = None
    is_shortlisted: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateDetailRead(BaseModel):
    id: str
    job_id: str
    original_filename: str
    stored_filename: str
    file_type: str
    file_size_bytes: int
    content_hash: str
    status: str
    status_message: Optional[str] = None
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    links: List[str] = Field(default_factory=list)
    total_experience_years: Optional[float] = None
    summary: Optional[str] = None
    parse_warnings: List[str] = Field(default_factory=list)
    parse_payload: Dict[str, Any] = Field(default_factory=dict)
    
    # Structured normalized records
    skills: List[CandidateSkillRead] = Field(default_factory=list)
    experience_entries: List[ExperienceEntryRead] = Field(default_factory=list)
    education_entries: List[EducationEntryRead] = Field(default_factory=list)
    certifications: List[CertificationEntryRead] = Field(default_factory=list)
    
    # Assessments history
    assessments: List[CandidateAssessmentRead] = Field(default_factory=list)
    latest_assessment: Optional[CandidateAssessmentRead] = None
    
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateUpdate(BaseModel):
    """Recruiter corrections schema to fix or augment extracted candidate data."""
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    total_experience_years: Optional[float] = None
    summary: Optional[str] = None
    skills: Optional[List[ExtractedSkill]] = None
    experience: Optional[List[ExtractedExperience]] = None
    education: Optional[List[ExtractedEducation]] = None
    certifications: Optional[List[ExtractedCertification]] = None
