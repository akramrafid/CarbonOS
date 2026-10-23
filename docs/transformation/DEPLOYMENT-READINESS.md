# CarbonOS Bangladesh — Production Deployment Readiness Specification

**Document Ref:** `docs/transformation/DEPLOYMENT-READINESS.md`  
**Governing Standard:** Section 15 & Section 24 of Enterprise Master Prompt  
**Status:** PRODUCTION READINESS ARCHITECTURE  
**Target Environment:** Cloud-Native / Hybrid Sovereign Infrastructure (Bangladesh Data Center / Multi-Cloud)  
**Last Updated:** 2026-10-24  
**Audit Baseline Commit:** `61e1263`  

---

## 1. System Topology & Infrastructure Architecture

CarbonOS is engineered as a secure, decoupled 3-tier enterprise architecture separating edge presentation, high-performance ML/RAG inference, and sovereign transactional persistence.

```
                              ┌────────────────────────────────────────┐
                              │           Client Viewports             │
                              │ (Desktop Chrome / Android / PWA Edge)  │
                              └───────────────────┬────────────────────┘
                                                  │ HTTPS / WSS
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │       Edge CDN & Static Hosting        │
                              │   (Vercel / Cloudflare Pages / Caddy)   │
                              │        React 19 SPA + Tailwind         │
                              └───────────────────┬────────────────────┘
                                                  │ /api/* (mTLS / JWT)
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │       Production Ingress Gateway       │
                              │         (Nginx / Traefik / Envoy)      │
                              │       Rate Limiting & WAF Rules        │
                              └───────────┬────────────────┬───────────┘
                                          │                │
                        /api/esg/*, /api/mrv/*       /api/auth/*, /api/registry/*
                                          │                │
                                          ▼                ▼
                     ┌────────────────────────┐  ┌────────────────────────┐
                     │   FastAPI Engine       │  │   Django Sovereign     │
                     │  (inference/ Container)│  │   (backend/ Container) │
                     │  PyTorch, ChromaDB,    │  │   RBAC, Auth, Ledger,  │
                     │  Satellite STAC, RAG   │  │   Registry Bridge      │
                     └────────────┬───────────┘  └───────────┬────────────┘
                                  │                          │
                                  │   Internal Network Mesh  │
                                  ▼                          ▼
    ┌───────────────────────────────────────────────────────────────────────────────┐
    │                              Stateful Services Layer                          │
    │  ┌───────────────────────┐ ┌───────────────────────┐ ┌─────────────────────┐  │
    │  │ PostgreSQL 16 (RDS)   │ │ Redis 7 Cluster       │ │ S3-Compatible Object│  │
    │  │ Sovereign DB / RLS    │ │ Caching / Task Queue  │ │ Storage (Bills/TIFF)│  │
    │  └───────────────────────┘ └───────────────────────┘ └─────────────────────┘  │
    └───────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Containerization Specifications

### 2.1 FastAPI Inference Service (`inference/Dockerfile`)

```dockerfile
# Multi-stage, non-root production container for CarbonOS ML/RAG Inference Engine
FROM python:3.11-slim-bookworm AS builder

WORKDIR /build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final minimal runtime image
FROM python:3.11-slim-bookworm AS runtime

WORKDIR /app
ENV PATH=/root/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8000

# Install runtime shared libraries for PyTorch and geospatial processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 --shell /bin/bash carbonos

COPY --from=builder /root/.local /home/carbonos/.local
COPY --chown=carbonos:carbonos inference/ /app/inference/

ENV PATH=/home/carbonos/.local/bin:$PATH
USER carbonos

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "inference.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers"]
```

### 2.2 Django Backend Service (`backend/Dockerfile`)

```dockerfile
# Multi-stage production container for CarbonOS Django Sovereign Backend
FROM python:3.11-slim-bookworm AS builder

WORKDIR /build
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Runtime container
FROM python:3.11-slim-bookworm AS runtime

WORKDIR /app
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=farmers_ai_project.settings

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10002 --shell /bin/bash djangouser

COPY --from=builder /root/.local /home/djangouser/.local
COPY --chown=djangouser:djangouser backend/ /app/backend/

