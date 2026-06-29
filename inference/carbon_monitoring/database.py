import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Default to the SQLite database shared with the Django app
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, 'backend', 'db.sqlite3')
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

def get_db():
    """
    FastAPI dependency that provides a transactional database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
