import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "Smart Resume Screener"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Database
    DATABASE_URL: str = "sqlite:///./smart_resume_screener.db"
    
    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".txt"]
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "text/plain",
        "application/octet-stream",  # fallback for plain text in some clients
    ]
    
    # LLM Settings
    OPENAI_API_KEY: str | None = None
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_RETRIES: int = 1
    LLM_AUDIT_LOGGING: bool = False
    
    # Shortlist Default
    DEFAULT_MIN_SCORE_THRESHOLD: float = 7.0
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
