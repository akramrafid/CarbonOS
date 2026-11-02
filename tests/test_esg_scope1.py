"""
Scope 1 completion (Step 2): natural gas on an energy basis, captive generation, refrigerant mass
balance, biomass, data-quality grades and IPCC Approach 1 uncertainty. Pure library, no database.

Factor values are TEST fixtures. Where they mirror IPCC 2006 defaults the source is noted, but no
factor is approved by these tests.
"""
import datetime as dt
import math
import os
import sys
import unittest
from decimal import Decimal as D

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from esg_rag.accounting import (  # noqa: E402
    Activity, Facility, Factor, GasComponent, HeatingValue, MassBalance, UnitError, calculate, combine_product,
    combine_sum, heating_value_mj_per_m3,
)
from esg_rag import gwp  # noqa: E402

JAN1 = dt.date(2025, 1, 1)
FAC = {"f1": Facility("f1", "BD", True, True, D(100))}
HV = HeatingValue(gcv_mj_per_m3=D("38.0"), ncv_to_gcv=D("0.9"), reference_conditions="15 °C, 101.325 kPa",
                  source="TEST certificate", uncertainty_pct=D(1))


def act(id, activity_type, qty, unit, data_quality="billed", **kw):
    return Activity(id=id, facility_id="f1", activity_type=activity_type, quantity=D(qty), unit=unit,
                    period_start=dt.date(2025, 3, 1), period_end=dt.date(2025, 3, 31), data_quality=data_quality, **kw)


def factor(id, activity_type, unit, value="0", method="direct", gwp="AR6", kind=None, gases=(), unc=None):
    return Factor(id=id, version=1, family=id, activity_type=activity_type, unit=unit, kgco2e_per_unit=D(value),
                  region="BD", gwp_basis=gwp, method=method, valid_from=JAN1, kind=kind, gases=gases,
                  uncertainty_pct=unc)


# IPCC 2006 Vol. 2 Table 2.3 natural gas, per GJ NCV: CO2 56.1 (+3.92 %), CH4 0.001 (+200 %), N2O 0.0001 (+200 %).
GAS_GJ = factor("gas-gj", "natural_gas", "GJ", gases=(
    GasComponent("CO2", D("56.1"), D("3.92")), GasComponent("CH4_fossil", D("0.001"), D(200)),
    GasComponent("N2O", D("0.0001"), D(200))))
DIESEL = factor("diesel", "diesel", "L", "2.7", unc=D(5))
GRID = factor("grid", "electricity", "kWh", "0.5", method="location", kind="grid_average", unc=D(10))
# Wood per kg, from Table 2.3 (cont.) × NCV 15.6 MJ/kg (Table 1.2): CO2 112, CH4 0.030, N2O 0.004 kg/GJ.
WOOD = factor("wood", "wood", "kg", gases=(
    GasComponent("CO2_biogenic", D("1.7472")), GasComponent("CH4_non_fossil", D("0.000468")),
    GasComponent("N2O", D("0.0000624"))))


def codes(r):
    return [e["code"] for e in r.exceptions]


