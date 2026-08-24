import os
try:
    import fitz  # PyMuPDF
except ImportError:
    try:
        import pymupdf as fitz
    except ImportError:
        fitz = None
from typing import Tuple, List
from app.core.errors import ParseError, UnsupportedFileError
from app.core.logging import logger


class ResumeExtractorService:
    @staticmethod
    def extract_text_from_file(file_path: str, file_type: str) -> Tuple[str, List[str]]:
        """
        Extracts raw text from a PDF or UTF-8 text file.
        Returns: (extracted_text, warnings)
        Raises: UnsupportedFileError or ParseError on corrupt / scanned zero-text files.
        """
        clean_type = file_type.lower().lstrip(".")
        if clean_type not in ["pdf", "txt"] and not (file_path.endswith(".pdf") or file_path.endswith(".txt")):
            raise UnsupportedFileError(f"Unsupported file format '{file_type}'. Only .pdf and .txt are supported.")

        if not os.path.exists(file_path):
            raise ParseError(f"File not found on server storage: {file_path}")

        warnings = []

        if clean_type == "txt" or file_path.endswith(".txt"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
            except UnicodeDecodeError:
                try:
                    with open(file_path, "r", encoding="latin-1") as f:
                        text = f.read()
                        warnings.append("File was decoded using latin-1 fallback encoding.")
                except Exception as e:
                    raise ParseError(f"Failed to decode text file: {str(e)}")

        elif clean_type == "pdf" or file_path.endswith(".pdf"):
            text = ""
            try:
                doc = fitz.open(file_path)
                if doc.page_count == 0:
                    raise ParseError("PDF document is empty (0 pages).")

                for page_num in range(doc.page_count):
                    page = doc.load_page(page_num)
                    page_text = page.get_text("text")
                    if page_text:
                        text += page_text + "\n"
                doc.close()
            except Exception as e:
                logger.error(f"Error opening/reading PDF {file_path}: {e}")
                raise ParseError(f"Corrupted or unreadable PDF file: {str(e)}")

            # Check if PDF had no extractable text layer (e.g. scanned image PDF)
            clean_text = text.strip()
            if len(clean_text) < 30:
                raise UnsupportedFileError(
                    message="Scanned PDF - OCR is not configured. The uploaded PDF contains no extractable digital text layer.",
                    details=[{"file_path": file_path, "character_count": len(clean_text)}]
                )
        else:
            raise UnsupportedFileError(f"Unsupported file format '{file_type}'. Only .pdf and .txt are supported.")

        clean_text = text.strip()
        if not clean_text:
            raise ParseError("Extracted resume text is empty.")

        return clean_text, warnings
