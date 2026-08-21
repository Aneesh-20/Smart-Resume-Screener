from fastapi import APIRouter
from .endpoints import jobs, candidates, screenings, export, audit

api_router = APIRouter()

api_router.include_router(jobs.router)
api_router.include_router(candidates.router)
api_router.include_router(screenings.router)
api_router.include_router(export.router)
api_router.include_router(audit.router)
