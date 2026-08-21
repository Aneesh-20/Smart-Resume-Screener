import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.config import settings
from app.db.session import Base, get_db, SessionLocal
import app.db.session as session_module
from app.main import app
from app.models import *

# In-memory SQLite with StaticPool so all connections share the same database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function", autouse=True)
def db_session():
    """Creates a fresh database session for each test and overrides SessionLocal."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # Override global engine and SessionLocal in app.db.session for background tasks
    old_engine = session_module.engine
    old_sessionlocal = session_module.SessionLocal
    session_module.engine = engine
    session_module.SessionLocal = TestingSessionLocal

    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        session_module.engine = old_engine
        session_module.SessionLocal = old_sessionlocal


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient using the test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_resume_text():
    sample_path = os.path.join(
        os.path.dirname(__file__),
        "../../sample-data/resumes/strong_candidate_alice_chen.txt"
    )
    with open(sample_path, "r", encoding="utf-8") as f:
        return f.read()


@pytest.fixture
def sample_job_description():
    sample_path = os.path.join(
        os.path.dirname(__file__),
        "../../sample-data/job_descriptions/senior_fullstack_engineer.txt"
    )
    with open(sample_path, "r", encoding="utf-8") as f:
        return f.read()
