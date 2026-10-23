# CarbonOS Bangladesh — API Contract Integrity Matrix (Phase Zero)

**Document Ref:** `docs/audit/API-CONTRACT-MATRIX.md`  
**Audit Date:** 2026-10-24  
**Auditor:** Principal Integration Engineer  

---

## 1. Overview & Verification Methodology

Every frontend API call in `src/` was mapped against the registered URL patterns in FastAPI (`inference/main.py`, `inference/*/router.py`) and Django (`backend/farmers_ai_project/urls.py`, `backend/farmers_ai/urls.py`, `backend/national_registry_bridge/urls.py`).

Each route was verified for:
1. HTTP Method (GET, POST, PUT, DELETE)
2. URL Prefix and Trailing Slashes
3. Service Host & Port Assignment
4. Request Parameters and Payload Schema
5. Contract Status (`MATCH`, `PREFIX_MISMATCH`, `PORT_MISMATCH`, `UNREGISTERED`)

---

## 2. Frontend-to-Backend Contract Matrix

| Frontend File & Line | Called URL (Frontend) | Intended Service | Registered Backend Route | Method | Contract Status | Impact & Required Fix |
|---|---|---|---|---|---|---|
| `CameraCapture.jsx:188` | `${djangoApiUrl}/api/diagnose` | Django (:8001) | `/api/farmers-ai/api/diagnose/` | POST | **PREFIX_MISMATCH & PORT_MISMATCH** | Frontend defaults to port 8000 and misses `/farmers-ai/` prefix and trailing slash; calls 404. Fix: Mount clean alias in Django and fix frontend URL default. |
| `farmers_ai/views.py:12` | `http://127.0.0.1:8001/predict` | FastAPI (:8000) | `http://127.0.0.1:8000/predict` | POST | **PORT_MISMATCH** | Django forwards leaf image to port 8001 (itself!) instead of FastAPI (8000). Fix: Set `FASTAPI_URL = os.getenv("FASTAPI_URL", "http://127.0.0.1:8000/predict")`. |
| `MRVDashboard.jsx:173` | `${DJANGO_API_URL}/api/farmers-ai/api/mrv/carbon-health-trends/` | Django (:8001) | `/api/farmers-ai/api/mrv/carbon-health-trends/` | GET | **PORT_MISMATCH** | Route matches due to double `api/` in `farmers_ai/urls.py`, but `DJANGO_API_URL` defaults to 8000 instead of 8001. Fix: Clean route to `/api/farmers-ai/mrv/carbon-health-trends/` and fix default port. |
| `MRVDashboard.jsx:190` | `${DJANGO_API_URL}/api/farmers-ai/api/mrv/telemetry/history/` | Django (:8001) | `/api/farmers-ai/api/mrv/telemetry/history/` | GET | **PORT_MISMATCH** | Matches registered route, but defaults to port 8000. Fix: Clean route to `/api/farmers-ai/mrv/telemetry/history/` and fix default port. |
| `MRVDashboard.jsx:235` | `${DJANGO_API_URL}/api/farmers-ai/api/mrv/telemetry/save/` | Django (:8001) | `/api/farmers-ai/api/mrv/telemetry/save/` | POST | **PORT_MISMATCH** | Matches registered route, but defaults to port 8000. Fix: Clean route to `/api/farmers-ai/mrv/telemetry/save/` and fix default port. |
| `CarbonRegistry.jsx:296` | `${DJANGO_API_URL}/api/registry-bridge/projects/` | Django (:8001) | `/api/registry-bridge/projects/` | GET | **PORT_MISMATCH** | Registered via DRF DefaultRouter; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `CarbonRegistry.jsx:297` | `${DJANGO_API_URL}/api/registry-bridge/rules/` | Django (:8001) | `/api/registry-bridge/rules/` | GET | **PORT_MISMATCH** | Registered via DRF DefaultRouter; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `CarbonRegistry.jsx:298` | `${DJANGO_API_URL}/api/registry-bridge/submissions/` | Django (:8001) | `/api/registry-bridge/submissions/` | GET | **PORT_MISMATCH** | Registered via DRF DefaultRouter; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `CarbonRegistry.jsx:299` | `${DJANGO_API_URL}/api/registry-bridge/adjustments/` | Django (:8001) | `/api/registry-bridge/adjustments/` | GET | **PORT_MISMATCH** | Registered via DRF DefaultRouter; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `CarbonRegistry.jsx:377` | `${DJANGO_API_URL}/api/registry-bridge/projects/{id}/submit-monitoring-report/` | Django (:8001) | `/api/registry-bridge/projects/{id}/submit-monitoring-report/` | POST | **PORT_MISMATCH** | Detail route on `RegistryProjectViewSet`; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `CarbonRegistry.jsx:472` | `${DJANGO_API_URL}/api/registry-bridge/adjustments/{id}/confirm/` | Django (:8001) | `/api/registry-bridge/adjustments/{id}/confirm/` | POST | **PORT_MISMATCH** | Detail route on `CorrespondingAdjustmentViewSet`; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `CarbonRegistry.jsx:524` | `${DJANGO_API_URL}/api/registry-bridge/projects/{id}/jcm-export/` | Django (:8001) | `/api/registry-bridge/projects/{id}/jcm-export/` | GET | **PORT_MISMATCH** | Detail route on `RegistryProjectViewSet`; clean path, but defaults to port 8000. Fix: Align frontend default port to 8001. |
| `ESGReporting.jsx:165` | `http://localhost:8000/api/esg/query` | FastAPI (:8000) | `/api/esg/query` | POST | **MATCH** | Route correctly hits FastAPI port 8000. Requires strict `tenant_id` validation. |
| `CarbonMonitoring.jsx:215`| `http://localhost:8000/api/carbon/estimate` | FastAPI (:8000) | `/api/carbon/estimate` | POST | **MATCH** | Route correctly hits FastAPI port 8000. Produces prediction intervals [P10, P50, P90]. |

---

## 3. Standardized Port & Routing Convention

To permanently resolve contract and port discrepancies across all environments:

### Service Port Allocation
- **Client Frontend:** `http://localhost:5173`
- **FastAPI Core (Inference, GIS, RAG, Provenance):** `http://localhost:8000`
- **Django Core (Auth, Accounts, Farmers AI, Registry Bridge):** `http://localhost:8001`

### Centralized Frontend Environment (`.env.example` / `src/services/apiConfig.ts`)
```javascript
export const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:8000';
export const DJANGO_BASE_URL = import.meta.env.VITE_DJANGO_BASE_URL || 'http://localhost:8001';
```

### Clean Route Restructuring in Django
1. Update `backend/farmers_ai/urls.py` to remove redundant `api/` prefixes from individual path definitions (`path('diagnose/', views.diagnose)`).
2. In `backend/farmers_ai_project/urls.py`, support both:
   - Primary: `path('api/farmers-ai/', include('farmers_ai.urls'))`
   - Compatibility alias: `path('api/diagnose/', views.diagnose)` to guarantee direct calls from older clients resolve smoothly.
3. Update `backend/farmers_ai/views.py`:
   ```python
   FASTAPI_URL = os.getenv("FASTAPI_URL", "http://127.0.0.1:8000/predict")
   ```
