# CarbonOS ESG SaaS — Deployment, Operations & Recovery Runbook

**Environment:** Production / Staging / Local Demo  
**Database Target:** PostgreSQL 16 (Production) / SQLite StaticPool (Test harness only)  
**Containerization:** Docker & Docker Compose  

---

## 1. Environment Variable Reference

| Variable Name | Required | Default | Allowed Values | Purpose & Safety Rule |
|---|---|---|---|---|
| `ESG_ACCESS_MODE` | Yes | `protected` | `isolated_demo`, `local_dev`, `private_single_tenant`, `protected`, `oidc` | Controls demo session provisioning. In production, must be `protected` or `oidc`. |
| `ESG_AUTH_JWT_SECRET` | Required if no JWKS | None | 256-bit hex/string (min 32 chars) | HS256 secret for signing and verifying tokens. Fails closed (503) if empty in protected mode. |
| `ESG_AUTH_JWKS_URL` | Optional | None | Valid HTTPS URL | OIDC JWKS endpoint for RS256/ES256 public key verification. |
| `ESG_ENV` | Optional | `development` | `development`, `staging`, `production` | When set to `production`, demo mode is strictly disallowed. |
| `DATABASE_URL` | Yes | SQLite in test | `postgresql://user:pass@host:5432/dbname` | Target relational database connection string. |
| `CHROMA_PERSIST_DIR` | Optional | `/app/data/chroma` | Absolute directory path | Vector storage persistence directory. Falls back to in-memory store if Chroma is uninstalled. |
| `ESG_PLATFORM_OPERATOR_SUBS`| Optional | None | Comma-separated subject IDs | Principals authorized to ingest into global regulatory corpora. |

---

## 2. Docker Compose Staging Configuration

```yaml
version: '3.8'

services:
  carbonos-postgres:
    image: postgres:16-alpine
    container_name: carbonos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: carbonos_esg
      POSTGRES_USER: esg_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - esg_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U esg_admin -d carbonos_esg"]
      interval: 10s
      timeout: 5s
      retries: 5

  carbonos-inference:
    build:
      context: .
      dockerfile: inference/Dockerfile
    container_name: carbonos-inference
    restart: unless-stopped
    environment:
      - PORT=8000
      - DATABASE_URL=postgresql://esg_admin:${POSTGRES_PASSWORD}@carbonos-postgres:5432/carbonos_esg
      - ESG_ACCESS_MODE=isolated_demo
      - ESG_ENV=staging
    ports:
      - "8000:8000"
    depends_on:
      carbonos-postgres:
        condition: service_healthy

volumes:
  esg_postgres_data:
```

---

## 3. Health & Readiness Endpoints

- **Health Check:** `GET /api/esg/health`
  - Returns `200 OK` with database connection latency, system uptime, and version tag.
  - Public unauthenticated endpoint for container orchestrators (Kubernetes liveness probe).
- **Demo Status:** `GET /api/esg/demo/status`
  - Returns current operating access mode and demo label watermark.

---

## 4. Disaster Recovery & Backup Drill

### Database Backup
```bash
pg_dump -U esg_admin -d carbonos_esg -Fc > /backups/esg_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore Drill Procedure
1. Create a clean disposable database:
   ```bash
   createdb -U esg_admin carbonos_esg_recovery_test
   ```
2. Restore from backup dump:
   ```bash
   pg_restore -U esg_admin -d carbonos_esg_recovery_test /backups/esg_backup_latest.dump
   ```
3. Verify table counts and row integrity:
   ```sql
   SELECT count(*) FROM esg_organizations;
   SELECT count(*) FROM esg_activity_records;
   SELECT count(*) FROM esg_calculation_runs;
   ```
4. Run integration suite pointing to the recovered database:
   ```bash
   ESG_TEST_DATABASE_URL=postgresql://esg_admin@localhost/carbonos_esg_recovery_test python -m unittest discover -s tests -p "test_esg_*.py"
   ```
