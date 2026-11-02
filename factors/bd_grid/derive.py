"""
Bangladesh grid-average emission factor (Step 1): two independent estimates per fiscal year (July–June).

Method A (primary), top-down fuel balance: fuel delivered to grid-connected generation (Petrobangla gas sales to
the power sector with captive generation EXCLUDED, since that is the factories' own Scope 1; BPC liquid-fuel
sales to power; coal per plant from the operators' reports, in tonnes with NCV) → TJ on a net calorific basis →
CO2, CH4, N2O with IPCC 2006 Vol. 2 Ch. 2 defaults → CO2e (AR6), divided by BPDB national net generation.
BPDB's public-sector fuel totals are a partial cross-check only.

Method B (cross-check), bottom-up generation by fuel: plant-wise kWh (BPDB purchases and own generation) mapped
to fuel and technology (installed-capacity table) × a cited technology heat-rate range → fuel → emissions.

Imports, in both: Adani Godda at its plant-specific factor; other Indian supply (NVVN, PGCIL, ...) at the latest
CEA CO2 Baseline Database weighted average including cross-border transfers.

Per year: (a) domestic generation-weighted and (b) supply-weighted averages from A and from B; the A–B gap (over
5 % and not explained → DRAFT_METHOD_GAP); (c) a T&D-adjusted memo; (d) CDM Tool 07 OM/BM/CM from Method B's
plant list, for reconciliation only; deltas against the IFI harmonised dataset and Ember; and a seeded Monte Carlo
(≥ 10 000 draws, 95 % interval). A missing input raises Blocked: nothing is guessed.

Floats: the result is a statistical estimate, rounded once at output. The arithmetic works on scalars or on numpy
arrays of draws, so the Monte Carlo reuses exactly the same functions.
"""
import math
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

import numpy as np

FT3_M3 = 0.028316846592  # exact (0.3048 m)^3
GAS_UNITS_M3 = {"m3": 1.0, "Mm3": 1e6, "MMscf": 1e6 * FT3_M3, "Bcf": 1e9 * FT3_M3}
LIQUID_UNITS = {"t": ("kg", 1000.0), "kg": ("kg", 1.0), "kL": ("L", 1000.0), "L": ("L", 1.0)}
GWP = {"CO2": 1.0, "CH4": 29.8, "N2O": 273.0}  # AR6 WG1 Table 7.15 (CH4 fossil); same values as esg_rag/gwp.py
GASES = ("CO2", "CH4", "N2O")
LIQUID_FUELS = ("residual_fuel_oil", "gas_diesel_oil")
COAL_TYPES = ("other_bituminous_coal", "sub_bituminous_coal")
ZERO_CARBON = ("hydro", "solar", "wind")
AVERAGES = ("domestic_generation_weighted", "supply_weighted")
METHOD_GAP_LIMIT_PCT = 5.0
REFERENCE_GAP_LIMIT_PCT = 5.0
MIN_DRAWS = 10_000
Z95 = 1.959964


class Blocked(ValueError):
    """A required input is missing or unusable, so this estimate is not produced."""


@dataclass(frozen=True)
class HeatingValue:
    gcv_mj_per_m3: float  # at the reference conditions of the gas quantity's unit
    ncv_to_gcv: float
    reference_conditions: str
    source: str  # a cited national value; or, with is_default, a declared default
    is_default: bool = False
    uncertainty_pct: float = 0.0


@dataclass(frozen=True)
class Gas:
    quantity: float
    unit: str  # m3, Mm3, MMscf, Bcf
    excludes_captive: bool
    source: str
    quantity_uncertainty_pct: float = 0.0
    heating_value: Optional[HeatingValue] = None


@dataclass(frozen=True)
class Liquid:
    fuel: str  # residual_fuel_oil, gas_diesel_oil
    quantity: float
    unit: str  # t, kg, kL, L
    source: str
    density_kg_per_l: Optional[float] = None
    density_source: str = ""
    density_uncertainty_pct: float = 0.0
    quantity_uncertainty_pct: float = 0.0


@dataclass(frozen=True)
class Coal:
    plant: str
    tonnes: float
    coal_type: str
    source: str
    ncv_tj_per_gg: Optional[float] = None  # operator-reported NCV; else the IPCC default for the coal type
    ncv_source: str = ""
    ncv_uncertainty_pct: float = 0.0
    quantity_uncertainty_pct: float = 0.0


