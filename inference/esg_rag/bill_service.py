"""
Bill service: versioned parameter definitions and profiles (two-person approval, like factors), bill upload and
extraction, a person's review of every value, analysis on any parameter, and posting confirmed consumption values
to the GHG ledger as DRAFT activity records (which then need their own independent review).

Every function takes the authenticated Principal; the organization always comes from it. Platform-wide
definitions (organization NULL) are created and approved by platform operators only.
"""
import datetime as dt
import hashlib
from decimal import Decimal, localcontext
from typing import Dict, List, Optional, Sequence

from sqlalchemy import or_, update

from . import bill_extract as bx
from . import bill_profiles as bp
from . import bill_rules
from . import ledger
from .ledger import DomainError, _get, _jsonable, _need, audit
from .ledger_models import Bill, BillParameter, BillProfile, BillValue, Facility, _now

MAX_PAGES, MAX_WORDS = 20, 20000
WIDE_PRECISION = 80  # digits for sums and averages of bill values (each value has at most 30 characters)
MALFORMED = (TypeError, AttributeError, KeyError, ValueError, RecursionError)  # wrong shapes in submitted YAML
LIVE = ("extracted", "confirmed", "corrected")  # values validation reads
REVIEWED = ("confirmed", "corrected")
ANALYSED = ("confirmed", "corrected", "derived")
DIMENSIONS = ("organization", "facility", "meter", "band", "period")
EMPTY_PROFILE = {"parameters": {}, "groups": {"bill": None}, "fields": [], "tables": [], "sections": {},
                 "rules": [], "derived": []}


# --- shared ------------------------------------------------------------------------------------

def _scope(principal, platform_wide: bool) -> Optional[str]:
    if platform_wide:
        if not principal.is_platform_operator:
            raise DomainError(403, "Only platform operators may create platform-wide definitions")
        return None
    _need(principal, "admin")
    return principal.organization_id


def _visible(model, principal):
    return or_(model.organization_id == principal.organization_id, model.organization_id.is_(None))


def _same_scope(model, org):
    return model.organization_id.is_(None) if org is None else model.organization_id == org


def _text(v) -> Optional[str]:
    if v is None:
        return None
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, Decimal):
        if v.as_tuple().exponent < -10:
            with localcontext() as ctx:
                ctx.prec = WIDE_PRECISION
                v = v.quantize(Decimal("0.0000000001"))
        return format(v, "f")
    if isinstance(v, dt.date):
        return v.isoformat()
    return str(v)[:500]


def _parse(text: Optional[str], p: bp.Parameter):
    if text is None:
        return None
    if p.dtype in bp.NUMERIC:
        return Decimal(text)
    if p.dtype == "date":
        return dt.date.fromisoformat(text)
    if p.dtype == "boolean":
        return text == "true"
    return text


def _latest_per_key(rows, keyattr):
    """Latest version per key; an organization's own definition shadows a platform-wide one."""
    best = {}
    for r in rows:
        k = getattr(r, keyattr)
        rank = (r.organization_id is not None, r.version)
        if k not in best or rank > (best[k].organization_id is not None, best[k].version):
            best[k] = r
    return best


# --- parameter definitions and profiles --------------------------------------------------------

def _chain(group, groups) -> List[str]:
    out = []
    while group is not None:
        out.append(group)
        group = groups[group]
    return out


def _visible_parameters(db, principal, platform_only: bool = False):
    """Latest parameter definitions visible to the principal; platform_only for platform-wide profiles, so that a
    shared profile never snapshots one organization's own definitions."""
    scope = BillParameter.organization_id.is_(None) if platform_only else _visible(BillParameter, principal)
    rows = db.query(BillParameter).filter(scope, BillParameter.status != "RETIRED").all()
    latest = _latest_per_key(rows, "key")
    params, groups = {}, {"bill": None}
    for key, row in latest.items():
        d = dict(row.definition)
        chain = d.pop("group_chain")
        params[key] = bp.parameter_from_dict(d)
        for child, parent in zip(chain, chain[1:] + [None]):
            groups[child] = parent
    return params, groups, latest


