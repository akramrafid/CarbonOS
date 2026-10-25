# CarbonOS ESG SaaS — No-Login Ephemeral Demo Mode Architecture

## 1. Executive Summary & Design Rationale

Per owner decision and architectural specification, CarbonOS ESG SaaS delivers **immediate, zero-friction access to the full ESG workspace (`/platform/esg`) without requiring user registration, login, or external identity provider setup (Auth0, Supabase, Keycloak, etc.)**.

Crucially, **no-login direct access does NOT mean disabling authentication or tenant isolation on the backend**. Bypassing authorization or using a single shared global tenant would violate fundamental SaaS security and allow cross-visitor data tampering.

Instead, CarbonOS implements an **Isolated Ephemeral Demo Mode (`ESG_ACCESS_MODE=isolated_demo`)**:
1. When a visitor navigates to `/platform/esg`, the browser requests an ephemeral demo session (`POST /api/esg/demo/session`).
2. The backend generates an unguessable subject ID (`demo-<uuid>`), creates an isolated demo tenant (`ESGOrganization(is_demo=True)`), seeds realistic sample facilities, periods, and cited emission factors, and issues a cryptographically signed, short-lived JWT.
3. All subsequent API calls require this Bearer token. Tenant identity is resolved strictly on the server from `ESGMembership` records—client input is never trusted for tenant identity or role.
4. Separation-of-duties (dual-control) approval workflows are fully exercisable in demo mode via a simulated **Reviewer Persona**, maintaining 100% genuine backend verification without fake assurances.
5. All demo screens, calculations, and exports visibly display `DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED`.

---

## 2. Operating Access Modes (`ESG_ACCESS_MODE`)

| Mode | Allowed Environments | Behavior | Security Guarantees |
| :--- | :--- | :--- | :--- |
| `protected` | Production, Staging | Default in production. Refuses demo session creation (403). Requires validated OIDC identity provider (`ESG_AUTH_JWKS_URL`). | Deny by default. Fail closed if unconfigured. No demo endpoints. |
| `isolated_demo` / `demo` | Development, Demo, Preview | Auto-provisions isolated, ephemeral demo tenant. Generates signed demo JWT. Seeds synthetic Bangladesh benchmark data. | Full tenant isolation. Rate-limited by IP. Global factor corpora write-protected. |
| `local_dev` | Local loopback | Operates identically to `isolated_demo` for local testing. | Restricted to loopback / local development. |

---

## 3. Endpoints Specification

### `POST /api/esg/demo/session`
- **Authentication:** None (Public bootstrap endpoint).
- **Rate Limit:** Rate-limited by client IP (30 requests/hour per IP).
- **Access Guard:** Available only when `ESG_ACCESS_MODE in ("isolated_demo", "demo", "local_dev")`. Returns 403 Forbidden in `protected` mode.
- **Workflow:**
  1. Mint unguessable subject identifier: `sub = "demo-" + uuid.uuid4().hex[:12]`.
  2. Create demo tenant: `ESGOrganization(name="Demo Enterprise [SAMPLE DATA]", is_demo=True, created_by_sub=sub)`.
  3. Create owner membership: `ESGMembership(organization_id=org.id, user_sub=sub, role="org_owner")`.
  4. Create reviewer membership: `ESGMembership(organization_id=org.id, user_sub=f"{sub}-reviewer", role="auditor")`.
  5. Seed synthetic domain records:
     - Legal Entity: "Dhaka Apparel Mills Ltd [SAMPLE DATA]" (Country: BD, Operational Control).
     - Facility: "Savar Spinning Unit 1 [SAMPLE DATA]" (Grid Region: BD-NATIONAL-GRID).
     - Reporting Period: "FY2024-25 [SAMPLE DATA]" (2024-07-01 to 2025-06-30, status: OPEN).
     - Approved Emission Factors:
       - Bangladesh National Grid Electricity (2023) [0.640 kgCO2e/kWh, Scope 2 location, source: Dept of Environment BD / IEA].
       - Stationary Diesel Combustion [2.68 kgCO2e/liter, Scope 1 direct, source: IPCC 2006].
       - Natural Gas Boiler [2.02 kgCO2e/m3, Scope 1 direct, source: IPCC 2006].
     - Sample Activities:
       - Electricity Grid: 125,000 kWh (Status: APPROVED, pre-approved for calculation demonstration).
       - Diesel Generator: 4,500 L (Status: SUBMITTED, ready for second-person review demonstration).
     - Sample Metric Observations: Water consumption, female workforce %, board climate oversight.
  6. Mint signed JWTs (HS256) valid for 2 hours for both `sub` and `sub-reviewer`.
- **Response:**
  ```json
  {
    "token": "<jwt-token-for-owner>",
    "reviewer_token": "<jwt-token-for-reviewer>",
    "organization_id": "<uuid>",
    "organization_name": "Demo Enterprise [SAMPLE DATA]",
    "role": "org_owner",
    "reviewer_role": "auditor",
    "is_demo": true,
    "expires_at": "2026-10-25T17:15:00Z"
  }
  ```

### `POST /api/esg/demo/reset`
- **Authentication:** Bearer token (Requires `admin` permission on the tenant).
- **Access Guard:** Permitted only when `principal.is_demo is True`. Returns 403 Forbidden for non-demo organizations.
- **Workflow:** Deletes existing demo organization and cascading records, generates a clean re-seeded demo organization, and returns updated session credentials.

---

## 4. Segregation of Duties (Dual-Control) in Demo Mode

The GHG Protocol and enterprise ESG standards strictly mandate **separation of duties**: the submitter of an activity record cannot approve their own record (`rec.reviewed_by <> rec.created_by`).

In demo mode, rather than weakening or bypassing this check:
- The backend creates two subjects for the demo workspace: `sub` (Owner/Submitter) and `sub-reviewer` (Auditor/Reviewer).
- The UI provides a **Persona Switcher** (`Submitter Persona` vs `Simulate Reviewer Persona`).
- Submitting an activity or metric uses the primary token (`sub`).
- Approving the activity uses the reviewer token (`sub-reviewer`).
- The database check constraint `reviewed_by <> created_by` passes legitimately.
- The UI displays an explicit badge: `SIMULATED REVIEWER PERSONA — FOR DEMO TESTING ONLY`.

---

## 5. Threat Mitigations & Safety Boundaries

1. **Cross-Tenant Isolation:** Visitor A cannot view or mutate Visitor B's demo workspace. `ESGMembership` lookup inside `get_principal()` completely scopes all queries to `principal.organization_id`.
2. **Corpora Write Protection:** Demo principals are forbidden from uploading to global corpora (`global_regulatory`, `global_ef`).
3. **No Fake Accreditations:** All sample figures, factors, and calculations are stamped `DEMO / SAMPLE DATA / NOT ASSURED`.
4. **No LLM Data Leaks:** External Gemini/LLM extraction is disabled by default in demo mode.
5. **Session Expiry & Memory Footprint:** Demo tokens expire after 2 hours. Storage is transient and cleanable.
