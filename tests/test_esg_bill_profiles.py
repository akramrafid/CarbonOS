"""
Dynamic bill parameters: definitions as versioned data, two-person approval, detection and routing, review of
every value, posting gates, version pinning, tenant isolation and roles. All documents here are SYNTHETIC
(invented layouts and values); real bills replace them as the reference set when they arrive.
"""
import datetime as dt
import os
import sys
import unittest
from decimal import Decimal as D
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from esg_harness import ESGApiTestCase, auth  # noqa: E402
from esg_rag import bill_extract as bx  # noqa: E402
from esg_rag import bill_profiles as bp  # noqa: E402

API = "/api/esg"
SHARED = Path(__file__).parent / "fixtures" / "bill_cases" / "_shared" / "synthetic_grid_profile.yaml"
GRID_YAML = SHARED.read_text(encoding="utf-8")
PARAMS_YAML = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")
# synthetic_grid bill as layout lines (invented values)
SYNTHETIC_GRID = {"source": "pdf_text", "pages": [{"lines": [
    "SYNTHETIC GRID CO - TEST FIXTURE ELECTRICITY BILL", "Account No SYN-ACC-9 Bill No SB-9",
    "Period From 01-08-2025 Period To 31-08-2025", "Meter No SGM-9 MF 1", "Register Previous Present kWh",
    "Flat 100 150 50", "Total Energy 50 kWh", "Water Surcharge 75"]}]}
SYNTHETIC_UNKNOWN = {"source": "manual", "pages": [{"lines": ["SOME OTHER UTILITY", "Units used 4,321", "Pay 9,999"]}]}


class SeedAndSchemaTest(unittest.TestCase):
    def test_seed_profiles_validate_and_carry_no_invented_anchors_or_aliases(self):
        profiles = bp.repo_profiles()
        issuers = {p["issuer"] for p in profiles}
        for name in ("DESCO", "DPDC", "PBS/BREB", "NESCO", "WZPDCL", "BPDB", "Titas", "Bakhrabad", "KGDCL",
                     "Jalalabad", "Pashchimanchal", "Sundarban"):
            self.assertIn(name, issuers)
        self.assertEqual({p["document_type"] for p in profiles}, set(bp.DOCUMENT_TYPES))
        for p in profiles:
            self.assertEqual(p["detect"], {"all_of": [], "any_of": []}, p["profile_key"])
            self.assertTrue(all(f["hints"] == [] for f in p["fields"]), p["profile_key"])
            self.assertIn("AWAITING A REAL BILL", p["notes"])
        params, _, _ = bp.repo_catalog()
        self.assertTrue(all(not a for p in params.values() for a in p.aliases.values()))  # aliases come from real bills

    def test_a_seed_never_matches_a_bill_by_itself(self):
        doc = bx.document_from_layout(SYNTHETIC_GRID)
        self.assertEqual(bx.detect(doc, [(p["profile_key"], p) for p in bp.repo_profiles()]), ("UNKNOWN_PROFILE", []))

    def test_bad_definitions_are_rejected(self):
        params, groups, rulesets = bp.repo_catalog()
        base = bp.load_yaml(GRID_YAML)
        for change, msg in (
                ({"fields": [{"key": "no.such.key"}]}, "unknown parameter"),
                ({"fields": [{"key": "energy.kwh.computed"}]}, "derived"),
                ({"fields": [{"key": "energy.kwh.total", "unit": "kvarh"}]}, "does not fit"),
                ({"rules": [{"code": "BAD_RULE", "expect": "__import__('os').system('x')"}]}, "BAD_RULE"),
                ({"rules": [{"code": "BAD_RULE", "expect": "energy.kwh.total.__class__"}]}, "BAD_RULE"),
                ({"rulesets": ["no_such_set"]}, "unknown rule set")):
            with self.subTest(change=change), self.assertRaisesRegex(bp.ProfileError, msg):
                bp.validate_profile({**base, **change}, params, groups, rulesets)
        with self.assertRaisesRegex(bp.ProfileError, "only consumption"):
            bp.parse_parameter({"key": "x.y", "dtype": "decimal", "role": "cost", "dimension": "[currency]",
                                "canonical_unit": "BDT", "labels": {"en": "x"},
                                "ledger": {"activity_type": "electricity", "unit": "kWh"}}, groups)
        with self.assertRaises(bp.ProfileError):
            bp.load_yaml("!!python/object/apply:os.system ['echo pwned']")

    def test_bengali_digits_dates_and_units_normalise(self):
        p = bp.parse_parameter({"key": "energy.kwh.total", "dtype": "decimal", "role": "consumption",
                                "dimension": "[energy]", "canonical_unit": "kWh", "allowed_units": ["kWh", "MWh"],
                                "labels": {"en": "Total"}}, {"bill": None})
        self.assertEqual(bx.normalise(p, "১,৪৪০", "MWh"), (D("1440000"), "kWh"))
        date = bp.parse_parameter({"key": "period.end", "dtype": "date", "role": "period", "labels": {"en": "End"}},
                                  {"bill": None})
        self.assertEqual(bx.normalise(date, "৩১-০৮-২০২৫")[0], dt.date(2025, 8, 31))


