"""
Hash-chain and accredited multi-validator cryptographic provenance helpers for EstimateProvenance.

Every carbon estimate's SHA-256 record_hash seals BOTH input provenance (scenes, GEDI source,
model metadata, feature vector, lat/lng) AND quantification outputs (biomass, carbon, tCO2e,
conformal bounds, precision discount, baseline delta, AOI boundary SHA-256).
Validator signatures are accepted only from active keys pre-registered in AccreditedValidator.
"""
import datetime
import hashlib
import json
import threading
from typing import Any, Optional

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.asymmetric import ed25519
from sqlalchemy import desc
from sqlalchemy.orm import Session

from .models import (
    AccreditedValidator,
    AnalysisJob,
    BaselineAssessment,
    CarbonResult,
    EstimateProvenance,
    ValidatorSignature,
)

GENESIS_HASH = "GENESIS"
_CHAIN_LOCK = threading.Lock()


def _canonical_json(payload: dict) -> str:
    """Deterministic JSON encoding so the same content always hashes the same way."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def compute_aoi_sha256(polygon_geojson: Any) -> Optional[str]:
    if polygon_geojson is None:
        return None
    if isinstance(polygon_geojson, str):
        try:
            parsed = json.loads(polygon_geojson)
            canonical = _canonical_json(parsed)
        except Exception:
            canonical = polygon_geojson.strip()
    elif isinstance(polygon_geojson, (dict, list)):
        canonical = json.dumps(polygon_geojson, sort_keys=True, separators=(",", ":"), default=str)
    else:
        canonical = str(polygon_geojson)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def _num(val: Any) -> Optional[float]:
    return None if val is None else round(float(val), 6)


def build_quantification_snapshot(
    carbon_result: Optional[CarbonResult] = None,
    baseline: Optional[BaselineAssessment] = None,
    polygon_geojson: Any = None,
    organization_id: Optional[str] = None,
) -> Optional[dict]:
    if carbon_result is None and baseline is None and polygon_geojson is None and organization_id is None:
        return None
    snapshot = {
        "organization_id": organization_id,
        "aoi_polygon_sha256": compute_aoi_sha256(polygon_geojson),
    }
    if carbon_result is not None:
        snapshot.update({
            "estimated_biomass": _num(carbon_result.estimated_biomass),
            "estimated_carbon": _num(carbon_result.estimated_carbon),
            "tonnes_co2e": _num(carbon_result.tonnes_co2e),
            "forest_area_ha": _num(carbon_result.forest_area_ha),
            "carbon_agb_tc_ha": _num(carbon_result.carbon_agb_tc_ha),
            "carbon_bgb_tc_ha": _num(carbon_result.carbon_bgb_tc_ha),
            "carbon_soc_tc_ha": _num(carbon_result.carbon_soc_tc_ha),
            "carbon_lower_90": _num(carbon_result.carbon_lower_90),
            "carbon_upper_90": _num(carbon_result.carbon_upper_90),
            "relative_margin_of_error": _num(carbon_result.relative_margin_of_error),
            "verra_precision_discount_pct": _num(carbon_result.verra_precision_discount_pct),
            "conservative_creditable_tco2e": _num(carbon_result.conservative_creditable_tco2e),
        })
    if baseline is not None:
        snapshot.update({
            "baseline_counterfactual_tc_ha": _num(baseline.counterfactual_carbon_tc_ha),
            "gross_additionality_tco2e": _num(baseline.gross_additionality_tco2e),
            "leakage_deduction_tco2e": _num(baseline.leakage_deduction_tco2e),
            "buffer_withheld_tco2e": _num(baseline.buffer_withheld_tco2e),
            "net_creditable_tco2e": _num(baseline.net_creditable_tco2e),
        })
    return snapshot


def compute_record_hash(payload: dict, previous_hash: str) -> str:
    chained = {"previous_hash": previous_hash, "payload": payload}
    return hashlib.sha256(_canonical_json(chained).encode("utf-8")).hexdigest()


def _get_chain_head_unlocked(db: Session) -> tuple[str, int]:
    q = db.query(EstimateProvenance).order_by(
        desc(EstimateProvenance.chain_index),
        desc(EstimateProvenance.created_at),
    )
    try:
        if db.bind is not None and db.bind.dialect.name != "sqlite":
            q = q.with_for_update()
    except Exception:
        pass
    latest = q.first()
    if not latest:
        return GENESIS_HASH, 0
    return latest.record_hash, int(latest.chain_index or 0)


def get_latest_hash(db: Session) -> str:
    with _CHAIN_LOCK:
        head_hash, _ = _get_chain_head_unlocked(db)
        return head_hash


def _payload_for_record(
    *,
    result_id: str,
    data_source: str,
    satellite_scene_ids: list,
    gedi_tree_height_source: str,
    model_type: str,
    model_version: str,
    model_trained_on: str,
    feature_vector: dict,
    lat: float,
    lng: float,
    quantification_snapshot: Optional[dict] = None,
) -> dict:
    payload = {
        "result_id": result_id,
        "data_source": data_source,
        "satellite_scene_ids": satellite_scene_ids,
        "gedi_tree_height_source": gedi_tree_height_source,
        "model_type": model_type,
        "model_version": model_version,
        "model_trained_on": model_trained_on,
        "feature_vector": feature_vector,
        "geolocation_lat": lat,
        "geolocation_lng": lng,
    }
    if quantification_snapshot is not None:
        payload["quantification_snapshot"] = quantification_snapshot
    return payload


def build_provenance_record(
    db: Session,
    *,
    result_id: str,
    data_source: str,
    satellite_scene_ids: list,
    gedi_tree_height_source: str,
    model_type: str,
    model_version: str,
    model_trained_on: str,
    feature_vector: dict,
    lat: float,
    lng: float,
    carbon_result: Optional[CarbonResult] = None,
    baseline: Optional[BaselineAssessment] = None,
    polygon_geojson: Any = None,
    organization_id: Optional[str] = None,
) -> EstimateProvenance:
    """
    Constructs a new provenance row chained under lock to the current head.
    Includes CarbonResult, BaselineAssessment, and AOI boundary hash in the SHA-256 digest
    so post-hoc SQL tampering of credit numbers breaks provenance verification.
    """
    if carbon_result is None and result_id:
        carbon_result = db.query(CarbonResult).filter(CarbonResult.id == result_id).first()
    job = None
    if carbon_result is not None and carbon_result.job_id:
        job = db.query(AnalysisJob).filter(AnalysisJob.id == carbon_result.job_id).first()
        if baseline is None:
            baseline = db.query(BaselineAssessment).filter(BaselineAssessment.job_id == carbon_result.job_id).first()
    if polygon_geojson is None and job is not None:
        polygon_geojson = job.polygon_geojson
    if organization_id is None and job is not None:
        organization_id = job.organization_id

    snapshot = build_quantification_snapshot(
        carbon_result=carbon_result,
        baseline=baseline,
        polygon_geojson=polygon_geojson,
        organization_id=organization_id,
    )

    with _CHAIN_LOCK:
        previous_hash, prev_index = _get_chain_head_unlocked(db)
        payload = _payload_for_record(
            result_id=result_id,
            data_source=data_source,
            satellite_scene_ids=satellite_scene_ids,
            gedi_tree_height_source=gedi_tree_height_source,
            model_type=model_type,
            model_version=model_version,
            model_trained_on=model_trained_on,
            feature_vector=feature_vector,
            lat=lat,
            lng=lng,
            quantification_snapshot=snapshot,
        )
        record_hash = compute_record_hash(payload, previous_hash)

        return EstimateProvenance(
            result_id=result_id,
            data_source=data_source,
            satellite_scene_ids=json.dumps(satellite_scene_ids),
            gedi_tree_height_source=gedi_tree_height_source,
            model_type=model_type,
            model_version=model_version,
            model_trained_on=model_trained_on,
            feature_vector_json=_canonical_json(feature_vector),
            geolocation_lat=lat,
            geolocation_lng=lng,
            record_hash=record_hash,
            previous_hash=previous_hash,
            chain_index=prev_index + 1,
            quantification_snapshot_json=_canonical_json(snapshot) if snapshot is not None else None,
        )


def _check_live_quantification_integrity(record: EstimateProvenance, db: Session) -> Optional[str]:
    """Verifies that live CarbonResult values still match the hashed quantification snapshot."""
    if not record.quantification_snapshot_json:
        return None
    try:
        snap = json.loads(record.quantification_snapshot_json)
    except Exception:
        return "corrupted quantification_snapshot_json"

    c_res = db.query(CarbonResult).filter(CarbonResult.id == record.result_id).first()
    if c_res is None:
        return None

    fields_to_check = (
        "estimated_biomass",
        "estimated_carbon",
        "tonnes_co2e",
        "forest_area_ha",
        "carbon_lower_90",
        "carbon_upper_90",
        "verra_precision_discount_pct",
        "conservative_creditable_tco2e",
    )
    for field in fields_to_check:
        if field in snap:
            expected = snap[field]
            actual = _num(getattr(c_res, field, None))
            if expected is None and actual is None:
                continue
            if expected is None or actual is None or abs(float(expected) - float(actual)) > 1e-4:
                return f"CarbonResult.{field} mutated outside provenance hash ({actual} != {expected})"
    return None


def _recompute_record_hash(record: EstimateProvenance) -> str:
    snapshot = None
    if getattr(record, "quantification_snapshot_json", None):
        snapshot = json.loads(record.quantification_snapshot_json)
    payload = _payload_for_record(
        result_id=record.result_id,
        data_source=record.data_source,
        satellite_scene_ids=json.loads(record.satellite_scene_ids or "[]"),
        gedi_tree_height_source=record.gedi_tree_height_source,
        model_type=record.model_type,
        model_version=record.model_version,
        model_trained_on=record.model_trained_on,
        feature_vector=json.loads(record.feature_vector_json),
        lat=record.geolocation_lat,
        lng=record.geolocation_lng,
        quantification_snapshot=snapshot,
    )
    return compute_record_hash(payload, record.previous_hash)


def verify_chain(db: Session, organization_id: Optional[str] = None) -> dict:
    """
    Walks the chain oldest-to-newest and recomputes each hash + quantification integrity.
    """
    records = (
        db.query(EstimateProvenance)
        .order_by(EstimateProvenance.chain_index.asc(), EstimateProvenance.created_at.asc())
        .all()
    )
    expected_previous = GENESIS_HASH
    checked = 0
    for r in records:
        if r.previous_hash != expected_previous:
            return {"valid": False, "broken_at": r.id, "reason": "previous_hash mismatch"}
        recomputed = _recompute_record_hash(r)
        if recomputed != r.record_hash:
            return {"valid": False, "broken_at": r.id, "reason": "record_hash does not match content"}
        tamper_msg = _check_live_quantification_integrity(r, db)
        if tamper_msg:
            return {"valid": False, "broken_at": r.id, "reason": tamper_msg}
        expected_previous = r.record_hash
        checked += 1

    if organization_id:
        tenant_count = (
            db.query(EstimateProvenance)
            .join(CarbonResult, CarbonResult.id == EstimateProvenance.result_id)
            .join(AnalysisJob, AnalysisJob.id == CarbonResult.job_id)
            .filter(AnalysisJob.organization_id == organization_id)
            .count()
        )
        return {"valid": True, "records_checked": checked, "organization_records": tenant_count}

    return {"valid": True, "records_checked": checked}


# -------------------------------------------------------------------------
# Multi-Validator Cryptographic Trust Layer + Accredited VVB Trust Registry
# -------------------------------------------------------------------------


def generate_validator_keypair() -> dict:
    """
    Offline helper generating an Ed25519 keypair for a VVB auditor CLI.
    Never exposed as an HTTP API route.
    """
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return {
        "private_key_hex": private_key.private_bytes_raw().hex(),
        "public_key_hex": public_key.public_bytes_raw().hex(),
    }


def sign_record_hash(record_hash: str, private_key_hex: str) -> str:
    private_bytes = bytes.fromhex(private_key_hex)
    private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_bytes)
    return private_key.sign(record_hash.encode("utf-8")).hex()


def verify_signature(record_hash: str, signature_hex: str, public_key_hex: str) -> bool:
    try:
        public_bytes = bytes.fromhex(public_key_hex)
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_bytes)
        sig_bytes = bytes.fromhex(signature_hex)
        public_key.verify(sig_bytes, record_hash.encode("utf-8"))
        return True
    except (InvalidSignature, ValueError, Exception):
        return False


def register_accredited_validator(
    db: Session,
    *,
    validator_id: str,
    validator_name: str,
    validator_organization: str,
    public_key_hex: str,
    accreditation_standard: str = "Verra VVB / ISO 14065",
    registered_by_sub: Optional[str] = None,
) -> AccreditedValidator:
    """Registers or updates an accredited external VVB public key in the trust registry."""
    # Validate public key format strictly (32 bytes = 64 hex chars)
    pub_bytes = bytes.fromhex(public_key_hex)
    ed25519.Ed25519PublicKey.from_public_bytes(pub_bytes)

    existing = db.query(AccreditedValidator).filter(AccreditedValidator.validator_id == validator_id).first()
    if existing:
        existing.validator_name = validator_name
        existing.validator_organization = validator_organization
        existing.public_key_hex = public_key_hex.lower()
        existing.accreditation_standard = accreditation_standard
        existing.registered_by_sub = registered_by_sub
        existing.is_active = True
        existing.revoked_at = None
        db.commit()
        db.refresh(existing)
        return existing

    entry = AccreditedValidator(
        validator_id=validator_id,
        validator_name=validator_name,
        validator_organization=validator_organization,
        public_key_hex=public_key_hex.lower(),
        accreditation_standard=accreditation_standard,
        registered_by_sub=registered_by_sub,
        is_active=True,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def revoke_accredited_validator(db: Session, validator_id: str) -> AccreditedValidator:
    entry = db.query(AccreditedValidator).filter(AccreditedValidator.validator_id == validator_id).first()
    if not entry:
        raise ValueError(f"Validator '{validator_id}' not found.")
    entry.is_active = False
    entry.revoked_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return entry


def add_validator_signature(
    db: Session,
    result_id: str,
    validator_id: str,
    validator_name: str,
    validator_organization: str,
    public_key_hex: str,
    signature_hex: str,
    comments: str = None,
) -> ValidatorSignature:
    """
    Attaches an accredited VVB validator's Ed25519 co-signature to the provenance record.
    Rejects self-asserted / unaccredited / revoked public keys.
    """
    accredited = (
        db.query(AccreditedValidator)
        .filter(
            AccreditedValidator.validator_id == validator_id,
            AccreditedValidator.is_active.is_(True),
            AccreditedValidator.revoked_at.is_(None),
        )
        .first()
    )
    if not accredited:
        raise ValueError(
            f"Validator '{validator_id}' is not registered or active in the accredited VVB PKI trust registry."
        )
    if accredited.public_key_hex.lower() != (public_key_hex or "").strip().lower():
        raise ValueError("Submitted public_key_hex does not match the accredited VVB registry key.")
    if accredited.validator_organization.strip().lower() != (validator_organization or "").strip().lower():
        raise ValueError("Validator organization mismatch against accredited VVB registry.")

    prov_record = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == result_id).first()
    if not prov_record:
        raise ValueError(f"EstimateProvenance for result_id {result_id} not found.")

    if not verify_signature(prov_record.record_hash, signature_hex, accredited.public_key_hex):
        raise ValueError("Invalid Ed25519 signature: cryptographic verification against record_hash failed.")

    existing = (
        db.query(ValidatorSignature)
        .filter_by(provenance_record_id=prov_record.id, validator_id=validator_id)
        .first()
    )
    if existing:
        existing.signature = signature_hex
        existing.comments = comments
        existing.validator_name = validator_name
        existing.validator_organization = accredited.validator_organization
        existing.validator_public_key = accredited.public_key_hex
        db.commit()
        db.refresh(existing)
        return existing

    sig_entry = ValidatorSignature(
        provenance_record_id=prov_record.id,
        validator_id=validator_id,
        validator_name=validator_name,
        validator_organization=accredited.validator_organization,
        validator_public_key=accredited.public_key_hex,
        signature=signature_hex,
        comments=comments,
    )
    db.add(sig_entry)
    db.commit()
    db.refresh(sig_entry)
    return sig_entry


def get_provenance_trust_status(record: EstimateProvenance, db: Session) -> dict:
    """
    Returns dual trust state:
    1. hash_chain_intact: Record hash AND live CarbonResult quantification snapshot integrity.
    2. validator_signatures: Independent VVB signatures verified via Ed25519 AND AccreditedValidator status.
    """
    recomputed = _recompute_record_hash(record)
    tamper_msg = _check_live_quantification_integrity(record, db)
    record_hash_valid = (recomputed == record.record_hash) and (tamper_msg is None)

    verified_sigs = []
    signatures = record.signatures or []
    for sig in signatures:
        is_sig_valid = verify_signature(record.record_hash, sig.signature, sig.validator_public_key)
        accredited = (
            db.query(AccreditedValidator)
            .filter(
                AccreditedValidator.validator_id == sig.validator_id,
                AccreditedValidator.public_key_hex == sig.validator_public_key.lower(),
                AccreditedValidator.is_active.is_(True),
                AccreditedValidator.revoked_at.is_(None),
            )
            .first()
        )
        is_accredited = accredited is not None
        verified_sigs.append({
            "id": sig.id,
            "validator_id": sig.validator_id,
            "validator_name": sig.validator_name,
            "validator_organization": sig.validator_organization,
            "public_key": sig.validator_public_key,
            "signature": sig.signature,
            "comments": sig.comments,
            "signed_at": sig.signed_at.isoformat() if sig.signed_at else None,
            "cryptographically_verified": is_sig_valid,
            "accredited_vvb": is_accredited,
        })

    valid_count = sum(1 for s in verified_sigs if s["cryptographically_verified"] and s["accredited_vvb"])
    quorum_target = 2
    quorum_reached = valid_count >= quorum_target

    if not record_hash_valid:
        summary = (
            f"CRITICAL: {tamper_msg}."
            if tamper_msg
            else "CRITICAL: Provenance record hash mismatch. Underlying data may have been altered."
        )
    elif valid_count == 0:
        summary = "Hash-chain integrity confirmed. No accredited independent validator signatures registered yet."
    elif not quorum_reached:
        summary = f"Hash-chain integrity confirmed. {valid_count}/{quorum_target} accredited validator signatures registered (quorum pending)."
    else:
        summary = f"Hash-chain integrity confirmed. Quorum reached with {valid_count} accredited validator signatures."

    return {
        "record_id": record.id,
        "result_id": record.result_id,
        "record_hash": record.record_hash,
        "previous_hash": record.previous_hash,
        "chain_index": getattr(record, "chain_index", None),
        "hash_chain_intact": record_hash_valid,
        "quantification_integrity_error": tamper_msg,
        "validator_signatures": verified_sigs,
        "verified_signature_count": valid_count,
        "quorum_target": quorum_target,
        "quorum_reached": quorum_reached,
        "honest_summary": summary,
    }
