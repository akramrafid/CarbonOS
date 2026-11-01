"""
Deterministic GHG calculation library — GHG Protocol Corporate Standard, Scope 1 and Scope 2.

Pure functions over plain data: no HTTP, no database, no clock. All quantities are Decimal.
The same inputs always produce the same lines, totals and exceptions.

Rules enforced here (see docs/esg/ACCOUNTING_METHODOLOGY.md):
* Units are normalised to one canonical unit per activity type or rejected (UnitError).
* A factor is used only if APPROVED by the caller's selection, matches activity type, unit,
  region and validity dates. No factor → MISSING_FACTOR exception, never a default value.
* Scope 2 location-based and market-based totals are separate. Market-based is None unless
  every electricity record has a market factor (no invented residual mix).
* Every Scope 2 electricity factor declares its kind. Location-based uses the grid AVERAGE
  emission rate only. Combined-margin factors (CDM Tool 07 project baselines) never produce a
  Scope 2 line: MARGIN_FACTOR_NOT_ALLOWED. The same rule is a database check constraint.
* Memo items (electricity export, on-site renewable and captive generation) are reported, never
  netted. Generator kWh are never also Scope 2: the generator's fuel is the Scope 1 line.
* Natural gas on an energy basis: billed m3 × volume correction × GCV × NCV/GCV → GJ (NCV). No
  heating value → MISSING_HEATING_VALUE; a declared default heating value → HIGH_UNCERTAINTY.
* Refrigerants: mass balance × GWP of the methodology's GWP basis. Montreal Protocol gases
  (HCFCs) are reported separately, outside the Scope 1 total.
* Biomass: CH4 and N2O are Scope 1; biogenic CO2 is reported outside the scopes.
* Every line carries a data-quality grade and an uncertainty propagated with IPCC 2006 Vol. 1
  Ch. 3 Approach 1 (Eq. 3.1 for products, Eq. 3.2 for sums).
* Organizational boundary: operational control / financial control include 0 % or 100 %;
  equity share applies the equity percentage.
* Mixed GWP bases across factors used in one run are a blocking exception.
"""
from collections import defaultdict
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
import datetime as dt
from typing import Dict, List, Optional, Tuple

from . import gwp

METHODOLOGY_VERSION = "carbonos-ghg-scope12-1.1"

# activity_type -> (scope, canonical unit)
ACTIVITY_TYPES: Dict[str, Tuple[str, str]] = {
    "diesel": ("1", "L"),
    "petrol": ("1", "L"),
    "lpg": ("1", "kg"),
    "natural_gas": ("1", "m3"),
    "furnace_oil": ("1", "L"),
    "wood": ("1", "kg"),
    "solid_biomass": ("1", "kg"),
    "refrigerant": ("1", "kg"),
    "electricity": ("2", "kWh"),
    "purchased_steam": ("2", "GJ"),
}
# Reported separately; never added to or subtracted from inventory totals.
MEMO_ACTIVITY_TYPES: Dict[str, str] = {
    "electricity_export": "kWh",
    "onsite_renewable_generation": "kWh",
    "captive_generation_output": "kWh",
}
# Factor units accepted on an energy basis; the activity quantity is converted with a heating value.
ENERGY_BASIS_UNITS: Dict[str, str] = {"natural_gas": "GJ"}
BOUNDARY_METHODS = ("operational_control", "financial_control", "equity_share")

FACTOR_KINDS = ("grid_average", "grid_combined_margin", "supplier_specific", "residual_mix")
# CDM Tool 07 margins answer "what does one added MWh displace?" for a project baseline, not
# "how carbon-intensive is the grid I draw from?", so they are never inventory factors.
MARGIN_FACTOR_KINDS = ("grid_combined_margin",)
FACTOR_KIND_ERRORS = ("MARGIN_FACTOR_NOT_ALLOWED", "UNKNOWN_FACTOR_KIND", "FACTOR_KIND_UNDECLARED",
                      "FACTOR_KIND_NOT_ALLOWED")

