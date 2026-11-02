"""
Bangladesh grid derivation (Step 1, both methods) on SYNTHETIC inputs. None of these numbers is Petrobangla,
BPC, BPDB or CEA data: they check the arithmetic, the status rules, Monte Carlo determinism, byte-identical
rebuilds and the source register. Expected values are computed independently from the IPCC defaults file.
"""
import csv
import json
import os
import shutil
import sys
import tempfile
import unittest
from dataclasses import asdict, replace
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))
from factors.bd_grid import build, derive, sources  # noqa: E402
from esg_rag import accounting  # noqa: E402

IPCC = json.loads((build.HERE / "ipcc2006_defaults.json").read_text(encoding="utf-8"))["fuels"]
HV = derive.HeatingValue(38.0, 0.9, "SYNTHETIC 15 °C, 101.325 kPa", "SYNTHETIC certificate", uncertainty_pct=2.0)
INP = derive.MethodAInputs(
    net_generation_gwh=320.0, net_generation_includes_imports=False, net_generation_source="SYNTHETIC p.62",
    net_generation_uncertainty_pct=1.0,
    gas=derive.Gas(1000.0, "MMscf", True, "SYNTHETIC power-sector sales", 3.0, HV),
    liquids=(derive.Liquid("residual_fuel_oil", 30_000.0, "kL", "SYNTHETIC BPC sales", 0.95, "SYNTHETIC", 1.0, 2.0),),
    coal=(derive.Coal("COAL1", 33_158.0, "sub_bituminous_coal", "SYNTHETIC operator report", 19.0, "SYNTHETIC", 3.0, 2.0),),
    imports=(derive.Import("Adani Godda", 30.0, "SYNTHETIC p.120", 0.9, 10.0, "SYNTHETIC plant data"),
             derive.Import("NVVN", 10.0, "SYNTHETIC p.120")),
    cea=derive.CEA(0.71, True, "SYNTHETIC v0", "SYNTHETIC", 5.0))
PLANTS = [derive.PlantB("GAS1", 120.0, "natural_gas", "ccgt", "SYNTHETIC", 2018),
          derive.PlantB("HFO1", 130.0, "residual_fuel_oil", "hfo_engine", "SYNTHETIC", 2012),
          derive.PlantB("COAL1", 60.0, "sub_bituminous_coal", "subcritical_coal", "SYNTHETIC", 2022),
          derive.PlantB("SOLAR1", 10.0, "solar", "", "SYNTHETIC", 2021)]
RATES = {"ccgt": derive.HeatRate(7500, 8070, 8600, "SYNTHETIC"),
         "hfo_engine": derive.HeatRate(8400, 8857, 9300, "SYNTHETIC"),
         "subcritical_coal": derive.HeatRate(9800, 10500, 11200, "SYNTHETIC")}


def kg_co2e(fuel, tj):
    f = IPCC[fuel]
    return tj * (f["co2_kg_per_tj"][0] + f["ch4_kg_per_tj"][0] * 29.8 + f["n2o_kg_per_tj"][0] * 273)


GAS_TJ = 1000 * 1e6 * 0.028316846592 * 38.0 * 0.9 / 1e6
HFO_TJ = 30_000 * 1000 * 0.95 / 1e6 * IPCC["residual_fuel_oil"]["ncv_tj_per_gg"][0]
COAL_TJ = 33_158 / 1000 * 19.0
A_DOMESTIC = kg_co2e("natural_gas", GAS_TJ) + kg_co2e("residual_fuel_oil", HFO_TJ) + kg_co2e("sub_bituminous_coal", COAL_TJ)
IMPORTS = 30e6 * 0.9 + 10e6 * 0.71
B_DOMESTIC = (kg_co2e("natural_gas", 120 * 8070 / 1000) + kg_co2e("residual_fuel_oil", 130 * 8857 / 1000)
              + kg_co2e("sub_bituminous_coal", 60 * 10500 / 1000))


def year(inp=INP, plants=PLANTS, rates=RATES, references=None, draws=10_000):
    return derive.derive_year("2022-23", inp, plants, rates, IPCC, references or {}, draws)