class NaturalGasEnergyBasisTest(unittest.TestCase):
    def test_billed_m3_to_gj_ncv(self):
        r = calculate([act("g1", "natural_gas", "10000", "m3", heating_value=HV)], FAC, [GAS_GJ], "operational_control")
        line = r.lines[0]
        self.assertEqual(line.details["energy_gj_ncv"], D("342.000"))  # 10 000 × 38.0 × 0.9 / 1000
        self.assertEqual(line.factor_value, D("56.1571"))  # 56.1 + 0.001 × 29.8 + 0.0001 × 273 (AR6)
        self.assertEqual(r.scope1_kg, D("19205.728200"))
        self.assertEqual(line.details["gases_kg"]["CO2"], D("19186.200000"))
        self.assertIn("(342.0000 GJ NCV)", line.formula)

    def test_volume_correction_applies_before_heating_value(self):
        r = calculate([act("g1", "natural_gas", "10000", "m3", heating_value=HV, volume_correction=D("1.02"))],
                      FAC, [GAS_GJ], "operational_control")
        self.assertEqual(r.lines[0].details["energy_gj_ncv"], D("348.84000"))

    def test_missing_heating_value_blocks(self):
        r = calculate([act("g1", "natural_gas", "10000", "m3")], FAC, [GAS_GJ], "operational_control")
        self.assertEqual((r.lines, codes(r)), ([], ["MISSING_HEATING_VALUE"]))
        self.assertTrue(r.blocking)

    def test_declared_default_heating_value_is_flagged(self):
        default = HeatingValue(D("38.0"), D("0.9"), "15 °C, 101.325 kPa", "declared default", is_default=True,
                               uncertainty_pct=D(5))
        r = calculate([act("g1", "natural_gas", "10000", "m3", heating_value=default)], FAC, [GAS_GJ],
                      "operational_control")
        self.assertEqual(len(r.lines), 1)
        flag = next(e for e in r.exceptions if e["code"] == "HIGH_UNCERTAINTY")
        self.assertFalse(flag["blocking"])

    def test_volume_basis_factor_still_needs_no_heating_value(self):
        per_m3 = factor("gas-m3", "natural_gas", "m3", "2.0")
        r = calculate([act("g1", "natural_gas", "100", "m3")], FAC, [per_m3], "operational_control")
        self.assertEqual(r.scope1_kg, D("200.000000"))

    def test_heating_value_unit_conversions(self):
        self.assertEqual(heating_value_mj_per_m3(D(9000), "kcal/m3"), D("37.6812"))
        self.assertAlmostEqual(float(heating_value_mj_per_m3(D(1000), "Btu/scf")), 37.2589458, places=6)
        with self.assertRaises(UnitError):
            heating_value_mj_per_m3(D(1), "therm")


class CaptiveGenerationTest(unittest.TestCase):
    def test_generator_kwh_is_memo_and_never_also_scope2(self):
        acts = [act("d1", "diesel", "1000", "L", generator_id="G1"),
                act("o1", "captive_generation_output", "3500", "kWh", generator_id="G1", meter_ref="GEN-1"),
                act("e1", "electricity", "5000", "kWh", meter_ref="GRID-1"),
                act("e2", "electricity", "3500", "kWh", meter_ref="GEN-1")]  # same kWh entered as grid supply
        r = calculate(acts, FAC, [DIESEL, GRID], "operational_control")
        self.assertEqual(r.scope1_kg, D("2700.000000"))
        self.assertEqual(r.scope2_location_kg, D("2500.000000"))  # e1 only
        self.assertEqual(r.memo["captive_generation_output"], D("3500"))
        dup = next(e for e in r.exceptions if e["code"] == "DOUBLE_COUNTED_ELECTRICITY")
        self.assertEqual((dup["activity_id"], dup["blocking"]), ("e2", True))
        self.assertNotIn("GENERATOR_EFFICIENCY_OUT_OF_BAND", codes(r))  # 0.2857 L/kWh is plausible

    def test_electricity_tagged_with_a_generator_is_rejected(self):
        r = calculate([act("e1", "electricity", "100", "kWh", generator_id="G1")], FAC, [GRID], "operational_control")
        self.assertEqual(r.scope2_location_kg, 0)
        self.assertIn("DOUBLE_COUNTED_ELECTRICITY", codes(r))

    def test_implausible_specific_fuel_consumption_raises(self):
        acts = [act("d1", "diesel", "1000", "L", generator_id="G1"),
                act("o1", "captive_generation_output", "1000", "kWh", generator_id="G1")]
        r = calculate(acts, FAC, [DIESEL], "operational_control")
        out = next(e for e in r.exceptions if e["code"] == "GENERATOR_EFFICIENCY_OUT_OF_BAND")
        self.assertTrue(out["blocking"])
        self.assertIn("1.0000 L/kWh", out["detail"])

    def test_missing_generator_output_is_reported(self):
        r = calculate([act("d1", "diesel", "1000", "L", generator_id="G1")], FAC, [DIESEL], "operational_control")
        self.assertIn("GENERATOR_OUTPUT_MISSING", codes(r))
        self.assertFalse(r.blocking)

    def test_gas_engine_heat_rate_band(self):
        acts = [act("g1", "natural_gas", "10000", "m3", heating_value=HV, generator_id="G2"),
                act("o2", "captive_generation_output", "36000", "kWh", generator_id="G2")]  # 342 000 MJ / 36 000 kWh
        r = calculate(acts, FAC, [GAS_GJ], "operational_control")
        self.assertNotIn("GENERATOR_EFFICIENCY_OUT_OF_BAND", codes(r))
        acts[1] = act("o2", "captive_generation_output", "9000", "kWh", generator_id="G2")  # 38 MJ/kWh
        self.assertIn("GENERATOR_EFFICIENCY_OUT_OF_BAND", codes(calculate(acts, FAC, [GAS_GJ], "operational_control")))


