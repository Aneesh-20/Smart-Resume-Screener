import io
import time
from fastapi import status


def test_full_screening_flow_and_export(client):
    # 1. Create Job
    job_payload = {
        "title": "Lead Software Engineer",
        "description": "Seeking Lead Software Engineer with Python, React, PostgreSQL, and AWS experience.",
        "min_score_threshold": 7.0,
        "must_have_skills": ["Python", "React", "PostgreSQL"]
    }
    job_resp = client.post("/api/v1/jobs", json=job_payload)
    assert job_resp.status_code == status.HTTP_201_CREATED
    job_id = job_resp.json()["id"]

    # 2. Upload multiple candidates
    cand1 = b"Alice Strong\nSenior Engineer with Python, React, PostgreSQL, and AWS.\n2018 to Present"
    cand2 = b"Bob Weak\nJunior coordinator with basic HTML skills."
    
    files = [
        ("files", ("alice.txt", io.BytesIO(cand1), "text/plain")),
        ("files", ("bob.txt", io.BytesIO(cand2), "text/plain"))
    ]
    upload_resp = client.post(f"/api/v1/jobs/{job_id}/resumes", files=files)
    assert upload_resp.status_code == status.HTTP_202_ACCEPTED
    assert upload_resp.json()["uploaded_count"] == 2

    # Give in-process worker task a split second to parse
    time.sleep(0.5)

    # 3. Start Screening Run
    screening_resp = client.post(f"/api/v1/jobs/{job_id}/screenings", json={"min_score_threshold": 7.0})
    assert screening_resp.status_code == status.HTTP_202_ACCEPTED
    run_id = screening_resp.json()["id"]

    time.sleep(0.5)

    # 4. Check Shortlist
    shortlist_resp = client.get(f"/api/v1/jobs/{job_id}/shortlist")
    assert shortlist_resp.status_code == status.HTTP_200_OK
    data = shortlist_resp.json()
    assert data["job_id"] == job_id
    assert "shortlisted" in data
    assert "review" in data
    assert "do_not_shortlist" in data

    # 5. Export CSV
    export_resp = client.get(f"/api/v1/jobs/{job_id}/export.csv")
    assert export_resp.status_code == status.HTTP_200_OK
    assert export_resp.headers["content-type"].startswith("text/csv")
    assert "Candidate Name" in export_resp.text
    assert "Fit Score" in export_resp.text
