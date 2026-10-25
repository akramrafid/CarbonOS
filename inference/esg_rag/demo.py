"""
No-login ephemeral demo session and synthetic benchmark seed data.

Allows immediate, zero-friction exploration of the ESG workspace (/platform/esg)
without user registration or external identity provider configuration.
Full tenant isolation is strictly preserved: each demo session receives an
ephemeral, server-generated tenant (ESGOrganization.is_demo=True) with signed JWTs.
Tenant IDs and roles are NEVER accepted from client input.
"""
import datetime
import logging
import uuid
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .auth import Principal, get_access_mode, get_identity, get_principal, mint_token, require
from .database import get_db
from .ledger_models import (
    ActivityRecord,
    AuditEvent,
    CalculationLine,
    CalculationRun,
    EmissionFactor,
    Facility,
    LegalEntity,
    MetricObservation,
    ReportSnapshot,
    ReportingPeriod,
)
from .models import ESGMembership, ESGOrganization

log = logging.getLogger("esg.demo")

router = APIRouter(prefix="/demo", tags=["ESG No-Login Demo"])


def seed_demo_organization(
    db: Session,
    sub: str,
    org_name: str = "Demo Enterprise [SAMPLE DATA]",
    org_id: Optional[str] = None,
) -> dict:
    """
    Seeds a self-contained, realistic demonstration tenant with synthetic
    Bangladesh manufacturing/garments benchmark records. All records are
    explicitly tagged as sample/demo data.
    """
    # 1. Organization & Memberships (Submitter + Reviewer persona simulation)
    reviewer_sub = f"{sub}-reviewer"
    if org_id:
        org = db.query(ESGOrganization).filter(ESGOrganization.id == org_id, ESGOrganization.is_demo.is_(True)).first()
        if not org:
            org = ESGOrganization(id=org_id, name=org_name, is_demo=True, created_by_sub=sub)
            db.add(org)
        else:
            org.name = org_name
    else:
        org = ESGOrganization(name=org_name, is_demo=True, created_by_sub=sub)
        db.add(org)
    db.flush()

    # Submitter is org_owner; Reviewer persona is auditor for separation-of-duties demo
    m_owner = ESGMembership(organization_id=org.id, user_sub=sub, role="org_owner")
    m_reviewer = ESGMembership(organization_id=org.id, user_sub=reviewer_sub, role="auditor")
    db.add_all([m_owner, m_reviewer])
    db.flush()

    # 2. Legal Entity
    entity = LegalEntity(
        organization_id=org.id,
        name="Dhaka Apparel Mills Ltd [SAMPLE DATA]",
        country="BD",
        registration_number="C-145892/DEMO",
    )
    db.add(entity)
    db.flush()

    # 3. Facility
    facility = Facility(
        organization_id=org.id,
        legal_entity_id=entity.id,
        name="Savar Spinning Unit 1 [SAMPLE DATA]",
        country="BD",
        grid_region="BD-NATIONAL-GRID",
        address="Plot 42-45, Baipail Industrial Area, Savar, Dhaka",
        operational_control=True,
        financial_control=True,
        equity_share_pct=Decimal("100.0000"),
    )
    db.add(facility)
    db.flush()

    # 4. Reporting Period (FY2024-25)
    period = ReportingPeriod(
        organization_id=org.id,
        name="FY2024-25 [SAMPLE DATA]",
        start_date=datetime.date(2024, 7, 1),
        end_date=datetime.date(2025, 6, 30),
        boundary_method="operational_control",
        status="OPEN",
        revision=1,
        created_by=sub,
    )
    db.add(period)
    db.flush()

    # 5. Emission Factors (Approved standard benchmarks)
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    org_suffix = org.id[:8]

    # Factor A: Bangladesh National Grid 2023
    factor_grid = EmissionFactor(
        organization_id=org.id,
        family=f"grid-electricity-bd-{org_suffix}",
        version=1,
        activity_type="electricity_grid",
        unit="kWh",
        kgco2e_per_unit=Decimal("0.6400000000"),
        region="BD-NATIONAL-GRID",
        gwp_basis="AR5",
        method="location",
        valid_from=datetime.date(2024, 1, 1),
        source_publisher="Department of Environment, Bangladesh / IEA",
        source_document="Grid Emission Factor of Bangladesh 2023 Study",
        source_url="http://doe.gov.bd/reports/grid-ef-2023.pdf",
        source_year=2023,
        status="APPROVED",
        is_custom=False,
        created_by="system_demo_seed",
        approved_by="system_demo_approver",
        approved_at=now_utc,
    )

    # Factor B: Stationary Generator Diesel (IPCC 2006)
    factor_diesel = EmissionFactor(
        organization_id=org.id,
        family=f"diesel-stationary-bd-{org_suffix}",
        version=1,
        activity_type="diesel_generator",
        unit="liter",
        kgco2e_per_unit=Decimal("2.6800000000"),
        region="GLOBAL",
        gwp_basis="AR5",
        method="direct",
        valid_from=datetime.date(2024, 1, 1),
        source_publisher="IPCC Guidelines for National GHG Inventories",
        source_document="2006 IPCC Guidelines for National Greenhouse Gas Inventories, Vol 2 Energy",
        source_url="https://www.ipcc-nggip.iges.or.jp/public/2006gl/",
        source_year=2006,
        status="APPROVED",
        is_custom=False,
        created_by="system_demo_seed",
        approved_by="system_demo_approver",
        approved_at=now_utc,
    )

    # Factor C: Boiler Natural Gas (IPCC 2006)
    factor_gas = EmissionFactor(
        organization_id=org.id,
        family=f"natural-gas-boiler-bd-{org_suffix}",
        version=1,
        activity_type="natural_gas_boiler",
        unit="m3",
        kgco2e_per_unit=Decimal("2.0200000000"),
        region="GLOBAL",
        gwp_basis="AR5",
        method="direct",
        valid_from=datetime.date(2024, 1, 1),
        source_publisher="IPCC Guidelines for National GHG Inventories",
        source_document="2006 IPCC Guidelines for National Greenhouse Gas Inventories, Vol 2 Energy",
        source_year=2006,
        status="APPROVED",
        is_custom=False,
        created_by="system_demo_seed",
        approved_by="system_demo_approver",
        approved_at=now_utc,
    )
    db.add_all([factor_grid, factor_diesel, factor_gas])
    db.flush()

    # 6. Sample Activity Records
    # Activity 1: Grid Electricity - APPROVED (ready for calculation)
    act_elec = ActivityRecord(
        organization_id=org.id,
        facility_id=facility.id,
        period_id=period.id,
        activity_type="electricity_grid",
        quantity_raw=Decimal("125000.0000000000"),
        unit_raw="kWh",
        quantity=Decimal("125000.0000000000"),
        unit="kWh",
        activity_start=datetime.date(2024, 7, 1),
        activity_end=datetime.date(2024, 9, 30),
        meter_ref="BREB-HT-0492",
        source_type="manual",
        source_ref="BREB Utility Bill Q1 FY25 #4819",
        evidence_snippet="Billed electricity consumption: 125,000 kWh at Savar Spinning Unit 1",
        factor_id=factor_grid.id,
        status="APPROVED",
        idempotency_key=f"demo-act-grid-{org.id}",
        created_by="system_demo_seed",
        reviewed_by="system_demo_approver",
        reviewed_at=now_utc,
    )

    # Activity 2: Diesel Fuel - SUBMITTED (ready for reviewer approval demonstration)
    act_diesel = ActivityRecord(
        organization_id=org.id,
        facility_id=facility.id,
        period_id=period.id,
        activity_type="diesel_generator",
        quantity_raw=Decimal("4500.0000000000"),
        unit_raw="liter",
        quantity=Decimal("4500.0000000000"),
        unit="liter",
        activity_start=datetime.date(2024, 7, 1),
        activity_end=datetime.date(2024, 9, 30),
        meter_ref="GENSET-SAVAR-01",
        source_type="manual",
        source_ref="Bulk Diesel Delivery Slip #8824",
        evidence_snippet="Generator fuel dispatch: 4,500 liters for emergency power during grid outage",
        factor_id=factor_diesel.id,
        status="SUBMITTED",
        idempotency_key=f"demo-act-diesel-{org.id}",
        created_by=sub,
        submitted_at=now_utc,
    )
    db.add_all([act_elec, act_diesel])
    db.flush()

    # 7. Sample ESG Metric Observations
    obs_water = MetricObservation(
        organization_id=org.id,
        period_id=period.id,
        facility_id=facility.id,
        metric_key="water_withdrawal",
        dimensions={"source": "groundwater"},
        dimension_key="source=groundwater",
        value=Decimal("3500.0000000000"),
        unit="m3",
        evidence_ref="Deep Tubewell Flowmeter Log Q1-FY25",
        evidence_snippet="Quarterly abstraction: 3,500 m3 groundwater",
        status="APPROVED",
        idempotency_key=f"demo-obs-water-{org.id}",
        created_by="system_demo_seed",
        reviewed_by="system_demo_approver",
        reviewed_at=now_utc,
    )

    obs_workers = MetricObservation(
        organization_id=org.id,
        period_id=period.id,
        facility_id=facility.id,
        metric_key="employees_headcount",
        dimensions={"gender": "female"},
        dimension_key="gender=female",
        value=Decimal("420"),
        unit="people",
        evidence_ref="HR Payroll Register September 2024",
        evidence_snippet="Headcount: 420 female workers of 680 total plant staff",
        status="APPROVED",
        idempotency_key=f"demo-obs-female-workers-{org.id}",
        created_by="system_demo_seed",
        reviewed_by="system_demo_approver",
        reviewed_at=now_utc,
    )

    obs_gov = MetricObservation(
        organization_id=org.id,
        period_id=period.id,
        facility_id=None,
        metric_key="anti_bribery_policy",
        dimensions={},
        dimension_key="",
        value=Decimal("1"),
        unit="yes/no",
        evidence_ref="Corporate Governance Manual Section 4.2",
        evidence_snippet="Board-approved anti-bribery and whistleblowing code active",
        status="APPROVED",
        idempotency_key=f"demo-obs-anti-bribery-{org.id}",
        created_by="system_demo_seed",
        reviewed_by="system_demo_approver",
        reviewed_at=now_utc,
    )
    db.add_all([obs_water, obs_workers, obs_gov])
    db.commit()

    return {
        "organization_id": org.id,
        "organization_name": org.name,
        "facility_id": facility.id,
        "period_id": period.id,
        "sub": sub,
        "reviewer_sub": reviewer_sub,
    }


