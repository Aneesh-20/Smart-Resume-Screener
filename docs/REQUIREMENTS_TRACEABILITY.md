# Requirements Traceability Matrix

This document maps all source requirements and acceptance criteria from the specification to their corresponding implementation files, architectural modules, and automated verification tests.

---

## Traceability Matrix

| # | Requirement | Implementation Files | Automated Verification Test |
|---|---|---|---|
| **1** | **Intelligently parse resumes** (PDF & text) | [extractor_service.py](file:///backend/app/services/extractor_service.py)<br>[task_worker.py](file:///backend/app/services/task_worker.py) | `tests/test_extraction.py::test_extract_text_from_txt_file`<br>`tests/test_extraction.py::test_extract_text_from_valid_pdf`<br>`tests/test_extraction.py::test_extract_text_from_scanned_pdf_fails_clearly` |
| **2** | **Extract structured skills** with normalization & evidence | [extraction.py](file:///backend/app/schemas/extraction.py)<br>[models/candidate.py](file:///backend/app/models/candidate.py)<br>[SkillsTagList.tsx](file:///frontend/src/components/candidate/SkillsTagList.tsx) | `tests/test_fallback.py::test_fallback_parse_strong_resume`<br>`tests/test_llm_adapter.py::test_llm_extract_resume_success` |
| **3** | **Extract structured experience** with timeline & highlights | [models/candidate.py](file:///backend/app/models/candidate.py)<br>[ExperienceTimeline.tsx](file:///frontend/src/components/candidate/ExperienceTimeline.tsx) | `tests/test_fallback.py::test_fallback_parse_strong_resume` |
| **4** | **Extract structured education & certifications** | [models/candidate.py](file:///backend/app/models/candidate.py)<br>[CandidateDetailDrawer.tsx](file:///frontend/src/components/candidate/CandidateDetailDrawer.tsx) | `tests/test_fallback.py::test_fallback_parse_strong_resume` |
| **5** | **Input: PDF/Text resumes + Job Description** | [jobs.py](file:///backend/app/api/v1/endpoints/jobs.py)<br>[Dropzone.tsx](file:///frontend/src/components/common/Dropzone.tsx) | `tests/test_api_jobs.py::test_upload_resumes_and_deduplication` |
| **6** | **LLM semantic candidate/job matching** | [llm_adapter.py](file:///backend/app/services/llm_adapter.py)<br>[scoring_v1.txt](file:///backend/app/prompts/scoring_v1.txt) | `tests/test_llm_adapter.py::test_llm_extract_resume_success`<br>`tests/test_llm_adapter.py::test_llm_extract_resume_repair_retry_success` |
| **7** | **Semantic matching & scoring** (not keyword count) | [scoring_service.py](file:///backend/app/services/scoring_service.py)<br>[fallback_adapter.py](file:///backend/app/services/fallback_adapter.py) | `tests/test_fallback.py::test_fallback_score_strong_candidate`<br>`tests/test_fallback.py::test_fallback_score_weak_candidate` |
| **8** | **Rate fit 1-10 with justification & 4-factor breakdown** | [assessment.py](file:///backend/app/schemas/assessment.py)<br>[ScoreBreakdownBars.tsx](file:///frontend/src/components/screening/ScoreBreakdownBars.tsx)<br>[ScoreBadge.tsx](file:///frontend/src/components/common/ScoreBadge.tsx) | `tests/test_fallback.py::test_fallback_score_strong_candidate`<br>`frontend/src/test/ScoreBadge.test.tsx` |
| **9** | **Display shortlisted candidates with justification** | [screenings.py](file:///backend/app/api/v1/endpoints/screenings.py)<br>[ShortlistCard.tsx](file:///frontend/src/components/screening/ShortlistCard.tsx)<br>[JobDetailPage.tsx](file:///frontend/src/pages/JobDetailPage.tsx) | `tests/test_screening_flow.py::test_full_screening_flow_and_export`<br>`frontend/src/test/ShortlistCard.test.tsx` |
| **10** | **Backend API in Python / FastAPI** | [main.py](file:///backend/app/main.py)<br>[api/v1/](file:///backend/app/api/v1/) | `tests/test_api_jobs.py`<br>`tests/test_api_candidates.py`<br>`tests/test_screening_flow.py` |
| **11** | **Frontend Dashboard** (React + TS + Vite + Tailwind) | [JobsListPage.tsx](file:///frontend/src/pages/JobsListPage.tsx)<br>[JobDetailPage.tsx](file:///frontend/src/pages/JobDetailPage.tsx) | `frontend/src/test/ShortlistCard.test.tsx`<br>`frontend/src/test/ScoreBadge.test.tsx` |
| **12** | **Database storage for parsed resumes & migrations** | [models/](file:///backend/app/models/)<br>[alembic/](file:///backend/alembic/) | `tests/test_api_jobs.py`<br>`tests/test_api_candidates.py` |
| **13** | **GitHub repo with logical commits** | Git repository initialized with atomic commits | Git history verification |
| **14** | **README with architecture & LLM prompts** | [README.md](file:///README.md)<br>[ARCHITECTURE.md](file:///docs/ARCHITECTURE.md)<br>[LLM_PROMPTS.md](file:///docs/LLM_PROMPTS.md) | Documentation review |
| **15** | **2-3 min demo video & script** | [DEMO_SCRIPT.md](file:///docs/DEMO_SCRIPT.md) | Timed walkthrough verification |
| **16** | **Code quality & structure** | Monorepo layout, Pydantic 2, SQLAlchemy 2, Alembic, typed boundaries | `npm run build`<br>`pytest` |
| **17** | **Data extraction quality & Recruiter corrections** | [candidate_repo.py](file:///backend/app/repositories/candidate_repo.py)<br>[CorrectionsModal.tsx](file:///frontend/src/components/candidate/CorrectionsModal.tsx) | `tests/test_api_candidates.py::test_candidate_corrections_and_rescore_and_delete` |
| **18** | **LLM prompt quality & JSON repair retry** | [prompts/](file:///backend/app/prompts/)<br>[llm_adapter.py](file:///backend/app/services/llm_adapter.py) | `tests/test_llm_adapter.py::test_llm_extract_resume_repair_retry_success` |
| **19** | **Output clarity & Responsible AI Notice** | [ResponsibleNotice.tsx](file:///frontend/src/components/layout/ResponsibleNotice.tsx)<br>[RequirementEvidenceList.tsx](file:///frontend/src/components/screening/RequirementEvidenceList.tsx) | Manual & UI Component Verification |
| **20** | **Duplicate detection & Deletion audit** | [security.py](file:///backend/app/core/security.py)<br>[audit_service.py](file:///backend/app/services/audit_service.py) | `tests/test_api_jobs.py::test_upload_resumes_and_deduplication`<br>`tests/test_api_candidates.py` |
