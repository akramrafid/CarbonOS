# ESG Release Readiness

Branch `esg/p0-security-baseline`, 2026-10-24. Classifications are backed by the commands in
[TEST_EVIDENCE.md](TEST_EVIDENCE.md). No quality scores are given.

## Gate status

| Gate | Status | Why |
|---|---|---|
| CODE_COMPLETE (P0 + P1 core listed in ROADMAP) | **Yes, with listed gaps** | PDF export, OCR, backups, job queue, localisation missing |
| SECURITY_REVIEWED | **No** | Self-review and adversarial tests only; needs an independent reviewer, DAST (HawkScan not run: no API key), secret history scan |
| METHODOLOGY_VALIDATED | **No** | Needs a GHG practitioner to review ACCOUNTING_METHODOLOGY.md and disclosure references |
| CUSTOMER_PILOT_READY | **No** — human authorization required | Blocked by the items below |
| PRODUCTION_APPROVED | **No** — human authorization required | |

## Area classification

| Area | Class |
|---|---|
| Authentication (API verification) | VERIFIED |
| Sign-in UI against a real identity provider | BLOCKED (provider not chosen/configured) |
| Tenant isolation (HTTP + database composite FKs + RAG prompt) | VERIFIED |
| Ledger, engine, locks, snapshots, exports | VERIFIED |
| Emission factors | VERIFIED mechanism, **no data** |
| E/S/G metrics, disclosure coverage | VERIFIED (references flagged) |
| Document extraction | PARTIAL (rule-based; no OCR; not evaluated) |
| AI copilot | PARTIAL (tenant-safe retrieval, abstains, no evaluation set) |
| Legacy `/platform/saas-dashboard` and studio components | DEMO ONLY |
| CI on GitHub | NOT RUN |
| Deployment, backups, monitoring/alerting | NOT STARTED |

## Human actions required before a pilot

1. **Choose and configure an OIDC identity provider** (with MFA for admins); set API and SPA variables.
2. **Source and approve emission factors** (grid, fuels) from citable publications; a second person approves each.
3. **GHG practitioner review** of the methodology and disclosure templates.
4. **Rotate committed secrets** (OpenWeatherMap key; check Django fallback secret use) — see THREAT_MODEL.md.
5. **Push the branch and run CI** (authorization needed); fix anything CI-specific.
6. **Provision non-production hosting**: PostgreSQL with automated backups and a tested restore, persistent upload
   storage with access control, the ESG API with `ESG_ENV=production`.
7. **Privacy notice / processing terms** matching actual data flows (Gemini only if enabled with consent).
8. Decide email delivery for invitations; decide Bangla localisation scope.