DATA_QUALITY_GRADES = ("metered", "billed", "estimated", "default")
# CarbonOS defaults: half-width of the 95 % interval, in % of the value, used when a record states a
# grade but no uncertainty. Expert-judgement configuration informed by IPCC 2006 Vol. 2 Table 2.15;
# not IPCC values. A record's own uncertainty_pct always wins.
DEFAULT_ACTIVITY_UNCERTAINTY_PCT: Dict[str, Decimal] = {
    "metered": Decimal("2"), "billed": Decimal("2"), "estimated": Decimal("15"), "default": Decimal("30"),
}
# Captive generator plausibility bands (configurable): diesel L/kWh, gas engine MJ(NCV)/kWh.
GENERATOR_BANDS: Dict[str, Tuple[Decimal, Decimal, str]] = {
    "diesel": (Decimal("0.20"), Decimal("0.45"), "L/kWh"),
    "natural_gas": (Decimal("7.5"), Decimal("13.0"), "MJ/kWh"),
}

# unit -> (dimension, size in the dimension's base unit). Exact conversion constants only.
UNITS: Dict[str, Tuple[str, Decimal]] = {
    "L": ("volume", Decimal("1")),
    "kL": ("volume", Decimal("1000")),
    "m3": ("volume", Decimal("1000")),
    "US_gal": ("volume", Decimal("3.785411784")),
    "kg": ("mass", Decimal("1")),
    "t": ("mass", Decimal("1000")),
    "lb": ("mass", Decimal("0.45359237")),
    "MJ": ("energy", Decimal("1")),
    "GJ": ("energy", Decimal("1000")),
    "kWh": ("energy", Decimal("3.6")),
    "MWh": ("energy", Decimal("3600")),
}
# Heating value units → MJ per m3 (exact: IT kcal = 4.1868 kJ; IT Btu = 1055.05585262 J; ft3 = 0.028316846592 m3).
HEATING_VALUE_UNITS: Dict[str, Decimal] = {
    "MJ/m3": Decimal(1),
    "kcal/m3": Decimal("0.0041868"),
    "Btu/scf": Decimal("1055.05585262") / Decimal("0.028316846592") / Decimal(1000000),
}

KG_PRECISION = Decimal("0.000001")
TONNE_PRECISION = Decimal("0.001")
PCT_PRECISION = Decimal("0.01")


class UnitError(ValueError):
    pass


def canonical_unit(activity_type: str) -> str:
    if activity_type in ACTIVITY_TYPES:
        return ACTIVITY_TYPES[activity_type][1]
    if activity_type in MEMO_ACTIVITY_TYPES:
        return MEMO_ACTIVITY_TYPES[activity_type]
    raise UnitError(f"Unknown activity type '{activity_type}'")


def normalize(quantity: Decimal, unit: str, activity_type: str) -> Decimal:
    """Convert to the activity type's canonical unit, or raise UnitError."""
    target = canonical_unit(activity_type)
    if unit not in UNITS:
        raise UnitError(f"Unknown unit '{unit}'")
    if UNITS[unit][0] != UNITS[target][0]:
        raise UnitError(f"Unit '{unit}' cannot be converted to '{target}' for {activity_type}")
    if activity_type == "natural_gas" and unit != "m3":
        # Litres of gas are almost always a data-entry error; energy units need a heating value.
        raise UnitError("Natural gas must be entered in m3")
    q = Decimal(quantity)
    if q < 0:
        raise UnitError("Quantity must not be negative")
    return q * UNITS[unit][1] / UNITS[target][1]


def heating_value_mj_per_m3(value: Decimal, unit: str) -> Decimal:
    if unit not in HEATING_VALUE_UNITS:
        raise UnitError(f"Unknown heating value unit '{unit}'")
    return Decimal(value) * HEATING_VALUE_UNITS[unit]


def to_tonnes(kg: Decimal) -> Decimal:
    return (kg / Decimal(1000)).quantize(TONNE_PRECISION, rounding=ROUND_HALF_UP)


# --- uncertainty: IPCC 2006 Vol. 1 Ch. 3, Approach 1 ------------------------------------------

def combine_product(*pcts: Optional[Decimal]) -> Optional[Decimal]:
    """Eq. 3.1: uncertainty of a product of uncorrelated terms (all in %). None if any is unknown."""
    if any(p is None for p in pcts):
        return None
    return sum((Decimal(p) ** 2 for p in pcts), Decimal(0)).sqrt()


