import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default to the SQLite database shared with the Django app (local dev)
# On Render, the backend/ directory isn't available, so fallback to local db
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHARED_DB_PATH = os.path.join(BASE_DIR, 'backend', 'db.sqlite3')
LOCAL_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db.sqlite3')

# Use shared DB if available (local dev), otherwise use local path
DEFAULT_DB_PATH = SHARED_DB_PATH if os.path.exists(os.path.dirname(SHARED_DB_PATH)) else LOCAL_DB_PATH
SQLITE_URL = f"sqlite:///{DEFAULT_DB_PATH}"

# Allow override via environment variables (e.g. for PostgreSQL in production)
DATABASE_URL = os.getenv("DATABASE_URL", SQLITE_URL)

# For PostgreSQL, use a standard pool; for SQLite, use a single-threaded connection pool or similar
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_recycle=3600
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    """
    Create all database tables if they don't exist.
    Must be called AFTER all models are imported so Base.metadata knows about them.
    """
    Base.metadata.create_all(bind=engine)

def get_db():
    """
    FastAPI dependency that provides a transactional database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
