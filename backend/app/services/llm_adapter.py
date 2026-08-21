import os
import json
import re
import httpx
from typing import Optional, Dict, Any, Tuple
from app.core.config import settings
from app.core.logging import logger
from app.core.errors import LLMServiceError
from app.schemas.extraction import ResumeExtractionPayload
from app.schemas.assessment import CandidateAssessmentPayload


PROMPTS_DIR = os.path.join(os.path.dirname(__file__), "../prompts")


def load_prompt(filename: str) -> str:
    path = os.path.join(PROMPTS_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def clean_json_text(text: str) -> str:
    """Extracts json substring if wrapped in markdown code fence."""
    cleaned = text.strip()
    match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', cleaned, re.DOTALL)
    if match:
        return match.group(1).strip()
    first_brace = cleaned.find('{')
    last_brace = cleaned.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return cleaned[first_brace:last_brace + 1].strip()
    return cleaned


class LLMAdapter:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.base_url = settings.OPENAI_BASE_URL.rstrip('/')
        self.model = settings.OPENAI_MODEL
        self.temperature = settings.LLM_TEMPERATURE
        self.extraction_prompt_template = load_prompt("extraction_v1.txt")
        self.scoring_prompt_template = load_prompt("scoring_v1.txt")
        self.repair_prompt_template = load_prompt("repair_v1.txt")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "your_openai_api_key_here")

    async def _call_openai_api(self, prompt: str, system_message: Optional[str] = None) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                if response.status_code != 200:
                    logger.error(f"LLM API error response: {response.status_code} - {response.text}")
                    raise LLMServiceError(f"LLM provider error: {response.status_code} - {response.text[:200]}")
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return content
            except httpx.RequestError as e:
                logger.error(f"HTTP connection error to LLM provider: {e}")
                raise LLMServiceError(f"Could not connect to LLM provider: {str(e)}")

    async def extract_resume(self, resume_text: str) -> Tuple[ResumeExtractionPayload, Dict[str, Any]]:
        """
        Parses resume text into structured ResumeExtractionPayload with 1-repair retry.
        Returns (payload, metadata).
        """
        prompt = self.extraction_prompt_template.replace("{resume_text}", resume_text)
        metadata = {
            "prompt_version": "extraction_v1",
            "model": self.model,
            "provider": "openai_compatible",
            "is_fallback": False
        }

        raw_output = await self._call_openai_api(prompt)
        cleaned_json = clean_json_text(raw_output)

        try:
            parsed_dict = json.loads(cleaned_json)
            payload = ResumeExtractionPayload.model_validate(parsed_dict)
            return payload, metadata
        except Exception as first_error:
            logger.warning(f"Resume extraction schema validation failed on attempt 1: {first_error}. Attempting repair retry.")
            
            # Single repair retry
            repair_prompt = (
                self.repair_prompt_template
                .replace("{error_message}", str(first_error))
                .replace("{invalid_output}", cleaned_json)
                .replace("{schema_description}", "ResumeExtractionPayload JSON schema")
            )
            repaired_output = await self._call_openai_api(repair_prompt)
            cleaned_repaired = clean_json_text(repaired_output)
            
            try:
                repaired_dict = json.loads(cleaned_repaired)
                payload = ResumeExtractionPayload.model_validate(repaired_dict)
                metadata["repaired"] = True
                return payload, metadata
            except Exception as second_error:
                logger.error(f"Resume extraction failed after repair retry: {second_error}")
                raise LLMServiceError(
                    f"LLM returned malformed resume extraction JSON: {str(second_error)}",
                    details=[{"raw_output": raw_output[:300]}]
                )

    async def score_candidate(
        self,
        candidate_payload: ResumeExtractionPayload,
        raw_text: str,
        job_title: str,
        job_description: str,
        must_have_skills: list[str]
    ) -> Tuple[CandidateAssessmentPayload, Dict[str, Any]]:
        """
        Scores candidate against job description with 1-repair retry.
        Returns (assessment_payload, metadata).
        """
        skills_str = "\n".join([f"- {s.normalized_name} ({s.category}): {s.evidence or 'N/A'}" for s in candidate_payload.skills]) or "No skills parsed"
        
        exp_entries = []
        for e in candidate_payload.experience:
            curr_tag = " (Current)" if e.is_current else ""
            dates = f"{e.start_date or '?'} to {e.end_date or 'Present' if e.is_current else '?'}"
            highlights = "; ".join(e.highlights) if e.highlights else "No highlights"
            exp_entries.append(f"- {e.title or 'Unknown Title'} at {e.company or 'Unknown Company'} ({dates}){curr_tag}\n  Highlights: {highlights}")
        exp_str = "\n".join(exp_entries) or "No experience entries parsed"

        edu_entries = []
        for ed in candidate_payload.education:
            edu_entries.append(f"- {ed.degree or 'Degree'} in {ed.field_of_study or 'Field'} from {ed.institution or 'Institution'} (Year: {ed.end_year or 'N/A'})")
        for cert in candidate_payload.certifications:
            edu_entries.append(f"- Cert: {cert.name} by {cert.issuer or 'N/A'} ({cert.year or 'N/A'})")
        edu_str = "\n".join(edu_entries) or "No education/certifications parsed"

        prompt = (
            self.scoring_prompt_template
            .replace("{job_title}", job_title)
            .replace("{must_have_skills}", ", ".join(must_have_skills) if must_have_skills else "None specified")
            .replace("{job_description}", job_description)
            .replace("{candidate_name}", candidate_payload.candidate_name or "Anonymous Candidate")
            .replace("{total_experience}", f"{candidate_payload.total_experience_years:.1f} years" if candidate_payload.total_experience_years else "Not confidently determined")
            .replace("{skills_summary}", skills_str)
            .replace("{experience_summary}", exp_str)
            .replace("{education_summary}", edu_str)
            .replace("{resume_excerpt}", raw_text[:800])
        )

        metadata = {
            "prompt_version": "scoring_v1",
            "model": self.model,
            "provider": "openai_compatible",
            "is_fallback": False
        }

        raw_output = await self._call_openai_api(prompt)
        cleaned_json = clean_json_text(raw_output)

        try:
            parsed_dict = json.loads(cleaned_json)
            payload = CandidateAssessmentPayload.model_validate(parsed_dict)
            return payload, metadata
        except Exception as first_error:
            logger.warning(f"Scoring schema validation failed on attempt 1: {first_error}. Attempting repair retry.")
            
            # Single repair retry
            repair_prompt = (
                self.repair_prompt_template
                .replace("{error_message}", str(first_error))
                .replace("{invalid_output}", cleaned_json)
                .replace("{schema_description}", "CandidateAssessmentPayload JSON schema")
            )
            repaired_output = await self._call_openai_api(repair_prompt)
            cleaned_repaired = clean_json_text(repaired_output)
            
            try:
                repaired_dict = json.loads(cleaned_repaired)
                payload = CandidateAssessmentPayload.model_validate(repaired_dict)
                metadata["repaired"] = True
                return payload, metadata
            except Exception as second_error:
                logger.error(f"Scoring failed after repair retry: {second_error}")
                raise LLMServiceError(
                    f"LLM returned malformed candidate assessment JSON: {str(second_error)}",
                    details=[{"raw_output": raw_output[:300]}]
                )


llm_adapter = LLMAdapter()
