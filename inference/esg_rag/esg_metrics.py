"""
E/S/G metric observations (aggregated) and disclosure coverage / gap reporting.

Observations follow the activity workflow: DRAFT → SUBMITTED → APPROVED/REJECTED, reviewer ≠ creator,
approved values immutable (corrections supersede), duplicates for the same period/facility/metric/
breakdown rejected. Disclosure coverage is computed from locked GHG snapshots and approved metrics;
it is never presented as compliance.
"""
import io
import json
from decimal import Decimal
from typing import Optional

from sqlalchemy.exc import IntegrityError

from . import disclosures_catalog as dc
from .ledger import DomainError, _get, _need, _now, _open_period, _transition, audit, SafeCsvWriter
from .ledger_models import DisclosureResponse, Facility, MetricObservation, ReportingPeriod, ReportSnapshot
from .metrics_catalog import METRICS, MetricError, validate


# --- metric observations -------------------------------------------------------------------

def create_observation(db, principal, data):
    _need(principal, "write")
    if data.get("idempotency_key"):
        existing = db.query(MetricObservation).filter(MetricObservation.organization_id == principal.organization_id,
                                                      MetricObservation.idempotency_key == data["idempotency_key"]).first()
        if existing:
            return existing, False
    _open_period(db, principal, data["period_id"])
    if data.get("facility_id"):
        _get(db, Facility, principal, data["facility_id"])
    value = Decimal(str(data["value"]))
    try:
        dim_key = validate(data["metric_key"], value, data.get("dimensions") or {})
    except MetricError as e:
        raise DomainError(422, str(e))
    supersedes_id = data.get("supersedes_id")
    if supersedes_id and _get(db, MetricObservation, principal, supersedes_id).status != "APPROVED":
        raise DomainError(422, "Only an APPROVED observation can be superseded")
    clash = db.query(MetricObservation).filter(
        MetricObservation.organization_id == principal.organization_id,
        MetricObservation.period_id == data["period_id"],
        MetricObservation.metric_key == data["metric_key"],
        MetricObservation.dimension_key == dim_key,
        (MetricObservation.facility_id == data["facility_id"]) if data.get("facility_id") else MetricObservation.facility_id.is_(None),
        MetricObservation.status.notin_(("REJECTED", "SUPERSEDED")),
        *([MetricObservation.id != supersedes_id] if supersedes_id else []),
    ).first()
    if clash:
        raise DomainError(409, f"An observation for this metric, facility and breakdown already exists ({clash.id}); "
                               "supersede it instead of adding a second value.")
    obs = MetricObservation(organization_id=principal.organization_id, value=value, unit=METRICS[data["metric_key"]]["unit"],
                            dimension_key=dim_key, dimensions=data.get("dimensions") or {}, status="DRAFT",
                            created_by=principal.sub, **{k: v for k, v in data.items() if k not in ("value", "dimensions")})
    db.add(obs)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        existing = db.query(MetricObservation).filter(MetricObservation.organization_id == principal.organization_id,
                                                      MetricObservation.idempotency_key == data.get("idempotency_key")).first()
        if existing:
            return existing, False
        raise
    audit(db, principal, "metric.create", "metric_observation", obs.id, data)
    db.commit()
    return obs, True


def submit_observation(db, principal, obs_id):
    _need(principal, "write")
    obs = _get(db, MetricObservation, principal, obs_id)
    _open_period(db, principal, obs.period_id)
    if obs.status not in ("DRAFT", "REJECTED"):
        raise DomainError(409, f"Cannot submit a {obs.status} observation")
    _transition(db, principal, obs, obs.status, {"status": "SUBMITTED", "submitted_at": _now()}, "metric.submit")
    db.commit()
    db.refresh(obs)
    return obs


def review_observation(db, principal, obs_id, approve: bool, comment: Optional[str]):
    _need(principal, "review")
    obs = _get(db, MetricObservation, principal, obs_id)
    _open_period(db, principal, obs.period_id)
    if obs.created_by == principal.sub:
        raise DomainError(403, "Separation of duties: you cannot review an observation you created")
    if not approve and not (comment or "").strip():
        raise DomainError(422, "A rejection needs a comment")
    _transition(db, principal, obs, "SUBMITTED",
                {"status": "APPROVED" if approve else "REJECTED", "reviewed_by": principal.sub, "reviewed_at": _now(),
                 "review_comment": comment}, "metric.approve" if approve else "metric.reject", {"comment": comment})
    if approve and obs.supersedes_id:
        old = _get(db, MetricObservation, principal, obs.supersedes_id)
        _transition(db, principal, old, "APPROVED", {"status": "SUPERSEDED"}, "metric.superseded", {"by": obs.id})
    db.commit()
    db.refresh(obs)
    return obs


