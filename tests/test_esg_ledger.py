"""
Ledger API tests: the customer journey from facility setup to a locked, reproducible report, plus
adversarial cases (double counting, self-approval, locks, factor changes, tenant isolation).
Factor values are TEST fixtures, not published factors.

Run against PostgreSQL + Alembic by setting ESG_TEST_DATABASE_URL (see docs/esg/TEST_EVIDENCE.md).
"""
import datetime as dt
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from sqlalchemy.exc import IntegrityError  # noqa: E402
from esg_rag.ledger_models import ActivityRecord  # noqa: E402

API = "/api/esg"


class LedgerTestCase(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.add_member(self.org_a, "admin-a", "esg_admin")
        self.add_member(self.org_a, "contrib-a", "data_contributor")
        self.add_member(self.org_a, "viewer-a", "executive_viewer")
        self.le = self.post("user-a", "/legal-entities", {"name": "Alpha Textiles Ltd", "country": "BD"})["id"]
        self.fac = self.post("user-a", "/facilities", {"legal_entity_id": self.le, "name": "Savar Plant",
                                                      "country": "BD", "grid_region": "TEST-GRID"})["id"]
        self.period = self.post("user-a", "/periods", {"name": "FY2025", "start_date": "2025-01-01",
                                                       "end_date": "2025-12-31",
                                                       "boundary_method": "operational_control"})["id"]
        self.grid = self.factor("grid", "electricity", "kWh", "0.5", "location")
        self.diesel = self.factor("diesel", "diesel", "L", "2.7", "direct")

    def call(self, method, sub, path, body=None, status=None, org=None):
        res = self.client.request(method, API + path, json=body, headers=auth(sub, org))
        if status is not None:
            self.assertEqual(res.status_code, status, res.text)
        return res

    def post(self, sub, path, body=None, status=None):
        res = self.call("POST", sub, path, body)
        self.assertLess(res.status_code, 300, res.text) if status is None else self.assertEqual(res.status_code, status, res.text)
        return res.json()

    def factor(self, family, activity_type, unit, value, method, author="user-a", approver="admin-a", **extra):
        body = {"family": family, "activity_type": activity_type, "unit": unit, "kgco2e_per_unit": value,
                "region": "TEST-GRID", "gwp_basis": "AR5", "method": method, "valid_from": "2024-01-01",
                "source_publisher": "TEST FIXTURE", "source_document": "Not a real factor", "source_year": 2024, **extra}
        fid = self.post(author, "/factors", body)["id"]
        self.post(approver, f"/factors/{fid}/approve")
        return fid

    def activity(self, sub="contrib-a", **kw):
        body = {"facility_id": self.fac, "period_id": self.period, "activity_type": "electricity",
                "quantity": "12345", "unit": "kWh", "activity_start": "2025-01-01", "activity_end": "2025-01-31",
                "source_type": "manual", **kw}
        return self.call("POST", sub, "/activities", body)

    def approved(self, **kw):
        rec = self.activity(**kw).json()
        self.post("contrib-a", f"/activities/{rec['id']}/submit")
        return self.post("user-a", f"/activities/{rec['id']}/approve")


class JourneyTest(LedgerTestCase):
    def test_journey_to_locked_reproducible_report(self):
        elec = self.approved()
        self.approved(activity_type="diesel", quantity="1", unit="kL", meter_ref="GEN-1")

        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(run["scope2_location_kg"], "6172.500000")
        self.assertEqual(run["scope1_kg"], "2700.000000")
        self.assertIsNone(run["scope2_market_kg"])  # no market-based input → not invented
        trace = self.call("GET", "viewer-a", f"/calculations/{run['id']}", status=200).json()
        self.assertIn(elec["id"], {l["activity_id"] for l in trace["lines"]})
        self.assertIn("12345.0000000000 kWh × 0.5000000000", trace["lines"][0]["formula"] + trace["lines"][1]["formula"])

        self.call("POST", "contrib-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]}, status=403)
        snap = self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})

        first = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=json", status=200)
        self.assertEqual(first.headers["x-content-sha256"], snap["content_sha256"])
        csv1 = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=csv", status=200).text
        report = first.json()
        self.assertEqual(report["totals_tco2e"]["scope2_location_based"], "6.173")
        self.assertEqual(report["totals_tco2e"]["scope2_market_based_status"], "MISSING_INPUTS")
        self.assertEqual(report["totals_tco2e"]["scope3_status"], "NOT_INCLUDED")
        self.assertIn("Not externally assured or verified.", report["disclaimers"][0])
        self.assertNotRegex(first.text.lower(), r"\bcompliant\b|\baudited\b")

        # A new factor version after locking must not change the locked report.
        self.factor("grid", "electricity", "kWh", "0.9", "location")
        self.assertEqual(self.activity(activity_start="2025-02-01", activity_end="2025-02-28").status_code, 409)
        self.call("POST", "contrib-a", f"/periods/{self.period}/calculate", status=409)
        again = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=json", status=200)
        self.assertEqual(again.content, first.content)
        self.assertEqual(self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=csv").text, csv1)

        # Controlled restatement: new revision, old snapshot retained unchanged.
        self.call("POST", "user-a", f"/periods/{self.period}/restate", {"reason": ""}, status=422)
        self.post("user-a", f"/periods/{self.period}/restate", {"reason": "Updated grid factor published"})
        run2 = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(run2["scope2_location_kg"], "11110.500000")
        snap2 = self.post("admin-a", f"/periods/{self.period}/lock", {"calculation_run_id": run2["id"]})
        snaps = self.call("GET", "viewer-a", f"/periods/{self.period}/snapshots", status=200).json()
        self.assertEqual([s["revision"] for s in snaps], [1, 2])
        self.assertEqual(self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export").content, first.content)
        self.assertNotEqual(snap2["content_sha256"], snap["content_sha256"])

        actions = [e["action"] for e in self.call("GET", "user-a", "/audit-events?limit=200", status=200).json()["items"]]
        for a in ("facility.create", "factor.approve", "activity.approve", "calculation.run", "period.lock", "period.restate"):
            self.assertIn(a, actions)
        self.call("GET", "contrib-a", "/audit-events", status=403)


class WorkflowRulesTest(LedgerTestCase):
    def test_double_counting_rejected(self):
        self.assertEqual(self.activity().status_code, 200)
        dup = self.activity(quantity="999", activity_start="2025-01-15", activity_end="2025-02-14")
        self.assertEqual(dup.status_code, 409)
        self.assertIn("double counting", dup.json()["detail"])
        self.assertEqual(self.activity(meter_ref="SUBMETER-2").status_code, 200)
        self.assertEqual(self.activity(activity_start="2025-02-01", activity_end="2025-02-28").status_code, 200)

    def test_retry_with_idempotency_key_creates_one_record(self):
        a = self.activity(idempotency_key="import-42-row-7").json()
        b = self.activity(idempotency_key="import-42-row-7").json()
        self.assertEqual(a["id"], b["id"])
        self.assertTrue(a["created"])
        self.assertFalse(b["created"])

    def test_units_normalised_or_rejected(self):
        rec = self.activity(quantity="1.5", unit="MWh").json()
        self.assertEqual((rec["quantity"], rec["unit"], rec["quantity_raw"], rec["unit_raw"]),
                         ("1500.0000000000", "kWh", "1.5000000000", "MWh"))
        self.assertEqual(self.activity(activity_type="diesel", unit="kWh", meter_ref="x").status_code, 422)
        self.assertEqual(self.activity(activity_type="moonbeams", meter_ref="y").status_code, 422)
        self.assertEqual(self.activity(quantity="-1", meter_ref="z").status_code, 422)
        self.assertEqual(self.activity(activity_start="2026-01-01", activity_end="2026-01-31").status_code, 422)

    def test_separation_of_duties(self):
        own = self.activity(sub="user-a").json()
        self.post("user-a", f"/activities/{own['id']}/submit")
        self.call("POST", "user-a", f"/activities/{own['id']}/approve", status=403)
        rec = self.activity(meter_ref="m2").json()
        self.post("contrib-a", f"/activities/{rec['id']}/submit")
        self.call("POST", "contrib-a", f"/activities/{rec['id']}/approve", status=403)  # contributor lacks review
        self.call("POST", "viewer-a", "/facilities", {"legal_entity_id": self.le, "name": "x", "country": "BD",
                                                      "grid_region": "g"}, status=403)
        fid = self.post("user-a", "/factors", {"family": "self", "activity_type": "lpg", "unit": "kg",
                                               "kgco2e_per_unit": "3", "region": "TEST-GRID", "gwp_basis": "AR5",
                                               "method": "direct", "valid_from": "2024-01-01",
                                               "source_publisher": "T", "source_document": "T", "source_year": 2024})["id"]
        self.call("POST", "user-a", f"/factors/{fid}/approve", status=403)

    def test_second_approval_does_not_corrupt_state(self):
        rec = self.activity().json()
        self.post("contrib-a", f"/activities/{rec['id']}/submit")
        self.post("user-a", f"/activities/{rec['id']}/approve")
        self.call("POST", "admin-a", f"/activities/{rec['id']}/approve", status=409)
        self.call("POST", "admin-a", f"/activities/{rec['id']}/reject", {"comment": "late"}, status=409)

    def test_post_approval_change_requires_superseding_record(self):
        old = self.approved()
        self.call("PATCH", "contrib-a", f"/activities/{old['id']}", {"quantity": "1"}, status=409)
        new = self.activity(quantity="12000", supersedes_id=old["id"]).json()
        self.post("contrib-a", f"/activities/{new['id']}/submit")
        self.post("user-a", f"/activities/{new['id']}/approve")
        rows = {r["id"]: r for r in self.call("GET", "viewer-a", f"/activities?period_id={self.period}").json()["items"]}
        self.assertEqual(rows[old["id"]]["status"], "SUPERSEDED")
        self.assertEqual(rows[old["id"]]["quantity"], "12345.0000000000")  # history retained
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(run["scope2_location_kg"], "6000.000000")

    def test_rejected_record_edit_keeps_audit_of_original(self):
        rec = self.activity().json()
        self.post("contrib-a", f"/activities/{rec['id']}/submit")
        self.call("POST", "user-a", f"/activities/{rec['id']}/reject", {}, status=422)
        self.post("user-a", f"/activities/{rec['id']}/reject", {"comment": "Wrong meter"})
        self.call("PATCH", "contrib-a", f"/activities/{rec['id']}", {"quantity": "12000"}, status=200)
        events = self.call("GET", "user-a", f"/audit-events?entity_id={rec['id']}").json()["items"]
        update = next(e for e in events if e["action"] == "activity.update")
        self.assertEqual(update["data"]["before"]["quantity_raw"], "12345.0000000000")
        self.assertEqual(update["data"]["after"]["quantity"], "12000")

    def test_lock_preconditions(self):
        self.approved()
        draft = self.activity(meter_ref="m2").json()
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.call("POST", "user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]}, status=409)
        self.post("contrib-a", f"/activities/{draft['id']}/submit")
        self.post("user-a", f"/activities/{draft['id']}/approve")
        # Data changed after the run → stale run cannot be locked.
        self.call("POST", "user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]}, status=409)
        run2 = self.post("contrib-a", f"/periods/{self.period}/calculate")
        # Preparer cannot approve their own calculation.
        self.add_member(self.org_a, "admin-b", "esg_admin")
        own_run = self.post("admin-b", f"/periods/{self.period}/calculate")
        self.call("POST", "admin-b", f"/periods/{self.period}/lock", {"calculation_run_id": own_run["id"]}, status=403)
        self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run2["id"]})

    def test_missing_factor_blocks_lock(self):
        self.approved(activity_type="lpg", quantity="10", unit="kg")
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertTrue(run["blocking"])
        self.assertEqual(run["exceptions"][0]["code"], "MISSING_FACTOR")
        self.assertEqual(run["scope1_kg"], "0.000000")
        self.call("POST", "user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]}, status=409)

    def test_market_based_separate_and_solar_export_not_netted(self):
        ppa = self.factor("ppa", "electricity", "kWh", "0.1", "market")
        self.approved(market_factor_id=ppa)
        self.approved(activity_type="electricity_export", quantity="5000", meter_ref="EXPORT")
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(run["scope2_location_kg"], "6172.500000")
        self.assertEqual(run["scope2_market_kg"], "1234.500000")
        self.assertEqual(run["memo"], {"electricity_export": "5000.0000000000"})

    def test_factor_validation(self):
        base = {"family": "bad", "region": "R", "gwp_basis": "AR5", "valid_from": "2024-01-01",
                "source_publisher": "T", "source_document": "T", "source_year": 2024, "kgco2e_per_unit": "1"}
        self.call("POST", "user-a", "/factors", {**base, "activity_type": "diesel", "unit": "L", "method": "location"}, status=422)
        self.call("POST", "user-a", "/factors", {**base, "activity_type": "diesel", "unit": "kg", "method": "direct"}, status=422)
        self.call("POST", "user-a", "/factors", {**base, "activity_type": "diesel", "unit": "L", "method": "direct",
                                                 "family": "../x"}, status=422)
        self.call("POST", "user-a", "/factors?platform_wide=true", {**base, "activity_type": "diesel", "unit": "L",
                                                                     "method": "direct"}, status=403)

    def test_equity_share_rollup(self):
        p = self.post("user-a", "/periods", {"name": "FY2025-equity", "start_date": "2025-01-01",
                                             "end_date": "2025-12-31", "boundary_method": "equity_share"})["id"]
        jv = self.post("user-a", "/facilities", {"legal_entity_id": self.le, "name": "JV Mill", "country": "BD",
                                                 "grid_region": "TEST-GRID", "operational_control": False,
                                                 "equity_share_pct": "40"})["id"]
        for fac in (self.fac, jv):
            self.approved(period_id=p, facility_id=fac, activity_type="diesel", quantity="1000", unit="L")
        run = self.post("contrib-a", f"/periods/{p}/calculate")
        self.assertEqual(run["scope1_kg"], "3780.000000")  # 2700 + 40% × 2700


@unittest.skipUnless(os.environ.get("ESG_TEST_DATABASE_URL"), "needs PostgreSQL for real concurrency")
class ConcurrencyTest(LedgerTestCase):
    def test_concurrent_approvals_single_winner(self):
        import threading
        from esg_rag import ledger
        from esg_rag.auth import Principal
        self.add_member(self.org_a, "admin-c", "esg_admin")
        rec = self.activity().json()
        self.post("contrib-a", f"/activities/{rec['id']}/submit")
        results, barrier = [], threading.Barrier(2)

        def approve(sub):
            db = self.Session()
            p = Principal(sub=sub, organization_id=self.org_a, role="esg_admin", is_demo=False, is_platform_operator=False)
            barrier.wait()
            try:
                ledger.review_activity(db, p, rec["id"], True, None)
                results.append("ok")
            except ledger.DomainError as e:
                results.append(e.status)
            finally:
                db.close()

        threads = [threading.Thread(target=approve, args=(s,)) for s in ("admin-a", "admin-c")]
        [t.start() for t in threads]
        [t.join() for t in threads]
        self.assertEqual(sorted(results, key=str), [409, "ok"])
        events = self.call("GET", "user-a", f"/audit-events?entity_id={rec['id']}").json()["items"]
        self.assertEqual([e["action"] for e in events].count("activity.approve"), 1)


class ReferenceEndpointsTest(LedgerTestCase):
    def test_me_activity_types_and_period_calculations(self):
        self.assertEqual(self.call("GET", "contrib-a", "/me", status=200).json()["sub"], "contrib-a")
        types = self.call("GET", "viewer-a", "/activity-types", status=200).json()
        elec = next(t for t in types["inventory"] if t["activity_type"] == "electricity")
        self.assertEqual((elec["scope"], elec["canonical_unit"]), ("2", "kWh"))
        self.assertIn("MWh", elec["accepted_units"])
        gas = next(t for t in types["inventory"] if t["activity_type"] == "natural_gas")
        self.assertEqual(gas["accepted_units"], ["m3"])
        self.approved()
        first = self.post("contrib-a", f"/periods/{self.period}/calculate")
        second = self.post("admin-a", f"/periods/{self.period}/calculate")
        listed = self.call("GET", "viewer-a", f"/periods/{self.period}/calculations", status=200).json()
        self.assertEqual([r["id"] for r in listed["items"]][:2], [second["id"], first["id"]])
        self.assertEqual(self.call("GET", "user-b", f"/periods/{self.period}/calculations").json()["total"], 0)


class LedgerIsolationTest(LedgerTestCase):
    def test_other_tenant_cannot_see_or_reference_records(self):
        rec = self.approved()
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        snap = self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})
        for path in (f"/calculations/{run['id']}", f"/snapshots/{snap['id']}/export"):
            self.call("GET", "user-b", path, status=404)
        for path in ("/facilities", "/periods", "/activities", "/legal-entities"):
            self.assertEqual(self.call("GET", "user-b", path).json()["total"], 0)
        self.assertNotIn(self.grid, [f["id"] for f in self.call("GET", "user-b", "/factors").json()["items"]])
        self.assertEqual(self.call("GET", "user-b", f"/periods/{self.period}/snapshots").json(), [])
        self.call("POST", "user-b", f"/activities/{rec['id']}/approve", status=404)
        self.call("POST", "user-b", f"/periods/{self.period}/restate", {"reason": "x"}, status=404)

        le_b = self.post("user-b", "/legal-entities", {"name": "B Ltd", "country": "BD"})["id"]
        fac_b = self.post("user-b", "/facilities", {"legal_entity_id": le_b, "name": "B", "country": "BD",
                                                    "grid_region": "TEST-GRID"})["id"]
        p_b = self.post("user-b", "/periods", {"name": "FY2025", "start_date": "2025-01-01", "end_date": "2025-12-31",
                                               "boundary_method": "operational_control"})["id"]
        body = {"facility_id": self.fac, "period_id": p_b, "activity_type": "electricity", "quantity": "1",
                "unit": "kWh", "activity_start": "2025-01-01", "activity_end": "2025-01-31"}
        self.call("POST", "user-b", "/activities", body, status=404)  # A's facility
        self.call("POST", "user-b", "/activities", {**body, "facility_id": fac_b, "factor_id": self.grid}, status=422)
        self.call("POST", "user-b", "/facilities", {"legal_entity_id": self.le, "name": "x", "country": "BD",
                                                    "grid_region": "g"}, status=404)

    def test_database_rejects_cross_tenant_reference(self):
        db = self.Session()
        db.add(ActivityRecord(organization_id=self.org_b, facility_id=self.fac, period_id=self.period,
                              activity_type="electricity", quantity_raw=1, unit_raw="kWh", quantity=1, unit="kWh",
                              activity_start=dt.date(2025, 1, 1), activity_end=dt.date(2025, 1, 2), source_type="manual",
                              created_by="attacker"))
        with self.assertRaises(IntegrityError):
            db.commit()
        db.rollback()
        db.close()


if __name__ == "__main__":
    unittest.main()
