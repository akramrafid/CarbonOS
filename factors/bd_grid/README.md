# Bangladesh grid emission factor (Step 1) — DRAFT, BLOCKED on source files

Location-based Scope 2 needs the **average** emission rate of the Bangladesh grid. No official published factor
was located, so CarbonOS derives one from BPDB data. Nothing here is approved; results load as DRAFT factor rows
and a second person approves them.

## Status

| Item | Status |
|---|---|
| Derivation code (`derive.py`, `build.py`) | Done; tested on synthetic inputs (`tests/test_bd_grid.py`) |
| IPCC 2006 defaults (`ipcc2006_defaults.json`) | Pinned with SHA-256, tables and pages |
| BPDB Annual Reports FY2022-23 onward | **BLOCKED**: the BPDB portal serves a self-signed certificate, and no URL was found for FY2023-24/24-25 |
| Petrobangla gas heating value (MMCF → TJ) | **BLOCKED**: source not located |
| Import factor (India CEA CO2 Baseline Database / Adani Godda) | **BLOCKED**: CEA page returned 404 |
| Factor results per fiscal year, 95 % intervals | Not produced: no real inputs yet |

## Method (per fiscal year, July–June)

1. Plant-wise net generation and fuel (gas MMCF, HFO/HSD litres, coal tonnes) from the BPDB annual report,
   recorded in `data/<FY>/plants.csv` with a `source_ref` per row (table and page).
2. Fuel → TJ (NCV): gas via the Petrobangla GCV at the MMCF reference conditions × NCV/GCV; liquids via
   density × IPCC NCV; coal via plant NCV or the IPCC default. CO2, CH4, N2O from IPCC 2006 Vol. 2 Table 2.2;
   CO2e at AR6.
3. (a) domestic generation-weighted average; (b) supply-weighted average including imports at a declared
   import factor; (c) (b) adjusted for T&D losses, memo only; (d) CDM Tool 07 OM/BM/CM, reconciliation only.
   Only (a) and (b) can become factor rows, always as `grid_average`.
4. Coverage: plant sums vs BPDB national generation and fuel totals. A residual above 2 % without a written
   explanation leaves the year `DRAFT_COVERAGE_GAP`.
5. Monte Carlo, at least 10,000 seeded draws, over NCV, emission factors, heating value, density, import factor
   and the imputation of plants without fuel data (bootstrap from same-fuel plants). 95 % interval reported.
6. `draft_factor_rows()` turns a year into ledger payloads (DRAFT, valid 1 July–30 June). A record spanning
   two fiscal years takes each month's factor (`accounting.factor_pieces`).

## Rebuild

```
python -m factors.bd_grid.build            # data/ → output/bd_grid_factors.json (byte-identical for the same inputs)
```

## External comparison (acceptance A2, pending results)

* IFI Harmonized Grid Emission Factor dataset v2.0 — Bangladesh CM 0.502 (firm) / 0.565 (intermittent), to compare
  with (d).
* Ember yearly electricity data — compare with (a). Ember's method and emission factors must be read before
  comparing (their intensities may be on a different basis).
* IEA only with a licence (not used).
