# CarbonOS ESG SaaS — Claude Implementation Addendum
## Direct-Access Dashboard Now, Production Authentication Later

**Repository:** https://github.com/akramrafid/CarbonOS  
**Working branch:** `esg/p0-security-baseline`  
**Preserve existing commits:** `9bf1581` (API auth + server-side organization isolation) and `5aa7626` (elimination of invented ESG results).  
**Scope:** ESG SaaS only. Do not modify the marketplace, registry, farmers AI, or satellite MRV except where a narrowly scoped shared security fix is unavoidable.

## Product decision

The owner has decided **not to implement a user-facing sign-in or Supabase/Auth0/Keycloak integration in this release**. Users should be able to open the ESG dashboard immediately without a login, signup, or password prompt. Enterprise sign-in and persistent accounts are deferred.

**Do not interpret this as permission to disable authorization or remove security fixes.** Anonymous direct access may be appropriate for a controlled, non-production demonstration, not for production processing of customer-confidential ESG data.

### Desired modes

Design a small, explicit access-mode system with secure defaults:

1. **`protected` (default for production):** All current authenticated ESG endpoints remain protected. No permissive fallback. Production deployment must fail clearly or present a locked state when identity configuration is absent. Do not silently turn on public demo access.
2. **`demo` (explicit opt-in):** Dashboard opens directly, no sign-in UI. Backend issues a short-lived, restricted, server-generated *anonymous demo session* and creates a dedicated **demo-only organization** for that session. ESG APIs continue requiring the existing signed token, and tenant is resolved from backend membership records. Never accept the organization or role from the client. Demo data and outputs must visibly carry a `DEMO / NOT VERIFIED / NOT FOR REPORTING` label. Implement resource limits, session expiration, cleanup, and audit logging.
3. **`local_dev` (optional):** Convenient local testing without interactive login, but only if bound and verified to loopback and never accessible on public interfaces. Prefer the same ephemeral signed demo-session mechanism instead of skipping auth. Explicitly refuse startup or direct access when the deployment is public or incorrectly configured.

Choose final configuration names to match the repository style, document them, and validate values at startup. Never key security decisions solely on a browser-supplied mode flag, Host header, Origin, or `VERCEL_ENV`.

## Absolute safety requirements

- **Preserve commit `9bf1581`:** signed token verification, server-side membership lookup, authorization roles, cross-tenant isolation, and the protected document stores.
- **Preserve commit `5aa7626`:** no invented utility values, fake audit sealing, fabricated assurance, artificial RAG citations, or netting solar exports against Scope 2.
- A public demo must never query, expose, write, or impersonate a real organization's ESG data.
- Never return platform-operator tokens or unrestricted membership creation privileges to anonymous users.
- Never embed server JWT signing secrets, Gemini API keys, Copernicus or Earthdata credentials, payment keys, or service-role secrets in browser bundles.
- Demo users cannot access shared regulatory/factor write endpoints, administrator functions, or any marketplace/registry/MRV action.
- A public demo must not present estimates, samples, or mock reports as official, certified, verified or audited.
- Do not use hardcoded `default_tenant` as shared tenant identity for all visitors.
- Do not turn authentication off via a global route-bypass middleware or `ALLOW_ALL` permission policy.
- If any real customer pilot is intended before formal user accounts, require separate owner-approved access controls, such as an authenticated ingress/private VPN, and keep it explicitly out of publicly anonymous demo mode.

## Phase A — Audit what is already implemented

1. Read `docs/esg/` (all Phase 0 audit documents and `PROGRESS.md`).
2. Inspect authentication middleware, JWT validation, membership schema, organization creation, every `/api/esg` route, client API callers, and frontend dashboard routing.
3. Confirm the project status against commits `9bf1581` and `5aa7626` rather than trusting this summary.
4. Record current branch, dirty worktree, latest commit, and running test baseline.
5. Identify features that would be unsafe if made anonymous and classify them as `DEMO_ALLOWED`, `DEMO_READ_ONLY`, `PROTECTED_ONLY`, or `DISABLED`.
6. Write a brief plan to `docs/esg/NO-LOGIN-DEMO-IMPLEMENTATION.md` before editing.

