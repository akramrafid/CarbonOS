"""
article6_cad_trust.py - UNFCCC Article 6.2 LoA/AEF Ledger, CAD Trust Sync & AOI Spatial Overlap Guard.

Implements:
1. Spatial double-counting prevention across active registered project polygons (Shapely intersection check).
2. Host-country Letter of Authorization (LoA) SHA-256 document hashing and revocation lifecycle.
3. UNFCCC Decision 2/CMA.3 & 6/CMA.6 Agreed Electronic Format (AEF) Table 1-3 exports (JSON/CSV).
4. Climate Action Data Trust (CAD Trust) API payload formatting & fail-closed synchronization.
"""
import csv
import hashlib
import io
import json
import os
from typing import Any, Dict, List, Optional
import requests
from django.utils import timezone


class AoiOverlapError(Exception):
    pass


class LoaStateError(Exception):
    pass


def _extract_ring_coords(geojson_str: str):
    if not geojson_str or not str(geojson_str).strip():
        return []
    data = json.loads(geojson_str) if isinstance(geojson_str, str) else geojson_str
    if isinstance(data, dict):
        if data.get("type") == "Feature":
            data = data.get("geometry")
        elif data.get("type") == "FeatureCollection" and data.get("features"):
            data = data["features"][0].get("geometry")
        if isinstance(data, dict) and data.get("type") == "Polygon":
            coords = data.get("coordinates") or []
            return [(float(pt[0]), float(pt[1])) for pt in (coords[0] if coords else [])]
        if isinstance(data, dict) and data.get("type") == "MultiPolygon":
            coords = data.get("coordinates") or []
            return [(float(pt[0]), float(pt[1])) for pt in (coords[0][0] if coords and coords[0] else [])]
    elif isinstance(data, list) and len(data) >= 3:
        return [(float(pt[1]), float(pt[0])) for pt in data]
    return []


def _ring_area(ring) -> float:
    if len(ring) < 3:
        return 0.0
    area = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2.0


def _clip_polygons_area(subject_ring, clip_ring) -> float:
    """Sutherland-Hodgman polygon intersection area fallback when shapely is absent."""
    def _inside(p, cp1, cp2):
        return (cp2[0] - cp1[0]) * (p[1] - cp1[1]) - (cp2[1] - cp1[1]) * (p[0] - cp1[0]) >= 0

    def _intersect(s, e, cp1, cp2):
        dc = (cp1[0] - cp2[0], cp1[1] - cp2[1])
        dp = (s[0] - e[0], s[1] - e[1])
        n1 = cp1[0] * cp2[1] - cp1[1] * cp2[0]
        n2 = s[0] * e[1] - s[1] * e[0]
        denom = dc[0] * dp[1] - dc[1] * dp[0]
        if abs(denom) < 1e-18:
            return e
        return ((n1 * dp[0] - n2 * dc[0]) / denom, (n1 * dp[1] - n2 * dc[1]) / denom)

    # Ensure counter-clockwise orientation for clip_ring
    def _signed_area(r):
        return sum(r[i][0] * r[(i + 1) % len(r)][1] - r[(i + 1) % len(r)][0] * r[i][1] for i in range(len(r)))

    s_pts = list(subject_ring[:-1] if len(subject_ring) > 3 and subject_ring[0] == subject_ring[-1] else subject_ring)
    c_pts = list(clip_ring[:-1] if len(clip_ring) > 3 and clip_ring[0] == clip_ring[-1] else clip_ring)
    if _signed_area(c_pts) < 0:
        c_pts.reverse()
    if _signed_area(s_pts) < 0:
        s_pts.reverse()

    output = s_pts
    cp1 = c_pts[-1]
    for cp2 in c_pts:
        input_list = output
        output = []
        if not input_list:
            break
        s = input_list[-1]
        for e in input_list:
            if _inside(e, cp1, cp2):
                if not _inside(s, cp1, cp2):
                    output.append(_intersect(s, e, cp1, cp2))
                output.append(e)
            elif _inside(s, cp1, cp2):
                output.append(_intersect(s, e, cp1, cp2))
            s = e
        cp1 = cp2
    return _ring_area(output)


