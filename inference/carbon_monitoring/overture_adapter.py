"""
overture_adapter.py - Overture Maps Buildings & Settlement Encroachment Extractor.

Uses the open-source `overturemaps` Python client (Cloud-Native GeoParquet with bbox
predicate pushdown; $0 mandatory API fee) to complement OpenStreetMap in rural
Bangladesh buffer zones where OSM building footprints are sparse.

Strict honesty guarantee: if `overturemaps` cannot reach remote Parquet tiles or
`DMRV_OFFLINE_ONLY=1`, returns `overture_available=False` and empty features without
fabricating buildings.
"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from shapely.geometry import mapping
from shapely.geometry.base import BaseGeometry

try:
    import overturemaps
    OVERTURE_AVAILABLE = True
except ImportError:  # pragma: no cover
    overturemaps = None
    OVERTURE_AVAILABLE = False

logger = logging.getLogger(__name__)

MAX_OVERTURE_BUILDINGS = 350


def _overture_cache_key(bbox: Tuple[float, float, float, float]) -> str:
    raw = ":".join(f"{v:.4f}" for v in bbox)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:20]


def fetch_overture_buildings(
    query_geom: BaseGeometry,
    belt_poly: Optional[BaseGeometry] = None,
    cache_dir: Optional[Path] = None,
    timeout_sec: int = 8,
    ignore_cache: bool = False,
) -> Dict[str, Any]:
    """
    Fetches Overture Maps building footprints overlapping a capped window around `query_geom`.
    Returns Leaflet/MapLibre-ready GeoJSON FeatureCollection plus belt settlement metrics.
    """
    empty_fc = {"type": "FeatureCollection", "features": []}
    offline = os.getenv("DMRV_OFFLINE_ONLY", "").strip().lower() in {"1", "true", "yes"}
    if offline or not OVERTURE_AVAILABLE or overturemaps is None:
        return {
            "overture_available": False,
            "source_used": "disabled_offline" if offline else "package_unavailable",
            "building_count": 0,
            "belt_building_count": 0,
            "features": empty_fc,
        }

    # Cap Overture query bbox safely around centroid (+-0.08 deg ~ 16km x 16km) so remote Parquet reads stay fast
    min_lng, min_lat, max_lng, max_lat = query_geom.bounds
    c_lng, c_lat = query_geom.centroid.x, query_geom.centroid.y
    half = 0.08
    bbox = (
        max(min_lng, c_lng - half),
        max(min_lat, c_lat - half),
        min(max_lng, c_lng + half),
        min(max_lat, c_lat + half),
    )

    cdir = cache_dir or (Path(__file__).resolve().parent.parent / "data" / "osm_cache")
    cdir.mkdir(parents=True, exist_ok=True)
    cache_file = cdir / f"overture_{_overture_cache_key(bbox)}.json"

    if not ignore_cache and cache_file.is_file() and (time.time() - cache_file.stat().st_mtime) < 86400:
        try:
            cached = json.loads(cache_file.read_text(encoding="utf-8"))
            if isinstance(cached, dict):
                cached["cached"] = True
                return cached
        except Exception:
            pass

    try:
        gdf = overturemaps.geodataframe(
            "building",
            bbox=bbox,
            connect_timeout=timeout_sec,
            request_timeout=timeout_sec,
        )
    except Exception as exc:
        logger.debug("Overture Maps building fetch unavailable: %s", exc)
        return {
            "overture_available": False,
            "source_used": "unavailable",
            "error_detail": str(exc),
            "building_count": 0,
            "belt_building_count": 0,
            "features": empty_fc,
        }

    if gdf is None or len(gdf) == 0:
        payload = {
            "overture_available": True,
            "source_used": "overture_buildings_parquet",
            "cached": False,
            "building_count": 0,
            "belt_building_count": 0,
            "features": empty_fc,
        }
        try:
            cache_file.write_text(json.dumps(payload), encoding="utf-8")
        except Exception:
            pass
        return payload

    total_count = int(len(gdf))
    belt_count = 0
    feats: List[Dict[str, Any]] = []

    for idx, row in gdf.iloc[:MAX_OVERTURE_BUILDINGS].iterrows():
        geom = row.get("geometry")
        if geom is None or geom.is_empty:
            continue
        in_belt = bool(belt_poly is not None and geom.intersects(belt_poly))
        if in_belt:
            belt_count += 1
        height_val = row.get("height")
        try:
            height_m = round(float(height_val), 1) if height_val is not None else None
        except Exception:
            height_m = None
        subtype = str(row.get("subtype") or row.get("class") or "building")
        feats.append({
            "type": "Feature",
            "id": f"overture/{row.get('id', idx)}",
            "properties": {
                "osm_id": f"overture/{row.get('id', idx)}",
                "category": "overture_buildings",
                "name": f"Overture {subtype.title()}",
                "subtype": subtype,
                "height_m": height_m,
                "in_leakage_belt": in_belt,
                "tags": {"source": "Overture Maps", "subtype": subtype},
            },
            "geometry": mapping(geom.simplify(0.00008, preserve_topology=True)),
        })

    # Scale belt estimate proportionally if row cap truncated full gdf
    if belt_poly is not None and total_count > MAX_OVERTURE_BUILDINGS and MAX_OVERTURE_BUILDINGS > 0:
        belt_count = int(round(belt_count * (total_count / float(MAX_OVERTURE_BUILDINGS))))

    payload = {
        "overture_available": True,
        "source_used": "overture_buildings_parquet",
        "cached": False,
        "building_count": total_count,
        "belt_building_count": belt_count,
        "features": {"type": "FeatureCollection", "features": feats},
    }
    try:
        cache_file.write_text(json.dumps(payload), encoding="utf-8")
    except Exception:
        pass
    return payload