def combine_sum(terms: List[Tuple[Decimal, Optional[Decimal]]]) -> Optional[Decimal]:
    """Eq. 3.2: uncertainty (%) of a sum of uncorrelated (value, %) terms. None if unknown or total 0."""
    if any(p is None for _, p in terms):
        return None
    total = sum((v for v, _ in terms), Decimal(0))
    if total == 0:
        return None
    return sum(((Decimal(p) * v) ** 2 for v, p in terms), Decimal(0)).sqrt() / abs(total)


def _pct(p: Optional[Decimal]) -> Optional[Decimal]:
    return None if p is None else p.quantize(PCT_PRECISION, rounding=ROUND_HALF_UP)


# --- inputs ----------------------------------------------------------------------------------

@dataclass(frozen=True)
class Facility:
    id: str
    region: str
    operational_control: bool
    financial_control: bool
    equity_share_pct: Decimal
    legal_entity_id: Optional[str] = None


@dataclass(frozen=True)
class GasComponent:
    gas: str  # one of gwp.COMBUSTION_GASES
    kg_per_unit: Decimal
    uncertainty_pct: Optional[Decimal] = None


@dataclass(frozen=True)
class Factor:
    id: str
    version: int
    family: str
    activity_type: str
    unit: str  # denominator unit: the activity's canonical unit, or ENERGY_BASIS_UNITS for gas
    kgco2e_per_unit: Decimal
    region: str
    gwp_basis: str
    method: str  # "direct" (Scope 1), "location" or "market" (Scope 2)
    valid_from: dt.date
    valid_to: Optional[dt.date] = None
    kind: Optional[str] = None  # one of FACTOR_KINDS for Scope 2; None for Scope 1
    gases: Tuple[GasComponent, ...] = ()  # gas-level factor; CO2e is computed with gwp_basis
    uncertainty_pct: Optional[Decimal] = None  # used when there are no gas components


@dataclass(frozen=True)
class HeatingValue:
    gcv_mj_per_m3: Decimal  # gross calorific value at reference_conditions
    ncv_to_gcv: Decimal  # NCV/GCV ratio, stated by the certificate or a cited default
    reference_conditions: str  # e.g. "15 °C, 101.325 kPa"
    source: str  # certificate id or publication
    is_default: bool = False  # declared default, not a certificate → HIGH_UNCERTAINTY
    uncertainty_pct: Optional[Decimal] = None


@dataclass(frozen=True)
class MassBalance:
    """Refrigerant mass balance, kg of refrigerant. Emissions = opening + purchased − recovered − closing −
    capacity_increase (charge put into new equipment is not emitted)."""
    opening_kg: Decimal
    purchased_kg: Decimal
    recovered_kg: Decimal
    closing_kg: Decimal
    capacity_increase_kg: Decimal = Decimal(0)

    def net_kg(self) -> Decimal:
        return self.opening_kg + self.purchased_kg - self.recovered_kg - self.closing_kg - self.capacity_increase_kg


@dataclass(frozen=True)
class Activity:
    id: str
    facility_id: str
    activity_type: str
    quantity: Decimal  # canonical unit
    unit: str
    period_start: dt.date
    period_end: dt.date
    factor_id: Optional[str] = None  # explicit selection (location/direct)
    market_factor_id: Optional[str] = None  # explicit market-based instrument/supplier factor
    meter_ref: Optional[str] = None
    data_quality: Optional[str] = None  # one of DATA_QUALITY_GRADES
    uncertainty_pct: Optional[Decimal] = None  # activity data, half-width of 95 % interval
    generator_id: Optional[str] = None  # links generator fuel to generator output (memo)
    heating_value: Optional[HeatingValue] = None
    volume_correction: Decimal = Decimal(1)  # billed m3 → m3 at the heating value's reference conditions
    refrigerant: Optional[str] = None
    mass_balance: Optional[MassBalance] = None


