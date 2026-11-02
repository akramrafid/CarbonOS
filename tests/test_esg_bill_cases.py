"""
Data-driven bill cases (D1). Every directory under tests/fixtures/bill_cases/ with a case.yaml is one test: it
loads parameter definitions and profiles through the API (each version approved by a second person), reads
SYNTHETIC documents, has a person confirm every value, then checks extraction, validation, the analysis API and
the ledger records against the case's expectations.

Adding a utility, a layout or a parameter is a new case directory of YAML files: no Python or JS change.
"""
import os
import sys
import unittest
from decimal import Decimal, InvalidOperation
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
import yaml  # noqa: E402

API = "/api/esg"
CASES = Path(__file__).parent / "fixtures" / "bill_cases"
REPO_PARAMETERS = Path(__file__).parent.parent / "inference" / "esg_rag" / "bill_profiles" / "parameters.yaml"


def same(actual, expected) -> bool:
    if actual is None or expected is None:
        return actual == expected
    try:
        return Decimal(str(actual)) == Decimal(str(expected))
    except InvalidOperation:
        return str(actual) == str(expected)


def describe(values):
    return [(v["parameter_key"], v["group_index"], v["value_text"], v["status"]) for v in values]


class BillCaseTest(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        self.add_member(self.org_a, "admin-a", "esg_admin")
        self.add_member(self.org_a, "contrib-a", "data_contributor")
        le = self.post("user-a", "/legal-entities", {"name": "Synthetic Test Factory Ltd", "country": "BD"})["id"]
        self.fac = self.post("user-a", "/facilities", {"legal_entity_id": le, "name": "Synthetic Plant",
                                                       "country": "BD", "grid_region": "TEST-GRID"})["id"]
        self.period = self.post("user-a", "/periods", {"name": "FY2025-26", "start_date": "2025-07-01",
                                                       "end_date": "2026-06-30",
                                                       "boundary_method": "operational_control"})["id"]

    def call(self, method, sub, path, body=None, params=None):
        return self.client.request(method, API + path, json=body, params=params, headers=auth(sub))

    def post(self, sub, path, body=None):
        res = self.call("POST", sub, path, body)
        self.assertLess(res.status_code, 300, f"{path}: {res.text}")
        return res.json()

    def load(self, entry, case_dir: Path):
        (kind, ref), = entry.items()
        path = REPO_PARAMETERS if ref == "repository" else case_dir / ref
        endpoint = {"parameters": "/bill-parameters", "profile": "/bill-profiles"}[kind]
        for row in self.post("user-a", endpoint, {"yaml": path.read_text(encoding="utf-8")}):
            if row["status"] == "DRAFT":
                self.post("admin-a", f"{endpoint}/{row['id']}/approve")  # a second person approves every version

    def run_case(self, case_dir: Path):
        case = yaml.safe_load((case_dir / "case.yaml").read_text(encoding="utf-8"))
        for entry in case.get("load", []):
            self.load(entry, case_dir)
        activities = []
        for spec in case.get("bills", []):
            activities += self.read_bill(case_dir, spec)
        for check in case.get("analysis", []):
            self.check_analysis(check)
        expected = case.get("ledger", [])
        self.assertEqual(len(activities), len(expected), activities)
        for want in expected:
            self.assertTrue(any(all(same(a.get(k), v) for k, v in want.items()) for a in activities),
                            f"ledger record {want} not in {activities}")

    def read_bill(self, case_dir: Path, spec: dict) -> list:
        name = spec["document"]
        document = yaml.safe_load((case_dir / name).read_text(encoding="utf-8"))
        bill = self.post("contrib-a", "/bills", {"facility_id": self.fac, "filename": name, "document": document})
        exp = spec.get("expect", {})
        self.assertEqual(bill["status"], exp.get("status", "EXTRACTED"), name)
        if "profile" in exp:
            self.assertEqual((bill["profile_key"], bill["profile_version"]),
                             (exp["profile"]["key"], exp["profile"]["version"]), name)
        for want in exp.get("values", []):
            hits = [v for v in bill["values"] if v["parameter_key"] == want["key"]
                    and v["group_index"] == want.get("group", "") and same(v["value_text"], want["value"])
                    and v.get("unit") == want.get("unit", v.get("unit"))]
            self.assertTrue(hits, f"{name}: {want} not extracted; got {describe(bill['values'])}")
            self.assertTrue(hits[0]["page"] and hits[0]["bbox"], f"{name}: {want['key']} has no page/box evidence")
        for raw in exp.get("unmapped", []):
            self.assertTrue(any(v["status"] == "unmapped" and same(v["value_text"], raw) for v in bill["values"]),
                            f"{name}: {raw} not kept as an UNMAPPED candidate")
        for v in bill["values"]:  # a person reviews every extracted value before anything reaches the ledger
            if v["status"] == "extracted":
                self.post("contrib-a", f"/bill-values/{v['id']}/confirm", {})
        bill = self.call("GET", "contrib-a", f"/bills/{bill['id']}").json()
        for want in exp.get("derived", []):
            self.assertTrue(any(v["status"] == "derived" and v["parameter_key"] == want["key"]
                                and v["group_index"] == want.get("group", "") and same(v["value_text"], want["value"])
                                for v in bill["values"]), f"{name}: derived {want} missing; got {describe(bill['values'])}")
        blocking = sorted({f["code"] for f in bill["findings"] if f["blocking"]})
        self.assertEqual(blocking, sorted(exp.get("blocking", [])), f"{name}: {bill['findings']}")
        if not spec.get("post", True):
            if blocking:
                res = self.call("POST", "contrib-a", f"/bills/{bill['id']}/post", {"period_id": self.period})
                self.assertEqual(res.status_code, 409, res.text)
            return []
        return self.post("contrib-a", f"/bills/{bill['id']}/post", {"period_id": self.period})

    def check_analysis(self, check: dict):
        q = check["query"]
        res = self.call("GET", "user-a", "/bill-analysis", params={
            "keys": ",".join(q["keys"]), "group_by": ",".join(q.get("group_by", [])), "grain": q.get("grain", "month")})
        self.assertEqual(res.status_code, 200, res.text)
        rows = res.json()["rows"]
        for want in check["rows"]:
            self.assertTrue([r for r in rows if all(same(r.get(k), v) for k, v in want.items())],
                            f"analysis {q}: no row {want}; got {rows}")


for _case in sorted(p for p in CASES.iterdir() if (p / "case.yaml").is_file()):
    setattr(BillCaseTest, f"test_case_{_case.name}", (lambda d: lambda self: self.run_case(d))(_case))


if __name__ == "__main__":
    unittest.main()
