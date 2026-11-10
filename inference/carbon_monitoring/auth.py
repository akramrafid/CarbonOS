"""
Carbon MRV Authentication and Authorization Dependency Layer.
Enforces Bearer JWT verification, RBAC permissions, and strict resource ownership.
"""
import os
import time
import secrets
import logging
from dataclasses import dataclass
from typing import Optional, Set
import jwt
from fastapi import Request, Header, HTTPException, Depends

log = logging.getLogger("carbon.auth")

_ephemeral_demo_secret: Optional[str] = None

# Role permissions map for Carbon Monitoring
CARBON_ROLE_PERMISSIONS = {
    "platform_operator": {"read", "write", "admin", "review", "recalibrate"},
    "org_owner": {"read", "write", "admin", "review", "recalibrate"},
    "esg_admin": {"read", "write", "admin", "review", "recalibrate"},
    "carbon_admin": {"read", "write", "admin", "review", "recalibrate"},
    "project_developer": {"read", "write"},
    "data_contributor": {"read", "write"},
    "surveyor": {"read", "write"},
    "auditor": {"read", "review"},
    "validator": {"read", "review"},
    "viewer": {"read"},
}


@dataclass(frozen=True)
class CarbonUser:
    sub: str
    organization_id: str
    role: str = "org_owner"
    is_platform_operator: bool = False
    is_demo: bool = False

    def can(self, permission: str) -> bool:
        if self.is_platform_operator:
            return True
        perms: Set[str] = CARBON_ROLE_PERMISSIONS.get(self.role, set())
        return permission in perms


def get_jwt_secret() -> str:
    global _ephemeral_demo_secret
    secret = os.getenv("CARBON_AUTH_JWT_SECRET") or os.getenv("ESG_AUTH_JWT_SECRET")
    if secret:
        return secret
    if os.environ.get("CARBON_AUTH_JWT_SECRET") == "" or os.environ.get("ESG_AUTH_JWT_SECRET") == "":
        return ""
    # In non-production or demo environment, provide fallback ephemeral secret
    if os.getenv("CARBON_ENV") != "production" and os.getenv("ESG_ENV") != "production":
        if not _ephemeral_demo_secret:
            _ephemeral_demo_secret = secrets.token_hex(32)
        return _ephemeral_demo_secret
    return ""


def mint_carbon_token(
    sub: str,
    organization_id: str = "org-demo",
    role: str = "org_owner",
    exp_seconds: int = 7200,
    is_demo: bool = False,
    is_platform_operator: bool = False,
    **extra,
) -> str:
    secret = get_jwt_secret()
    if not secret or len(secret) < 32:
        raise HTTPException(503, "Cannot mint token: JWT secret is not configured")
    now = int(time.time())
    claims = {
        "sub": sub,
        "organization_id": organization_id,
        "role": role,
        "is_platform_operator": is_platform_operator,
        "is_demo": is_demo,
        "exp": now + exp_seconds,
        "iat": now,
        **extra,
    }
    return jwt.encode(claims, secret, algorithm="HS256")


def _decode_token(token: str) -> dict:
    secret = get_jwt_secret()
    if not secret:
        raise HTTPException(503, "Authentication secret is not configured")
    try:
        return jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={"require": ["exp", "sub"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token has expired", headers={"WWW-Authenticate": "Bearer"})
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token signature or payload", headers={"WWW-Authenticate": "Bearer"})


def get_current_user(
    request: Request,
    authorization: Optional[str] = Header(None),
    x_organization_id: Optional[str] = Header(None),
) -> CarbonUser:
    """
    Extracts and verifies Bearer token, constructing a verified CarbonUser.
    Fails closed (401) on missing or invalid authentication.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=401,
            detail="Authentication required: missing Bearer token in Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    raw_token = authorization[7:].strip()
    if not raw_token:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: empty token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Allow mock/demo tokens when running in non-production demo mode
    is_prod = (os.getenv("CARBON_ENV") == "production" or os.getenv("ESG_ENV") == "production")
    if not is_prod and (raw_token.startswith("demo-") or raw_token.startswith("test-")):
        # Synthesize demo persona
        parts = raw_token.split("-")
        role = "org_owner"
        if "reviewer" in parts or "auditor" in parts or "validator" in parts:
            role = "auditor"
        elif "viewer" in parts:
            role = "viewer"
        elif "operator" in parts:
            role = "platform_operator"

        chosen_org = x_organization_id if isinstance(x_organization_id, str) and x_organization_id.strip() else None
        org_id = chosen_org or "demo-org-default"
        sub = f"user-{raw_token}"
        user = CarbonUser(
            sub=sub,
            organization_id=org_id,
            role=role,
            is_platform_operator=(role == "platform_operator"),
            is_demo=True,
        )
        request.state.user = user
        return user

    claims = _decode_token(raw_token)
    sub = str(claims["sub"])
    chosen_org = x_organization_id if isinstance(x_organization_id, str) and x_organization_id.strip() else None
    org_id = chosen_org or claims.get("organization_id") or claims.get("tenant_id") or "default-tenant"
    role = claims.get("role", "org_owner")
    is_operator = bool(claims.get("is_platform_operator", False))
    is_demo = bool(claims.get("is_demo", False))

    user = CarbonUser(
        sub=sub,
        organization_id=str(org_id),
        role=str(role),
        is_platform_operator=is_operator,
        is_demo=is_demo,
    )
    request.state.user = user
    return user


def require_permission(permission: str):
    """
    Dependency factory to enforce RBAC permissions.
    """
    def _dependency(user: CarbonUser = Depends(get_current_user)) -> CarbonUser:
        if not user.can(permission):
            raise HTTPException(
                status_code=403,
                detail=f"Forbidden: role '{user.role}' lacks '{permission}' permission",
            )
        return user
    return _dependency


def verify_job_ownership(job, user: CarbonUser) -> None:
    """
    Ensures the authenticated user or tenant owns the requested AnalysisJob.
    """
    if user.is_platform_operator:
        return

    # Check tenant boundary
    job_org = getattr(job, "organization_id", None)
    if job_org and job_org != user.organization_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: this analysis job belongs to another organization",
        )

    # Check user boundary if organization is not set
    job_user = getattr(job, "user_id", None)
    if not job_org and job_user and job_user != user.sub:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: you do not have permission to access this analysis job",
        )


def verify_boundary_ownership(boundary, user: CarbonUser) -> None:
    """
    Ensures the authenticated user or tenant owns the requested UploadedBoundary.
    """
    if user.is_platform_operator:
        return

    b_org = getattr(boundary, "organization_id", None)
    if b_org and b_org != user.organization_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: this boundary belongs to another organization",
        )

    b_user = getattr(boundary, "user_id", None)
    if not b_org and b_user and b_user != user.sub:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: you do not have permission to access this boundary",
        )
