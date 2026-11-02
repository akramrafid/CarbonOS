# Accounting Methodology — `carbonos-ghg-scope12-1.3`

Status: **CODE_COMPLETE, not METHODOLOGY_VALIDATED.** A qualified GHG practitioner must review this
before any customer relies on it. No third-party certification or verification is claimed.

Reference standards: GHG Protocol Corporate Accounting and Reporting Standard (revised edition) and
GHG Protocol Scope 2 Guidance (2015). Implementation: `inference/esg_rag/accounting.py` (pure, no I/O).

## Scope coverage

| Scope | Covered | Notes |
|---|---|---|
| Scope 1 stationary/mobile combustion | diesel, petrol, LPG, natural gas, furnace oil | Factor per canonical unit, or gas-level (CO2, CH4, N2O) per unit; natural gas also on an energy basis (per GJ NCV) |
| Scope 1 biomass (wood, solid biomass) | CH4 and N2O | Biogenic CO2 reported outside the scopes (memo `biogenic_co2_kg`) |
| Scope 1 refrigerants | mass balance × GWP | HFCs and blends (R-410A, R-407C, R-404A, pure HFCs); HCFC-22 reported separately |
| Scope 1 process emissions, SF6 switchgear | **Not yet** | |
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
are rejected. Natural gas is entered in m3; energy-basis factors convert it with the record's heating value (see below).
Raw quantity and unit are stored alongside the normalised value.

## Factor selection

1. An explicitly selected factor on the record is used if APPROVED, visible to the organization and applicable
   (activity type, method, unit, validity dates).
2. Otherwise: APPROVED factors matching activity type, method, unit, the facility's `grid_region` and the
   validity window; the highest version per factor family is used.
3. No candidate → `MISSING_FACTOR` (blocking). Several families → `AMBIGUOUS_FACTOR` (blocking) — the user
   must select one. No default or fallback value exists anywhere.
4. Factors with different GWP bases in one run → `MIXED_GWP_BASIS` (blocking). New factors default to
   **AR6** (IFRS S2 requires the latest IPCC assessment); AR5 stays selectable for restatements.
5. A factor whose kind is not allowed for its method is never used (see below).

## Scope 2 dual reporting

* Location-based uses `method = location` factors of kind **`grid_average`**: the average emission rate of the
  grid where the electricity is consumed (GHG Protocol Scope 2 Guidance). An undeclared kind blocks
  (`FACTOR_KIND_UNDECLARED`).
* A **combined margin** (CDM Tool 07 OM/BM/CM) is a project-baseline metric, never a Scope 2 factor. It is
  rejected by the API (422), the library (`MARGIN_FACTOR_NOT_ALLOWED`, blocking) and the database check
  `ck_esg_factor_no_margin_scope2`. The 0.550 kg CO2e/kWh once hard-coded as "location-based" was a combined
  margin with an unlocated citation and has been removed.
