import re
from typing import List, Tuple, Dict, Any
from ..schemas.extraction import (
    ResumeExtractionPayload, ExtractedSkill, ExtractedExperience,
    ExtractedEducation, ExtractedCertification, ContactInfo
)
from ..schemas.assessment import (
    CandidateAssessmentPayload, ScoreBreakdown, ScoreBreakdownItem,
    MatchedRequirement, RequirementGap
)


COMMON_TECH_SKILLS = {
    "python": ("Python", "technical"),
    "javascript": ("JavaScript", "technical"),
    "typescript": ("TypeScript", "technical"),
    "react": ("React", "technical"),
    "node": ("Node.js", "technical"),
    "nodejs": ("Node.js", "technical"),
    "fastapi": ("FastAPI", "technical"),
    "django": ("Django", "technical"),
    "flask": ("Flask", "technical"),
    "postgres": ("PostgreSQL", "tool"),
    "postgresql": ("PostgreSQL", "tool"),
    "mysql": ("MySQL", "tool"),
    "sqlite": ("SQLite", "tool"),
    "mongodb": ("MongoDB", "tool"),
    "redis": ("Redis", "tool"),
    "docker": ("Docker", "tool"),
    "kubernetes": ("Kubernetes", "tool"),
    "k8s": ("Kubernetes", "tool"),
    "aws": ("AWS", "domain"),
    "gcp": ("GCP", "domain"),
    "azure": ("Azure", "domain"),
    "git": ("Git", "tool"),
    "ci/cd": ("CI/CD", "tool"),
    "graphql": ("GraphQL", "technical"),
    "rest": ("REST APIs", "technical"),
    "restful": ("REST APIs", "technical"),
    "html": ("HTML5", "technical"),
    "css": ("CSS3", "technical"),
    "tailwind": ("Tailwind CSS", "technical"),
    "next.js": ("Next.js", "technical"),
    "nextjs": ("Next.js", "technical"),
    "vue": ("Vue.js", "technical"),
    "java": ("Java", "technical"),
    "go": ("Go", "technical"),
    "golang": ("Go", "technical"),
    "rust": ("Rust", "technical"),
    "c++": ("C++", "technical"),
    "kafka": ("Apache Kafka", "tool"),
    "spark": ("Apache Spark", "tool"),
    "pandas": ("Pandas", "technical"),
    "numpy": ("NumPy", "technical"),
    "pytorch": ("PyTorch", "technical"),
    "tensorflow": ("TensorFlow", "technical"),
    "scikit-learn": ("Scikit-Learn", "technical"),
    "linux": ("Linux", "tool"),
    "bash": ("Bash", "tool"),
    "terraform": ("Terraform", "tool"),
}