class RefrigerantTest(unittest.TestCase):
    def ref(self, name, *mb, **kw):
        return act("r1", "refrigerant", "0", "kg", refrigerant=name, mass_balance=MassBalance(*map(D, mb)), **kw)

    def test_mass_balance_times_ar6_gwp(self):
        r = calculate([self.ref("R-410A", 100, 30, 5, 110)], FAC, [], "operational_control")
        self.assertEqual(r.gwp_basis, "AR6")
        self.assertEqual(r.lines[0].quantity, D(15))
        self.assertEqual(r.lines[0].factor_value, D("2255.50"))  # 0.5 × 771 + 0.5 × 3740
        self.assertEqual(r.scope1_kg, D("33832.500000"))
        self.assertIsNone(r.lines[0].factor_id)
        self.assertEqual(r.lines[0].factor_ref, "IPCC AR6 GWP-100 R-410A")

    def test_ar5_is_selectable(self):
        r = calculate([self.ref("R-410A", 100, 30, 5, 110)], FAC, [], "operational_control", gwp_basis="AR5")
        self.assertEqual(r.scope1_kg, D("28852.500000"))  # 15 × (0.5 × 677 + 0.5 × 3170)

    def test_blend_gwps(self):
        self.assertEqual(gwp.refrigerant_gwp("R-407C", "AR6")[0], D("1907.9300"))
        self.assertEqual(gwp.refrigerant_gwp("R-404A", "AR6")[0], D("4728.0000"))
        self.assertEqual(gwp.refrigerant_gwp("R-134a", "AR6")[0], D(1530))
        self.assertEqual(gwp.refrigerant_gwp("R-410A", "AR4"), (None, False))

    def test_capacity_increase_is_not_emitted(self):
        mb = MassBalance(D(100), D(130), D(0), D(110), capacity_increase_kg=D(100))
        r = calculate([act("r1", "refrigerant", "0", "kg", refrigerant="R-32", mass_balance=mb)], FAC, [],
                      "operational_control")
        self.assertEqual(r.lines[0].quantity, D(20))

    def test_hcfc22_is_reported_outside_scope1(self):
        r = calculate([self.ref("R-22", 50, 10, 0, 45)], FAC, [], "operational_control")
        self.assertEqual((r.lines, r.scope1_kg), ([], 0))
        self.assertEqual(r.memo["montreal_protocol_gases_kgco2e"], D("29400.000000"))  # 15 × 1960
        self.assertIn("Montreal Protocol", r.excluded[0]["reason"])

    def test_bad_balances_block(self):
        for name, mb, code in (("R-410A", (10, 0, 0, 20), "NEGATIVE_MASS_BALANCE"),
                               ("R-999", (10, 0, 0, 5), "UNKNOWN_REFRIGERANT_OR_GWP_BASIS")):
            r = calculate([self.ref(name, *mb)], FAC, [], "operational_control")
            self.assertEqual(codes(r), [code])
        r = calculate([act("r1", "refrigerant", "0", "kg", refrigerant="R-410A")], FAC, [], "operational_control")
        self.assertEqual(codes(r), ["MISSING_MASS_BALANCE"])

    def test_mass_balance_uncertainty_follows_eq_3_2(self):
        r = calculate([self.ref("R-410A", 100, 30, 5, 110)], FAC, [], "operational_control")
        expected = math.sqrt(200 ** 2 + 60 ** 2 + 10 ** 2 + 220 ** 2) / 15  # 2 % on every term, net 15 kg
        self.assertAlmostEqual(float(r.lines[0].uncertainty_pct), expected, places=2)

    def test_gwp_basis_must_match_factors(self):
        r = calculate([self.ref("R-410A", 100, 30, 5, 110), act("d1", "diesel", "10", "L")], FAC,
                      [factor("d5", "diesel", "L", "2.7", gwp="AR5")], "operational_control", gwp_basis="AR6")
        self.assertIn("MIXED_GWP_BASIS", codes(r))


