"""
ESG API authentication and tenant resolution. Deny by default.

Identity comes from a bearer JWT issued by an OIDC provider (verified via JWKS) or, for
development/test, an HS256 shared secret. The tenant is never taken from request input:
it is the organization the token subject is a member of (esg_membership table).
X-Organization-Id only selects among the caller's own memberships.
"""
import logging
import os
import secrets
import time
from dataclasses import dataclass
from functools import lru_cache
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .database import get_db
from .models import ESGMembership, ESGOrganization

log = logging.getLogger("esg.auth")

_ephemeral_demo_secret: Optional[str] = None


def get_access_mode() -> str:
    env_mode = os.getenv("ESG_ACCESS_MODE", "").strip().lower()
    if env_mode in ("protected", "isolated_demo", "demo", "local_dev", "private_single_tenant", "oidc"):
        return "isolated_demo" if env_mode == "demo" else env_mode
    if os.getenv("ESG_ENV") == "production":
        return "protected"
    # When ESG_ACCESS_MODE is not specified, fail-closed to protected
    return "protected"


def get_jwt_secret() -> str:
    global _ephemeral_demo_secret
    secret = os.getenv("ESG_AUTH_JWT_SECRET")
    if secret:
        return secret
    # If ESG_AUTH_JWT_SECRET was explicitly set to empty string, fail closed
    if os.environ.get("ESG_AUTH_JWT_SECRET") == "":
        return ""
    mode = get_access_mode()
    if mode in ("isolated_demo", "local_dev") and os.getenv("ESG_ENV") != "production":
        if not _ephemeral_demo_secret:
            _ephemeral_demo_secret = secrets.token_hex(32)
        return _ephemeral_demo_secret
    return ""


def mint_token(sub: str, exp_seconds: int = 7200, is_demo: bool = False, **extra) -> str:
    secret = get_jwt_secret()
    if not secret or len(secret) < 32:
        raise HTTPException(503, "Cannot mint token: JWT secret is not configured")
    now = int(time.time())
    claims = {
        "sub": sub,
        "exp": now + exp_seconds,
        "iat": now,
        "is_demo": is_demo,
        **extra,
    }
    issuer = os.getenv("ESG_AUTH_ISSUER")
    if issuer:
        claims["iss"] = issuer
    audience = os.getenv("ESG_AUTH_AUDIENCE")
    if audience:
        claims["aud"] = audience
    return jwt.encode(claims, secret, algorithm="HS256")

ROLE_PERMISSIONS = {
    "org_owner": {"read", "write", "review", "admin"},
    "esg_admin": {"read", "write", "review", "admin"},
    "data_contributor": {"read", "write"},
    "facility_manager": {"read", "write"},
    "auditor": {"read", "review"},
    "executive_viewer": {"read"},
    # Supplier portal is not built yet: suppliers get no access to the tenant workspace.
    "supplier_collaborator": set(),
}


@dataclass(frozen=True)
class Principal:
    sub: str
    organization_id: str
    role: str
    is_demo: bool
    is_platform_operator: bool

    def can(self, permission: str) -> bool:
        return permission in ROLE_PERMISSIONS.get(self.role, set())


@dataclass(frozen=True)
class Identity:
    sub: str
    is_platform_operator: bool
    # Only set when the identity provider asserts the address is verified (OIDC email_verified).
    verified_email: Optional[str] = None


def _operator_subs() -> set:
    return {s.strip() for s in os.getenv("ESG_PLATFORM_OPERATOR_SUBS", "").split(",") if s.strip()}


@lru_cache(maxsize=4)
def _jwks_client(url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(url, cache_keys=True)


def _decode(token: str) -> dict:
    jwks_url = os.getenv("ESG_AUTH_JWKS_URL")
    secret = get_jwt_secret()
    issuer = os.getenv("ESG_AUTH_ISSUER") or None
    audience = os.getenv("ESG_AUTH_AUDIENCE") or None
    options = {"require": ["exp", "sub"], "verify_aud": audience is not None}

    if jwks_url:
        key = _jwks_client(jwks_url).get_signing_key_from_jwt(token).key
        algorithms = ["RS256", "ES256"]
    elif secret:
        if len(secret) < 32:
            raise HTTPException(503, "ESG authentication is misconfigured")
        key, algorithms = secret, ["HS256"]
    else:
        # Fail closed: an unconfigured deployment must never serve tenant data.
        raise HTTPException(503, "ESG authentication is not configured")

    return jwt.decode(token, key, algorithms=algorithms, audience=audience, issuer=issuer, options=options)


def get_identity(authorization: Optional[str] = Header(None)) -> Identity:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})
    try:
        claims = _decode(authorization[7:].strip())
    except HTTPException:
        raise
    except Exception as e:  # any verification failure is a 401; never echo token details
        log.info("rejected ESG token: %s", type(e).__name__)
        raise HTTPException(401, "Invalid or expired token", headers={"WWW-Authenticate": "Bearer"})
    sub = str(claims["sub"])
    email = claims.get("email") if claims.get("email_verified") is True else None
    return Identity(sub=sub, is_platform_operator=sub in _operator_subs(),
                    verified_email=email.strip().lower() if isinstance(email, str) else None)


def get_principal(
    identity: Identity = Depends(get_identity),
    x_organization_id: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Principal:
    q = (
        db.query(ESGMembership, ESGOrganization)
        .join(ESGOrganization, ESGOrganization.id == ESGMembership.organization_id)
        .filter(ESGMembership.user_sub == identity.sub, ESGOrganization.archived_at.is_(None))
    )
    if x_organization_id:
        q = q.filter(ESGMembership.organization_id == x_organization_id)
    rows = q.all()

    if not rows:
        # Same response whether the org exists or not: no tenant enumeration.
        raise HTTPException(403, "No access to this organization")
    if len(rows) > 1:
        raise HTTPException(400, "X-Organization-Id header is required for users with several organizations")

    membership, org = rows[0]
    return Principal(
        sub=identity.sub,
        organization_id=org.id,
        role=membership.role,
        is_demo=bool(org.is_demo),
        is_platform_operator=identity.is_platform_operator,
    )


def require(permission: str):
    def dependency(principal: Principal = Depends(get_principal)) -> Principal:
        if not principal.can(permission):
            raise HTTPException(403, f"Role '{principal.role}' lacks '{permission}' permission")
        return principal
    return dependency
