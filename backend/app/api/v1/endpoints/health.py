from fastapi import APIRouter
from datetime import datetime, timezone
from app.core.config import settings

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "llm_provider": "openai_compatible" if settings.OPENAI_API_KEY else "deterministic_fallback",
        "llm_model": settings.OPENAI_MODEL if settings.OPENAI_API_KEY else "local_heuristic",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