def load_parameters(db, principal, yaml_text: str, platform_wide: bool = False) -> List[BillParameter]:
    """New DRAFT versions for definitions that changed; unchanged definitions return their latest version."""
    org = _scope(principal, platform_wide)
    try:
        params, groups = bp.parse_parameters(bp.load_yaml(yaml_text))
    except bp.ProfileError as e:
        raise DomainError(422, str(e))
    except MALFORMED as e:
        raise DomainError(422, f"Malformed parameter definitions ({type(e).__name__})")
    _, known_groups, _ = _visible_parameters(db, principal)
    clash = [g for g, parent in groups.items() if g in known_groups and known_groups[g] != parent]
    if clash:
        raise DomainError(409, f"Group parent differs from the existing definition: {', '.join(clash)}")
    out = []
    for p in params.values():
        definition = {**p.as_dict(), "group_chain": _chain(p.group, groups)}
        sha = bp.content_sha256(definition)
        latest = db.query(BillParameter).filter(_same_scope(BillParameter, org), BillParameter.key == p.key) \
            .order_by(BillParameter.version.desc()).first()
        if latest is not None and latest.content_sha256 == sha:
            out.append(latest)
            continue
        row = BillParameter(organization_id=org, key=p.key, version=(latest.version + 1) if latest else 1,
                            definition=definition, content_sha256=sha, status="DRAFT", created_by=principal.sub)
        db.add(row)
        db.flush()
        audit(db, principal, "bill_parameter.create", "bill_parameter", row.id, {"key": p.key, "version": row.version})
        out.append(row)
    db.commit()
    return out


def _rulesets_for(doc, params, groups) -> Dict[str, dict]:
    """The repository rule sets a profile references, compiled against the visible parameter definitions."""
    names = set(doc.get("rulesets") or [])
    all_sets = bp.load_yaml((bp.PROFILE_DIR / "rulesets.yaml").read_text(encoding="utf-8"))
    chosen = {"schema": all_sets["schema"], "rulesets": {n: b for n, b in all_sets["rulesets"].items() if n in names}}
    return bp.parse_rulesets(chosen, params, groups)


def load_profiles(db, principal, yaml_text: str, platform_wide: bool = False) -> List[BillProfile]:
    """New DRAFT profile versions (self-contained: rule sets expanded, parameter definitions snapshotted)."""
    org = _scope(principal, platform_wide)
    params, groups, rows = _visible_parameters(db, principal, platform_only=platform_wide)
    out = []
    try:
        docs = bp.profile_documents(bp.load_yaml(yaml_text))
        definitions = [bp.validate_profile(d, params, groups, _rulesets_for(d, params, groups)) for d in docs]
    except bp.ProfileError as e:
        raise DomainError(422, str(e))
    except MALFORMED as e:
        raise DomainError(422, f"Malformed profile ({type(e).__name__})")
    for defn in definitions:
        defn["parameter_versions"] = {k: {"id": rows[k].id, "version": rows[k].version} for k in defn["parameters"]}
        sha = bp.content_sha256(defn)
        latest = db.query(BillProfile).filter(_same_scope(BillProfile, org), BillProfile.profile_key == defn["profile_key"]) \
            .order_by(BillProfile.version.desc()).first()
        if latest is not None and latest.content_sha256 == sha:
            out.append(latest)
            continue
        row = BillProfile(organization_id=org, profile_key=defn["profile_key"], version=(latest.version + 1) if latest else 1,
                          issuer=defn["issuer"], document_type=defn["document_type"],
                          layout_version=defn["layout_version"],
                          effective_from=dt.date.fromisoformat(defn["effective_from"]),
                          effective_to=dt.date.fromisoformat(defn["effective_to"]) if defn["effective_to"] else None,
                          definition=_jsonable(defn), content_sha256=sha, status="DRAFT", created_by=principal.sub)
        db.add(row)
        db.flush()
        audit(db, principal, "bill_profile.create", "bill_profile", row.id,
              {"profile_key": row.profile_key, "version": row.version, "content_sha256": sha})
        out.append(row)
    db.commit()
    return out


