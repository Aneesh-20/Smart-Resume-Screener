# Smart Resume Screener: 2-3 Minute Timed Demo Script

This script guides a recruiter or evaluator through a live, end-to-end walkthrough of the **Smart Resume Screener** application.

---

## Demo Overview
- **Goal**: Demonstrate intelligent resume parsing, semantic candidate matching, 1-10 explainable scoring, transparent gap analysis, recruiter corrections, and shortlist generation.
- **Estimated Duration**: 2 minutes 30 seconds.
- **Target Audience**: Talent Acquisition Leaders, Engineering Hiring Managers, and Technical Reviewers.

---

## Timed Walkthrough

### ⏱️ 0:00 – 0:30 | Introduction & Responsible AI Foundation
- **Visual**: Landing on `http://localhost:5173`. Point out the header notice: *"This tool supports recruiter review; it does not make final hiring decisions."*
- **Script**:
  > "Welcome to the Smart Resume Screener demo. When reviewing hundreds of applications, recruiters face keyword stuffing and black-box AI scores. Smart Resume Screener solves this by providing explainable, evidence-grounded semantic evaluation on a 1-to-10 scale while keeping human recruiters firmly in the driver's seat."

---

### ⏱️ 0:30 – 0:55 | Creating a Screening Job
- **Visual**: Click **"Create Screening Job"** in the top right.
- **Action**:
  - **Title**: `Senior Full-Stack Engineer`
  - **Department**: `Engineering - Core Platform`
  - **Threshold**: `7.5 / 10`
  - **Must-Have Skills**: `Python, FastAPI, React, TypeScript, PostgreSQL, Docker`
  - **Description**: Paste content from `sample-data/job_descriptions/senior_fullstack_engineer.txt`.
- **Script**:
  > "We start by defining our screening job. We specify our must-have skills and an explicit shortlist threshold of 7.5 out of 10. The job description is captured as an immutable snapshot for reproducible scoring."

---

### ⏱️ 0:55 – 1:30 | Multi-File Resume Upload & Ingestion
- **Visual**: Open the newly created job workspace, navigate to the **"Upload & Candidate Pool"** tab.
- **Action**: Drag and drop the sample resumes from `sample-data/resumes/`:
  1. `strong_candidate_alice_chen.pdf`
  2. `partial_candidate_bob_martinez.txt`
  3. `weak_candidate_charlie_davis.pdf`
- **Visual**: Show real-time background parsing status indicators changing from `Queued` → `Processing` → `Parsed`.
- **Script**:
  > "We upload multiple PDF and text resumes simultaneously. Our background extractor immediately parses structured facts—skills, work experience timeline, and education—without modifying or fabricating missing data. Notice that duplicate uploads and scanned zero-text PDFs are flagged immediately."

---

### ⏱️ 1:30 – 2:05 | Running Semantic Screening & Shortlist Ranking
- **Visual**: Click the **"Start Screening Run"** button. Navigate to the **"Shortlist & Ranking"** tab.
- **Visual**: Inspect the ranked candidates:
  - **Alice Chen (#1)**: Scores `8.8/10` → Categorized under **Shortlisted** with strengths in FastAPI microservices and React.
  - **Bob Martinez (#2)**: Scores `6.4/10` → Categorized under **Needs Review** (strong frontend, but lacks senior backend/Docker experience).
  - **Charlie Davis (#3)**: Scores `3.8/10` → Categorized under **Not Shortlisted** with clear gap explanations.
- **Script**:
  > "With a single click, our dual-engine evaluator assesses semantic fit, not just keyword overlap. Every score is broken down into four distinct categories totaling 10 points: Skills, Experience, Education, and Role Criteria. The shortlist rule is completely transparent: score above 7.5 and a shortlist recommendation. Non-shortlisted candidates are never hidden—their gaps and missing evidence are plainly visible."

---

### ⏱️ 2:05 – 2:30 | Recruiter Oversight, Manual Corrections & CSV Export
- **Visual**: Click **"Inspect"** on Bob Martinez. Open the **"Evidence & Gaps"** tab to view direct resume quotes.
- **Action**:
  1. Click **"Recruiter Edit"** to add verified skills or adjust experience years.
  2. Click **"Save & Re-Score"** to see live updated score.
  3. Click **"Export CSV"** in the top navigation to download the auditable shortlist report.
- **Script**:
  > "Recruiters have full authority to audit raw text, correct parsed records, and trigger on-demand rescoring. Finally, we can export the complete shortlist with justifications to CSV for hiring committee review."

---

## Remaining User Action Note
> [!NOTE]
> If a video recording file was not captured in your local session, recording a screen capture following the timed steps above is the sole remaining action. The application is fully runnable, tested, and demo-ready.
