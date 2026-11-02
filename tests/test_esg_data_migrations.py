"""
Data migration: retire the withdrawn 0.55 kg CO2e/kWh legacy grid factor. Dry run first; never delete or overwrite.
Rows are TEST fixtures shaped like the legacy esg_emission_factors table, in a temporary SQLite file.
"""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402  (configures the environment first)
from sqlalchemy import create_engine, text  # noqa: E402
from esg_rag.data_migrations import retire_withdrawn_grid_factor as mig  # noqa: E402
from esg_rag.database import upgrade  # noqa: E402
from esg_rag.models import EmissionFactorRecord  # noqa: E402

# The legacy table as create_all made it before migration 0005 (no lifecycle columns).
OLD_SCHEMA = ("CREATE TABLE esg_emission_factors (id VARCHAR(36) PRIMARY KEY, category VARCHAR(50) NOT NULL, "
              "fuel_or_activity VARCHAR(100) NOT NULL, region VARCHAR(100), factor_value FLOAT NOT NULL, "
              "unit VARCHAR(50) NOT NULL, source_citation VARCHAR(255) NOT NULL, year INTEGER, "
              "confidence_rating VARCHAR(20), created_at DATETIME)")
ROWS = [("grid-055", "Scope 2", "Grid Electricity (Location-based)", 0.55, "kg CO2e / kWh", "TEST withdrawn citation"),
        ("grid-061", "Scope 2", "Grid Electricity (Operating Margin)", 0.612, "kg CO2e / kWh", "TEST other grid row"),
        ("diesel-1", "Scope 1", "Diesel (Stationary)", 2.68, "kg CO2e / L", "TEST fuel row")]


def legacy_db(upgraded=True):
    url = "sqlite:///" + os.path.join(tempfile.mkdtemp(prefix="esg-datamig-"), "legacy.sqlite3")
    engine = create_engine(url)
    with engine.begin() as conn:
        conn.execute(text(OLD_SCHEMA))
        for r in ROWS:
            conn.execute(text("INSERT INTO esg_emission_factors (id, category, fuel_or_activity, region, factor_value, "
                              "unit, source_citation, year, confidence_rating) VALUES (:id, :c, :f, 'Bangladesh', :v, "
                              ":u, :s, 2023, 'UNVERIFIED')"),
                         dict(zip(("id", "c", "f", "v", "u", "s"), r)))
    if upgraded:
        upgrade(url)  # migration 0005 adds the nullable lifecycle columns to the existing table
    return url, engine


def row(engine, id):
    with engine.connect() as conn:
        return conn.execute(text("SELECT * FROM esg_emission_factors WHERE id = :id"), {"id": id}).mappings().one()


class RetireWithdrawnGridFactorTest(unittest.TestCase):
    def setUp(self):
        self.url, self.engine = legacy_db()
        self.addCleanup(self.engine.dispose)
        self.lines = []

    def test_dry_run_lists_the_row_and_writes_nothing(self):
        self.assertEqual(mig.run(self.url, out=self.lines.append), 0)
        report = "\n".join(self.lines)
        self.assertIn("DRY RUN (nothing is written)", report)
        self.assertIn("Rows to retire: 1", report)
        self.assertIn("grid-055", report)
        self.assertIn("NULL -> RETIRED", report)
        self.assertIn("left unchanged): 1", report)  # the 0.612 row is not covered by the approval
        self.assertIsNone(row(self.engine, "grid-055")["status"])

    def test_apply_retires_with_a_reason_citing_the_branch_and_is_idempotent(self):
        self.assertEqual(mig.run(self.url, apply=True, actor="repo-owner", out=self.lines.append), 0)
        r = row(self.engine, "grid-055")
        self.assertEqual((r["status"], r["status_changed_by"]), ("RETIRED", "repo-owner"))
        self.assertIn("esg/bd-scope12-verifier-inventory", r["status_reason"])
        self.assertEqual((r["factor_value"], r["source_citation"]), (0.55, "TEST withdrawn citation"))  # not overwritten
        self.assertIsNone(row(self.engine, "grid-061")["status"])
        self.assertIsNone(row(self.engine, "diesel-1")["status"])
        with self.engine.connect() as conn:
            audit = conn.execute(text("SELECT actor_sub, action, entity_id FROM esg_audit_event")).all()
        self.assertEqual([tuple(a) for a in audit], [("repo-owner", "legacy_factor.retire", "grid-055")])

        again = []
        self.assertEqual(mig.run(self.url, apply=True, actor="repo-owner", out=again.append), 0)
        self.assertIn("Nothing to do.", again)
        with self.engine.connect() as conn:
            self.assertEqual(conn.execute(text("SELECT COUNT(*) FROM esg_audit_event")).scalar_one(), 1)

    def test_apply_needs_an_actor(self):
        self.assertEqual(mig.run(self.url, apply=True, out=self.lines.append), 2)
        self.assertIsNone(row(self.engine, "grid-055")["status"])

    def test_apply_refuses_before_the_schema_upgrade(self):
        url, engine = legacy_db(upgraded=False)
        self.addCleanup(engine.dispose)
        self.assertEqual(mig.run(url, out=self.lines.append), 0)  # the dry run still reports the row
        self.assertIn("MISSING (status, status_reason, status_changed_at, status_changed_by)", "\n".join(self.lines))
        self.assertEqual(mig.run(url, apply=True, actor="repo-owner", out=self.lines.append), 2)
        with engine.connect() as conn:
            cols = [c[1] for c in conn.execute(text("PRAGMA table_info(esg_emission_factors)"))]
        self.assertNotIn("status", cols)  # the data migration never changes the schema itself


class LegacyFactorEndpointTest(ESGApiTestCase):
    def test_retired_rows_are_left_out_unless_asked_for(self):
        db = self.Session()
        db.add_all([EmissionFactorRecord(id="active-1", category="Scope 1", fuel_or_activity="Diesel", region="Bangladesh",
                                         factor_value=2.68, unit="kg CO2e / L", source_citation="TEST"),
                    EmissionFactorRecord(id="retired-1", category="Scope 2", fuel_or_activity="Grid Electricity",
                                         region="Bangladesh", factor_value=0.55, unit="kg CO2e / kWh",
                                         source_citation="TEST", status="RETIRED", status_reason="TEST withdrawn")])
        db.commit()
        db.close()
        rows = self.client.get("/api/esg/emission-factors", headers=auth("user-a")).json()
        self.assertEqual([r["id"] for r in rows], ["active-1"])
        rows = self.client.get("/api/esg/emission-factors?include_retired=true", headers=auth("user-a")).json()
        self.assertEqual(sorted((r["id"], r["status"]) for r in rows), [("active-1", "ACTIVE"), ("retired-1", "RETIRED")])


if __name__ == "__main__":
    unittest.main()