class BiomassTest(unittest.TestCase):
    def test_ch4_n2o_in_scope1_and_biogenic_co2_outside(self):
        r = calculate([act("w1", "wood", "10000", "kg")], FAC, [WOOD], "operational_control")
        self.assertEqual(r.scope1_kg, D("296.712000"))  # 10 000 × (0.000468 × 27.0 + 0.0000624 × 273)
        self.assertEqual(r.memo["biogenic_co2_kg"], D("17472.000000"))
        self.assertEqual(r.lines[0].details["gases_kg"]["CO2_biogenic"], D("17472.000000"))

    def test_biogenic_share_follows_boundary(self):
        facs = {"f1": Facility("f1", "BD", False, False, D(40))}
        r = calculate([act("w1", "wood", "10000", "kg")], facs, [WOOD], "equity_share")
        self.assertEqual(r.memo["biogenic_co2_kg"], D("6988.800000"))


class DataQualityAndUncertaintyTest(unittest.TestCase):
    def test_line_uncertainty_is_eq_3_1(self):
        r = calculate([act("e1", "electricity", "1000", "kWh")], FAC, [GRID], "operational_control")
        self.assertEqual(r.lines[0].data_quality, "billed")
        self.assertEqual(r.lines[0].uncertainty_pct, D("10.20"))  # sqrt(2² + 10²)

    def test_total_uncertainty_is_eq_3_2(self):
        acts = [act("d1", "diesel", "1000", "L"), act("d2", "diesel", "1000", "L", meter_ref="m2")]
        r = calculate(acts, FAC, [DIESEL], "operational_control")
        self.assertEqual(r.uncertainty["scope1"]["uncertainty_pct"], D("3.81"))  # sqrt(29)/sqrt(2)
        self.assertEqual(r.uncertainty["scope1"]["coverage_pct"], D("100.00"))

    def test_gas_level_factor_uncertainty_combines_gases(self):
        r = calculate([act("g1", "natural_gas", "10000", "m3", heating_value=HV)], FAC, [GAS_GJ], "operational_control")
        co2, ch4, n2o = 56.1 * 342, 0.001 * 29.8 * 342, 0.0001 * 273 * 342
        f_unc = math.sqrt((3.92 * co2) ** 2 + (200 * ch4) ** 2 + (200 * n2o) ** 2) / (co2 + ch4 + n2o)
        expected = math.sqrt(2 ** 2 + 1 ** 2 + f_unc ** 2)  # activity 2 %, heating value 1 %, factor
        self.assertAlmostEqual(float(r.lines[0].uncertainty_pct), expected, places=2)

    def test_ungraded_record_is_flagged_and_lowers_coverage(self):
        acts = [act("d1", "diesel", "1000", "L"), act("d2", "diesel", "1000", "L", data_quality=None, meter_ref="m2")]
        r = calculate(acts, FAC, [DIESEL], "operational_control")
        flag = next(e for e in r.exceptions if e["code"] == "DATA_QUALITY_UNGRADED")
        self.assertEqual((flag["activity_id"], flag["blocking"]), ("d2", False))
        self.assertEqual(r.uncertainty["scope1"]["coverage_pct"], D("50.00"))
        self.assertEqual(r.uncertainty["scope1"]["lines_without_uncertainty"], 1)

    def test_unknown_grade_blocks(self):
        r = calculate([act("d1", "diesel", "1", "L", data_quality="guess")], FAC, [DIESEL], "operational_control")
        self.assertIn("UNKNOWN_DATA_QUALITY", codes(r))
        self.assertTrue(r.blocking)

    def test_approach_1_helpers(self):
        self.assertEqual(combine_product(D(3), D(4)), D(5))
        self.assertIsNone(combine_product(D(3), None))
        self.assertIsNone(combine_sum([(D(1), D(1)), (D(-1), D(1))]))
        self.assertEqual(combine_sum([(D(100), D(10))]), D(10))


