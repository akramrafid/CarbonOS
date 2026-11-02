# Bangladesh grid-average emission factor (Step 1): DRAFT, waiting for source files

Location-based Scope 2 needs the **average** emission rate of the Bangladesh grid. No official published factor was
located, so CarbonOS derives one, two ways, from national data. Nothing here is approved: results load as DRAFT
factor rows and a second person approves them. Nothing is verified or assured.

## Method, per fiscal year (July–June)

**Method A (primary): top-down fuel balance.** Fuel to grid-connected generation → TJ (NCV) → CO2, CH4, N2O with the
IPCC 2006 Vol. 2 Ch. 2 Table 2.2 defaults → CO2e (AR6), over BPDB national net generation (FY2022-23 p.62).

* Gas: Petrobangla's sales to the power sector, **captive generation excluded** (that is the factories' own Scope 1).
  Heating value: a national value from a cited document, otherwise a declared default flagged `HIGH_UNCERTAINTY`;
  no heating value at all → `BLOCKED`.
* Liquid fuels: BPC sales to power (mass, or volume with a cited density).
* Coal: per plant from the operators' reports (Barapukuria, Payra, Rampal, Matarbari), tonnes with NCV.
* BPDB's public-sector fuel totals (p.65) are a partial cross-check only: they may not exceed the fuel balance.

**Method B (cross-check): bottom-up generation by fuel.** Plant-wise kWh (purchases pp.116–120 and BPDB own plants)
mapped to fuel and technology (installed capacity pp.58–60) × a technology heat-rate range from `heat_rates.json`.
Every range must be cited; none is yet, so Method B is `BLOCKED` on real data until ranges are entered.

**Imports (both methods).** Adani Godda at its plant-specific factor with uncertainty; NVVN, PGCIL and other Indian
supply at the latest CEA CO2 Baseline Database weighted average including cross-border transfers.

**Reported per year.** (a) domestic generation-weighted and (b) supply-weighted averages from A and B, the A–B gap,
(c) a T&D-adjusted memo, (d) CDM Tool 07 OM/BM/CM from Method B's plants (reconciliation only, never a factor),
deltas against the IFI dataset and Ember (`references.json`), and a seeded Monte Carlo (≥ 10,000 draws, 95 %).

| Status | Meaning |
|---|---|
| `BLOCKED` | Method A lacks an input (no heating value, captive gas included, no CEA factor, ...). No factor row. |
| `DRAFT_COVERAGE_GAP` | Public-sector totals exceed the fuel balance without an explanation |
| `DRAFT_NO_CROSS_CHECK` | Method B could not run (e.g. heat rates not cited) |
| `DRAFT_METHOD_GAP` | A and B differ by more than 5 % and the inputs give no written explanation |
| `DRAFT_REFERENCE_GAP` | A derived value is more than 5 % from IFI or Ember without an explanation (blocks approval) |
| `DRAFT_REVIEWABLE` | Ready for a second person to review and approve |

`draft_factor_rows()` makes one ledger payload per fiscal year from Method A, kind `grid_average`, valid 1 July–30 June,
and only for a `DRAFT_REVIEWABLE` year: any other status keeps the factor out of the ledger, so it cannot be approved.
The row is the supply-weighted average (it includes imports, the mix drawn from the grid); the domestic
generation-weighted average is reported, not offered, so two approved rows can never be ambiguous. A record spanning
two fiscal years takes each month's factor (`accounting.factor_pieces`).

## Files

| Path | Holds |
|---|---|
| `sources/` | The source PDFs and datasets the owner provides. `python -m factors.bd_grid.sources` records SHA-256s. |
| `sources.json` | Source register: URL, SHA-256, tables and pages used, status |
| `data/<FY>/method_a.json` | Method A inputs (see `derive.MethodAInputs`), each figure with its source and page |
| `data/<FY>/method_b_plants.csv` | Method B plants: plant, net_gwh, fuel, technology, source, commissioning_year |
| `heat_rates.json` | Cited technology heat-rate ranges (all `NOT_SOURCED` today) |
| `references.json` | IFI v2.0 combined margins (as given in the spec, unverified) and Ember (not downloaded) |
| `ipcc2006_defaults.json` | IPCC 2006 NCVs and emission factors with ranges, pinned with SHA-256 |

## Rebuild

```
python -m factors.bd_grid.sources   # record SHA-256s of new files in sources/
python -m factors.bd_grid.build     # data/ → output/bd_grid_factors.json, byte-identical for the same inputs
python -m pytest tests/test_bd_grid.py
```

Status today: no extracted inputs exist, so `build` exits `BLOCKED` (2). The pipeline is tested on synthetic inputs.