@dataclass(frozen=True)
class Import:
    supplier: str
    gwh: float
    source: str
    factor_kg_per_kwh: Optional[float] = None  # plant-specific (Adani Godda); None → CEA weighted average
    factor_uncertainty_pct: float = 0.0
    factor_source: str = ""


@dataclass(frozen=True)
class CEA:
    weighted_average_kg_per_kwh: float
    includes_cross_border: bool
    version: str
    source: str
    uncertainty_pct: float = 0.0


@dataclass(frozen=True)
class MethodAInputs:
    net_generation_gwh: float
    net_generation_includes_imports: bool
    net_generation_source: str
    gas: Gas
    liquids: Tuple[Liquid, ...] = ()
    coal: Tuple[Coal, ...] = ()
    imports: Tuple[Import, ...] = ()
    cea: Optional[CEA] = None
    net_generation_uncertainty_pct: float = 0.0
    public_sector: Optional[Dict[str, float]] = None  # BPDB public-sector totals: gas_m3, <liquid>_kg, coal_t
    td_loss_pct: Optional[float] = None
    explanations: Dict[str, str] = field(default_factory=dict)  # method_gap, reference_gap, coverage


@dataclass(frozen=True)
class PlantB:
    plant: str
    net_gwh: float
    fuel: str  # IPCC fuel key, or hydro / solar / wind
    technology: str  # heat-rate key; ignored for zero-carbon plants
    source: str  # BPDB table and page
    commissioning_year: Optional[int] = None


@dataclass(frozen=True)
class HeatRate:
    low_kj_per_kwh: float
    central_kj_per_kwh: float
    high_kj_per_kwh: float
    source: str


def _v(d, key, default):
    return default if d is None else d.get(key, default)


# --- Method A ---------------------------------------------------------------------------------

def gas_tj(g: Gas, d=None):
    if not g.excludes_captive:
        raise Blocked("Gas: the power-sector quantity must exclude captive generation (the factories' own Scope 1)")
    if g.heating_value is None:
        raise Blocked("Gas: no heating value. Cite a national value, or declare a default (flagged HIGH_UNCERTAINTY)")
    if g.unit not in GAS_UNITS_M3:
        raise Blocked(f"Gas: unknown unit '{g.unit}'")
    m3 = g.quantity * GAS_UNITS_M3[g.unit] * _v(d, "gas_quantity", 1.0)
    return m3 * _v(d, "gas_gcv", g.heating_value.gcv_mj_per_m3) * g.heating_value.ncv_to_gcv / 1e6  # MJ → TJ


def liquid_kg(liquid: Liquid, d=None):
    if liquid.fuel not in LIQUID_FUELS or liquid.unit not in LIQUID_UNITS:
        raise Blocked(f"Liquid fuel: unknown fuel '{liquid.fuel}' or unit '{liquid.unit}'")
    kind, scale = LIQUID_UNITS[liquid.unit]
    q = liquid.quantity * scale * _v(d, f"{liquid.fuel}_quantity", 1.0)
    if kind == "L":
        if liquid.density_kg_per_l is None:
            raise Blocked(f"{liquid.fuel}: a volume needs a cited density")
        q = q * _v(d, f"{liquid.fuel}_density", liquid.density_kg_per_l)
    return q


def coal_tj(c: Coal, ipcc, d=None):
    if c.coal_type not in COAL_TYPES:
        raise Blocked(f"Coal {c.plant}: unknown coal type '{c.coal_type}'")
    ncv = c.ncv_tj_per_gg if c.ncv_tj_per_gg is not None else ipcc[c.coal_type]["ncv_tj_per_gg"][0]
    return c.tonnes / 1000 * _v(d, f"coal:{c.plant}:quantity", 1.0) * _v(d, f"coal:{c.plant}:ncv", ncv)


def fuel_emissions(tj_by_fuel: Dict[str, object], ipcc, d=None) -> Dict[str, object]:
    out = {gas: 0.0 for gas in GASES}
    for fuel, tj in sorted(tj_by_fuel.items()):
        for gas in GASES:
            out[gas] = out[gas] + tj * _v(d, f"{fuel}:{gas}", ipcc[fuel][f"{gas.lower()}_kg_per_tj"][0])
    out["CO2e"] = sum((out[gas] * GWP[gas] for gas in GASES), 0.0)
    return out


