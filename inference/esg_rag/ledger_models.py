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
FACTOR_KINDS = ("grid_average", "grid_combined_margin", "supplier_specific", "residual_mix")
DATA_QUALITY_GRADES = ("metered", "billed", "estimated", "default")
SOURCE_TYPES = ("manual", "document", "csv")
BOUNDARY_METHODS = ("operational_control", "financial_control", "equity_share")
EQUIPMENT_KINDS = ("generator", "refrigeration")
EQUIPMENT_EVENT_TYPES = ("install", "retire", "recharge")
BILL_DEFINITION_STATUSES = ("DRAFT", "APPROVED", "RETIRED")
BILL_STATUSES = ("UNKNOWN_PROFILE", "AMBIGUOUS_PROFILE", "EXTRACTED", "POSTED")
BILL_SOURCES = ("pdf_text", "ocr", "manual")
BILL_VALUE_STATUSES = ("extracted", "confirmed", "corrected", "rejected", "unmapped", "derived", "superseded")


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


class Equipment(EsgBase):
    """Facility asset register: captive generators and refrigeration / air-conditioning units. The reference is
    unique per facility, so 'G1' at two factories is two assets (generator fuel and output link through it)."""
    __tablename__ = "esg_equipment"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_equipment_org_id"),
        UniqueConstraint("facility_id", "equipment_ref", name="uq_esg_equipment_facility_ref"),
        ForeignKeyConstraint(["organization_id", "facility_id"], ["esg_facility.organization_id", "esg_facility.id"],
                             name="fk_esg_equipment_facility"),
        CheckConstraint(_in("kind", EQUIPMENT_KINDS), name="ck_esg_equipment_kind"),
        CheckConstraint("kind = 'generator' OR fuel IS NULL", name="ck_esg_equipment_fuel"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    facility_id = Column(String(36), nullable=False)
    equipment_ref = Column(String(100), nullable=False)
    kind = Column(String(20), nullable=False)
    description = Column(Text)
    fuel = Column(String(20))  # generators only: diesel, natural_gas, furnace_oil, ...
    rated_kw = Column(Numeric(12, 3))
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)


