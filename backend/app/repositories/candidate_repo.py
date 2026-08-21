import os
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from ..models.candidate import Candidate, CandidateSkill, ExperienceEntry, EducationEntry, CertificationEntry
from ..models.screening import CandidateAssessment
from ..schemas.candidate import CandidateUpdate
from ..core.config import settings
from ..core.logging import logger


class CandidateRepository:
    @staticmethod
    def get_by_id(db: Session, candidate_id: str) -> Optional[Candidate]:
        return db.query(Candidate).filter(Candidate.id == candidate_id).first()

    @staticmethod
    def find_by_content_hash(db: Session, job_id: str, content_hash: str) -> Optional[Candidate]:
        return db.query(Candidate).filter(
            Candidate.job_id == job_id,
            Candidate.content_hash == content_hash
        ).first()

    @staticmethod
    def list_by_job(
        db: Session,
        job_id: str,
        status: Optional[str] = None,
        recommendation: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc"
    ) -> List[Tuple[Candidate, Optional[CandidateAssessment]]]:
        query = db.query(Candidate).filter(Candidate.job_id == job_id)

        if status:
            query = query.filter(Candidate.status == status)

        if search:
            search_pattern = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    Candidate.candidate_name.ilike(search_pattern),
                    Candidate.original_filename.ilike(search_pattern),
                    Candidate.email.ilike(search_pattern),
                    Candidate.location.ilike(search_pattern)
                )
            )

        if sort_dir == "asc":
            query = query.order_by(asc(getattr(Candidate, sort_by, Candidate.created_at)))
        else:
            query = query.order_by(desc(getattr(Candidate, sort_by, Candidate.created_at)))

        candidates = query.all()
        results = []

        for c in candidates:
            latest_assessment = (
                db.query(CandidateAssessment)
                .filter(CandidateAssessment.candidate_id == c.id)
                .order_by(CandidateAssessment.created_at.desc())
                .first()
            )
            if recommendation and latest_assessment:
                if latest_assessment.recommendation != recommendation:
                    continue
            elif recommendation and not latest_assessment:
                continue

            results.append((c, latest_assessment))

        if sort_by == "score":
            results.sort(
                key=lambda x: (x[1].fit_score if x[1] else -1.0),
                reverse=(sort_dir == "desc")
            )

        return results

    @staticmethod
    def update_corrections(db: Session, candidate: Candidate, update_in: CandidateUpdate) -> Candidate:
        """Applies recruiter corrections to candidate structured profile."""
        if update_in.candidate_name is not None:
            candidate.candidate_name = update_in.candidate_name
        if update_in.email is not None:
            candidate.email = update_in.email
        if update_in.phone is not None:
            candidate.phone = update_in.phone
        if update_in.location is not None:
            candidate.location = update_in.location
        if update_in.total_experience_years is not None:
            candidate.total_experience_years = update_in.total_experience_years
        if update_in.summary is not None:
            candidate.summary = update_in.summary

        # Update skills if provided
        if update_in.skills is not None:
            db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate.id).delete()
            for s in update_in.skills:
                db.add(CandidateSkill(
                    candidate_id=candidate.id,
                    name=s.name,
                    normalized_name=s.normalized_name,
                    category=s.category,
                    evidence=s.evidence
                ))

        # Update experience if provided
        if update_in.experience is not None:
            db.query(ExperienceEntry).filter(ExperienceEntry.candidate_id == candidate.id).delete()
            for exp in update_in.experience:
                db.add(ExperienceEntry(
                    candidate_id=candidate.id,
                    title=exp.title,
                    company=exp.company,
                    start_date=exp.start_date,
                    end_date=exp.end_date,
                    is_current=exp.is_current,
                    highlights=exp.highlights,
                    skills=exp.skills,
                    evidence=exp.evidence
                ))

        # Update education if provided
        if update_in.education is not None:
            db.query(EducationEntry).filter(EducationEntry.candidate_id == candidate.id).delete()
            for edu in update_in.education:
                db.add(EducationEntry(
                    candidate_id=candidate.id,
                    institution=edu.institution,
                    degree=edu.degree,
                    field_of_study=edu.field_of_study,
                    end_year=edu.end_year,
                    evidence=edu.evidence
                ))

        # Update certifications if provided
        if update_in.certifications is not None:
            db.query(CertificationEntry).filter(CertificationEntry.candidate_id == candidate.id).delete()
            for cert in update_in.certifications:
                db.add(CertificationEntry(
                    candidate_id=candidate.id,
                    name=cert.name,
                    issuer=cert.issuer,
                    year=cert.year,
                    evidence=cert.evidence
                ))

        db.commit()
        db.refresh(candidate)
        return candidate

    @staticmethod
    def delete(db: Session, candidate: Candidate) -> bool:
        """Deletes candidate and purges stored resume file from disk."""
        try:
            file_path = os.path.join(settings.UPLOAD_DIR, candidate.stored_filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.warning(f"Failed to delete stored file {candidate.stored_filename}: {e}")

        db.delete(candidate)
        db.commit()
        return True