def clean_demo_organization(db: Session, org_id: str, delete_org: bool = True):
    """Safely cascades all records belonging to a demo tenant."""
    org = db.query(ESGOrganization).filter(ESGOrganization.id == org_id, ESGOrganization.is_demo.is_(True)).first()
    if not org:
        return
    # Delete child records in dependency order
    run_ids = [r.id for r in db.query(CalculationRun.id).filter(CalculationRun.organization_id == org_id).all()]
    if run_ids:
        db.query(CalculationLine).filter(CalculationLine.run_id.in_(run_ids)).delete(synchronize_session=False)
    db.query(CalculationRun).filter(CalculationRun.organization_id == org_id).delete(synchronize_session=False)
    db.query(ReportSnapshot).filter(ReportSnapshot.organization_id == org_id).delete(synchronize_session=False)
    db.query(AuditEvent).filter(AuditEvent.organization_id == org_id).delete(synchronize_session=False)
    db.query(MetricObservation).filter(MetricObservation.organization_id == org_id).delete(synchronize_session=False)
    db.query(ActivityRecord).filter(ActivityRecord.organization_id == org_id).delete(synchronize_session=False)
    db.query(EmissionFactor).filter(EmissionFactor.organization_id == org_id).delete(synchronize_session=False)
    db.query(ReportingPeriod).filter(ReportingPeriod.organization_id == org_id).delete(synchronize_session=False)
    db.query(Facility).filter(Facility.organization_id == org_id).delete(synchronize_session=False)
    db.query(LegalEntity).filter(LegalEntity.organization_id == org_id).delete(synchronize_session=False)
    db.query(ESGMembership).filter(ESGMembership.organization_id == org_id).delete(synchronize_session=False)
    if delete_org:
        db.delete(org)
    db.commit()


