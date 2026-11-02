"""
Ledger API tests: the customer journey from facility setup to a locked, reproducible report, plus
adversarial cases (double counting, self-approval, locks, factor changes, tenant isolation).
Factor values are TEST fixtures, not published factors.

Run against PostgreSQL + Alembic by setting ESG_TEST_DATABASE_URL (see docs/esg/TEST_EVIDENCE.md).
"""
import datetime as dt
import os
from decimal import Decimal
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from sqlalchemy.exc import IntegrityError  # noqa: E402
from esg_rag.ledger_models import ActivityRecord, EmissionFactor  # noqa: E402

API = "/api/esg"
DEFAULT_KIND = {("electricity", "location"): "grid_average", ("electricity", "market"): "supplier_specific"}


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
                "region": "TEST-GRID", "gwp_basis": "AR6", "method": method, "valid_from": "2024-01-01",
                "factor_kind": DEFAULT_KIND.get((activity_type, method)),
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


class FactorKindTest(LedgerTestCase):
    """Regression: location-based Scope 2 is the grid AVERAGE rate; a CDM combined margin can never
    reach Scope 2 through the API, the ORM schema or the migrated schema."""
    BASE = {"family": "kind", "activity_type": "electricity", "unit": "kWh", "kgco2e_per_unit": "0.55",
            "region": "TEST-GRID", "valid_from": "2024-01-01", "source_publisher": "T", "source_document": "T",
            "source_year": 2024}

    def test_api_rejects_margin_and_undeclared_kinds(self):
        for method in ("location", "market"):
            res = self.call("POST", "user-a", "/factors", {**self.BASE, "method": method,
                                                           "factor_kind": "grid_combined_margin"}, status=422)
            self.assertIn("combined-margin", res.json()["detail"])
        self.call("POST", "user-a", "/factors", {**self.BASE, "method": "location"}, status=422)
        self.call("POST", "user-a", "/factors", {**self.BASE, "method": "location", "factor_kind": "residual_mix"},
                  status=422)
        self.call("POST", "user-a", "/factors", {**self.BASE, "activity_type": "diesel", "unit": "L",
                                                 "method": "direct", "factor_kind": "grid_average"}, status=422)
        created = self.post("user-a", "/factors", {**self.BASE, "method": "location", "factor_kind": "grid_average"})
        self.assertEqual((created["factor_kind"], created["gwp_basis"]), ("grid_average", "AR6"))  # AR6 default

    def test_database_rejects_margin_factor_for_scope2(self):
        for activity_type, method, kind in (("electricity", "location", "grid_combined_margin"),
                                            ("electricity", "market", "grid_combined_margin"),
                                            ("electricity", "location", "residual_mix"),
                                            ("diesel", "direct", "grid_average")):
            db = self.Session()
            db.add(EmissionFactor(organization_id=self.org_a, family=f"raw-{method}-{kind}", version=1,
                                  activity_type=activity_type, unit="kWh", kgco2e_per_unit=1, region="R",
                                  gwp_basis="AR6", method=method, factor_kind=kind, valid_from=dt.date(2024, 1, 1),
                                  source_publisher="T", source_document="T", source_year=2024, created_by="raw-sql"))
            with self.assertRaises(IntegrityError, msg=f"{activity_type}/{method}/{kind}"):
                db.commit()
            db.rollback()
            db.close()


