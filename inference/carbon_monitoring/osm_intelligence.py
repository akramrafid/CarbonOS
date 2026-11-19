"""
osm_intelligence.py - OpenStreetMap Vector & Verra VM0047 Spatial Context Engine

Primary data source: QuackOSM + DuckDB over a local Bangladesh `.osm.pbf` extract
(configured via OSM_PBF_PATH or placed at inference/data/bangladesh-latest.osm.pbf).
Fallback data source: Overpass Interpreter API (`out geom`) when no local PBF is mounted.

Strict honesty guarantee: if neither a local `.osm.pbf` nor Overpass API is reachable,
returns `osm_available=False`, `source_used="unavailable"`, empty FeatureCollections, and
never fabricates synthetic roads, forests, or industrial points.
"""

from __future__ import annotations

import hashlib
import json
import logging
import math
import os
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import duckdb
import requests
from shapely import affinity, from_wkb
from shapely.geometry import LineString, MultiPolygon, Point, Polygon, mapping, shape
from shapely.geometry.base import BaseGeometry
from shapely.ops import unary_union

from .overture_adapter import fetch_overture_buildings
from .spatial_analytics import compute_frontier_accessibility

try:
    from shapely.validation import make_valid
except ImportError:  # pragma: no cover - Shapely <2 fallback
    def make_valid(geom: BaseGeometry) -> BaseGeometry:
        return geom.buffer(0)

try:
    import quackosm
    QUACKOSM_AVAILABLE = True
except ImportError:  # pragma: no cover
    quackosm = None
    QUACKOSM_AVAILABLE = False

logger = logging.getLogger(__name__)

INFERENCE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_PBF_CANDIDATES = (
    INFERENCE_DIR / "data" / "bangladesh-latest.osm.pbf",
    Path("/app/data/osm/bangladesh-latest.osm.pbf"),
)
DEFAULT_GEOPARQUET_CANDIDATES = (
    INFERENCE_DIR / "data" / "bangladesh_dmrv.geoparquet",
    Path("/app/data/osm/bangladesh_dmrv.geoparquet"),
)
DEFAULT_CACHE_DIR = INFERENCE_DIR / "data" / "osm_cache"
DEFAULT_OVERPASS_MIRRORS = (
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
)
FALLBACK_BOX_COORDS = [(89.5, 22.2), (89.6, 22.2), (89.6, 22.3), (89.5, 22.3)]

LAYER_FEATURE_CAPS = {
    "forest": 220,
    "water": 220,
    "roads": 320,
    "industrial": 180,
}

