# CarbonOS ESG SaaS — Emission Factor Source Register

**Status:** UNVERIFIED register. Nothing listed here is an approved factor. Inventory calculations use only
factors entered in the ledger's factor registry with a citation and approved by a second person
(see [FACTOR_REGISTRY.md](FACTOR_REGISTRY.md)).

---

## 1. Scope 2 grid electricity (Bangladesh)

No official Bangladesh grid emission factor has been located.

| Withdrawn entry | Value | Why it was withdrawn |
|---|---|---|
| "Bangladesh National Grid Electricity Baseline", cited to "DoE Gazette Memo Ref: 22.02.0000.018.99.001.23" | 0.637 kg CO2e/kWh | The cited document could not be found. |
| "Grid Peak Hour Thermal Surcharge Factor", cited to a BERC peaking schedule | 0.620 kg CO2e/kWh | No source located. A peak-hour marginal rate is not a location-based factor: every kWh in a period gets the same grid-average rate. |
| "Off-Peak Industrial Combined Cycle Baseline" (the 0.550 used in code as a "Combined Margin") | 0.550 kg CO2e/kWh | No source located, and a combined margin (CDM Tool 07) is a project-baseline metric, never a Scope 2 factor. |
| "Rooftop Solar PV Generation (Avoided Emission)" | −0.637 kg CO2e/kWh | Exported or self-generated electricity is a memo item; it is never a negative factor. |

What replaces them: a DRAFT Bangladesh grid **average** derived by CarbonOS from BPDB annual-report data
(`factors/bd_grid/`), with every source file's URL, SHA-256, table and page recorded. It stays DRAFT until a
second person approves it.

## 2. Scope 1 fuel combustion

| Fuel | Legacy value | Status |
|---|---|---|
| High-speed diesel | 2.680 kg CO2e/L | UNVERIFIED: the "Bangladesh DoE Stationary Diesel Gazette" was not located. |
| Natural gas | 2.020 kg CO2e/m³ | UNVERIFIED: the "KGDC Gas Quality Gazette" was not located; gas is to be accounted on an energy basis from the distributor's or Petrobangla's heating value. |
| LPG | 2.980 kg CO2e/kg | UNVERIFIED legacy value. |
| Heavy fuel oil | 3,114 kg CO2e/t | UNVERIFIED legacy value. |

Replacement: 2006 IPCC Guidelines, Vol. 2 (Energy), Ch. 2 default emission factors and Ch. 1 net calorific
values, converted per fuel with stated densities and heating values, entered as DRAFT factors with table and
page references.

## 3. Scope 3

Out of scope for the Bangladesh Scope 1 + 2 inventory work. The legacy Scope 3 values in the demo code are
unverified.

## 4. Governance

1. Factor rows are immutable once APPROVED; a correction is a new version in the same family.
2. The author of a factor cannot approve it (database check constraint).
3. A Scope 2 electricity factor declares its kind. Location-based must be `grid_average`; a
   `grid_combined_margin` factor is rejected for Scope 2 by the code and by a database check.