@router.get("/status")
def demo_status():
    """Returns whether demo mode is enabled on this deployment."""
    mode = get_access_mode()
    return {
        "access_mode": mode,
        "demo_enabled": mode in ("isolated_demo", "local_dev"),
        "label": "DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED",
    }


@router.post("/session")
def create_demo_session(request: Request, db: Session = Depends(get_db)):
    """
    Public unauthenticated bootstrap endpoint for zero-friction demo access.
    Only active when ESG_ACCESS_MODE is isolated_demo or local_dev.
    Returns signed short-lived JWT tokens for an isolated demo tenant.
    """
    mode = get_access_mode()
    if mode not in ("isolated_demo", "local_dev"):
        raise HTTPException(403, "Demo session provisioning is disabled on this deployment.")

    sub = f"demo-{uuid.uuid4().hex[:12]}"
    reviewer_sub = f"{sub}-reviewer"

    seeded = seed_demo_organization(db, sub=sub)

    # 2-hour short-lived tokens
    token = mint_token(sub=sub, exp_seconds=7200, is_demo=True, email_verified=False)
    reviewer_token = mint_token(sub=reviewer_sub, exp_seconds=7200, is_demo=True, email_verified=False)

    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=7200)

    log.info("Provisioned isolated demo tenant org_id=%s sub=%s", seeded["organization_id"], sub)

    return {
        "access_token": token,
        "token": token,
        "token_type": "bearer",
        "expires_in": 7200,
        "tenant_id": seeded["organization_id"],
        "organization_id": seeded["organization_id"],
        "organization_name": seeded["organization_name"],
        "role": "org_owner",
        "reviewer_token": reviewer_token,
        "reviewer_role": "auditor",
        "is_demo": True,
        "expires_at": expires_at.isoformat(),
        "personas": {
            "owner": {
                "sub": sub,
                "role": "org_owner",
                "token": token,
            },
            "reviewer": {
                "sub": reviewer_sub,
                "role": "auditor",
                "token": reviewer_token,
            },
        },
        "seed_summary": seeded,
        "disclaimer": "DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED. Dual-control approval simulation available via reviewer persona.",
    }


