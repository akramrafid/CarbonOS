"""
Organization membership administration and email invitations.

Invitations are bound to an email address and accepted only by a signed-in user whose token carries
that address as a *verified* email claim. The raw token is returned once to the inviter (no email is
sent by CarbonOS yet) and stored only as a SHA-256 hash.
"""
import datetime as dt
import hashlib
import secrets
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from .auth import Identity, Principal, get_identity, require
from .database import get_db
from .ledger import audit
from .ledger_models import Invitation, _now
from .models import ESG_ROLES, ESGMembership, ESGOrganization

router = APIRouter(tags=["ESG Members"])
INVITE_TTL = dt.timedelta(days=7)
Role = Literal[ESG_ROLES]


class InviteIn(BaseModel):
    email: str = Field(..., min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    role: Role


class AcceptIn(BaseModel):
    token: str = Field(..., min_length=20, max_length=200)


class RoleIn(BaseModel):
    role: Role


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _aware(t):
    return t if t is None or t.tzinfo else t.replace(tzinfo=dt.timezone.utc)  # SQLite drops tzinfo


def _check_grant(principal: Principal, role: str):
    if role == "org_owner" and principal.role != "org_owner":
        raise HTTPException(403, "Only an organization owner can grant the owner role")


def _owner_count(db, org_id):
    return db.query(ESGMembership).filter(ESGMembership.organization_id == org_id,
                                          ESGMembership.role == "org_owner").count()


@router.get("/members")
def list_members(p: Principal = Depends(require("admin")), db: Session = Depends(get_db)):
    rows = db.query(ESGMembership).filter(ESGMembership.organization_id == p.organization_id) \
        .order_by(ESGMembership.created_at).all()
    return [{"id": m.id, "user_sub": m.user_sub, "role": m.role, "created_at": m.created_at} for m in rows]


@router.patch("/members/{member_id}")
def change_role(member_id: str, body: RoleIn, p: Principal = Depends(require("admin")), db: Session = Depends(get_db)):
    m = db.query(ESGMembership).filter(ESGMembership.id == member_id,
                                       ESGMembership.organization_id == p.organization_id).first()
    if m is None:
        raise HTTPException(404, "Member not found")
    _check_grant(p, body.role)
    if m.role == "org_owner" and p.role != "org_owner":
        raise HTTPException(403, "Only an organization owner can change an owner's role")
    if m.role == "org_owner" and body.role != "org_owner" and _owner_count(db, p.organization_id) == 1:
        raise HTTPException(409, "An organization must keep at least one owner")
    audit(db, p, "member.role_change", "membership", m.id, {"user_sub": m.user_sub, "from": m.role, "to": body.role})
    m.role = body.role
    db.commit()
    return {"id": m.id, "user_sub": m.user_sub, "role": m.role}


@router.delete("/members/{member_id}", status_code=204)
def remove_member(member_id: str, p: Principal = Depends(require("admin")), db: Session = Depends(get_db)):
    m = db.query(ESGMembership).filter(ESGMembership.id == member_id,
                                       ESGMembership.organization_id == p.organization_id).first()
    if m is None:
        raise HTTPException(404, "Member not found")
    if m.role == "org_owner" and p.role != "org_owner":
        raise HTTPException(403, "Only an organization owner can remove an owner")
    if m.role == "org_owner" and _owner_count(db, p.organization_id) == 1:
        raise HTTPException(409, "An organization must keep at least one owner")
    audit(db, p, "member.remove", "membership", m.id, {"user_sub": m.user_sub, "role": m.role})
    db.delete(m)
    db.commit()


@router.post("/invitations", status_code=201)
def invite(body: InviteIn, p: Principal = Depends(require("admin")), db: Session = Depends(get_db)):
    _check_grant(p, body.role)
    token = secrets.token_urlsafe(32)
    inv = Invitation(organization_id=p.organization_id, email=body.email.strip().lower(), role=body.role,
                     token_sha256=_hash(token), expires_at=_now() + INVITE_TTL, invited_by=p.sub)
    db.add(inv)
    db.flush()
    audit(db, p, "invitation.create", "invitation", inv.id, {"email": inv.email, "role": inv.role})
    db.commit()
    # The token is shown once; share it with the invitee over a trusted channel.
    return {"id": inv.id, "email": inv.email, "role": inv.role, "expires_at": inv.expires_at, "token": token}


@router.get("/invitations")
def list_invitations(p: Principal = Depends(require("admin")), db: Session = Depends(get_db)):
    rows = db.query(Invitation).filter(Invitation.organization_id == p.organization_id) \
        .order_by(Invitation.created_at.desc()).all()
    return [{"id": i.id, "email": i.email, "role": i.role, "expires_at": i.expires_at, "accepted_at": i.accepted_at,
             "revoked_at": i.revoked_at} for i in rows]


@router.delete("/invitations/{inv_id}", status_code=204)
def revoke_invitation(inv_id: str, p: Principal = Depends(require("admin")), db: Session = Depends(get_db)):
    inv = db.query(Invitation).filter(Invitation.id == inv_id, Invitation.organization_id == p.organization_id).first()
    if inv is None:
        raise HTTPException(404, "Invitation not found")
    if inv.accepted_at is None and inv.revoked_at is None:
        inv.revoked_at = _now()
        audit(db, p, "invitation.revoke", "invitation", inv.id, {"email": inv.email})
        db.commit()


@router.post("/invitations/accept")
def accept_invitation(body: AcceptIn, identity: Identity = Depends(get_identity), db: Session = Depends(get_db)):
    inv = db.query(Invitation).filter(Invitation.token_sha256 == _hash(body.token)).with_for_update().first()
    # One message for unknown, revoked, used, expired or wrong-recipient tokens: no oracle for guessing.
    invalid = HTTPException(404, "Invitation is invalid or has expired")
    if inv is None or inv.revoked_at or inv.accepted_at or _aware(inv.expires_at) < _now():
        raise invalid
    if identity.verified_email is None or identity.verified_email != inv.email:
        raise invalid
    org = db.get(ESGOrganization, inv.organization_id)
    if org is None or org.archived_at is not None:
        raise invalid
    if db.query(ESGMembership).filter(ESGMembership.organization_id == inv.organization_id,
                                      ESGMembership.user_sub == identity.sub).first():
        raise HTTPException(409, "You are already a member of this organization")
    m = ESGMembership(organization_id=inv.organization_id, user_sub=identity.sub, role=inv.role)
    db.add(m)
    inv.accepted_by, inv.accepted_at = identity.sub, _now()
    db.flush()
    principal = Principal(sub=identity.sub, organization_id=inv.organization_id, role=inv.role, is_demo=org.is_demo,
                          is_platform_operator=identity.is_platform_operator)
    audit(db, principal, "invitation.accept", "invitation", inv.id, {"membership_id": m.id})
    db.commit()
    return {"organization_id": org.id, "organization_name": org.name, "role": m.role}
