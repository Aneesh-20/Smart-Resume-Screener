import os
import io
from fastapi import status


def test_create_and_get_job(client):
    create_payload = {
        "title": "Senior Backend Engineer",
        "department": "Engineering",
        "description": "We are seeking a senior backend engineer with deep Python and database knowledge to build scalable services.",
        "min_score_threshold": 7.5,
        "must_have_skills": ["Python", "FastAPI", "PostgreSQL"]
    }
    
    # 1. Create Job
    response = client.post("/api/v1/jobs", json=create_payload)
    assert response.status_code == status.HTTP_201_CREATED
    job_data = response.json()
    assert job_data["title"] == "Senior Backend Engineer"
    assert job_data["min_score_threshold"] == 7.5
    assert "id" in job_data
    job_id = job_data["id"]

    # 2. Get Job by ID
    get_response = client.get(f"/api/v1/jobs/{job_id}")
    assert get_response.status_code == status.HTTP_200_OK
    assert get_response.json()["id"] == job_id
    assert get_response.json()["stats"]["total_candidates"] == 0

    # 3. List Jobs
    list_response = client.get("/api/v1/jobs")
    assert list_response.status_code == status.HTTP_200_OK
    assert len(list_response.json()) >= 1


def test_upload_resumes_and_deduplication(client):
    # Create Job
    job_resp = client.post("/api/v1/jobs", json={
        "title": "Fullstack Engineer",
        "description": "Fullstack engineer required with React and Python skills.",
        "min_score_threshold": 7.0,
        "must_have_skills": ["Python", "React"]
    })
    job_id = job_resp.json()["id"]

    sample_txt_content = b"John Doe\nExperienced Python and React Developer.\nEmail: john@example.com"
    
    # Upload 1
    file_payload = [
        ("files", ("john_doe.txt", io.BytesIO(sample_txt_content), "text/plain"))
    ]
    upload_resp = client.post(f"/api/v1/jobs/{job_id}/resumes", files=file_payload)
    assert upload_resp.status_code == status.HTTP_202_ACCEPTED
    upload_data = upload_resp.json()
    assert upload_data["uploaded_count"] == 1
    assert upload_data["error_count"] == 0

    # Upload duplicate file to same job -> should return duplicate error in errors list
    file_payload_dup = [
        ("files", ("john_doe_copy.txt", io.BytesIO(sample_txt_content), "text/plain"))
    ]
    dup_resp = client.post(f"/api/v1/jobs/{job_id}/resumes", files=file_payload_dup)
    assert dup_resp.status_code == status.HTTP_202_ACCEPTED
    dup_data = dup_resp.json()
    assert dup_data["uploaded_count"] == 0
    assert dup_data["error_count"] == 1
    assert "Duplicate resume" in dup_data["errors"][0]["error"]