class FiscalYearSplitTest(unittest.TestCase):
    """Step 1.7: a bill spanning the 1 July fiscal-year change takes each month's grid factor (TEST values)."""
    FY25 = Factor("g25", 1, "bd-grid", "electricity", "kWh", D("0.6"), "BD", "AR6", "location", dt.date(2024, 7, 1),
                  dt.date(2025, 6, 30), kind="grid_average", uncertainty_pct=D(5))
    FY26 = Factor("g26", 2, "bd-grid", "electricity", "kWh", D("0.5"), "BD", "AR6", "location", dt.date(2025, 7, 1),
                  dt.date(2026, 6, 30), kind="grid_average", uncertainty_pct=D(5))

    def bill(self, start, end, qty="3000", **kw):
        return Activity("e1", "f1", "electricity", D(qty), "kWh", start, end, data_quality="billed", **kw)

    def location(self, r):
        return [(l.factor_id, l.quantity) for l in r.lines if l.method == "location"]

    def test_bill_spanning_fiscal_years_is_split_by_month(self):
        r = calculate([self.bill(dt.date(2025, 6, 16), dt.date(2025, 7, 15))], FAC, [self.FY25, self.FY26],
                      "operational_control")
        self.assertEqual(self.location(r), [("g25", D(1500)), ("g26", D(1500))])
        self.assertEqual(r.scope2_location_kg, D("1650.000000"))  # 1500 × 0.6 + 1500 × 0.5
        self.assertEqual((r.lines[0].activity_id, r.lines[0].details["month_segment"]), ("e1", "2025-06-16..2025-06-30"))
        r = calculate([self.bill(dt.date(2025, 6, 20), dt.date(2025, 7, 9))], FAC, [self.FY25, self.FY26],
                      "operational_control")
        self.assertEqual(r.scope2_location_kg, D("1665.000000"))  # 11/20 × 3000 × 0.6 + 9/20 × 3000 × 0.5

    def test_pieces_sum_exactly(self):
        from esg_rag.accounting import month_segments
        segs = month_segments(self.bill(dt.date(2025, 1, 1), dt.date(2025, 3, 31), qty="1000"))
        self.assertEqual([s.period_end for s in segs], [dt.date(2025, 1, 31), dt.date(2025, 2, 28), dt.date(2025, 3, 31)])
        self.assertEqual(sum(s.quantity for s in segs), D(1000))

    def test_no_split_when_a_month_has_no_factor_or_a_factor_was_chosen(self):
        r = calculate([self.bill(dt.date(2025, 6, 16), dt.date(2025, 7, 15))], FAC, [self.FY25], "operational_control")
        self.assertEqual((self.location(r), codes(r)[0]), ([], "MISSING_FACTOR"))
        r = calculate([self.bill(dt.date(2025, 6, 16), dt.date(2025, 7, 15), factor_id="g25")], FAC,
                      [self.FY25, self.FY26], "operational_control")
        self.assertEqual(codes(r)[0], "SELECTED_FACTOR_NOT_APPLICABLE")


if __name__ == "__main__":
    unittest.main()
