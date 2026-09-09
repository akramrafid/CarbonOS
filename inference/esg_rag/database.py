"""
Database setup for ESG RAG audit trail.
Reuses the same engine/session pattern as carbon_monitoring.
"""
from sqlalchemy.orm import sessionmaker
from carbon_monitoring.database import engine, Base


# Share the same engine — tables live in the same DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create ESG RAG tables if they don't exist."""
    # Import models so Base.metadata knows about them
    from . import models as _models  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency — yields a transactional session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