def load_repository_definitions(db, principal) -> dict:
    """Platform-wide DRAFT versions of the repository's parameters and seed profiles (operators only)."""
    params_yaml = (bp.PROFILE_DIR / "parameters.yaml").read_text(encoding="utf-8")
    parameters = load_parameters(db, principal, params_yaml, platform_wide=True)
    profiles = []
    for path in sorted((bp.PROFILE_DIR / "seed").glob("*.yaml")):
        profiles += load_profiles(db, principal, path.read_text(encoding="utf-8"), platform_wide=True)
    return {"parameters": len(parameters), "profiles": len(profiles)}


def approve_definition(db, principal, model, row_id: str):
    """Second-person approval of a parameter or profile version. A profile needs its parameters approved first."""
    row = db.query(model).filter(model.id == row_id, _visible(model, principal)).first()
    if row is None:
        raise DomainError(404, f"{model.__name__} not found")
    if row.organization_id is None and not principal.is_platform_operator:
        raise DomainError(403, "Only platform operators may approve platform-wide definitions")
    if row.organization_id is not None:
        _need(principal, "admin")
    if row.created_by == principal.sub:
        raise DomainError(403, "A definition must be approved by someone other than its author")
    if model is BillProfile:
        versions = row.definition.get("parameter_versions") or {}
        approved = {r.id for r in db.query(BillParameter.id).filter(
            BillParameter.id.in_([v["id"] for v in versions.values()]), BillParameter.status == "APPROVED")}
        pending = sorted(k for k, v in versions.items() if v["id"] not in approved)
        if pending:
            raise DomainError(409, f"Approve these parameter definitions first: {', '.join(pending)}")
    n = db.execute(update(model).where(model.id == row.id, model.status == "DRAFT")
                   .values(status="APPROVED", approved_by=principal.sub, approved_at=_now())).rowcount
    if n != 1:
        db.rollback()
        raise DomainError(409, "Only DRAFT definitions can be approved")
    entity = model.__tablename__.removeprefix("esg_")
    audit(db, principal, f"{entity}.approve", entity, row.id)
    db.commit()
    db.refresh(row)
    return row


# --- bills --------------------------------------------------------------------------------------

def _document_json(doc: bx.Document) -> dict:
    return {"source": doc.source, "pages": [{"words": [{"text": w.text, "bbox": list(w.bbox), "confidence": w.confidence}
                                                       for w in page.words]} for page in doc.pages]}


def _approved_profiles(db, principal) -> List[BillProfile]:
    rows = db.query(BillProfile).filter(_visible(BillProfile, principal), BillProfile.status == "APPROVED").all()
    return list(_latest_per_key(rows, "profile_key").values())


def _value_row(bill: Bill, r: bx.Extracted, profile_version) -> BillValue:
    return BillValue(organization_id=bill.organization_id, bill_id=bill.id, parameter_key=r.key,
                     profile_version=profile_version, group_index=r.group_index, raw_text=r.raw_text[:4000],
                     value_text=_text(r.value), unit=r.unit, page=r.page, bbox=list(r.bbox) if r.bbox else None,
                     source=r.source, status=r.status,
                     confidence=Decimal(str(round(r.confidence, 5))) if r.confidence is not None else None)


def check_upload(db, principal, facility_id: str) -> None:
    """Role and facility, checked before a file is parsed (parsing is the expensive part)."""
    _need(principal, "write")
    _get(db, Facility, principal, facility_id)


def create_bill(db, principal, facility_id: str, doc: bx.Document, filename: Optional[str] = None,
                profile_id: Optional[str] = None) -> Bill:
    """Store the document's words, detect the profile among APPROVED versions (or use the one a person chose),
    extract long-form values and validate them. No profile → UNKNOWN_PROFILE, all numbers kept as candidates."""
    _need(principal, "write")
    _get(db, Facility, principal, facility_id)
    if len(doc.pages) > MAX_PAGES or sum(len(p.words) for p in doc.pages) > MAX_WORDS:
        raise DomainError(422, f"A bill may have at most {MAX_PAGES} pages and {MAX_WORDS} words")
    document = _document_json(doc)
    bill = Bill(organization_id=principal.organization_id, facility_id=facility_id, status="UNKNOWN_PROFILE",
                source=doc.source, filename=(filename or "")[:255] or None,
                document_sha256=hashlib.sha256(bp.canonical_json(document).encode()).hexdigest(),
                document=document, findings=[], created_by=principal.sub)
    db.add(bill)
    db.flush()
    _read(db, principal, bill, doc, profile_id)
    audit(db, principal, "bill.create", "bill", bill.id, {"status": bill.status, "profile_key": bill.profile_key,
                                                          "profile_version": bill.profile_version,
                                                          "document_sha256": bill.document_sha256})
    db.commit()
    return bill


