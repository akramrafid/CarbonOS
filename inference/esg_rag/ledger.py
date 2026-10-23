"""
ESG ledger domain service: facilities, reporting periods, factor governance, activity workflow,
calculation runs, period locking and immutable report snapshots.

Every function takes the authenticated Principal; the organization always comes from it.
Rules live here, not in route handlers. Every state change writes an AuditEvent in the same
transaction. Raises DomainError(status, message) for the HTTP layer to translate.
"""
import csv
import datetime as dt
import hashlib
import io
import json
from decimal import Decimal
from typing import Optional

from sqlalchemy import or_, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import accounting
from .auth import Principal
from .ledger_models import (
    ActivityRecord, AuditEvent, CalculationLine, CalculationRun, EmissionFactor, Facility, LegalEntity,
    MetricObservation, ReportingPeriod, ReportSnapshot, _now,
)
from .models import ESGOrganization

REPORT_SCHEMA = "carbonos.esg.report/1"
DISCLAIMERS = [
    "Internal calculation prepared with CarbonOS. Not externally assured or verified.",
    "Scope 3 emissions are not included in this report.",
    "Emission factors are those approved by the organization or platform; see each factor's source citation.",
    "Market-based Scope 2 is reported only when every electricity record has an approved market-based input.",
]


class DomainError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


def _need(principal: Principal, permission: str):
    if not principal.can(permission):
        raise DomainError(403, f"Role '{principal.role}' lacks '{permission}' permission")


def audit(db: Session, principal: Principal, action: str, entity_type: str, entity_id: Optional[str], data=None):
    db.add(AuditEvent(organization_id=principal.organization_id, actor_sub=principal.sub, action=action,
                      entity_type=entity_type, entity_id=entity_id, data=_jsonable(data)))


def _jsonable(obj):
    return json.loads(json.dumps(obj, default=_json_default)) if obj is not None else None


def _json_default(o):
    if isinstance(o, Decimal):
        return format(o, "f")
    if isinstance(o, (dt.date, dt.datetime)):
        return o.isoformat()
    raise TypeError(type(o).__name__)


