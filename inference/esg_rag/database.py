"""
Database setup for the ESG service.

Two metadata sets share one engine:
* `Base` (carbon_monitoring) — legacy RAG tables, created with create_all alongside satellite MRV.
* `EsgBase` — tenancy and accounting ledger tables, owned by Alembic migrations in
  inference/esg_migrations (version table `esg_alembic_version`). Never created with create_all
  outside tests, so schema changes are reviewed and reproducible.
"""
import os

from sqlalchemy.orm import declarative_base, sessionmaker
from carbon_monitoring.database import engine, Base

EsgBase = declarative_base()

# Share the same engine — tables live in the same DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

MIGRATIONS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "esg_migrations")


def alembic_config(url: str = None):
    from alembic.config import Config
    cfg = Config()
    cfg.set_main_option("script_location", MIGRATIONS_DIR)
    url = url or engine.url.render_as_string(hide_password=False)
    cfg.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
    return cfg


def upgrade(url: str = None):
    from alembic import command
    command.upgrade(alembic_config(url), "head")


def init_db():
    """Create legacy RAG tables and apply ESG ledger migrations."""
    from . import models as _models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    upgrade()


def get_db():
    """FastAPI dependency — yields a transactional session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
