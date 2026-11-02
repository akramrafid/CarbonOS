"""
D5: market-based Scope 2 follows the GHG Protocol Scope 2 Guidance hierarchy: (1) contractual instruments that meet the
Scope 2 Quality Criteria, (2) a supplier-specific rate the record selects, (3) a residual mix, (4) otherwise the grid
average, flagged MARKET_FALLBACK_GRID_AVERAGE and disclosed in the report. Each level is tested in the library and
through the ledger. Factors and instruments are TEST fixtures, not real ones.
"""
import datetime as dt
import os
import re
import sys
import unittest
from decimal import Decimal as D
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))
from test_esg_accounting import FAC, GRID, act, factor  # noqa: E402
from test_esg_ledger import LedgerTestCase  # noqa: E402
from esg_rag.accounting import (  # noqa: E402
    DIRECT_CONTRACT_CRITERIA, INSTRUMENT_TYPES, QUALITY_CRITERIA, Facility, Instrument, calculate,
)

OP = "operational_control"


def instrument(id, mwh, facility="f1", **kw):
    fields = dict(id=id, facility_id=facility, instrument_type="energy_attribute_certificate", ref=f"TEST-IREC-{id}",
                  market="BD", mwh=D(mwh), kg_per_kwh=D(0), applies_from=dt.date(2025, 1, 1),
                  applies_to=dt.date(2025, 12, 31), criteria=QUALITY_CRITERIA)
    return Instrument(**{**fields, **kw})


def march(qty="1000", **kw):
    return act("a1", "f1", "electricity", qty, "kWh", **kw)


