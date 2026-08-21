import io
from fastapi import status


def test_candidate_corrections_and_rescore_and_delete(client):
    # 1. Create Job
    job_resp = client.post("/api/v1/jobs", json={
        "title": "Platform Engineer",
        "description": "Platform engineer role requiring Kubernetes, Docker, and Python.",
        "min_score_threshold": 7.0,
        "must_have_skills": ["Python", "Docker"]
    })
    job_id = job_resp.json()["id"]

    # 2. Upload Resume
    resume_text = b"Jane Smith\nPython and Docker Engineer.\nEmail: jane@example.com\nLocation: Seattle, WA"
    upload_resp = client.post(
        f"/api/v1/jobs/{job_id}/resumes",
        files=[("files", ("jane_smith.txt", io.BytesIO(resume_text), "text/plain"))]
    )
    assert upload_resp.status_code == status.HTTP_202_ACCEPTED
    cand_id = upload_resp.json()["uploaded"][0]["candidate_id"]

    # 3. Get candidate details
    cand_resp = client.get(f"/api/v1/candidates/{cand_id}")
    assert cand_resp.status_code == status.HTTP_200_OK

    # 4. Recruiter manual correction
    patch_payload = {
        "candidate_name": "Jane E. Smith",
        "location": "Seattle, Washington",
        "total_experience_years": 4.5,
        "skills": [
            {"name": "Python", "normalized_name": "Python", "category": "technical", "evidence": "Expert in Python"},
            {"name": "Docker", "normalized_name": "Docker", "category": "tool", "evidence": "Production Docker"}
        ]
    }
    patch_resp = client.patch(f"/api/v1/candidates/{cand_id}", json=patch_payload)
    assert patch_resp.status_code == status.HTTP_200_OK
    assert patch_resp.json()["candidate_name"] == "Jane E. Smith"
    assert len(patch_resp.json()["skills"]) == 2

    # 5. Rescore candidate
    rescore_resp = client.post(f"/api/v1/candidates/{cand_id}/rescore")
    assert rescore_resp.status_code == status.HTTP_200_OK
    assert "fit_score" in rescore_resp.json()

    # 6. Delete candidate
    del_resp = client.delete(f"/api/v1/candidates/{cand_id}")
    assert del_resp.status_code == status.HTTP_200_OK

    # Verify deleted
    get_again = client.get(f"/api/v1/candidates/{cand_id}")
    assert get_again.status_code == status.HTTP_404_NOT_FOUND
