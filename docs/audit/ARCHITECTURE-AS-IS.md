# CarbonOS Bangladesh — Architecture As-Is Analysis (Phase Zero)

**Document Ref:** `docs/audit/ARCHITECTURE-AS-IS.md`  
**Evaluation Date:** 2026-10-24  
**Architect:** Principal Systems Architect  

---

## 1. System Context & Component Topology

CarbonOS currently operates across three primary software tiers with independent deployment artifacts:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT TIER                                        │
│  React 19 + Vite Frontend SPA (Port: 5173 / Production: Vercel)                   │
│  - Dual-Theme Design Engine (Obsidian Dark #040906 / Mint Light #E6F5E2)          │
│  - Leaflet GIS Polygon Boundary Mapping                                           │
│  - Client-Side ONNX Runtime Web (Edge Inference for Smallholder Offline Scans)    │
└──────────────┬─────────────────────────────────────────────────────┬──────────────┘
               │                                                     │
               ▼ HTTP / REST (8000)                                  ▼ HTTP / REST (8001)
┌──────────────────────────────────────┐            ┌────────────────────────────────────────┐
│         FASTAPI INFERENCE            │            │        DJANGO REST BACKEND             │
│  Port: 8000                          │            │  Port: 8001 (Daphne / Channels ASGI)   │
│  - Carbon Monitoring & GIS Router    │            │  - Farmers AI Diagnostic Persistence   │
│  - Random Forest Quantile Regressor  │            │  - National Registry Bridge Client     │
│  - Sentinel-2 Satellite Pipeline     │            │  - IoT Sensor Telemetry Persistence    │
│  - ChromaDB Multi-Tenant ESG RAG     │            │  - Weather Risk & Fungal Spore Engine  │
│  - Ed25519 Cryptographic Provenance  │            │  - Agronomist Human Review Ledger      │
│  Storage: carbon_monitoring.db,      │            │  Storage: db.sqlite3 (Django ORM)      │
│           esg_rag.db, Chroma vector  │            └───────────────────┬────────────────────┘
└──────────────────▲───────────────────┘                                │
                   │                                                    │
                   └──────────────── HTTP Forwarding (/predict) ───────┘
```

---

## 2. Service Port Topology & Discrepancies

### The Documented Convention
- **React Frontend**: `http://localhost:5173`
- **FastAPI Inference Microservice**: `http://localhost:8000`
- **Django REST Framework Service**: `http://localhost:8001`

### Observed Architectural Discrepancies
1. **Django Internal Forwarding Inversion (`backend/farmers_ai/views.py:12`):**
   ```python
   FASTAPI_URL = "http://127.0.0.1:8001/predict"  # CRITICAL BUG: Points to Django's own port (8001) rather than FastAPI (8000)!
   ```
   *Impact:* When a farmer uploads an image for cloud disease diagnosis via Django, Django attempts to forward the image to `127.0.0.1:8001/predict` (which is its own port), failing with connection error or 404, preventing cloud ML inference from running.

2. **Frontend Default Environment Port Mismatch (`CameraCapture.jsx:187`, `MRVDashboard.jsx:15`, `CarbonRegistry.jsx:39`):**
   ```javascript
   const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8000';
   ```
   *Impact:* In standard local development without an explicit `.env` overriding `VITE_DJANGO_API_URL`, the frontend defaults Django requests to port `8000` (which is FastAPI), causing Django endpoint calls to hit FastAPI and fail with 404 Not Found.

3. **URL Prefix Doubling (`farmers_ai_project/urls.py` + `farmers_ai/urls.py`):**
   - Root URLconf mounts app at: `path('api/farmers-ai/', include('farmers_ai.urls'))`
   - Child URLconf registers routes with: `path('api/diagnose/', views.diagnose)`
   - *Resulting Registered Route:* `/api/farmers-ai/api/diagnose/`
   - *Frontend Calling Route (`CameraCapture.jsx:188`):* `${djangoApiUrl}/api/diagnose` (missing both `/farmers-ai/` and trailing slash).

---

## 3. End-to-End Data Flows

### A. Farmers AI Cloud Diagnostic Flow
1. User captures leaf photo in `CameraCapture.jsx` on mobile/desktop.
2. If edge ONNX model is available and confidence > 0.80, result renders instantly.
3. If edge confidence < 0.80 or edge model is unavailable, frontend posts multipart form to Django: `POST /api/farmers-ai/diagnose/`.
4. Django receives upload in `farmers_ai/views.py:diagnose`.
5. Django forwards raw bytes to FastAPI: `POST http://127.0.0.1:8000/predict`.
6. FastAPI preprocesses image, applies PyTorch `MultiHeadFarmerAIModel` (EfficientNet-B3 backbone), generates Grad-CAM heatmap, and returns JSON payload.
7. Django persists `Diagnosis` record in `db.sqlite3`, assesses weather risk, and returns diagnosis ID + Bangla treatment guidance.

### B. IoT Sensor & MRV Telemetry Flow
1. ESP32 / DHT22 hardware publishes temperature, humidity, air quality, and ambient CO₂ to Blynk Cloud.
2. In the current implementation, the React frontend (`LiveMetrics.jsx` and `MRVDashboard.jsx`) directly polls `https://blynk.cloud/external/api/` using a hardcoded token.
3. When telemetry arrives, the frontend posts readings to Django (`POST /api/farmers-ai/api/mrv/telemetry/save/`).
4. *Architecture Flaw:* Direct client polling exposes the Blynk auth token to every website visitor, creating a security risk.

### C. Satellite Remote Sensing & dMRV Pipeline
1. User defines geographic bounding box in `CarbonMonitoring.jsx`.
2. Request hits FastAPI `POST /api/carbon/estimate`.
3. `fusion_model.py` checks for Sentinel-2 MSI L2A imagery.
4. If imagery API is offline, pipeline produces synthetic spectral bands with Random Forest quantile regression [P10, P50, P90].
5. Results are recorded in `EstimateProvenance` with parent hash and Ed25519 digital signature.
6. Record is persisted in `carbon_monitoring.db`.

### D. National Registry Bridge Submission Flow
1. User reviews verified carbon results in `CarbonRegistry.jsx`.
2. Frontend requests project submission: `POST /api/registry-bridge/projects/{id}/submit-monitoring-report/`.
3. Django's `NationalRegistryClient` compiles payload, checks provenance hash length (> 16 chars), and submits to endpoint.
4. If `sandbox_mode` is active, client generates mock `SUB-BD-...` submission receipt.

---

## 4. Architectural Weaknesses & Target Refactoring

| Component | Current Weakness | Architectural Target |
|---|---|---|
| **API Routing** | Redundant `/api/` prefixes and port mismatches between services | Standardize port convention (FastAPI: 8000, Django: 8001); clean REST route hierarchy |
| **Telemetry Ingestion** | Frontend directly polls Blynk IoT cloud with exposed token | Backend proxy route in Django/FastAPI that polls Blynk with server-side credentials and serves cached telemetry |
| **Client Service URLs** | Decentralized, repeated `import.meta.env` lookups across 10+ JSX files | Centralized API client module (`src/services/apiClient.ts`) with unified base URLs, timeouts, and error interceptors |
| **Sandbox Conflation** | Mock responses return generic `"ACCEPTED"` status indistinguishable from government approval | Explicit status hierarchy (`SANDBOX_ACCEPTED` vs `PRODUCTION_ACCEPTED`) and mandatory `data_origin = "simulation"` |
| **State Storage** | Isolated SQLite files with zero cross-service transactional guarantees | Designated dataset ownership (FastAPI owns vector & ML pipelines; Django owns enterprise accounts, RBAC, and registry ledger) |
