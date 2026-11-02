"""
Bangladesh grid emission factors derived from BPDB plant data (Step 1). Pure functions over plain data.
Floats are acceptable here: the result is a statistical estimate, rounded once at output.

Per fiscal year (July-June):
(a) domestic generation-weighted average = sum(plant CO2e) / sum(plant net generation)
(b) supply-weighted average = (sum(CO2e) + imports x declared import factor) / (generation + imports)
(c) (b) adjusted for T&D losses: memo only, never a Scope 2 factor
(d) CDM Tool 07 simple OM / BM / CM: reconciliation artefact only, never a Scope 2 factor
Coverage: plant sums are reconciled with BPDB national totals; an unexplained residual above 2 % makes the
year not reviewable. Uncertainty: seeded Monte Carlo over NCV, emission factors, heating value, density,
the import factor and the imputation of plants without fuel data.
"""
import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np

FT3_M3 = 0.028316846592  # exact (0.3048 m)^3
MMCF_M3 = 1_000_000 * FT3_M3
# CO2e on the AR6 basis: CH4-fossil 29.8, N2O 273 (IPCC AR6 WG1 Table 7.15; same values as esg_rag/gwp.py).
GWP = {"CO2": 1.0, "CH4": 29.8, "N2O": 273.0}
GASES = ("CO2", "CH4", "N2O")
LIQUIDS = {"hfo_litre": "residual_fuel_oil", "hsd_litre": "gas_diesel_oil"}
COVERAGE_LIMIT_PCT = 2.0
MIN_DRAWS = 10_000
Z95 = 1.959964


@dataclass(frozen=True)
class Plant:
    plant: str
    net_generation_mwh: float
    primary_fuel: str  # IPCC fuel key, or "hydro" / "solar" / "wind"
    gas_mmcf: float = 0.0
    hfo_litre: float = 0.0
    hsd_litre: float = 0.0
    coal_tonne: float = 0.0
    coal_type: str = "sub_bituminous_coal"
    coal_ncv_tj_per_gg: Optional[float] = None  # plant-specific NCV; else the IPCC default
    low_cost_must_run: bool = False  # hydro, solar, wind (CDM Tool 07)
    commissioning_year: Optional[int] = None
    fuel_data_missing: bool = False  # generation reported, fuel not: emissions imputed
    source_ref: str = ""


@dataclass(frozen=True)
class National:
    net_generation_mwh: float
    import_mwh: float
    gas_mmcf: Optional[float] = None
    hfo_litre: Optional[float] = None
    hsd_litre: Optional[float] = None
    coal_tonne: Optional[float] = None
    td_loss_pct: Optional[float] = None
    explained_residuals: Dict[str, str] = field(default_factory=dict)  # item -> written explanation
    source_ref: str = ""


@dataclass(frozen=True)
class Params:
    gas_gcv_mj_per_m3: float  # at the reference conditions of BPDB's MMCF
    gas_gcv_uncertainty_pct: float
    gas_ncv_to_gcv: float
    gas_reference_conditions: str
    gas_source: str
    hfo_density_kg_per_l: float
    hsd_density_kg_per_l: float
    density_uncertainty_pct: float
    density_source: str
    import_factor_kg_per_kwh: float
    import_factor_uncertainty_pct: float
    import_factor_source: str
    draws: int = MIN_DRAWS
    seed: int = 20260701


