# Accounting Methodology — `carbonos-ghg-scope12-1.0`

Status: **CODE_COMPLETE, not METHODOLOGY_VALIDATED.** A qualified GHG practitioner must review this
before any customer relies on it. No third-party certification or verification is claimed.

Reference standards: GHG Protocol Corporate Accounting and Reporting Standard (revised edition) and
GHG Protocol Scope 2 Guidance (2015). Implementation: `inference/esg_rag/accounting.py` (pure, no I/O).

## Scope coverage

| Scope | Covered | Notes |
|---|---|---|
| Scope 1 stationary/mobile combustion | diesel, petrol, LPG, natural gas, furnace oil | Factor must be expressed per canonical unit (CO2e per L, kg or m3) |
| Scope 1 refrigerants, process emissions | **Not yet** | Needs gas-specific GWP handling |
| Scope 2 electricity | location-based **and** market-based, reported separately | |
| Scope 2 purchased steam | location-based only | Market-based dual reporting for steam/heat/cooling not implemented |
| Scope 3 | **Not included** | Reports state `scope3_status: NOT_INCLUDED` |

## Formula

For each APPROVED activity record in the reporting period:

```
emissions_kg = quantity_in_canonical_unit × factor_kgCO2e_per_unit × inclusion_share
```

* Every line stores the formula text, operands, factor id and factor version.
* Line values: Decimal, quantised to 0.000001 kg (ROUND_HALF_UP).
* Report totals: sum of lines in kg, converted to tonnes and quantised to 0.001 t (ROUND_HALF_UP) once, at report level.

## Units

One canonical unit per activity type (`electricity` kWh, `diesel` L, `lpg` kg, `natural_gas` m3,
`purchased_steam` GJ). Inputs are converted with exact constants (`kL`, `m3`→L ×1000; `US_gal` ×3.785411784;
`t` ×1000 kg; `lb` ×0.45359237; `MWh` ×1000 kWh; `GJ`, `MJ`). Cross-dimension inputs (e.g. diesel in kWh)
are rejected. Natural gas must be entered in m3 (energy-based gas requires a heating value — not implemented).
Raw quantity and unit are stored alongside the normalised value.

## Factor selection

1. An explicitly selected factor on the record is used if APPROVED, visible to the organization and applicable
   (activity type, method, unit, validity dates).
2. Otherwise: APPROVED factors matching activity type, method, unit, the facility's `grid_region` and the
   validity window; the highest version per factor family is used.
3. No candidate → `MISSING_FACTOR` (blocking). Several families → `AMBIGUOUS_FACTOR` (blocking) — the user
   must select one. No default or fallback value exists anywhere.
4. Factors with different GWP bases in one run → `MIXED_GWP_BASIS` (blocking).

## Scope 2 dual reporting

* Location-based uses `method = location` factors.
* Market-based uses `method = market` factors (supplier-specific rate, contractual instrument or residual mix
  entered and approved by the organization). If **any** electricity record lacks one, the market-based total
  is `null` and the report shows `MISSING_INPUTS`; each record gets a non-blocking `MISSING_MARKET_BASED_INPUT`.
* `electricity_export` and `onsite_renewable_generation` are memo items: reported, never added to or
  subtracted from Scope 2. Offsets and avoided emissions are not part of the inventory.

## Organizational boundary

Chosen per reporting period:

| Method | inclusion_share |
|---|---|
| operational_control | 1 if the facility is under operational control, else 0 (excluded, listed) |
| financial_control | 1 if under financial control, else 0 |
| equity_share | equity_share_pct / 100 |

Limitation: ownership/control is current-state per facility; mid-period changes need dated ownership rows (planned).

## Double counting and data quality

* A record overlapping an existing non-rejected record for the same facility, activity type and meter
  reference is rejected (HTTP 409). Different meters must carry different `meter_ref` values.
* Retried imports with the same `idempotency_key` return the original record.
* Approved records are immutable; corrections are new records that `supersede` the old one (the old record
  stays, status `SUPERSEDED`).

## Reproducibility

* A calculation run stores `input_sha256` over activities, facilities, factors, boundary and methodology version.
* Locking requires: no DRAFT/SUBMITTED records, no blocking exceptions, an unchanged input hash, and an
  approver different from the run's preparer.
* The lock writes a `ReportSnapshot` with canonical JSON content and its SHA-256. Exports are rendered from
  that stored content, so repeated exports are byte-identical and later factor versions cannot change them.
* Restatement re-opens the period with a new revision and a mandatory reason; earlier snapshots remain.