* Market-based follows the Scope 2 Guidance hierarchy (methodology 1.3), for each grid-electricity record:
  1. **Contractual instruments** (`POST /contractual-instruments`, table `esg_contractual_instrument`): energy
     attribute certificates retired for the reporting entity (e.g. I-RECs), or a power purchase agreement that
     conveys the generation's attributes. Each is entered for one facility and one reporting period with its MWh,
     the emission rate it conveys, its vintage, the dates it applies to and the evidence for every Scope 2 Quality
     Criterion it meets (Scope 2 Guidance ch. 7): `conveys_emission_rate`, `unique_claim`, `retired_for_entity`,
     `vintage_close_to_consumption`, and for a PPA also `exclusive_transfer`. Same market is checked, not attested:
     the generation market must equal the facility's grid region. A second person approves it. Approved instruments
     are applied first, by kWh, to the facility's records that lie wholly inside their dates, in date order. No kWh
     is applied twice, and the same reference entered twice fails `unique_claim`. An instrument that misses a
     criterion is not used (`INSTRUMENT_FAILS_QUALITY_CRITERIA`); kWh it cannot apply are reported
     (`INSTRUMENT_KWH_UNUSED`) and never carried into another period.
  2. **Supplier-specific rate**: a `supplier_specific` factor the record selects (`market_factor_id`). The rate
     belongs to a supply contract, which a grid region does not identify, so it is never applied by region alone;
     when one exists and a record does not select it, `SUPPLIER_RATE_NOT_SELECTED` (non-blocking).
  3. **Residual mix**: a `residual_mix` factor for the facility's grid region, applied without a selection.
  4. **Otherwise the grid average**: a market `grid_average` factor or, without one, the record's location-based
     rate. Each such record is flagged `MARKET_FALLBACK_GRID_AVERAGE` (non-blocking) and the report states the kWh,
     their share and the grid regions. Bangladesh publishes no residual mix, so for Bangladeshi electricity not
     covered by instruments this is the normal case: market-based then equals location-based for that electricity,
     and the grid average may include attributes that others have claimed.

  A selected factor that ranks below a level that applies is `MARKET_HIERARCHY_VIOLATION`; a selected factor for
  another grid region is `MARKET_FACTOR_OTHER_MARKET`. Both block. The market-based total is `null`
  (`MISSING_MARKET_BASED_INPUT`, report status `MISSING_INPUTS`) only when not even a grid average applies. The
  report (schema `carbonos.esg.report/2`) has `scope2_market_based_disclosure`: kWh by level, every approved
  instrument with the kWh applied and not applied, and the fallback statement. `scope2_market_based_status` is
  `COMPLETE`, `GRID_AVERAGE_FALLBACK` or `MISSING_INPUTS`.
* `electricity_export` and `onsite_renewable_generation` are memo items: reported, never added to or
  subtracted from Scope 2. Offsets and avoided emissions are not part of the inventory.

## Scope 1 where Bangladeshi factories emit (methodology 1.1)

**Natural gas on an energy basis.** A gas factor may be per GJ (NCV). The record then carries the
distributor's or Petrobangla's heating value: `GJ = billed m3 × volume_correction × GCV (MJ/m3) × NCV/GCV
÷ 1000`. GCV may be entered in MJ/m3, kcal/m3 (IT, 4.1868 kJ) or Btu/scf (IT Btu, ft3 = 0.028316846592 m3);
the reference conditions and the NCV/GCV ratio are stated on the record. No heating value →
`MISSING_HEATING_VALUE` (blocking). A declared default heating value is allowed but flagged
`HIGH_UNCERTAINTY`. Volume-basis gas factors (per m3) remain usable.
At facility level the distributor's gas-analysis certificate is preferred: a certificate stored as evidence with its validity period (`esg_gas_certificate`, approved by a second person) replaces the record's heating value whenever its validity covers the whole record; the line names the certificate, and certificates are part of the calculation input hash.

**Captive generation.** Generator fuel is Scope 1. Generator kWh are the memo item
`captive_generation_output` and are never also Scope 2: an electricity record carrying a `generator_ref`, or a
meter shared with captive output, is rejected at ingest (422/409) and in the calculation
(`DOUBLE_COUNTED_ELECTRICITY`, blocking). A generator is registered per facility in the equipment register
(`esg_equipment`, unique on facility + reference), so `G1` at two factories is two generators; a fuel or output
record may only name a registered generator of its own facility. Specific fuel consumption per generator is
checked against configurable plausibility bands (defaults: diesel 0.20–0.45 L/kWh, gas engine 7.5–13.0 MJ/kWh) →
`GENERATOR_EFFICIENCY_OUT_OF_BAND` (blocking) or `GENERATOR_OUTPUT_MISSING`; output with no fuel record →
`GENERATOR_FUEL_MISSING`, a fuel without a configured band → `GENERATOR_BAND_NOT_CONFIGURED` (both reported, not
blocking).

**Refrigerants (methodology 1.2).** Per gas and record:

    E = (stored_start − stored_end) + (purchased − returned_or_sold) + (equipment_charge_start − equipment_charge_end)