def _polygon_intersection_pct(geo_new: str, geo_other: str) -> float:
    try:
        from shapely.geometry import shape, Polygon
        def _to_shp(raw):
            data = json.loads(raw) if isinstance(raw, str) else raw
            if isinstance(data, dict):
                if data.get("type") == "Feature":
                    data = data.get("geometry")
                elif data.get("type") == "FeatureCollection" and data.get("features"):
                    data = data["features"][0].get("geometry")
                g = shape(data)
            elif isinstance(data, list) and len(data) >= 3:
                ring = [(float(pt[1]), float(pt[0])) for pt in data]
                if ring[0] != ring[-1]:
                    ring.append(ring[0])
                g = Polygon(ring)
            else:
                return None
            return g if g.is_valid else g.buffer(0)

        g1, g2 = _to_shp(geo_new), _to_shp(geo_other)
        if g1 is None or g2 is None or g1.is_empty or g2.is_empty:
            return 0.0
        inter = g1.intersection(g2)
        if inter.is_empty or inter.area <= 1e-8:
            return 0.0
        return round(min(100.0, (inter.area / max(g1.area, 1e-12)) * 100.0), 2)
    except ImportError:
        r1 = _extract_ring_coords(geo_new)
        r2 = _extract_ring_coords(geo_other)
        if len(r1) < 3 or len(r2) < 3:
            return 0.0
        a1 = _ring_area(r1)
        if a1 <= 1e-12:
            return 0.0
        inter_area = _clip_polygons_area(r1, r2)
        if inter_area <= 1e-8:
            return 0.0
        return round(min(100.0, (inter_area / a1) * 100.0), 2)