class MethodsTest(unittest.TestCase):
    def test_method_a_matches_a_hand_calculation(self):
        a = derive.method_a(INP, IPCC)
        self.assertAlmostEqual(a["fuel_tj"]["natural_gas"], 968.4361535, places=6)
        self.assertAlmostEqual(a["domestic_generation_weighted"], A_DOMESTIC / 320e6, places=12)
        self.assertAlmostEqual(a["supply_weighted"], (A_DOMESTIC + IMPORTS) / 360e6, places=12)
        both = replace(INP, net_generation_gwh=360.0, net_generation_includes_imports=True)  # same grid, other basis
        self.assertAlmostEqual(derive.method_a(both, IPCC)["supply_weighted"], a["supply_weighted"], places=12)

    def test_method_b_and_a_gap_within_5_pct_is_reviewable(self):
        b = derive.method_b(PLANTS, INP, RATES, IPCC)
        self.assertAlmostEqual(b["supply_weighted"], (B_DOMESTIC + IMPORTS) / 360e6, places=12)
        r = year()
        self.assertEqual(r["status"], "DRAFT_REVIEWABLE")
        self.assertLess(abs(r["method_gap_pct"]["supply_weighted"]), 5)

    def test_unexplained_gap_over_5_pct_keeps_the_year_draft(self):
        hot = {**RATES, "ccgt": derive.HeatRate(9000, 9700, 10400, "SYNTHETIC")}
        r = year(rates=hot)
        self.assertEqual(r["status"], "DRAFT_METHOD_GAP")
        self.assertGreater(r["method_gap_pct"]["domestic_generation_weighted"], 5)
        explained = year(inp=replace(INP, explanations={"method_gap": "SYNTHETIC: open-cycle running in a drought"}),
                         rates=hot)
        self.assertEqual(explained["status"], "DRAFT_REVIEWABLE")

    def test_missing_inputs_block_and_are_never_guessed(self):
        for inp, why in ((replace(INP, gas=replace(INP.gas, heating_value=None)), "heating value"),
                         (replace(INP, gas=replace(INP.gas, excludes_captive=False)), "captive"),
                         (replace(INP, cea=None), "CEA"),
                         (replace(INP, cea=replace(INP.cea, includes_cross_border=False)), "cross-border")):
            r = year(inp=inp)
            self.assertEqual(r["status"], "BLOCKED", why)
            self.assertIn(why.split()[0], r["blocked_by"])
            self.assertEqual(derive.draft_factor_rows(r, "BD", "S", "S"), [])

    def test_unsourced_heat_rates_block_method_b_only(self):
        r = year(rates={})
        self.assertEqual(r["status"], "DRAFT_NO_CROSS_CHECK")
        self.assertIn("heat-rate", r["method_b"]["blocked_by"])
        self.assertEqual(derive.draft_factor_rows(r, "BD", "S", "S"), [])  # without the cross-check: kept out
        self.assertEqual(build.load_heat_rates(build.HERE / "heat_rates.json"), {})  # repository: nothing cited yet

    def test_declared_default_heating_value_is_flagged(self):
        r = year(inp=replace(INP, gas=replace(INP.gas, heating_value=replace(HV, is_default=True))))
        self.assertTrue(any(f.startswith("HIGH_UNCERTAINTY") for f in r["flags"]))

    def test_public_sector_totals_cannot_exceed_the_fuel_balance(self):
        r = year(inp=replace(INP, public_sector={"gas_m3": 2e10, "coal_t": 10_000.0}))
        self.assertEqual(r["status"], "DRAFT_COVERAGE_GAP")
        self.assertFalse(r["public_sector_crosscheck"]["gas_m3"]["ok"])
        self.assertTrue(r["public_sector_crosscheck"]["coal_t"]["ok"])

    def test_reference_gap_over_5_pct_blocks_approval(self):
        refs = {"ifi_harmonized_grid_ef": {"version": "SYNTHETIC", "combined_margin_firm_kg_per_kwh": 0.10,
                                           "combined_margin_intermittent_kg_per_kwh": 0.10, "status": "SYNTHETIC"}}
        r = year(references=refs)
        self.assertEqual(r["status"], "DRAFT_REFERENCE_GAP")
        self.assertEqual(len(r["reference_deltas"]["rows"]), 2)
        ok = year(inp=replace(INP, explanations={"reference_gap": "SYNTHETIC: IFI uses another year"}), references=refs)
        self.assertEqual(ok["status"], "DRAFT_REVIEWABLE")

    def test_tool07_is_reconciliation_only_and_rows_are_grid_average(self):
        t = year()["cdm_tool07_reconciliation_only"]
        co2 = (120 * 8070 / 1000 * IPCC["natural_gas"]["co2_kg_per_tj"][0]
               + 130 * 8857 / 1000 * IPCC["residual_fuel_oil"]["co2_kg_per_tj"][0]
               + 60 * 10500 / 1000 * IPCC["sub_bituminous_coal"]["co2_kg_per_tj"][0])
        self.assertAlmostEqual(t["operating_margin"], co2 / 310e6, places=12)
        self.assertAlmostEqual(t["combined_margin_firm"], 0.5 * t["operating_margin"] + 0.5 * t["build_margin"])
        rows = derive.draft_factor_rows(year(), "BD-NATIONAL-GRID", "SYNTHETIC", "SYNTHETIC")
        # One location-based candidate per year, so two approved rows can never be ambiguous.
        self.assertEqual([(x["family"], x["factor_kind"], x["valid_from"], x["valid_to"]) for x in rows],
                         [("bd-grid-average-supply", "grid_average", "2022-07-01", "2023-06-30")])
        for row in rows:
            self.assertIn(row["factor_kind"], accounting.allowed_factor_kinds("electricity", "location"))

    def test_only_reviewable_years_reach_the_ledger_and_ranges_need_a_width(self):
        for status in ("DRAFT_COVERAGE_GAP", "DRAFT_NO_CROSS_CHECK", "DRAFT_METHOD_GAP", "DRAFT_REFERENCE_GAP", "BLOCKED"):
            self.assertEqual(derive.draft_factor_rows({**year(), "status": status}, "BD", "S", "S"), [], status)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "heat_rates.json"
            flat = {"status": "CITED", "source": "TEST", "low_kj_per_kwh": 7000, "central_kj_per_kwh": 7000,
                    "high_kj_per_kwh": 7000}
            path.write_text(json.dumps({"technologies": {"ccgt": flat}}), encoding="utf-8")
            self.assertEqual(build.load_heat_rates(path), {})  # a triangular draw needs low < high


