from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, model_validator


class ScoreBreakdownItem(BaseModel):
    score: float = Field(..., ge=0.0)
    max_score: float = Field(..., gt=0.0)
    rationale: str


class ScoreBreakdown(BaseModel):
    skills: ScoreBreakdownItem
    relevant_experience: ScoreBreakdownItem
    education_certifications: ScoreBreakdownItem
    role_specific_criteria: ScoreBreakdownItem


class MatchedRequirement(BaseModel):
    requirement: str
    evidence: str
    strength: Literal["strong", "partial"] = "strong"


class RequirementGap(BaseModel):
    requirement: str
    reason: str
    severity: Literal["must_have", "preferred", "uncertain"] = "preferred"


class CandidateAssessmentPayload(BaseModel):
    fit_score: float = Field(..., ge=1.0, le=10.0, description="Overall fit score on 1.0 - 10.0 scale")
    recommendation: Literal["shortlist", "review", "do_not_shortlist"]
    summary_justification: str
    score_breakdown: ScoreBreakdown
    matched_requirements: List[MatchedRequirement] = Field(default_factory=list)
    gaps: List[RequirementGap] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)
    confidence: Literal["high", "medium", "low"] = "medium"

    @model_validator(mode="after")
    def validate_score_integrity(self):
        # Verify component scores sum reasonably to fit_score (within small floating tolerance)
        total_components = (
            self.score_breakdown.skills.score +
            self.score_breakdown.relevant_experience.score +
            self.score_breakdown.education_certifications.score +
            self.score_breakdown.role_specific_criteria.score
        )
        # Cap fit_score nicely to 1 decimal place and bounds
        if abs(total_components - self.fit_score) > 0.6:
            # Adjust fit_score to match component sum clamped to 1.0-10.0
            adjusted = min(10.0, max(1.0, round(total_components, 1)))
            self.fit_score = adjusted
        else:
            self.fit_score = min(10.0, max(1.0, round(self.fit_score, 1)))
        return self