def _read(db, principal, bill: Bill, doc: bx.Document, profile_id: Optional[str]):
    profile = None
    if profile_id:
        profile = db.query(BillProfile).filter(BillProfile.id == profile_id, _visible(BillProfile, principal),
                                               BillProfile.status != "RETIRED").first()
        if profile is None:
            raise DomainError(404, "Bill profile not found")
        status = "EXTRACTED"
    else:
        candidates = _approved_profiles(db, principal)
        status, ids = bx.detect(doc, [(p.id, p.definition) for p in candidates])
        if status == "MATCHED":
            profile, status = next(p for p in candidates if p.id == ids[0]), "EXTRACTED"
    bill.status = status
    bill.profile_id = profile.id if profile else None
    bill.profile_key = profile.profile_key if profile else None
    bill.profile_version = profile.version if profile else None
    for r in bx.extract(doc, profile.definition if profile else EMPTY_PROFILE):
        db.add(_value_row(bill, r, bill.profile_version))
    db.flush()
    _refresh(db, principal, bill)


def _bill_rows(db, bill) -> List[BillValue]:
    return db.query(BillValue).filter(BillValue.bill_id == bill.id, BillValue.status != "superseded") \
        .order_by(BillValue.id).all()


def _extracted(values: Sequence[BillValue], params) -> List[bx.Extracted]:
    return [bx.Extracted(v.parameter_key, v.group_index, v.raw_text or "", _parse(v.value_text, params[v.parameter_key]),
                         v.unit, v.page, tuple(v.bbox) if v.bbox else None, v.source)
            for v in values if v.status in LIVE and v.parameter_key in params]


def _refresh(db, principal, bill: Bill):
    """Recompute derived values (updated in place) and findings from the bill's current values."""
    profile = db.get(BillProfile, bill.profile_id) if bill.profile_id else None
    if profile is None:
        bill.findings = [{"code": bill.status, "blocking": True, "group_index": "", "rule": bill.status,
                          "detail": "No approved profile matches this document: a person must assign one"}]
        return
    values = _bill_rows(db, bill)
    params = bx.profile_parameters(profile.definition)
    rows = _extracted(values, params)
    derived, findings = bx.evaluate_bill(rows, profile.definition)
    current = {(v.parameter_key, v.group_index): v for v in values if v.status == "derived"}
    for d in derived:
        row = current.pop((d.key, d.group_index), None)
        if row is None:
            db.add(_value_row(bill, d, profile.version))
        else:
            row.value_text, row.raw_text = _text(d.value), d.raw_text
    for stale in current.values():
        stale.status = "superseded"
    end = next((r.value for r in rows if r.key == "period.end" and r.group_index == ""), None)
    if isinstance(end, dt.date) and not (profile.effective_from <= end <= (profile.effective_to or end)):
        findings.append({"code": "PROFILE_NOT_EFFECTIVE", "blocking": True, "group_index": "", "rule": "profile",
                         "detail": f"{profile.profile_key} v{profile.version} is valid {profile.effective_from} to "
                                   f"{profile.effective_to or 'open'}; the bill ends {end}"})
    if profile.status != "APPROVED":
        findings.append({"code": "PROFILE_NOT_APPROVED", "blocking": False, "group_index": "", "rule": "profile",
                         "detail": f"{profile.profile_key} v{profile.version} is {profile.status}: values can be "
                                   "reviewed, but the bill cannot be posted to the ledger until a second person "
                                   "approves the profile"})
    findings += _period_findings(db, principal, bill, rows)
    bill.findings = _jsonable(findings)


def _bill_period(rows) -> tuple:
    def get(k):
        return next((r.value for r in rows if r.key == k and r.group_index == "" and r.value is not None), None)
    return get("account.number"), get("period.start"), get("period.end")


