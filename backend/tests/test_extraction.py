import os
import pytest
from app.services.extractor_service import ResumeExtractorService
from app.core.errors import UnsupportedFileError, ParseError
from app.core.security import calculate_content_hash

SAMPLE_RESUMES_DIR = os.path.join(os.path.dirname(__file__), "../../sample-data/resumes")


def test_extract_text_from_txt_file():
    txt_path = os.path.join(SAMPLE_RESUMES_DIR, "strong_candidate_alice_chen.txt")
    text, warnings = ResumeExtractorService.extract_text_from_file(txt_path, "txt")
    
    assert len(text) > 100
    assert "Alice Chen" in text
    assert "FastAPI" in text
    assert isinstance(warnings, list)


def test_extract_text_from_valid_pdf():
    pdf_path = os.path.join(SAMPLE_RESUMES_DIR, "strong_candidate_alice_chen.pdf")
    text, warnings = ResumeExtractorService.extract_text_from_file(pdf_path, "pdf")
    
    assert len(text) > 100
    assert "Alice Chen" in text
    assert "FastAPI" in text or "Python" in text


def test_extract_text_from_scanned_pdf_fails_clearly():
    scanned_pdf_path = os.path.join(SAMPLE_RESUMES_DIR, "scanned_or_unsupported.pdf")
    with pytest.raises(UnsupportedFileError) as exc_info:
        ResumeExtractorService.extract_text_from_file(scanned_pdf_path, "pdf")
    
    assert "Scanned PDF - OCR is not configured" in str(exc_info.value.message)


def test_unsupported_file_extension():
    with pytest.raises(UnsupportedFileError):
        ResumeExtractorService.extract_text_from_file("resume.docx", "docx")


def test_content_hash_integrity():
    txt_path = os.path.join(SAMPLE_RESUMES_DIR, "strong_candidate_alice_chen.txt")
    with open(txt_path, "rb") as f:
        data1 = f.read()
    
    hash1 = calculate_content_hash(data1)
    hash2 = calculate_content_hash(data1)
    assert hash1 == hash2
    assert len(hash1) == 64
