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
    is_prod = (os.getenv("CARBON_ENV") == "production" or os.getenv("ESG_ENV") == "production")
    if is_prod:
        secret = os.getenv("CARBON_AUTH_JWT_SECRET")
    else:
        secret = os.getenv("CARBON_AUTH_JWT_SECRET") or os.getenv("ESG_AUTH_JWT_SECRET")
    if secret:
        return secret
    if os.environ.get("CARBON_AUTH_JWT_SECRET") == "" or (not is_prod and os.environ.get("ESG_AUTH_JWT_SECRET") == ""):
        return ""
    # In non-production or demo environment, provide fallback ephemeral secret
    if not is_prod:
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

    # Allow mock/demo tokens ONLY when explicitly opted in for local dev/tests outside production
    is_prod = (os.getenv("CARBON_ENV") == "production" or os.getenv("ESG_ENV") == "production")
    allow_demo_tokens = os.getenv("CARBON_ALLOW_INSECURE_DEMO_TOKENS", "false").lower() == "true"
    if not is_prod and allow_demo_tokens and (raw_token.startswith("demo-") or raw_token.startswith("test-")):
        # Synthesize demo persona (never elevate to platform_operator from bearer prefix)
        parts = raw_token.split("-")
        role = "viewer"
        if "reviewer" in parts or "auditor" in parts or "validator" in parts:
            role = "auditor"
        elif "owner" in parts or "developer" in parts or "write" in parts:
            role = "org_owner"
        # [COMMENTED OUT FOR PERSONAL REFERENCE — prefix-based operator escalation removed]
        # elif "operator" in parts:
        #     role = "platform_operator"

        org_id = "demo-org-default"
        sub = f"user-{raw_token}"
        user = CarbonUser(
            sub=sub,
            organization_id=org_id,
            role=role,
            is_platform_operator=False,
            is_demo=True,
        )
        request.state.user = user
        return user

    claims = _decode_token(raw_token)
    sub = str(claims["sub"])
    # [COMMENTED OUT FOR PERSONAL REFERENCE — trusting caller X-Organization-Id allowed cross-tenant spoofing]
    # chosen_org = x_organization_id if isinstance(x_organization_id, str) and x_organization_id.strip() else None
    # org_id = chosen_org or claims.get("organization_id") or claims.get("tenant_id") or "default-tenant"
    org_id = claims.get("organization_id") or claims.get("tenant_id") or claims.get("org_id")
    if not org_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: token lacks organization_id claim",
        )
    role = claims.get("role", "viewer")
    is_operator = bool(claims.get("is_platform_operator", False))
    is_demo = bool(claims.get("is_demo", False))
    if is_prod and is_demo:
        raise HTTPException(
            status_code=401,
            detail="Demo tokens are rejected in production environment",
            headers={"WWW-Authenticate": "Bearer"},
        )

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
    job_user = getattr(job, "user_id", None)
    if not job_org and not job_user:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: analysis job lacks ownership metadata",
        )
    if job_org and job_org != user.organization_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: this analysis job belongs to another organization",
        )

    # Check user boundary if organization is not set
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
    b_user = getattr(boundary, "user_id", None)
    if not b_org and not b_user:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: boundary lacks ownership metadata",
        )
    if b_org and b_org != user.organization_id:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: this boundary belongs to another organization",
        )

    if not b_org and b_user and b_user != user.sub:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: you do not have permission to access this boundary",
        )
