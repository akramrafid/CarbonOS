"""
ESG accounting ledger tables (EsgBase, migrated by Alembic).

Tenant integrity is enforced in the database, not only in queries: child rows reference
(organization_id, id) of their parent through composite foreign keys, so a record can never
point at another organization's facility, period or calculation.
"""
import datetime
import uuid

from sqlalchemy import (
    JSON, Boolean, CheckConstraint, Column, Date, DateTime, ForeignKey, ForeignKeyConstraint,
    Index, Integer, Numeric, String, Text, UniqueConstraint,
)

from .database import EsgBase
from .models import ESGOrganization  # noqa: F401  (FK target on the same metadata)


def _id():
    return str(uuid.uuid4())


def _now():
    return datetime.datetime.now(datetime.timezone.utc)


def _in(column, values):
    return f"{column} IN ('" + "','".join(values) + "')"


QTY = Numeric(28, 10)
KG = Numeric(28, 6)

PERIOD_STATUSES = ("OPEN", "LOCKED")
ACTIVITY_STATUSES = ("DRAFT", "SUBMITTED", "APPROVED", "REJECTED", "SUPERSEDED")
FACTOR_STATUSES = ("DRAFT", "APPROVED", "RETIRED")
FACTOR_METHODS = ("direct", "location", "market")
SOURCE_TYPES = ("manual", "document", "csv")
BOUNDARY_METHODS = ("operational_control", "financial_control", "equity_share")


def _org_fk():
    return Column(String(36), ForeignKey("esg_organization.id", ondelete="CASCADE"), nullable=False, index=True)


class LegalEntity(EsgBase):
    __tablename__ = "esg_legal_entity"
    __table_args__ = (UniqueConstraint("organization_id", "id", name="uq_esg_legal_entity_org_id"),)

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    name = Column(String(200), nullable=False)
    country = Column(String(2), nullable=False)
    registration_number = Column(String(100))
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    archived_at = Column(DateTime(timezone=True))


