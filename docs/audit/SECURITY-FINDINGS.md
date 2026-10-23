# CarbonOS Bangladesh — Security Findings & Vulnerability Assessment (Phase Zero)

**Document Ref:** `docs/audit/SECURITY-FINDINGS.md`  
**Audit Date:** 2026-10-24  
**Security Lead:** Application Security & Privacy Architect  
**Baseline Commit:** `141e7b52125f4625b293c6628fc0ff2dbcf3c8df`  

---

## 1. Executive Summary

A comprehensive security scan of CarbonOS Bangladesh was conducted across source code, settings, dependencies, authentication layers, and network data flows.

| Severity | Count | Primary Areas |
|---|---|---|
| **CRITICAL (P0)** | 2 | Hardcoded IoT auth token in client bundle; Insecure production defaults in Django settings |
| **HIGH (P1)** | 2 | Unauthenticated REST API endpoints (DRF AllowAny); Service port inversion exposing internal routing |
| **MEDIUM (P2)** | 2 | Wildcard-capable CORS policy; Client-side fallback displaying synthetic data as "verified sensor cache" |
| **LOW (P3)** | 2 | Missing security response headers (HSTS, CSP, X-Frame-Options); SQLite concurrent lock contention risk |

---

## 2. Detailed Vulnerability Findings

### Finding SEC-01: Hardcoded Blynk IoT Auth Token in Frontend Bundle
- **Severity:** **CRITICAL (P0)**
- **CWE:** CWE-798: Use of Hard-coded Credentials
- **File Locations:**
  1. `src/pages/platform/MRVDashboard.jsx:148`
     ```javascript
     const BLYNK_TOKEN = "wwKSjCxjjeox9NoiH1hkiet359mok4Wf";
     ```
  2. `src/components/LiveMetrics.jsx:69`
     ```javascript
     const BLYNK_TOKEN = "wwKSjCxjjeox9NoiH1hkiet359mok4Wf";
     ```
- **Historical Git Evidence:** Committed in `fb9073f` and `e596ea8`.
- **Attack Vector:** Any user visiting the public website can inspect the JavaScript source code, extract the active Blynk authentication token, and issue unauthorized commands directly to the hardware device via `https://blynk.cloud/external/api/update?token=...`, or spoof ambient CO₂ / temperature / air quality telemetry.
- **Remediation Plan:**
  1. Remove all hardcoded instances of the token from client-side JSX.
  2. Transition telemetry polling to an authenticated backend proxy route in Django (`/api/farmers-ai/mrv/telemetry/live/`) or server-side worker that reads `BLYNK_AUTH_TOKEN` from secure server environment variables.
  3. Support frontend environment variable `VITE_BLYNK_AUTH_TOKEN` strictly for isolated development sandbox testing.
  4. **SECRET ROTATION ADVISORY FOR REPO OWNER:**
     > **IMPORTANT NOTICE:** The credential `"wwKSjCxjjeox9NoiH1hkiet359mok4Wf"` has been committed to the public Git repository history. Removing it from source code files does NOT revoke the credential on the Blynk Cloud platform. The project owner must immediately log into the Blynk Cloud Console (`https://blynk.cloud`), navigate to Device Settings, and click **"Reset Device Auth Token"** to revoke the compromised token.

---

### Finding SEC-02: Insecure Production Defaults in Django Settings
- **Severity:** **CRITICAL (P0)**
- **CWE:** CWE-1188: Insecure Default Initialization of Resource
- **File Location:** `backend/farmers_ai_project/settings.py`
  - **Line 25 (Hardcoded Fallback Secret Key):**
    ```python
    SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-&!^evp!(vub%e4=yh$@go=+yt(yk6i_740922c)#l1_ivz89n!')
    ```
    *Flaw:* If `DJANGO_SECRET_KEY` is not set in production, Django silently boots with a widely publicized, insecure secret key, rendering session cookies and CSRF tokens trivially forgeable.
  - **Line 28 (Insecure DEBUG Default):**
    ```python
    DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('true', '1')
    ```
    *Flaw:* Defaults to `DEBUG = True` if the environment variable is omitted, leaking stack traces, environment variables, and SQL queries to public users upon 500 errors.
  - **Line 30 (Wildcard ALLOWED_HOSTS):**
    ```python
    ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,*').split(',')
    ```
    *Flaw:* Including `*` in the default allows DNS rebinding and Host Header poisoning attacks.
  - **Lines 54-63 (Missing Security Cookie & Header Flags):**
    Lacks `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_BROWSER_XSS_FILTER`, `SECURE_CONTENT_TYPE_NOSNIFF`, and `X_FRAME_OPTIONS`.