class UncertaintyAndRebuildTest(unittest.TestCase):
    def test_monte_carlo_is_seeded_and_brackets_both_methods(self):
        r1, r2 = year(), year()
        self.assertEqual(r1["monte_carlo"], r2["monte_carlo"])
        for method, central in (("method_a", r1["kg_co2e_per_kwh"]), ("method_b", r1["method_b"])):
            ci = r1["monte_carlo"][method]["supply_weighted"]
            self.assertLess(ci["p2_5"], central["supply_weighted"], method)
            self.assertGreater(ci["p97_5"], central["supply_weighted"], method)
        with self.assertRaises(ValueError):
            year(draws=500)

    def write_inputs(self, data: Path):
        fy = data / "2022-23"
        fy.mkdir(parents=True)
        (fy / "method_a.json").write_text(json.dumps(asdict(INP)), encoding="utf-8")
        with open(fy / "method_b_plants.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=["plant", "net_gwh", "fuel", "technology", "source", "commissioning_year"])
            w.writeheader()
            for p in PLANTS:
                w.writerow(asdict(p))

    def test_rebuild_is_byte_identical_and_blocked_without_inputs(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            shared = tmp / "shared"
            shared.mkdir()
            for name in ("ipcc2006_defaults.json", "references.json"):
                shutil.copy(build.HERE / name, shared / name)
            (shared / "heat_rates.json").write_text(json.dumps({"technologies": {
                k: {"low_kj_per_kwh": v.low_kj_per_kwh, "central_kj_per_kwh": v.central_kj_per_kwh,
                    "high_kj_per_kwh": v.high_kj_per_kwh, "source": "SYNTHETIC", "status": "CITED"}
                for k, v in RATES.items()}}), encoding="utf-8")
            self.write_inputs(tmp / "data")
            first = json.dumps(build.build(tmp / "data", shared), sort_keys=True)
            self.assertEqual(first, json.dumps(build.build(tmp / "data", shared), sort_keys=True))
            result = json.loads(first)
            self.assertEqual(result["delta_table"][0]["fiscal_year"], "2022-23")
            self.assertIsNotNone(result["delta_table"][0]["method_b"])
            self.assertEqual(result["years"][0]["monte_carlo"]["draws"], 10_000)
            empty = tmp / "empty"
            empty.mkdir()
            self.assertEqual(build.main(["--data", str(empty), "--out", str(tmp / "out.json")]), 2)


class SourceRegisterTest(unittest.TestCase):
    def test_sha256_is_recorded_once_and_never_overwritten(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            folder, reg = tmp / "sources", tmp / "sources.json"
            folder.mkdir()
            reg.write_text(json.dumps({"sources": []}), encoding="utf-8")
            (folder / "synthetic_report.pdf").write_bytes(b"%PDF-1.4 SYNTHETIC")
            self.assertEqual(sources.register(reg, folder, "2026-11-02")["added"], ["synthetic_report.pdf"])
            record = json.loads(reg.read_text(encoding="utf-8"))["files"][0]
            self.assertEqual(record["sha256"], sources.sha256(folder / "synthetic_report.pdf"))
            (folder / "synthetic_report.pdf").write_bytes(b"%PDF-1.4 SYNTHETIC, CHANGED")
            self.assertEqual(sources.register(reg, folder, "2026-11-03")["changed"], ["synthetic_report.pdf"])
            self.assertEqual(json.loads(reg.read_text(encoding="utf-8"))["files"][0]["sha256"], record["sha256"])
            (folder / "synthetic_report.pdf").unlink()
            self.assertEqual(sources.register(reg, folder, "2026-11-04")["missing"], ["synthetic_report.pdf"])


if __name__ == "__main__":
    unittest.main()
