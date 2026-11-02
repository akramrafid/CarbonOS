"""
Bangladesh grid derivation (Step 1) on SYNTHETIC inputs. None of these numbers is BPDB data: they only
check the arithmetic, the reconciliation rules, Monte Carlo determinism and byte-identical rebuilds.
"""
import csv
import json
import os
import sys
import tempfile
import unittest
from dataclasses import asdict, replace
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from factors.bd_grid import build, derive  # noqa: E402
from esg_rag import accounting  # noqa: E402

IPCC = json.loads((Path(build.HERE) / "ipcc2006_defaults.json").read_text(encoding="utf-8"))["fuels"]
PRM = derive.Params(gas_gcv_mj_per_m3=38.0, gas_gcv_uncertainty_pct=2.0, gas_ncv_to_gcv=0.9,
                    gas_reference_conditions="SYNTHETIC", gas_source="SYNTHETIC", hfo_density_kg_per_l=0.95,
                    hsd_density_kg_per_l=0.84, density_uncertainty_pct=1.0, density_source="SYNTHETIC",
                    import_factor_kg_per_kwh=0.7, import_factor_uncertainty_pct=5.0, import_factor_source="SYNTHETIC")
PLANTS = [
    derive.Plant("GAS1", 120_000, "natural_gas", gas_mmcf=1000, commissioning_year=2018),
    derive.Plant("HFO1", 130_000, "residual_fuel_oil", hfo_litre=30_000_000, commissioning_year=2012),
    derive.Plant("SOLAR1", 10_000, "solar", low_cost_must_run=True, commissioning_year=2021),
    derive.Plant("GAS2", 60_000, "natural_gas", fuel_data_missing=True, commissioning_year=2022),
]
NATIONAL = derive.National(net_generation_mwh=320_000, import_mwh=40_000, gas_mmcf=1000, hfo_litre=30_000_000,
                           td_loss_pct=10.0, source_ref="SYNTHETIC")

# Independent hand calculation (IPCC 2006 Table 2.2 defaults, AR6 GWPs CH4 29.8, N2O 273).
GAS1_TJ = 1000 * 1e6 * 0.028316846592 * 38.0 * 0.9 / 1e6
GAS1_CO2 = GAS1_TJ * 56100
GAS1_CO2E = GAS1_CO2 + GAS1_TJ * 1 * 29.8 + GAS1_TJ * 0.1 * 273
HFO1_TJ = 30_000_000 * 0.95 / 1e6 * 40.4
HFO1_CO2 = HFO1_TJ * 77400
HFO1_CO2E = HFO1_CO2 + HFO1_TJ * 3 * 29.8 + HFO1_TJ * 0.6 * 273
GAS2_CO2E = GAS1_CO2E / 120_000 * 60_000  # imputed at GAS1's intensity
TOTAL = GAS1_CO2E + HFO1_CO2E + GAS2_CO2E


class AveragesTest(unittest.TestCase):
    def test_energy_conversions(self):
        tj = derive.fuel_energy_tj(PLANTS[0], PRM, IPCC)
        self.assertAlmostEqual(tj["natural_gas"], 968.4361535, places=6)
        self.assertAlmostEqual(derive.fuel_energy_tj(PLANTS[1], PRM, IPCC)["residual_fuel_oil"], 1151.4, places=9)

    def test_generation_and_supply_weighted_averages(self):
        avg = derive.averages(PLANTS, NATIONAL, PRM, IPCC)
        self.assertAlmostEqual(avg["domestic_generation_weighted"], TOTAL / 320_000_000, places=9)
        self.assertAlmostEqual(avg["supply_weighted"], (TOTAL + 40_000 * 1000 * 0.7) / 360_000_000, places=9)

    def test_tool07_is_co2_only_and_a_reconciliation_artifact(self):
        t = derive.tool07(PLANTS, PRM, IPCC)
        gas2_co2 = GAS1_CO2 / 120_000 * 60_000
        self.assertAlmostEqual(t["operating_margin"], (GAS1_CO2 + HFO1_CO2 + gas2_co2) / 310_000_000, places=9)
        self.assertEqual(t["build_margin_units"], ["GAS2", "SOLAR1", "GAS1", "HFO1"])  # five most recent > 20 % sample
        self.assertAlmostEqual(t["combined_margin_firm"], 0.5 * t["operating_margin"] + 0.5 * t["build_margin"])
        for row in derive.draft_factor_rows(self.result(), "BD-NATIONAL-GRID", "SYNTHETIC", "SYNTHETIC"):
            self.assertIn(row["factor_kind"], accounting.allowed_factor_kinds("electricity", "location"))
            self.assertNotEqual(row["factor_kind"], "grid_combined_margin")

    def result(self):
        return derive.derive_year("2022-23", PLANTS, NATIONAL, PRM, IPCC)

    def test_year_result_memo_and_draft_rows(self):
        r = self.result()
        b = r["kg_co2e_per_kwh"]["supply_weighted"]
        self.assertAlmostEqual(r["td_loss_adjusted_memo"], b / 0.9)
        self.assertEqual((r["status"], r["imputed_plants"]), ("DRAFT_REVIEWABLE", ["GAS2"]))
        rows = derive.draft_factor_rows(r, "BD-NATIONAL-GRID", "SYNTHETIC", "SYNTHETIC")
        self.assertEqual([(x["family"], x["valid_from"], x["valid_to"]) for x in rows],
                         [("bd-grid-average-supply", "2022-07-01", "2023-06-30"),
                          ("bd-grid-average-domestic", "2022-07-01", "2023-06-30")])
        self.assertEqual(rows[0]["kgco2e_per_unit"], f"{b:.6f}")


