# Emission Factor Registry

## Policy

* **CarbonOS ships no approved emission factors.** Every factor used in a calculation is entered with a
  citation and approved by a second person (author ≠ approver, enforced by a database check constraint).
* Organization factors are private to that organization and labelled `is_custom = true`.
  Platform-wide factors (`organization_id = NULL`) can be created and approved only by platform operators.
* A factor row is immutable once APPROVED. A correction or new publication is a new version in the same
  family; historic locked reports keep the version they used (stored in the snapshot).
* Required provenance: publisher, document, year, GWP basis (AR4/AR5/AR6), region, validity dates;
  optional URL, table reference and licence note.

## Legacy constants (not used by the ledger)

`calculation_engine.DEFAULT_ACTIVITY_FACTORS`, `factor_registry.FACTOR_REGISTRY_CATALOG` and the
`esg_emission_factors` table pre-date the ledger. The "DoE Gazette 22.02.0000.018.99.001.23" citation could
not be found and was withdrawn, together with the 0.550 / 0.612 / 0.488 grid margins it was said to back
(data authenticity register A9). The legacy catalog now has no grid factor and marks every remaining value
UNVERIFIED. It is used only by legacy demo endpoints (`/duckdb-calculate`, `/emission-factors/registry`).

## Factor kinds (Scope 2)

Every Scope 2 electricity factor declares `factor_kind`:

| Kind | Allowed for | Meaning |
|---|---|---|
| `grid_average` | location-based (required); market-based as the last level, where no instrument, supplier rate or residual mix applies (flagged `MARKET_FALLBACK_GRID_AVERAGE` and disclosed) | Average emission rate of the grid where the electricity is consumed |
| `supplier_specific` | market-based, when the record selects it (`market_factor_id`) | Emission rate of the utility or supplier the electricity is bought from. Certificates and PPAs are contractual instruments (`/contractual-instruments`), not factors |
| `residual_mix` | market-based | Grid mix after contractual claims are removed |
| `grid_combined_margin` | **never** | CDM Tool 07 project-baseline metric (OM/BM/CM). Rejected by the API (422), the calculation library (`MARGIN_FACTOR_NOT_ALLOWED`) and the check constraint `ck_esg_factor_no_margin_scope2` |

Scope 1 factors carry no kind. Rows created before migration 0003 have no kind; a Scope 2 electricity
factor without one blocks calculation (`FACTOR_KIND_UNDECLARED`) until a new version declares it.

GWP basis defaults to **AR6** (IFRS S2 requires the latest IPCC assessment); AR5 and AR4 remain selectable.
Mixing bases in one calculation is blocking (`MIXED_GWP_BASIS`).

## Candidate authoritative sources to load (needs human verification and licence review)

| Need | Candidate source | Status |
|---|---|---|
| Fuel combustion defaults | IPCC 2006 Guidelines for National GHG Inventories, Vol. 2 Energy (with NCV/density assumptions) | NOT LOADED |
| Fuel and electricity conversion factors (UK-centred) | UK DESNZ GHG conversion factors (annual) | NOT LOADED — check applicability outside UK |
| Bangladesh grid factor (location-based = grid **average**) | CarbonOS derivation from BPDB annual reports (`factors/bd_grid/`), cross-checked against Ember (average). A CDM/IFI combined margin is a reconciliation reference only, never a Scope 2 factor | **DRAFT pending source files** — no official source validated in this repo |
| Residual mix / market-based | Supplier disclosures, contractual instruments (I-REC) | Customer-provided |

Loading a source means: record the exact document, table and year, enter values per canonical unit,
approve by a second reviewer, and add a row here.
