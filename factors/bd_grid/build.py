"""
Rebuild factors/bd_grid/output/bd_grid_factors.json from extracted, pinned inputs (both methods).

Per fiscal year, factors/bd_grid/data/<FY>/ (e.g. data/2022-23/):
  method_a.json        fuel balance (derive.MethodAInputs: gas with heating value, liquids, coal, imports, cea,
                       public_sector, explanations), every figure with its source document, table and page
  method_b_plants.csv  plant-wise generation with fuel and technology (derive.PlantB fields); optional
Shared: heat_rates.json (cited technology ranges; NOT_SOURCED entries are ignored), references.json (IFI, Ember),
ipcc2006_defaults.json. Source documents go in factors/bd_grid/sources/ and `python -m factors.bd_grid.sources`
records their SHA-256.

Same inputs → byte-identical output: sorted keys, values rounded once, seeded Monte Carlo.
Usage: python -m factors.bd_grid.build [--data DIR] [--out FILE] [--draws N]
"""
import argparse
import csv
import hashlib
import json
import sys
from pathlib import Path
from typing import Dict, List

import numpy as np

from . import derive

HERE = Path(__file__).resolve().parent
SHARED = ("ipcc2006_defaults.json", "heat_rates.json", "references.json")


def load_method_a(path: Path) -> derive.MethodAInputs:
    raw = json.loads(path.read_text(encoding="utf-8"))
    gas = dict(raw.pop("gas"))
    hv = gas.pop("heating_value", None)
    raw.pop("factor_source_document", None)
    return derive.MethodAInputs(
        **{k: v for k, v in raw.items() if k not in ("liquids", "coal", "imports", "cea")},
        gas=derive.Gas(**gas, heating_value=derive.HeatingValue(**hv) if hv else None),
        liquids=tuple(derive.Liquid(**x) for x in raw.get("liquids", [])),
        coal=tuple(derive.Coal(**x) for x in raw.get("coal", [])),
        imports=tuple(derive.Import(**x) for x in raw.get("imports", [])),
        cea=derive.CEA(**raw["cea"]) if raw.get("cea") else None)


def load_plants(path: Path) -> List[derive.PlantB]:
    if not path.is_file():
        return []
    with open(path, newline="", encoding="utf-8") as fh:
        return [derive.PlantB(plant=r["plant"], net_gwh=float(r["net_gwh"]), fuel=r["fuel"],
                              technology=(r.get("technology") or "").strip(), source=r.get("source", ""),
                              commissioning_year=int(r["commissioning_year"]) if (r.get("commissioning_year") or "").strip() else None)
                for r in csv.DictReader(fh)]


def load_heat_rates(path: Path) -> Dict[str, derive.HeatRate]:
    """Only CITED ranges with low ≤ central ≤ high and low < high are usable (a triangular draw needs a range);
    anything else stays out (Method B is then BLOCKED)."""
    out = {}
    for tech, r in json.loads(path.read_text(encoding="utf-8"))["technologies"].items():
        numbers = [r.get(k) for k in ("low_kj_per_kwh", "central_kj_per_kwh", "high_kj_per_kwh")]
        if r.get("status") == "CITED" and r.get("source") and all(n is not None for n in numbers) \
                and numbers[0] <= numbers[1] <= numbers[2] and numbers[0] < numbers[2]:
            out[tech] = derive.HeatRate(*numbers, source=r["source"])
    return out


def _round(obj, places: int = 6):
    if isinstance(obj, float):
        return round(obj, places)
    if isinstance(obj, dict):
        return {k: _round(v, places) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_round(v, places) for v in obj]
    return obj


def build(data_dir: Path, shared_dir: Path = HERE, draws: int = derive.MIN_DRAWS) -> dict:
    digest = hashlib.sha256()
    for name in SHARED:
        digest.update(name.encode() + b"\0" + (shared_dir / name).read_bytes())
    ipcc = json.loads((shared_dir / "ipcc2006_defaults.json").read_text(encoding="utf-8"))["fuels"]
    heat_rates = load_heat_rates(shared_dir / "heat_rates.json")
    references = json.loads((shared_dir / "references.json").read_text(encoding="utf-8"))
    years, delta_table = [], []
    for year_dir in sorted(p for p in data_dir.iterdir() if p.is_dir()):
        files = [f for f in (year_dir / "method_a.json", year_dir / "method_b_plants.csv") if f.is_file()]
        for f in files:
            digest.update(f"{year_dir.name}/{f.name}".encode() + b"\0" + f.read_bytes())
        raw = json.loads((year_dir / "method_a.json").read_text(encoding="utf-8"))
        result = derive.derive_year(year_dir.name, load_method_a(year_dir / "method_a.json"),
                                    load_plants(year_dir / "method_b_plants.csv"), heat_rates, ipcc, references, draws)
        result["draft_factor_rows"] = derive.draft_factor_rows(
            result, "BD-NATIONAL-GRID", raw.get("factor_source_document", "CarbonOS Method A fuel balance; see sources.json"),
            raw.get("net_generation_source", ""))
        years.append(result)
        method_b = result.get("method_b") or {}
        delta_table.append({"fiscal_year": year_dir.name, "status": result["status"],
                            "method_a": result.get("kg_co2e_per_kwh"),
                            "method_b": None if "blocked_by" in method_b or not method_b
                            else {k: method_b[k] for k in derive.AVERAGES},
                            "gap_pct": result.get("method_gap_pct"),
                            "explanation": result.get("method_gap_explanation"),
                            "references": (result.get("reference_deltas") or {}).get("rows", [])})
    return _round({"schema": "carbonos.bd_grid/2", "inputs_sha256": digest.hexdigest(), "numpy": np.__version__,
                   "delta_table": delta_table, "years": years})


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--data", type=Path, default=HERE / "data")
    ap.add_argument("--out", type=Path, default=HERE / "output" / "bd_grid_factors.json")
    ap.add_argument("--draws", type=int, default=derive.MIN_DRAWS)
    args = ap.parse_args(argv)
    if not args.data.is_dir() or not any((p / "method_a.json").is_file() for p in args.data.iterdir() if p.is_dir()):
        print(f"BLOCKED: no extracted inputs under {args.data} (data/<FY>/method_a.json; see factors/bd_grid/README.md)",
              file=sys.stderr)
        return 2
    result = build(args.data, draws=args.draws)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, sort_keys=True, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {args.out} ({len(result['years'])} fiscal year(s), inputs {result['inputs_sha256'][:12]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