def import_kg(imports, cea: Optional[CEA], d=None):
    total = 0.0
    for i in imports:
        if i.factor_kg_per_kwh is not None:
            factor = _v(d, f"import:{i.supplier}", i.factor_kg_per_kwh)
        else:
            if cea is None:
                raise Blocked(f"Import {i.supplier}: needs the latest CEA CO2 Baseline Database weighted average")
            if not cea.includes_cross_border:
                raise Blocked("CEA: use the weighted average that includes cross-border transfers")
            factor = _v(d, "cea", cea.weighted_average_kg_per_kwh)
        total = total + i.gwh * 1e6 * factor
    return total


def _averages(domestic_kg, imports_kg, generation_gwh, import_gwh, includes_imports: bool) -> Dict[str, object]:
    domestic_gwh = generation_gwh - import_gwh if includes_imports else generation_gwh
    supply_gwh = generation_gwh if includes_imports else generation_gwh + import_gwh
    return {"domestic_generation_weighted": domestic_kg / (domestic_gwh * 1e6),
            "supply_weighted": (domestic_kg + imports_kg) / (supply_gwh * 1e6)}


def method_a(inp: MethodAInputs, ipcc, d=None) -> dict:
    tj = {"natural_gas": gas_tj(inp.gas, d)}
    for liquid in inp.liquids:
        tj[liquid.fuel] = tj.get(liquid.fuel, 0.0) + liquid_kg(liquid, d) / 1e6 * _v(
            d, f"{liquid.fuel}:ncv", ipcc[liquid.fuel]["ncv_tj_per_gg"][0])
    for c in inp.coal:
        tj[c.coal_type] = tj.get(c.coal_type, 0.0) + coal_tj(c, ipcc, d)
    emissions = fuel_emissions(tj, ipcc, d)
    imports = import_kg(inp.imports, inp.cea, d)
    generation = inp.net_generation_gwh * _v(d, "net_generation", 1.0)
    out = _averages(emissions["CO2e"], imports, generation, sum(i.gwh for i in inp.imports),
                    inp.net_generation_includes_imports)
    return {**out, "fuel_tj": tj, "domestic_kg": emissions, "import_kg_co2e": imports}


# --- Method B ---------------------------------------------------------------------------------

def plant_tj(p: PlantB, heat_rates: Dict[str, HeatRate], d=None):
    hr = heat_rates.get(p.technology)
    if hr is None:
        raise Blocked(f"{p.plant}: no cited heat-rate range for technology '{p.technology}'")
    rate = _v(d, f"heat_rate:{p.technology}", hr.central_kj_per_kwh)
    return p.net_gwh * _v(d, "plant_generation", 1.0) * rate / 1000  # GWh × kJ/kWh → TJ


def method_b(plants: List[PlantB], inp: MethodAInputs, heat_rates: Dict[str, HeatRate], ipcc, d=None) -> dict:
    if not plants:
        raise Blocked("Method B: no plant-wise generation list")
    tj, generation = {}, 0.0
    for p in plants:
        generation = generation + p.net_gwh * _v(d, "plant_generation", 1.0)
        if p.fuel in ZERO_CARBON:
            continue
        if p.fuel not in ipcc:
            raise Blocked(f"{p.plant}: unknown fuel '{p.fuel}'")
        tj[p.fuel] = tj.get(p.fuel, 0.0) + plant_tj(p, heat_rates, d)
    emissions = fuel_emissions(tj, ipcc, d)
    imports = import_kg(inp.imports, inp.cea, d)
    out = _averages(emissions["CO2e"], imports, generation, sum(i.gwh for i in inp.imports), False)
    return {**out, "fuel_tj": tj, "domestic_kg": emissions, "domestic_gwh": generation}