class Scope1LedgerTest(LedgerTestCase):
    """Step 2 through the API: gas on an energy basis, refrigerant mass balance, captive generation and
    data quality. Factor values are TEST fixtures (gas mirrors IPCC 2006 Vol. 2 Table 2.3 per GJ)."""
    HV = {"gcv": "38.0", "gcv_unit": "MJ/m3", "ncv_to_gcv": "0.9", "reference_conditions": "15 C, 101.325 kPa",
          "source": "TEST certificate", "uncertainty_pct": "1"}
    GAS = {"family": "gas-gj", "activity_type": "natural_gas", "unit": "GJ", "region": "TEST-GRID", "gwp_basis": "AR6",
           "method": "direct", "valid_from": "2024-01-01", "source_publisher": "TEST", "source_document": "TEST",
           "source_year": 2024, "gas_components": [{"gas": "CO2", "kg_per_unit": "56.1", "uncertainty_pct": "3.92"},
                                                   {"gas": "CH4_fossil", "kg_per_unit": "0.001", "uncertainty_pct": "200"},
                                                   {"gas": "N2O", "kg_per_unit": "0.0001", "uncertainty_pct": "200"}]}

    def test_gas_on_energy_basis_with_quality_and_uncertainty(self):
        f = self.post("user-a", "/factors", self.GAS)
        self.assertEqual(f["kgco2e_per_unit"], "56.1571000000")  # computed from gases at AR6, never typed in
        self.post("admin-a", f"/factors/{f['id']}/approve")
        self.approved(activity_type="natural_gas", quantity="10000", unit="m3", heating_value=self.HV,
                      data_quality="billed", meter_ref="GAS-1")
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual((run["scope1_kg"], run["gwp_basis"], run["blocking"]), ("19205.728200", "AR6", False))
        line = self.call("GET", "viewer-a", f"/calculations/{run['id']}", status=200).json()["lines"][0]
        self.assertEqual((line["data_quality"], Decimal(line["details"]["energy_gj_ncv"])), ("billed", Decimal(342)))
        self.assertGreater(float(run["uncertainty"]["scope1"]["uncertainty_pct"]), 4)

        self.approved(activity_type="natural_gas", quantity="500", unit="m3", meter_ref="GAS-2", data_quality="billed")
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertIn("MISSING_HEATING_VALUE", [e["code"] for e in run["exceptions"]])
        self.assertTrue(run["blocking"])

    def test_factor_inputs_are_validated(self):
        self.call("POST", "user-a", "/factors", {**self.GAS, "kgco2e_per_unit": "50"}, status=422)
        self.call("POST", "user-a", "/factors", {**self.GAS, "gas_components": self.GAS["gas_components"] * 2}, status=422)
        self.call("POST", "user-a", "/factors", {**self.GAS, "activity_type": "diesel"}, status=422)  # GJ is gas-only
        self.call("POST", "user-a", "/factors", {**self.GAS, "activity_type": "refrigerant", "unit": "kg",
                                                 "gas_components": None, "kgco2e_per_unit": "2000"}, status=422)
        self.call("POST", "user-a", "/factors", {**self.GAS, "gas_components": None}, status=422)

    def test_refrigerant_quantity_comes_from_the_mass_balance(self):
        mb = {"opening_kg": "100", "purchased_kg": "30", "recovered_kg": "5", "closing_kg": "110"}
        rec = self.approved(activity_type="refrigerant", quantity="0", unit="kg", refrigerant="R-410A", mass_balance=mb,
                            data_quality="metered", meter_ref="CHILLER-1")
        self.assertEqual(rec["quantity"], "15.0000000000")
        bad = {**mb, "closing_kg": "500"}
        self.assertEqual(self.activity(activity_type="refrigerant", unit="kg", refrigerant="R-410A", mass_balance=bad,
                                       meter_ref="C2").status_code, 422)
        self.assertEqual(self.activity(activity_type="refrigerant", unit="kg", refrigerant="R-999", mass_balance=mb,
                                       meter_ref="C3").status_code, 422)
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        line = self.call("GET", "viewer-a", f"/calculations/{run['id']}").json()["lines"][0]
        self.assertEqual((run["scope1_kg"], line["factor_id"], line["factor_ref"]),
                         ("33832.500000", None, "IPCC AR6 GWP-100 R-410A"))

    def generator(self, ref, facility=None, status=201):
        return self.call("POST", "user-a", "/equipment", {"facility_id": facility or self.fac, "equipment_ref": ref,
                                                          "kind": "generator", "fuel": "diesel"}, status=status)

    def test_captive_generator_kwh_cannot_also_be_grid_electricity(self):
        self.generator("G1")
        self.assertEqual(self.activity(activity_type="captive_generation_output", quantity="3500", meter_ref="GEN-1",
                                       generator_ref="G1").status_code, 200)
        dup = self.activity(quantity="3500", meter_ref="GEN-1")
        self.assertEqual(dup.status_code, 409)
        self.assertIn("double counting", dup.json()["detail"])
        self.assertEqual(self.activity(meter_ref="GRID-9", generator_ref="G1").status_code, 422)
        self.assertEqual(self.activity(meter_ref="GRID-1").status_code, 200)

    def test_generator_refs_are_unique_per_facility(self):
        other = self.post("user-a", "/facilities", {"legal_entity_id": self.le, "name": "Gazipur Plant",
                                                     "country": "BD", "grid_region": "TEST-GRID"})["id"]
        self.generator("G1")
        self.generator("G1", facility=other)  # the same reference at another facility is another generator
        self.assertIn("already registered", self.generator("G1", status=409).json()["detail"])
        self.call("POST", "contrib-a", "/equipment", {"facility_id": self.fac, "equipment_ref": "G2",
                                                      "kind": "generator"}, status=403)  # register is admin data
        listed = self.call("GET", "viewer-a", f"/equipment?facility_id={other}", status=200).json()
        self.assertEqual([e["equipment_ref"] for e in listed["items"]], ["G1"])

        fuel = dict(activity_type="diesel", quantity="100", unit="L", meter_ref="TANK-1")
        self.assertEqual(self.activity(generator_ref="G7", **fuel).status_code, 422)  # not registered here
        self.assertEqual(self.activity(generator_ref="G1", **fuel).status_code, 200)
        self.assertEqual(self.activity(activity_type="refrigerant", unit="kg", refrigerant="R-410A", meter_ref="AC-1",
                                       generator_ref="G1").status_code, 422)  # generators link fuel and output only

    def test_locked_export_carries_quality_columns(self):
        self.approved(data_quality="billed")
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        snap = self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})
        csv_text = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=csv", status=200).text
        header = next(l for l in csv_text.splitlines() if l.startswith("activity_id,"))
        self.assertTrue(header.endswith("data_quality,uncertainty_pct"))
        report = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=json").json()
        self.assertEqual((report["gwp_basis"], report["lines"][0]["data_quality"]), ("AR6", "billed"))
        self.assertIn("scope1", report["uncertainty"])

    def test_run_mixing_refrigerant_and_factored_lines_locks(self):
        mb = {"opening_kg": "100", "purchased_kg": "30", "recovered_kg": "5", "closing_kg": "110"}
        self.approved(activity_type="refrigerant", quantity="0", unit="kg", refrigerant="R-410A", mass_balance=mb,
                      data_quality="metered", meter_ref="CHILLER-1")
        self.approved(data_quality="billed")
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        snap = self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})
        report = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=json", status=200).json()
        self.assertEqual(len(report["factors_used"]), 1)  # the refrigerant line uses pinned GWPs, not a factor row

    def test_biomass_factor_must_be_gas_level(self):
        body = {**self.GAS, "activity_type": "wood", "unit": "kg", "gas_components": None, "kgco2e_per_unit": "1.8"}
        self.call("POST", "user-a", "/factors", body, status=422)

    def test_period_gwp_basis_must_match_factors(self):
        p = self.post("user-a", "/periods", {"name": "FY2025-AR5", "start_date": "2025-01-01", "end_date": "2025-12-31",
                                             "boundary_method": "operational_control", "gwp_basis": "AR5"})["id"]
        self.approved(period_id=p, data_quality="billed")
        run = self.post("contrib-a", f"/periods/{p}/calculate")
        self.assertIn("MIXED_GWP_BASIS", [e["code"] for e in run["exceptions"]])  # AR6 test factors, AR5 period