ENV PATH=/home/djangouser/.local/bin:$PATH
USER djangouser
WORKDIR /app/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8000/api/health/ || exit 1

CMD ["gunicorn", "farmers_ai_project.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4", "--threads", "2"]
```

---

## 3. Production Environment & Secrets Configuration

CarbonOS enforces strict zero-fallback validation in production: if any required secret or environmental configuration is omitted, the process terminates immediately rather than running with insecure defaults.

### 3.1 Environment Variable Matrix

| Variable Name | Required Service | Purpose | Production Default / Constraint |
|---|---|---|---|
| `DJANGO_SECRET_KEY` | Backend | Cryptographic session & token signing | Must be generated 64-char high-entropy string; no fallback. |
| `DJANGO_DEBUG` | Backend | Debug mode toggle | Strictly `False` in production. |
| `ALLOWED_HOSTS` | Backend | HTTP Host header validation | Comma-separated domain names (e.g., `carbonos.gov.bd,api.carbonos.bd`). |
| `DATABASE_URL` | Backend | PostgreSQL connection string | TLS-enforced connection string (`postgresql://...sslmode=require`). |
| `REDIS_URL` | Both | Cache and asynchronous task broker | `rediss://...` with password authentication. |
| `BLYNK_AUTH_TOKEN` | Backend Proxy | Sovereign IoT telemetry polling | Secure server-side credential; strictly excluded from frontend client. |
| `GEMINI_API_KEY` | Inference | Legal/Regulatory RAG vector synthesis | Google Cloud Service Account or Secret Manager injected credential. |
| `CHROMA_PERSIST_DIR` | Inference | ChromaDB vector store directory | Persistent SSD volume path (`/data/chroma`). |
| `ED25519_PRIVATE_KEY` | Backend | Article 6.2 Monitoring Record Signer | Sovereign HSM or Vault-injected base64 private key. |
| `VITE_API_URL` | Frontend | Canonical backend API gateway URL | `https://api.carbonos.bd` (Port 443 / 8000 gateway). |

---

## 4. Observability, Logging & Health Checks

### 4.1 Structured JSON Logging Specification
All services emit structured JSON logs to standard output for ingestion by Vector, FluentBit, Datadog, or Grafana Loki:

```json
{
  "timestamp": "2026-10-24T01:30:00.123Z",
  "level": "INFO",
  "service": "carbonos-inference",
  "trace_id": "c8f2a1b9e4d34081",
  "span_id": "7a3e5c9b1d2f",
  "tenant_id": "TENANT-SQUARE-TEXTILES-001",
  "event": "esg_calculation_completed",
  "data": {
    "reporting_period": "2024-Q3",
    "gross_emissions_mt_co2e": 1420.55,
    "audit_seal": "SHA256-SEAL-7b9e4a2c1f8d90a..."
  }
}
```

### 4.2 Health & Readiness Probes
- **Liveness Probe (`GET /health`):** Verifies process responsiveness. Returns `HTTP 200 {"status": "HEALTHY"}`.
- **Readiness Probe (`GET /ready`):** Validates database connectivity, ChromaDB vector index availability, and ML checkpoint presence. Returns `HTTP 200` if operational; `HTTP 503 Service Unavailable` if backing services are offline.

---

## 5. Database Migration & Rollback Strategy

1. **Zero-Downtime Migration Pattern:**
   - All schema alterations follow the **Expand-Contract** methodology. Columns are added as nullable before application code relies on them.
   - Destructive operations (`DROP COLUMN`, `RENAME TABLE`) require two release cycles with deprecation warnings.
2. **Pre-Migration Safety Checklist:**
   - Automated pre-flight backup snapshot via pg_dump / AWS RDS automated snapshot.
   - Execute migrations inside explicit SQL transactions (`manage.py migrate --plan`).
   - Run verification tests on staging clone prior to production execution.
3. **Recovery Objectives:**
   - **RPO (Recovery Point Objective):** < 15 minutes (continuous WAL archiving).
   - **RTO (Recovery Time Objective):** < 1 hour (automated infrastructure-as-code restore via Terraform/Docker).