def tool07(plants: List[PlantB], heat_rates: Dict[str, HeatRate], ipcc) -> Dict[str, object]:
    """CDM Tool 07 simple OM, BM and CM (CO2 only), kg/kWh, from Method B's plants. Reconciliation only: the
    margins describe what an added MWh displaces, never the grid a consumer draws from."""
    co2 = {p.plant: 0.0 if p.fuel in ZERO_CARBON else
           plant_tj(p, heat_rates) * ipcc[p.fuel]["co2_kg_per_tj"][0] for p in plants}
    fossil = [p for p in plants if p.fuel not in ZERO_CARBON]
    fossil_gwh = sum(p.net_gwh for p in fossil)
    om = sum(co2[p.plant] for p in fossil) / (fossil_gwh * 1e6) if fossil_gwh else None
    dated = sorted((p for p in plants if p.commissioning_year), key=lambda p: (-p.commissioning_year, p.plant))
    total = sum(p.net_gwh for p in plants)
    recent, acc = [], 0.0
    for p in dated:  # most recent units supplying at least 20 % of generation
        recent.append(p)
        acc += p.net_gwh
        if acc >= 0.2 * total:
            break
    group = max((recent, dated[:5]), key=lambda g: sum(p.net_gwh for p in g))  # the larger sample
    bm_gwh = sum(p.net_gwh for p in group)
    bm = sum(co2[p.plant] for p in group) / (bm_gwh * 1e6) if bm_gwh else None
    both = om is not None and bm is not None
    return {"operating_margin": om, "build_margin": bm,
            "combined_margin_firm": 0.5 * om + 0.5 * bm if both else None,
            "combined_margin_wind_solar": 0.75 * om + 0.25 * bm if both else None,
            "build_margin_units": [p.plant for p in group]}


# --- checks -----------------------------------------------------------------------------------

def public_sector_check(inp: MethodAInputs) -> Dict[str, dict]:
    """BPDB public-sector fuel totals are a subset of all grid-connected generation: they may not exceed the
    Method A totals. A partial cross-check only (public-sector plants are not the whole grid)."""
    totals = {"gas_m3": inp.gas.quantity * GAS_UNITS_M3.get(inp.gas.unit, float("nan")),
              "coal_t": sum(c.tonnes for c in inp.coal)}
    for liquid in inp.liquids:
        key = f"{liquid.fuel}_kg"
        totals[key] = totals.get(key, 0.0) + liquid_kg(liquid)
    out = {}
    for key, value in sorted((inp.public_sector or {}).items()):
        if key in totals and totals[key]:
            out[key] = {"public_sector": value, "method_a": totals[key], "share_pct": value / totals[key] * 100,
                        "ok": value <= totals[key] or bool(inp.explanations.get("coverage"))}
    return out


def reference_deltas(a: dict, tool: Optional[dict], references: dict, fiscal_year: str, explanations) -> dict:
    """Acceptance A2: derived values against external references. An unexplained gap over 5 % blocks approval."""
    rows = []
    ifi = references.get("ifi_harmonized_grid_ef") or {}
    if tool and tool.get("combined_margin_firm") is not None:
        for key, ref_key in (("combined_margin_firm", "combined_margin_firm_kg_per_kwh"),
                             ("combined_margin_wind_solar", "combined_margin_intermittent_kg_per_kwh")):
            if ifi.get(ref_key) is not None:
                rows.append({"derived": f"tool07.{key}", "reference": f"IFI {ifi.get('version')} {ref_key}",
                             "derived_value": tool[key], "reference_value": ifi[ref_key],
                             "reference_status": ifi.get("status")})
    ember = (references.get("ember") or {}).get("kg_per_kwh_by_calendar_year") or {}
    start = int(fiscal_year[:4])
    years = [str(y) for y in (start, start + 1) if str(y) in ember]
    if years:  # Ember is calendar-year; the fiscal year spans two of them
        rows.append({"derived": "method_a.supply_weighted", "reference": f"Ember mean of {', '.join(years)}",
                     "derived_value": a["supply_weighted"], "reference_value": sum(ember[y] for y in years) / len(years),
                     "reference_status": references["ember"].get("status")})
    explained = bool(explanations.get("reference_gap"))
    for r in rows:
        r["gap_pct"] = (r["derived_value"] - r["reference_value"]) / r["reference_value"] * 100
        r["ok"] = abs(r["gap_pct"]) <= REFERENCE_GAP_LIMIT_PCT or explained
    return {"rows": rows, "explanation": explanations.get("reference_gap"),
            "blocks_approval": any(not r["ok"] for r in rows)}


# --- uncertainty --------------------------------------------------------------------------------

def _lognormal(rng, default: float, lower: float, upper: float, n: int) -> np.ndarray:
    """Median-preserving lognormal draws whose 95 % range matches [lower, upper]."""
    sigma = (math.log(upper) - math.log(lower)) / (2 * Z95)
    return default * np.exp(rng.normal(0.0, sigma, n))


