# ESG Feature Gap Matrix

Legend: **REAL** works on authorised real inputs · **PARTIAL** real code with material gaps ·
**DEMO** hardcoded/simulated · **MISSING** absent · **BLOCKED** needs an external decision/credential.
Status at SHA 141e7b5 unless a later slice is named.

| Capability (customer journey step) | Status | Evidence |
|---|---|---|
| Account creation / login / logout / recovery / MFA | MISSING → BLOCKED | No auth anywhere in SPA or ESG API. P0-1 adds server-side token verification; the identity provider (login UI) is a product decision — see roadmap |
| Organization, membership, roles | PARTIAL (API) | Orgs, 7 roles, member role change/removal with owner safeguards, email invitations bound to verified email claim (`members.py`). No UI; no email sending |
| Legal entities, consolidation boundary | PARTIAL (API) | `esg_legal_entity`, facility control flags + equity %, boundary chosen per period; dated ownership changes not modelled. Legacy `/entity-tree` demo-only |
| Facilities | PARTIAL (API) | `/facilities` with legal-entity link, grid region, control/equity. No UI |
| Reporting periods, locking | REAL (API) | Periods, lock with SoD + stale-input guard, restatement with reason/revision. No UI |
| Document upload | PARTIAL | `/ingest`, `/extract-footprint` store and chunk files; P0-1 secures storage; no async jobs/states |
| Extraction with page/row evidence | PARTIAL | Regex (default) or opt-in Gemini; snippets returned; no fabricated fallback since P0-2; page numbers only for server PDF text; no OCR |
| Human review / correct / approve extracted values | MISSING | P0-2 removed auto-"verified"; values marked REVIEW_REQUIRED; no review workflow yet |
| CSV/XLSX import mapping | MISSING | XLSX/CSV are flattened to text only |
| Activity-data ledger | REAL (API) | `esg_activity_record`: raw + canonical Decimal quantities, evidence fields, overlap rejection, idempotency, draft/submit/approve/reject/supersede. No UI; extraction results not yet posted into it |
| Emission factor registry (versioned, cited, approved) | REAL (API), EMPTY by policy | Versioned families, provenance, dual-control approval, immutable once approved. No factors shipped (FACTOR_REGISTRY.md) |
| Scope 1 calculation | REAL (API) for fuels | `accounting.py` Decimal engine; refrigerants/process not implemented. Legacy client calculator still in dashboard (A25) |
| Scope 2 location / market | REAL (API) | Separate totals; market-based `null` + MISSING_INPUTS unless every electricity record has an approved market input; memo items never netted |
| Scope 3 | DEMO | Employee-count and spend heuristics with invented multipliers ("Food & Groceries", "Entertainment") |
| Calculation trace / reproducibility | REAL (API) | Line-level formula, factor version, input SHA-256; locked snapshots byte-identical on export |
| Approvals / separation of duties | REAL (API) | Creator ≠ reviewer, author ≠ factor approver, preparer ≠ locker — enforced in service and DB check constraints |
| Report snapshot / export | PARTIAL (API) | Immutable canonical JSON + CSV with boundary, methods, factor provenance, exceptions, disclaimers. No PDF, no UI |
| E/S/G metric intake (water, waste, social, governance) | DEMO/MISSING | Static UI only |
| Disclosure frameworks (IFRS S1/S2, GRI, ESRS, CDP) | DEMO | UI labels only; no requirements model or gap report |
| Supplier collaboration | MISSING | — |
| AI copilot (RAG) | PARTIAL | Real retrieval; P0-1 adds tenant enforcement; since P0-2 the client shows an unavailable state on failure |
| Audit log of state changes | REAL (API) | `esg_audit_event` for every ledger/member/invitation change; `/audit-events` for reviewers |
| Satellite insets in ESG | DEMO (out of scope module) | `/satellite-insets` hardcoded ratings |
| Billing/entitlements | DEMO | Pricing page only |
| Bangla/English localisation | PARTIAL | `SaaSLocalization.js` |
| CI (lint/test/e2e) | PARTIAL | `esg-ci.yml` (SQLite + PostgreSQL + alembic check + Playwright) — not yet run on GitHub; `frontend-quality` contract job still fails on pre-existing findings |
