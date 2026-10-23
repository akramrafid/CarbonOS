# CarbonOS Bangladesh — Security Remediation & Hardening Report

**Document Ref:** `docs/transformation/SECURITY-REMEDIATION.md`  
**Execution Phase:** Phase One (Critical Security Remediation)  
**Status:** `VERIFIED_IMPLEMENTED`  
**Latest Audit Commit:** `61e1263`  

---

## 1. Executive Summary

Phase One focused on eliminating critical security vulnerabilities, removing hardcoded secrets from client bundles, hardening server configurations against unsafe defaults, preventing cross-tenant information leakage, and enforcing cryptographic integrity.

All remediations have been verified with automated regression tests and local execution checks.

---

## 2. Remediated Vulnerabilities & Hardening

### 2.1 Hardcoded Secrets & IoT Device Tokens
- **Vulnerability:** Exposed Blynk IoT authentication tokens and default cloud tokens were hardcoded in frontend components (`src/pages/platform/MRVDashboard.jsx` and `src/components/technology/LiveMetrics.jsx`).
- **Remediation:** Excised all hardcoded tokens from frontend source code. Telemetry reads now query authenticated server proxies or local environment variables (`import.meta.env.VITE_BLYNK_AUTH_TOKEN`). If unconfigured, the system explicitly reports telemetry as offline rather than making unauthorized unauthenticated requests.
- **Commit Reference:** `a509358`

### 2.2 Django Production Security Configuration
- **Vulnerability:** `backend/farmers_ai_project/settings.py` permitted fallback default `SECRET_KEY`, wildcard `ALLOWED_HOSTS = ['*']`, disabled secure cookies, and unvalidated environment defaults in production.
- **Remediation:** 
  - Enforced mandatory `DJANGO_SECRET_KEY` validation: when `DEBUG=False` and secret key is unconfigured or set to the default insecure placeholder, Django immediately raises `RuntimeError` and terminates startup.
  - Restricted default `ALLOWED_HOSTS` to localhost and internal service domains unless explicitly provided via `DJANGO_ALLOWED_HOSTS`.
  - Configured conditional security flags when running over HTTPS (`SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`).
- **Commit Reference:** `a509358`

### 2.3 Cross-Tenant Isolation (Scenario B)
- **Vulnerability:** Vector similarity search and document retrieval lacked strict tenant separation, creating potential risk of Organization A retrieving sensitive utility statements or ESG reports belonging to Organization B.
- **Remediation:**
  - Implemented strict tenant authorization in `inference/esg_rag/retriever.py` via `_build_tenant_filter(tenant_id)`.
  - Cross-tenant queries are rejected at query-time; queries cannot access private tenant documents without matching authenticated `tenant_id`.
  - Public regulatory corpora (e.g. `doe_guidelines`, `emission_factors`) remain safely queryable without leaking private tenant data.
- **Test Evidence:** `tests/test_tenant_isolation.py` (4/4 test cases passing).
- **Commit Reference:** `4f7c1f8`

### 2.4 Port Inversion & Diagnosis Service Routing
- **Vulnerability:** Django `farmers_ai/views.py` attempted to proxy crop diagnosis requests to FastAPI on port 8001, conflicting with the canonical FastAPI port (8000).
- **Remediation:** Standardized internal inference forwarding to `http://localhost:8000/predict` with environment override support via `INFERENCE_SERVICE_URL`.
- **Commit Reference:** `a509358`

### 2.5 Untrained Checkpoint Execution Safeguard (Scenario E)
- **Vulnerability:** When the multi-head PyTorch model checkpoint was absent from disk, the system previously initialized random weights and executed inference, displaying ungrounded disease predictions to farmers.
- **Remediation:**
  - In `inference/main.py`: Checked for existence and valid state of `backend/multi_head_farmer_ai.pth`.
  - If absent and cloud inference is unavailable, `/predict` returns `status: "MODEL_UNAVAILABLE"`, `confidence: 0.0`, `needs_agronomist_review: True`, and a clear Bangla guidance notice.
  - In `backend/farmers_ai/views.py`: Handled `MODEL_UNAVAILABLE` cleanly without executing uninitialized models.
- **Test Evidence:** `backend/farmers_ai/tests.py` (`test_scenario_e_model_unavailable_safeguard`).
- **Commit Reference:** `61e1263`

### 2.6 Cryptographic Provenance & Tamper-Detection
- **Standard Enforced:** Ed25519 digital signatures and SHA-256 hash chaining on all monitoring records (`inference/carbon_monitoring/provenance.py`).
- **Verification Rule:** Any modification of a previously signed record invalidates signature verification. Private keys are securely managed server-side and are never serialized into client responses.
- **Test Evidence:** `tests/test_dmrv_provenance.py` (all tests passing).

---

## 3. Security Acceptance Gates Status

| Security Gate | Description | Status | Verification Method |
|---|---|---|---|
| **SG-01** | No exposed credentials in frontend bundles | `PASS` | Grep search for Blynk / API tokens in `src/` |
| **SG-02** | Django fail-safe in production | `PASS` | Unit verification of `settings.py` `RuntimeError` on missing key |
| **SG-03** | Cross-tenant document isolation | `PASS` | `tests/test_tenant_isolation.py` |
| **SG-04** | Untrained ML inference prevention | `PASS` | `backend/farmers_ai/tests.py` |
| **SG-05** | Ed25519 tamper-proof provenance | `PASS` | `tests/test_dmrv_provenance.py` |
| **SG-06** | Zero synthetic metric injection on uploads | `PASS` | `tests/test_esg_engine.py` |

---

## 4. Next Security Milestones (Phase 11 Production Hardening)
1. Add rate limiting middleware to FastAPI `/predict` and `/esg/*` endpoints using Redis token bucket.
2. Implement automated Dependabot / `pip-audit` vulnerability scanning in GitHub Actions CI.
3. Configure non-root container user in Docker runtime specs.