def check_aoi_polygon_overlap(
    new_polygon_geojson: str,
    existing_projects,
    exclude_project_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Checks spatial overlap between a candidate project's boundary polygon and existing
    active/positive-list projects (excluding revoked LoAs or excluded self ID).
    Raises AoiOverlapError if intersection area > 1e-8 sq degrees (~0.01 ha).
    """
    if not _extract_ring_coords(new_polygon_geojson):
        return {"checked": False, "overlaps": []}

    overlaps = []
    for proj in existing_projects:
        if exclude_project_id and str(proj.id) == str(exclude_project_id):
            continue
        if getattr(proj, "article62_loa_status", "") == "REVOKED":
            continue
        other_geo = getattr(proj, "polygon_geojson", "")
        if not other_geo:
            continue
        overlap_pct = _polygon_intersection_pct(new_polygon_geojson, other_geo)
        if overlap_pct > 0.0:
            overlaps.append({
                "conflicting_project_id": str(proj.id),
                "conflicting_project_name": proj.project_name,
                "overlap_pct": overlap_pct,
            })

    if overlaps:
        raise AoiOverlapError(
            f"AOI boundary overlaps existing registered carbon project(s) ({overlaps[0]['conflicting_project_name']}, {overlaps[0]['overlap_pct']}% overlap); double-issuance blocked."
        )
    return {"checked": True, "overlaps": []}


def record_letter_of_authorization(project, loa_reference: str, loa_document_bytes: Optional[bytes] = None, loa_sha256: Optional[str] = None):
    if not loa_reference or not loa_reference.strip():
        raise LoaStateError("Official DNA LoA reference number is required.")
    digest = loa_sha256 or (hashlib.sha256(loa_document_bytes).hexdigest() if loa_document_bytes else "")
    if len(digest) != 64:
        raise LoaStateError("Official 64-char SHA-256 digest of the signed LoA document is required.")
    project.article62_loa_reference = loa_reference.strip()
    project.article62_loa_sha256 = digest.lower()
    project.article62_loa_issued_at = timezone.now()
    project.article62_loa_status = "ACTIVE"
    project.article62_loa_revoked_at = None
    project.save(update_fields=[
        "article62_loa_reference", "article62_loa_sha256", "article62_loa_issued_at",
        "article62_loa_status", "article62_loa_revoked_at", "updated_at",
    ])
    return project


def revoke_letter_of_authorization(project, reason: str = "Host party revocation"):
    if project.article62_loa_status != "ACTIVE":
        raise LoaStateError(f"Cannot revoke LoA in status '{project.article62_loa_status}'.")
    project.article62_loa_status = "REVOKED"
    project.article62_loa_revoked_at = timezone.now()
    project.save(update_fields=["article62_loa_status", "article62_loa_revoked_at", "updated_at"])
    return project


def generate_unfccc_aef_export(projects, adjustments) -> Dict[str, Any]:
    """
    Generates UNFCCC Decision 2/CMA.3 & 6/CMA.6 Agreed Electronic Format (AEF) Tables:
      Table 1: Authorizations (Coop approach ID, Host party LoA reference/SHA256, Participating parties, First transfer trigger)
      Table 2: Actions (Authorized ITMO transfers, acquisitions, retirements, CA applied status)
      Table 3: Holdings / Net Balance summary
    """
    table_1_authorizations = []
    for p in projects:
        table_1_authorizations.append({
            "project_id": str(p.id),
            "cooperative_approach_id": p.external_project_id or f"BD-ART6-{str(p.id)[:8].upper()}",
            "host_party": "BGD",
            "authorization_status": p.article62_loa_status,
            "loa_reference": p.article62_loa_reference or None,
            "loa_document_sha256": p.article62_loa_sha256 or None,
            "authorization_date": p.article62_loa_issued_at.date().isoformat() if p.article62_loa_issued_at else None,
            "revocation_date": p.article62_loa_revoked_at.date().isoformat() if p.article62_loa_revoked_at else None,
            "sectoral_scope": p.sectoral_scope,
            "carbon_standard": p.carbon_standard,
        })

    table_2_actions = []
    holdings_by_partner: Dict[str, float] = {}
    for adj in adjustments:
        proj = adj.monitoring_report_submission.registry_project
        partner = adj.itmo_transfer_partner or "UNALLOCATED"
        qty = float(adj.metric_tonnes_co2e)
        if adj.adjustment_applied:
            holdings_by_partner[partner] = round(holdings_by_partner.get(partner, 0.0) + qty, 4)
        table_2_actions.append({
            "action_id": str(adj.id),
            "cooperative_approach_id": proj.external_project_id or f"BD-ART6-{str(proj.id)[:8].upper()}",
            "action_type": "FIRST_TRANSFER" if adj.authorized_for_itmo else "DOMESTIC_MITIGATION",
            "transferring_party": "BGD",
            "acquiring_party": partner,
            "vintage_year": adj.vintage_year,
            "quantity_tco2e": qty,
            "credit_serial_number": adj.credit_serial_number or "",
            "corresponding_adjustment_applied": bool(adj.adjustment_applied),
            "ca_confirmation_id": adj.adjustment_confirmation_id or None,
            "reconciliation_status": adj.reconciliation_status,
        })

    table_3_holdings = [
        {"party": party, "total_itmo_held_tco2e": qty, "unit": "tCO2e"}
        for party, qty in sorted(holdings_by_partner.items())
    ]

    return {
        "schema": "unfccc-art62-aef-6cma6-v1",
        "generated_at": timezone.now().isoformat(),
        "reporting_party": "People's Republic of Bangladesh (MoEFCC / DoE DNA)",
        "table_1_authorizations": table_1_authorizations,
        "table_2_actions": table_2_actions,
        "table_3_holdings": table_3_holdings,
    }


def export_aef_csv(aef_payload: Dict[str, Any]) -> str:
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(["Table", "Cooperative Approach ID", "Status / Action", "Party / Partner", "Vintage", "Quantity tCO2e", "Confirmation / LoA SHA256"])
    for r in aef_payload.get("table_1_authorizations", []):
        w.writerow(["T1_AUTHORIZATION", r["cooperative_approach_id"], r["authorization_status"], r["host_party"], "", "", r["loa_document_sha256"] or ""])
    for r in aef_payload.get("table_2_actions", []):
        w.writerow(["T2_ACTION", r["cooperative_approach_id"], r["action_type"], r["acquiring_party"], r["vintage_year"], r["quantity_tco2e"], r["ca_confirmation_id"] or ""])
    return out.getvalue()


class CadTrustSyncAdapter:
    """
    Climate Action Data Trust (CAD Trust) metadata synchronization adapter (fails closed without live API config).
    """
    def __init__(self, api_url: Optional[str] = None, api_key: Optional[str] = None, timeout: int = 10):
        self.api_url = (api_url or os.getenv("CAD_TRUST_API_URL", "")).rstrip("/")
        self.api_key = api_key or os.getenv("CAD_TRUST_API_KEY", "")
        self.timeout = timeout

    def build_project_payload(self, project) -> Dict[str, Any]:
        return {
            "registryProjectId": project.external_project_id or str(project.id),
            "projectName": project.project_name,
            "originProjectId": str(project.id),
            "currentRegistry": project.carbon_standard,
            "sector": project.sector,
            "projectType": project.mitigation_type,
            "hostCountry": "Bangladesh",
            "projectLink": "",
            "article6AuthorizationStatus": project.article62_loa_status,
            "loaReference": project.article62_loa_reference or None,
            "loaSha256": project.article62_loa_sha256 or None,
        }

    def sync_project(self, project) -> Dict[str, Any]:
        payload = self.build_project_payload(project)
        if not self.api_url or not self.api_key:
            return {
                "synced": False,
                "status": "FAILED_CLOSED_NO_CAD_TRUST_CREDENTIALS",
                "reason": "Set CAD_TRUST_API_URL and CAD_TRUST_API_KEY to transmit to Climate Action Data Trust.",
                "staged_payload": payload,
            }
        resp = requests.post(
            f"{self.api_url}/v1/projects",
            json=payload,
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            timeout=self.timeout,
        )
        if 200 <= resp.status_code < 300:
            body = resp.json() if resp.content else {}
            wh_id = body.get("warehouseProjectId") or body.get("id") or ""
            if wh_id:
                project.cad_trust_warehouse_id = str(wh_id)
                project.save(update_fields=["cad_trust_warehouse_id", "updated_at"])
            return {"synced": True, "status": "SYNCED", "warehouse_project_id": wh_id, "response": body}
        return {"synced": False, "status": "UPSTREAM_ERROR", "http_status": resp.status_code, "detail": resp.text[:300]}