class ReconciliationAndUncertaintyTest(unittest.TestCase):
    def test_unexplained_coverage_gap_keeps_year_unreviewable(self):
        national = replace(NATIONAL, gas_mmcf=1500)  # plants report 1000: 33 % residual
        cov = derive.coverage(PLANTS, national)
        self.assertAlmostEqual(cov["gas_mmcf"]["residual_pct"], 100 / 3)
        self.assertFalse(cov["gas_mmcf"]["ok"])
        self.assertEqual(derive.derive_year("2022-23", PLANTS, national, PRM, IPCC)["status"], "DRAFT_COVERAGE_GAP")
        explained = replace(national, explained_residuals={"gas_mmcf": "GAS2 burns gas but reports no fuel"})
        self.assertTrue(derive.coverage(PLANTS, explained)["gas_mmcf"]["ok"])

    def test_monte_carlo_is_seeded_and_brackets_the_central_value(self):
        mc1 = derive.monte_carlo(PLANTS, NATIONAL, PRM, IPCC, 10_000, 7)
        mc2 = derive.monte_carlo(PLANTS, NATIONAL, PRM, IPCC, 10_000, 7)
        self.assertEqual(mc1, mc2)
        central = derive.averages(PLANTS, NATIONAL, PRM, IPCC)["supply_weighted"]
        ci = mc1["supply_weighted"]
        self.assertLess(ci["p2_5"], central)
        self.assertGreater(ci["p97_5"], central)
        self.assertAlmostEqual(ci["p50"], central, delta=0.02 * central)

    def test_fewer_than_10000_draws_is_refused(self):
        with self.assertRaises(ValueError):
            derive.derive_year("2022-23", PLANTS, NATIONAL, replace(PRM, draws=500), IPCC)


class RebuildTest(unittest.TestCase):
    def write_inputs(self, root: Path):
        fy = root / "2022-23"
        fy.mkdir(parents=True)
        cols = [f for f in asdict(PLANTS[0]).keys()]
        with open(fy / "plants.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=cols)
            w.writeheader()
            for p in PLANTS:
                w.writerow({k: ("" if v is None else v) for k, v in asdict(p).items()})
        (fy / "national.json").write_text(json.dumps(asdict(NATIONAL)), encoding="utf-8")
        (fy / "params.json").write_text(json.dumps(asdict(PRM)), encoding="utf-8")

    def test_rebuild_is_byte_identical_and_blocked_without_inputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            data, out1, out2 = Path(tmp) / "data", Path(tmp) / "a.json", Path(tmp) / "b.json"
            self.write_inputs(data)
            self.assertEqual(build.main(["--data", str(data), "--out", str(out1)]), 0)
            self.assertEqual(build.main(["--data", str(data), "--out", str(out2)]), 0)
            self.assertEqual(out1.read_bytes(), out2.read_bytes())
            year = json.loads(out1.read_text(encoding="utf-8"))["years"][0]
            self.assertEqual(year["monte_carlo"]["draws"], 10_000)
            empty = Path(tmp) / "empty"
            empty.mkdir()
            self.assertEqual(build.main(["--data", str(empty), "--out", str(Path(tmp) / "c.json")]), 2)


if __name__ == "__main__":
    unittest.main()