@router.post("/reset")
def reset_demo_session(
    principal: Principal = Depends(require("admin")),
    db: Session = Depends(get_db),
):
    """
    Safely resets a demo organization's records back to initial benchmark fixtures.
    Strictly forbidden on non-demo production tenants.
    """
    if not principal.is_demo:
        raise HTTPException(403, "Reset operation is restricted to demo workspaces.")

    clean_demo_organization(db, principal.organization_id, delete_org=False)

    # Re-seed under the same demo organization for this principal
    seeded = seed_demo_organization(db, sub=principal.sub, org_id=principal.organization_id)

    token = mint_token(sub=principal.sub, exp_seconds=7200, is_demo=True)
    reviewer_sub = f"{principal.sub}-reviewer"
    reviewer_token = mint_token(sub=reviewer_sub, exp_seconds=7200, is_demo=True)
    expires_at = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(seconds=7200)

    log.info("Reset demo tenant org=%s sub=%s", principal.organization_id, principal.sub)

    return {
        "access_token": token,
        "token": token,
        "token_type": "bearer",
        "expires_in": 7200,
        "tenant_id": seeded["organization_id"],
        "organization_id": seeded["organization_id"],
        "organization_name": seeded["organization_name"],
        "role": "org_owner",
        "reviewer_token": reviewer_token,
        "reviewer_role": "auditor",
        "is_demo": True,
        "expires_at": expires_at.isoformat(),
        "personas": {
            "owner": {
                "sub": principal.sub,
                "role": "org_owner",
                "token": token,
            },
            "reviewer": {
                "sub": reviewer_sub,
                "role": "auditor",
                "token": reviewer_token,
            },
        },
        "seed_summary": seeded,
        "disclaimer": "DEMO WORKSPACE — SAMPLE DATA / NOT ASSURED. Dual-control approval simulation available via reviewer persona.",
    }