def fuel_energy_tj(p: Plant, prm: Params, ipcc: dict, d: Optional[dict] = None) -> Dict[str, float]:
    """TJ on a net calorific basis per IPCC fuel. `d` overrides parameters for one Monte Carlo draw."""
    d = d or {}
    tj = {}
    if p.gas_mmcf:
        gcv = d.get("gas_gcv", prm.gas_gcv_mj_per_m3)
        tj["natural_gas"] = p.gas_mmcf * MMCF_M3 * gcv * prm.gas_ncv_to_gcv / 1e6
    for column, fuel in LIQUIDS.items():
        litres = getattr(p, column)
        if litres:
            density = d.get(f"{fuel}_density", prm.hfo_density_kg_per_l if fuel == "residual_fuel_oil"
                            else prm.hsd_density_kg_per_l)
            ncv = d.get(f"{fuel}_ncv", ipcc[fuel]["ncv_tj_per_gg"][0])
            tj[fuel] = litres * density / 1e6 * ncv  # kg -> Gg, x TJ/Gg
    if p.coal_tonne:
        ncv = p.coal_ncv_tj_per_gg or d.get(f"{p.coal_type}_ncv", ipcc[p.coal_type]["ncv_tj_per_gg"][0])
        tj[p.coal_type] = tj.get(p.coal_type, 0.0) + p.coal_tonne / 1000 * ncv
    return tj


def plant_emissions(p: Plant, prm: Params, ipcc: dict, d: Optional[dict] = None) -> Dict[str, float]:
    """kg of CO2, CH4, N2O and CO2e for a plant with fuel data."""
    d = d or {}
    out = {g: 0.0 for g in GASES}
    for fuel, tj in fuel_energy_tj(p, prm, ipcc, d).items():
        for gas in GASES:
            out[gas] += tj * d.get(f"{fuel}_{gas}", ipcc[fuel][f"{gas.lower()}_kg_per_tj"][0])
    out["CO2e"] = sum(out[g] * GWP[g] for g in GASES)
    return out


def intensities(plants: List[Plant], prm: Params, ipcc: dict, d: Optional[dict] = None) -> Dict[str, Dict[str, float]]:
    """kg per MWh (CO2 and CO2e) by primary fuel, from plants that report fuel."""
    sums: Dict[str, List[float]] = {}
    for p in plants:
        if p.fuel_data_missing or p.low_cost_must_run or not p.net_generation_mwh:
            continue
        e = plant_emissions(p, prm, ipcc, d)
        s = sums.setdefault(p.primary_fuel, [0.0, 0.0, 0.0])
        s[0] += e["CO2"]
        s[1] += e["CO2e"]
        s[2] += p.net_generation_mwh
    return {fuel: {"CO2": co2 / gen, "CO2e": co2e / gen} for fuel, (co2, co2e, gen) in sums.items()}


def _emissions(p: Plant, prm: Params, ipcc: dict, imputed: Dict[str, Dict[str, float]], d: Optional[dict]) -> Dict[str, float]:
    if p.low_cost_must_run:
        return {"CO2": 0.0, "CO2e": 0.0}
    if p.fuel_data_missing:
        return {k: p.net_generation_mwh * imputed[p.primary_fuel][k] for k in ("CO2", "CO2e")}
    return plant_emissions(p, prm, ipcc, d)


def averages(plants: List[Plant], national: National, prm: Params, ipcc: dict, d: Optional[dict] = None,
             imputed: Optional[Dict[str, Dict[str, float]]] = None) -> Dict[str, float]:
    """(a) domestic generation-weighted and (b) supply-weighted averages, kg CO2e per kWh."""
    imputed = imputed or intensities(plants, prm, ipcc, d)
    co2e = sum(_emissions(p, prm, ipcc, imputed, d)["CO2e"] for p in plants)
    gen_mwh = sum(p.net_generation_mwh for p in plants)
    import_factor = (d or {}).get("import_factor", prm.import_factor_kg_per_kwh)
    return {
        "domestic_generation_weighted": co2e / (gen_mwh * 1000),
        "supply_weighted": (co2e + national.import_mwh * 1000 * import_factor) / ((gen_mwh + national.import_mwh) * 1000),
    }


