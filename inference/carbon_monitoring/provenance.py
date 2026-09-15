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