def approved_metrics(db, principal, period_id):
    return db.query(MetricObservation).filter(MetricObservation.organization_id == principal.organization_id,
                                              MetricObservation.period_id == period_id,
                                              MetricObservation.status == "APPROVED") \
        .order_by(MetricObservation.metric_key, MetricObservation.facility_id, MetricObservation.dimension_key).all()


# --- disclosures -------------------------------------------------------------------------------

def _framework(framework):
    fw = dc.FRAMEWORKS.get(framework)
    if fw is None:
        raise DomainError(404, "Unknown framework")
    return fw


def coverage(db, principal, period_id, framework):
    fw = _framework(framework)
    period = _get(db, ReportingPeriod, principal, period_id)
    snap = db.query(ReportSnapshot).filter(ReportSnapshot.organization_id == principal.organization_id,
                                           ReportSnapshot.period_id == period.id) \
        .order_by(ReportSnapshot.revision.desc()).first()
    totals = json.loads(snap.content)["totals_tco2e"] if snap else None
    metrics = {}
    for o in approved_metrics(db, principal, period.id):
        metrics.setdefault(o.metric_key, []).append(
            {"facility_id": o.facility_id, "dimensions": o.dimensions, "value": format(Decimal(o.value), "f"), "unit": o.unit,
             "observation_id": o.id})
    responses = {r.requirement_ref: r for r in db.query(DisclosureResponse).filter(
        DisclosureResponse.organization_id == principal.organization_id, DisclosureResponse.period_id == period.id,
        DisclosureResponse.framework == framework)}

    rows = []
    for req in fw["requirements"]:
        missing, evidence = [], {}
        for kind, key in req["data"]:
            if kind == "unsupported":
                missing.append(key)
            elif kind == "metric":
                if key in metrics:
                    evidence[key] = metrics[key]
                else:
                    missing.append(f"No approved '{METRICS[key]['name']}' observation for this period")
            elif kind == "ghg":
                if snap is None:
                    missing.append("No locked GHG inventory for this period")
                elif key == "methodology":
                    evidence["ghg_snapshot"] = {"snapshot_id": snap.id, "revision": snap.revision, "sha256": snap.content_sha256}
                elif key == "scope2_market" and totals["scope2_market_based"] is None:
                    missing.append("Market-based Scope 2 inputs are incomplete")
                else:
                    field = {"scope1": "scope1", "scope2_location": "scope2_location_based",
                             "scope2_market": "scope2_market_based"}[key]
                    evidence[f"{key}_tco2e"] = totals[field]
                    evidence["ghg_snapshot"] = {"snapshot_id": snap.id, "revision": snap.revision, "sha256": snap.content_sha256}
        resp = responses.get(req["ref"])
        response_status = resp.status if resp else "NOT_STARTED"
        data_status = "MISSING_DATA" if missing else ("NARRATIVE_ONLY" if not req["data"] else "AVAILABLE")
        if response_status == "NOT_APPLICABLE":
            status = "NOT_APPLICABLE"
        elif missing:
            status = "MISSING_DATA"
        else:
            status = response_status
        rows.append({
            "ref": req["ref"], "title": req["title"], "status": status, "data_status": data_status,
            "response_status": response_status, "narrative_required": req["narrative"], "missing": missing,
            "evidence": evidence, "narrative": resp.narrative if resp else None,
            "applicability_rationale": resp.applicability_rationale if resp else None,
            "updated_by": resp.updated_by if resp else None, "approved_by": resp.approved_by if resp else None,
        })
    counts = {}
    for r in rows:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    return {
        "framework": framework, "name": fw["name"], "template_version": fw["template_version"],
        "verification_status": fw["verification_status"], "materiality_perspective": fw["materiality"],
        "period": {"id": period.id, "name": period.name, "status": period.status},
        "requirements": rows, "counts": counts,
        "all_requirements_addressed": all(r["status"] in ("APPROVED", "PUBLISHED", "NOT_APPLICABLE") for r in rows),
        "statement": dc.COVERAGE_STATEMENT,
    }