def _period_findings(db, principal, bill, rows) -> List[dict]:
    """Overlap / gap against the other bills of the same profile and account."""
    account, start, end = _bill_period(rows)
    if not (account and isinstance(start, dt.date) and isinstance(end, dt.date)):
        return []
    others = db.query(Bill).filter(Bill.organization_id == principal.organization_id, Bill.id != bill.id,
                                   Bill.profile_key == bill.profile_key, Bill.status.in_(("EXTRACTED", "POSTED"))).all()
    identity = (bill.profile_key, account)
    series = [(identity, start, end)]
    for other in others:
        profile = db.get(BillProfile, other.profile_id)
        a, s, e = _bill_period(_extracted(_bill_rows(db, other), bx.profile_parameters(profile.definition)))
        if a == account and isinstance(s, dt.date) and isinstance(e, dt.date):
            series.append((identity, s, e))
    return [f for f in bx.period_findings(series) if str(start) in f["detail"] or str(end) in f["detail"]]


def _bill_profile_params(db, principal, bill) -> Dict[str, bp.Parameter]:
    profile = db.get(BillProfile, bill.profile_id) if bill.profile_id else None
    visible, _, _ = _visible_parameters(db, principal)
    return {**visible, **(bx.profile_parameters(profile.definition) if profile else {})}  # the bill's snapshot wins


def bill_detail(db, principal, bill_id: str) -> dict:
    _need(principal, "read")
    bill = _get(db, Bill, principal, bill_id)
    return {"bill": bill, "values": _bill_rows(db, bill)}


def _editable_value(db, principal, value_id: int):
    _need(principal, "write")
    v = db.query(BillValue).filter(BillValue.id == value_id, BillValue.organization_id == principal.organization_id).first()
    if v is None:
        raise DomainError(404, "Bill value not found")
    bill = _get(db, Bill, principal, v.bill_id)
    if bill.status == "POSTED":
        raise DomainError(409, "The bill is posted to the ledger; its values are frozen")
    return v, bill


def review_value(db, principal, value_id: int, action: str, value: Optional[str] = None,
                 unit: Optional[str] = None, comment: Optional[str] = None) -> BillValue:
    """confirm / correct / reject one extracted value. A person does this for every value before posting."""
    v, bill = _editable_value(db, principal, value_id)
    if v.status not in ("extracted", "confirmed", "corrected", "rejected"):
        raise DomainError(409, f"A {v.status} value cannot be reviewed here")
    if action == "confirm":
        if v.value_text is None:
            raise DomainError(422, "Nothing was read for this value: correct it with the value printed on the bill")
        v.status = "confirmed"
    elif action == "correct":
        if not (value or "").strip():
            raise DomainError(422, "A correction needs the value printed on the bill")
        p = _bill_profile_params(db, principal, bill)[v.parameter_key]
        allowed = tuple(p.allowed_units) + ((p.canonical_unit,) if p.canonical_unit else ())
        if unit is not None and unit not in allowed:
            raise DomainError(422, f"{p.key}: unit must be one of {', '.join(allowed) or 'none (no unit)'}")
        try:
            normalised, canonical = bx.normalise(p, value, unit)
        except (bx.BillParseError, ValueError, ArithmeticError, TypeError, AttributeError) as e:
            raise DomainError(422, f"{p.key}: {e}")
        if v.extracted_value_text is None:
            v.extracted_value_text = v.value_text
        v.value_text, v.unit, v.status = _text(normalised), canonical, "corrected"
    elif action == "reject":
        v.status = "rejected"
    else:
        raise DomainError(422, "action must be confirm, correct or reject")
    v.confirmed_by, v.confirmed_at, v.review_comment = principal.sub, _now(), comment
    db.flush()
    _refresh(db, principal, bill)
    audit(db, principal, f"bill_value.{action}", "bill_value", str(v.id), {"value": v.value_text, "comment": comment})
    db.commit()
    db.refresh(v)
    return v


