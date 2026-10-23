# ESG Data Model

Ledger tables live on `EsgBase` and are created only by Alembic (`inference/esg_migrations`, version table
`esg_alembic_version`). Migration `0001` is verified on PostgreSQL 16 and SQLite (`alembic check`: no drift;
downgrade → upgrade round trip). Accounting values use `NUMERIC(28,10)` (quantities, factors) and
`NUMERIC(28,6)` (kg), never floats.

```
esg_organization ─┬─ esg_membership (org, user_sub, role)     UNIQUE(org,user)  CHECK role
                  ├─ esg_invitation (email, role, token_sha256, expiry)
                  ├─ esg_legal_entity ── esg_facility (control flags, equity %, grid_region)
                  ├─ esg_reporting_period (dates, boundary_method, status OPEN|LOCKED, revision)
                  ├─ esg_emission_factor (family, version, value, unit, region, GWP, method, source…, DRAFT|APPROVED|RETIRED)
                  │      (organization_id NULL = platform-wide)
                  ├─ esg_activity_record (raw + canonical qty/unit, dates, meter_ref, source, evidence,
                  │      factor refs, status DRAFT|SUBMITTED|APPROVED|REJECTED|SUPERSEDED, supersedes_id,
                  │      idempotency_key, created_by/reviewed_by)
                  ├─ esg_calculation_run (input_sha256, totals, exceptions, excluded, memo, by_facility)
                  │      └─ esg_calculation_line (activity, factor+version, operands, emissions_kg, formula)
                  ├─ esg_report_snapshot (period, revision, canonical JSON content, sha256, prepared_by, approved_by)
                  └─ esg_audit_event (append-only actor/action/entity/data)
```

## Integrity rules enforced by the database

| Rule | Constraint |
|---|---|
| Child rows belong to the same organization as their facility / period / run | composite FKs `(organization_id, id)` |
| One period name per organization | `uq_esg_period_org_name` |
| Factor versions unique per family | `uq_esg_factor_family_version` |
| Factor author ≠ approver; activity creator ≠ reviewer; snapshot preparer ≠ approver | `ck_*_dual_control` |
| No negative quantities or factors; valid date ranges; equity 0–100 | `ck_*` checks |
| Import retries do not duplicate | `uq_esg_activity_idempotency (organization_id, idempotency_key)` |
| One snapshot per period revision | `uq_esg_snapshot_period_revision` |

SQLite enforces foreign keys only with `PRAGMA foreign_keys=ON` (the tests enable it). Production should run on
PostgreSQL (`DATABASE_URL=postgresql+psycopg2://…`).

## Legacy tables (shared `Base`, created with `create_all`)

`esg_rag_document`, `esg_rag_chunk`, `esg_rag_querylog`, `esg_emission_factors` — RAG and legacy factor
lookup. `tenant_id` is the organization id (string, no FK).
