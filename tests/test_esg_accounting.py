"""
Numerical fixtures for the pure GHG calculation library (no database, no HTTP).
Factor values here are TEST fixtures, not real published factors.
"""
import datetime as dt
import os
import sys
import unittest
from decimal import Decimal as D

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.accounting import (  # noqa: E402
    Activity, Facility, Factor, UnitError, calculate, normalize, to_tonnes,
)

JAN1, DEC31 = dt.date(2025, 1, 1), dt.date(2025, 12, 31)


def factor(id, activity_type, unit, value, method, family=None, version=1, region="BD", gwp="AR5", valid_from=JAN1):
    return Factor(id=id, version=version, family=family or id, activity_type=activity_type, unit=unit,
                  kgco2e_per_unit=D(value), region=region, gwp_basis=gwp, method=method, valid_from=valid_from)


def act(id, fac, activity_type, qty, unit, start=dt.date(2025, 3, 1), end=dt.date(2025, 3, 31), **kw):
    return Activity(id=id, facility_id=fac, activity_type=activity_type, quantity=D(qty), unit=unit,
                    period_start=start, period_end=end, **kw)


FAC = {"f1": Facility("f1", "BD", True, True, D(100))}
GRID = factor("grid", "electricity", "kWh", "0.5", "location")
DIESEL = factor("diesel", "diesel", "L", "2.7", "direct")


class UnitTests(unittest.TestCase):
    def test_conversions(self):
        self.assertEqual(normalize(D("1.5"), "MWh", "electricity"), D("1500"))
        self.assertEqual(normalize(D("2"), "kL", "diesel"), D("2000"))
        self.assertEqual(normalize(D("1"), "US_gal", "diesel"), D("3.785411784"))
        self.assertEqual(normalize(D("2"), "t", "lpg"), D("2000"))

    def test_incompatible_units_fail(self):
        for qty, unit, at in ((1, "kg", "electricity"), (1, "kWh", "diesel"), (1, "L", "natural_gas"),
                              (1, "furlong", "diesel"), (-5, "L", "diesel"), (1, "L", "unobtainium")):
            with self.assertRaises(UnitError):
                normalize(D(qty), unit, at)


