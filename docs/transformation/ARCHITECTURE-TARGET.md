# CarbonOS Bangladesh — Target Enterprise Architecture

**Document Ref:** `docs/transformation/ARCHITECTURE-TARGET.md`  
**Standard:** Enterprise Clean Architecture & 3-Tier Separation  
**Status:** `ACTIVE_BLUEPRINT`  
**Latest Baseline Commit:** `61e1263`  

---

## 1. High-Level System Architecture

CarbonOS employs a decoupled 3-tier architecture separating high-concurrency scientific inference from enterprise transactional record-keeping and responsive client presentation.

```
                              [ React 19 + Tailwind CSS + GSAP ]
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
            Port 8000 (HTTP / SSE)                         Port 8001 (DRF / Auth)
       ┌───────────────────────────────┐               ┌──────────────────────────────────┐
       │   FastAPI AI & RAG Engine     │               │   Django Enterprise Services     │
       ├───────────────────────────────┤               ├──────────────────────────────────┤
       │ • ESG Factor Calculation      │               │ • User Authentication & RBAC     │
       │ • Universal Utility Parsing   │               │ • Organization & Facilities DB   │
       │ • ChromaDB RAG Vector Store   │               │ • Agronomist Review Workflows    │
       │ • Satellite MRV Quantile ML   │               │ • Audit Logs & Ledger Records    │
       │ • Farmers AI PyTorch Engine   │               │ • National Registry Bridge       │
       └───────────────────────────────┘               └──────────────────────────────────┘
                      │                                               │
                      ▼                                               ▼
       ┌───────────────────────────────┐               ┌──────────────────────────────────┐
       │ In-Memory / Vector Storage    │               │ PostgreSQL / SQLite Persistence  │
       │ • ChromaDB Collections        │               │ • Multi-Tenant Schemas           │
       │ • Job State / Cache           │               │ • Tamper-Evident Hash Chains     │
       └───────────────────────────────┘               └──────────────────────────────────┘
```

---

## 2. Service Responsibilities & Domain Ownership

### 2.1 Frontend Tier (`src/`)
- **Technology Stack:** React 19, Vite, Tailwind CSS, Lucide Icons, Framer Motion, GSAP, Leaflet.
- **Responsibilities:**
  - Client-side routing (`src/App.jsx`) across Public, Enterprise ESG SaaS, Farmers AI, and MRV Platform.
  - State management via modular Zustand stores (`useAuthStore`, `useHarvestStore`, `useEmissionsStore`).
  - Interactive visualization: SVG sparklines, geospatial boundary drawing, and responsive charts.
  - Clear user indicators: explicit separation of live connected vs. sandbox simulation states.

### 2.2 FastAPI Tier (`inference/`) — Scientific & Computation Engine
- **Technology Stack:** FastAPI, Pydantic v2, PyTorch, Scikit-Learn, XGBoost, ChromaDB, Google Gemini.
- **Canonical Port:** `8000`
- **Responsibilities:**
  - **ESG Engine:** Universal utility invoice extraction, 9-category GHG footprinting, EEIO calculations, and SHA-256 digital audit sealing.
  - **RAG Subsystem:** Tenant-isolated document retrieval over Bangladesh DoE regulatory gazettes and NDC frameworks.
  - **dMRV Subsystem:** Multi-modal biomass prediction using Random Forest and XGBoost with [P10, P50, P90] uncertainty intervals.
  - **Crop Health Model:** EfficientNet multi-head classification with fallback safeguards prohibiting untrained inference.

### 2.3 Django Tier (`backend/`) — Enterprise Persistence & Governance
- **Technology Stack:** Django 5.x, Django REST Framework, SQLite (dev) / PostgreSQL (prod).
- **Canonical Port:** `8001`
- **Responsibilities:**
  - **Identity & RBAC:** Organization accounts, user roles, facility permissions, and token lifecycles.
  - **Farmers AI Records:** Diagnosis history journal, agronomist reviews, and weather risk snapshots.
  - **National Registry Bridge:** Verra VM0047, Article 6.2 ITMO, and JCM Bilateral export bundle generation.
  - **Audit Logging:** Append-only transaction records and provenance verification.

---

## 3. Data Ownership & Inter-Service Communication

1. **No Shared Mutable Database:**
   - FastAPI and Django do not write directly to the same database tables.
   - Django owns persistent relational business entities (`Organization`, `Facility`, `Diagnosis`, `AgronomistReview`).
   - FastAPI operates as a stateless computational microservice with dedicated vector storage (`ChromaDB`).
2. **Synchronous REST Communication:**
   - Frontend communicates with FastAPI (`:8000`) for high-speed calculation, document extraction, and inference.
   - Frontend communicates with Django (`:8001`) for user sessions, historical journals, and regulatory submissions.
   - When Django requires crop inference, it proxies authenticated requests internally to FastAPI `/predict`.
3. **Tenant Boundary Enforcement:**
   - Every API request carries authenticated `tenant_id` context.
   - Relational queries filter by `organization_id` or `field_id`.
   - Vector retrieval filters by `tenant_id` metadata tag, preventing cross-tenant document leakage.

---

## 4. Production Deployment & Scalability Path

- **Frontend:** Serverless edge hosting (e.g. Vercel) with asset caching and SSL termination.
- **API Services:** Containerized using multi-stage non-root Docker images deployed behind an NGINX reverse proxy or AWS ECS / GCP Cloud Run.
- **Database:** Managed PostgreSQL (AWS RDS / Supabase) with connection pooling and automated backups.
- **Cache & Jobs:** Redis for asynchronous task queues (satellite tile processing, large PDF batch OCR) and rate limiting.