def save_response(db, principal, period_id, framework, ref, data):
    """Create/update a response as DRAFT, IN_REVIEW or NOT_APPLICABLE (with rationale)."""
    _need(principal, "write")
    _framework(framework)
    if dc.requirement(framework, ref) is None:
        raise DomainError(404, "Unknown requirement")
    _get(db, ReportingPeriod, principal, period_id)
    status = data["status"]
    if status not in ("DRAFT", "IN_REVIEW", "NOT_APPLICABLE"):
        raise DomainError(422, "Status must be DRAFT, IN_REVIEW or NOT_APPLICABLE")
    if status == "NOT_APPLICABLE" and not (data.get("applicability_rationale") or "").strip():
        raise DomainError(422, "Explain why the requirement is not applicable")
    resp = db.query(DisclosureResponse).filter(
        DisclosureResponse.organization_id == principal.organization_id, DisclosureResponse.period_id == period_id,
        DisclosureResponse.framework == framework, DisclosureResponse.requirement_ref == ref).first()
    if resp and resp.status == "PUBLISHED":
        raise DomainError(409, "Published responses cannot be edited")
    before = {"status": resp.status, "narrative": resp.narrative} if resp else None
    if resp is None:
        resp = DisclosureResponse(organization_id=principal.organization_id, period_id=period_id, framework=framework,
                                  requirement_ref=ref, updated_by=principal.sub)
        db.add(resp)
    resp.status = status
    resp.narrative = data.get("narrative")
    resp.applicability_rationale = data.get("applicability_rationale")
    resp.evidence_refs = data.get("evidence_refs") or []
    resp.updated_by, resp.updated_at = principal.sub, _now()
    resp.approved_by = resp.approved_at = None
    db.flush()
    audit(db, principal, "disclosure.save", "disclosure_response", resp.id,
          {"framework": framework, "ref": ref, "before": before, "after": {"status": status, "narrative": data.get("narrative")}})
    db.commit()
    return resp


def approve_response(db, principal, period_id, framework, ref, publish=False):
    _need(principal, "admin" if publish else "review")
    row = next((r for r in coverage(db, principal, period_id, framework)["requirements"] if r["ref"] == ref), None)
    if row is None:
        raise DomainError(404, "Unknown requirement")
    resp = db.query(DisclosureResponse).filter(
        DisclosureResponse.organization_id == principal.organization_id, DisclosureResponse.period_id == period_id,
        DisclosureResponse.framework == framework, DisclosureResponse.requirement_ref == ref).first()
    if publish:
        if resp is None or resp.status != "APPROVED":
            raise DomainError(409, "Only APPROVED responses can be published")
        resp.status = "PUBLISHED"
        audit(db, principal, "disclosure.publish", "disclosure_response", resp.id, {"framework": framework, "ref": ref})
        db.commit()
        return resp
    if resp is None or resp.status != "IN_REVIEW":
        raise DomainError(409, "Only responses IN_REVIEW can be approved")
    if resp.updated_by == principal.sub:
        raise DomainError(403, "Separation of duties: the approver must differ from the last editor")
    if row["missing"]:
        raise DomainError(409, "Supporting data is missing: " + "; ".join(row["missing"]))
    if row["narrative_required"] and not (resp.narrative or "").strip():
        raise DomainError(409, "This requirement needs a narrative response")
    resp.status, resp.approved_by, resp.approved_at = "APPROVED", principal.sub, _now()
    audit(db, principal, "disclosure.approve", "disclosure_response", resp.id, {"framework": framework, "ref": ref})
    db.commit()
    return resp


def gap_report_csv(report) -> str:
    out = io.StringIO()
    w = SafeCsvWriter(out)
    w.writerow(["framework", report["name"], "template", report["template_version"], "references", report["verification_status"]])
    w.writerow(["period", report["period"]["name"], "statement", report["statement"]])
    w.writerow([])
    w.writerow(["ref", "title", "status", "data_status", "response_status", "missing"])
    for r in report["requirements"]:
        w.writerow([r["ref"], r["title"], r["status"], r["data_status"], r["response_status"], "; ".join(r["missing"])])
    return out.getvalue()