# Flat QuackOSM tag filter extracting Verra VM0047 relevant environmental & encroachment tags
QUACKOSM_TAGS_FILTER: Dict[str, Any] = {
    "landuse": ["forest", "orchard", "farmland", "meadow", "grass", "paddy", "aquaculture", "industrial", "quarry"],
    "natural": ["wood", "wetland", "scrub", "water", "coastline"],
    "boundary": ["protected_area", "national_park"],
    "leisure": ["nature_reserve"],
    "waterway": ["river", "canal", "stream", "tidal_channel"],
    "highway": ["motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "track", "service", "residential"],
    "man_made": ["kiln", "works", "chimney"],
    "industrial": True,
    "water": True,
}

EXCLUDED_HIGHWAYS = {"footway", "path", "steps", "cycleway", "pedestrian", "bridleway"}


def _ensure_valid_polygon(geom: BaseGeometry) -> Polygon:
    """Normalizes a parsed geometry into a valid 2D Shapely Polygon (largest part if MultiPolygon)."""
    if geom.is_empty:
        return Polygon(FALLBACK_BOX_COORDS)
    if not geom.is_valid:
        geom = make_valid(geom)
    if isinstance(geom, Polygon):
        return geom
    if isinstance(geom, MultiPolygon) and len(geom.geoms) > 0:
        return max(geom.geoms, key=lambda g: g.area)
    if hasattr(geom, "geoms"):
        polys = [g for g in geom.geoms if isinstance(g, Polygon) and not g.is_empty]
        if polys:
            return max(polys, key=lambda g: g.area)
    bounds = geom.bounds
    if len(bounds) == 4 and bounds[2] > bounds[0] and bounds[3] > bounds[1]:
        return Polygon([
            (bounds[0], bounds[1]),
            (bounds[2], bounds[1]),
            (bounds[2], bounds[3]),
            (bounds[0], bounds[3]),
        ])
    return Polygon(FALLBACK_BOX_COORDS)


def parse_aoi_polygon(polygon_geojson: Any) -> Polygon:
    """
    Parses GeoJSON Polygon/Feature/FeatureCollection strings/dicts or [[lat, lng], ...] lists
    into a valid Shapely Polygon in (lng, lat) WGS84 order.
    """
    try:
        poly_data = json.loads(polygon_geojson) if isinstance(polygon_geojson, str) else polygon_geojson
        if isinstance(poly_data, list) and len(poly_data) >= 3:
            coords = [(float(pt[1]), float(pt[0])) for pt in poly_data]
            return _ensure_valid_polygon(Polygon(coords))
        if isinstance(poly_data, dict):
            g_type = poly_data.get("type")
            if g_type == "FeatureCollection":
                features = poly_data.get("features") or []
                if features and features[0].get("geometry"):
                    return _ensure_valid_polygon(shape(features[0]["geometry"]))
            elif g_type == "Feature" and poly_data.get("geometry"):
                return _ensure_valid_polygon(shape(poly_data["geometry"]))
            elif g_type in {"Polygon", "MultiPolygon"}:
                return _ensure_valid_polygon(shape(poly_data))
    except Exception as exc:
        logger.debug("Falling back to default AOI polygon due to parse error: %s", exc)
    return Polygon(FALLBACK_BOX_COORDS)


def _metric_scales(ref_lat: float) -> Tuple[float, float]:
    """Returns (km_per_deg_lon, km_per_deg_lat) at ref_lat in decimal degrees."""
    lat_rad = math.radians(ref_lat)
    km_per_deg_lat = 111.132
    km_per_deg_lon = 111.320 * max(0.2, abs(math.cos(lat_rad)))
    return km_per_deg_lon, km_per_deg_lat


def _to_local_km(geom: BaseGeometry, origin_lon: float, origin_lat: float) -> BaseGeometry:
    """Projects a WGS84 geometry around (origin_lon, origin_lat) into local planar kilometers."""
    kx, ky = _metric_scales(origin_lat)
    return affinity.scale(
        affinity.translate(geom, xoff=-origin_lon, yoff=-origin_lat),
        xfact=kx,
        yfact=ky,
        origin=(0.0, 0.0),
    )


def _from_local_km(geom: BaseGeometry, origin_lon: float, origin_lat: float) -> BaseGeometry:
    """Projects local planar kilometers around (origin_lon, origin_lat) back to WGS84."""
    kx, ky = _metric_scales(origin_lat)
    return affinity.translate(
        affinity.scale(geom, xfact=1.0 / kx, yfact=1.0 / ky, origin=(0.0, 0.0)),
        xoff=origin_lon,
        yoff=origin_lat,
    )


def compute_leakage_belt_geometry(polygon_geojson: Any, buffer_km: float = 10.0) -> Dict[str, Any]:
    """
    Computes the metric buffer_km outer ring surrounding the project AOI under Verra VM0047.
    Returns both the Shapely geometries (internal) and serialized GeoJSON / area in hectares.
    """
    clamped_km = max(1.0, min(25.0, float(buffer_km)))
    project_poly = parse_aoi_polygon(polygon_geojson)
    centroid = project_poly.centroid
    proj_km = _to_local_km(project_poly, centroid.x, centroid.y)
    buffered_km = proj_km.buffer(clamped_km, quad_segs=12)
    belt_km = buffered_km.difference(proj_km)
    if belt_km.is_empty:
        belt_km = buffered_km

    belt_poly = _from_local_km(belt_km, centroid.x, centroid.y)
    buffered_poly = _from_local_km(buffered_km, centroid.x, centroid.y)
    belt_area_ha = max(500.0, float(belt_km.area) * 100.0)

    return {
        "project_poly": project_poly,
        "belt_poly": belt_poly,
        "query_poly": buffered_poly,
        "leakage_belt_area_ha": round(belt_area_ha, 2),
        "buffer_km": clamped_km,
        "leakage_belt_geojson": mapping(belt_poly),
    }


def classify_osm_tags(tags: Dict[str, Any]) -> Optional[str]:
    """Maps raw OSM tag dictionaries into one of five carbon-monitoring feature classes."""
    if not isinstance(tags, dict):
        return None
    man_made = str(tags.get("man_made") or "").lower()
    landuse = str(tags.get("landuse") or "").lower()
    natural = str(tags.get("natural") or "").lower()
    boundary = str(tags.get("boundary") or "").lower()
    leisure = str(tags.get("leisure") or "").lower()
    highway = str(tags.get("highway") or "").lower()
    waterway = str(tags.get("waterway") or "").lower()

    if man_made in {"kiln", "works", "chimney"} or landuse in {"industrial", "quarry"} or tags.get("industrial"):
        return "industrial"
    if highway and highway not in EXCLUDED_HIGHWAYS:
        return "roads"
    if waterway or natural == "water" or tags.get("water"):
        return "water"
    if (
        landuse in {"forest", "orchard"}
        or natural in {"wood", "wetland", "scrub"}
        or boundary in {"protected_area", "national_park"}
        or leisure == "nature_reserve"
    ):
        return "forest"
    if landuse in {"farmland", "meadow", "grass", "paddy", "aquaculture"}:
        return "cropland"
    return None


def resolve_local_geoparquet_path() -> Optional[Path]:
    """Finds the pre-baked bbox-indexed GeoParquet unless local OSM files are disabled or overridden."""
    if os.getenv("DMRV_DISABLE_LOCAL_PBF", "").strip().lower() in {"1", "true", "yes"}:
        return None
    if os.getenv("OSM_PBF_PATH", "").strip():
        return None
    env_pq = os.getenv("OSM_GEOPARQUET_PATH", "").strip()
    if env_pq:
        cand = Path(env_pq)
        return cand if cand.is_file() else None
    for cand in DEFAULT_GEOPARQUET_CANDIDATES:
        if cand.is_file():
            return cand
    return None


def _fetch_from_geoparquet(parquet_path: Path, query_geom: BaseGeometry, limit: int = 12000) -> List[Dict[str, Any]]:
    """
    Millisecond in-process DuckDB bbox predicate pushdown over pre-baked GeoParquet.
    Avoids Python multiprocessing spawn overhead/crashes on Windows inside FastAPI.
    """
    min_lng, min_lat, max_lng, max_lat = query_geom.bounds
    pq_posix = str(parquet_path).replace("\\", "/")
    con = duckdb.connect(":memory:")
    try:
        rows = con.execute(
            f"""
            SELECT feature_id, tags, geom_wkb
            FROM read_parquet('{pq_posix}')
            WHERE xmax >= ? AND xmin <= ? AND ymax >= ? AND ymin <= ?
            LIMIT ?
            """,
            [float(min_lng), float(max_lng), float(min_lat), float(max_lat), int(limit)],
        ).fetchall()
    finally:
        con.close()

    records: List[Dict[str, Any]] = []
    for fid, raw_tags, geom_wkb in rows:
        if not geom_wkb:
            continue
        try:
            geom = from_wkb(bytes(geom_wkb))
        except Exception:
            continue
        if geom is None or geom.is_empty or not geom.intersects(query_geom):
            continue
        tags = _normalize_tags(raw_tags)
        category = classify_osm_tags(tags)
        if not category:
            continue
        records.append({
            "id": str(fid),
            "category": category,
            "tags": tags,
            "geometry": geom,
        })
    return records


def resolve_local_pbf_path() -> Optional[Path]:
    """Finds an explicit or default local `.osm.pbf` file unless disabled by env."""
    if os.getenv("DMRV_DISABLE_LOCAL_PBF", "").strip().lower() in {"1", "true", "yes"}:
        return None

    env_path = os.getenv("OSM_PBF_PATH", "").strip()
    if env_path:
        candidate = Path(env_path)
        if candidate.is_file():
            return candidate
        logger.warning("OSM_PBF_PATH set to '%s' but file does not exist; falling back.", env_path)

    for candidate in DEFAULT_PBF_CANDIDATES:
        if candidate.is_file():
            return candidate
    return None


def _get_cache_dir() -> Path:
    cache_dir = Path(os.getenv("OSM_CACHE_DIR", str(DEFAULT_CACHE_DIR)))
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


def _normalize_tags(raw_tags: Any) -> Dict[str, str]:
    """Normalizes QuackOSM / Overpass tag payloads to compact str->str dicts."""
    if isinstance(raw_tags, str):
        try:
            raw_tags = json.loads(raw_tags)
        except Exception:
            return {}
    if not isinstance(raw_tags, dict):
        return {}
    cleaned: Dict[str, str] = {}
    for k, v in raw_tags.items():
        if v is None or v == "":
            continue
        if isinstance(v, (list, tuple)):
            cleaned[str(k)] = ",".join(str(item) for item in v[:3])
        else:
            cleaned[str(k)] = str(v)
    return cleaned


def _fetch_with_quackosm(pbf_path: Path, query_geom: BaseGeometry, cache_dir: Path) -> List[Dict[str, Any]]:
    """Queries a local `.osm.pbf` via QuackOSM + DuckDB spatial filtering."""
    if not QUACKOSM_AVAILABLE or quackosm is None:
        raise RuntimeError("quackosm is not installed.")

    work_dir = cache_dir / "quackosm_work"
    work_dir.mkdir(parents=True, exist_ok=True)

    gdf = quackosm.convert_pbf_to_geodataframe(
        pbf_path=pbf_path,
        tags_filter=QUACKOSM_TAGS_FILTER,
        geometry_filter=query_geom,
        keep_all_tags=False,
        explode_tags=False,
        working_directory=str(work_dir),
        verbosity_mode="silent",
    )

    records: List[Dict[str, Any]] = []
    if gdf is None or len(gdf) == 0:
        return records

    # Index column may carry feature_id or reset column
    if "feature_id" not in gdf.columns:
        gdf = gdf.reset_index()

    for idx, row in gdf.iterrows():
        geom = row.get("geometry")
        if geom is None or geom.is_empty:
            continue
        tags = _normalize_tags(row.get("tags"))
        category = classify_osm_tags(tags)
        if not category:
            continue
        records.append({
            "id": str(row.get("feature_id", idx)),
            "category": category,
            "tags": tags,
            "geometry": geom,
        })
    return records


def _overpass_way_to_geometry(coords_raw: Iterable[Dict[str, Any]], tags: Dict[str, str]) -> Optional[BaseGeometry]:
    """Converts inline Overpass `out geom` coordinates into Point/LineString/Polygon."""
    pts = [(float(pt["lon"]), float(pt["lat"])) for pt in coords_raw if "lat" in pt and "lon" in pt]
    if len(pts) < 2:
        return None
    is_closed = len(pts) >= 4 and pts[0] == pts[-1]
    is_area_tag = bool(
        tags.get("landuse")
        or tags.get("natural") in {"wood", "wetland", "scrub", "water"}
        or tags.get("boundary")
        or tags.get("leisure")
        or tags.get("industrial")
        or tags.get("building")
    )
    if is_closed and is_area_tag and not tags.get("highway"):
        poly = Polygon(pts)
        return make_valid(poly) if not poly.is_valid else poly
    return LineString(pts)


def overpass_elements_to_features(elements: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Converts Overpass API JSON `elements` (`out geom`) into normalized Shapely records."""
    features: List[Dict[str, Any]] = []
    for elem in elements:
        tags = _normalize_tags(elem.get("tags"))
        category = classify_osm_tags(tags)
        if not category:
            continue

        e_type = elem.get("type", "node")
        e_id = f"{e_type}/{elem.get('id', '0')}"
        geom: Optional[BaseGeometry] = None

        if e_type == "node" and "lat" in elem and "lon" in elem:
            geom = Point(float(elem["lon"]), float(elem["lat"]))
        elif e_type == "way" and elem.get("geometry"):
            geom = _overpass_way_to_geometry(elem["geometry"], tags)
        elif e_type == "relation" and elem.get("members"):
            outer_lines = []
            for member in elem["members"]:
                if member.get("type") == "way" and member.get("geometry") and member.get("role", "outer") in {"outer", ""}:
                    pts = [(float(pt["lon"]), float(pt["lat"])) for pt in member["geometry"] if "lat" in pt and "lon" in pt]
                    if len(pts) >= 4 and pts[0] == pts[-1]:
                        poly = Polygon(pts)
                        outer_lines.append(make_valid(poly) if not poly.is_valid else poly)
                    elif len(pts) >= 2:
                        outer_lines.append(LineString(pts))
            if len(outer_lines) == 1:
                geom = outer_lines[0]
            elif len(outer_lines) > 1:
                geom = unary_union(outer_lines)

        if geom is None or geom.is_empty:
            continue

        features.append({
            "id": e_id,
            "category": category,
            "tags": tags,
            "geometry": geom,
        })
    return features


def _bounded_overpass_bbox(query_geom: BaseGeometry) -> Tuple[float, float, float, float]:
    """Bounds Overpass query window safely (max +-0.14 deg around centroid) to stay fast and avoid 504s."""
    min_lng, min_lat, max_lng, max_lat = query_geom.bounds
    c_lng, c_lat = query_geom.centroid.x, query_geom.centroid.y
    half_span = 0.14
    return (
        max(min_lat, c_lat - half_span),
        max(min_lng, c_lng - half_span),
        min(max_lat, c_lat + half_span),
        min(max_lng, c_lng + half_span),
    )


def _fetch_with_overpass(query_geom: BaseGeometry, timeout: int = 7) -> List[Dict[str, Any]]:
    """Queries Overpass API using lightweight `way`/`node` `out geom` across fallback mirrors."""
    s, w, n, e = _bounded_overpass_bbox(query_geom)
    bbox = f"{s:.5f},{w:.5f},{n:.5f},{e:.5f}"
    server_timeout = max(5, min(10, int(timeout)))
    # Omit multi-district relation geometries on Overpass so coastal/river deltas stay within timeout.
    ql = (
        f"[out:json][timeout:{server_timeout}];\n"
        "(\n"
        f'  way["landuse"~"^(forest|orchard|farmland|meadow|paddy|aquaculture|industrial|quarry)$"]({bbox});\n'
        f'  way["natural"~"^(wood|wetland|scrub|water)$"]({bbox});\n'
        f'  way["boundary"~"^(protected_area|national_park)$"]({bbox});\n'
        f'  way["waterway"~"^(river|canal|stream|tidal_channel)$"]({bbox});\n'
        f'  way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|track|service|residential)$"]({bbox});\n'
        f'  nwr["man_made"~"^(kiln|works)$"]({bbox});\n'
        ");\n"
        "out geom qt 450;\n"
    )
    custom_url = os.getenv("OVERPASS_API_URL", "").strip()
    urls = (custom_url,) if custom_url else DEFAULT_OVERPASS_MIRRORS
    headers = {
        "User-Agent": "CarbonOS-dMRV/1.0",
        "Accept": "application/json",
    }

    last_exc: Optional[Exception] = None
    for url in urls:
        try:
            resp = requests.post(
                url,
                data={"data": ql},
                headers=headers,
                timeout=server_timeout + 2,
            )
            resp.raise_for_status()
            payload = resp.json()
            return overpass_elements_to_features(payload.get("elements", []))
        except Exception as exc:
            last_exc = exc
            logger.debug("Overpass mirror %s failed: %s", url, exc)

    if last_exc is not None:
        raise last_exc
    return []


def _simplify_for_display(geom: BaseGeometry) -> BaseGeometry:
    """Lightly simplifies geometries (~15m) so Leaflet `<GeoJSON />` stays snappy on mobile."""
    if geom.geom_type in {"Point", "MultiPoint"}:
        return geom
    try:
        simplified = geom.simplify(0.00015, preserve_topology=True)
        return geom if simplified.is_empty else simplified
    except Exception:
        return geom


def _pick_display_label(tags: Dict[str, str], category: str) -> str:
    """Selects a human-readable primary tag label for popup tooltips."""
    if tags.get("name"):
        return tags["name"]
    for key in ("highway", "waterway", "natural", "landuse", "man_made", "boundary", "industrial"):
        if tags.get(key):
            return f"{key}:{tags[key]}"
    return category


def _serialize_geojson_layers(features: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], Dict[str, int]]:
    """Groups OSM records into Leaflet-ready FeatureCollections capped per category."""
    grouped: Dict[str, List[Dict[str, Any]]] = {k: [] for k in LAYER_FEATURE_CAPS}
    counts: Dict[str, int] = {k: 0 for k in LAYER_FEATURE_CAPS}

    # Sort larger/named features first so visual capping preserves key corridors and reserves
    def _sort_key(item: Dict[str, Any]) -> Tuple[int, float]:
        geom = item["geometry"]
        has_name = 1 if item["tags"].get("name") else 0
        magnitude = float(getattr(geom, "area", 0.0) or getattr(geom, "length", 0.0))
        return (has_name, magnitude)

    for item in sorted(features, key=_sort_key, reverse=True):
        cat = item["category"]
        if cat not in LAYER_FEATURE_CAPS:
            continue
        counts[cat] += 1
        if len(grouped[cat]) >= LAYER_FEATURE_CAPS[cat]:
            continue
        disp_geom = _simplify_for_display(item["geometry"])
        grouped[cat].append({
            "type": "Feature",
            "id": item["id"],
            "properties": {
                "osm_id": item["id"],
                "category": cat,
                "name": _pick_display_label(item["tags"], cat),
                "tags": {k: v for k, v in list(item["tags"].items())[:6]},
            },
            "geometry": mapping(disp_geom),
        })

    collections = {
        cat: {"type": "FeatureCollection", "features": feats}
        for cat, feats in grouped.items()
    }
    return collections, counts


def compute_belt_metrics(
    features: List[Dict[str, Any]],
    belt_poly: BaseGeometry,
    belt_area_ha: float,
) -> Dict[str, Any]:
    """
    Computes Verra VM0047 spatial pressure metrics inside the 10 km leakage belt ring
    using local metric projection around the belt centroid.
    """
    centroid = belt_poly.centroid
    belt_km2 = max(1.0, float(belt_area_ha) / 100.0)

    road_km = 0.0
    water_km = 0.0
    industrial_count = 0
    cropland_geoms_km: List[BaseGeometry] = []
    forest_geoms_km: List[BaseGeometry] = []

    for item in features:
        geom = item["geometry"]
        if geom.is_empty or not geom.intersects(belt_poly):
            continue
        cat = item["category"]
        if cat == "industrial":
            industrial_count += 1
            continue

        clipped_deg = geom.intersection(belt_poly)
        if clipped_deg.is_empty:
            continue
        clipped_km = _to_local_km(clipped_deg, centroid.x, centroid.y)

        if cat == "roads":
            road_km += float(clipped_km.length)
        elif cat == "water":
            if clipped_km.geom_type in {"LineString", "MultiLineString"}:
                water_km += float(clipped_km.length)
        elif cat == "cropland":
            if clipped_km.area > 0:
                cropland_geoms_km.append(clipped_km)
        elif cat == "forest":
            if clipped_km.area > 0:
                forest_geoms_km.append(clipped_km)

    cropland_ha = 0.0
    if cropland_geoms_km:
        try:
            cropland_union = unary_union(cropland_geoms_km)
            cropland_ha = min(float(belt_area_ha), float(cropland_union.area) * 100.0)
        except Exception:
            cropland_ha = min(float(belt_area_ha), sum(float(g.area) * 100.0 for g in cropland_geoms_km))

    forest_ha = 0.0
    if forest_geoms_km:
        try:
            forest_union = unary_union(forest_geoms_km)
            forest_ha = min(float(belt_area_ha), float(forest_union.area) * 100.0)
        except Exception:
            forest_ha = min(float(belt_area_ha), sum(float(g.area) * 100.0 for g in forest_geoms_km))

    road_density = road_km / belt_km2
    cropland_share = cropland_ha / max(1.0, float(belt_area_ha))
    forest_share = forest_ha / max(1.0, float(belt_area_ha))

    # Transparent pressure composite (0.0 undisturbed -> 1.0 high frontier displacement risk)
    road_pressure = min(1.0, road_density / 2.5)
    cropland_pressure = min(1.0, cropland_share / 0.45)
    industrial_pressure = min(1.0, industrial_count / 8.0)
    pressure_score = max(0.0, min(1.0, 0.45 * road_pressure + 0.35 * cropland_pressure + 0.20 * industrial_pressure))

    # Map pressure_score [0..1] to annual displacement loss rate [0.8%..5.0%/yr]
    derived_loss_rate = round(0.008 + pressure_score * 0.042, 4)

    return {
        "road_length_km": round(road_km, 2),
        "road_density_km_per_km2": round(road_density, 3),
        "water_length_km": round(water_km, 2),
        "cropland_area_ha": round(cropland_ha, 2),
        "cropland_share_pct": round(cropland_share * 100.0, 2),
        "forest_area_ha": round(forest_ha, 2),
        "forest_share_pct": round(forest_share * 100.0, 2),
        "industrial_count": int(industrial_count),
        "pressure_score": round(pressure_score, 3),
        "derived_leakage_loss_rate": derived_loss_rate,
        "leakage_source": "osm_vector_analysis",
    }


def _cache_key(project_poly: Polygon, buffer_km: float, source_tag: str) -> str:
    min_lng, min_lat, max_lng, max_lat = [round(v, 4) for v in project_poly.bounds]
    raw = f"{min_lng}:{min_lat}:{max_lng}:{max_lat}:{round(buffer_km, 1)}:{source_tag}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]


def _read_cached_response(cache_file: Path, ttl_seconds: int = 86400) -> Optional[Dict[str, Any]]:
    if not cache_file.is_file():
        return None
    try:
        if time.time() - cache_file.stat().st_mtime > ttl_seconds:
            return None
        with cache_file.open("r", encoding="utf-8") as fh:
            payload = json.load(fh)
        if isinstance(payload, dict) and payload.get("osm_available"):
            payload["cached"] = True
            return payload
    except Exception:
        return None
    return None


def _write_cached_response(cache_file: Path, payload: Dict[str, Any]) -> None:
    try:
        with cache_file.open("w", encoding="utf-8") as fh:
            json.dump(payload, fh)
    except Exception as exc:
        logger.debug("Unable to write OSM cache file %s: %s", cache_file, exc)


def extract_osm_context(
    polygon_geojson: Any,
    buffer_km: float = 10.0,
    allow_overpass: bool = True,
    ignore_cache: bool = False,
) -> Dict[str, Any]:
    """
    Extracts OSM vector overlays (forest, water, roads, industrial) and computes real
    Verra VM0047 10 km leakage belt metrics.

    Resolution order:
      1. QuackOSM + DuckDB querying a local Bangladesh `.osm.pbf` extract if present.
      2. Overpass API fallback (`out geom`) when no local PBF is mounted and `allow_overpass=True`.
      3. Honest unavailable response (`osm_available=False`) with no synthetic features.
    """
    belt_info = compute_leakage_belt_geometry(polygon_geojson, buffer_km=buffer_km)
    project_poly: Polygon = belt_info["project_poly"]
    belt_poly: BaseGeometry = belt_info["belt_poly"]
    query_poly: BaseGeometry = belt_info["query_poly"]
    belt_area_ha: float = belt_info["leakage_belt_area_ha"]

    cache_dir = _get_cache_dir()
    parquet_path = resolve_local_geoparquet_path()
    pbf_path = resolve_local_pbf_path()

    if parquet_path is not None:
        source_tag = f"pq:{parquet_path.name}:{int(parquet_path.stat().st_mtime)}"
    elif pbf_path is not None:
        source_tag = f"pbf:{pbf_path.name}:{int(pbf_path.stat().st_mtime)}"
    else:
        source_tag = "overpass"
    cache_file = cache_dir / f"{_cache_key(project_poly, belt_info['buffer_km'], source_tag)}.json"

    if not ignore_cache:
        cached = _read_cached_response(cache_file)
        if cached is not None:
            # Ensure leakage belt geometry matches exact AOI even on bbox cache hit
            cached["leakage_belt"]["geojson"] = belt_info["leakage_belt_geojson"]
            cached["leakage_belt"]["leakage_belt_area_ha"] = belt_area_ha
            cached["leakage_belt"]["buffer_km"] = belt_info["buffer_km"]
            return cached

    features: List[Dict[str, Any]] = []
    source_used = "unavailable"
    error_detail: Optional[str] = None
    offline_env = os.getenv("DMRV_OFFLINE_ONLY", "").strip().lower() in {"1", "true", "yes"}

    if parquet_path is not None:
        try:
            features = _fetch_from_geoparquet(parquet_path, query_poly)
            source_used = "quackosm_geoparquet"
        except Exception as exc:
            logger.warning("GeoParquet read failed (%s): %s", parquet_path, exc)
            error_detail = f"geoparquet_error: {exc}"

    if source_used == "unavailable" and pbf_path is not None:
        try:
            features = _fetch_with_quackosm(pbf_path, query_poly, cache_dir)
            source_used = "quackosm_pbf"
        except Exception as exc:
            logger.warning("QuackOSM PBF read failed (%s): %s", pbf_path, exc)
            error_detail = f"quackosm_error: {exc}" if not error_detail else f"{error_detail}; quackosm_error: {exc}"

    if source_used == "unavailable" and allow_overpass and not offline_env:
        try:
            features = _fetch_with_overpass(query_poly, timeout=10)
            source_used = "overpass_api"
            error_detail = None
        except Exception as exc:
            logger.warning("Overpass API fallback unavailable: %s", exc)
            error_detail = f"overpass_error: {exc}" if not error_detail else f"{error_detail}; overpass_error: {exc}"

    if source_used == "unavailable":
        empty_layers = {k: {"type": "FeatureCollection", "features": []} for k in LAYER_FEATURE_CAPS}
        return {
            "osm_available": False,
            "source_used": "unavailable",
            "cached": False,
            "error_detail": error_detail or "No local .osm.pbf extract mounted and Overpass disabled/unreachable.",
            "layer_counts": {k: 0 for k in LAYER_FEATURE_CAPS},
            "layers": empty_layers,
            "leakage_belt": {
                "buffer_km": belt_info["buffer_km"],
                "leakage_belt_area_ha": belt_area_ha,
                "geojson": belt_info["leakage_belt_geojson"],
                "metrics": {
                    "road_length_km": 0.0,
                    "road_density_km_per_km2": 0.0,
                    "water_length_km": 0.0,
                    "cropland_area_ha": 0.0,
                    "cropland_share_pct": 0.0,
                    "forest_area_ha": 0.0,
                    "forest_share_pct": 0.0,
                    "industrial_count": 0,
                    "pressure_score": None,
                    "derived_leakage_loss_rate": None,
                    "leakage_source": "fallback_default_no_osm",
                },
            },
        }

    collections, counts = _serialize_geojson_layers(features)
    belt_metrics = compute_belt_metrics(features, belt_poly, belt_area_ha)

    # Supplement with Overture Maps building footprints when online & requested
    overture_res = (
        fetch_overture_buildings(query_poly, belt_poly=belt_poly, cache_dir=cache_dir)
        if (allow_overpass and not offline_env)
        else {"overture_available": False, "building_count": 0, "belt_building_count": 0, "features": {"type": "FeatureCollection", "features": []}}
    )
    collections["overture_buildings"] = overture_res.get("features", {"type": "FeatureCollection", "features": []})
    counts["overture_buildings"] = int(overture_res.get("building_count", 0))

    frontier = compute_frontier_accessibility(
        project_poly=project_poly,
        belt_poly=belt_poly,
        features=features,
        overture_buildings_count=int(overture_res.get("belt_building_count", 0)),
    )
    collections["hotspots"] = frontier.get("hotspots_geojson", {"type": "FeatureCollection", "features": []})
    counts["hotspots"] = len(collections["hotspots"].get("features", []))
    belt_metrics["nearest_road_km"] = frontier.get("nearest_road_km")
    belt_metrics["nearest_industrial_km"] = frontier.get("nearest_industrial_km")
    belt_metrics["overture_belt_buildings"] = int(overture_res.get("belt_building_count", 0))
    belt_metrics["mean_frontier_risk_score"] = frontier.get("mean_frontier_risk_score")

    response = {
        "osm_available": True,
        "source_used": source_used,
        "cached": False,
        "pbf_file": (
            parquet_path.name
            if parquet_path is not None and source_used == "quackosm_geoparquet"
            else (pbf_path.name if pbf_path is not None and source_used == "quackosm_pbf" else None)
        ),
        "layer_counts": counts,
        "layers": collections,
        "overture": {
            "overture_available": bool(overture_res.get("overture_available")),
            "source_used": overture_res.get("source_used"),
            "belt_building_count": int(overture_res.get("belt_building_count", 0)),
        },
        "frontier_analytics": {k: v for k, v in frontier.items() if k != "hotspots_geojson"},
        "leakage_belt": {
            "buffer_km": belt_info["buffer_km"],
            "leakage_belt_area_ha": belt_area_ha,
            "geojson": belt_info["leakage_belt_geojson"],
            "metrics": belt_metrics,
        },
    }
    _write_cached_response(cache_file, response)
    return response