Stored = gas in cylinders, outside equipment. The record carries the four inventory terms; the two equipment-charge
terms are the total full (nameplate) charge of that gas in service at the start and at the end of the record's
dates, taken from the facility's dated equipment register (`esg_equipment` units of kind `refrigeration`,
`esg_equipment_event` install / retire / recharge events). An install or retire dated inside the record's dates
changes the end charge only, so filling a new unit from purchased gas, or retiring a unit with full recovery, nets
to zero; a top-up after a leak is emitted. Register events are append-only (void with a reason). This is the
material-balance form of the US EPA Center for Corporate Climate Leadership guidance on direct fugitive emissions
(decrease in inventory + purchases − sales − increase in full charge); the formula is the owner's instruction C2,
and the EPA wording has not been re-checked against the PDF in this round.

CO2e = kg × GWP-100 of the period's GWP basis; no factor row is used. A negative balance is `DATA_INCONSISTENT`
(blocking): rejected at entry (422) and in the calculation, never clamped to zero. A record approved against one
register state and calculated against another is `REFRIGERANT_REGISTER_CHANGED` (blocking) until it is corrected.
Register events are part of the calculation input hash. HCFC-22 is a Montreal Protocol gas: reported as memo
`montreal_protocol_gases_kgco2e`, never in Scope 1.

**Biomass.** Gas-level factors carry `CO2_biogenic` (memo, outside the scopes), `CH4_non_fossil` and `N2O`.

**GWP basis.** Each reporting period has a basis, AR6 by default; AR5 is selectable. Every factor in a run
must match it (`MIXED_GWP_BASIS`). GWP-100 values are pinned in `inference/esg_rag/gwp.py`:
AR6 — WG1 Ch. 7 Table 7.15 (CH4-fossil 29.8, CH4-non fossil 27.0, N2O 273) and Table 7.SM.7 (halocarbons);
AR5 — WG1 Ch. 8 Table 8.A.1.

**Data quality and uncertainty.** Every record carries a grade: metered, billed, estimated or default (an
ungraded record is flagged `DATA_QUALITY_UNGRADED`). Activity uncertainty is the record's own value or the
grade default (CarbonOS configuration informed by IPCC 2006 Vol. 2 Table 2.15, not IPCC values: metered 2 %,
billed 2 %, estimated 15 %, default 30 %). Factor uncertainty is the factor's value, or for gas-level factors
the gases combined with Eq. 3.2. Lines combine activity, heating value and factor with Eq. 3.1; totals use
Eq. 3.2 (IPCC 2006 Vol. 1 Ch. 3, Approach 1), with coverage reported when some lines lack an uncertainty.
For asymmetric IPCC ranges the larger half-range is used (Vol. 1 p. 3.29). No correction for large
uncertainties (Section 3.7.3) is applied.

**Primary sources read for these values** (downloaded 2026-11-01 over verified HTTPS):

| Document | SHA-256 | Used |
|---|---|---|
| IPCC 2006 Vol. 2 Ch. 1 (V2_1_Ch1_Introduction.pdf) | `e391cd4676d0891cd77f67d3bd76e0e6775386b468ce5ce7ebe2311a6ea1ac45` | Table 1.2 NCV (p. 1.18–1.19), Table 1.4 CO2 EF (p. 1.23–1.24) |
| IPCC 2006 Vol. 2 Ch. 2 (V2_2_Ch2_Stationary_Combustion.pdf) | `a25d9f96d7672df391b328de79d4cfd812c07fe79d5cf4a30d23d82d8f02985b` | Tables 2.2 (p. 2.16), 2.3 (p. 2.18–2.19), 2.15 (p. 2.41) |
| IPCC 2006 Vol. 1 Ch. 3 (V1_3_Ch3_Uncertainties.pdf) | `65a12a08417139d89ba7faef0a414bc63460fb0a5c14ca10f727d5bba317f3aa` | Eq. 3.1, 3.2, Approach 1 (p. 3.28–3.29) |
| IPCC AR6 WG1 Ch. 7 | `470d2662fdd212421617a32c684e8106a4221a7235bdfff40a278eff02febfa9` | Table 7.15 |
| IPCC AR6 WG1 Ch. 7 Supplementary Material | `4290518ef9418a4157ddb9481e589131eeb110614c3aa7b62641d3241d39ce58` | Table 7.SM.7 (p. 7SM-16–17) |
| IPCC AR5 WG1 Ch. 8 | `9709d70802b4a78fe372f6a949d4d2af7bf31c38c1f666783d5b188702dc2836` | Table 8.A.1 |

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
