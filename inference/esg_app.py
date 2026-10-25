"""
Standalone ESG service: the /api/esg routes without the farmers-AI / satellite stack (no torch).

    cd inference && uvicorn esg_app:app --port 8100

Production settings are validated at startup (ESG_ENV=production refuses to start insecurely).
"""
import logging
import os
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from esg_rag.database import SessionLocal, init_db
from esg_rag.router import router as esg_router

log = logging.getLogger("esg.http")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"), format="%(asctime)s %(levelname)s %(name)s %(message)s")

ENV = os.getenv("ESG_ENV", "development")


def validate_config():
    """Refuse to start a production deployment that would run open or leak data."""
    if ENV != "production":
        return
    problems = []
    if not os.getenv("ESG_AUTH_JWKS_URL"):
        problems.append("ESG_AUTH_JWKS_URL (OIDC) is required in production")
    if not (os.getenv("ESG_AUTH_ISSUER") and os.getenv("ESG_AUTH_AUDIENCE")):
        problems.append("ESG_AUTH_ISSUER and ESG_AUTH_AUDIENCE are required in production")
    if not os.getenv("DATABASE_URL", "").startswith("postgresql"):
        problems.append("DATABASE_URL must point to PostgreSQL in production")
    origins = os.getenv("ALLOWED_ORIGINS", "")
    if not origins or "*" in origins or "localhost" in origins:
        problems.append("ALLOWED_ORIGINS must list the production web origins only")
    if os.getenv("ESG_LLM_EXTRACTION_ENABLED", "").lower() == "true" and not os.getenv("ESG_LLM_PROCESSING_TERMS_REF"):
        problems.append("ESG_LLM_PROCESSING_TERMS_REF must reference the signed data-processing terms before enabling LLM extraction")
    if problems:
        raise RuntimeError("Insecure ESG configuration: " + "; ".join(problems))


validate_config()
app = FastAPI(title="CarbonOS ESG API", version="1.0.0",
              docs_url=None if ENV == "production" else "/docs", redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:3000").split(",") if o.strip()],
    allow_credentials=False,  # bearer tokens, no cookies
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-Organization-Id", "X-Request-Id"],
    expose_headers=["X-Request-Id", "X-Content-SHA256", "Content-Disposition"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id", "")[:64] or uuid.uuid4().hex
    started = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        # Never return stack traces; the request id links the user's report to the server log.
        log.exception("unhandled error request_id=%s path=%s", request_id, request.url.path)
        response = JSONResponse({"detail": "Internal error", "request_id": request_id}, status_code=500)
    response.headers["X-Request-Id"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    # Logs carry method, path, status and timing only — never bodies, tokens or document text.
    log.info("request_id=%s %s %s %s %.1fms", request_id, request.method, request.url.path,
             response.status_code, (time.perf_counter() - started) * 1000)
    return response


@app.on_event("startup")
def startup():
    init_db()


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/readyz")
def readyz():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse({"status": "unavailable"}, status_code=503)
    return {"status": "ready"}


app.include_router(esg_router)