class MarketHierarchyTests(unittest.TestCase):
    def codes(self, r):
        return [e["code"] for e in r.exceptions]

    def levels(self, r):
        return [(l.details["market_level"], l.quantity) for l in r.lines if l.method == "market"]

    def test_level1_instruments_cover_kwh_first_and_the_rest_falls_back(self):
        r = calculate([march()], FAC, [GRID], OP, instruments=[instrument("i1", "0.4")])
        self.assertEqual(self.levels(r), [("contractual_instrument", D(400)), ("grid_average", D(600))])
        self.assertEqual(r.scope2_market_kg, D("300"))  # 400 kWh × 0 + 600 kWh × 0.5
        self.assertEqual(r.scope2_location_kg, D("500"))  # instruments never change location-based
        fallback = [e for e in r.exceptions if e["code"] == "MARKET_FALLBACK_GRID_AVERAGE"]
        self.assertEqual(len(fallback), 1)
        self.assertIn("600.0 kWh", fallback[0]["detail"])
        self.assertFalse(r.blocking)

    def test_level1_full_cover_needs_no_factor_and_unapplied_kwh_are_reported(self):
        r = calculate([march()], FAC, [GRID], OP, instruments=[instrument("i1", "1.5")])
        self.assertEqual(self.levels(r), [("contractual_instrument", D(1000))])
        self.assertEqual(r.scope2_market_kg, D(0))
        self.assertNotIn("MARKET_FALLBACK_GRID_AVERAGE", self.codes(r))
        unused = next(e for e in r.exceptions if e["code"] == "INSTRUMENT_KWH_UNUSED")
        self.assertIn("500.0 of 1500.0 kWh", unused["detail"])
        self.assertFalse(unused["blocking"])

    def test_level1_only_instruments_meeting_every_quality_criterion_count(self):
        cases = ((instrument("i1", "1", criteria=QUALITY_CRITERIA[:-1]), "vintage_close_to_consumption"),
                 (instrument("i1", "1", market="IN"), "same_market"),
                 (instrument("i1", "1", instrument_type="power_purchase_agreement"), "exclusive_transfer"),
                 (instrument("i1", "1", instrument_type="green_tariff"), "instrument type"))
        for inst, criterion in cases:
            r = calculate([march()], FAC, [GRID], OP, instruments=[inst])
            self.assertEqual([level for level, _ in self.levels(r)], ["grid_average"])
            failure = next(e for e in r.exceptions if e["code"] == "INSTRUMENT_FAILS_QUALITY_CRITERIA")
            self.assertIn(criterion, failure["detail"])
            self.assertFalse(failure["blocking"])
        ppa = instrument("i1", "1", instrument_type="power_purchase_agreement",
                         criteria=QUALITY_CRITERIA + DIRECT_CONTRACT_CRITERIA)
        r = calculate([march()], FAC, [GRID], OP, instruments=[ppa])
        self.assertEqual(self.levels(r), [("contractual_instrument", D(1000))])

    def test_level1_kwh_are_applied_once_in_date_order_and_never_claimed_twice(self):
        april = act("a0", "f1", "electricity", "700", "kWh", start=dt.date(2025, 4, 1), end=dt.date(2025, 4, 30))
        same_certificates = instrument("i2", "5", ref="TEST-IREC-i1")
        r = calculate([april, march("700")], FAC, [GRID], OP, instruments=[instrument("i1", "1"), same_certificates])
        applied = {l.activity_id: l.quantity for l in r.lines if l.details.get("market_level") == "contractual_instrument"}
        self.assertEqual(applied, {"a1": D(700), "a0": D(300)})  # March first, although "a0" sorts first by id
        duplicate = next(e for e in r.exceptions if e["code"] == "INSTRUMENT_FAILS_QUALITY_CRITERIA")
        self.assertIn("unique_claim", duplicate["detail"])

    def test_level1_instrument_dates_and_facility_bound_its_use(self):
        facs = {**FAC, "f2": Facility("f2", "BD", True, True, D(100))}
        later = instrument("i1", "5", applies_from=dt.date(2025, 7, 1))
        elsewhere = instrument("i2", "5", facility="f2")
        r = calculate([march()], facs, [GRID], OP, instruments=[later, elsewhere])
        self.assertEqual([level for level, _ in self.levels(r)], ["grid_average"])
        self.assertEqual(self.codes(r).count("INSTRUMENT_KWH_UNUSED"), 2)

    def test_level2_a_selected_supplier_rate_ranks_above_the_residual_mix(self):
        supplier = factor("sup", "electricity", "kWh", "0.3", "market", kind="supplier_specific")
        residual = factor("rm", "electricity", "kWh", "0.6", "market", kind="residual_mix")
        r = calculate([march(market_factor_id="sup")], FAC, [GRID, supplier, residual], OP)
        self.assertEqual(self.levels(r), [("supplier_specific", D(1000))])
        self.assertEqual(r.scope2_market_kg, D("300"))
        self.assertEqual(self.codes(r), [])
        # A supplier rate belongs to a supply contract, so a grid region alone never applies it: the record takes
        # the residual mix and the unselected rate is pointed out.
        r = calculate([march()], FAC, [GRID, supplier, residual], OP)
        self.assertEqual(self.levels(r), [("residual_mix", D(1000))])
        self.assertIn("SUPPLIER_RATE_NOT_SELECTED", self.codes(r))
        self.assertFalse(r.blocking)

    def test_level3_residual_mix_applies_by_grid_region_without_a_selection(self):
        residual = factor("rm", "electricity", "kWh", "0.6", "market", kind="residual_mix")
        r = calculate([march()], FAC, [GRID, residual], OP)
        self.assertEqual(self.levels(r), [("residual_mix", D(1000))])
        self.assertEqual(r.scope2_market_kg, D("600"))
        self.assertEqual(self.codes(r), [])
        other_region = factor("rm-in", "electricity", "kWh", "0.6", "market", kind="residual_mix", region="IN")
        r = calculate([march()], FAC, [GRID, other_region], OP)
        self.assertEqual([level for level, _ in self.levels(r)], ["grid_average"])

    def test_level4_grid_average_fallback_is_flagged_and_equals_location(self):
        r = calculate([march()], FAC, [GRID], OP)
        self.assertEqual(self.levels(r), [("grid_average", D(1000))])
        self.assertEqual(r.scope2_market_kg, r.scope2_location_kg)
        self.assertEqual([l.factor_id for l in r.lines], ["grid", "grid"])
        fallback = next(e for e in r.exceptions if e["code"] == "MARKET_FALLBACK_GRID_AVERAGE")
        self.assertFalse(fallback["blocking"])
        self.assertIn("1000 kWh", fallback["detail"])

    def test_level4_uses_the_records_own_location_factor(self):
        rival = factor("other-publisher", "electricity", "kWh", "0.55", "location")
        r = calculate([march(factor_id="other-publisher")], FAC, [GRID, rival], OP)
        self.assertEqual({l.factor_id for l in r.lines}, {"other-publisher"})
        self.assertEqual(r.scope2_market_kg, D("550"))

    def test_a_selection_that_skips_an_available_level_blocks(self):
        residual = factor("rm", "electricity", "kWh", "0.6", "market", kind="residual_mix")
        grid_mkt = factor("grid-mkt", "electricity", "kWh", "0.5", "market", kind="grid_average")
        r = calculate([march(market_factor_id="grid-mkt")], FAC, [GRID, residual, grid_mkt], OP)
        violation = next(e for e in r.exceptions if e["code"] == "MARKET_HIERARCHY_VIOLATION")
        self.assertTrue(violation["blocking"])
        self.assertIn("residual_mix", violation["detail"])
        self.assertIsNone(r.scope2_market_kg)

    def test_market_inputs_from_another_grid_region_block(self):
        supplier_in = factor("sup-in", "electricity", "kWh", "0.3", "market", kind="supplier_specific", region="IN")
        r = calculate([march(market_factor_id="sup-in")], FAC, [GRID, supplier_in], OP)
        self.assertIn("MARKET_FACTOR_OTHER_MARKET", self.codes(r))
        self.assertTrue(r.blocking)
        self.assertIsNone(r.scope2_market_kg)

    def test_without_a_grid_average_the_market_total_is_not_invented(self):
        r = calculate([march()], FAC, [], OP)
        self.assertIsNone(r.scope2_market_kg)
        self.assertEqual(self.codes(r), ["MISSING_FACTOR", "MISSING_MARKET_BASED_INPUT"])
        self.assertFalse(r.exceptions[1]["blocking"])

    def test_instrument_types_match_the_migration_check(self):
        source = (Path(__file__).resolve().parents[1] / "inference" / "esg_migrations" / "versions"
                  / "0009_contractual_instruments.py").read_text(encoding="utf-8")
        listed = re.search(r"instrument_type IN \(([^)]*)\)", source).group(1)
        self.assertEqual(tuple(v.strip(" '") for v in listed.split(",")), INSTRUMENT_TYPES)

    def test_purchased_steam_is_in_the_market_based_total(self):
        steam = factor("steam", "purchased_steam", "GJ", "60", "location", kind=None)
        r = calculate([act("s1", "f1", "purchased_steam", "100", "GJ")], FAC, [steam], OP)
        self.assertEqual((r.scope2_market_kg, r.scope2_location_kg), (D("6000"), D("6000")))
        self.assertEqual(self.levels(r), [("location_rate", D(100))])
        self.assertIn("MARKET_FALLBACK_LOCATION_RATE", self.codes(r))
        supplier = factor("steam-sup", "purchased_steam", "GJ", "40", "market", kind=None)
        r = calculate([act("s1", "f1", "purchased_steam", "100", "GJ", market_factor_id="steam-sup")], FAC,
                      [steam, supplier], OP)
        self.assertEqual((r.scope2_market_kg, self.levels(r)), (D("4000"), [("supplier_specific", D(100))]))
        self.assertNotIn("MARKET_FALLBACK_LOCATION_RATE", self.codes(r))

    def test_a_residual_mix_covering_part_of_a_record_is_used_for_those_months(self):
        july = factor("rm", "electricity", "kWh", "0.9", "market", kind="residual_mix", valid_from=dt.date(2025, 7, 1))
        bill = act("b1", "f1", "electricity", "3100", "kWh", start=dt.date(2025, 6, 15), end=dt.date(2025, 7, 15))
        r = calculate([bill], FAC, [GRID, july], OP)
        self.assertEqual(self.levels(r), [("grid_average", D(1600)), ("residual_mix", D(1500))])  # 16 + 15 days
        self.assertEqual(r.scope2_market_kg, D("2150"))  # 1 600 × 0.5 + 1 500 × 0.9
        self.assertIn("1600", next(e for e in r.exceptions if e["code"] == "MARKET_FALLBACK_GRID_AVERAGE")["detail"])

    def test_an_explicit_factor_of_another_region_is_never_the_location_rate(self):
        india = factor("grid-in", "electricity", "kWh", "0.9", "location", region="IN")
        r = calculate([march(factor_id="grid-in")], FAC, [GRID, india], OP)
        self.assertEqual(r.scope2_location_kg, 0)
        self.assertIn("SELECTED_FACTOR_OTHER_REGION", self.codes(r))
        self.assertTrue(r.blocking)
        diesel_in = factor("diesel-in", "diesel", "L", "2.7", "direct", region="IN")
        r = calculate([act("d1", "f1", "diesel", "10", "L", factor_id="diesel-in")], FAC, [diesel_in], OP)
        flag = next(e for e in r.exceptions if e["code"] == "SELECTED_FACTOR_OTHER_REGION")
        self.assertEqual((flag["blocking"], r.scope1_kg), (False, D("27")))  # Scope 1: flagged, still calculated

    def test_facility_market_figures_are_withheld_with_the_total(self):
        bad = factor("cm-mkt", "electricity", "kWh", "0.55", "market", kind="grid_combined_margin")
        facs = {**FAC, "f2": Facility("f2", "BD", True, True, D(100))}
        r = calculate([march(), act("a2", "f2", "electricity", "1000", "kWh", market_factor_id="cm-mkt")], facs,
                      [GRID, bad], OP)
        self.assertIsNone(r.scope2_market_kg)
        self.assertEqual({fid: b["scope2_market_kg"] for fid, b in r.by_facility.items()}, {"f1": None, "f2": None})

    def test_instrument_references_are_compared_in_normalised_form(self):
        same = instrument("i2", "5", ref=" test-irec-I1 ")
        r = calculate([march()], FAC, [GRID], OP, instruments=[instrument("i1", "1"), same])
        failure = next(e for e in r.exceptions if e["code"] == "INSTRUMENT_FAILS_QUALITY_CRITERIA")
        self.assertIn("unique_claim", failure["detail"])


