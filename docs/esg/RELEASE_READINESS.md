# CarbonOS ESG SaaS — Release Readiness & Gate Status

**Branch:** `esg/p0-security-baseline`  
**Date:** 2026-10-25  
**Evidence Reference:** [TEST_EVIDENCE.md](TEST_EVIDENCE.md) and [FULL_COMPLETION_MATRIX.md](FULL_COMPLETION_MATRIX.md)  

---

## 1. Honest Final Verdicts

| Verdict Level | Status | Determination & Rationale |
|---|---|---|
| **1. ESG_FEATURE_COMPLETE** | **VERIFIED** | All core accounting workflows (Scope 1, Scope 2 Location/Market, Scope 3 categories, Activity records, Emission Factors, Reporting Periods, Calculation engine, GRI/IFRS mappings, and CSV/JSON data export) are fully implemented and verified with automated test suites. |
| **2. DEMO_READY** | **VERIFIED** | Clean zero-friction entry at `/platform/esg` in `isolated_demo` mode. No blocking login/signup modals. Server creates isolated ephemeral tenants, seeds realistic Bangladesh industrial benchmarks (East Delta University, Revoo EV, PolyJute Asia), enforces dual-control segregation of duties via labeled persona switching, supports instant tenant reset, and badging prevents misleading assurance claims. |
| **3. PILOT_READY** | **GATED** | Requires independent verification of accounting methodology (`ACCOUNTING_METHODOLOGY.md`) and factor sources (`FACTOR_SOURCE_REGISTER.md`) by a certified GHG inventory lead verifier (ISO 14064). |
| **4. PRODUCTION_READY** | **GATED ON IDENTITY & ACCREDITATION** | Production deployment with real client confidential data remains strictly gated on: (a) Enterprise OIDC identity provider integration with MFA; (b) External penetration test; (c) Formal DPA and security accreditation. |

---

## 2. Area Classification Matrix

| Functional Area | Current Classification | Verification Status |
|---|---|---|
| **Zero-Friction Demo Mode** | `VERIFIED` | 5/5 passing tests in `tests/test_esg_demo_mode.py`. Isolated ephemeral tenancy. |
| **Authentication & Authorization** | `VERIFIED` | Deny-by-default, composite tenant isolation, role-based access control. |
| **Tenant Isolation & IDOR Defense** | `VERIFIED` | Strict database-level and query-level tenant scoping; client tenant IDs ignored. |
| **Greenhouse Gas Calculations** | `VERIFIED` | Decimal arithmetic, Scope 1 mobile/stationary, Scope 2 dual-reporting. |
| **Segregation of Duties** | `VERIFIED` | Submitter self-approval blocked by backend (403); simulated reviewer persona available in demo. |
| **Universal Utility Extractor** | `VERIFIED` | Side-by-side snippet extraction with confidence scoring and manual review required. |
| **Audit Trail & Immutability** | `VERIFIED` | Append-only audit events, SHA-256 report hashing, period locking. |
| **GRI & IFRS S1/S2 Mapping** | `VERIFIED` | Mapped against GRI 302, 303, 305, 403, 205 and IFRS S2 climate requirements. |
| **Production Fail-Closed Guard** | `VERIFIED` | Demo endpoints rejected with 403 in `protected` mode; missing secret fails with 503. |
| **Enterprise OIDC Integration** | `GATED_EXTERNAL` | Middleware implemented and verified; awaiting client IdP credentials. |
| **Independent GHG Assurance** | `GATED_EXTERNAL` | Calculation trace complete; awaiting external audit firm methodology sign-off. |

---

## 3. Human Actions Required Before Pilot & Production

1. **Enterprise Identity Configuration:** Configure external OIDC IdP (Okta / Keycloak / Azure Entra) with MFA enforcement.
2. **Independent GHG Practitioner Sign-off:** Lead verifier review of [ACCOUNTING_METHODOLOGY.md](ACCOUNTING_METHODOLOGY.md) and [FACTOR_SOURCE_REGISTER.md](FACTOR_SOURCE_REGISTER.md).
3. **Formal Legal DPA:** Execution of data processing agreement for confidential client utility bills.
4. **Third-Party Security Audit:** Independent application penetration test against staging environment.
