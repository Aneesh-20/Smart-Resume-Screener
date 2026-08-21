from typing import Tuple, Dict, Any, List
from sqlalchemy.orm import Session
from ..models.candidate import Candidate
from ..models.job import ScreeningJob
from ..models.screening import ScreeningRun, CandidateAssessment
from ..schemas.extraction import ResumeExtractionPayload, ExtractedSkill, ExtractedExperience, ExtractedEducation, ExtractedCertification
from ..schemas.assessment import CandidateAssessmentPayload
from .llm_adapter import llm_adapter
from .fallback_adapter import DeterministicFallbackAdapter
from ..core.logging import logger


class ScoringService:
    @staticmethod
    def construct_extraction_payload_from_candidate(candidate: Candidate) -> ResumeExtractionPayload:
        """Reconstructs extraction payload from normalized DB records or parse_payload."""
        skills = [
            ExtractedSkill(
                name=s.name,
                normalized_name=s.normalized_name,
                category=s.category,
                evidence=s.evidence
            ) for s in candidate.skills
        ]
        experience = [
            ExtractedExperience(
                title=e.title,
                company=e.company,
                start_date=e.start_date,
                end_date=e.end_date,
                is_current=e.is_current,
                highlights=e.highlights or [],
                skills=e.skills or [],
                evidence=e.evidence
            ) for e in candidate.experience_entries
        ]
        education = [
            ExtractedEducation(
                institution=ed.institution,
                degree=ed.degree,
                field_of_study=ed.field_of_study,
                end_year=ed.end_year,
                evidence=ed.evidence
            ) for ed in candidate.education_entries
        ]
        certifications = [
            ExtractedCertification(
                name=c.name,
                issuer=c.issuer,
                year=c.year,
                evidence=c.evidence
            ) for c in candidate.certifications
        ]

        return ResumeExtractionPayload(
            candidate_name=candidate.candidate_name,
            skills=skills,
            experience=experience,
            education=education,
            certifications=certifications,
            summary=candidate.summary,
            total_experience_years=candidate.total_experience_years,
            warnings=candidate.parse_warnings or []
        )

    @classmethod
    async def evaluate_candidate(
        cls,
        db: Session,
        candidate: Candidate,
        job: ScreeningJob,
        screening_run: ScreeningRun
    ) -> CandidateAssessment:
        """
        Evaluates a candidate against the job description using LLM or local fallback.
        Creates and returns a CandidateAssessment record.
        """
        payload = cls.construct_extraction_payload_from_candidate(candidate)
        
        assessment_payload: CandidateAssessmentPayload
        metadata: Dict[str, Any]
        is_fallback = False

        if llm_adapter.is_configured:
            try:
                assessment_payload, metadata = await llm_adapter.score_candidate(
                    candidate_payload=payload,
                    raw_text=candidate.raw_text,
                    job_title=screening_run.job_title_snapshot,
                    job_description=screening_run.job_description_snapshot,
                    must_have_skills=screening_run.must_have_skills_snapshot
                )
                is_fallback = False
            except Exception as e:
                logger.warning(f"LLM scoring failed: {e}. Switching to deterministic fallback.")
                assessment_payload = DeterministicFallbackAdapter.score_candidate(
                    candidate_payload=payload,
                    raw_text=candidate.raw_text,
                    job_title=screening_run.job_title_snapshot,
                    job_description=screening_run.job_description_snapshot,
                    must_have_skills=screening_run.must_have_skills_snapshot
                )
                is_fallback = True
                metadata = {
                    "provider": "local_fallback",
                    "label": "Fallback - semantic LLM score unavailable",
                    "reason": f"LLM error: {str(e)}"
                }
        else:
            assessment_payload = DeterministicFallbackAdapter.score_candidate(
                candidate_payload=payload,
                raw_text=candidate.raw_text,
                job_title=screening_run.job_title_snapshot,
                job_description=screening_run.job_description_snapshot,
                must_have_skills=screening_run.must_have_skills_snapshot
            )
            is_fallback = True
            metadata = {
                "provider": "local_fallback",
                "label": "Fallback - semantic LLM score unavailable"
            }

        # Check existing assessment for this candidate in this run
        existing = db.query(CandidateAssessment).filter(
            CandidateAssessment.run_id == screening_run.id,
            CandidateAssessment.candidate_id == candidate.id
        ).first()

        if existing:
            existing.fit_score = assessment_payload.fit_score
            existing.recommendation = assessment_payload.recommendation
            existing.summary_justification = assessment_payload.summary_justification
            existing.score_breakdown = assessment_payload.score_breakdown.model_dump()
            existing.matched_requirements = [m.model_dump() for m in assessment_payload.matched_requirements]
            existing.gaps = [g.model_dump() for g in assessment_payload.gaps]
            existing.uncertainties = assessment_payload.uncertainties
            existing.follow_up_questions = assessment_payload.follow_up_questions
            existing.confidence = assessment_payload.confidence
            existing.is_fallback = is_fallback
            existing.model_metadata = metadata
            db_assessment = existing
        else:
            db_assessment = CandidateAssessment(
                run_id=screening_run.id,
                candidate_id=candidate.id,
                fit_score=assessment_payload.fit_score,
                recommendation=assessment_payload.recommendation,
                summary_justification=assessment_payload.summary_justification,
                score_breakdown=assessment_payload.score_breakdown.model_dump(),
                matched_requirements=[m.model_dump() for m in assessment_payload.matched_requirements],
                gaps=[g.model_dump() for g in assessment_payload.gaps],
                uncertainties=assessment_payload.uncertainties,
                follow_up_questions=assessment_payload.follow_up_questions,
                confidence=assessment_payload.confidence,
                is_fallback=is_fallback,
                model_metadata=metadata
            )
            db.add(db_assessment)

        candidate.status = "scored"
        db.commit()
        db.refresh(db_assessment)
        return db_assessment
