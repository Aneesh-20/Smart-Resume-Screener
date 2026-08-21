# REST API Reference: Smart Resume Screener

The Smart Resume Screener backend provides a documented, versioned REST API under `/api/v1`.

Interactive OpenAPI Swagger UI is available at: `http://localhost:8000/docs`  
Alternative ReDoc documentation is available at: `http://localhost:8000/redoc`

---

## 1. System Health

### `GET /health`
Returns service status, environment, and active LLM configuration.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "Smart Resume Screener",
  "version": "1.0.0",
  "environment": "development",
  "llm_provider": "openai_compatible",
  "llm_model": "gpt-4o-mini",
  "timestamp": "2026-08-21T09:30:00Z"
}
```

---

## 2. Screening Jobs

### `POST /api/v1/jobs`
Creates a new screening job.

**Request Body:**
```json
{
  "title": "Senior Full-Stack Engineer",
  "department": "Core Platform",
  "description": "5+ years of experience with Python, FastAPI, React, TypeScript, and PostgreSQL.",
  "min_score_threshold": 7.5,
  "must_have_skills": ["Python", "FastAPI", "React", "PostgreSQL"]
}
```

**Response `201 Created`:**
```json
{
  "id": "e4f3a71b-29a3-4819-91cb-91823ab02134",
  "title": "Senior Full-Stack Engineer",
  "department": "Core Platform",
  "description": "5+ years of experience with Python, FastAPI, React, TypeScript, and PostgreSQL.",
  "min_score_threshold": 7.5,
  "must_have_skills": ["Python", "FastAPI", "React", "PostgreSQL"],
  "is_active": true,
  "created_at": "2026-08-21T09:30:00Z",
  "updated_at": "2026-08-21T09:30:00Z",
  "stats": {
    "total_candidates": 0,
    "parsed_candidates": 0,
    "scored_candidates": 0,
    "shortlisted_candidates": 0,
    "failed_candidates": 0,
    "latest_run_id": null,
    "latest_run_status": null
  }
}
```

### `GET /api/v1/jobs`
Lists all screening jobs with aggregated candidate stats.

### `GET /api/v1/jobs/{job_id}`
Retrieves a single screening job by ID.

### `PATCH /api/v1/jobs/{job_id}`
Updates title, description, or shortlist threshold.

---

## 3. Resume Upload & Candidate Ingestion

### `POST /api/v1/jobs/{job_id}/resumes`
Accepts multipart multi-file upload of `.pdf` and `.txt` resumes.

**Request:** `multipart/form-data` with `files` fields.

**Response `202 Accepted`:**
```json
{
  "job_id": "e4f3a71b-29a3-4819-91cb-91823ab02134",
  "uploaded_count": 2,
  "error_count": 0,
  "uploaded": [
    {
      "candidate_id": "7b8e192a-0492-4817-a129-98213ba98123",
      "original_filename": "alice_chen.pdf",
      "status": "queued"
    },
    {
      "candidate_id": "1c9a842b-9823-4123-b182-1234a9812345",
      "original_filename": "bob_martinez.txt",
      "status": "queued"
    }
  ],
  "errors": []
}
```

### `GET /api/v1/jobs/{job_id}/candidates`
Lists candidates for a job with filtering and sorting.

**Query Parameters:**
- `status`: `queued | processing | parsed | scored | failed`
- `recommendation`: `shortlist | review | do_not_shortlist`
- `search`: string search across candidate name, filename, email
- `sort_by`: `score | created_at | candidate_name` (default: `created_at`)
- `sort_dir`: `asc | desc` (default: `desc`)

---

## 4. Candidate Details & Recruiter Corrections

### `GET /api/v1/candidates/{candidate_id}`
Retrieves candidate structured profile, skills, experience, education, raw text, and latest assessment.

### `PATCH /api/v1/candidates/{candidate_id}`
Enables human recruiters to manually correct or augment parsed candidate details.

**Request Body:**
```json
{
  "candidate_name": "Alice Chen, M.S.",
  "total_experience_years": 6.5,
  "skills": [
    {
      "name": "Python",
      "normalized_name": "Python",
      "category": "technical",
      "evidence": "Verified 6 years professional experience"
    }
  ]
}
```

### `POST /api/v1/candidates/{candidate_id}/rescore`
Re-scores candidate against the latest job criteria.

### `DELETE /api/v1/candidates/{candidate_id}`
Purges candidate record, assessments, and stored physical resume file from disk.

---

## 5. Screening Runs & Shortlist

### `POST /api/v1/jobs/{job_id}/screenings`
Creates an immutable screening run snapshot and triggers background candidate scoring.

**Request Body:**
```json
{
  "min_score_threshold": 7.5,
  "prompt_version": "v1"
}
```

### `GET /api/v1/jobs/{job_id}/shortlist`
Returns candidates partitioned into `shortlisted`, `review`, and `do_not_shortlist` buckets ranked by score.

**Response `200 OK`:**
```json
{
  "job_id": "e4f3a71b-29a3-4819-91cb-91823ab02134",
  "threshold": 7.5,
  "total_screened": 3,
  "shortlisted_count": 1,
  "review_count": 1,
  "do_not_shortlist_count": 1,
  "shortlisted": [
    {
      "candidate_id": "7b8e192a-0492-4817-a129-98213ba98123",
      "candidate_name": "Alice Chen",
      "original_filename": "alice_chen.pdf",
      "fit_score": 8.8,
      "recommendation": "shortlist",
      "summary_justification": "Exceptional alignment with 6+ years building FastAPI microservices and React frontends.",
      "score_breakdown": {
        "skills": {"score": 3.8, "max_score": 4.0, "rationale": "Matches all required skills."},
        "relevant_experience": {"score": 3.5, "max_score": 4.0, "rationale": "6 years full-stack experience."},
        "education_certifications": {"score": 0.9, "max_score": 1.0, "rationale": "M.S. in Computer Science."},
        "role_specific_criteria": {"score": 0.6, "max_score": 1.0, "rationale": "Docker & AWS cloud deployments."}
      },
      "matched_requirements": [
        {
          "requirement": "Python & FastAPI backend",
          "evidence": "Built high-concurrency microservices using Python 3.11 and FastAPI",
          "strength": "strong"
        }
      ],
      "gaps": [],
      "uncertainties": [],
      "confidence": "high",
      "is_fallback": false,
      "skills_preview": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
      "total_experience_years": 6.0,
      "assessed_at": "2026-08-21T09:32:00Z"
    }
  ],
  "review": [],
  "do_not_shortlist": []
}
```

### `GET /api/v1/jobs/{job_id}/export.csv`
Streams CSV export of all candidates, scores, justifications, strengths, and gaps.

---

## 6. Standard Error Format

All error responses adhere to the standard JSON structure:

```json
{
  "error": {
    "code": "UNSUPPORTED_FILE",
    "message": "Only PDF and UTF-8 text resumes are supported.",
    "details": []
  }
}
```

**Common Error Codes:**
- `NOT_FOUND`: Entity not found (HTTP 404)
- `UNSUPPORTED_FILE`: Unsupported format or scanned PDF without OCR layer (HTTP 415)
- `FILE_TOO_LARGE`: Upload exceeds 15MB limit (HTTP 413)
- `DUPLICATE_RESUME`: Content hash identical to existing upload in job (HTTP 409)
- `PARSE_FAILED`: Unprocessable or corrupt resume payload (HTTP 422)
- `VALIDATION_ERROR`: Field validation error (HTTP 422)