def _normal(rng, value: float, pct95: float, n: int) -> np.ndarray:
    return value * (1 + rng.normal(0.0, pct95 / 100 / Z95, n))


def _percentiles(x) -> Dict[str, float]:
    return {"p2_5": float(np.percentile(x, 2.5)), "p50": float(np.percentile(x, 50)),
            "p97_5": float(np.percentile(x, 97.5))}


def _draws(inp: MethodAInputs, plants, heat_rates, ipcc, n: int, rng) -> Dict[str, np.ndarray]:
    """One array per uncertain input, drawn in a fixed order so the same seed gives the same result."""
    d = {"gas_quantity": _normal(rng, 1.0, inp.gas.quantity_uncertainty_pct, n),
         "gas_gcv": _normal(rng, inp.gas.heating_value.gcv_mj_per_m3, inp.gas.heating_value.uncertainty_pct, n),
         "net_generation": _normal(rng, 1.0, inp.net_generation_uncertainty_pct, n),
         "plant_generation": _normal(rng, 1.0, inp.net_generation_uncertainty_pct, n)}
    fuels = {"natural_gas"}
    for liquid in inp.liquids:
        fuels.add(liquid.fuel)
        d[f"{liquid.fuel}_quantity"] = _normal(rng, 1.0, liquid.quantity_uncertainty_pct, n)
        if liquid.density_kg_per_l is not None:
            d[f"{liquid.fuel}_density"] = _normal(rng, liquid.density_kg_per_l, liquid.density_uncertainty_pct, n)
        d[f"{liquid.fuel}:ncv"] = _lognormal(rng, *ipcc[liquid.fuel]["ncv_tj_per_gg"], n)
    for c in inp.coal:
        fuels.add(c.coal_type)
        d[f"coal:{c.plant}:quantity"] = _normal(rng, 1.0, c.quantity_uncertainty_pct, n)
        d[f"coal:{c.plant}:ncv"] = (_normal(rng, c.ncv_tj_per_gg, c.ncv_uncertainty_pct, n) if c.ncv_tj_per_gg is not None
                                    else _lognormal(rng, *ipcc[c.coal_type]["ncv_tj_per_gg"], n))
    fuels |= {p.fuel for p in plants if p.fuel in ipcc}
    for fuel in sorted(fuels):
        for gas in GASES:
            d[f"{fuel}:{gas}"] = _lognormal(rng, *ipcc[fuel][f"{gas.lower()}_kg_per_tj"], n)
    for i in inp.imports:
        if i.factor_kg_per_kwh is not None:
            d[f"import:{i.supplier}"] = _normal(rng, i.factor_kg_per_kwh, i.factor_uncertainty_pct, n)
    if inp.cea is not None:
        d["cea"] = _normal(rng, inp.cea.weighted_average_kg_per_kwh, inp.cea.uncertainty_pct, n)
    for tech in sorted({p.technology for p in plants if p.fuel not in ZERO_CARBON and p.technology in heat_rates}):
        hr = heat_rates[tech]
        d[f"heat_rate:{tech}"] = rng.triangular(hr.low_kj_per_kwh, hr.central_kj_per_kwh, hr.high_kj_per_kwh, n)
    return d


def monte_carlo(inp: MethodAInputs, plants, heat_rates, ipcc, draws: int, seed: int, with_b: bool) -> dict:
    rng = np.random.default_rng(seed)
    d = _draws(inp, plants, heat_rates, ipcc, draws, rng)
    a = method_a(inp, ipcc, d)
    out = {"draws": draws, "seed": seed, "method_a": {k: _percentiles(a[k]) for k in AVERAGES}}
    if with_b:
        b = method_b(plants, inp, heat_rates, ipcc, d)
        out["method_b"] = {k: _percentiles(b[k]) for k in AVERAGES}
    return out


# --- one fiscal year ------------------------------------------------------------------------------

def _summary(result: dict) -> dict:
    return {**{k: result[k] for k in AVERAGES}, "fuel_tj": result["fuel_tj"], "domestic_kg": result["domestic_kg"]}


