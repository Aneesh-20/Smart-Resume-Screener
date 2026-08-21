from typing import Any, List, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException


class AppError(Exception):
    """Base application error producing standard structured JSON error responses."""
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        details: Optional[List[Any]] = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or []
        super().__init__(message)


class NotFoundError(AppError):
    def __init__(self, entity: str, entity_id: Any):
        super().__init__(
            code="NOT_FOUND",
            message=f"{entity} with ID '{entity_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )


class UnsupportedFileError(AppError):
    def __init__(self, message: str = "Only PDF and UTF-8 text resumes are supported.", details: Optional[List[Any]] = None):
        super().__init__(
            code="UNSUPPORTED_FILE",
            message=message,
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            details=details
        )


class FileSizeExceededError(AppError):
    def __init__(self, max_mb: int = 15):
        super().__init__(
            code="FILE_TOO_LARGE",
            message=f"File exceeds maximum allowed size of {max_mb}MB.",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
        )


class DuplicateResumeError(AppError):
    def __init__(self, filename: str, candidate_id: str):
        super().__init__(
            code="DUPLICATE_RESUME",
            message=f"A resume with identical content ('{filename}') was already uploaded to this job (Candidate ID: {candidate_id}).",
            status_code=status.HTTP_409_CONFLICT,
            details=[{"candidate_id": candidate_id, "filename": filename}]
        )


class ParseError(AppError):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            code="PARSE_FAILED",
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


class LLMServiceError(AppError):
    def __init__(self, message: str, details: Optional[List[Any]] = None):
        super().__init__(
            code="LLM_SERVICE_ERROR",
            message=message,
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details
        )


def format_error_response(code: str, message: str, details: Optional[List[Any]] = None) -> dict:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details or []
        }
    }


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(exc.code, exc.message, exc.details)
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = "HTTP_ERROR"
    if exc.status_code == status.HTTP_404_NOT_FOUND:
        code = "NOT_FOUND"
    elif exc.status_code == status.HTTP_401_UNAUTHORIZED:
        code = "UNAUTHORIZED"
    elif exc.status_code == status.HTTP_403_FORBIDDEN:
        code = "FORBIDDEN"
    
    return JSONResponse(
        status_code=exc.status_code,
        content=format_error_response(code, str(exc.detail))
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    formatted_errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        formatted_errors.append({
            "field": loc,
            "message": err.get("msg", "Invalid input"),
            "type": err.get("type", "value_error")
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=format_error_response(
            code="VALIDATION_ERROR",
            message="Request validation failed. Check details for field errors.",
            details=formatted_errors
        )
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=format_error_response(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected internal server error occurred."
        )
    )
