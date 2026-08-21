import csv
import io
from typing import List
from sqlalchemy.orm import Session
from ..models.candidate import Candidate
from ..models.job import ScreeningJob
from ..models.screening import CandidateAssessment


class ExportService:
    @staticmethod
    def generate_job_csv(db: Session, job: ScreeningJob) -> str:
        """
        Generates comprehensive CSV export of all candidates and assessments for a job.
        """
        output = io.StringIO()
        writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

        # Header
        writer.writerow([
            "Candidate Name",
            "Email",
            "Phone",
            "Location",
            "Original Filename",
            "Total Experience (Years)",
            "Key Skills",
            "Fit Score (1-10)",
            "Recommendation",
            "Is Shortlisted (>= Threshold)",
            "Summary Justification",
            "Skills Score (out of 4.0)",
            "Experience Score (out of 4.0)",
            "Education Score (out of 1.0)",
            "Role Criteria Score (out of 1.0)",
            "Matched Strengths Evidence",
            "Identified Gaps",
            "Uncertainties",
            "Scoring Engine / Provider",
            "Candidate Status",
            "Created At"
        ])

        candidates = db.query(Candidate).filter(Candidate.job_id == job.id).order_by(Candidate.created_at.desc()).all()

        for c in candidates:
            # Find latest assessment
            latest_assessment = (
                db.query(CandidateAssessment)
                .filter(CandidateAssessment.candidate_id == c.id)
                .order_by(CandidateAssessment.created_at.desc())
                .first()
            )

            skills_list = ", ".join([s.normalized_name for s in c.skills]) if c.skills else ""
            
            fit_score = ""
            recommendation = ""
            is_shortlisted = "No"
            justification = ""
            skills_score = ""
            exp_score = ""
            edu_score = ""
            role_score = ""
            strengths_text = ""
            gaps_text = ""
            uncertainties_text = ""
            engine_str = ""

            if latest_assessment:
                fit_score = f"{latest_assessment.fit_score:.1f}"
                recommendation = latest_assessment.recommendation
                is_shortlisted = "Yes" if (latest_assessment.fit_score >= job.min_score_threshold and recommendation == "shortlist") else "No"
                justification = latest_assessment.summary_justification
                
                sb = latest_assessment.score_breakdown or {}
                skills_score = f"{sb.get('skills', {}).get('score', 0)}"
                exp_score = f"{sb.get('relevant_experience', {}).get('score', 0)}"
                edu_score = f"{sb.get('education_certifications', {}).get('score', 0)}"
                role_score = f"{sb.get('role_specific_criteria', {}).get('score', 0)}"

                if latest_assessment.matched_requirements:
                    strengths_text = " | ".join([f"{m.get('requirement', '')}: {m.get('evidence', '')}" for m in latest_assessment.matched_requirements])
                if latest_assessment.gaps:
                    gaps_text = " | ".join([f"{g.get('requirement', '')} ({g.get('reason', '')})" for g in latest_assessment.gaps])
                if latest_assessment.uncertainties:
                    uncertainties_text = " | ".join(latest_assessment.uncertainties)

                if latest_assessment.is_fallback:
                    engine_str = "Fallback Heuristic Engine"
                else:
                    meta = latest_assessment.model_metadata or {}
                    engine_str = f"LLM ({meta.get('model', 'OpenAI')})"

            writer.writerow([
                c.candidate_name or "Not Confidently Found",
                c.email or "",
                c.phone or "",
                c.location or "",
                c.original_filename,
                f"{c.total_experience_years:.1f}" if c.total_experience_years else "N/A",
                skills_list,
                fit_score,
                recommendation,
                is_shortlisted,
                justification,
                skills_score,
                exp_score,
                edu_score,
                role_score,
                strengths_text,
                gaps_text,
                uncertainties_text,
                engine_str,
                c.status,
                c.created_at.strftime("%Y-%m-%d %H:%M:%S UTC")
            ])

        return output.getvalue()