@dataclass
class Line:
    activity_id: str
    facility_id: str
    scope: str
    method: str
    quantity: Decimal
    unit: str
    inclusion_share: Decimal
    factor_id: Optional[str]
    factor_version: Optional[int]
    factor_value: Decimal
    emissions_kg: Decimal
    formula: str
    data_quality: Optional[str] = None
    uncertainty_pct: Optional[Decimal] = None
    factor_ref: Optional[str] = None
    details: Dict[str, object] = field(default_factory=dict)


@dataclass
class Result:
    methodology_version: str
    boundary_method: str
    gwp_basis: str = gwp.DEFAULT_BASIS
    lines: List[Line] = field(default_factory=list)
    exceptions: List[dict] = field(default_factory=list)
    excluded: List[dict] = field(default_factory=list)
    memo: Dict[str, Decimal] = field(default_factory=dict)
    scope1_kg: Decimal = Decimal(0)
    scope2_location_kg: Decimal = Decimal(0)
    scope2_market_kg: Optional[Decimal] = None
    by_facility: Dict[str, Dict[str, Decimal]] = field(default_factory=dict)
    uncertainty: Dict[str, object] = field(default_factory=dict)

    @property
    def blocking(self) -> bool:
        return any(e["blocking"] for e in self.exceptions)


def inclusion_share(facility: Facility, boundary_method: str) -> Decimal:
    if boundary_method == "operational_control":
        return Decimal(1) if facility.operational_control else Decimal(0)
    if boundary_method == "financial_control":
        return Decimal(1) if facility.financial_control else Decimal(0)
    if boundary_method == "equity_share":
        pct = Decimal(facility.equity_share_pct)
        if not Decimal(0) <= pct <= Decimal(100):
            raise ValueError(f"Equity share for facility {facility.id} must be 0–100")
        return pct / Decimal(100)
    raise ValueError(f"Unknown boundary method '{boundary_method}'")


def activity_uncertainty(a: Activity) -> Optional[Decimal]:
    if a.uncertainty_pct is not None:
        return Decimal(a.uncertainty_pct)
    return DEFAULT_ACTIVITY_UNCERTAINTY_PCT.get(a.data_quality)


# --- factor selection --------------------------------------------------------------------------

def allowed_factor_kinds(activity_type: str, method: str) -> Tuple[Optional[str], ...]:
    """Factor kinds that may produce a line for this activity type and method (None = undeclared)."""
    if method == "direct":
        return (None,)
    if activity_type == "electricity":
        if method == "location":
            return ("grid_average",)
        # Scope 2 Guidance market-based hierarchy: supplier rate, residual mix, and the grid average
        # only where no residual mix exists (disclosed as MARKET_BASED_GRID_AVERAGE_FALLBACK).
        return ("supplier_specific", "residual_mix", "grid_average")
    return (None, "supplier_specific")  # purchased steam has no grid; supplier or default rate


def factor_kind_error(f: Factor) -> Optional[str]:
    if f.kind in MARGIN_FACTOR_KINDS:
        return "MARGIN_FACTOR_NOT_ALLOWED"
    if f.kind is not None and f.kind not in FACTOR_KINDS:
        return "UNKNOWN_FACTOR_KIND"
    if f.kind not in allowed_factor_kinds(f.activity_type, f.method):
        return "FACTOR_KIND_UNDECLARED" if f.kind is None else "FACTOR_KIND_NOT_ALLOWED"
    return None


def _unit_ok(f: Factor, a: Activity) -> bool:
    return f.unit == a.unit or f.unit == ENERGY_BASIS_UNITS.get(a.activity_type)


def _applicable(f: Factor, a: Activity, method: str) -> bool:
    return (f.activity_type == a.activity_type and f.method == method and _unit_ok(f, a)
            and f.valid_from <= a.period_start and (f.valid_to is None or a.period_end <= f.valid_to))