def tool07(plants: List[Plant], prm: Params, ipcc: dict) -> Dict[str, object]:
    """CDM Tool 07 simple OM, BM and CM (CO2 only), kg/kWh. Reconciliation only: never a Scope 2 factor."""
    imputed = intensities(plants, prm, ipcc)
    co2 = {p.plant: _emissions(p, prm, ipcc, imputed, None)["CO2"] for p in plants}
    fossil = [p for p in plants if not p.low_cost_must_run]
    om = sum(co2[p.plant] for p in fossil) / (sum(p.net_generation_mwh for p in fossil) * 1000)
    dated = sorted((p for p in plants if p.commissioning_year), key=lambda p: (-p.commissioning_year, p.plant))
    total = sum(p.net_generation_mwh for p in plants)
    twenty, acc = [], 0.0
    for p in dated:  # most recent units supplying at least 20 % of generation
        twenty.append(p)
        acc += p.net_generation_mwh
        if acc >= 0.2 * total:
            break
    five = dated[:5]
    group = max((twenty, five), key=lambda g: sum(p.net_generation_mwh for p in g))  # the larger sample
    bm_gen = sum(p.net_generation_mwh for p in group)
    bm = sum(co2[p.plant] for p in group) / (bm_gen * 1000) if bm_gen else None
    return {"operating_margin": om, "build_margin": bm,
            "combined_margin_firm": None if bm is None else 0.5 * om + 0.5 * bm,
            "combined_margin_wind_solar": None if bm is None else 0.75 * om + 0.25 * bm,
            "build_margin_units": [p.plant for p in group]}


def coverage(plants: List[Plant], national: National) -> Dict[str, dict]:
    """Plant sums vs BPDB national totals; |residual| > 2 % must carry a written explanation."""
    items = {"net_generation_mwh": national.net_generation_mwh, "gas_mmcf": national.gas_mmcf,
             "hfo_litre": national.hfo_litre, "hsd_litre": national.hsd_litre, "coal_tonne": national.coal_tonne}
    out = {}
    for item, nat in items.items():
        if nat is None:
            continue
        plant_sum = sum(getattr(p, item) for p in plants)
        residual = (nat - plant_sum) / nat * 100 if nat else 0.0
        explained = national.explained_residuals.get(item)
        out[item] = {"plants": plant_sum, "national": nat, "residual_pct": residual, "explanation": explained,
                     "ok": abs(residual) <= COVERAGE_LIMIT_PCT or bool(explained)}
    return out


def _lognormal(rng, default: float, lower: float, upper: float, n: int) -> np.ndarray:
    """Median-preserving lognormal draws whose 95 % range matches [lower, upper]."""
    sigma = (math.log(upper) - math.log(lower)) / (2 * Z95)
    return default * np.exp(rng.normal(0.0, sigma, n))


def _normal(rng, value: float, pct95: float, n: int) -> np.ndarray:
    return value * (1 + rng.normal(0.0, pct95 / 100 / Z95, n))


def monte_carlo(plants: List[Plant], national: National, prm: Params, ipcc: dict, draws: int, seed: int) -> dict:
    rng = np.random.default_rng(seed)
    fuels = sorted({f for p in plants if not p.fuel_data_missing for f in fuel_energy_tj(p, prm, ipcc)})
    samples = {"gas_gcv": _normal(rng, prm.gas_gcv_mj_per_m3, prm.gas_gcv_uncertainty_pct, draws),
               "import_factor": _normal(rng, prm.import_factor_kg_per_kwh, prm.import_factor_uncertainty_pct, draws),
               "residual_fuel_oil_density": _normal(rng, prm.hfo_density_kg_per_l, prm.density_uncertainty_pct, draws),
               "gas_diesel_oil_density": _normal(rng, prm.hsd_density_kg_per_l, prm.density_uncertainty_pct, draws)}
    for fuel in fuels:
        if fuel != "natural_gas":
            samples[f"{fuel}_ncv"] = _lognormal(rng, *ipcc[fuel]["ncv_tj_per_gg"], draws)
        for gas in GASES:
            samples[f"{fuel}_{gas}"] = _lognormal(rng, *ipcc[fuel][f"{gas.lower()}_kg_per_tj"], draws)
    missing = [p for p in plants if p.fuel_data_missing]
    donors = {f: [p for p in plants if p.primary_fuel == f and not p.fuel_data_missing and not p.low_cost_must_run
                  and p.net_generation_mwh] for f in {p.primary_fuel for p in missing}}
    picks = {p.plant: rng.integers(0, len(donors[p.primary_fuel]), draws) for p in missing}
    gen = sum(p.net_generation_mwh for p in plants)
    a, b = np.empty(draws), np.empty(draws)
    for i in range(draws):
        d = {k: float(v[i]) for k, v in samples.items()}
        co2e = 0.0
        for p in plants:
            if p.low_cost_must_run:
                continue
            if p.fuel_data_missing:  # bootstrap: the intensity of a random same-fuel plant in this draw
                donor = donors[p.primary_fuel][picks[p.plant][i]]
                co2e += p.net_generation_mwh * plant_emissions(donor, prm, ipcc, d)["CO2e"] / donor.net_generation_mwh
            else:
                co2e += plant_emissions(p, prm, ipcc, d)["CO2e"]
        a[i] = co2e / (gen * 1000)
        b[i] = (co2e + national.import_mwh * 1000 * d["import_factor"]) / ((gen + national.import_mwh) * 1000)
    pct = lambda x: {"p2_5": float(np.percentile(x, 2.5)), "p50": float(np.percentile(x, 50)),
                     "p97_5": float(np.percentile(x, 97.5))}
    return {"draws": draws, "seed": seed, "domestic_generation_weighted": pct(a), "supply_weighted": pct(b)}


