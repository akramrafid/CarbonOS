"""
Cited IPCC 2006 Vol. 2 Combustion Factor Draft Loader.

Produces DRAFT emission factor payloads sourced directly from the pinned
`factors/bd_grid/ipcc2006_defaults.json` PDFs (Table 1.2 & Table 2.2) with explicit
source publisher, SHA-256 document hash, table references, and GWP-100 gas components.

These rows are emitted strictly as DRAFT inputs requiring second-person approval
before any production CalculationRun can consume them.
"""
import datetime as dt
import json
from decimal import Decimal
from pathlib import Path
from typing import Dict, List

DEFAULT_JSON = Path(__file__).resolve().parent / "bd_grid" / "ipcc2006_defaults.json"

GWP100 = {
    "AR6": {"CO2": Decimal("1"), "CH4_fossil": Decimal("29.8"), "N2O": Decimal("273")},
    "AR5": {"CO2": Decimal("1"), "CH4_fossil": Decimal("30"), "N2O": Decimal("265")},
}

# Explicit canonical unit density/NCV bridges (TJ per canonical unit)
CANONICAL_MAPPINGS = {
    "gas_diesel_oil": {
        "activity_type": "diesel",
        "unit": "L",
        "family": "ipcc-2006-diesel-stationary-default",
        # 43.0 TJ/Gg NCV * 0.845 kg/L = 36.335 MJ/L = 0.000036335 TJ/L
        "tj_per_canonical_unit": Decimal("0.000036335"),
        "density_note": "Diesel density 0.845 kg/L applied to IPCC Table 1.2 NCV (43.0 TJ/Gg)",
    },
    "residual_fuel_oil": {
        "activity_type": "furnace_oil",
        "unit": "L",
        "family": "ipcc-2006-furnace-oil-stationary-default",
        # 40.4 TJ/Gg NCV * 0.960 kg/L = 38.784 MJ/L = 0.000038784 TJ/L
        "tj_per_canonical_unit": Decimal("0.000038784"),
        "density_note": "HFO density 0.960 kg/L applied to IPCC Table 1.2 NCV (40.4 TJ/Gg)",
    },
    "natural_gas": {
        "activity_type": "natural_gas",
        "unit": "GJ",
        "family": "ipcc-2006-natural-gas-energy-basis",
        "tj_per_canonical_unit": Decimal("0.001"),  # 1 GJ = 0.001 TJ (on NCV basis)
        "density_note": "Energy basis GJ (NCV) per IPCC Vol. 2 Ch. 2 Table 2.2",
    },
}


def build_ipcc2006_draft_factors(
    gwp_basis: str = "AR6",
    region: str = "GLOBAL",
    defaults_path: Path = DEFAULT_JSON,
) -> List[Dict[str, object]]:
    """
    Returns DRAFT factor payloads compatible with `POST /api/esg/factors`.
    Never pre-approved: requires explicit two-person review in the ledger.
    """
    if gwp_basis not in GWP100:
        raise ValueError(f"Unsupported GWP basis '{gwp_basis}'. Supported: {sorted(GWP100)}")

    raw = json.loads(defaults_path.read_text(encoding="utf-8"))
    fuels = raw["fuels"]
    src_ch2 = raw["sources"]["V2_2_Ch2_Stationary_Combustion.pdf"]
    gwps = GWP100[gwp_basis]

    drafts: List[Dict[str, object]] = []
    for key, spec in CANONICAL_MAPPINGS.items():
        fuel = fuels[key]
        scale = spec["tj_per_canonical_unit"]

        co2_kg = Decimal(str(fuel["co2_kg_per_tj"][0])) * scale
        ch4_kg = Decimal(str(fuel["ch4_kg_per_tj"][0])) * scale
        n2o_kg = Decimal(str(fuel["n2o_kg_per_tj"][0])) * scale

        total_kgco2e = (
            co2_kg * gwps["CO2"]
            + ch4_kg * gwps["CH4_fossil"]
            + n2o_kg * gwps["N2O"]
        )

        # Conservative CO2 95% CI relative half-width from Table 2.2 bounds
        c_def, c_low, c_high = [Decimal(str(v)) for v in fuel["co2_kg_per_tj"]]
        half_width_pct = max((c_high - c_def), (c_def - c_low)) / c_def * Decimal(100)

        drafts.append({
            "family": spec["family"],
            "activity_type": spec["activity_type"],
            "unit": spec["unit"],
            "method": "direct",
            "factor_kind": None,
            "region": region,
            "gwp_basis": gwp_basis,
            "status": "DRAFT",
            "valid_from": dt.date(2006, 1, 1).isoformat(),
            "valid_to": None,
            "kgco2e_per_unit": round(float(total_kgco2e), 6),
            "uncertainty_pct": round(float(half_width_pct), 2),
            "source_publisher": "IPCC Task Force on National Greenhouse Gas Inventories (TFI)",
            "source_document": f"2006 IPCC Guidelines for National GHG Inventories (SHA256: {src_ch2['sha256'][:16]}...)",
            "source_url": src_ch2["url"],
            "source_table_ref": f"{src_ch2['used']} + {spec['density_note']}",
            "source_year": 2006,
            "gas_components": [
                {"gas": "CO2", "kg_per_unit": str(round(co2_kg, 8)), "uncertainty_pct": str(round(half_width_pct, 2))},
                {"gas": "CH4_fossil", "kg_per_unit": str(round(ch4_kg, 8))},
                {"gas": "N2O", "kg_per_unit": str(round(n2o_kg, 8))},
            ],
        })

    return drafts