## Phase B — Implement zero-friction anonymous demo sessions

### 1. Bootstrap endpoint

Create one carefully scoped unauthenticated endpoint, for example `POST /api/esg/demo/session`, if necessary:

- Allow only when the server is explicitly in demo mode.
- Rate-limit creation by IP and reasonable abuse signals; cap session and workspace creation.
- Generate a random, unguessable identifier and a short-lived restricted identity, never a platform-admin identity.
- Create a separate demo-only organization and a minimal matching membership on the server, with the least permissions necessary for permitted demo tasks.
- Mint a signed session token using existing verified infrastructure or create a secure opaque session stored server-side. Do not invent homegrown cryptographic primitives.
- Prefer `HttpOnly`, `Secure` cookies and a suitable `SameSite` policy where deployment architecture supports them, with CSRF defenses for state-changing requests. If using bearer tokens, document XSS exposure tradeoffs and never put tokens in URLs.
- Never take `tenant_id`, `organization_id`, roles, permissions, or privileged claims directly from client input.
- Expire sessions promptly and implement scheduled cleanup of demo organizations, uploaded files, and related records.
- Create consistent handling for expired session, retries, refresh, and reset.

### 2. Frontend bootstrap

- Opening the ESG dashboard in demo mode must *not* show a login page.
- Automatically initialize or restore a limited demo session and fetch only the session's scoped demo organization.
- Show a small, unmistakable **Demo workspace** status in the product shell and reports.
- When session bootstrap is unavailable, display an actionable error, not fabricated account data.
- Provide a `Reset demo workspace` action requiring confirmation and invoking safe cleanup.
- Do not silently put arbitrary production records into the demo.
- Ensure all backend calls use centralized API clients that attach the appropriate session proof and handle `401`, `403`, `429`, and `503` explicitly.

### 3. Demo datasets

- Seed only clearly labeled synthetic ESG organizations, example utility documents, and demonstration facility/activity records.
- If actual calculations are performed on synthetic data, distinguish **genuine calculated results using synthetic inputs** from actual measured customer emissions.
- Do not display fabricated operational success, official third-party verification or customer logos/relationships.
- All report outputs must visibly identify demo context and prevent confusion with an audited report.

### 4. Anonymous uploads

For an initial public release, safest default is **disabled uploads** or sandbox-only sample documents. If the owner explicitly enables temporary anonymous uploads:

- Reject sensitive/personal documents in product copy, subject to informed limitations.
- Keep strict file type and size limits, scanning/validation, storage isolation and quotas.
- Encrypt where appropriate, delete on TTL, do not log document contents, and prevent cross-session reads.
- External AI forwarding must be disabled by default and must never automatically forward visitor documents to Gemini without explicit informed user action and appropriate disclosure.
- Limit expensive model calls and impose aggregate spend caps.
- Do not let anonymous visitors add data to shared factor libraries or regulatory document corpora.

## Phase C — Repair CI without unrelated refactors

1. Inspect `.github/workflows/frontend-quality.yml`, `package.json`, and test structure.
2. Replace non-existent `npm run lint`, `npm test`, or `tests/e2e` calls with genuine, maintained scripts and checks; add necessary configuration where justified.
3. Pin supported Node versions and ensure compatibility with actual Vite/toolchain versions.
4. Add a secure demo bootstrap and dashboard smoke test, including session expiration and invalid token behavior.
5. Preserve the existing 28 ESG and 34 orchestrator passing tests; extend them instead of replacing them.
6. Run build, lint, tests, contract tests, and any headless browser checks available.
7. Never claim Playwright or other checks passed unless they actually executed.

## Phase D — Remove remaining fabricated ESG overview values

Identify and remove or isolate all overview values such as:

- `2,450 tCO2e`
- `9.3 AI score`
- `Audited against ISO 14064-1`
- Uncited factors, including any unsupported `0.120` market-based electricity factor.

The current phase must not simply relabel misleading numbers. Replace the UI with real empty states or a clearly marked synthetic demo dataset. If relevant calculations are not yet built, show `Not calculated` and a path to add approved activity data. Official verification must never be asserted without documented verification.

