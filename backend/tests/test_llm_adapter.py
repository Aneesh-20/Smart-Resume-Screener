import pytest
import json
from unittest.mock import AsyncMock, patch
from app.services.llm_adapter import LLMAdapter, clean_json_text
from app.schemas.extraction import ResumeExtractionPayload
from app.schemas.assessment import CandidateAssessmentPayload
from app.core.errors import LLMServiceError


def test_clean_json_text():
    raw_markdown = '```json\n{"candidate_name": "John Doe"}\n```'
    assert clean_json_text(raw_markdown) == '{"candidate_name": "John Doe"}'

    raw_text = 'Here is the output: {"candidate_name": "Jane"} Thanks'
    assert clean_json_text(raw_text) == '{"candidate_name": "Jane"}'


@pytest.mark.asyncio
async def test_llm_extract_resume_success():
    adapter = LLMAdapter()
    valid_response = json.dumps({
        "candidate_name": "Alice Chen",
        "contact": {"email": "alice@example.com", "phone": "555-0100", "location": "SF", "links": []},
        "skills": [{"name": "python", "normalized_name": "Python", "category": "technical", "evidence": "Used Python"}],
        "experience": [],
        "education": [],
        "certifications": [],
        "summary": "Experienced engineer",
        "total_experience_years": 5.0,
        "warnings": []
    })

    with patch.object(adapter, "_call_openai_api", new_callable=AsyncMock) as mock_call:
        mock_call.return_value = valid_response
        payload, metadata = await adapter.extract_resume("Sample resume text")

        assert payload.candidate_name == "Alice Chen"
        assert payload.skills[0].normalized_name == "Python"
        assert metadata["is_fallback"] is False


@pytest.mark.asyncio
async def test_llm_extract_resume_repair_retry_success():
    adapter = LLMAdapter()
    invalid_first_response = "Not a json output at all!"
    valid_repaired_response = json.dumps({
        "candidate_name": "Repaired Candidate",
        "contact": {"email": None, "phone": None, "location": None, "links": []},
        "skills": [],
        "experience": [],
        "education": [],
        "certifications": [],
        "summary": None,
        "total_experience_years": None,
        "warnings": []
    })

    with patch.object(adapter, "_call_openai_api", new_callable=AsyncMock) as mock_call:
        # First call returns invalid, second call returns repaired
        mock_call.side_effect = [invalid_first_response, valid_repaired_response]
        payload, metadata = await adapter.extract_resume("Sample resume text")

        assert payload.candidate_name == "Repaired Candidate"
        assert metadata.get("repaired") is True


@pytest.mark.asyncio
async def test_llm_extract_resume_repair_retry_failure():
    adapter = LLMAdapter()
    invalid_first = "Invalid 1"
    invalid_second = "Invalid 2"

    with patch.object(adapter, "_call_openai_api", new_callable=AsyncMock) as mock_call:
        mock_call.side_effect = [invalid_first, invalid_second]
        with pytest.raises(LLMServiceError):
            await adapter.extract_resume("Sample resume text")
