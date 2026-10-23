"""E/S/G metric observations and disclosure coverage / gap reports."""
import os
import sys
import unittest
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(__file__))
from test_esg_ledger import LedgerTestCase  # noqa: E402


def ref(r):
    return quote(r, safe="")


class MetricHelpers(LedgerTestCase):
    def metric(self, sub="contrib-a", **kw):
        body = {"period_id": self.period, "metric_key": "water_withdrawal", "value": "1200.5",
                "dimensions": {"source": "groundwater"}, "evidence_ref": "WASA bill Jan-Dec", **kw}
        return self.call("POST", sub, "/metrics", body)

    def approved_metric(self, **kw):
        m = self.metric(**kw).json()
        self.post("contrib-a", f"/metrics/{m['id']}/submit")
        return self.post("user-a", f"/metrics/{m['id']}/approve")


class MetricTest(MetricHelpers):
    def test_validation_and_privacy_boundaries(self):
        self.assertEqual(self.metric().json()["unit"], "m3")
        self.assertEqual(self.metric(metric_key="unknown").status_code, 422)
        self.assertEqual(self.metric(dimensions={"source": "rain_dance"}).status_code, 422)
        self.assertEqual(self.metric(metric_key="employees_headcount", value="10.5", dimensions={}).status_code, 422)
        self.assertEqual(self.metric(metric_key="ethics_training_completion", value="101", dimensions={}).status_code, 422)
        self.assertEqual(self.metric(metric_key="employees_headcount", value="12", dimensions={"name": "Rahim"}).status_code, 422)

    def test_duplicate_and_review_rules(self):
        first = self.metric().json()
        self.assertEqual(self.metric(value="5").status_code, 409)  # same metric/breakdown/facility
        self.assertEqual(self.metric(dimensions={"source": "surface_water"}).status_code, 200)
        self.post("contrib-a", f"/metrics/{first['id']}/submit")
        self.call("POST", "contrib-a", f"/metrics/{first['id']}/approve", status=403)
        self.post("user-a", f"/metrics/{first['id']}/approve")
        fix = self.metric(value="1100", supersedes_id=first["id"]).json()
        self.post("contrib-a", f"/metrics/{fix['id']}/submit")
        self.post("admin-a", f"/metrics/{fix['id']}/approve")
        rows = {r["id"]: r["status"] for r in self.call("GET", "viewer-a", f"/metrics?period_id={self.period}").json()["items"]}
        self.assertEqual((rows[first["id"]], rows[fix["id"]]), ("SUPERSEDED", "APPROVED"))
        self.assertEqual(self.call("GET", "user-b", "/metrics").json()["total"], 0)

    def test_pending_metric_blocks_lock_and_approved_metrics_enter_snapshot(self):
        self.approved()
        self.approved_metric()
        pending = self.metric(metric_key="board_meetings", value="4", dimensions={}).json()
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.call("POST", "user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]}, status=409)
        self.post("contrib-a", f"/metrics/{pending['id']}/submit")
        self.post("user-a", f"/metrics/{pending['id']}/approve")
        # Newly approved metric makes the earlier run stale.
        self.call("POST", "user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]}, status=409)
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        snap = self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})
        report = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export").json()
        self.assertEqual(sorted(m["metric_key"] for m in report["esg_metrics"]), ["board_meetings", "water_withdrawal"])


