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
* Memo items (electricity export, on-site renewable generation) are reported, never netted.
* Organizational boundary: operational control / financial control include 0 % or 100 %;
  equity share applies the equity percentage.
* Mixed GWP bases across factors used in one run are a blocking exception.
"""
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
import datetime as dt
from typing import Dict, List, Optional, Tuple

METHODOLOGY_VERSION = "carbonos-ghg-scope12-1.0"

# activity_type -> (scope, canonical unit)
ACTIVITY_TYPES: Dict[str, Tuple[str, str]] = {
    "diesel": ("1", "L"),
    "petrol": ("1", "L"),
    "lpg": ("1", "kg"),
    "natural_gas": ("1", "m3"),
    "furnace_oil": ("1", "L"),
    "electricity": ("2", "kWh"),
    "purchased_steam": ("2", "GJ"),
}
# Reported separately; never added to or subtracted from inventory totals.
MEMO_ACTIVITY_TYPES: Dict[str, str] = {
    "electricity_export": "kWh",
    "onsite_renewable_generation": "kWh",
}
BOUNDARY_METHODS = ("operational_control", "financial_control", "equity_share")

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

KG_PRECISION = Decimal("0.000001")
TONNE_PRECISION = Decimal("0.001")


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


def to_tonnes(kg: Decimal) -> Decimal:
    return (kg / Decimal(1000)).quantize(TONNE_PRECISION, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class Facility:
    id: str
    region: str
    operational_control: bool
    financial_control: bool
    equity_share_pct: Decimal
    legal_entity_id: Optional[str] = None


@dataclass(frozen=True)
class Factor:
    id: str
    version: int
    family: str
    activity_type: str
    unit: str  # denominator unit; must equal the activity's canonical unit
    kgco2e_per_unit: Decimal
    region: str
    gwp_basis: str
    method: str  # "direct" (Scope 1), "location" or "market" (Scope 2)
    valid_from: dt.date
    valid_to: Optional[dt.date] = None


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


@dataclass
class Line:
    activity_id: str
    facility_id: str
    scope: str
    method: str
    quantity: Decimal
    unit: str
    inclusion_share: Decimal
    factor_id: str
    factor_version: int
    factor_value: Decimal
    emissions_kg: Decimal
    formula: str


@dataclass
class Result:
    methodology_version: str
    boundary_method: str
    lines: List[Line] = field(default_factory=list)
    exceptions: List[dict] = field(default_factory=list)
    excluded: List[dict] = field(default_factory=list)
    memo: Dict[str, Decimal] = field(default_factory=dict)
    scope1_kg: Decimal = Decimal(0)
    scope2_location_kg: Decimal = Decimal(0)
    scope2_market_kg: Optional[Decimal] = None
    by_facility: Dict[str, Dict[str, Decimal]] = field(default_factory=dict)

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


def _usable(f: Factor, a: Activity, region: str, method: str) -> bool:
    return (
        f.activity_type == a.activity_type
        and f.method == method
        and f.unit == a.unit
        and f.region == region
        and f.valid_from <= a.period_start
        and (f.valid_to is None or a.period_end <= f.valid_to)
    )


def select_factor(a: Activity, region: str, method: str, factors: List[Factor],
                  explicit_id: Optional[str]) -> Tuple[Optional[Factor], Optional[str]]:
    """Returns (factor, error_code). Latest version per family; >1 family is ambiguous."""
    if explicit_id:
        f = next((f for f in factors if f.id == explicit_id), None)
        if f is None:
            return None, "SELECTED_FACTOR_NOT_APPROVED"
        if not (f.activity_type == a.activity_type and f.method == method and f.unit == a.unit
                and f.valid_from <= a.period_start and (f.valid_to is None or a.period_end <= f.valid_to)):
            return None, "SELECTED_FACTOR_NOT_APPLICABLE"
        return f, None
    candidates = [f for f in factors if _usable(f, a, region, method)]
    latest: Dict[str, Factor] = {}
    for f in candidates:
        if f.family not in latest or f.version > latest[f.family].version:
            latest[f.family] = f
    if not latest:
        return None, "MISSING_FACTOR"
    if len(latest) > 1:
        return None, "AMBIGUOUS_FACTOR"
    return next(iter(latest.values())), None


def calculate(activities: List[Activity], facilities: Dict[str, Facility], factors: List[Factor],
              boundary_method: str) -> Result:
    """Calculate Scope 1 and Scope 2 for approved activities. `factors` must be APPROVED only."""
    if boundary_method not in BOUNDARY_METHODS:
        raise ValueError(f"Unknown boundary method '{boundary_method}'")
    res = Result(methodology_version=METHODOLOGY_VERSION, boundary_method=boundary_method)
    market_complete = True
    has_electricity = False
    gwp_bases = set()

    def exception(code, activity, blocking=True, detail=""):
        res.exceptions.append({"code": code, "activity_id": activity.id, "facility_id": activity.facility_id,
                               "activity_type": activity.activity_type, "blocking": blocking, "detail": detail})

    def add_line(a, fac, scope, method, f, share):
        kg = (a.quantity * f.kgco2e_per_unit * share).quantize(KG_PRECISION, rounding=ROUND_HALF_UP)
        res.lines.append(Line(
            activity_id=a.id, facility_id=a.facility_id, scope=scope, method=method,
            quantity=a.quantity, unit=a.unit, inclusion_share=share, factor_id=f.id,
            factor_version=f.version, factor_value=f.kgco2e_per_unit, emissions_kg=kg,
            formula=f"{a.quantity} {a.unit} × {f.kgco2e_per_unit} kgCO2e/{f.unit} × {share} share = {kg} kgCO2e",
        ))
        gwp_bases.add(f.gwp_basis)
        bucket = res.by_facility.setdefault(fac.id, {"scope1_kg": Decimal(0), "scope2_location_kg": Decimal(0),
                                                     "scope2_market_kg": Decimal(0)})
        key = "scope1_kg" if scope == "1" else f"scope2_{method}_kg"
        bucket[key] += kg
        return kg

    for a in sorted(activities, key=lambda x: x.id):
        fac = facilities.get(a.facility_id)
        if fac is None:
            exception("UNKNOWN_FACILITY", a)
            continue
        if a.activity_type in MEMO_ACTIVITY_TYPES:
            res.memo[a.activity_type] = res.memo.get(a.activity_type, Decimal(0)) + a.quantity
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
        if scope == "1":
            f, err = select_factor(a, fac.region, "direct", factors, a.factor_id)
            if err:
                exception(err, a)
            else:
                res.scope1_kg += add_line(a, fac, "1", "direct", f, share)
            continue

        # Scope 2: location-based always required; market-based only from explicit/approved inputs.
        f, err = select_factor(a, fac.region, "location", factors, a.factor_id)
        if err:
            exception(err, a)
        else:
            res.scope2_location_kg += add_line(a, fac, "2", "location", f, share)
        if a.activity_type == "electricity":
            has_electricity = True
            mf, merr = select_factor(a, fac.region, "market", factors, a.market_factor_id)
            if merr:
                market_complete = False
                exception("MISSING_MARKET_BASED_INPUT", a, blocking=False,
                          detail="No supplier-specific, contractual instrument or residual-mix factor approved")
            else:
                market_total = add_line(a, fac, "2", "market", mf, share)
                res.scope2_market_kg = (res.scope2_market_kg or Decimal(0)) + market_total

    if has_electricity and not market_complete:
        res.scope2_market_kg = None  # partial market-based totals are never reported as complete
    if len(gwp_bases) > 1:
        res.exceptions.append({"code": "MIXED_GWP_BASIS", "activity_id": None, "facility_id": None,
                               "activity_type": None, "blocking": True, "detail": ", ".join(sorted(gwp_bases))})
    return res