def canonical_json(obj) -> str:
    return json.dumps(obj, default=_json_default, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def row_dict(row) -> dict:
    return {c.name: getattr(row, c.name) for c in row.__table__.columns}


def _get(db: Session, model, principal: Principal, id: str):
    obj = db.query(model).filter(model.id == id, model.organization_id == principal.organization_id).first()
    if obj is None:
        raise DomainError(404, f"{model.__name__} not found")
    return obj


# --- organization structure -----------------------------------------------------------

def create_legal_entity(db, principal, data):
    _need(principal, "admin")
    le = LegalEntity(organization_id=principal.organization_id, **data)
    db.add(le)
    db.flush()
    audit(db, principal, "legal_entity.create", "legal_entity", le.id, data)
    db.commit()
    return le


def create_facility(db, principal, data):
    _need(principal, "admin")
    _get(db, LegalEntity, principal, data["legal_entity_id"])
    fac = Facility(organization_id=principal.organization_id, **data)
    db.add(fac)
    db.flush()
    audit(db, principal, "facility.create", "facility", fac.id, data)
    db.commit()
    return fac


def create_period(db, principal, data):
    _need(principal, "admin")
    if data["boundary_method"] not in accounting.BOUNDARY_METHODS:
        raise DomainError(422, "Unknown boundary method")
    if data["end_date"] <= data["start_date"]:
        raise DomainError(422, "end_date must be after start_date")
    period = ReportingPeriod(organization_id=principal.organization_id, created_by=principal.sub, **data)
    db.add(period)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise DomainError(409, "A reporting period with this name already exists")
    audit(db, principal, "period.create", "reporting_period", period.id, data)
    db.commit()
    return period


# --- emission factors ------------------------------------------------------------------

def visible_factors(db, principal):
    return db.query(EmissionFactor).filter(
        or_(EmissionFactor.organization_id == principal.organization_id, EmissionFactor.organization_id.is_(None)))


def create_factor(db, principal, data, platform_wide=False):
    """New DRAFT factor version. Organization factors are custom; platform factors need an operator."""
    if platform_wide:
        if not principal.is_platform_operator:
            raise DomainError(403, "Only platform operators may create platform-wide factors")
        org_id, family = None, f"platform:{data['family']}"
    else:
        _need(principal, "admin")
        org_id, family = principal.organization_id, f"{principal.organization_id}:{data['family']}"
    if data["activity_type"] not in accounting.ACTIVITY_TYPES:
        raise DomainError(422, "Factors apply to inventory activity types only")
    if data["unit"] != accounting.canonical_unit(data["activity_type"]):
        raise DomainError(422, f"Factor unit must be kgCO2e per {accounting.canonical_unit(data['activity_type'])}")
    scope = accounting.ACTIVITY_TYPES[data["activity_type"]][0]
    if (scope == "1") != (data["method"] == "direct"):
        raise DomainError(422, "Scope 1 factors use method 'direct'; Scope 2 factors use 'location' or 'market'")
    latest = db.query(EmissionFactor.version).filter(EmissionFactor.family == family) \
        .order_by(EmissionFactor.version.desc()).first()
    payload = {k: v for k, v in data.items() if k != "family"}
    factor = EmissionFactor(organization_id=org_id, family=family, version=(latest[0] + 1) if latest else 1,
                            is_custom=not platform_wide, status="DRAFT", created_by=principal.sub, **payload)
    db.add(factor)
    db.flush()
    audit(db, principal, "factor.create", "emission_factor", factor.id, {**data, "family": family, "version": factor.version})
    db.commit()
    return factor


def approve_factor(db, principal, factor_id):
    f = visible_factors(db, principal).filter(EmissionFactor.id == factor_id).first()
    if f is None:
        raise DomainError(404, "EmissionFactor not found")
    if f.organization_id is None and not principal.is_platform_operator:
        raise DomainError(403, "Only platform operators may approve platform-wide factors")
    if f.organization_id is not None:
        _need(principal, "admin")
    if f.created_by == principal.sub:
        raise DomainError(403, "A factor must be approved by someone other than its author")
    n = db.execute(update(EmissionFactor).where(EmissionFactor.id == f.id, EmissionFactor.status == "DRAFT")
                   .values(status="APPROVED", approved_by=principal.sub, approved_at=_now())).rowcount
    if n != 1:
        db.rollback()
        raise DomainError(409, "Only DRAFT factors can be approved")
    audit(db, principal, "factor.approve", "emission_factor", f.id)
    db.commit()
    db.refresh(f)
    return f


# --- activity records -------------------------------------------------------------------

def _open_period(db, principal, period_id):
    period = _get(db, ReportingPeriod, principal, period_id)
    if period.status != "OPEN":
        raise DomainError(409, "Reporting period is locked; restate it to make changes")
    return period


def _check_factor_ref(db, principal, factor_id, activity_type):
    if factor_id is None:
        return
    f = visible_factors(db, principal).filter(EmissionFactor.id == factor_id).first()
    if f is None or f.activity_type != activity_type:
        raise DomainError(422, "Selected factor not found for this activity type")


def _normalized(data):
    try:
        return accounting.normalize(Decimal(str(data["quantity"])), data["unit"], data["activity_type"])
    except accounting.UnitError as e:
        raise DomainError(422, str(e))


def _overlap(db, principal, rec_id, data, supersedes_id):
    # ponytail: check-then-insert; two simultaneous overlapping inserts can both pass. Upgrade path:
    # a PostgreSQL EXCLUDE constraint on (facility, activity_type, meter, daterange) when imports run in parallel.
    q = db.query(ActivityRecord).filter(
        ActivityRecord.organization_id == principal.organization_id,
        ActivityRecord.facility_id == data["facility_id"],
        ActivityRecord.activity_type == data["activity_type"],
        ActivityRecord.status.notin_(("REJECTED", "SUPERSEDED")),
        ActivityRecord.activity_start <= data["activity_end"],
        ActivityRecord.activity_end >= data["activity_start"],
        (ActivityRecord.meter_ref == data.get("meter_ref")) if data.get("meter_ref")
        else ActivityRecord.meter_ref.is_(None),
    )
    if rec_id:
        q = q.filter(ActivityRecord.id != rec_id)
    if supersedes_id:
        q = q.filter(ActivityRecord.id != supersedes_id)
    return q.first()


def create_activity(db, principal, data):
    """Create a DRAFT activity record. Overlapping records for the same facility, activity and meter
    are rejected (prevents double counting); identical idempotency keys return the original."""
    _need(principal, "write")
    if data.get("idempotency_key"):
        existing = db.query(ActivityRecord).filter(ActivityRecord.organization_id == principal.organization_id,
                                                   ActivityRecord.idempotency_key == data["idempotency_key"]).first()
        if existing:
            return existing, False
    period = _open_period(db, principal, data["period_id"])
    _get(db, Facility, principal, data["facility_id"])
    if data["activity_type"] not in accounting.ACTIVITY_TYPES and data["activity_type"] not in accounting.MEMO_ACTIVITY_TYPES:
        raise DomainError(422, "Unknown activity type")
    if data["activity_end"] < data["activity_start"]:
        raise DomainError(422, "activity_end must not be before activity_start")
    if data["activity_start"] < period.start_date or data["activity_end"] > period.end_date:
        raise DomainError(422, "Activity dates must fall inside the reporting period")
    for key in ("factor_id", "market_factor_id"):
        _check_factor_ref(db, principal, data.get(key), data["activity_type"])
    supersedes_id = data.get("supersedes_id")
    if supersedes_id:
        old = _get(db, ActivityRecord, principal, supersedes_id)
        if old.status != "APPROVED":
            raise DomainError(422, "Only an APPROVED record can be superseded")
    clash = _overlap(db, principal, None, data, supersedes_id)
    if clash:
        raise DomainError(409, f"Overlaps existing record {clash.id} for the same facility, activity and meter "
                               "(possible double counting). Use a different meter reference or supersede it.")

    quantity = _normalized(data)
    rec = ActivityRecord(
        organization_id=principal.organization_id, quantity_raw=Decimal(str(data["quantity"])), unit_raw=data["unit"],
        quantity=quantity, unit=accounting.canonical_unit(data["activity_type"]), status="DRAFT",
        created_by=principal.sub,
        **{k: v for k, v in data.items() if k not in ("quantity", "unit")},
    )
    db.add(rec)
    try:
        db.flush()
    except IntegrityError:  # concurrent retry with the same idempotency key
        db.rollback()
        existing = db.query(ActivityRecord).filter(ActivityRecord.organization_id == principal.organization_id,
                                                   ActivityRecord.idempotency_key == data.get("idempotency_key")).first()
        if existing:
            return existing, False
        raise
    audit(db, principal, "activity.create", "activity_record", rec.id, data)
    db.commit()
    return rec, True


def update_activity(db, principal, rec_id, data):
    _need(principal, "write")
    rec = _get(db, ActivityRecord, principal, rec_id)
    if rec.status not in ("DRAFT", "REJECTED"):
        raise DomainError(409, f"{rec.status} records cannot be edited; create a superseding record instead")
    _open_period(db, principal, rec.period_id)
    before = row_dict(rec)
    merged = {**{k: before[k] for k in ("facility_id", "activity_type", "activity_start", "activity_end", "meter_ref")},
              "quantity": before["quantity_raw"], "unit": before["unit_raw"], **data}
    clash = _overlap(db, principal, rec.id, merged, rec.supersedes_id)
    if clash:
        raise DomainError(409, f"Overlaps existing record {clash.id}")
    for key in ("factor_id", "market_factor_id"):
        if key in data:
            _check_factor_ref(db, principal, data[key], merged["activity_type"])
    rec.quantity = _normalized(merged)
    rec.quantity_raw, rec.unit_raw = Decimal(str(merged["quantity"])), merged["unit"]
    for k, v in data.items():
        if k not in ("quantity", "unit"):
            setattr(rec, k, v)
    rec.status = "DRAFT"
    audit(db, principal, "activity.update", "activity_record", rec.id,
          {"before": {k: before[k] for k in data if k in before} | {"quantity_raw": before["quantity_raw"], "unit_raw": before["unit_raw"]},
           "after": data})
    db.commit()
    return rec


def _transition(db, principal, rec, from_status, values, action, data=None):
    """Conditional status change: concurrent callers cannot both succeed (second gets 409)."""
    model = type(rec)
    n = db.execute(update(model).where(model.id == rec.id, model.status == from_status).values(**values)).rowcount
    if n != 1:
        db.rollback()
        raise DomainError(409, f"Record is no longer {from_status}")
    audit(db, principal, action, model.__tablename__.removeprefix("esg_"), rec.id, data)


def submit_activity(db, principal, rec_id):
    _need(principal, "write")
    rec = _get(db, ActivityRecord, principal, rec_id)
    _open_period(db, principal, rec.period_id)
    if rec.status not in ("DRAFT", "REJECTED"):
        raise DomainError(409, f"Cannot submit a {rec.status} record")
    _transition(db, principal, rec, rec.status, {"status": "SUBMITTED", "submitted_at": _now()}, "activity.submit")
    db.commit()
    db.refresh(rec)
    return rec


def review_activity(db, principal, rec_id, approve: bool, comment: Optional[str]):
    _need(principal, "review")
    rec = _get(db, ActivityRecord, principal, rec_id)
    _open_period(db, principal, rec.period_id)
    if rec.created_by == principal.sub:
        raise DomainError(403, "Separation of duties: you cannot review a record you created")
    if not approve and not (comment or "").strip():
        raise DomainError(422, "A rejection needs a comment")
    _transition(db, principal, rec, "SUBMITTED",
                {"status": "APPROVED" if approve else "REJECTED", "reviewed_by": principal.sub,
                 "reviewed_at": _now(), "review_comment": comment},
                "activity.approve" if approve else "activity.reject", {"comment": comment})
    if approve and rec.supersedes_id:
        db.execute(update(ActivityRecord).where(ActivityRecord.id == rec.supersedes_id,
                                                ActivityRecord.status == "APPROVED").values(status="SUPERSEDED"))
        audit(db, principal, "activity.superseded", "activity_record", rec.supersedes_id, {"by": rec.id})
    db.commit()
    db.refresh(rec)
    return rec


# --- calculation, locking, snapshots ----------------------------------------------------------

def _calc_inputs(db, principal, period):
    acts = db.query(ActivityRecord).filter(ActivityRecord.organization_id == principal.organization_id,
                                           ActivityRecord.period_id == period.id,
                                           ActivityRecord.status == "APPROVED").order_by(ActivityRecord.id).all()
    facs = db.query(Facility).filter(Facility.organization_id == principal.organization_id).order_by(Facility.id).all()
    factors = visible_factors(db, principal).filter(EmissionFactor.status == "APPROVED").order_by(EmissionFactor.id).all()
    return acts, facs, factors


def _approved_metric_ids(db, principal, period):
    return [m.id for m in db.query(MetricObservation.id).filter(
        MetricObservation.organization_id == principal.organization_id, MetricObservation.period_id == period.id,
        MetricObservation.status == "APPROVED").order_by(MetricObservation.id)]


def _input_hash(period, acts, facs, factors, metric_ids=()) -> str:
    payload = {
        "methodology": accounting.METHODOLOGY_VERSION,
        "boundary": period.boundary_method,
        "activities": [[a.id, a.facility_id, a.activity_type, a.quantity, a.unit, a.activity_start, a.activity_end,
                        a.factor_id, a.market_factor_id] for a in acts],
        "facilities": [[f.id, f.grid_region, f.operational_control, f.financial_control, f.equity_share_pct] for f in facs],
        "factors": [[f.id, f.version, f.kgco2e_per_unit, f.status] for f in factors],
        "metrics": list(metric_ids),  # approved E/S/G observations are immutable, so ids identify them
    }
    return hashlib.sha256(canonical_json(payload).encode()).hexdigest()


def calculate_period(db, principal, period_id):
    _need(principal, "write")
    period = _open_period(db, principal, period_id)
    acts, facs, factors = _calc_inputs(db, principal, period)
    result = accounting.calculate(
        [accounting.Activity(a.id, a.facility_id, a.activity_type, Decimal(a.quantity), a.unit, a.activity_start,
                             a.activity_end, a.factor_id, a.market_factor_id) for a in acts],
        {f.id: accounting.Facility(f.id, f.grid_region, f.operational_control, f.financial_control,
                                   Decimal(f.equity_share_pct), f.legal_entity_id) for f in facs},
        [accounting.Factor(f.id, f.version, f.family, f.activity_type, f.unit, Decimal(f.kgco2e_per_unit), f.region,
                           f.gwp_basis, f.method, f.valid_from, f.valid_to) for f in factors],
        period.boundary_method,
    )
    run = CalculationRun(
        organization_id=principal.organization_id, period_id=period.id, period_revision=period.revision,
        methodology_version=result.methodology_version, boundary_method=result.boundary_method,
        input_sha256=_input_hash(period, acts, facs, factors, _approved_metric_ids(db, principal, period)),
        scope1_kg=result.scope1_kg,
        scope2_location_kg=result.scope2_location_kg, scope2_market_kg=result.scope2_market_kg,
        blocking=result.blocking, exceptions=result.exceptions, excluded=result.excluded,
        memo=_jsonable(result.memo), by_facility=_jsonable(result.by_facility), created_by=principal.sub,
    )
    db.add(run)
    db.flush()
    for line in result.lines:
        db.add(CalculationLine(run_id=run.id, **line.__dict__))
    audit(db, principal, "calculation.run", "calculation_run", run.id,
          {"period_id": period.id, "blocking": result.blocking, "input_sha256": run.input_sha256})
    db.commit()
    return run


def lock_period(db, principal, period_id, run_id):
    """Lock with an up-to-date, exception-free run prepared by someone else; writes the snapshot."""
    _need(principal, "admin")
    period = _open_period(db, principal, period_id)
    run = _get(db, CalculationRun, principal, run_id)
    if run.period_id != period.id or run.period_revision != period.revision:
        raise DomainError(409, "Calculation run does not belong to the current period revision")
    pending = db.query(ActivityRecord).filter(ActivityRecord.organization_id == principal.organization_id,
                                              ActivityRecord.period_id == period.id,
                                              ActivityRecord.status.in_(("DRAFT", "SUBMITTED"))).count()
    pending += db.query(MetricObservation).filter(MetricObservation.organization_id == principal.organization_id,
                                                  MetricObservation.period_id == period.id,
                                                  MetricObservation.status.in_(("DRAFT", "SUBMITTED"))).count()
    if pending:
        raise DomainError(409, f"{pending} activity record(s) or metric observation(s) are still DRAFT or SUBMITTED")
    if run.blocking:
        raise DomainError(409, "Calculation has blocking data-quality exceptions")
    if _input_hash(period, *_calc_inputs(db, principal, period), _approved_metric_ids(db, principal, period)) != run.input_sha256:
        raise DomainError(409, "Data or factors changed since this calculation; recalculate before locking")
    if run.created_by == principal.sub:
        raise DomainError(403, "Separation of duties: the approver must differ from the preparer of the calculation")

    n = db.execute(update(ReportingPeriod).where(ReportingPeriod.id == period.id, ReportingPeriod.status == "OPEN",
                                                 ReportingPeriod.revision == period.revision)
                   .values(status="LOCKED")).rowcount
    if n != 1:
        db.rollback()
        raise DomainError(409, "Period was locked or restated concurrently")
    content = canonical_json(_report_content(db, principal, period, run))
    snap = ReportSnapshot(organization_id=principal.organization_id, period_id=period.id, revision=period.revision,
                          calculation_run_id=run.id, content=content,
                          content_sha256=hashlib.sha256(content.encode()).hexdigest(),
                          prepared_by=run.created_by, approved_by=principal.sub)
    db.add(snap)
    db.flush()
    audit(db, principal, "period.lock", "reporting_period", period.id,
          {"snapshot_id": snap.id, "revision": period.revision, "content_sha256": snap.content_sha256})
    db.commit()
    return snap


def restate_period(db, principal, period_id, reason):
    _need(principal, "admin")
    if not (reason or "").strip():
        raise DomainError(422, "A restatement needs a reason")
    period = _get(db, ReportingPeriod, principal, period_id)
    n = db.execute(update(ReportingPeriod).where(ReportingPeriod.id == period.id, ReportingPeriod.status == "LOCKED",
                                                 ReportingPeriod.revision == period.revision)
                   .values(status="OPEN", revision=period.revision + 1)).rowcount
    if n != 1:
        db.rollback()
        raise DomainError(409, "Only a LOCKED period can be restated")
    audit(db, principal, "period.restate", "reporting_period", period.id,
          {"reason": reason, "previous_revision": period.revision})
    db.commit()
    db.refresh(period)
    return period


def _t(kg):
    return None if kg is None else accounting.to_tonnes(Decimal(kg))


def _report_content(db, principal, period, run):
    org = db.get(ESGOrganization, principal.organization_id)
    lines = db.query(CalculationLine).filter(CalculationLine.run_id == run.id).order_by(CalculationLine.id).all()
    factor_ids = sorted({l.factor_id for l in lines})
    factors = db.query(EmissionFactor).filter(EmissionFactor.id.in_(factor_ids)).order_by(EmissionFactor.id).all() if factor_ids else []
    facilities = {f.id: f for f in db.query(Facility).filter(Facility.organization_id == principal.organization_id)}
    return {
        "schema": REPORT_SCHEMA,
        "organization": {"id": org.id, "name": org.name},
        "period": {"id": period.id, "name": period.name, "start_date": period.start_date, "end_date": period.end_date,
                   "boundary_method": period.boundary_method, "revision": period.revision},
        "methodology_version": run.methodology_version,
        "calculation_run_id": run.id,
        "input_sha256": run.input_sha256,
        "prepared_by": run.created_by,
        "approved_by": principal.sub,
        "totals_tco2e": {
            "scope1": _t(run.scope1_kg),
            "scope2_location_based": _t(run.scope2_location_kg),
            "scope2_market_based": _t(run.scope2_market_kg),
            "scope2_market_based_status": "COMPLETE" if run.scope2_market_kg is not None else "MISSING_INPUTS",
            "scope3": None,
            "scope3_status": "NOT_INCLUDED",
        },
        "by_facility": [{"facility_id": fid, "facility_name": facilities[fid].name if fid in facilities else None,
                         **{k: _t(v) for k, v in vals.items()}} for fid, vals in sorted(run.by_facility.items())],
        "lines": [{k: getattr(l, k) for k in ("activity_id", "facility_id", "scope", "method", "quantity", "unit",
                                              "inclusion_share", "factor_id", "factor_version", "factor_value",
                                              "emissions_kg", "formula")} for l in lines],
        "factors_used": [{k: getattr(f, k) for k in ("id", "family", "version", "activity_type", "unit",
                                                     "kgco2e_per_unit", "region", "gwp_basis", "method",
                                                     "source_publisher", "source_document", "source_url",
                                                     "source_table_ref", "source_year", "is_custom", "approved_by")}
                         for f in factors],
        "esg_metrics": [{"metric_key": m.metric_key, "facility_id": m.facility_id, "dimensions": m.dimensions,
                         "value": m.value, "unit": m.unit, "observation_id": m.id, "approved_by": m.reviewed_by}
                        for m in db.query(MetricObservation).filter(
                            MetricObservation.organization_id == principal.organization_id,
                            MetricObservation.period_id == period.id, MetricObservation.status == "APPROVED")
                        .order_by(MetricObservation.metric_key, MetricObservation.id)],
        "exceptions": run.exceptions,
        "excluded": run.excluded,
        "memo_items": run.memo,
        "disclaimers": DISCLAIMERS,
    }


class SafeCsvWriter:
    """csv.writer that neutralises spreadsheet formula injection: text cells starting with
    = + - @ (or tab/CR) are prefixed with an apostrophe so spreadsheets treat them as text."""

    def __init__(self, out):
        self._w = csv.writer(out, lineterminator="\n")

    def writerow(self, row):
        self._w.writerow([f"'{v}" if isinstance(v, str) and v[:1] in ("=", "+", "-", "@", "\t", "\r") else v
                          for v in row])


def export_snapshot(snap: ReportSnapshot, fmt: str) -> str:
    if fmt == "json":
        return snap.content
    if fmt != "csv":
        raise DomainError(422, "format must be json or csv")
    c = json.loads(snap.content)
    out = io.StringIO()
    w = SafeCsvWriter(out)
    w.writerow(["organization", c["organization"]["name"]])
    w.writerow(["period", c["period"]["name"], c["period"]["start_date"], c["period"]["end_date"]])
    w.writerow(["boundary_method", c["period"]["boundary_method"], "revision", c["period"]["revision"]])
    w.writerow(["methodology_version", c["methodology_version"], "snapshot_sha256", snap.content_sha256])
    w.writerow(["prepared_by", c["prepared_by"], "approved_by", c["approved_by"]])
    for k, v in c["totals_tco2e"].items():
        w.writerow(["total_tco2e", k, "" if v is None else v])
    w.writerow([])
    cols = ["activity_id", "facility_id", "scope", "method", "quantity", "unit", "inclusion_share", "factor_id",
            "factor_version", "factor_value", "emissions_kg", "formula"]
    w.writerow(cols)
    for line in c["lines"]:
        w.writerow([line[k] for k in cols])
    w.writerow([])
    for d in c["disclaimers"]:
        w.writerow(["disclaimer", d])
    return out.getvalue()
