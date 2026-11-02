"""
Test runs never touch a developer or production database. Importing this module points DATABASE_URL at a fresh
temporary SQLite file before carbon_monitoring.database creates its engine.

Without it the dMRV tests bound the default engine to backend/db.sqlite3, the developer database: every run added
rows there, and a run on 2026-11-02 left the file malformed.
"""
import os
import tempfile

os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(tempfile.mkdtemp(prefix="carbonos-test-db-"), "test.sqlite3")
