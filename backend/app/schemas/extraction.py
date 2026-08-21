from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    links: List[str] = Field(default_factory=list)


class ExtractedSkill(BaseModel):
    name: str
    normalized_name: str
    category: Literal["technical", "tool", "domain", "soft", "language", "other"] = "technical"
    evidence: Optional[str] = None


class ExtractedExperience(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[str] = None  # YYYY-MM or null
    end_date: Optional[str] = None    # YYYY-MM or null
    is_current: bool = False
    highlights: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    evidence: Optional[str] = None


class ExtractedEducation(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    end_year: Optional[int] = None
    evidence: Optional[str] = None


class ExtractedCertification(BaseModel):
    name: str
    issuer: Optional[str] = None
    year: Optional[int] = None
    evidence: Optional[str] = None


class ResumeExtractionPayload(BaseModel):
    candidate_name: Optional[str] = None
    contact: ContactInfo = Field(default_factory=ContactInfo)
    skills: List[ExtractedSkill] = Field(default_factory=list)
    experience: List[ExtractedExperience] = Field(default_factory=list)
    education: List[ExtractedEducation] = Field(default_factory=list)
    certifications: List[ExtractedCertification] = Field(default_factory=list)
    summary: Optional[str] = None
    total_experience_years: Optional[float] = None
    warnings: List[str] = Field(default_factory=list)
