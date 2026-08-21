from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.errors import (
    AppError, app_error_handler, http_exception_handler,
    validation_exception_handler, generic_exception_handler
)
from app.db.session import engine, Base
from app.api.v1.api import api_router
from app.api.v1.endpoints import health

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Smart Resume Screener API: Intelligent resume parsing, structured candidate data extraction, "
        "LLM semantic matching against job criteria, 1-10 fit scoring with explainable evidence, and auditable shortlist management."
    ),
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Database Initialization
@app.on_event("startup")
def on_startup():
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")

# Health endpoint at root and in API
app.include_router(health.router)

# Versioned API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Resume Screener API",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": settings.VERSION
    }