def derive_year(fiscal_year: str, plants: List[Plant], national: National, prm: Params, ipcc: dict) -> dict:
    if prm.draws < MIN_DRAWS:
        raise ValueError(f"Monte Carlo needs at least {MIN_DRAWS} draws")
    central = averages(plants, national, prm, ipcc)
    cov = coverage(plants, national)
    reviewable = all(c["ok"] for c in cov.values())
    td = national.td_loss_pct
    return {
        "fiscal_year": fiscal_year,
        "status": "DRAFT_REVIEWABLE" if reviewable else "DRAFT_COVERAGE_GAP",
        "kg_co2e_per_kwh": central,
        "td_loss_adjusted_memo": None if td is None else central["supply_weighted"] / (1 - td / 100),
        "cdm_tool07_reconciliation_only": tool07(plants, prm, ipcc),
        "coverage": cov,
        "monte_carlo": monte_carlo(plants, national, prm, ipcc, prm.draws, prm.seed),
        "imputed_plants": sorted(p.plant for p in plants if p.fuel_data_missing),
        "gwp_basis": "AR6",
    }


def draft_factor_rows(result: dict, grid_region: str, source_document: str, source_table_ref: str) -> List[dict]:
    """Ledger factor payloads (created DRAFT; a second person approves). Kind is always grid_average: the
    Tool 07 margins are never offered as factors."""
    fy = result["fiscal_year"]  # "2022-23"
    start = int(fy[:4])
    rows = []
    for key, family in (("supply_weighted", "bd-grid-average-supply"),
                        ("domestic_generation_weighted", "bd-grid-average-domestic")):
        value = result["kg_co2e_per_kwh"][key]
        mc = result["monte_carlo"][key]
        half = max(value - mc["p2_5"], mc["p97_5"] - value) / value * 100
        rows.append({
            "family": family, "activity_type": "electricity", "unit": "kWh", "kgco2e_per_unit": f"{value:.6f}",
            "region": grid_region, "gwp_basis": "AR6", "method": "location", "factor_kind": "grid_average",
            "valid_from": f"{start}-07-01", "valid_to": f"{start + 1}-06-30",
            "source_publisher": "CarbonOS derivation from BPDB data (factors/bd_grid)",
            "source_document": source_document[:300], "source_table_ref": source_table_ref[:200],
            "source_year": start + 1, "uncertainty_pct": f"{half:.2f}",
            "licence_note": f"Status {result['status']}; Monte Carlo {mc['p2_5']:.4f}-{mc['p97_5']:.4f} kg/kWh "
                            f"(95 %, {result['monte_carlo']['draws']} draws); DRAFT until a second person approves.",
        })
    return rows
