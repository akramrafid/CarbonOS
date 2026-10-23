# ESG Feature Gap Matrix

Legend: **REAL** works on authorised real inputs · **PARTIAL** real code with material gaps ·
**DEMO** hardcoded/simulated · **MISSING** absent · **BLOCKED** needs an external decision/credential.
Status at SHA 141e7b5 unless a later slice is named.

| Capability (customer journey step) | Status | Evidence |
|---|---|---|
| Account creation / login / logout / recovery / MFA | MISSING → BLOCKED | No auth anywhere in SPA or ESG API. P0-1 adds server-side token verification; the identity provider (login UI) is a product decision — see roadmap |
| Organization, membership, roles | MISSING → PARTIAL (P0-1) | P0-1 adds `esg_organization`, `esg_membership`, create-org + list-my-orgs endpoints. Invitations missing |
| Legal entities, consolidation boundary | DEMO | `/api/esg/entity-tree` returns hardcoded "Apex Holdings Group"; `ConglomerateTreeStudio.jsx` hardcoded |
| Facilities | MISSING | — |
| Reporting periods, locking | MISSING | — |
| Document upload | PARTIAL | `/ingest`, `/extract-footprint` store and chunk files; P0-1 secures storage; no async jobs/states |
| Extraction with page/row evidence | PARTIAL | Regex (default) or opt-in Gemini; snippets returned; no fabricated fallback since P0-2; page numbers only for server PDF text; no OCR |
| Human review / correct / approve extracted values | MISSING | P0-2 removed auto-"verified"; values marked REVIEW_REQUIRED; no review workflow yet |
| CSV/XLSX import mapping | MISSING | XLSX/CSV are flattened to text only |
| Activity-data ledger | MISSING | Values live in React state only; nothing persisted |
| Emission factor registry (versioned, cited, approved) | DEMO | Static Python list with unvalidated gazette refs; DB table has floats + free-text citation |
| Scope 1 calculation | PARTIAL | Float maths, uncited factors, client-side duplicate in `SaaSDashboard` |
| Scope 2 location / market | PARTIAL/DEMO | Market factor 0.120 is an invented constant (register A9); P0-2 stopped netting solar export in the segment extractor |
| Scope 3 | DEMO | Employee-count and spend heuristics with invented multipliers ("Food & Groceries", "Entertainment") |
| Calculation trace / reproducibility | MISSING | "SHA256 audit hash" includes wall-clock time → not reproducible |
| Approvals / separation of duties | MISSING | — |
| Report snapshot / export | DEMO | Frontend-only; no immutable snapshot |
| E/S/G metric intake (water, waste, social, governance) | DEMO/MISSING | Static UI only |
| Disclosure frameworks (IFRS S1/S2, GRI, ESRS, CDP) | DEMO | UI labels only; no requirements model or gap report |
| Supplier collaboration | MISSING | — |
| AI copilot (RAG) | PARTIAL | Real retrieval; P0-1 adds tenant enforcement; since P0-2 the client shows an unavailable state on failure |
| Audit log of state changes | PARTIAL | Only `esg_rag_querylog` (`verified_by_audit` now always False); no AuditEvent for state changes |
| Satellite insets in ESG | DEMO (out of scope module) | `/satellite-insets` hardcoded ratings |
| Billing/entitlements | DEMO | Pricing page only |
| Bangla/English localisation | PARTIAL | `SaaSLocalization.js` |
| CI (lint/test/e2e) | BROKEN | Scripts missing (00-baseline) |
