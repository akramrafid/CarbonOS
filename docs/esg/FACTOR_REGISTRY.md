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
`esg_emission_factors` table pre-date the ledger. Their citations (e.g. "DoE Gazette
22.02.0000.018.99.001.23") have **not** been validated; see data authenticity register A9/A12. They are
used only by legacy demo endpoints (`/duckdb-calculate`, `/emission-factors/registry`).

## Candidate authoritative sources to load (needs human verification and licence review)

| Need | Candidate source | Status |
|---|---|---|
| Fuel combustion defaults | IPCC 2006 Guidelines for National GHG Inventories, Vol. 2 Energy (with NCV/density assumptions) | NOT LOADED |
| Fuel and electricity conversion factors (UK-centred) | UK DESNZ GHG conversion factors (annual) | NOT LOADED — check applicability outside UK |
| Bangladesh grid factor | A published national grid emission factor study / UNFCCC CDM grid factor for Bangladesh | **UNVERIFIED** — no official source validated in this repo |
| Residual mix / market-based | Supplier disclosures, contractual instruments (I-REC) | Customer-provided |

Loading a source means: record the exact document, table and year, enter values per canonical unit,
approve by a second reviewer, and add a row here.
