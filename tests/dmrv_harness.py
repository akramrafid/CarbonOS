"""
Shared test harness for authenticated, tenant-scoped dMRV API tests.
Uses `esg_rag.*` (never `inference.esg_rag.*`) so SQLAlchemy declarative bases match router.py and tests/esg_harness.py.
"""
import os
import sys
import uuid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
INF_DIR = os.path.join(BASE_DIR, "inference")
if INF_DIR not in sys.path:
    sys.path.append(INF_DIR)

os.environ.setdefault("ESG_AUTH_JWT_SECRET", "test-secret-" + "x" * 40)
os.environ.pop("ESG_AUTH_JWKS_URL", None)

import _isolated_db  # noqa: F401,E402

from esg_rag import ledger_models as _esg_ledger_models  # noqa: F401,E402
from esg_rag import models as _esg_models  # noqa: F401,E402
from esg_rag.auth import mint_token  # noqa: E402
from esg_rag.database import EsgBase, SessionLocal as EsgSessionLocal, engine as esg_engine  # noqa: E402
from esg_rag.models import ESGMembership, ESGOrganization  # noqa: E402


def ensure_dmrv_test_db():
    EsgBase.metadata.create_all(bind=esg_engine)


def ensure_test_org_and_members(org_id: str, owner_sub: str, extra_members=None) -> str:
    ensure_dmrv_test_db()
    db = EsgSessionLocal()
    try:
        org = db.query(ESGOrganization).filter(ESGOrganization.id == org_id).first()
        if not org:
            org = ESGOrganization(id=org_id, name=f"Test Org {org_id[:8]}", is_demo=False, created_by_sub=owner_sub)
            db.add(org)
            db.flush()

        members = [(owner_sub, "org_owner")] + list(extra_members or [])
        for sub, role in members:
            exists = (
                db.query(ESGMembership)
                .filter(ESGMembership.organization_id == org_id, ESGMembership.user_sub == sub)
                .first()
            )
            if not exists:
                db.add(ESGMembership(organization_id=org_id, user_sub=sub, role=role))
        db.commit()
        return org_id
    finally:
        db.close()


def dmrv_auth(sub: str, org_id: str) -> dict:
    tok = mint_token(sub=sub, exp_in=3600)
    return {
        "Authorization": f"Bearer {tok}",
        "X-Organization-Id": org_id,
    }


def setup_dmrv_test_tenants(prefix: str = "dmrv") -> dict:
    org_a = ensure_test_org_and_members(
        f"{prefix}-org-a-{uuid.uuid4().hex[:6]}",
        owner_sub=f"{prefix}-owner-a",
        extra_members=[
            (f"{prefix}-auditor-a", "auditor"),
            (f"{prefix}-contrib-a", "data_contributor"),
            (f"{prefix}-viewer-a", "executive_viewer"),
        ],
    )
    org_b = ensure_test_org_and_members(
        f"{prefix}-org-b-{uuid.uuid4().hex[:6]}",
        owner_sub=f"{prefix}-owner-b",
    )
    return {
        "org_a": org_a,
        "org_b": org_b,
        "owner_a": dmrv_auth(f"{prefix}-owner-a", org_a),
        "auditor_a": dmrv_auth(f"{prefix}-auditor-a", org_a),
        "contrib_a": dmrv_auth(f"{prefix}-contrib-a", org_a),
        "viewer_a": dmrv_auth(f"{prefix}-viewer-a", org_a),
        "owner_b": dmrv_auth(f"{prefix}-owner-b", org_b),
    }
