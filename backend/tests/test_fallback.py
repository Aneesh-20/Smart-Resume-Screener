import os
import pytest
from app.services.fallback_adapter import DeterministicFallbackAdapter
from app.schemas.assessment import CandidateAssessmentPayload

SAMPLE_RESUMES_DIR = os.path.join(os.path.dirname(__file__), "../../sample-data/resumes")


def test_fallback_parse_strong_resume():
    txt_path = os.path.join(SAMPLE_RESUMES_DIR, "strong_candidate_alice_chen.txt")
    with open(txt_path, "r") as f:
        text = f.read()

    payload = DeterministicFallbackAdapter.parse_resume(text)
    assert payload.candidate_name == "Alice Chen"
    assert payload.contact.email == "alice.chen@example.com"
    assert "San Francisco, CA" in (payload.contact.location or "")
    
    skill_names = [s.normalized_name for s in payload.skills]
    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert "React" in skill_names
    assert "PostgreSQL" in skill_names
    assert payload.total_experience_years is not None
    assert payload.total_experience_years >= 4.0


def test_fallback_score_strong_candidate():
    txt_path = os.path.join(SAMPLE_RESUMES_DIR, "strong_candidate_alice_chen.txt")
    with open(txt_path, "r") as f:
        text = f.read()

    jd_path = os.path.join(os.path.dirname(__file__), "../../sample-data/job_descriptions/senior_fullstack_engineer.txt")
    with open(jd_path, "r") as f:
        jd_text = f.read()

    parsed = DeterministicFallbackAdapter.parse_resume(text)
    assessment = DeterministicFallbackAdapter.score_candidate(
        candidate_payload=parsed,
        raw_text=text,
        job_title="Senior Full-Stack Engineer",
        job_description=jd_text,
        must_have_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker"]
    )

    assert assessment.fit_score >= 7.5
    assert assessment.recommendation == "shortlist"
    assert len(assessment.matched_requirements) >= 3
    
    # Check component scores sum
    sb = assessment.score_breakdown
    total_components = sb.skills.score + sb.relevant_experience.score + sb.education_certifications.score + sb.role_specific_criteria.score
    assert abs(total_components - assessment.fit_score) <= 0.6


def test_fallback_score_weak_candidate():
    txt_path = os.path.join(SAMPLE_RESUMES_DIR, "weak_candidate_charlie_davis.txt")
    with open(txt_path, "r") as f:
        text = f.read()

    jd_path = os.path.join(os.path.dirname(__file__), "../../sample-data/job_descriptions/senior_fullstack_engineer.txt")
    with open(jd_path, "r") as f:
        jd_text = f.read()

    parsed = DeterministicFallbackAdapter.parse_resume(text)
    assessment = DeterministicFallbackAdapter.score_candidate(
        candidate_payload=parsed,
        raw_text=text,
        job_title="Senior Full-Stack Engineer",
        job_description=jd_text,
        must_have_skills=["Python", "FastAPI", "React", "TypeScript", "PostgreSQL", "Docker"]
    )

    assert assessment.fit_score < 6.0
    assert assessment.recommendation in ["do_not_shortlist", "review"]
    assert len(assessment.gaps) >= 2