## Phase E — Start P1 accounting foundations

Once direct demo access and CI are verified, implement a **production-quality accounting domain layer** independent of the authentication provider:

- PostgreSQL models and migrations for organizations, facilities, reporting periods, activity records, activity revisions, emission factors, factor versions, calculation runs, data-quality states, reviews, and evidence provenance.
- Exact-decimal arithmetic and explicit units/conversion logic, with typed and validated inputs.
- Ledger-style, append-only or revisioned activity evidence; no silent mutation of approved reports.
- Separate calculation library with deterministic unit tests, independent of React and HTTP handlers.
- Scope 1 and Scope 2 foundational calculations aligned with GHG Protocol; add Scope 3 architecture incrementally.
- Location-based vs market-based Scope 2 treated separately; do not net electricity exports as negative inventory emissions without a defensible and applicable method.
- Factor provenance including source, authority, publication version, jurisdiction, units, effective dates, calculation method and approval state.
- Unverified factors remain disallowed for production assured calculations; allow explicit flagged assumptions in demo.
- Seed synthetic data in demo organizations only.
- Full source-to-result traceability for every computed tCO2e value.
- Build the first end-to-end journey: document/manual entry → review → approved activity → factor selection → calculation → report preview.

Do not wait for a real identity provider to develop a well-structured accounting domain. The backend should rely on a provider-independent **request principal** and server-side organization membership, so production auth can be added later without rewriting carbon-accounting business logic.

## Future authentication upgrade contract

Design the system so that a future identity provider (Supabase Auth, Auth0, Keycloak, etc.) can replace only the session and identity layer:

- Keep domain models independent of provider-specific user IDs.
- Define a backend principal abstraction (`subject`, `membership`, `organization`, `roles`, `session_type`).
- Real organizations remain inaccessible to anonymous demo principals.
- Never promote an anonymous demo workspace to a real organization without explicit authenticated ownership verification, consent, and a safely audited migration.
- Document migration of session state and organization ownership as a future feature; do not build it now.

## Required regression tests

1. No user-facing login prompt appears in explicit demo mode.
2. Two anonymous sessions cannot read or modify each other's data.
3. Anonymous user cannot impersonate another tenant via `tenant_id` or headers.
4. Demo principal cannot access platform-operator regulatory/factor writes.
5. Demo session expiry revokes access.
6. Abuse of bootstrap endpoints is rate-limited.
7. Demo reports carry unmissable synthetic/demo labels.
8. Production/protected mode is still fail-closed without auth configuration.
9. Gemini failure displays failure, never invented citations.
10. Invalid invoice extraction cannot introduce fabricated usage numbers.
11. Missing factor provenance is surfaced instead of hidden.
12. Background or scheduled deletion of expired demo data is verified.
13. Frontend builds and CI runs available checks successfully.
14. Existing 28 ESG and 34 orchestrator tests continue passing.

## Commit and handoff rules

- Keep work on `esg/p0-security-baseline` unless the owner already established another safe branch.
- Do not overwrite uncommitted edits.
- Commit verified incremental changes with descriptive messages.
- Do not push unless explicitly authorized.
- Do not touch marketplace, registry, farmers AI, or satellite MRV.
- Keep `docs/esg/PROGRESS.md` updated with commands, outputs, commit SHAs and unresolved issues.
- Do not fabricate evidence of testing or production readiness.
- Do not ask for Supabase credentials or install Supabase as part of this phase.

## Immediate execution

1. Confirm working tree and prior two P0 commits.
2. Review Phase 0 audit documents.
3. Plan and implement no-login **isolated demo sessions**, without removing backend authorization.
4. Fix frontend ESG API access through legitimate demo-session credentials.
5. Fix CI and dashboard fake KPIs.
6. Verify with tests and browser checks.
7. Begin versioned-factor/accounting-ledger P1 implementation.
8. Commit each verified slice, report exact results, and continue safely.

**Final rule:** No login screen is a product decision. No tenant authorization, no data integrity, or no security is not an acceptable consequence. CarbonOS should remain a demo until it has full controls suitable for real customer information and a real independent production security review.