class Facility(EsgBase):
    __tablename__ = "esg_facility"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_facility_org_id"),
        ForeignKeyConstraint(["organization_id", "legal_entity_id"],
                             ["esg_legal_entity.organization_id", "esg_legal_entity.id"],
                             name="fk_esg_facility_legal_entity"),
        CheckConstraint("equity_share_pct >= 0 AND equity_share_pct <= 100", name="ck_esg_facility_equity"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    legal_entity_id = Column(String(36), nullable=False)
    name = Column(String(200), nullable=False)
    country = Column(String(2), nullable=False)
    # Region code used for factor matching (e.g. a national grid). Free text, set by the org.
    grid_region = Column(String(50), nullable=False)
    address = Column(Text)
    # ponytail: ownership/control is current-state only; add dated FacilityOwnership rows when
    # customers report acquisitions/divestments inside a period.
    operational_control = Column(Boolean, nullable=False, default=True)
    financial_control = Column(Boolean, nullable=False, default=True)
    equity_share_pct = Column(Numeric(7, 4), nullable=False, default=100)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    archived_at = Column(DateTime(timezone=True))


class ReportingPeriod(EsgBase):
    __tablename__ = "esg_reporting_period"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_period_org_id"),
        UniqueConstraint("organization_id", "name", name="uq_esg_period_org_name"),
        CheckConstraint("end_date > start_date", name="ck_esg_period_dates"),
        CheckConstraint(_in("status", PERIOD_STATUSES), name="ck_esg_period_status"),
        CheckConstraint(_in("boundary_method", BOUNDARY_METHODS), name="ck_esg_period_boundary"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    boundary_method = Column(String(30), nullable=False)
    status = Column(String(10), nullable=False, default="OPEN")
    revision = Column(Integer, nullable=False, default=1)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)


class EmissionFactor(EsgBase):
    """Immutable once APPROVED; a change is a new version in the same family."""
    __tablename__ = "esg_emission_factor"
    __table_args__ = (
        UniqueConstraint("family", "version", name="uq_esg_factor_family_version"),
        CheckConstraint(_in("status", FACTOR_STATUSES), name="ck_esg_factor_status"),
        CheckConstraint(_in("method", FACTOR_METHODS), name="ck_esg_factor_method"),
        CheckConstraint("kgco2e_per_unit >= 0", name="ck_esg_factor_nonnegative"),
        CheckConstraint("valid_to IS NULL OR valid_to >= valid_from", name="ck_esg_factor_validity"),
        CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name="ck_esg_factor_dual_control"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    # NULL = platform-wide factor (created/approved by platform operators only)
    organization_id = Column(String(36), ForeignKey("esg_organization.id", ondelete="CASCADE"), index=True)
    family = Column(String(120), nullable=False, index=True)
    version = Column(Integer, nullable=False)
    activity_type = Column(String(40), nullable=False)
    unit = Column(String(10), nullable=False)
    kgco2e_per_unit = Column(QTY, nullable=False)
    region = Column(String(50), nullable=False)
    gwp_basis = Column(String(20), nullable=False)
    method = Column(String(10), nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date)
    source_publisher = Column(String(200), nullable=False)
    source_document = Column(String(300), nullable=False)
    source_url = Column(String(500))
    source_table_ref = Column(String(200))
    source_year = Column(Integer, nullable=False)
    licence_note = Column(Text)
    is_custom = Column(Boolean, nullable=False, default=False)
    status = Column(String(10), nullable=False, default="DRAFT")
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    approved_by = Column(String(255))
    approved_at = Column(DateTime(timezone=True))


class ActivityRecord(EsgBase):
    __tablename__ = "esg_activity_record"
    __table_args__ = (
        UniqueConstraint("organization_id", "idempotency_key", name="uq_esg_activity_idempotency"),
        ForeignKeyConstraint(["organization_id", "facility_id"], ["esg_facility.organization_id", "esg_facility.id"],
                             name="fk_esg_activity_facility"),
        ForeignKeyConstraint(["organization_id", "period_id"],
                             ["esg_reporting_period.organization_id", "esg_reporting_period.id"],
                             name="fk_esg_activity_period"),
        CheckConstraint(_in("status", ACTIVITY_STATUSES), name="ck_esg_activity_status"),
        CheckConstraint(_in("source_type", SOURCE_TYPES), name="ck_esg_activity_source"),
        CheckConstraint("quantity >= 0 AND quantity_raw >= 0", name="ck_esg_activity_nonnegative"),
        CheckConstraint("activity_end >= activity_start", name="ck_esg_activity_dates"),
        CheckConstraint("reviewed_by IS NULL OR reviewed_by <> created_by", name="ck_esg_activity_dual_control"),
        Index("ix_esg_activity_period_status", "organization_id", "period_id", "status"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    facility_id = Column(String(36), nullable=False)
    period_id = Column(String(36), nullable=False)
    activity_type = Column(String(40), nullable=False)
    quantity_raw = Column(QTY, nullable=False)
    unit_raw = Column(String(10), nullable=False)
    quantity = Column(QTY, nullable=False)
    unit = Column(String(10), nullable=False)
    activity_start = Column(Date, nullable=False)
    activity_end = Column(Date, nullable=False)
    meter_ref = Column(String(100))
    source_type = Column(String(10), nullable=False)
    source_document_id = Column(String(36))
    source_ref = Column(String(200))
    evidence_snippet = Column(Text)
    factor_id = Column(String(36), ForeignKey("esg_emission_factor.id"))
    market_factor_id = Column(String(36), ForeignKey("esg_emission_factor.id"))
    notes = Column(Text)
    status = Column(String(12), nullable=False, default="DRAFT")
    supersedes_id = Column(String(36), ForeignKey("esg_activity_record.id"))
    idempotency_key = Column(String(100))
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    submitted_at = Column(DateTime(timezone=True))
    reviewed_by = Column(String(255))
    reviewed_at = Column(DateTime(timezone=True))
    review_comment = Column(Text)


class CalculationRun(EsgBase):
    __tablename__ = "esg_calculation_run"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_calc_org_id"),
        ForeignKeyConstraint(["organization_id", "period_id"],
                             ["esg_reporting_period.organization_id", "esg_reporting_period.id"],
                             name="fk_esg_calc_period"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    period_id = Column(String(36), nullable=False, index=True)
    period_revision = Column(Integer, nullable=False)
    methodology_version = Column(String(50), nullable=False)
    boundary_method = Column(String(30), nullable=False)
    input_sha256 = Column(String(64), nullable=False)
    scope1_kg = Column(KG, nullable=False)
    scope2_location_kg = Column(KG, nullable=False)
    scope2_market_kg = Column(KG)
    blocking = Column(Boolean, nullable=False)
    exceptions = Column(JSON, nullable=False)
    excluded = Column(JSON, nullable=False)
    memo = Column(JSON, nullable=False)
    by_facility = Column(JSON, nullable=False)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)


class CalculationLine(EsgBase):
    __tablename__ = "esg_calculation_line"

    id = Column(Integer, primary_key=True, autoincrement=True)
    run_id = Column(String(36), ForeignKey("esg_calculation_run.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String(36), ForeignKey("esg_activity_record.id"), nullable=False)
    facility_id = Column(String(36), nullable=False)
    scope = Column(String(1), nullable=False)
    method = Column(String(10), nullable=False)
    quantity = Column(QTY, nullable=False)
    unit = Column(String(10), nullable=False)
    inclusion_share = Column(Numeric(12, 8), nullable=False)
    factor_id = Column(String(36), ForeignKey("esg_emission_factor.id"), nullable=False)
    factor_version = Column(Integer, nullable=False)
    factor_value = Column(QTY, nullable=False)
    emissions_kg = Column(KG, nullable=False)
    formula = Column(Text, nullable=False)


class ReportSnapshot(EsgBase):
    """Immutable, content-addressed record of a locked period revision."""
    __tablename__ = "esg_report_snapshot"
    __table_args__ = (
        UniqueConstraint("period_id", "revision", name="uq_esg_snapshot_period_revision"),
        ForeignKeyConstraint(["organization_id", "period_id"],
                             ["esg_reporting_period.organization_id", "esg_reporting_period.id"],
                             name="fk_esg_snapshot_period"),
        ForeignKeyConstraint(["organization_id", "calculation_run_id"],
                             ["esg_calculation_run.organization_id", "esg_calculation_run.id"],
                             name="fk_esg_snapshot_run"),
        CheckConstraint("approved_by <> prepared_by", name="ck_esg_snapshot_dual_control"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    period_id = Column(String(36), nullable=False)
    revision = Column(Integer, nullable=False)
    calculation_run_id = Column(String(36), nullable=False)
    content = Column(Text, nullable=False)  # canonical JSON, byte-for-byte what is exported
    content_sha256 = Column(String(64), nullable=False)
    prepared_by = Column(String(255), nullable=False)
    approved_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)


class AuditEvent(EsgBase):
    """Append-only: who did what, when and why. Never updated or deleted by the application."""
    __tablename__ = "esg_audit_event"
    __table_args__ = (Index("ix_esg_audit_org_time", "organization_id", "created_at"),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = Column(String(36), ForeignKey("esg_organization.id", ondelete="CASCADE"), index=True)
    actor_sub = Column(String(255), nullable=False)
    action = Column(String(60), nullable=False)
    entity_type = Column(String(40), nullable=False)
    entity_id = Column(String(36))
    data = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)


class Invitation(EsgBase):
    __tablename__ = "esg_invitation"
    __table_args__ = (UniqueConstraint("token_sha256", name="uq_esg_invitation_token"),)

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    email = Column(String(320), nullable=False)
    role = Column(String(40), nullable=False)
    token_sha256 = Column(String(64), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    invited_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    accepted_by = Column(String(255))
    accepted_at = Column(DateTime(timezone=True))
    revoked_at = Column(DateTime(timezone=True))