- **Remediation Plan:**
  1. If `DEBUG` is `False` and `DJANGO_SECRET_KEY` is unset or equals the insecure default, raise `django.core.exceptions.ImproperlyConfigured` immediately.
  2. Default `DEBUG` to `False` unless explicitly set to `'True'` or `'1'` in local development.
  3. Strip `*` from default `ALLOWED_HOSTS`; require explicit domain declaration in production.
  4. Add standard production security headers (`SESSION_COOKIE_SECURE = not DEBUG`, `CSRF_COOKIE_SECURE = not DEBUG`, `X_FRAME_OPTIONS = 'DENY'`).

---

### Finding SEC-03: Missing Global DRF Authentication & Permission Policies
- **Severity:** **HIGH (P1)**
- **CWE:** CWE-306: Missing Authentication for Critical Function
- **File Location:** `backend/farmers_ai_project/settings.py`
- **Flaw:** `REST_FRAMEWORK` dictionary is omitted entirely. Django REST Framework defaults to:
  ```python
  'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny']
  ```
  Any view without an explicit `@permission_classes` decorator is publicly accessible without authentication.
- **Remediation Plan:**
  Configure explicit REST Framework defaults in `settings.py`:
  ```python
  REST_FRAMEWORK = {
      'DEFAULT_PERMISSION_CLASSES': [
          'rest_framework.permissions.IsAuthenticatedOrReadOnly',
      ],
      'DEFAULT_AUTHENTICATION_CLASSES': [
          'rest_framework.authentication.SessionAuthentication',
          'rest_framework.authentication.BasicAuthentication',
      ],
      'DEFAULT_THROTTLE_CLASSES': [
          'rest_framework.throttling.AnonRateThrottle',
          'rest_framework.throttling.UserRateThrottle'
      ],
      'DEFAULT_THROTTLE_RATES': {
          'anon': '100/day',
          'user': '1000/day'
      }
  }
  ```

---

### Finding SEC-04: Multi-Tenant Vector Segregation Enforcement (Domain Invariant)
- **Severity:** **HIGH (P1)**
- **CWE:** CWE-639: Authorization Bypass Through User-Controlled Key
- **File Location:** `inference/esg_rag/router.py`
- **Flaw:** Multi-tenant queries must strictly enforce ChromaDB collection filtering by `tenant_id`. Without strict parameter validation, queries that omit `tenant_id` could retrieve private ESG audit reports from competitor organizations.
- **Remediation Plan:**
  Ensure every query endpoint in `inference/esg_rag/router.py` mandates non-empty `tenant_id` and adds `where={"tenant_id": current_tenant}` before querying ChromaDB.

---

### Finding SEC-05: Deceptive Fallback Notice in Client Telemetry
- **Severity:** **MEDIUM (P2)**
- **CWE:** CWE-345: Insufficient Verification of Data Authenticity
- **File Location:** `src/components/LiveMetrics.jsx:128`
  ```javascript
  setError("Direct Blynk gateway ping returned timeout. Displaying verified local sensor cache.");
  ```
- **Flaw:** When the Blynk gateway times out, the code sets hardcoded mock values (`temp: 29.2, hum: 68.5, air: 114, co2: 424`) while telling the user it is displaying a "verified local sensor cache".
- **Remediation Plan:**
  Explicitly mark fallback values with `isSimulated: true` and display "Telemetry Gateway Offline — Showing Reference Baseline (Simulated)".