def select_factor(a: Activity, region: str, method: str, factors: List[Factor],
                  explicit_id: Optional[str]) -> Tuple[Optional[Factor], Optional[str]]:
    """Returns (factor, error_code). Latest version per family; >1 family is ambiguous."""
    if explicit_id:
        f = next((f for f in factors if f.id == explicit_id), None)
        if f is None:
            return None, "SELECTED_FACTOR_NOT_APPROVED"
        if not _applicable(f, a, method):
            return None, "SELECTED_FACTOR_NOT_APPLICABLE"
        kind_error = factor_kind_error(f)
        return (None, kind_error) if kind_error else (f, None)
    candidates = [f for f in factors if _applicable(f, a, method) and f.region == region]
    eligible = [f for f in candidates if factor_kind_error(f) is None]
    if candidates and not eligible:
        return None, factor_kind_error(min(candidates, key=lambda f: f.id))
    latest: Dict[str, Factor] = {}
    for f in eligible:
        if f.family not in latest or f.version > latest[f.family].version:
            latest[f.family] = f
    if not latest:
        return None, "MISSING_FACTOR"
    if len(latest) > 1:
        return None, "AMBIGUOUS_FACTOR"
    return next(iter(latest.values())), None


# --- line arithmetic ---------------------------------------------------------------------------

def factor_quantity(a: Activity, f: Factor) -> Tuple[Optional[Decimal], Dict[str, object], Optional[str]]:
    """Activity quantity in the factor's unit: (quantity, trace details, error code)."""
    if f.unit == a.unit:
        return a.quantity, {}, None
    hv = a.heating_value
    if hv is None:
        return None, {}, "MISSING_HEATING_VALUE"
    standard_m3 = a.quantity * Decimal(a.volume_correction)
    gj = standard_m3 * Decimal(hv.gcv_mj_per_m3) * Decimal(hv.ncv_to_gcv) / Decimal(1000)
    return gj, {"billed_m3": a.quantity, "volume_correction": Decimal(a.volume_correction),
                "standard_m3": standard_m3, "gcv_mj_per_m3": Decimal(hv.gcv_mj_per_m3),
                "ncv_to_gcv": Decimal(hv.ncv_to_gcv), "energy_gj_ncv": gj,
                "heating_value_source": hv.source, "reference_conditions": hv.reference_conditions,
                "heating_value_is_default": hv.is_default}, None


def factor_emissions(f: Factor, qty: Decimal) -> Tuple[Decimal, Dict[str, Decimal], Decimal, Optional[Decimal]]:
    """(kg CO2e in scope, kg per gas, biogenic CO2 kg, factor uncertainty %) for qty in the factor's unit."""
    if not f.gases:
        return qty * f.kgco2e_per_unit, {}, Decimal(0), f.uncertainty_pct
    co2e, gases, biogenic, terms = Decimal(0), {}, Decimal(0), []
    for g in f.gases:
        kg = qty * g.kg_per_unit
        gases[g.gas] = kg
        if g.gas == gwp.BIOGENIC:
            biogenic += kg
            continue
        e = kg * gwp.GWP100[f.gwp_basis][g.gas]
        co2e += e
        terms.append((e, g.uncertainty_pct))
    return co2e, gases, biogenic, combine_sum(terms)


def gas_factor_co2e(gases: Tuple[GasComponent, ...], basis: str) -> Decimal:
    """kg CO2e per unit of a gas-level factor (biogenic CO2 excluded)."""
    return sum((g.kg_per_unit * gwp.GWP100[basis][g.gas] for g in gases if g.gas != gwp.BIOGENIC), Decimal(0))


# --- calculation -------------------------------------------------------------------------------

def _gwp_basis(factors: List[Factor], requested: Optional[str]) -> str:
    if requested:
        return requested
    bases = {f.gwp_basis for f in factors}
    return bases.pop() if len(bases) == 1 else gwp.DEFAULT_BASIS