class MarketHierarchyLedgerTest(LedgerTestCase):
    def instrument(self, sub="user-a", status=None, **kw):
        body = {"facility_id": self.fac, "period_id": self.period, "instrument_type": "energy_attribute_certificate",
                "instrument_ref": "TEST-IREC-0001-0004", "registry": "TEST registry", "generation_market": "TEST-GRID",
                "generation_technology": "solar_pv", "generation_start": "2025-01-01", "generation_end": "2025-01-31",
                "mwh": "4", "emission_rate_kg_per_kwh": "0", "applies_from": "2025-01-01", "applies_to": "2025-01-31",
                "quality_criteria": {c: f"TEST evidence for {c}" for c in QUALITY_CRITERIA}, **kw}
        return self.call("POST", sub, "/contractual-instruments", body, status=status)

    def test_d5_instruments_need_a_second_person_and_the_report_discloses_each_level(self):
        self.approved()  # 12 345 kWh, January 2025
        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(run["scope2_market_kg"], "6172.500000")  # level 4: the grid average, flagged
        self.assertIn("MARKET_FALLBACK_GRID_AVERAGE", [e["code"] for e in run["exceptions"]])

        inst = self.instrument(status=201).json()
        self.assertEqual(inst["status"], "DRAFT")
        self.call("POST", "user-a", f"/contractual-instruments/{inst['id']}/approve", status=403)  # the author
        self.call("POST", "user-b", f"/contractual-instruments/{inst['id']}/approve", status=404)  # another tenant
        self.instrument(status=409)  # the same certificates cannot be entered twice
        draft = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(draft["scope2_market_kg"], "6172.500000")  # a DRAFT instrument is not used
        self.post("admin-a", f"/contractual-instruments/{inst['id']}/approve")
        listed = self.call("GET", "viewer-a", f"/contractual-instruments?period_id={self.period}", status=200).json()
        self.assertEqual([i["status"] for i in listed["items"]], ["APPROVED"])

        run = self.post("contrib-a", f"/periods/{self.period}/calculate")
        self.assertEqual(run["scope2_market_kg"], "4172.500000")  # 4 000 kWh × 0 + 8 345 kWh × 0.5
        self.assertEqual(run["scope2_location_kg"], "6172.500000")
        self.assertNotEqual(run["input_sha256"], draft["input_sha256"])
        snap = self.post("user-a", f"/periods/{self.period}/lock", {"calculation_run_id": run["id"]})
        report = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=json", status=200).json()
        self.assertEqual(report["schema"], "carbonos.esg.report/2")
        self.assertEqual(report["totals_tco2e"]["scope2_market_based_status"], "GRID_AVERAGE_FALLBACK")
        market = report["scope2_market_based_disclosure"]
        self.assertEqual({k: D(v) for k, v in market["kwh_by_level"].items()},
                         {"contractual_instrument": 4000, "supplier_specific": 0, "residual_mix": 0, "grid_average": 8345})
        self.assertEqual([(D(i["kwh_applied"]), D(i["kwh_not_applied"])) for i in market["instruments"]], [(4000, 0)])
        self.assertIn("8345 kWh", market["statement"])
        self.assertIn("TEST-GRID", market["statement"])
        csv = self.call("GET", "viewer-a", f"/snapshots/{snap['id']}/export?format=csv", status=200).text
        self.assertIn("scope2_market_based_disclosure", csv)

    def test_a_reference_is_claimed_once_whatever_its_spelling_and_a_void_frees_it(self):
        inst = self.instrument(status=201).json()
        self.instrument(status=409, instrument_ref=" test-irec-0001-0004 ")
        self.call("POST", "contrib-a", f"/contractual-instruments/{inst['id']}/void", {"reason": "TEST"}, status=403)
        self.call("POST", "user-a", f"/contractual-instruments/{inst['id']}/void", {"reason": " "}, status=422)
        voided = self.post("user-a", f"/contractual-instruments/{inst['id']}/void", {"reason": "TEST typo in MWh"})
        self.assertEqual(voided["status"], "RETIRED")
        self.instrument(status=201, instrument_ref=" test-irec-0001-0004 ")

    def test_instrument_validation(self):
        self.instrument(status=422, quality_criteria={"made_up": "TEST"})
        self.instrument(status=422, applies_to="2026-01-31")  # outside the reporting period
        self.instrument(status=422, generation_end="2024-12-31")
        self.instrument(status=422, instrument_type="green_tariff")  # a supplier product: level 2, not an instrument
        self.instrument(status=422, mwh="0")
        self.instrument(sub="viewer-a", status=403)


if __name__ == "__main__":
    unittest.main()