class DisclosureTest(MetricHelpers):
    def coverage(self, fw="GRI", sub="viewer-a"):
        return self.call("GET", sub, f"/periods/{self.period}/disclosures/{fw}", status=200).json()

    def row(self, report, r):
        return next(x for x in report["requirements"] if x["ref"] == r)

    def test_missing_data_is_reported_never_compliant(self):
        report = self.coverage()
        self.assertFalse(report["all_requirements_addressed"])
        self.assertIn("not a compliance determination", report["statement"])
        self.assertEqual(report["verification_status"], "REFERENCES_TO_BE_VERIFIED")
        scope1 = self.row(report, "GRI 305-1")
        self.assertEqual(scope1["status"], "MISSING_DATA")
        self.assertIn("No locked GHG inventory for this period", scope1["missing"])
        self.assertEqual(self.row(report, "GRI 305-3")["missing"], ["Scope 3 accounting is not implemented"])
        self.assertNotIn("compliant", str(report).lower().replace("not a compliance determination", ""))
        csv_text = self.call("GET", "viewer-a", f"/periods/{self.period}/disclosures/GRI?format=csv", status=200).text
        self.assertIn("GRI 305-1,Direct (Scope 1) GHG emissions,MISSING_DATA", csv_text)

    def test_evidence_appears_after_lock_and_review_workflow(self):
        self.approved(activity_type="diesel", quantity="1000", unit="L")
        self.approved_metric()
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})
        report = self.coverage()
        scope1 = self.row(report, "GRI 305-1")
        self.assertEqual((scope1["status"], scope1["evidence"]["scope1_tco2e"]), ("NOT_STARTED", "2.700"))
        water = self.row(report, "GRI 303-3")
        self.assertEqual(water["evidence"]["water_withdrawal"][0]["value"], "1200.5000000000")

        path = f"/periods/{self.period}/disclosures/GRI/{ref('GRI 305-1')}"
        self.call("POST", "user-a", f"{path}/approve", status=409)  # not in review
        self.call("PUT", "contrib-a", path, {"status": "IN_REVIEW", "narrative": "Scope 1 from fuel records."}, status=200)
        self.call("POST", "contrib-a", f"{path}/approve", status=403)  # contributor lacks review
        self.call("POST", "user-a", f"{path}/approve", status=200)
        self.call("POST", "contrib-a", f"{path}/publish", status=403)
        self.call("POST", "admin-a", f"{path}/publish", status=200)
        self.call("PUT", "contrib-a", path, {"status": "DRAFT"}, status=409)  # published is final
        self.assertEqual(self.row(self.coverage(), "GRI 305-1")["status"], "PUBLISHED")

        # Missing data cannot be approved away.
        s3 = f"/periods/{self.period}/disclosures/GRI/{ref('GRI 305-3')}"
        self.call("PUT", "contrib-a", s3, {"status": "IN_REVIEW", "narrative": "We think it is small."}, status=200)
        self.call("POST", "user-a", f"{s3}/approve", status=409)
        self.call("PUT", "contrib-a", s3, {"status": "NOT_APPLICABLE"}, status=422)  # needs rationale
        self.call("PUT", "contrib-a", s3, {"status": "NOT_APPLICABLE",
                                           "applicability_rationale": "Scope 3 excluded from this year's boundary by board decision"}, status=200)
        self.assertEqual(self.row(self.coverage(), "GRI 305-3")["status"], "NOT_APPLICABLE")

    def test_self_approval_blocked_and_narrative_required(self):
        path = f"/periods/{self.period}/disclosures/IFRS_S2/{ref('IFRS S2 ¶6')}"
        self.call("PUT", "user-a", path, {"status": "IN_REVIEW", "narrative": ""}, status=200)
        self.call("POST", "user-a", f"{path}/approve", status=403)
        self.call("POST", "admin-a", f"{path}/approve", status=409)  # narrative required
        self.call("PUT", "contrib-a", path, {"status": "IN_REVIEW", "narrative": "The board reviews climate risk quarterly."}, status=200)
        self.call("POST", "admin-a", f"{path}/approve", status=200)

    def test_other_tenant_cannot_read_or_write(self):
        self.call("GET", "user-b", f"/periods/{self.period}/disclosures/GRI", status=404)
        self.call("PUT", "user-b", f"/periods/{self.period}/disclosures/GRI/{ref('GRI 305-1')}", {"status": "DRAFT"}, status=404)
        self.call("GET", "viewer-a", f"/periods/{self.period}/disclosures/ESRS", status=404)


if __name__ == "__main__":
    unittest.main()
