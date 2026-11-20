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
    Also dynamically adds any new multi-pool columns to existing SQLite tables.
    """
    Base.metadata.create_all(bind=engine)

    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "farmers_ai_carbonresult" in inspector.get_table_names():
            existing_cols = {c["name"] for c in inspector.get_columns("farmers_ai_carbonresult")}
            cols_to_add = [
                ("forest_stratum", "VARCHAR(50) DEFAULT 'SUNDARBANS_MANGROVE'"),
                ("carbon_agb_tc_ha", "FLOAT"),
                ("carbon_bgb_tc_ha", "FLOAT"),
                ("carbon_soc_tc_ha", "FLOAT"),
                ("relative_margin_of_error", "FLOAT"),
                ("verra_precision_discount_pct", "FLOAT"),
                ("conservative_creditable_tco2e", "FLOAT"),
                ("parcel_id", "VARCHAR(255)"),
                ("biomass_agb_mg_ha", "FLOAT"),
                ("biomass_bgb_mg_ha", "FLOAT"),
                ("indices_json", "TEXT"),
                ("interval_json", "TEXT"),
            ]
            with engine.begin() as conn:
                for col_name, col_type in cols_to_add:
                    if col_name not in existing_cols:
                        conn.execute(text(f"ALTER TABLE farmers_ai_carbonresult ADD COLUMN {col_name} {col_type}"))
        if "farmers_ai_analysisjob" in inspector.get_table_names():
            existing_job_cols = {c["name"] for c in inspector.get_columns("farmers_ai_analysisjob")}
            job_cols = [("user_id", "VARCHAR(100)"), ("organization_id", "VARCHAR(100)")]
            with engine.begin() as conn:
                for col_name, col_type in job_cols:
                    if col_name not in existing_job_cols:
                        conn.execute(text(f"ALTER TABLE farmers_ai_analysisjob ADD COLUMN {col_name} {col_type}"))
        if "farmers_ai_uploadedboundary" in inspector.get_table_names():
            existing_b_cols = {c["name"] for c in inspector.get_columns("farmers_ai_uploadedboundary")}
            b_cols = [("user_id", "VARCHAR(100)"), ("organization_id", "VARCHAR(100)")]
            with engine.begin() as conn:
                for col_name, col_type in b_cols:
                    if col_name not in existing_b_cols:
                        conn.execute(text(f"ALTER TABLE farmers_ai_uploadedboundary ADD COLUMN {col_name} {col_type}"))
        if "farmers_ai_carbonalert" in inspector.get_table_names():
            existing_alert_cols = {c["name"] for c in inspector.get_columns("farmers_ai_carbonalert")}
            alert_cols = [("user_id", "VARCHAR(100)"), ("organization_id", "VARCHAR(100)")]
            with engine.begin() as conn:
                for col_name, col_type in alert_cols:
                    if col_name not in existing_alert_cols:
                        conn.execute(text(f"ALTER TABLE farmers_ai_carbonalert ADD COLUMN {col_name} {col_type}"))
        if "carbon_mrv_groundtruthplot" in inspector.get_table_names():
            existing_gt_cols = {c["name"] for c in inspector.get_columns("carbon_mrv_groundtruthplot")}
            gt_cols = [("user_id", "VARCHAR(100)"), ("organization_id", "VARCHAR(100)")]
            with engine.begin() as conn:
                for col_name, col_type in gt_cols:
                    if col_name not in existing_gt_cols:
                        conn.execute(text(f"ALTER TABLE carbon_mrv_groundtruthplot ADD COLUMN {col_name} {col_type}"))
    except Exception as e:
        print(f"[DB Init Warning] Schema check/migration error: {e}")

def get_db():
    """
    FastAPI dependency that provides a transactional database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
