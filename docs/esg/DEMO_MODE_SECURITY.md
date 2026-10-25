# CarbonOS ESG SaaS — Demo Mode Security Architecture

**Document Version:** 1.0.0  
**Status:** Implemented & Verified  
**Scope:** `ESG_ACCESS_MODE=isolated_demo`  

---

## 1. Security Philosophy: Zero-Friction Demo Without Insecure Backends

A common anti-pattern in developer demos is "bypassing auth" by opening endpoints, accepting client-supplied `tenant_id` query params/headers, or disabling permission checks. **CarbonOS strictly rejects this approach.**

Instead, CarbonOS implements an **Isolated Ephemeral Demo Mode**:
1. **Server-Owned Identity:** The backend provisions a unique, ephemeral tenant (`demo-<random-uuid>`) and mints short-lived (2-hour) HS256 JWT tokens.
2. **Deny-by-Default Tenant Scoping:** The tenant is *never* accepted from client headers or query parameters. The backend middleware derives `organization_id` strictly from the `sub` claim in the verified JWT via the `esg_membership` table.
3. **Dual Control (Segregation of Duties):** In demo mode, two explicit personas are issued:
   - `owner` (`role=org_owner`): Can create legal entities, upload invoices, and submit activity records.
   - `reviewer` (`role=auditor`): Can review and approve/reject activity records and calculation runs.
   - **Enforcement:** If `owner` attempts to self-approve an activity record or calculation line, the backend raises `403 Forbidden` (`SelfApprovalError`). The frontend UI provides an explicit persona switcher to test the dual-control flow honestly.
4. **Isolated Storage:** Ephemeral sessions live in browser `sessionStorage` (never `localStorage` or shared persistent cookies). Closing the tab terminates the session.
5. **No Synthetic Assurance:** All demo calculations, views, and exported files carry a prominent watermark badge: `DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED`.
6. **Fail-Closed in Production:** When `ESG_ACCESS_MODE=protected` (or `ESG_ENV=production`), all demo provisioning and reset endpoints return `403 Forbidden`. If `ESG_AUTH_JWT_SECRET` is unset, the system fails closed with `503 Service Unavailable`.

---

## 2. Operating Access Modes (`ESG_ACCESS_MODE`)

| Mode | Allowed Environments | Demo Session Provisioning (`/api/esg/demo/session`) | Authentication Provider | Intended Audience |
|---|---|---|---|---|
| `isolated_demo` | Local dev, Staging, Public Demo Sandbox | **Enabled** (Automatic ephemeral tenant creation) | Server-minted ephemeral JWT | Evaluators, sales demos, automated E2E tests |
| `private_single_tenant` | Air-gapped on-premise installation | **Disabled** | Pre-configured service identity | Enterprise single-client POC |
| `protected` / `oidc` | Production | **Disabled** (Returns 403) | External OIDC / JWKS (Okta, Keycloak, Entra) | Live commercial operations |

---

## 3. Threat Model & Mitigation Matrix

| Threat ID | Threat Description | Mitigation in CarbonOS Demo Mode | Verification Test |
|---|---|---|---|
| **T-01** | **IDOR / Cross-Tenant Data Access:** Visitor A guesses or passes Visitor B's `tenant_id` in headers or payloads. | Middleware extracts `organization_id` exclusively from JWT subject's database membership. Client-supplied `tenant_id` in JSON or headers is discarded. | `tests/test_esg_security.py::test_client_supplied_tenant_id_is_ignored`<br>`tests/test_esg_demo_mode.py::test_tenant_isolation_between_concurrent_demo_sessions` |
| **T-02** | **Segregation of Duties Bypass:** Submitter attempts to self-approve their own greenhouse gas records. | Backend `ledger.py` explicitly verifies `record.created_by != current_user.sub`. Self-approval raises HTTP 403. | `tests/test_esg_demo_mode.py::test_dual_control_reviewer_persona_approval` |
| **T-03** | **Production Exposure:** Demo provisioning endpoint left active in public production deployment. | `create_demo_session` checks `get_access_mode() not in ("isolated_demo", "local_dev")` and raises HTTP 403 immediately. | `tests/test_esg_demo_mode.py::test_protected_mode_rejects_demo_endpoints` |
| **T-04** | **Unconfigured Secret Bypass:** Deployment started with empty or missing secret. | `_decode()` in `auth.py` checks secret length >= 32; if unset or empty, raises HTTP 503 "ESG authentication is not configured". | `tests/test_esg_security.py::test_fails_closed_when_auth_not_configured` |
| **T-05** | **Malicious File Upload:** Uploading path-traversal filenames or non-utility formats. | Filename sanitized with `os.path.basename`, size capped at 10MB, extension restricted to `.pdf`, `.png`, `.jpg`, `.csv`, `.xlsx`. | `tests/test_esg_security.py::test_path_traversal_filename_is_contained` |
| **T-06** | **Denial of Service / Storage Bloat:** Abandoned demo tenants consuming database space. | `clean_demo_organization()` provides atomic cascading cleanup across all 11 child tables. | `tests/test_esg_demo_mode.py::test_demo_reset` |

---

## 4. Dual-Control Persona Specification

```
[ Visitor / Evaluator ]
         │
         ├── Selects "Owner (Submitter)"
         │        │
         │        ├── Inputs utility data (e.g. 142,000 kWh BPDB)
         │        └── Submits Activity Record -> Status: "SUBMITTED"
         │
         ├── Attempts Self-Approval as "Owner" -> ❌ 403 Forbidden (Blocked)
         │
         └── Switches Persona to "Auditor / Reviewer"
                  │
                  ├── Inspects invoice snippet & DoE grid emission factor
                  └── Approves Activity Record -> Status: "APPROVED"
```

---

## 5. Summary of Verification Evidence

- `test_demo_session_creation_and_seeding`: PASS
- `test_tenant_isolation_between_concurrent_demo_sessions`: PASS
- `test_dual_control_reviewer_persona_approval`: PASS
- `test_demo_reset`: PASS
- `test_protected_mode_rejects_demo_endpoints`: PASS
