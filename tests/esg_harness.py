"""
Shared harness for ESG API tests: the ESG router in a minimal FastAPI app against an isolated
in-memory SQLite database and a temporary upload/vector directory (no torch, network or Gemini).
Import this module before anything from esg_rag: it configures the environment first.
"""
import os
import sys
import tempfile
import time
import unittest

TMP = tempfile.mkdtemp(prefix="esg-test-")
os.environ["CHROMA_PERSIST_DIR"] = os.path.join(TMP, "store")
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(TMP, 'unused.sqlite3')}"
os.environ["ESG_AUTH_JWT_SECRET"] = "test-secret-" + "x" * 40
os.environ["ESG_PLATFORM_OPERATOR_SUBS"] = "operator-1"
os.environ.pop("ESG_AUTH_JWKS_URL", None)
os.environ.pop("GEMINI_API_KEY", None)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "inference"))

import jwt  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

from carbon_monitoring.database import Base  # noqa: E402
from esg_rag import models  # noqa: E402,F401
from esg_rag.database import get_db  # noqa: E402
from esg_rag.models import ESGMembership  # noqa: E402
from esg_rag.router import router  # noqa: E402

SECRET = os.environ["ESG_AUTH_JWT_SECRET"]


def token(sub, secret=SECRET, exp_in=300, **extra):
    claims = {"exp": int(time.time()) + exp_in, **extra}
    if sub is not None:
        claims["sub"] = sub
    return jwt.encode(claims, secret, algorithm="HS256")


def auth(sub, org=None):
    h = {"Authorization": f"Bearer {token(sub)}"}
    if org:
        h["X-Organization-Id"] = org
    return h


class ESGApiTestCase(unittest.TestCase):
    def setUp(self):
        engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(engine)
        self.Session = sessionmaker(bind=engine)

        def override_db():
            db = self.Session()
            try:
                yield db
            finally:
                db.close()

        app = FastAPI()
        app.include_router(router)
        app.dependency_overrides[get_db] = override_db
        self.app = app
        self.client = TestClient(app)

        self.org_a = self.client.post("/api/esg/organizations", json={"name": "Org A"}, headers=auth("user-a")).json()["id"]
        self.org_b = self.client.post("/api/esg/organizations", json={"name": "Org B"}, headers=auth("user-b")).json()["id"]

    def add_member(self, org, sub, role):
        db = self.Session()
        db.add(ESGMembership(organization_id=org, user_sub=sub, role=role))
        db.commit()
        db.close()

    def upload(self, sub, name, body, corpus="tenant_docs", org=None, extra=None):
        data = {"corpus": corpus, **(extra or {})}
        return self.client.post("/api/esg/ingest", files={"file": (name, body, "text/plain")},
                                data=data, headers=auth(sub, org))