def map_value(db, principal, value_id: int, parameter_key: str, group_index: str = "") -> BillValue:
    """A person maps an UNMAPPED candidate to a parameter (and confirms it)."""
    v, bill = _editable_value(db, principal, value_id)
    if v.status != "unmapped":
        raise DomainError(409, "Only UNMAPPED candidates can be mapped")
    params = _bill_profile_params(db, principal, bill)
    if parameter_key not in params or params[parameter_key].derived:
        raise DomainError(422, f"Unknown or derived parameter '{parameter_key}'")
    p = params[parameter_key]
    if bx.group_of(group_index) != p.group:
        raise DomainError(422, f"{parameter_key} belongs to group '{p.group}'; give a matching group_index")
    try:
        normalised, canonical = bx.normalise(p, v.value_text or "", None)
    except (bx.BillParseError, ValueError, ArithmeticError) as e:
        raise DomainError(422, f"{parameter_key}: {e}")
    v.parameter_key, v.group_index, v.value_text, v.unit = p.key, group_index, _text(normalised), canonical
    v.status, v.confirmed_by, v.confirmed_at = "confirmed", principal.sub, _now()
    db.flush()
    _refresh(db, principal, bill)
    audit(db, principal, "bill_value.map", "bill_value", str(v.id), {"parameter_key": p.key, "group_index": group_index})
    db.commit()
    db.refresh(v)
    return v


def assign_profile(db, principal, bill_id: str, profile_id: str) -> Bill:
    """Route a bill to a profile a person chose (UNKNOWN_PROFILE / AMBIGUOUS_PROFILE, or a re-read before review).
    Earlier values are superseded, never deleted."""
    _need(principal, "write")
    bill = _get(db, Bill, principal, bill_id)
    values = _bill_rows(db, bill)
    if bill.status == "POSTED" or any(v.confirmed_by for v in values):
        raise DomainError(409, "Values were already reviewed; re-reading would discard that review")
    for v in values:
        v.status = "superseded"
    db.flush()
    _read(db, principal, bill, bx.document_from_layout(bill.document), profile_id)
    audit(db, principal, "bill.assign_profile", "bill", bill.id, {"profile_id": profile_id})
    db.commit()
    return bill


def _scalar_text(lookup, key) -> Optional[str]:
    if not key:
        return None
    try:
        v = lookup(key)
    except bill_rules.Missing:
        return None
    return None if isinstance(v, list) else _text(v)


def post_bill(db, principal, bill_id: str, period_id: str) -> List:
    """Create DRAFT ledger activities from the bill's reviewed consumption values that map to the ledger."""
    _need(principal, "write")
    bill = _get(db, Bill, principal, bill_id)
    profile = db.get(BillProfile, bill.profile_id) if bill.profile_id else None
    if bill.status != "EXTRACTED" or profile is None:
        raise DomainError(409, f"A {bill.status} bill cannot be posted")
    if profile.status != "APPROVED":
        raise DomainError(409, f"Profile {profile.profile_key} v{profile.version} is not approved by a second person")
    blocking = sorted({f["code"] for f in bill.findings if f["blocking"]})
    if blocking:
        raise DomainError(409, f"The bill has blocking findings: {', '.join(blocking)}")
    values = _bill_rows(db, bill)
    pending = [v for v in values if v.status == "extracted"]
    if pending:
        raise DomainError(409, f"{len(pending)} value(s) still need a person to confirm, correct or reject them")
    params = bx.profile_parameters(profile.definition)
    rows = _extracted(values, params)
    _, start, end = _bill_period(rows)
    if not isinstance(start, dt.date) or not isinstance(end, dt.date):
        raise DomainError(422, "The bill's period.start and period.end are needed to post it")
    scoped = bx.Values(rows, params, profile.definition["groups"])
    quality = "estimated" if any(f["code"] == "ESTIMATED_READ" for f in bill.findings) else "billed"
    created = []
    for v in values:
        p = params.get(v.parameter_key)
        if v.status not in REVIEWED or p is None or not p.ledger:
            continue
        lookup = scoped.lookup(v.group_index)
        data = {"facility_id": bill.facility_id, "period_id": period_id, "activity_type": p.ledger["activity_type"],
                "quantity": format(bp.convert(Decimal(v.value_text), v.unit, p.ledger["unit"]), "f"),
                "unit": p.ledger["unit"], "activity_start": start, "activity_end": end,
                "meter_ref": _scalar_text(lookup, p.ledger.get("meter_ref_from")), "source_type": "document",
                "source_ref": f"bill {bill.id} value {v.id} page {v.page}"[:200],
                "evidence_snippet": (v.raw_text or "")[:2000], "data_quality": quality,
                "idempotency_key": f"bill:{bill.id}:{v.id}"[:100]}
        if p.ledger.get("generator_ref_from"):
            data["generator_ref"] = _scalar_text(lookup, p.ledger["generator_ref_from"])
        rec, _ = ledger.create_activity(db, principal, data)
        v.activity_id = rec.id
        created.append(rec)
    bill.status, bill.posted_by, bill.posted_at = "POSTED", principal.sub, _now()
    audit(db, principal, "bill.post", "bill", bill.id, {"activities": [r.id for r in created], "period_id": period_id})
    db.commit()
    return created


