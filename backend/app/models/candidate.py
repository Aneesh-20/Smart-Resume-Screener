from sqlalchemy import Column, String, Integer, Float, Text, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from ..db.session import Base
from .base import TimestampMixin, generate_uuid


class Candidate(Base, TimestampMixin):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    job_id = Column(String(36), ForeignKey("screening_jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # File Metadata
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    file_type = Column(String(10), nullable=False)  # pdf, txt
    file_size_bytes = Column(Integer, nullable=False)
    content_hash = Column(String(64), nullable=False, index=True)
    raw_text = Column(Text, nullable=False)
    
    # Ingestion / Processing Status: queued, processing, parsed, scored, failed
    status = Column(String(20), default="queued", nullable=False, index=True)
    status_message = Column(Text, nullable=True)

    # Extracted Structured Fields
    candidate_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    links = Column(JSON, default=list, nullable=False)
    total_experience_years = Column(Float, nullable=True)
    summary = Column(Text, nullable=True)
    
    # Parsed raw output and warnings
    parse_warnings = Column(JSON, default=list, nullable=False)
    parse_payload = Column(JSON, default=dict, nullable=False)

    # Relationships
    job = relationship("ScreeningJob", back_populates="candidates")
    skills = relationship("CandidateSkill", back_populates="candidate", cascade="all, delete-orphan")
    experience_entries = relationship("ExperienceEntry", back_populates="candidate", cascade="all, delete-orphan")
    education_entries = relationship("EducationEntry", back_populates="candidate", cascade="all, delete-orphan")
    certifications = relationship("CertificationEntry", back_populates="candidate", cascade="all, delete-orphan")
    assessments = relationship("CandidateAssessment", back_populates="candidate", cascade="all, delete-orphan")


class CandidateSkill(Base, TimestampMixin):
    __tablename__ = "candidate_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    normalized_name = Column(String(150), nullable=False, index=True)
    category = Column(String(50), default="technical", nullable=False)  # technical, tool, domain, soft, language, other
    evidence = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="skills")


class ExperienceEntry(Base, TimestampMixin):
    __tablename__ = "experience_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    start_date = Column(String(30), nullable=True)
    end_date = Column(String(30), nullable=True)
    is_current = Column(Boolean, default=False, nullable=False)
    highlights = Column(JSON, default=list, nullable=False)
    skills = Column(JSON, default=list, nullable=False)
    evidence = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="experience_entries")


class EducationEntry(Base, TimestampMixin):
    __tablename__ = "education_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    institution = Column(String(255), nullable=True)
    degree = Column(String(255), nullable=True)
    field_of_study = Column(String(255), nullable=True)
    end_year = Column(Integer, nullable=True)
    evidence = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="education_entries")


class CertificationEntry(Base, TimestampMixin):
    __tablename__ = "certification_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    candidate_id = Column(String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=True)
    year = Column(Integer, nullable=True)
    evidence = Column(Text, nullable=True)

    candidate = relationship("Candidate", back_populates="certifications")