class EquipmentEvent(EsgBase):
    """Dated register event for a refrigeration unit: install (full charge of one gas), retire (whole unit) or
    recharge (kg added after a leak). Append-only: a wrong event is voided with a reason, never edited or deleted."""
    __tablename__ = "esg_equipment_event"
    __table_args__ = (
        ForeignKeyConstraint(["organization_id", "equipment_id"], ["esg_equipment.organization_id", "esg_equipment.id"],
                             name="fk_esg_equipment_event_equipment"),
        CheckConstraint(_in("event_type", EQUIPMENT_EVENT_TYPES), name="ck_esg_equipment_event_type"),
        CheckConstraint("(event_type = 'retire' AND refrigerant IS NULL AND charge_kg IS NULL) OR "
                        "(event_type <> 'retire' AND refrigerant IS NOT NULL AND charge_kg > 0)",
                        name="ck_esg_equipment_event_charge"),
        CheckConstraint("voided_at IS NULL OR void_reason IS NOT NULL", name="ck_esg_equipment_event_void"),
        Index("ix_esg_equipment_event_equipment", "equipment_id", "event_date"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    equipment_id = Column(String(36), nullable=False)
    event_type = Column(String(10), nullable=False)
    event_date = Column(Date, nullable=False)
    refrigerant = Column(String(30))  # install / recharge only
    charge_kg = Column(KG)  # install: full charge of this gas in the unit; recharge: kg added
    source_ref = Column(String(200))
    evidence_snippet = Column(Text)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    voided_at = Column(DateTime(timezone=True))
    voided_by = Column(String(255))
    void_reason = Column(Text)


class GasCertificate(EsgBase):
    """A distributor's gas-analysis certificate for one facility, kept as evidence with its validity period.
    Once a second person approves it, it is the facility's heating value for natural gas used inside that period."""
    __tablename__ = "esg_gas_certificate"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_gas_certificate_org_id"),
        ForeignKeyConstraint(["organization_id", "facility_id"], ["esg_facility.organization_id", "esg_facility.id"],
                             name="fk_esg_gas_certificate_facility"),
        CheckConstraint(_in("status", FACTOR_STATUSES), name="ck_esg_gas_certificate_status"),
        CheckConstraint("valid_to >= valid_from", name="ck_esg_gas_certificate_validity"),
        CheckConstraint("gcv_mj_per_m3 > 0 AND ncv_to_gcv > 0 AND ncv_to_gcv <= 1", name="ck_esg_gas_certificate_values"),
        CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name="ck_esg_gas_certificate_dual_control"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    facility_id = Column(String(36), nullable=False)
    distributor = Column(String(100), nullable=False)
    certificate_ref = Column(String(200), nullable=False)
    gcv_mj_per_m3 = Column(Numeric(18, 8), nullable=False)
    ncv_to_gcv = Column(Numeric(7, 6), nullable=False)
    reference_conditions = Column(String(100), nullable=False)
    valid_from = Column(Date, nullable=False)
    valid_to = Column(Date, nullable=False)
    uncertainty_pct = Column(Numeric(12, 6))
    source_document_id = Column(String(36))
    evidence_snippet = Column(Text)
    status = Column(String(10), nullable=False, default="DRAFT")
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    approved_by = Column(String(255))
    approved_at = Column(DateTime(timezone=True))


class ReportingPeriod(EsgBase):
    __tablename__ = "esg_reporting_period"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_period_org_id"),
        UniqueConstraint("organization_id", "name", name="uq_esg_period_org_name"),
        CheckConstraint("end_date > start_date", name="ck_esg_period_dates"),
        CheckConstraint(_in("status", PERIOD_STATUSES), name="ck_esg_period_status"),
        CheckConstraint(_in("boundary_method", BOUNDARY_METHODS), name="ck_esg_period_boundary"),
        CheckConstraint("gwp_basis IS NULL OR gwp_basis IN ('AR5','AR6')", name="ck_esg_period_gwp_basis"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    boundary_method = Column(String(30), nullable=False)
    # Inventory GWP basis; factors on another basis block (MIXED_GWP_BASIS). NULL = period created before 0004.
    gwp_basis = Column(String(10))
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
        CheckConstraint("factor_kind IS NULL OR " + _in("factor_kind", FACTOR_KINDS), name="ck_esg_factor_kind"),
        # Location-based Scope 2 is the grid AVERAGE rate; a CDM combined margin is never a Scope 2 factor.
        CheckConstraint("NOT (factor_kind = 'grid_combined_margin' AND method IN ('location','market'))",
                        name="ck_esg_factor_no_margin_scope2"),
        CheckConstraint("NOT (activity_type = 'electricity' AND method = 'location' AND factor_kind <> 'grid_average')",
                        name="ck_esg_factor_location_grid_average"),
        CheckConstraint("method <> 'direct' OR factor_kind IS NULL", name="ck_esg_factor_direct_kind"),
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
    # NULL only on rows created before migration 0003; new Scope 2 electricity factors must declare it.
    factor_kind = Column(String(30))
    # Gas-level factor: [{"gas": "CO2", "kg_per_unit": "56.1", "uncertainty_pct": "3.92"}, ...]. kgco2e_per_unit is
    # then computed from it with gwp_basis by the service. NULL = a CO2e-only factor.
    gas_components = Column(JSON)
    uncertainty_pct = Column(Numeric(12, 6))  # 95 % half-width in %, for CO2e-only factors
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
        CheckConstraint("data_quality IS NULL OR " + _in("data_quality", DATA_QUALITY_GRADES),
                        name="ck_esg_activity_data_quality"),
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
    data_quality = Column(String(12))  # metered / billed / estimated / default
    uncertainty_pct = Column(Numeric(12, 6))  # activity data, 95 % half-width in %
    generator_ref = Column(String(100))  # esg_equipment ref at this facility: links generator fuel and output
    heating_value = Column(JSON)  # natural gas: gcv_mj_per_m3, ncv_to_gcv, reference_conditions, source, ...
    volume_correction = Column(QTY)  # billed m3 → m3 at the heating value's reference conditions
    refrigerant = Column(String(30))
    # refrigerant kg: stored_start/end, purchased, returned_or_sold, plus the register's equipment_charge_start/end
    mass_balance = Column(JSON)
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
    gwp_basis = Column(String(10))
    uncertainty = Column(JSON)  # IPCC Approach 1 summary per total
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
    factor_id = Column(String(36), ForeignKey("esg_emission_factor.id"))  # NULL for GWP-based refrigerant lines
    factor_version = Column(Integer)
    factor_value = Column(QTY, nullable=False)
    emissions_kg = Column(KG, nullable=False)
    formula = Column(Text, nullable=False)
    data_quality = Column(String(12))
    uncertainty_pct = Column(Numeric(12, 6))
    factor_ref = Column(String(200))  # e.g. "IPCC AR6 GWP-100 R-410A" when there is no factor row
    details = Column(JSON)  # heating value conversion, gas breakdown, mass balance


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


class MetricObservation(EsgBase):
    """Aggregated E/S/G figure for a period (optionally a facility), with evidence and review."""
    __tablename__ = "esg_metric_observation"
    __table_args__ = (
        UniqueConstraint("organization_id", "idempotency_key", name="uq_esg_metric_idempotency"),
        ForeignKeyConstraint(["organization_id", "period_id"],
                             ["esg_reporting_period.organization_id", "esg_reporting_period.id"],
                             name="fk_esg_metric_period"),
        ForeignKeyConstraint(["organization_id", "facility_id"], ["esg_facility.organization_id", "esg_facility.id"],
                             name="fk_esg_metric_facility"),
        CheckConstraint(_in("status", ACTIVITY_STATUSES), name="ck_esg_metric_status"),
        CheckConstraint("value >= 0", name="ck_esg_metric_nonnegative"),
        CheckConstraint("reviewed_by IS NULL OR reviewed_by <> created_by", name="ck_esg_metric_dual_control"),
        Index("ix_esg_metric_period_key", "organization_id", "period_id", "metric_key"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    period_id = Column(String(36), nullable=False)
    facility_id = Column(String(36))  # NULL = organization-wide figure
    metric_key = Column(String(60), nullable=False)
    dimensions = Column(JSON, nullable=False, default=dict)
    dimension_key = Column(String(300), nullable=False, default="")
    value = Column(QTY, nullable=False)
    unit = Column(String(20), nullable=False)
    source_document_id = Column(String(36))
    evidence_ref = Column(String(200))
    evidence_snippet = Column(Text)
    notes = Column(Text)
    status = Column(String(12), nullable=False, default="DRAFT")
    supersedes_id = Column(String(36), ForeignKey("esg_metric_observation.id"))
    idempotency_key = Column(String(100))
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    submitted_at = Column(DateTime(timezone=True))
    reviewed_by = Column(String(255))
    reviewed_at = Column(DateTime(timezone=True))
    review_comment = Column(Text)


class DisclosureResponse(EsgBase):
    __tablename__ = "esg_disclosure_response"
    __table_args__ = (
        UniqueConstraint("organization_id", "period_id", "framework", "requirement_ref", name="uq_esg_disclosure_response"),
        ForeignKeyConstraint(["organization_id", "period_id"],
                             ["esg_reporting_period.organization_id", "esg_reporting_period.id"],
                             name="fk_esg_disclosure_period"),
        CheckConstraint("status IN ('NOT_STARTED','NOT_APPLICABLE','DRAFT','IN_REVIEW','APPROVED','PUBLISHED')",
                        name="ck_esg_disclosure_status"),
        CheckConstraint("status <> 'NOT_APPLICABLE' OR applicability_rationale IS NOT NULL", name="ck_esg_disclosure_rationale"),
        CheckConstraint("approved_by IS NULL OR approved_by <> updated_by", name="ck_esg_disclosure_dual_control"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    period_id = Column(String(36), nullable=False)
    framework = Column(String(30), nullable=False)
    requirement_ref = Column(String(60), nullable=False)
    status = Column(String(15), nullable=False, default="NOT_STARTED")
    narrative = Column(Text)
    applicability_rationale = Column(Text)
    evidence_refs = Column(JSON, nullable=False, default=list)
    updated_by = Column(String(255), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    approved_by = Column(String(255))
    approved_at = Column(DateTime(timezone=True))


class BillParameter(EsgBase):
    """A versioned bill parameter definition (one per field key). Immutable once APPROVED; a change is a new
    version, approved by someone other than its author. NULL organization = platform-wide."""
    __tablename__ = "esg_bill_parameter"
    __table_args__ = (
        UniqueConstraint("organization_id", "key", "version", name="uq_esg_bill_parameter_version"),
        CheckConstraint(_in("status", BILL_DEFINITION_STATUSES), name="ck_esg_bill_parameter_status"),
        CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name="ck_esg_bill_parameter_dual_control"),
        Index("ix_esg_bill_parameter_key", "key", "version"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = Column(String(36), ForeignKey("esg_organization.id", ondelete="CASCADE"), index=True)
    key = Column(String(100), nullable=False)
    version = Column(Integer, nullable=False)
    definition = Column(JSON, nullable=False)
    content_sha256 = Column(String(64), nullable=False)
    status = Column(String(10), nullable=False, default="DRAFT")
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    approved_by = Column(String(255))
    approved_at = Column(DateTime(timezone=True))


class BillProfile(EsgBase):
    """A versioned, self-contained bill profile (issuer, document type, layout). A bill keeps the version it was
    read with. Two-person approval; NULL organization = platform-wide."""
    __tablename__ = "esg_bill_profile"
    __table_args__ = (
        UniqueConstraint("organization_id", "profile_key", "version", name="uq_esg_bill_profile_version"),
        CheckConstraint(_in("status", BILL_DEFINITION_STATUSES), name="ck_esg_bill_profile_status"),
        CheckConstraint("approved_by IS NULL OR approved_by <> created_by", name="ck_esg_bill_profile_dual_control"),
        CheckConstraint("effective_to IS NULL OR effective_to >= effective_from", name="ck_esg_bill_profile_dates"),
        Index("ix_esg_bill_profile_key", "profile_key", "version"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = Column(String(36), ForeignKey("esg_organization.id", ondelete="CASCADE"), index=True)
    profile_key = Column(String(80), nullable=False)
    version = Column(Integer, nullable=False)
    issuer = Column(String(100), nullable=False)
    document_type = Column(String(30), nullable=False)
    layout_version = Column(String(100), nullable=False)
    effective_from = Column(Date, nullable=False)
    effective_to = Column(Date)
    definition = Column(JSON, nullable=False)  # expanded rules + parameter snapshot (bill_profiles.validate_profile)
    content_sha256 = Column(String(64), nullable=False)
    status = Column(String(10), nullable=False, default="DRAFT")
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    approved_by = Column(String(255))
    approved_at = Column(DateTime(timezone=True))


class Bill(EsgBase):
    """An uploaded bill: the document's words (for re-reading), the profile version it was read with and its
    current validation findings. UNKNOWN_PROFILE / AMBIGUOUS_PROFILE bills wait for a person to route them."""
    __tablename__ = "esg_bill"
    __table_args__ = (
        UniqueConstraint("organization_id", "id", name="uq_esg_bill_org_id"),
        ForeignKeyConstraint(["organization_id", "facility_id"], ["esg_facility.organization_id", "esg_facility.id"],
                             name="fk_esg_bill_facility"),
        CheckConstraint(_in("status", BILL_STATUSES), name="ck_esg_bill_status"),
        CheckConstraint(_in("source", BILL_SOURCES), name="ck_esg_bill_source"),
        Index("ix_esg_bill_org_facility", "organization_id", "facility_id"),
    )

    id = Column(String(36), primary_key=True, default=_id)
    organization_id = _org_fk()
    facility_id = Column(String(36), nullable=False)
    profile_id = Column(String(36), ForeignKey("esg_bill_profile.id"))
    profile_key = Column(String(80))
    profile_version = Column(Integer)
    status = Column(String(20), nullable=False)
    source = Column(String(10), nullable=False)
    filename = Column(String(255))
    document_sha256 = Column(String(64), nullable=False)
    document = Column(JSON, nullable=False)  # pages of words with boxes, so the bill can be re-read
    findings = Column(JSON, nullable=False, default=list)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    posted_by = Column(String(255))
    posted_at = Column(DateTime(timezone=True))


class BillValue(EsgBase):
    """One extracted, derived or unmapped value: long-form, with its evidence (page, box, raw text) and its review
    status. confidence is NULL unless it was measured. Rows are never deleted: re-reading supersedes them."""
    __tablename__ = "esg_bill_value"
    __table_args__ = (
        ForeignKeyConstraint(["organization_id", "bill_id"], ["esg_bill.organization_id", "esg_bill.id"],
                             name="fk_esg_bill_value_bill"),
        CheckConstraint(_in("status", BILL_VALUE_STATUSES), name="ck_esg_bill_value_status"),
        CheckConstraint(_in("source", BILL_SOURCES + ("derived",)), name="ck_esg_bill_value_source"),
        CheckConstraint("status NOT IN ('confirmed','corrected','rejected') OR confirmed_by IS NOT NULL",
                        name="ck_esg_bill_value_reviewer"),
        CheckConstraint("status = 'unmapped' OR status = 'superseded' OR parameter_key IS NOT NULL",
                        name="ck_esg_bill_value_key"),
        Index("ix_esg_bill_value_bill", "bill_id"),
        Index("ix_esg_bill_value_key", "organization_id", "parameter_key", "status"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    organization_id = _org_fk()
    bill_id = Column(String(36), nullable=False)
    parameter_key = Column(String(100))  # NULL = UNMAPPED candidate
    profile_version = Column(Integer)
    group_index = Column(String(200), nullable=False, default="")
    raw_text = Column(Text)
    value_text = Column(String(500))  # normalised value in the canonical unit (decimal, ISO date, text, true/false)
    unit = Column(String(30))
    page = Column(Integer)
    bbox = Column(JSON)
    source = Column(String(10), nullable=False)
    status = Column(String(12), nullable=False)
    confidence = Column(Numeric(6, 5))
    extracted_value_text = Column(String(500))  # what extraction read, kept when a person corrects it
    review_comment = Column(Text)
    confirmed_by = Column(String(255))
    confirmed_at = Column(DateTime(timezone=True))
    activity_id = Column(String(36), ForeignKey("esg_activity_record.id"))  # ledger record this value created
    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