def derive_year(fiscal_year: str, inp: MethodAInputs, plants: List[PlantB], heat_rates: Dict[str, HeatRate], ipcc,
                references: Optional[dict] = None, draws: int = MIN_DRAWS, seed: int = 20260701) -> dict:
    if draws < MIN_DRAWS:
        raise ValueError(f"Monte Carlo needs at least {MIN_DRAWS} draws")
    try:
        a = method_a(inp, ipcc)
    except Blocked as e:
        return {"fiscal_year": fiscal_year, "status": "BLOCKED", "blocked_by": str(e)}
    flags = []
    if inp.gas.heating_value.is_default:
        flags.append(f"HIGH_UNCERTAINTY: declared default gas heating value ({inp.gas.heating_value.source})")
    b, b_blocked = None, None
    try:
        b = method_b(plants, inp, heat_rates, ipcc)
    except Blocked as e:
        b_blocked = str(e)
    gap = {k: (b[k] - a[k]) / a[k] * 100 for k in AVERAGES} if b else None
    method_gap_ok = gap is not None and (all(abs(g) <= METHOD_GAP_LIMIT_PCT for g in gap.values())
                                         or bool(inp.explanations.get("method_gap")))
    cross = public_sector_check(inp)
    tool = tool07(plants, heat_rates, ipcc) if b else None
    refs = reference_deltas(a, tool, references or {}, fiscal_year, inp.explanations)
    if not all(c["ok"] for c in cross.values()):
        status = "DRAFT_COVERAGE_GAP"
    elif b is None:
        status = "DRAFT_NO_CROSS_CHECK"
    elif not method_gap_ok:
        status = "DRAFT_METHOD_GAP"
    elif refs["blocks_approval"]:
        status = "DRAFT_REFERENCE_GAP"
    else:
        status = "DRAFT_REVIEWABLE"
    td = inp.td_loss_pct
    return {
        "fiscal_year": fiscal_year,
        "status": status,
        "flags": flags,
        "kg_co2e_per_kwh": {k: a[k] for k in AVERAGES},  # Method A, the primary estimate
        "method_a": _summary(a),
        "method_b": _summary(b) if b else {"blocked_by": b_blocked},
        "method_gap_pct": gap,
        "method_gap_explanation": inp.explanations.get("method_gap"),
        "td_loss_adjusted_memo": None if td is None else a["supply_weighted"] / (1 - td / 100),
        "cdm_tool07_reconciliation_only": tool,
        "public_sector_crosscheck": cross,
        "reference_deltas": refs,
        "monte_carlo": monte_carlo(inp, plants, heat_rates, ipcc, draws, seed, with_b=b is not None),
        "gwp_basis": "AR6",
    }


def draft_factor_rows(result: dict, grid_region: str, source_document: str, source_table_ref: str) -> List[dict]:
    """Ledger factor payloads from Method A (created DRAFT; a second person approves). The kind is always
    grid_average: the Tool 07 margins are never offered as factors. A BLOCKED year gives no rows."""
    if result["status"] == "BLOCKED":
        return []
    start = int(result["fiscal_year"][:4])
    rows = []
    for key, family in (("supply_weighted", "bd-grid-average-supply"),
                        ("domestic_generation_weighted", "bd-grid-average-domestic")):
        value = result["kg_co2e_per_kwh"][key]
        mc = result["monte_carlo"]["method_a"][key]
        half = max(value - mc["p2_5"], mc["p97_5"] - value) / value * 100
        gap = result["method_gap_pct"][key] if result["method_gap_pct"] else None
        rows.append({
            "family": family, "activity_type": "electricity", "unit": "kWh", "kgco2e_per_unit": f"{value:.6f}",
            "region": grid_region, "gwp_basis": "AR6", "method": "location", "factor_kind": "grid_average",
            "valid_from": f"{start}-07-01", "valid_to": f"{start + 1}-06-30",
            "source_publisher": "CarbonOS derivation, Method A fuel balance (factors/bd_grid)",
            "source_document": source_document[:300], "source_table_ref": source_table_ref[:200],
            "source_year": start + 1, "uncertainty_pct": f"{half:.2f}",
            "licence_note": (f"Status {result['status']}; Monte Carlo {mc['p2_5']:.4f}-{mc['p97_5']:.4f} kg/kWh "
                             f"(95 %, {result['monte_carlo']['draws']} draws); Method B gap "
                             f"{'n/a' if gap is None else f'{gap:+.2f} %'}; DRAFT until a second person approves.")[:2000],
        })
    return rows
