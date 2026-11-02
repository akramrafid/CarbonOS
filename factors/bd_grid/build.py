"""
Rebuild factors/bd_grid/output/bd_grid_factors.json from extracted, pinned BPDB inputs.

Inputs, one folder per fiscal year under factors/bd_grid/data/<FY>/ (e.g. data/2022-23/):
  plants.csv     one row per power plant; columns are the derive.Plant fields
  national.json  BPDB national totals for the year (derive.National fields)
  params.json    heating value, densities, import factor, Monte Carlo draws/seed (derive.Params fields)
factors/bd_grid/sources.json lists each source PDF's URL, SHA-256 and the tables and pages used.

Same inputs → byte-identical output: sorted keys, values rounded once, seeded Monte Carlo.
Usage: python -m factors.bd_grid.build [--data DIR] [--out FILE]
"""
import argparse
import csv
import hashlib
import json
import sys
from dataclasses import fields
from pathlib import Path

import numpy as np

from . import derive

HERE = Path(__file__).resolve().parent
FLOAT_FIELDS = {"net_generation_mwh", "gas_mmcf", "hfo_litre", "hsd_litre", "coal_tonne", "coal_ncv_tj_per_gg"}
BOOL_FIELDS = {"low_cost_must_run", "fuel_data_missing"}


def _plant(row: dict) -> derive.Plant:
    kw = {}
    for f in fields(derive.Plant):
        raw = (row.get(f.name) or "").strip()
        if raw == "":
            continue
        if f.name in FLOAT_FIELDS:
            kw[f.name] = float(raw)
        elif f.name in BOOL_FIELDS:
            kw[f.name] = raw.lower() in ("1", "true", "yes")
        elif f.name == "commissioning_year":
            kw[f.name] = int(raw)
        else:
            kw[f.name] = raw
    return derive.Plant(**kw)


def _round(obj, places: int = 6):
    if isinstance(obj, float):
        return round(obj, places)
    if isinstance(obj, dict):
        return {k: _round(v, places) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_round(v, places) for v in obj]
    return obj


def build(data_dir: Path, ipcc_path: Path = HERE / "ipcc2006_defaults.json") -> dict:
    ipcc = json.loads(ipcc_path.read_text(encoding="utf-8"))["fuels"]
    years, digest = [], hashlib.sha256(ipcc_path.read_bytes())
    for year_dir in sorted(p for p in data_dir.iterdir() if p.is_dir()):
        files = [year_dir / "plants.csv", year_dir / "national.json", year_dir / "params.json"]
        for f in files:
            digest.update(f.name.encode() + b"\0" + f.read_bytes())
        with open(files[0], newline="", encoding="utf-8") as fh:
            plants = [_plant(r) for r in csv.DictReader(fh)]
        national = derive.National(**json.loads(files[1].read_text(encoding="utf-8")))
        params = derive.Params(**json.loads(files[2].read_text(encoding="utf-8")))
        years.append(derive.derive_year(year_dir.name, plants, national, params, ipcc))
    return _round({"schema": "carbonos.bd_grid/1", "inputs_sha256": digest.hexdigest(), "numpy": np.__version__,
                   "years": years})


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    ap.add_argument("--data", type=Path, default=HERE / "data")
    ap.add_argument("--out", type=Path, default=HERE / "output" / "bd_grid_factors.json")
    args = ap.parse_args(argv)
    if not args.data.is_dir() or not any(p.is_dir() for p in args.data.iterdir()):
        print(f"BLOCKED: no extracted BPDB inputs under {args.data} (see factors/bd_grid/README.md)", file=sys.stderr)
        return 2
    result = build(args.data)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, sort_keys=True, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {args.out} ({len(result['years'])} fiscal year(s), inputs {result['inputs_sha256'][:12]})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