class CalculationTests(unittest.TestCase):
    def test_kwh_times_factor_gives_tonnes(self):
        r = calculate([act("a1", "f1", "electricity", "12345", "kWh")], FAC, [GRID], "operational_control")
        self.assertEqual(r.scope2_location_kg, D("6172.500000"))
        self.assertEqual(to_tonnes(r.scope2_location_kg), D("6.173"))  # ROUND_HALF_UP at report level
        self.assertIn("12345 kWh × 0.5 kgCO2e/kWh", r.lines[0].formula)

    def test_missing_factor_is_exception_not_value(self):
        r = calculate([act("a1", "f1", "diesel", "100", "L")], FAC, [GRID], "operational_control")
        self.assertEqual(r.scope1_kg, 0)
        self.assertEqual(r.lines, [])
        self.assertEqual(r.exceptions[0]["code"], "MISSING_FACTOR")
        self.assertTrue(r.blocking)

    def test_factor_outside_validity_or_region_not_used(self):
        future = factor("g26", "electricity", "kWh", "0.4", "location", valid_from=dt.date(2026, 1, 1))
        other = factor("gIN", "electricity", "kWh", "0.7", "location", region="IN")
        r = calculate([act("a1", "f1", "electricity", "10", "kWh")], FAC, [future, other], "operational_control")
        self.assertEqual(r.exceptions[0]["code"], "MISSING_FACTOR")

    def test_latest_version_of_family_and_ambiguity(self):
        v2 = factor("grid-v2", "electricity", "kWh", "0.6", "location", family="grid", version=2)
        r = calculate([act("a1", "f1", "electricity", "10", "kWh")], FAC, [GRID, v2], "operational_control")
        self.assertEqual(r.lines[0].factor_id, "grid-v2")
        rival = factor("other-publisher", "electricity", "kWh", "0.55", "location")
        r = calculate([act("a1", "f1", "electricity", "10", "kWh")], FAC, [GRID, rival], "operational_control")
        self.assertEqual(r.exceptions[0]["code"], "AMBIGUOUS_FACTOR")
        r = calculate([act("a1", "f1", "electricity", "10", "kWh", factor_id="other-publisher")], FAC,
                      [GRID, rival], "operational_control")
        self.assertEqual(r.lines[0].factor_id, "other-publisher")

    def test_market_and_location_reported_separately(self):
        market = factor("ppa", "electricity", "kWh", "0.1", "market")
        acts = [act("a1", "f1", "electricity", "1000", "kWh", market_factor_id="ppa")]
        r = calculate(acts, FAC, [GRID, market], "operational_control")
        self.assertEqual(r.scope2_location_kg, D("500"))
        self.assertEqual(r.scope2_market_kg, D("100"))
        self.assertEqual({l.method for l in r.lines}, {"location", "market"})

    def test_missing_market_input_is_not_invented(self):
        acts = [act("a1", "f1", "electricity", "1000", "kWh")]
        r = calculate(acts, FAC, [GRID], "operational_control")
        self.assertIsNone(r.scope2_market_kg)
        self.assertEqual(r.exceptions[0]["code"], "MISSING_MARKET_BASED_INPUT")
        self.assertFalse(r.blocking)  # location-based inventory is still complete

    def test_memo_items_never_change_totals(self):
        base = calculate([act("a1", "f1", "electricity", "1000", "kWh")], FAC, [GRID], "operational_control")
        with_export = calculate([act("a1", "f1", "electricity", "1000", "kWh"),
                                 act("a2", "f1", "electricity_export", "400", "kWh"),
                                 act("a3", "f1", "onsite_renewable_generation", "900", "kWh")],
                                FAC, [GRID], "operational_control")
        self.assertEqual(base.scope2_location_kg, with_export.scope2_location_kg)
        self.assertEqual(with_export.memo, {"electricity_export": D(400), "onsite_renewable_generation": D(900)})

    def test_boundary_rollup(self):
        facs = {
            "own": Facility("own", "BD", True, True, D(100)),
            "jv": Facility("jv", "BD", False, True, D(40)),
            "minority": Facility("minority", "BD", False, False, D(20)),
        }
        acts = [act(f"d-{f}", f, "diesel", "1000", "L") for f in facs]
        op = calculate(acts, facs, [DIESEL], "operational_control")
        fin = calculate(acts, facs, [DIESEL], "financial_control")
        eq = calculate(acts, facs, [DIESEL], "equity_share")
        self.assertEqual(op.scope1_kg, D("2700"))
        self.assertEqual(fin.scope1_kg, D("5400"))
        self.assertEqual(eq.scope1_kg, D("2700") + D("1080") + D("540"))
        self.assertEqual({e["facility_id"] for e in op.excluded}, {"jv", "minority"})
        self.assertEqual(eq.by_facility["jv"]["scope1_kg"], D("1080"))

    def test_mixed_gwp_basis_blocks(self):
        ar6 = factor("diesel6", "diesel", "L", "2.7", "direct", gwp="AR6")
        r = calculate([act("a1", "f1", "electricity", "1", "kWh"), act("a2", "f1", "diesel", "1", "L")],
                      FAC, [GRID, ar6], "operational_control")
        self.assertIn("MIXED_GWP_BASIS", [e["code"] for e in r.exceptions])
        self.assertTrue(r.blocking)

    def test_deterministic(self):
        acts = [act(f"a{i}", "f1", "electricity", str(100 + i), "kWh") for i in range(20)]
        r1 = calculate(acts, FAC, [GRID], "operational_control")
        r2 = calculate(list(reversed(acts)), FAC, [GRID], "operational_control")
        self.assertEqual([l.formula for l in r1.lines], [l.formula for l in r2.lines])
        self.assertEqual(r1.scope2_location_kg, r2.scope2_location_kg)


if __name__ == "__main__":
    unittest.main()