def calculate(activities: List[Activity], facilities: Dict[str, Facility], factors: List[Factor],
              boundary_method: str, gwp_basis: Optional[str] = None,
              generator_bands: Optional[Dict[str, Tuple[Decimal, Decimal, str]]] = None) -> Result:
    """Calculate Scope 1 and Scope 2 for approved activities. `factors` must be APPROVED only."""
    if boundary_method not in BOUNDARY_METHODS:
        raise ValueError(f"Unknown boundary method '{boundary_method}'")
    basis = _gwp_basis(factors, gwp_basis)
    res = Result(methodology_version=METHODOLOGY_VERSION, boundary_method=boundary_method, gwp_basis=basis)
    market_complete = True
    has_electricity = False
    gwp_bases = {gwp_basis} if gwp_basis else set()  # an explicit inventory basis must match every factor
    acts = sorted(activities, key=lambda x: x.id)
    captive_meters = {(a.facility_id, a.meter_ref) for a in acts
                      if a.activity_type == "captive_generation_output" and a.meter_ref}

    def exception(code, activity, blocking=True, detail=""):
        res.exceptions.append({"code": code, "activity_id": activity.id, "facility_id": activity.facility_id,
                               "activity_type": activity.activity_type, "blocking": blocking, "detail": detail})

    def memo_add(key, value):
        res.memo[key] = res.memo.get(key, Decimal(0)) + value

    def record(a, fac, scope, method, line):
        line.emissions_kg = line.emissions_kg.quantize(KG_PRECISION, rounding=ROUND_HALF_UP)
        line.data_quality = a.data_quality
        res.lines.append(line)
        bucket = res.by_facility.setdefault(fac.id, {"scope1_kg": Decimal(0), "scope2_location_kg": Decimal(0),
                                                     "scope2_market_kg": Decimal(0)})
        bucket["scope1_kg" if scope == "1" else f"scope2_{method}_kg"] += line.emissions_kg
        return line.emissions_kg

    def factor_line(a, fac, scope, method, f, share):
        qty, details, err = factor_quantity(a, f)
        if err:
            exception(err, a, detail="Gas on an energy basis needs a distributor/Petrobangla heating value")
            return None
        if any(g.gas != gwp.BIOGENIC and gwp.gas_gwp(g.gas, f.gwp_basis) is None for g in f.gases):
            exception("UNSUPPORTED_GWP_BASIS", a, detail=f"{f.id}: {f.gwp_basis}")
            return None
        kg, gases, biogenic, f_unc = factor_emissions(f, qty)
        hv = a.heating_value if details else None
        act_unc = combine_product(activity_uncertainty(a), hv.uncertainty_pct) if hv else activity_uncertainty(a)
        if hv is not None and hv.is_default:
            exception("HIGH_UNCERTAINTY", a, blocking=False,
                      detail=f"Declared default heating value used ({hv.source}); replace with a certificate")
        if gases:
            details = {**details, "gases_kg": {g: (v * share).quantize(KG_PRECISION, rounding=ROUND_HALF_UP)
                                               for g, v in gases.items()}}
        if biogenic:
            memo_add("biogenic_co2_kg", (biogenic * share).quantize(KG_PRECISION, rounding=ROUND_HALF_UP))
        energy = (f" ({details['energy_gj_ncv'].quantize(Decimal('0.0001'), rounding=ROUND_HALF_UP)} GJ NCV)"
                  if "energy_gj_ncv" in details else "")
        value = gas_factor_co2e(f.gases, f.gwp_basis) if f.gases else f.kgco2e_per_unit
        gwp_bases.add(f.gwp_basis)
        kg_line = kg * share
        return Line(
            activity_id=a.id, facility_id=a.facility_id, scope=scope, method=method, quantity=a.quantity,
            unit=a.unit, inclusion_share=share, factor_id=f.id, factor_version=f.version, factor_value=value,
            emissions_kg=kg_line,
            formula=(f"{a.quantity} {a.unit}{energy} × {value} kgCO2e/{f.unit} × {share} share = "
                     f"{kg_line.quantize(KG_PRECISION, rounding=ROUND_HALF_UP)} kgCO2e"),
            uncertainty_pct=_pct(combine_product(act_unc, f_unc)), details=details)

    def add(a, fac, scope, method, f, share):
        line = factor_line(a, fac, scope, method, f, share)
        return None if line is None else record(a, fac, scope, method, line)

    def refrigerant_line(a, fac, share):
        if a.mass_balance is None or not a.refrigerant:
            exception("MISSING_MASS_BALANCE", a, detail="Refrigerant needs opening, purchased, recovered and closing stock")
            return
        net = a.mass_balance.net_kg()
        if net < 0:
            exception("NEGATIVE_MASS_BALANCE", a, detail=f"{net} kg: check stock counts and recovered quantities")
            return
        value, montreal = gwp.refrigerant_gwp(a.refrigerant, basis)
        if value is None:
            exception("UNKNOWN_REFRIGERANT_OR_GWP_BASIS", a, detail=f"{a.refrigerant} / {basis}")
            return
        kg = (net * value * share).quantize(KG_PRECISION, rounding=ROUND_HALF_UP)
        if montreal:
            memo_add("montreal_protocol_gases_kgco2e", kg)
            res.excluded.append({"activity_id": a.id, "facility_id": fac.id,
                                 "reason": f"{a.refrigerant} is a Montreal Protocol gas: reported separately"})
            return
        mb, u = a.mass_balance, activity_uncertainty(a)
        unc = combine_sum([(mb.opening_kg, u), (mb.purchased_kg, u), (-mb.recovered_kg, u), (-mb.closing_kg, u),
                           (-mb.capacity_increase_kg, u)]) if net else None
        gwp_bases.add(basis)
        res.scope1_kg += record(a, fac, "1", "direct", Line(
            activity_id=a.id, facility_id=a.facility_id, scope="1", method="direct", quantity=net, unit="kg",
            inclusion_share=share, factor_id=None, factor_version=None, factor_value=value, emissions_kg=kg,
            formula=(f"({mb.opening_kg} + {mb.purchased_kg} − {mb.recovered_kg} − {mb.closing_kg} − "
                     f"{mb.capacity_increase_kg}) kg {a.refrigerant} × GWP {value} ({basis}) × {share} share = {kg} kgCO2e"),
            factor_ref=f"IPCC {basis} GWP-100 {a.refrigerant}", uncertainty_pct=_pct(unc),
            details={"refrigerant": a.refrigerant, "net_kg": net}))

    for a in acts:
        fac = facilities.get(a.facility_id)
        if fac is None:
            exception("UNKNOWN_FACILITY", a)
            continue
        if a.activity_type in MEMO_ACTIVITY_TYPES:
            memo_add(a.activity_type, a.quantity)
            continue
        if a.activity_type not in ACTIVITY_TYPES:
            exception("UNKNOWN_ACTIVITY_TYPE", a)
            continue
        if a.unit != canonical_unit(a.activity_type):
            exception("NON_CANONICAL_UNIT", a, detail=a.unit)
            continue

        share = inclusion_share(fac, boundary_method)
        if share == 0:
            res.excluded.append({"activity_id": a.id, "facility_id": fac.id,
                                 "reason": f"Facility outside {boundary_method} boundary"})
            continue

        scope = ACTIVITY_TYPES[a.activity_type][0]
        if a.activity_type == "refrigerant":
            refrigerant_line(a, fac, share)
            continue
        if scope == "1":
            f, err = select_factor(a, fac.region, "direct", factors, a.factor_id)
            if err:
                exception(err, a)
            else:
                res.scope1_kg += add(a, fac, "1", "direct", f, share) or Decimal(0)
            continue

        # Captive generator output is a memo item; its fuel is already Scope 1. Never also Scope 2.
        if a.activity_type == "electricity" and (a.generator_id or (a.facility_id, a.meter_ref) in captive_meters):
            exception("DOUBLE_COUNTED_ELECTRICITY", a,
                      detail="Electricity from a captive generator is not Scope 2; its fuel is the Scope 1 line")
            continue

        # Scope 2: location-based always required; market-based only from explicit/approved inputs.
        f, err = select_factor(a, fac.region, "location", factors, a.factor_id)
        if err:
            exception(err, a)
        else:
            res.scope2_location_kg += add(a, fac, "2", "location", f, share) or Decimal(0)
        if a.activity_type == "electricity":
            has_electricity = True
            mf, merr = select_factor(a, fac.region, "market", factors, a.market_factor_id)
            if merr in FACTOR_KIND_ERRORS:
                market_complete = False
                exception(merr, a)
            elif merr:
                market_complete = False
                exception("MISSING_MARKET_BASED_INPUT", a, blocking=False,
                          detail="No supplier-specific, contractual instrument or residual-mix factor approved")
            else:
                market_total = add(a, fac, "2", "market", mf, share) or Decimal(0)
                res.scope2_market_kg = (res.scope2_market_kg or Decimal(0)) + market_total
                if mf.kind == "grid_average":
                    exception("MARKET_BASED_GRID_AVERAGE_FALLBACK", a, blocking=False,
                              detail="No residual mix available; grid-average rate used and disclosed")

    if has_electricity and not market_complete:
        res.scope2_market_kg = None  # partial market-based totals are never reported as complete
    if len(gwp_bases) > 1:
        res.exceptions.append({"code": "MIXED_GWP_BASIS", "activity_id": None, "facility_id": None,
                               "activity_type": None, "blocking": True, "detail": ", ".join(sorted(gwp_bases))})
    _generator_checks(acts, res, generator_bands or GENERATOR_BANDS)
    for a in acts:  # appended last so blocking calculation exceptions keep their order
        if a.data_quality is None:
            exception("DATA_QUALITY_UNGRADED", a, blocking=False, detail="Grade the record: metered/billed/estimated/default")
        elif a.data_quality not in DATA_QUALITY_GRADES:
            exception("UNKNOWN_DATA_QUALITY", a, detail=a.data_quality)
    res.uncertainty = uncertainty_summary(res)
    return res


