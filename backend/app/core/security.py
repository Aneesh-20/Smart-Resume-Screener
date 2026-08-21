import hashlib
import os
import uuid
from typing import Tuple


def calculate_content_hash(data: bytes) -> str:
    """Calculates SHA-256 hash of file byte content for deduplication and integrity."""
    return hashlib.sha256(data).hexdigest()


def generate_safe_filename(original_filename: str) -> Tuple[str, str]:
    """
    Generates a secure server-side storage filename while preserving the extension.
    Returns (safe_storage_filename, normalized_extension).
    """
    _, ext = os.path.splitext(original_filename)
    clean_ext = ext.lower() if ext else ""
    if clean_ext not in [".pdf", ".txt"]:
        clean_ext = ".bin"
    safe_name = f"{uuid.uuid4().hex}{clean_ext}"
    return safe_name, clean_ext


def sanitize_redacted_text(text: str) -> str:
    """Redacts potential sensitive contact info for safe audit logging if enabled."""
    import re
    # Simple regex for email and phone redaction in logs
    text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[REDACTED_EMAIL]', text)
    text = re.sub(r'\+?\d[\d -]{8,}\d', '[REDACTED_PHONE]', text)
    return text