class MigrationConstraintTest(unittest.TestCase):
    def test_migrated_schema_rejects_margin_factor_for_scope2(self):
        import tempfile
        from sqlalchemy import create_engine, text
        from esg_rag.database import upgrade
        url = "sqlite:///" + os.path.join(tempfile.mkdtemp(prefix="esg-migration-"), "esg.sqlite3")
        upgrade(url)
        engine = create_engine(url)
        insert = text(
            "INSERT INTO esg_emission_factor (id, family, version, activity_type, unit, kgco2e_per_unit, region, "
            "gwp_basis, method, factor_kind, valid_from, source_publisher, source_document, source_year, is_custom, "
            "status, created_by, created_at) VALUES (:id, :id, 1, 'electricity', 'kWh', 0.5, 'R', 'AR6', :method, "
            ":kind, '2024-01-01', 'T', 'T', 2024, 0, 'DRAFT', 'u', '2024-01-01 00:00:00')")
        with engine.begin() as conn:
            conn.execute(insert, {"id": "average", "method": "location", "kind": "grid_average"})
        for method in ("location", "market"):
            with self.assertRaises(IntegrityError, msg=method):
                with engine.begin() as conn:
                    conn.execute(insert, {"id": f"cm-{method}", "method": method, "kind": "grid_combined_margin"})
        engine.dispose()

    def test_migrated_schema_keeps_equipment_refs_unique_per_facility(self):
        import tempfile
        from sqlalchemy import create_engine, text
        from esg_rag.database import upgrade
        url = "sqlite:///" + os.path.join(tempfile.mkdtemp(prefix="esg-migration-"), "esg.sqlite3")
        upgrade(url)
        engine = create_engine(url)
        insert = text("INSERT INTO esg_equipment (id, organization_id, facility_id, equipment_ref, kind, created_by, "
                      "created_at) VALUES (:id, 'org', :fac, 'G1', 'generator', 'u', '2024-01-01 00:00:00')")
        with engine.begin() as conn:
            conn.execute(insert, {"id": "e1", "fac": "fac-1"})
            conn.execute(insert, {"id": "e2", "fac": "fac-2"})  # same reference, other facility
            cols = [r[1] for r in conn.execute(text("PRAGMA table_info(esg_activity_record)"))]
        self.assertIn("generator_ref", cols)
        self.assertNotIn("generator_id", cols)
        with self.assertRaises(IntegrityError):
            with engine.begin() as conn:
                conn.execute(insert, {"id": "e3", "fac": "fac-1"})
        engine.dispose()


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