def _generator_checks(acts: List[Activity], res: Result, bands: Dict[str, Tuple[Decimal, Decimal, str]]):
    """Specific fuel consumption per captive generator must fall inside the configured band."""
    lines = {l.activity_id: l for l in res.lines}
    fuel = defaultdict(lambda: defaultdict(Decimal))
    output = defaultdict(Decimal)
    for a in acts:
        if not a.generator_id:
            continue
        if a.activity_type == "captive_generation_output":
            output[a.generator_id] += a.quantity
        elif a.activity_type == "diesel":
            fuel[a.generator_id]["diesel"] += a.quantity
        elif a.activity_type == "natural_gas" and a.id in lines and "energy_gj_ncv" in lines[a.id].details:
            fuel[a.generator_id]["natural_gas"] += lines[a.id].details["energy_gj_ncv"] * Decimal(1000)  # MJ
    for gen in sorted(fuel):
        for kind, amount in sorted(fuel[gen].items()):
            low, high, unit = bands[kind]
            if not output[gen]:
                res.exceptions.append({"code": "GENERATOR_OUTPUT_MISSING", "activity_id": None, "facility_id": None,
                                       "activity_type": kind, "blocking": False,
                                       "detail": f"Generator {gen}: no captive_generation_output kWh to check {unit}"})
                continue
            ratio = (amount / output[gen]).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            if not low <= ratio <= high:
                res.exceptions.append({"code": "GENERATOR_EFFICIENCY_OUT_OF_BAND", "activity_id": None,
                                       "facility_id": None, "activity_type": kind, "blocking": True,
                                       "detail": f"Generator {gen}: {ratio} {unit} outside {low}–{high} {unit}"})


def uncertainty_summary(res: Result) -> Dict[str, object]:
    """IPCC 2006 Vol. 1 Ch. 3 Approach 1 (Eq. 3.2) per total, without the large-uncertainty correction."""
    def summarize(lines: List[Line]):
        total = sum((l.emissions_kg for l in lines), Decimal(0))
        known = [l for l in lines if l.uncertainty_pct is not None]
        covered = sum((l.emissions_kg for l in known), Decimal(0))
        return {
            "uncertainty_pct": _pct(combine_sum([(l.emissions_kg, l.uncertainty_pct) for l in known])),
            "coverage_pct": _pct(covered / total * 100) if total else None,
            "lines_without_uncertainty": len(lines) - len(known),
        }
    pick = lambda scope, method: [l for l in res.lines if l.scope == scope and l.method == method]
    return {
        "approach": "IPCC 2006 Vol. 1 Ch. 3 Approach 1 (Eq. 3.1, 3.2); 95 % half-width in % of the total",
        "scope1": summarize(pick("1", "direct")),
        "scope2_location": summarize(pick("2", "location")),
        "scope2_market": summarize(pick("2", "market")) if res.scope2_market_kg is not None else None,
    }
