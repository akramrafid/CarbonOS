# Data Authenticity Register

Every known fabricated, estimated, simulated or unverified value source in the ESG product.
"Disposition" records what happened to it; anything not yet removed must be treated as DEMO.

| # | Location | What it does | Classification | Disposition |
|---|---|---|---|---|
| A1 | `inference/esg_rag/router.py` `/extract-footprint` | No file/text → canned string "14,200 Liters … 156,000 kWh"; or first doc of tenant | FABRICATED | Removed P0-2 (422) |
| A2 | `router.py` `build_nine_category_footprint` | Invents canteen/clothing/housing/entertainment emissions & BDT spend from constants (850 kg, 185,000 BDT, …), all `status: "verified"` | FABRICATED | Removed P0-2 |
| A3 | `router.py` `/extract-footprint` response | `audit_seal: True`, "Verified extraction completed", `trend_vs_last_month: -8.0` constant | FALSE LABEL | Removed P0-2 |
| A4 | `extractor.regex_heuristic_extraction` | No regex match → "standard verified baseline" 8 values with invented snippets | FABRICATED | Removed P0-2 |
| A5 | `extractor.detect_all_utility_segments` | <3 segments → injects 8 default segments; invented meter IDs, invoice number, issuer, period, tariff-based BDT costs, fixed `verified_at` | FABRICATED | Removed P0-2 (also fixed: "Peak" regex matched inside "Off-Peak", double counting kWh) |
| A6 | `extractor` rule `solar_netmeter` factor −0.550 | Subtracts exported solar from Scope 2 | METHOD ERROR | P0-2: solar export, kVA demand and kVARh reported in `excluded_segments`, never netted into totals |
| A7 | `router.py` `/entity-tree` | Hardcoded "Apex Holdings Group" emissions | DEMO | Demo-org only P0-2 |
| A8 | `router.py` `/satellite-insets` | Hardcoded project ratings ("AAA", permanence 98.4) | DEMO | Demo-org only P0-2 |
| A9 | `calculation_engine.DEFAULT_ACTIVITY_FACTORS` | Grid 0.550, market 0.120, commute 0.40 t/employee etc. attributed to "DoE Gazette 22.02.0000.018.99.001.23" | UNVERIFIED CITATION | Open → P1 factor registry |
| A10 | `calculation_engine` | `max(latency, 0.42)` fake latency floor; "DuckDB" engine label without DuckDB | FALSE LABEL | Open → replaced by P1 engine |
| A11 | `/duckdb-calculate` `audit_hash` | Hash includes current time → not reproducible, presented as audit seal | FALSE LABEL | Open → P1 |
| A12 | `factor_registry.FACTOR_REGISTRY_CATALOG` | Gazette refs, uncertainty % not validated | UNVERIFIED CITATION | Open → P1 |
| A13 | `atlas_benchmark.py` | "Benchmark" over synthetic cases | SIMULATED EVAL | Open → P2 evaluation set |
| A14 | `seed_data.py` | Sample "audit statement" for Dexterity Textiles in tenant corpus; regulatory text summaries | SAMPLE | Open → move to demo org |
| A15 | `models.ESGQueryLog.verified_by_audit` default True; set True for LLM answers | FALSE LABEL | Default False and never set by software P0-2 |
| A16 | `generator.generate_local_fallback_answer` | "Based on verified repository records… Audit Citation" | FALSE LABEL | Reworded P0-2 |
| A17 | `SaaSDashboard.jsx` `executeAIExtraction` catch | Any failure → 8 fabricated values, `audit_seal: true`, "ISO 14064 assurance", success toast | FABRICATED | Removed P0-2 |
| A18 | `SaaSDashboard.jsx` sample loader | Sample text presented as "Verified audit statement … ISO 14064 assurance" | DEMO mislabeled | Relabeled DEMO P0-2 |
| A19 | `SaaSDashboard.jsx` `executeRagQuery` catch | Invents answers + citations + `model_used: gemini-2.5-flash`, confidence 0.95 | FABRICATED | Removed P0-2 |
| A20 | `SaaSDashboard.jsx` `syncOfficialFactors` catch | Failure toast says "Synchronized with verified local DoE 2023 factor library" | FALSE LABEL | Removed P0-2 |
| A21 | `src/lib/esgDocumentExtractor.js` | Defaults electricity 18,640 (electricity bills) and the 8-value Dexterity baseline when parse fails; invented per-match confidences 0.95–0.99; `audit_seal: true`, "ISO 14064 assurance" | FABRICATED | Removed P0-2 (confidences now `null`) |
| A22 | `UniversalUtilityExtractor.jsx` client presets + `setTimeout` "analysis" | Simulated PDF analysis with preset segments | DEMO | Open → badge/isolate P1 |
| A23 | `clientProfiles.js`, Factor/Atlas/Conglomerate/DuckDB studios | Static numbers | DEMO | Open → P1 UI split |
| A24 | `SaaSDashboard.jsx` overview cards | "Emissions Reduced 2,450 tCO2e", "Rating 9.3 AI score", "Audited against ISO 14064-1", "Top 5% in Sector", "DoE 2026 Compliant", "ISAE 3410", trend chart, team/project counts | FABRICATED KPIs | Page permanently labelled DEMO (fixed banner linking to `/platform/esg`); assurance/compliance claims removed. Illustrative numbers remain — real figures live in the ESG workspace, which shows only API data |
| A25 | `SaaSDashboard.jsx` `calculateEmissions` + category matrix | Client-side category footprint with uncited factors (step 2) | UNVERIFIED ESTIMATE | P0-2 banner labels it as estimate/demo; **Open → replaced by server engine P1** |
| A26 | `SaaSDashboard.jsx` sample button | "Load Verified Sample Document" | FALSE LABEL | Renamed "Load Demo Sample (fictional)" P0-2 |
| A27 | RAG panel | "Audit Traceable Response", default confidence 95%, default latency 320 ms | FALSE LABEL | Fixed P0-2 |
