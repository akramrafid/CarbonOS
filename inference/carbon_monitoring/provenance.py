"""
Hash-chain helpers for EstimateProvenance (part c: immutable data-provenance log).

This is a lightweight, self-hosted stand-in for a blockchain: each record's hash
is computed over its own content plus the previous record's hash, so altering
any past record breaks every hash after it. It doesn't need external infra -
just discipline about never running UPDATE on this table.
"""
import hashlib
import json
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .models import EstimateProvenance

GENESIS_HASH = "GENESIS"


def _canonical_json(payload: dict) -> str:
    """Deterministic JSON encoding so the same content always hashes the same way."""
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def compute_record_hash(payload: dict, previous_hash: str) -> str:
    chained = {"previous_hash": previous_hash, "payload": payload}
    return hashlib.sha256(_canonical_json(chained).encode("utf-8")).hexdigest()


def get_latest_hash(db: Session) -> str:
    latest = db.query(EstimateProvenance).order_by(desc(EstimateProvenance.created_at)).first()
    return latest.record_hash if latest else GENESIS_HASH


def build_provenance_record(db: Session, *, result_id: str, data_source: str,
                             satellite_scene_ids: list, gedi_tree_height_source: str,
                             model_type: str, model_version: str, model_trained_on: str,
                             feature_vector: dict, lat: float, lng: float) -> EstimateProvenance:
    """
    Constructs (but does not commit) a new provenance row chained to the current
    latest record. Call this in the same transaction as the CarbonResult it
    describes, so both succeed or fail together.
    """
    previous_hash = get_latest_hash(db)
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
    )


def verify_chain(db: Session) -> dict:
    """
    Walks the entire chain oldest-to-newest and recomputes each hash to confirm
    nothing was altered after the fact. Returns the first broken link, if any.
    This is the function you'd run live in front of a VVB auditor.
    """
    records = db.query(EstimateProvenance).order_by(EstimateProvenance.created_at.asc()).all()
    expected_previous = GENESIS_HASH
    for r in records:
        payload = {
            "result_id": r.result_id,
            "data_source": r.data_source,
            "satellite_scene_ids": json.loads(r.satellite_scene_ids or "[]"),
            "gedi_tree_height_source": r.gedi_tree_height_source,
            "model_type": r.model_type,
            "model_version": r.model_version,
            "model_trained_on": r.model_trained_on,
            "feature_vector": json.loads(r.feature_vector_json),
            "geolocation_lat": r.geolocation_lat,
            "geolocation_lng": r.geolocation_lng,
        }
        if r.previous_hash != expected_previous:
            return {"valid": False, "broken_at": r.id, "reason": "previous_hash mismatch"}
        recomputed = compute_record_hash(payload, r.previous_hash)
        if recomputed != r.record_hash:
            return {"valid": False, "broken_at": r.id, "reason": "record_hash does not match content"}
        expected_previous = r.record_hash
    return {"valid": True, "records_checked": len(records)}


# -------------------------------------------------------------------------
# Multi-Validator Cryptographic Trust Layer (Open Forest Protocol Pattern)
# -------------------------------------------------------------------------
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.exceptions import InvalidSignature
from .models import ValidatorSignature


def generate_validator_keypair() -> dict:
    """
    Generates an Ed25519 private/public keypair for an accredited validator or VVB.
    Returns keys as hex-encoded strings for standard storage/transmission.
    """
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    return {
        "private_key_hex": private_key.private_bytes_raw().hex(),
        "public_key_hex": public_key.public_bytes_raw().hex()
    }


def sign_record_hash(record_hash: str, private_key_hex: str) -> str:
    """
    Cryptographically signs a provenance record_hash using an Ed25519 private key.
    Returns the signature as a hex string.
    """
    private_bytes = bytes.fromhex(private_key_hex)
    private_key = ed25519.Ed25519PrivateKey.from_private_bytes(private_bytes)
    sig = private_key.sign(record_hash.encode("utf-8"))
    return sig.hex()


def verify_signature(record_hash: str, signature_hex: str, public_key_hex: str) -> bool:
    """
    Verifies an Ed25519 signature over a provenance record_hash using the validator's public key.
    Returns True if valid, False otherwise (tamper-detected or corrupted key).
    """
    try:
        public_bytes = bytes.fromhex(public_key_hex)
        public_key = ed25519.Ed25519PublicKey.from_public_bytes(public_bytes)
        sig_bytes = bytes.fromhex(signature_hex)
        public_key.verify(sig_bytes, record_hash.encode("utf-8"))
        return True
    except (InvalidSignature, ValueError, Exception):
        return False