class DeterministicFallbackAdapter:
    """
    High-fidelity deterministic parser and scoring engine.
    Used when no OpenAI API key is configured or as an emergency fallback.
    Explicitly tags results with 'is_fallback=True' and transparent provenance.
    """

    @classmethod
    def parse_resume(cls, text: str) -> ResumeExtractionPayload:
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        # 1. Candidate Name (heuristic: first non-empty line or explicit Name: tag)
        candidate_name = None
        for line in lines[:5]:
            if re.match(r'^(name\s*[:\-]\s*)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$', line, re.IGNORECASE):
                candidate_name = re.sub(r'^(name\s*[:\-]\s*)', '', line, flags=re.IGNORECASE).strip()
                break
        if not candidate_name and lines:
            first_line = lines[0]
            if len(first_line.split()) <= 4 and not any(c in first_line for c in "@/:{}[]"):
                candidate_name = first_line

        # 2. Contact Info
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else None

        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        phone = phone_match.group(0) if phone_match else None

        location = None
        loc_match = re.search(r'(?:Location|Address|Based in)\s*[:\-]\s*([^\n,]+,\s*[^\n]+)', text, re.IGNORECASE)
        if loc_match:
            location = loc_match.group(1).strip()
        else:
            city_state_match = re.search(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)', text)
            if city_state_match:
                location = city_state_match.group(1).strip()

        links = re.findall(r'https?://[^\s<>"]+|github\.com/[^\s<>"]+|linkedin\.com/in/[^\s<>"]+', text)

        # 3. Skills Extraction
        skills: List[ExtractedSkill] = []
        found_skill_keys = set()
        lower_text = text.lower()
        
        for key, (norm_name, category) in COMMON_TECH_SKILLS.items():
            pattern = r'\b' + re.escape(key) + r'\b'
            if re.search(pattern, lower_text):
                if norm_name not in found_skill_keys:
                    found_skill_keys.add(norm_name)
                    # Find a sentence context as evidence
                    evidence = None
                    for line in lines:
                        if re.search(pattern, line.lower()):
                            evidence = line[:180]
                            break
                    skills.append(ExtractedSkill(
                        name=key,
                        normalized_name=norm_name,
                        category=category,
                        evidence=evidence
                    ))

        # 4. Experience Extraction
        experience: List[ExtractedExperience] = []
        # Look for job title patterns
        job_title_regex = r'(?:Senior|Junior|Lead|Principal|Staff|Full\s*Stack|Backend|Frontend|Software|Data|DevOps|Systems|Cloud|ML|Machine\s*Learning)?\s*(?:Engineer|Developer|Architect|Specialist|Scientist|Consultant|Manager)'
        matches = list(re.finditer(job_title_regex, text, re.IGNORECASE))
        
        # Simple heuristic experience blocks
        for i, match in enumerate(matches[:5]):
            title = match.group(0).strip()
            # find surrounding line
            start_pos = max(0, match.start() - 50)
            end_pos = min(len(text), match.end() + 200)
            snippet = text[start_pos:end_pos]
            
            # look for company name nearby
            company_match = re.search(r'(?:at|@|,\s*)\s*([A-Z][A-Za-z0-9\s&]+(?:Inc|LLC|Corp|Technologies|Labs|Systems|Solutions|Company)?)', snippet)
            company = company_match.group(1).strip() if company_match else None
            
            # look for dates (e.g. 2020 - 2023 or 2021 - Present)
            date_match = re.search(r'(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|Present|Current)', snippet, re.IGNORECASE)
            start_d, end_d, is_curr = None, None, False
            if date_match:
                start_d = date_match.group(1)
                end_str = date_match.group(2)
                if end_str.lower() in ["present", "current"]:
                    is_curr = True
                    end_d = None
                else:
                    end_d = end_str

            experience.append(ExtractedExperience(
                title=title,
                company=company,
                start_date=start_d,
                end_date=end_d,
                is_current=is_curr,
                highlights=[snippet.replace("\n", " ").strip()[:150]],
                skills=[],
                evidence=snippet.replace("\n", " ").strip()[:180]
            ))

        # 5. Education Extraction
        education: List[ExtractedEducation] = []
        edu_match = re.search(r'(Bachelor|Master|B\.S\.|M\.S\.|B\.A\.|Ph\.D\.|Associate)[\w\s]*(?:in|of)\s*([A-Za-z\s]+)', text, re.IGNORECASE)
        if edu_match:
            degree = edu_match.group(1)
            field = edu_match.group(2).strip()
            univ_match = re.search(r'(?:University|College|Institute|Polytechnic)[A-Za-z\s]+', text, re.IGNORECASE)
            institution = univ_match.group(0).strip() if univ_match else None
            year_match = re.search(r'(?:19|20)\d{2}', text[edu_match.start():min(len(text), edu_match.end() + 100)])
            end_year = int(year_match.group(0)) if year_match else None
            education.append(ExtractedEducation(
                institution=institution,
                degree=degree,
                field_of_study=field,
                end_year=end_year,
                evidence=text[edu_match.start():min(len(text), edu_match.end() + 120)].replace("\n", " ").strip()
            ))

        # 6. Experience Years Calculation
        years = re.findall(r'(?:19|20)\d{2}', text)
        total_years = None
        if len(years) >= 2:
            int_years = [int(y) for y in years if 1980 <= int(y) <= 2026]
            if len(int_years) >= 2:
                total_years = float(max(int_years) - min(int_years))
                if total_years > 30:
                    total_years = None

        warnings = []
        if not candidate_name:
            warnings.append("Candidate name could not be confidently isolated.")
        if not skills:
            warnings.append("No standard technical skills detected from predefined vocabulary.")

        return ResumeExtractionPayload(
            candidate_name=candidate_name,
            contact=ContactInfo(email=email, phone=phone, location=location, links=links),
            skills=skills,
            experience=experience,
            education=education,
            certifications=[],
            summary=lines[1] if len(lines) > 1 and len(lines[1]) > 40 else None,
            total_experience_years=total_years,
            warnings=warnings
        )

    @classmethod
    def score_candidate(
        cls,
        candidate_payload: ResumeExtractionPayload,
        raw_text: str,
        job_title: str,
        job_description: str,
        must_have_skills: List[str]
    ) -> CandidateAssessmentPayload:
        """
        Calculates a transparent, deterministic fit score and breakdown on a 1.0-10.0 scale.
        """
        combined_text = (raw_text + " " + " ".join(s.normalized_name for s in candidate_payload.skills)).lower()
        jd_lower = job_description.lower()

        # 1. Skills Scoring (max 4.0)
        must_haves = [s.strip() for s in must_have_skills if s.strip()]
        matched_must = []
        missing_must = []
        for s in must_haves:
            if s.lower() in combined_text:
                matched_must.append(s)
            else:
                missing_must.append(s)

        matched_reqs: List[MatchedRequirement] = []
        gaps: List[RequirementGap] = []

        # Check candidate skills against JD
        relevant_candidate_skills = []
        for skill in candidate_payload.skills:
            if skill.normalized_name.lower() in jd_lower or skill.name.lower() in jd_lower:
                relevant_candidate_skills.append(skill.normalized_name)
                matched_reqs.append(MatchedRequirement(
                    requirement=f"Proficiency in {skill.normalized_name}",
                    evidence=skill.evidence or f"Found skill '{skill.normalized_name}' in candidate profile.",
                    strength="strong"
                ))

        if must_haves:
            must_ratio = len(matched_must) / len(must_haves)
            skills_score = round(must_ratio * 3.0 + min(1.0, len(relevant_candidate_skills) * 0.2), 1)
        else:
            skills_score = round(min(4.0, max(1.0, len(relevant_candidate_skills) * 0.6)), 1)
        skills_score = min(4.0, max(0.5, skills_score))

        for m in missing_must:
            gaps.append(RequirementGap(
                requirement=f"Must-have requirement: {m}",
                reason=f"Keyword/skill '{m}' was not clearly demonstrated in the resume text.",
                severity="must_have"
            ))

        # 2. Relevant Experience Scoring (max 4.0)
        exp_score = 1.0
        exp_rationale = []
        if candidate_payload.total_experience_years:
            years = candidate_payload.total_experience_years
            if years >= 5.0:
                exp_score += 2.2
                exp_rationale.append(f"Strong professional background with ~{years:.1f} years of experience.")
            elif years >= 2.0:
                exp_score += 1.4
                exp_rationale.append(f"Moderate professional background with ~{years:.1f} years of experience.")
            else:
                exp_score += 0.5
                exp_rationale.append(f"Early career with ~{years:.1f} years of experience.")
        else:
            exp_score += 1.0
            exp_rationale.append("Experience duration could not be precisely computed from dates.")

        # Check title overlap
        title_keywords = [w.lower() for w in re.split(r'\W+', job_title) if len(w) > 3]
        for exp in candidate_payload.experience:
            if exp.title and any(kw in exp.title.lower() for kw in title_keywords):
                exp_score += 0.8
                exp_rationale.append(f"Direct role title match: '{exp.title}'.")
                matched_reqs.append(MatchedRequirement(
                    requirement=f"Prior experience matching role: {exp.title}",
                    evidence=exp.evidence or f"Held role '{exp.title}' at '{exp.company or 'company'}'",
                    strength="strong"
                ))
                break

        exp_score = min(4.0, max(0.5, round(exp_score, 1)))

        # 3. Education & Certifications (max 1.0)
        edu_score = 0.5
        edu_rationale = "General educational background detected."
        if candidate_payload.education:
            edu_score = 0.9
            edu = candidate_payload.education[0]
            edu_rationale = f"Holds degree in {edu.degree or 'relevant field'} ({edu.field_of_study or ''}) from {edu.institution or 'accredited institution'}."
            matched_reqs.append(MatchedRequirement(
                requirement="Educational qualification",
                evidence=edu.evidence or f"{edu.degree} in {edu.field_of_study}",
                strength="strong"
            ))
        else:
            edu_score = 0.3
            edu_rationale = "No explicit university degree detected in text."
            gaps.append(RequirementGap(
                requirement="Formal degree credentials",
                reason="No explicit university degree entry detected in resume text.",
                severity="preferred"
            ))

        # 4. Role-Specific Criteria (max 1.0)
        role_score = 0.5
        role_rationale = "Standard role criteria evaluation."
        if len(missing_must) == 0:
            role_score = 0.9
            role_rationale = "Satisfies core role criteria and must-have skill prerequisites."
        else:
            role_score = 0.3
            role_rationale = f"Missing {len(missing_must)} must-have requirements: {', '.join(missing_must)}."

        # Total fit score
        fit_score = round(skills_score + exp_score + edu_score + role_score, 1)
        fit_score = min(10.0, max(1.0, fit_score))

        # Recommendation
        if fit_score >= 7.0 and len(missing_must) == 0:
            rec = "shortlist"
        elif fit_score >= 5.0 or (fit_score >= 7.0 and len(missing_must) > 0):
            rec = "review"
        else:
            rec = "do_not_shortlist"

        justification = (
            f"[Fallback Engine Assessment] Candidate scores {fit_score}/10 based on {len(relevant_candidate_skills)} matching skills "
            f"and ~{candidate_payload.total_experience_years or 'N/A'} years of experience. "
            f"{'Candidate satisfies all required skills.' if not missing_must else f'Has gaps in must-have criteria: {', '.join(missing_must)}.'}"
        )

        return CandidateAssessmentPayload(
            fit_score=fit_score,
            recommendation=rec,
            summary_justification=justification,
            score_breakdown=ScoreBreakdown(
                skills=ScoreBreakdownItem(
                    score=skills_score,
                    max_score=4.0,
                    rationale=f"Identified {len(relevant_candidate_skills)} relevant skills. Must-haves matched: {len(matched_must)}/{len(must_haves)}."
                ),
                relevant_experience=ScoreBreakdownItem(
                    score=exp_score,
                    max_score=4.0,
                    rationale="; ".join(exp_rationale)
                ),
                education_certifications=ScoreBreakdownItem(
                    score=edu_score,
                    max_score=1.0,
                    rationale=edu_rationale
                ),
                role_specific_criteria=ScoreBreakdownItem(
                    score=role_score,
                    max_score=1.0,
                    rationale=role_rationale
                )
            ),
            matched_requirements=matched_reqs,
            gaps=gaps,
            uncertainties=["Parsed via local deterministic fallback engine because semantic LLM API was not active."],
            follow_up_questions=["Verify specific project responsibilities and timeline in phone interview."],
            confidence="medium" if len(matched_must) == len(must_haves) else "low"
        )