class BillApiTest(ESGApiTestCase):
    def setUp(self):
        super().setUp()
        for sub, role in (("admin-a", "esg_admin"), ("contrib-a", "data_contributor"), ("viewer-a", "executive_viewer")):
            self.add_member(self.org_a, sub, role)
        le = self.ok("POST", "user-a", "/legal-entities", {"name": "Synthetic Ltd", "country": "BD"})["id"]
        self.fac = self.ok("POST", "user-a", "/facilities", {"legal_entity_id": le, "name": "Synthetic Plant",
                                                            "country": "BD", "grid_region": "TEST-GRID"})["id"]
        self.period = self.ok("POST", "user-a", "/periods", {"name": "FY2025-26", "start_date": "2025-07-01",
                                                            "end_date": "2026-06-30",
                                                            "boundary_method": "operational_control"})["id"]

    def call(self, method, sub, path, body=None, params=None):
        return self.client.request(method, API + path, json=body, params=params, headers=auth(sub))

    def ok(self, method, sub, path, body=None, params=None):
        res = self.call(method, sub, path, body, params)
        self.assertLess(res.status_code, 300, f"{path}: {res.text}")
        return res.json()

    def definitions(self, approve_profile=True):
        for row in self.ok("POST", "user-a", "/bill-parameters", {"yaml": PARAMS_YAML}):
            self.ok("POST", "admin-a", f"/bill-parameters/{row['id']}/approve")
        profile = self.ok("POST", "user-a", "/bill-profiles", {"yaml": GRID_YAML})[0]
        if approve_profile:
            self.ok("POST", "admin-a", f"/bill-profiles/{profile['id']}/approve")
        return profile

    def bill(self, document=SYNTHETIC_GRID, sub="contrib-a", **extra):
        return self.ok("POST", sub, "/bills", {"facility_id": self.fac, "filename": "synthetic_bill.yaml",
                                               "document": document, **extra})

    def confirm_all(self, bill):
        for v in bill["values"]:
            if v["status"] == "extracted":
                self.ok("POST", "contrib-a", f"/bill-values/{v['id']}/confirm", {})
        return self.ok("GET", "contrib-a", f"/bills/{bill['id']}")

    def test_two_person_approval_and_roles(self):
        rows = self.ok("POST", "user-a", "/bill-parameters", {"yaml": PARAMS_YAML})
        self.assertTrue(all(r["status"] == "DRAFT" for r in rows))
        self.assertEqual(self.call("POST", "user-a", f"/bill-parameters/{rows[0]['id']}/approve").status_code, 403)
        self.assertEqual(self.call("POST", "contrib-a", "/bill-parameters", {"yaml": PARAMS_YAML}).status_code, 403)
        self.assertEqual(self.call("POST", "user-a", "/bill-parameters", {"yaml": PARAMS_YAML,
                                                                          "platform_wide": True}).status_code, 403)
        profile = self.ok("POST", "user-a", "/bill-profiles", {"yaml": GRID_YAML})[0]
        res = self.call("POST", "admin-a", f"/bill-profiles/{profile['id']}/approve")
        self.assertEqual(res.status_code, 409)  # its parameter definitions are still DRAFT
        self.assertIn("parameter definitions first", res.json()["detail"])
        again = self.ok("POST", "user-a", "/bill-parameters", {"yaml": PARAMS_YAML})
        self.assertEqual([r["version"] for r in again], [r["version"] for r in rows])  # unchanged → no new version

    def test_unsafe_yaml_and_injected_rules_are_rejected_by_the_api(self):
        self.definitions(approve_profile=False)
        for text in ("!!python/object/apply:os.system ['echo pwned']",
                     GRID_YAML.replace("rulesets: [period, electricity_meter_reads]",
                                       "rules: [{code: EVIL_RULE, expect: \"__import__('os').getcwd()\"}]")):
            self.assertEqual(self.call("POST", "user-a", "/bill-profiles", {"yaml": text}).status_code, 422)

    def test_unknown_profile_keeps_every_number_and_is_routed_by_a_person(self):
        profile = self.definitions(approve_profile=False)  # DRAFT profiles are never auto-detected
        bill = self.bill(SYNTHETIC_UNKNOWN)
        self.assertEqual(bill["status"], "UNKNOWN_PROFILE")
        self.assertEqual(sorted(v["value_text"] for v in bill["values"] if v["status"] == "unmapped"), ["4321", "9999"])
        grid = self.bill()
        self.assertEqual(grid["status"], "UNKNOWN_PROFILE")
        routed = self.ok("POST", "contrib-a", f"/bills/{grid['id']}/assign-profile", {"profile_id": profile["id"]})
        self.assertEqual((routed["status"], routed["profile_version"]), ("EXTRACTED", 1))
        self.assertIn("PROFILE_NOT_APPROVED", [f["code"] for f in routed["findings"]])
        self.confirm_all(routed)
        res = self.call("POST", "contrib-a", f"/bills/{grid['id']}/post", {"period_id": self.period})
        self.assertEqual(res.status_code, 409)  # a DRAFT profile never reaches the ledger
        self.assertEqual(self.call("POST", "contrib-a", f"/bills/{grid['id']}/assign-profile",
                                   {"profile_id": profile["id"]}).status_code, 409)  # review would be lost

    def test_ambiguous_profiles_are_never_guessed(self):
        self.definitions()
        twin = self.ok("POST", "user-a", "/bill-profiles", {
            "yaml": GRID_YAML.replace("profile_key: synthetic-grid-ht", "profile_key: synthetic-grid-twin")})[0]
        self.ok("POST", "admin-a", f"/bill-profiles/{twin['id']}/approve")
        self.assertEqual(self.bill()["status"], "AMBIGUOUS_PROFILE")

    def test_review_correct_reject_and_map(self):
        self.definitions()
        bill = self.bill()
        values = {(v["parameter_key"], v["group_index"]): v for v in bill["values"]}
        total = values[("energy.kwh.total", "")]
        fixed = self.ok("POST", "contrib-a", f"/bill-values/{total['id']}/correct", {"value": "৫০", "unit": "kWh"})
        self.assertEqual((fixed["status"], fixed["value_text"], fixed["extracted_value_text"], fixed["confirmed_by"]),
                         ("corrected", "50", "50", "contrib-a"))
        self.assertEqual(self.call("POST", "contrib-a", f"/bill-values/{total['id']}/correct",
                                   {"value": "fifty"}).status_code, 422)
        surcharge = next(v for v in bill["values"] if v["status"] == "unmapped" and v["value_text"] == "75")
        mapped = self.ok("POST", "contrib-a", f"/bill-values/{surcharge['id']}/map", {"parameter_key": "cost.total"})
        self.assertEqual((mapped["status"], mapped["unit"]), ("confirmed", "BDT"))
        self.assertEqual(self.call("POST", "contrib-a", f"/bill-values/{surcharge['id']}/map",
                                   {"parameter_key": "meter.serial"}).status_code, 409)
        derived = lambda b: [v for v in b["values"] if v["status"] == "derived" and v["parameter_key"] == "energy.kwh.computed"]
        self.assertEqual(len(derived(self.ok("GET", "viewer-a", f"/bills/{bill['id']}"))), 1)
        reading = values[("meter.read.current", "meter:1/register:1")]
        self.ok("POST", "contrib-a", f"/bill-values/{reading['id']}/reject", {"comment": "TEST misread"})
        self.assertEqual(derived(self.ok("GET", "viewer-a", f"/bills/{bill['id']}")), [])  # its input was rejected
        self.assertEqual(self.call("POST", "contrib-a", f"/bills/{bill['id']}/post",
                                   {"period_id": self.period}).status_code, 409)  # values still pending review

    def test_blocking_findings_stop_posting(self):
        self.definitions()
        broken = {"source": "pdf_text", "pages": [{"lines": SYNTHETIC_GRID["pages"][0]["lines"][:-2]
                                                    + ["Total Energy 999 kWh"]}]}  # registers sum to 50
        bill = self.confirm_all(self.bill(broken))
        self.assertIn("TOU_SUM_MISMATCH", [f["code"] for f in bill["findings"] if f["blocking"]])
        res = self.call("POST", "contrib-a", f"/bills/{bill['id']}/post", {"period_id": self.period})
        self.assertEqual(res.status_code, 409)
        self.assertIn("TOU_SUM_MISMATCH", res.json()["detail"])

    def test_a_bill_keeps_the_profile_version_it_was_read_with(self):
        self.definitions()
        first = self.bill()
        v2 = self.ok("POST", "user-a", "/bill-profiles", {"yaml": GRID_YAML.replace("layout_version: synthetic-1",
                                                                                   "layout_version: synthetic-2")})[0]
        self.assertEqual(v2["version"], 2)
        self.ok("POST", "admin-a", f"/bill-profiles/{v2['id']}/approve")
        self.assertEqual(self.ok("GET", "contrib-a", f"/bills/{first['id']}")["profile_version"], 1)
        self.assertEqual(self.bill()["profile_version"], 2)

    def test_tenant_isolation_and_roles(self):
        self.definitions()
        bill = self.bill()
        self.assertEqual(self.call("GET", "user-b", f"/bills/{bill['id']}").status_code, 404)
        value_id = bill["values"][0]["id"]
        self.assertEqual(self.call("POST", "user-b", f"/bill-values/{value_id}/confirm", {}).status_code, 404)
        self.assertEqual(self.ok("GET", "user-b", "/bill-analysis", params={"keys": "energy.kwh.total"})["rows"], [])
        self.assertEqual(self.ok("GET", "user-b", "/bill-profiles")["total"], 0)  # org A's profiles stay private
        self.assertEqual(self.call("POST", "viewer-a", "/bills", {"facility_id": self.fac, "document": SYNTHETIC_GRID})
                         .status_code, 403)
        self.assertEqual(self.call("GET", "viewer-a", "/bill-analysis",
                                   params={"keys": "energy.kwh.total", "group_by": "facility"}).status_code, 200)
        self.assertEqual(self.call("GET", "viewer-a", "/bill-analysis",
                                   params={"keys": "energy.kwh.total", "group_by": "colour"}).status_code, 422)

    def test_platform_operators_load_the_repository_seeds_as_drafts(self):
        self.assertEqual(self.call("POST", "user-a", "/bill-profiles/load-repository").status_code, 403)
        self.add_member(self.org_a, "operator-1", "esg_admin")  # operators act through a membership, as for factors
        loaded = self.ok("POST", "operator-1", "/bill-profiles/load-repository", None)
        self.assertEqual(loaded, {"parameters": 35, "profiles": 21})
        listed = self.ok("GET", "user-a", "/bill-profiles", params={"limit": 200})
        self.assertEqual({p["status"] for p in listed["items"]}, {"DRAFT"})
        self.assertEqual(self.bill()["status"], "UNKNOWN_PROFILE")  # DRAFT seeds are never matched automatically


if __name__ == "__main__":
    unittest.main()