# --- analysis -----------------------------------------------------------------------------------

def fiscal_year(d: dt.date) -> str:
    start = d.year if d.month >= 7 else d.year - 1  # Bangladesh fiscal year: 1 July – 30 June
    return f"FY{start}-{str(start + 1)[-2:]}"


def _context(values: Sequence[BillValue], params: Dict[str, bp.Parameter]):
    """Per group path: the nearest text identifier (meter) and enum identifier (band) up the ancestor chain."""
    meters, bands = {}, {}
    for v in values:
        p = params.get(v.parameter_key)
        if v.status in ("rejected", "superseded", "unmapped") or p is None or p.role != "identifier":
            continue
        (bands if p.dtype == "enum" else meters).setdefault(v.group_index, v.value_text)

    def nearest(table, path):
        return next((table[a] for a in bx.ancestors(path) if a in table), None)
    return lambda path: (nearest(meters, path), nearest(bands, path))


def analyse(db, principal, keys: Sequence[str], group_by: Sequence[str], grain: str = "month") -> dict:
    """Aggregate any confirmed, corrected or derived parameter by organization / facility / meter / band / period."""
    _need(principal, "read")
    if not keys or len(keys) > 20:
        raise DomainError(422, "Give 1 to 20 parameter keys")
    if [d for d in group_by if d not in DIMENSIONS] or grain not in ("month", "fiscal_year"):
        raise DomainError(422, f"group_by takes {', '.join(DIMENSIONS)}; grain is month or fiscal_year")
    bills = db.query(Bill).filter(Bill.organization_id == principal.organization_id,
                                  Bill.status.in_(("EXTRACTED", "POSTED"))).order_by(Bill.created_at, Bill.id).all()
    groups: Dict[tuple, dict] = {}
    for bill in bills:
        values = _bill_rows(db, bill)
        params = _bill_profile_params(db, principal, bill)
        context = _context(values, params)
        when = next((dt.date.fromisoformat(v.value_text) for v in values
                     if v.parameter_key == "period.end" and v.group_index == "" and v.value_text
                     and v.status in LIVE), None)
        for v in values:
            if v.parameter_key not in keys or v.status not in ANALYSED or v.value_text is None:
                continue
            meter, band = context(v.group_index)
            period = None if when is None else (when.strftime("%Y-%m") if grain == "month" else fiscal_year(when))
            dims = {"organization": principal.organization_id, "facility": bill.facility_id, "meter": meter,
                    "band": band, "period": period}
            g = groups.setdefault(tuple(dims[d] for d in group_by) + (v.parameter_key,),
                                  {**{d: dims[d] for d in group_by}, "key": v.parameter_key, "unit": v.unit,
                                   "count": 0, "values": []})
            g["count"] += 1
            p = params.get(v.parameter_key)
            if p is not None and p.dtype in bp.NUMERIC:
                g["values"].append(Decimal(v.value_text))
    rows = []
    for g in sorted(groups.values(), key=lambda g: tuple(str(g.get(d)) for d in group_by) + (g["key"],)):
        nums = g.pop("values")
        if nums:
            with localcontext() as ctx:  # exact sums of long values; quantize never runs out of digits
                ctx.prec = WIDE_PRECISION
                total = sum(nums, Decimal(0))
                avg = (total / len(nums)).quantize(Decimal("0.000001"))
            g.update(sum=_text(total), min=_text(min(nums)), max=_text(max(nums)), avg=_text(avg))
        rows.append(g)
    return {"keys": list(keys), "group_by": list(group_by), "grain": grain, "rows": rows}