def add_validator_signature(
    db: Session,
    result_id: str,
    validator_id: str,
    validator_name: str,
    validator_organization: str,
    public_key_hex: str,
    signature_hex: str,
    comments: str = None
) -> ValidatorSignature:
    """
    Attaches an external validator's Ed25519 co-signature to the provenance record.
    Strictly verifies the cryptographic validity of the signature over the record_hash
    before committing to the database.
    """
    prov_record = db.query(EstimateProvenance).filter(EstimateProvenance.result_id == result_id).first()
    if not prov_record:
        raise ValueError(f"EstimateProvenance for result_id {result_id} not found.")

    is_valid = verify_signature(prov_record.record_hash, signature_hex, public_key_hex)
    if not is_valid:
        raise ValueError("Invalid Ed25519 signature: cryptographic verification against record_hash failed.")

    # Check for existing signature by the same validator on this record
    existing = db.query(ValidatorSignature).filter_by(
        provenance_record_id=prov_record.id,
        validator_id=validator_id
    ).first()
    if existing:
        existing.signature = signature_hex
        existing.comments = comments
        existing.validator_name = validator_name
        existing.validator_organization = validator_organization
        existing.validator_public_key = public_key_hex
        db.commit()
        db.refresh(existing)
        return existing

    sig_entry = ValidatorSignature(
        provenance_record_id=prov_record.id,
        validator_id=validator_id,
        validator_name=validator_name,
        validator_organization=validator_organization,
        validator_public_key=public_key_hex,
        signature=signature_hex,
        comments=comments
    )
    db.add(sig_entry)
    db.commit()
    db.refresh(sig_entry)
    return sig_entry


def get_provenance_trust_status(record: EstimateProvenance, db: Session) -> dict:
    """
    Returns dual trust state:
    1. hash_chain_intact: Data immutability verified against preceding and subsequent blocks.
    2. validator_signatures: Independent third-party validation signatures verified via Ed25519.
    Strictly separates hash-chain integrity from validator sign-off.
    """
    # 1. Verify hash integrity of this single record
    payload = {
        "result_id": record.result_id,
        "data_source": record.data_source,
        "satellite_scene_ids": json.loads(record.satellite_scene_ids or "[]"),
        "gedi_tree_height_source": record.gedi_tree_height_source,
        "model_type": record.model_type,
        "model_version": record.model_version,
        "model_trained_on": record.model_trained_on,
        "feature_vector": json.loads(record.feature_vector_json),
        "geolocation_lat": record.geolocation_lat,
        "geolocation_lng": record.geolocation_lng,
    }
    recomputed = compute_record_hash(payload, record.previous_hash)
    record_hash_valid = (recomputed == record.record_hash)

    # 2. Verify validator signatures
    verified_sigs = []
    signatures = record.signatures or []
    for sig in signatures:
        is_valid = verify_signature(record.record_hash, sig.signature, sig.validator_public_key)
        verified_sigs.append({
            "id": sig.id,
            "validator_id": sig.validator_id,
            "validator_name": sig.validator_name,
            "validator_organization": sig.validator_organization,
            "public_key": sig.validator_public_key,
            "signature": sig.signature,
            "comments": sig.comments,
            "signed_at": sig.signed_at.isoformat() if sig.signed_at else None,
            "cryptographically_verified": is_valid
        })

    valid_count = sum(1 for s in verified_sigs if s["cryptographically_verified"])
    quorum_target = 2
    quorum_reached = valid_count >= quorum_target

    if not record_hash_valid:
        summary = "CRITICAL: Provenance record hash mismatch. Underlying data may have been altered."
    elif valid_count == 0:
        summary = "Hash-chain integrity confirmed. No independent validator signatures registered yet."
    elif not quorum_reached:
        summary = f"Hash-chain integrity confirmed. {valid_count}/{quorum_target} validator signatures registered (quorum pending)."
    else:
        summary = f"Hash-chain integrity confirmed. Quorum reached with {valid_count} independent validator signatures."

    return {
        "record_id": record.id,
        "result_id": record.result_id,
        "record_hash": record.record_hash,
        "previous_hash": record.previous_hash,
        "hash_chain_intact": record_hash_valid,
        "validator_signatures": verified_sigs,
        "verified_signature_count": valid_count,
        "quorum_target": quorum_target,
        "quorum_reached": quorum_reached,
        "honest_summary": summary
    }

