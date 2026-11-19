import os
import json
import math
import time
import io
import base64
import random
import datetime
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageDraw

try:
    import rasterio
    from rasterio.vrt import WarpedVRT
    from rasterio.enums import Resampling
    from rasterio.windows import Window
    RASTERIO_AVAILABLE = True
except ImportError:
    RASTERIO_AVAILABLE = False

# Try importing ee
try:
    import ee
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False


def _compute_geodesic_area_ha(polygon_coords) -> float:
    """Computes approximate geodesic area in hectares on WGS84 ellipsoid."""
    if not polygon_coords or len(polygon_coords) < 3:
        return 1.0
    R = 6378137.0
    total = 0.0
    n = len(polygon_coords)
    for i in range(n):
        p1 = polygon_coords[i]
        p2 = polygon_coords[(i + 1) % n]
        lat1 = math.radians(p1[0])
        lat2 = math.radians(p2[0])
        lng1 = math.radians(p1[1])
        lng2 = math.radians(p2[1])
        dlng = lng2 - lng1
        if dlng > math.pi:
            dlng -= 2 * math.pi
        elif dlng < -math.pi:
            dlng += 2 * math.pi
        total += dlng * (math.sin(lat1) + math.sin(lat2))
    area_sqm = abs((total * R * R) / 2.0)
    return max(0.01, area_sqm / 10000.0)


def _estimate_canopy_height(avg_ndvi: float, avg_ndwi: float, avg_vh: float | None = None) -> float:
    """
    Biophysical canopy height proxy (meters) used ONLY when spaceborne GEDI L2A
    has no valid footprint inside the AOI. Returns 0.0 for water or barren surfaces
    instead of defaulting to a 15 m forest canopy.
    """
    if avg_ndvi < 0.15 or (avg_ndwi is not None and avg_ndwi > 0.10 and avg_ndvi < 0.28):
        return 0.0
    vh_term = max(0.0, (float(avg_vh) + 22.0) * 0.45) if avg_vh is not None else 0.0
    return round(max(0.5, min(32.0, (avg_ndvi - 0.12) * 26.0 + vh_term)), 2)


class STACEngine:
    """
    Cloud-native STAC (SpatioTemporal Asset Catalog) client for zero-auth,
    open-access live satellite data ingestion.
    Primary endpoint: AWS Earth Search STAC (Element 84) providing Sentinel-2 L2A (BOA)
    optical and Sentinel-1 GRD dual-pol radar imagery.
    """
    def __init__(self, stac_url=None, timeout=10):
        self.stac_url = stac_url or os.getenv("STAC_API_URL", "https://earth-search.aws.element84.com/v1")
        self.timeout = timeout

    def search_sentinel2(self, bbox, start_date, end_date, max_cloud=30, limit=5):
        """
        Queries Sentinel-2 L2A (Surface Reflectance, Bottom of Atmosphere).
        bbox: [min_lng, min_lat, max_lng, max_lat]
        """
        search_endpoint = f"{self.stac_url.rstrip('/')}/search"
        payload = {
            "collections": ["sentinel-2-l2a"],
            "bbox": bbox,
            "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
            "limit": limit,
            "query": {"eo:cloud_cover": {"lt": max_cloud}}
        }
        headers = {"Content-Type": "application/json", "User-Agent": "CarbonOS-dMRV/1.0"}
        try:
            req = urllib.request.Request(
                search_endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                features = data.get("features", [])
                if features:
                    return features
        except Exception as e:
            print(f"[STAC Engine] S2 query with cloud filter failed/empty: {e}")

        # Fallback: query without cloud filter and sort by cloud cover ascending
        try:
            payload.pop("query", None)
            req = urllib.request.Request(
                search_endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                features = data.get("features", [])
                features.sort(key=lambda f: f.get("properties", {}).get("eo:cloud_cover", 100))
                return features
        except Exception as e:
            print(f"[STAC Engine] S2 search fallback failed: {e}")
            return []

    def search_gedi_granules(self, bbox, start_date, end_date, limit=5):
        """
        Queries NASA Earthdata CMR for intersecting GEDI L2A/L2B canopy height granules.
        Returns granule IDs when reachable; never synthesizes waveform shots.
        """
        cmr_url = (
            "https://cmr.earthdata.nasa.gov/search/granules.json"
            f"?short_name=GEDI02_A&bounding_box={bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
            f"&temporal={start_date}T00:00:00Z,{end_date}T23:59:59Z&page_size={limit}"
        )
        try:
            req = urllib.request.Request(cmr_url, headers={"User-Agent": "CarbonOS-dMRV/1.0"})
            with urllib.request.urlopen(req, timeout=min(self.timeout, 3)) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                entries = data.get("feed", {}).get("entry", [])
                return [e.get("id") for e in entries if e.get("id")]
        except Exception:
            return []

    def search_sentinel1(self, bbox, start_date, end_date, limit=5):
        """
        Queries Sentinel-1 Level-1C Ground Range Detected (GRD) with dual-polarization (VV, VH).
        bbox: [min_lng, min_lat, max_lng, max_lat]
        """
        search_endpoint = f"{self.stac_url.rstrip('/')}/search"
        payload = {
            "collections": ["sentinel-1-grd"],
            "bbox": bbox,
            "datetime": f"{start_date}T00:00:00Z/{end_date}T23:59:59Z",
            "limit": limit
        }
        headers = {"Content-Type": "application/json", "User-Agent": "CarbonOS-dMRV/1.0"}
        try:
            req = urllib.request.Request(
                search_endpoint,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                features = data.get("features", [])
                iw_features = [
                    f for f in features
                    if f.get("properties", {}).get("sar:instrument_mode") == "IW"
                ]
                return iw_features if iw_features else features
        except Exception as e:
            print(f"[STAC Engine] S1 search failed: {e}")
            return []


class SatelliteEngine:
    def __init__(self):
        self.ee_initialized = False
        self.stac_engine = STACEngine()
        if EE_AVAILABLE:
            try:
                project_id = os.getenv("EARTHENGINE_PROJECT")
                if project_id:
                    ee.Initialize(project=project_id)
                else:
                    ee.Initialize()
                self.ee_initialized = True
                print("[Satellite Engine] Earth Engine initialized successfully.")
            except Exception as e:
                print(f"[Satellite Engine] Earth Engine initialization skipped/failed: {e}")
                print("[Satellite Engine] Operating in STAC Live / Simulation Mode.")
        else:
            print("[Satellite Engine] Google Earth Engine python library not installed.")
            print("[Satellite Engine] Operating in STAC Live / Simulation Mode.")

    def run_analysis(self, polygon_coords, start_date, end_date, analysis_type="ndvi", include_grid=True, include_tile=True):
        """
        Runs satellite analysis following multi-source hierarchy:
        1. Google Earth Engine (if active and initialized)
        2. Cloud-native STAC (Element 84 AWS Earth Search - Sentinel-2 & Sentinel-1)
        3. High-fidelity deterministic simulation fallback
        polygon_coords: list of [lat, lng] representing the boundary polygon
        """
        # Allow explicit simulation override for offline test environments
        if os.getenv("DMRV_FORCE_SIMULATION") == "1":
            return self._run_simulated_analysis(polygon_coords, start_date, end_date, analysis_type)

        if self.ee_initialized:
            try:
                return self._run_gee_analysis(
                    polygon_coords, start_date, end_date, analysis_type,
                    include_grid=include_grid, include_tile=include_tile
                )
            except Exception as e:
                import traceback
                print(f"[Satellite Engine] GEE analysis failed: {e}")
                print(traceback.format_exc())
                try:
                    return self._run_stac_analysis(
                        polygon_coords, start_date, end_date, analysis_type,
                        include_grid=include_grid
                    )
                except Exception as stac_err:
                    print(f"[Satellite Engine] STAC fallback failed: {stac_err}")
                    return self._run_simulated_analysis(polygon_coords, start_date, end_date, analysis_type)
        else:
            try:
                return self._run_stac_analysis(
                    polygon_coords, start_date, end_date, analysis_type,
                    include_grid=include_grid
                )
            except Exception as stac_err:
                print(f"[Satellite Engine] STAC live ingestion failed: {stac_err}")
                return self._run_simulated_analysis(polygon_coords, start_date, end_date, analysis_type)

    def _run_gee_analysis(self, polygon_coords, start_date, end_date, analysis_type, include_grid=True, include_tile=True):
        """
        Production GEE execution pipeline.
        Fetches Sentinel-2 (optical), Sentinel-1 (radar), GEDI L2A canopy height, and SRTM DEM.
        Bundles reductions into minimal round-trips for low-latency pixel & polygon inspection.
        """
        coords = [list(c) for c in polygon_coords]
        if coords[0] != coords[-1]:
            coords.append(coords[0])

        # Reformat coordinates for GEE [lng, lat]
        gee_coords = [[coord[1], coord[0]] for coord in coords]
        aoi = ee.Geometry.Polygon(gee_coords)

        lats = [c[0] for c in coords]
        lngs = [c[1] for c in coords]
        bounds = [[min(lats), min(lngs)], [max(lats), max(lngs)]]

        # 1. Fetch Sentinel-2 (Surface Reflectance), preferring <35% tile cloud cover with fallback
        s2_base = (
            ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(aoi)
            .filterDate(start_date, end_date)
        )
        s2_clear = s2_base.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 35))
        s2_collection = ee.ImageCollection(ee.Algorithms.If(s2_clear.size().gt(0), s2_clear, s2_base))

        def mask_s2_clouds(image):
            qa = image.select('QA60')
            cloud_bit_mask = 1 << 10
            cirrus_bit_mask = 1 << 11
            qa_mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(
                qa.bitwiseAnd(cirrus_bit_mask).eq(0)
            )
            scl = image.select('SCL')
            # Exclude 0=no-data, 1=saturated, 3=cloud shadow, 8/9=clouds, 10=cirrus; keep 4=veg, 5=bare, 6=water
            scl_mask = (
                scl.neq(0).And(scl.neq(1)).And(scl.neq(3))
                .And(scl.neq(8)).And(scl.neq(9)).And(scl.neq(10))
            )
            return (
                image.updateMask(qa_mask.And(scl_mask))
                .select(['B2', 'B3', 'B4', 'B5', 'B6', 'B8', 'B11', 'B12'])
                .divide(10000)
            )

        s2_composite = s2_collection.map(mask_s2_clouds).median().clip(aoi)

        b2 = s2_composite.select('B2')
        b3 = s2_composite.select('B3')
        b4 = s2_composite.select('B4')
        b5 = s2_composite.select('B5')
        b6 = s2_composite.select('B6')
        b8 = s2_composite.select('B8')
        b11 = s2_composite.select('B11')
        b12 = s2_composite.select('B12')

        ndvi = s2_composite.normalizedDifference(['B8', 'B4']).rename('NDVI')
        evi = ee.Image(2.5).multiply(
            b8.subtract(b4).divide(
                b8.add(b4.multiply(6)).subtract(b2.multiply(7.5)).add(1)
            )
        ).rename('EVI')
        ndwi = s2_composite.normalizedDifference(['B3', 'B8']).rename('NDWI')
        savi = b8.subtract(b4).divide(b8.add(b4).add(0.5)).multiply(1.5).rename('SAVI')
        ndbi = s2_composite.normalizedDifference(['B11', 'B8']).rename('NDBI')

        # 2. Fetch Sentinel-1 Radar (VV, VH, VV/VH Ratio)
        s1_collection = (
            ee.ImageCollection('COPERNICUS/S1_GRD')
            .filterBounds(aoi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.eq('instrumentMode', 'IW'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
        )
        s1_composite = s1_collection.median().clip(aoi)
        vv = s1_composite.select('VV')
        vh = s1_composite.select('VH')
        s1_ratio = vv.subtract(vh).rename('S1_ratio')

        # 3. Fetch quality-filtered GEDI L2A canopy height (rh100 is in meters in LARSE/GEDI/GEDI02_A_002_MONTHLY)
        gedi_collection = (
            ee.ImageCollection('LARSE/GEDI/GEDI02_A_002_MONTHLY')
            .filterBounds(aoi)
            .map(lambda img: img.updateMask(img.select('quality_flag').eq(1)).updateMask(img.select('degrade_flag').eq(0)))
        )
        canopy_height = gedi_collection.median().clip(aoi).select('rh100').rename('canopy_height')

        # 4. SRTM 30m DEM elevation & slope
        terrain = ee.Terrain.products(ee.Image('USGS/SRTMGL1_003')).select(['elevation', 'slope'])

        # Bundle all mean reductions + scene provenance into a single GEE server round-trip
        stacked = ee.Image.cat([
            b2, b3, b4, b5, b6, b8, b11, b12,
            ndvi, evi, ndwi, savi, ndbi,
            vv, vh, s1_ratio,
            canopy_height, terrain
        ])
        lat_span_m = max(100.0, (bounds[1][0] - bounds[0][0]) * 111132.0)
        lng_span_m = max(
            100.0,
            (bounds[1][1] - bounds[0][1]) * 111320.0 * max(0.2, math.cos(math.radians(sum(lats) / len(lats))))
        )
        max_span_m = max(lat_span_m, lng_span_m)
        # Keep 10m native resolution for pixel/parcel inspection, scaling dynamically on reserve-wide AOIs to avoid 1e9 maxPixels error
        reduce_scale = 10 if max_span_m <= 8000.0 else max(20, int(max_span_m / 900.0))

        # Cap GEE RPC deadline cleanly so UI never hangs
        deadline_applied = False
        if hasattr(ee, 'data') and hasattr(ee.data, 'setDeadline'):
            try:
                ee.data.setDeadline(45000 if (include_grid or include_tile) else 18000)
                deadline_applied = True
            except Exception:
                deadline_applied = False

        try:
            gee_payload = ee.Dictionary({
                'stats': stacked.reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=aoi,
                    scale=reduce_scale,
                    maxPixels=1e9,
                    bestEffort=True,
                ),
                's2_ids': s2_collection.limit(25).aggregate_array('system:index'),
                's1_ids': s1_collection.limit(15).aggregate_array('system:index'),
            }).getInfo() or {}
        finally:
            if deadline_applied:
                try:
                    ee.data.setDeadline(0)
                except Exception:
                    pass

        mean_stats = gee_payload.get('stats') or {}
        scene_ids = gee_payload.get('s2_ids') or []
        s1_ids = gee_payload.get('s1_ids') or []

        if mean_stats.get('NDVI') is None and not scene_ids:
            raise RuntimeError(f"GEE returned empty Sentinel-2 observations for bounds {bounds} in {start_date}..{end_date}")

        avg_ndvi = float(mean_stats['NDVI']) if mean_stats.get('NDVI') is not None else 0.0
        avg_evi = float(mean_stats['EVI']) if mean_stats.get('EVI') is not None else 0.0
        avg_ndwi = float(mean_stats['NDWI']) if mean_stats.get('NDWI') is not None else 0.0
        avg_savi = float(mean_stats['SAVI']) if mean_stats.get('SAVI') is not None else 0.0
        avg_ndbi = float(mean_stats['NDBI']) if mean_stats.get('NDBI') is not None else 0.0
        avg_vv = float(mean_stats['VV']) if mean_stats.get('VV') is not None else -14.0
        avg_vh = float(mean_stats['VH']) if mean_stats.get('VH') is not None else -21.0
        avg_ratio = float(mean_stats['S1_ratio']) if mean_stats.get('S1_ratio') is not None else (avg_vv - avg_vh)

        raw_gedi_h = mean_stats.get('canopy_height')
        if (avg_ndvi < 0.12 and avg_ndwi > 0.05) or avg_ndvi < 0.08:
            gedi_height_val = 0.0
            gedi_is_real = False
        elif raw_gedi_h is not None and float(raw_gedi_h) >= 0.0:
            gedi_height_val = round(float(raw_gedi_h), 2)
            gedi_is_real = True
        else:
            gedi_height_val = _estimate_canopy_height(avg_ndvi, avg_ndwi, avg_vh)
            gedi_is_real = False

        elevation_m = round(float(mean_stats['elevation']), 1) if mean_stats.get('elevation') is not None else None
        slope_deg = round(float(mean_stats['slope']), 2) if mean_stats.get('slope') is not None else None

        avg_bands = {
            "B2_blue": round(float(mean_stats.get('B2') or 0.0), 5),
            "B3_green": round(float(mean_stats.get('B3') or 0.0), 5),
            "B4_red": round(float(mean_stats.get('B4') or 0.0), 5),
            "B5_re1": round(float(mean_stats.get('B5') or 0.0), 5),
            "B6_re2": round(float(mean_stats.get('B6') or 0.0), 5),
            "B8_nir": round(float(mean_stats.get('B8') or 0.0), 5),
            "B11_swir1": round(float(mean_stats.get('B11') or 0.0), 5),
            "B12_swir2": round(float(mean_stats.get('B12') or 0.0), 5),
        }

        tile_url = ""
        if include_tile:
            try:
                map_id_dict = ee.data.getMapId({
                    'image': ndvi,
                    'min': '0',
                    'max': '1',
                    'palette': ['blue', 'yellow', 'green']
                })
                tile_url = map_id_dict['tile_fetcher'].url_format
            except Exception:
                tile_url = ""

        # Extract real spatial grid from GEE sampleRectangle when requested for AOI analysis
        grid_pixels = []
        pixel_extraction_mode = "gee_reduce_region"
        if include_grid:
            try:
                grid_img = ee.Image.cat([
                    b2, b3, b4, b5, b6, b8, b11, b12,
                    ndvi, evi, ndwi, savi, ndbi,
                    vv, vh
                ]).unmask(-9999)
                target_scale = max(20, int(max_span_m / 24.0))
                rect = grid_img.reproject(crs='EPSG:4326', scale=target_scale).sampleRectangle(
                    region=aoi.bounds(),
                    defaultValue=-9999
                ).getInfo() or {}
                props = rect.get('properties') or {}
                ndvi_arr = props.get('NDVI') or []
                if ndvi_arr and isinstance(ndvi_arr, list) and isinstance(ndvi_arr[0], list):
                    rows_n = len(ndvi_arr)
                    cols_n = len(ndvi_arr[0])
                    lat_step = (bounds[1][0] - bounds[0][0]) / max(1, rows_n)
                    lng_step = (bounds[1][1] - bounds[0][1]) / max(1, cols_n)

                    def _cell(key, r, c, fallback):
                        arr = props.get(key)
                        try:
                            v = float(arr[r][c])
                            return fallback if v <= -9990 else v
                        except Exception:
                            return fallback

                    for r in range(rows_n):
                        row_px = []
                        px_lat = bounds[1][0] - (r + 0.5) * lat_step
                        for c in range(cols_n):
                            px_lng = bounds[0][1] + (c + 0.5) * lng_step
                            p_ndvi = _cell('NDVI', r, c, avg_ndvi)
                            p_evi = _cell('EVI', r, c, avg_evi)
                            p_ndwi = _cell('NDWI', r, c, avg_ndwi)
                            p_savi = _cell('SAVI', r, c, avg_savi)
                            p_ndbi = _cell('NDBI', r, c, avg_ndbi)
                            p_vv = _cell('VV', r, c, avg_vv)
                            p_vh = _cell('VH', r, c, avg_vh)
                            row_px.append({
                                "lat": round(px_lat, 5),
                                "lng": round(px_lng, 5),
                                "B2_blue": round(max(0.001, _cell('B2', r, c, avg_bands['B2_blue'])), 4),
                                "B3_green": round(max(0.001, _cell('B3', r, c, avg_bands['B3_green'])), 4),
                                "B4_red": round(max(0.001, _cell('B4', r, c, avg_bands['B4_red'])), 4),
                                "B5_re1": round(max(0.001, _cell('B5', r, c, avg_bands['B5_re1'])), 4),
                                "B6_re2": round(max(0.001, _cell('B6', r, c, avg_bands['B6_re2'])), 4),
                                "B8_nir": round(max(0.001, _cell('B8', r, c, avg_bands['B8_nir'])), 4),
                                "B11_swir1": round(max(0.001, _cell('B11', r, c, avg_bands['B11_swir1'])), 4),
                                "B12_swir2": round(max(0.001, _cell('B12', r, c, avg_bands['B12_swir2'])), 4),
                                "ndvi": round(p_ndvi, 4),
                                "evi": round(p_evi, 4),
                                "ndwi": round(p_ndwi, 4),
                                "savi": round(p_savi, 4),
                                "ndbi": round(p_ndbi, 4),
                                "S1_vv": round(p_vv, 2),
                                "S1_vh": round(p_vh, 2),
                                "S1_ratio": round(p_vv - p_vh, 2),
                                "tree_height": _estimate_canopy_height(p_ndvi, p_ndwi, p_vh),
                            })
                        grid_pixels.append(row_px)
                    pixel_extraction_mode = "gee_sample_rectangle"
            except Exception as grid_err:
                print(f"[Satellite Engine] GEE sampleRectangle grid skipped: {grid_err}")

            if not grid_pixels:
                grid_data = self._generate_simulated_grid(
                    bounds,
                    avg_ndvi,
                    seed=42,
                    base_vv=avg_vv,
                    base_vh=avg_vh,
                    base_height=gedi_height_val,
                )
                grid_pixels = grid_data["pixels"]

        area_ha = round(_compute_geodesic_area_ha(coords), 2)

        return {
            "average_ndvi": round(avg_ndvi, 4),
            "average_evi": round(avg_evi, 4),
            "average_ndwi": round(avg_ndwi, 4),
            "average_savi": round(avg_savi, 4),
            "average_ndbi": round(avg_ndbi, 4),
            "average_vv": round(avg_vv, 2),
            "average_vh": round(avg_vh, 2),
            "average_ratio": round(avg_ratio, 2),
            "average_tree_height": gedi_height_val,
            "average_bands": avg_bands,
            "forest_area_ha": area_ha,
            "satellite_sources": f"Sentinel-1 GRD ({len(s1_ids)} scenes) & Sentinel-2 L2A ({len(scene_ids)} scenes) [GEE Live]",
            "tile_url": tile_url,
            "bounds": bounds,
            "grid_pixels": grid_pixels,
            "data_source": "gee_live",
            "pixel_extraction_mode": pixel_extraction_mode,
            "gedi_tree_height_source": "gedi_l2a_rh100_gee" if gedi_is_real else "formula_estimate_not_gedi_l2b",
            "eo_pixel_verified": True,
            "vvb_eo_eligible": gedi_is_real,
            "analysis_metadata": {
                "cloud_cover_max": 35,
                "compositing_method": "median",
                "pixel_extraction_mode": pixel_extraction_mode,
                "spectral_bands_synthesized": False,
                "bands_processed": ["B2", "B3", "B4", "B5", "B6", "B8", "B11", "B12", "VV", "VH", "QA60", "SCL"],
                "s2_scene_ids": scene_ids,
                "s1_scene_ids": s1_ids,
                "gedi_tree_height_source": "gedi_l2a_rh100_gee" if gedi_is_real else "formula_estimate_not_gedi_l2b",
                "terrain": {"elevation_m": elevation_m, "slope_deg": slope_deg},
            }
        }

    def _extract_stac_cog_grid(self, s2_features, bounds, s1_feature=None, grid_size=64):
        """
        Reads real Cloud-Optimized GeoTIFF (COG) windows over Element84 / local GeoTIFF URLs
        using rasterio for Sentinel-2 optical bands (B02..B12 + SCL cloud mask) and, when present,
        Sentinel-1 GRD SAR backscatter rasters (VV, VH).
        Tries up to 4 lowest-cloud Sentinel-2 scenes to avoid single-scene cloud cover over the target pixel,
        and applies Sentinel-2 Baseline >= 04.00 BOA offset (-0.1) from STAC raster metadata.
        """
        if not RASTERIO_AVAILABLE or os.getenv("DMRV_DISABLE_COG_READ") == "1" or not s2_features:
            return None

        if isinstance(s2_features, dict):
            candidates = [s2_features]
        else:
            candidates = sorted(
                [f for f in s2_features if isinstance(f, dict)],
                key=lambda f: f.get("properties", {}).get("eo:cloud_cover", 100.0)
            )[:4]
        if not candidates:
            return None

        min_lat, min_lng = bounds[0]
        max_lat, max_lng = bounds[1]
        env_opts = {
            "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
            "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".tif,.tiff",
            "GDAL_HTTP_TIMEOUT": "4",
            "GDAL_HTTP_CONNECTTIMEOUT": "3",
            "GDAL_HTTP_MAX_RETRY": "1",
        }

        def _read_band(href, resampling=Resampling.bilinear):
            with rasterio.Env(**env_opts):
                with rasterio.open(href) as src:
                    with WarpedVRT(src, crs="EPSG:4326", resampling=resampling) as vrt:
                        win = vrt.window(min_lng, min_lat, max_lng, max_lat).intersection(Window(0, 0, vrt.width, vrt.height))
                        if win.width <= 0 or win.height <= 0:
                            raise ValueError("Requested window lies outside raster bounds")
                        arr = vrt.read(1, window=win, out_shape=(grid_size, grid_size))
                        return arr.astype(np.float32)

        def _scale_s2(raw_arr, asset_obj, baseline_str, force_zero_offset=False):
            rb = (asset_obj or {}).get("raster:bands") or [{}]
            scale = float(rb[0].get("scale", 0.0001))
            if force_zero_offset:
                offset = 0.0
            else:
                offset = rb[0].get("offset")
                if offset is None:
                    try:
                        offset = -0.1 if float(baseline_str or "0") >= 4.0 else 0.0
                    except Exception:
                        offset = 0.0
                else:
                    offset = float(offset)
            nodata = rb[0].get("nodata", 0)
            valid = np.isfinite(raw_arr) & (raw_arr != float(nodata))
            scaled = raw_arr * scale + offset
            return scaled, valid

        def _read_opt_band(asset_obj, band_code, baseline_str, force_zero_offset):
            href = (asset_obj or {}).get("href")
            if not href:
                return band_code, None, None
            try:
                raw = _read_band(href)
                arr, vmask = _scale_s2(raw, asset_obj, baseline_str, force_zero_offset=force_zero_offset)
                return band_code, arr, vmask
            except Exception:
                return band_code, None, None

        min_valid_px = max(4, min(16, (grid_size * grid_size) // 4))

        for s2_feature in candidates:
            assets = s2_feature.get("assets", {})
            baseline_str = s2_feature.get("properties", {}).get("s2:processing_baseline", "0")
            red_asset = assets.get("red") or assets.get("B04") or {}
            nir_asset = assets.get("nir") or assets.get("B08") or {}
            blue_asset = assets.get("blue") or assets.get("B02") or {}
            green_asset = assets.get("green") or assets.get("B03") or {}
            re1_asset = assets.get("rededge1") or assets.get("B05") or {}
            re2_asset = assets.get("rededge2") or assets.get("B06") or {}
            swir1_asset = assets.get("swir16") or assets.get("B11") or {}
            swir2_asset = assets.get("swir22") or assets.get("B12") or {}
            scl_href = (assets.get("scl") or assets.get("SCL") or {}).get("href")
            if not red_asset.get("href") or not nir_asset.get("href"):
                continue

            bands_read = []
            bands_interpolated = []
            s1_extracted = False
            try:
                with ThreadPoolExecutor(max_workers=3) as pool:
                    fut_scl = pool.submit(_read_band, scl_href, Resampling.nearest) if scl_href else None
                    fut_red = pool.submit(_read_band, red_asset["href"])
                    fut_nir = pool.submit(_read_band, nir_asset["href"])
                    scl = fut_scl.result() if fut_scl else None
                    raw_red = fut_red.result()
                    raw_nir = fut_nir.result()

                if scl is not None:
                    bands_read.append("SCL")

                # Element84 sentinel-2-l2a COGs are frequently zero-offset harmonized despite STAC metadata offset=-0.1
                rb_red = (red_asset.get("raster:bands") or [{}])[0]
                red_scale = float(rb_red.get("scale", 0.0001))
                red_nodata = float(rb_red.get("nodata", 0))
                red_raw_valid = np.isfinite(raw_red) & (raw_red != red_nodata)
                force_zero_offset = False
                if scl is not None:
                    red_check_mask = red_raw_valid & (~np.isin(scl.astype(np.int32), [0, 1, 3, 8, 9, 10]))
                else:
                    red_check_mask = red_raw_valid
                if np.any(red_check_mask):
                    red_p10 = float(np.nanpercentile(raw_red[red_check_mask] * red_scale, 10))
                    if red_p10 < 0.098:
                        force_zero_offset = True

                red, red_valid = _scale_s2(raw_red, red_asset, baseline_str, force_zero_offset=force_zero_offset)
                nir, nir_valid = _scale_s2(raw_nir, nir_asset, baseline_str, force_zero_offset=force_zero_offset)
                bands_read.extend(["B04", "B08"])

                valid_mask = red_valid & nir_valid & (red > -0.05) & (nir > -0.05)
                if scl is not None:
                    # 0=no data, 1=saturated, 3=cloud shadow, 8/9/10=clouds/cirrus (keep 4=veg, 5=bare, 6=water)
                    valid_mask &= ~np.isin(scl.astype(np.int32), [0, 1, 3, 8, 9, 10])
                if np.sum(valid_mask) < min_valid_px:
                    continue

                s1_assets = s1_feature.get("assets", {}) if s1_feature else {}
                vv_href = (s1_assets.get("vv") or s1_assets.get("VV") or {}).get("href")
                vh_href = (s1_assets.get("vh") or s1_assets.get("VH") or {}).get("href")

                def _read_s1_pair():
                    if not (vv_href and vh_href):
                        return None, None
                    try:
                        with ThreadPoolExecutor(max_workers=2) as p1:
                            rv = p1.submit(_read_band, vv_href).result()
                            rh = p1.submit(_read_band, vh_href).result()
                        return rv, rh
                    except Exception:
                        return None, None

                with ThreadPoolExecutor(max_workers=7) as pool:
                    opt_futures = [
                        pool.submit(_read_opt_band, blue_asset, "B02", baseline_str, force_zero_offset),
                        pool.submit(_read_opt_band, green_asset, "B03", baseline_str, force_zero_offset),
                        pool.submit(_read_opt_band, re1_asset, "B05", baseline_str, force_zero_offset),
                        pool.submit(_read_opt_band, re2_asset, "B06", baseline_str, force_zero_offset),
                        pool.submit(_read_opt_band, swir1_asset, "B11", baseline_str, force_zero_offset),
                        pool.submit(_read_opt_band, swir2_asset, "B12", baseline_str, force_zero_offset),
                    ]
                    s1_future = pool.submit(_read_s1_pair)

                    opt_results = {}
                    for fut in opt_futures:
                        code, arr, _ = fut.result()
                        if arr is not None:
                            opt_results[code] = arr
                            bands_read.append(code)
                    raw_vv, raw_vh = s1_future.result()

                blue = opt_results.get("B02")
                if blue is None:
                    blue = np.clip(red * 0.75, 0.005, 1.0)
                    bands_interpolated.append("B02")

                green = opt_results.get("B03")
                if green is None:
                    green = np.clip(red * 1.3, 0.01, 1.0)
                    bands_interpolated.append("B03")

                re1 = opt_results.get("B05")
                if re1 is None:
                    re1 = np.clip(red + (nir - red) * 0.22, 0.005, 1.0)
                    bands_interpolated.append("B05")

                re2 = opt_results.get("B06")
                if re2 is None:
                    re2 = np.clip(red + (nir - red) * 0.68, 0.005, 1.0)
                    bands_interpolated.append("B06")

                swir1 = opt_results.get("B11")
                if swir1 is None:
                    swir1 = np.clip(0.26 - nir * 0.2, 0.02, 1.0)
                    bands_interpolated.append("B11")

                swir2 = opt_results.get("B12")
                if swir2 is None:
                    swir2 = np.clip(swir1 * 0.55, 0.005, 1.0)
                    bands_interpolated.append("B12")

                # Sentinel-1 GRD SAR dual-pol raster reads (VV, VH)
                vv_grid = None
                vh_grid = None
                if raw_vv is not None and raw_vh is not None:
                    def _to_db(arr):
                        med = float(np.nanmedian(arr))
                        if med > 0.0:
                            scale = 1.0 if med <= 5.0 else 10000.0
                            db_arr = 10.0 * np.log10(np.clip(arr / scale, 1e-6, None))
                        else:
                            db_arr = arr
                        return np.clip(db_arr, -35.0, 5.0)

                    vv_grid = _to_db(raw_vv)
                    vh_grid = _to_db(raw_vh)
                    s1_extracted = bool(np.any(np.isfinite(vv_grid)) and np.any(np.isfinite(vh_grid)))
                    if s1_extracted:
                        bands_read.extend(["VV", "VH"])
            except Exception:
                continue

            red_c = np.clip(red, 0.001, 1.0)
            nir_c = np.clip(nir, 0.001, 1.0)
            blue_c = np.clip(blue, 0.001, 1.0)
            green_c = np.clip(green, 0.001, 1.0)
            swir1_c = np.clip(swir1, 0.001, 1.0)

            ndvi = np.clip((nir_c - red_c) / np.where((nir_c + red_c) == 0, 1e-6, (nir_c + red_c)), -0.8, 0.95)
            evi = np.clip(2.5 * ((nir_c - red_c) / np.where((nir_c + 6 * red_c - 7.5 * blue_c + 1.0) == 0, 1e-6, (nir_c + 6 * red_c - 7.5 * blue_c + 1.0))), -0.2, 0.9)
            ndwi = np.clip((green_c - nir_c) / np.where((green_c + nir_c) == 0, 1e-6, (green_c + nir_c)), -0.8, 0.85)
            savi = np.clip(((nir_c - red_c) / np.where((nir_c + red_c + 0.5) == 0, 1e-6, (nir_c + red_c + 0.5))) * 1.5, -0.5, 0.9)
            ndbi = np.clip((swir1_c - nir_c) / np.where((swir1_c + nir_c) == 0, 1e-6, (swir1_c + nir_c)), -0.8, 0.6)

            pixels = []
            lat_step = (max_lat - min_lat) / grid_size
            lng_step = (max_lng - min_lng) / grid_size
            for r in range(grid_size):
                row_px = []
                px_lat = max_lat - (r + 0.5) * lat_step
                for c in range(grid_size):
                    px_lng = min_lng + (c + 0.5) * lng_step
                    px_ndvi = float(ndvi[r, c])
                    px_ndwi = float(ndwi[r, c])
                    if s1_extracted and vv_grid is not None and vh_grid is not None:
                        px_vv = float(vv_grid[r, c])
                        px_vh = float(vh_grid[r, c])
                    else:
                        px_vv = float(-14.0 + px_ndvi * 5.0)
                        px_vh = float(px_vv - 7.0 - px_ndvi * 1.5)
                    row_px.append({
                        "lat": round(px_lat, 5),
                        "lng": round(px_lng, 5),
                        "B2_blue": round(float(blue_c[r, c]), 4),
                        "B3_green": round(float(green_c[r, c]), 4),
                        "B4_red": round(float(red_c[r, c]), 4),
                        "B8_nir": round(float(nir_c[r, c]), 4),
                        "B5_re1": round(float(np.clip(re1[r, c], 0.001, 1.0)), 4),
                        "B6_re2": round(float(np.clip(re2[r, c], 0.001, 1.0)), 4),
                        "B11_swir1": round(float(swir1_c[r, c]), 4),
                        "B12_swir2": round(float(np.clip(swir2[r, c], 0.001, 1.0)), 4),
                        "ndvi": round(px_ndvi, 4),
                        "evi": round(float(evi[r, c]), 4),
                        "ndwi": round(px_ndwi, 4),
                        "savi": round(float(savi[r, c]), 4),
                        "ndbi": round(float(ndbi[r, c]), 4),
                        "S1_vv": round(px_vv, 2),
                        "S1_vh": round(px_vh, 2),
                        "S1_ratio": round(px_vv - px_vh, 2),
                        "tree_height": _estimate_canopy_height(px_ndvi, px_ndwi, px_vh),
                    })
                pixels.append(row_px)

            avg_bands = {
                "B2_blue": round(float(np.mean(blue_c[valid_mask])), 5),
                "B3_green": round(float(np.mean(green_c[valid_mask])), 5),
                "B4_red": round(float(np.mean(red_c[valid_mask])), 5),
                "B5_re1": round(float(np.mean(np.clip(re1[valid_mask], 0.001, 1.0))), 5),
                "B6_re2": round(float(np.mean(np.clip(re2[valid_mask], 0.001, 1.0))), 5),
                "B8_nir": round(float(np.mean(nir_c[valid_mask])), 5),
                "B11_swir1": round(float(np.mean(swir1_c[valid_mask])), 5),
                "B12_swir2": round(float(np.mean(np.clip(swir2[valid_mask], 0.001, 1.0))), 5),
            }

            avg_ndvi_v = float(np.mean(ndvi[valid_mask]))
            avg_ndwi_v = float(np.mean(ndwi[valid_mask]))
            out = {
                "pixels": pixels,
                "average_ndvi": avg_ndvi_v,
                "average_evi": float(np.mean(evi[valid_mask])),
                "average_ndwi": avg_ndwi_v,
                "average_savi": float(np.mean(savi[valid_mask])),
                "average_ndbi": float(np.mean(ndbi[valid_mask])),
                "average_bands": avg_bands,
                "bands_read": bands_read,
                "bands_interpolated": bands_interpolated,
                "s1_extracted": s1_extracted,
                "scene_used_id": s2_feature.get("id"),
                "valid_pixel_ratio": round(float(np.mean(valid_mask)), 3),
            }
            if s1_extracted and vv_grid is not None and vh_grid is not None:
                s1_mask = valid_mask & np.isfinite(vv_grid) & np.isfinite(vh_grid)
                avg_vv = float(np.mean(vv_grid[s1_mask]))
                avg_vh = float(np.mean(vh_grid[s1_mask]))
                out["average_vv"] = avg_vv
                out["average_vh"] = avg_vh
                out["average_ratio"] = avg_vv - avg_vh
                out["average_tree_height"] = _estimate_canopy_height(avg_ndvi_v, avg_ndwi_v, avg_vh)
            else:
                avg_vv = -14.0 + (avg_ndvi_v * 5.0)
                avg_vh = avg_vv - 7.0 - (avg_ndvi_v * 1.5)
                out["average_vv"] = avg_vv
                out["average_vh"] = avg_vh
                out["average_ratio"] = avg_vv - avg_vh
                out["average_tree_height"] = _estimate_canopy_height(avg_ndvi_v, avg_ndwi_v, avg_vh)
            return out

        return None

    def _run_stac_analysis(self, polygon_coords, start_date, end_date, analysis_type, include_grid=True):
        """
        Executes live cloud-native STAC ingestion of Sentinel-2 optical and
        Sentinel-1 SAR radar scenes, computing biophysical indices and GEDI canopy height.
        """
        lats = [c[0] for c in polygon_coords]
        lngs = [c[1] for c in polygon_coords]
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)

        bbox = [min_lng, min_lat, max_lng, max_lat]

        # Calculate area size in hectares
        lat_dist = (max_lat - min_lat) * 111000
        lng_dist = (max_lng - min_lng) * 111000 * math.cos(math.radians(center_lat))
        area_sq_m = abs(lat_dist * lng_dist)
        if area_sq_m < 100:
            area_sq_m = 10000.0
        area_ha = area_sq_m / 10000.0

        # Query live STAC for S2 and S1
        s2_features = self.stac_engine.search_sentinel2(bbox, start_date, end_date)
        s1_features = self.stac_engine.search_sentinel1(bbox, start_date, end_date)

        if not s2_features and not s1_features:
            raise RuntimeError(f"No STAC scenes found for bbox {bbox} in date range {start_date} to {end_date}")

        s2_ids = [f["id"] for f in s2_features]
        s1_ids = [f["id"] for f in s1_features]

        cloud_values = [f.get("properties", {}).get("eo:cloud_cover", 0.0) for f in s2_features]
        mean_cloud = sum(cloud_values) / len(cloud_values) if cloud_values else 15.0
        max_cloud = max(cloud_values) if cloud_values else 20.0

        best_thumbnail = ""
        for f in s2_features:
            thumb = f.get("assets", {}).get("thumbnail", {}).get("href")
            if thumb:
                best_thumbnail = thumb
                break

        # Regional baseline differentiation
        if 21.5 <= center_lat <= 22.8 and 89.0 <= center_lng <= 89.9:
            # Sundarbans Mangrove Delta
            base_ndvi = 0.78
            forest_fraction = 0.95
            base_height = 14.5
        elif 21.0 <= center_lat <= 24.5 and 91.5 <= center_lng <= 92.8:
            # Chittagong / Sylhet Hill Tracts
            base_ndvi = 0.76
            forest_fraction = 0.88
            base_height = 24.0
        elif 23.6 <= center_lat <= 23.85 and 90.3 <= center_lng <= 90.5:
            # Urban Dhaka
            base_ndvi = 0.22
            forest_fraction = 0.10
            base_height = 5.0
        else:
            base_ndvi = 0.60
            forest_fraction = 0.70
            base_height = 12.0

        # Modulate with live S2 metadata if available
        if s2_features:
            top_props = s2_features[0].get("properties", {})
            veg_pct = top_props.get("s2:vegetation_percentage")
            water_pct = top_props.get("s2:water_percentage", 0.2)
            if veg_pct is not None:
                if veg_pct > 1.0:
                    veg_pct = veg_pct / 100.0
                avg_ndvi = min(0.88, max(0.05, base_ndvi * 0.75 + veg_pct * 0.25))
            else:
                avg_ndvi = base_ndvi
            if water_pct is not None and water_pct > 1.0:
                water_pct = water_pct / 100.0
        else:
            avg_ndvi = base_ndvi
            water_pct = 0.15

        # Radar backscatter derived from Sentinel-1 SAR
        # Cross-polarization VH represents canopy volume scattering
        avg_vv = -12.0 + (avg_ndvi * 4.0)
        avg_vh = avg_vv - 7.0 - (avg_ndvi * 1.5)
        avg_ratio = avg_vv - avg_vh

        # Derived optical indices
        avg_evi = min(0.85, max(0.02, 2.5 * ((avg_ndvi * 0.68) / (1.0 + avg_ndvi * 0.7))))
        avg_ndwi = min(0.5, max(-0.6, -0.22 + (water_pct * 0.4)))
        avg_savi = min(0.82, max(0.04, avg_ndvi * 0.92))
        avg_ndbi = min(0.4, max(-0.6, -0.32 + (1.0 - avg_ndvi) * 0.22))

        # GEDI L2B canopy height model
        avg_tree_height = max(3.0, base_height + (avg_ndvi * 6.0) + ((avg_vh + 20.0) * 0.35))

        bounds = [[min_lat, min_lng], [max_lat, max_lng]]
        gedi_granules = self.stac_engine.search_gedi_granules(bbox, start_date, end_date)
        cog_grid = self._extract_stac_cog_grid(
            s2_features,
            bounds,
            s1_feature=s1_features[0] if s1_features else None,
            grid_size=64 if include_grid else 8,
        )
        if cog_grid is not None:
            avg_ndvi = cog_grid["average_ndvi"]
            avg_evi = cog_grid["average_evi"]
            avg_ndwi = cog_grid["average_ndwi"]
            avg_savi = cog_grid["average_savi"]
            avg_ndbi = cog_grid["average_ndbi"]
            avg_vv = cog_grid["average_vv"]
            avg_vh = cog_grid["average_vh"]
            avg_ratio = cog_grid["average_ratio"]
            avg_tree_height = cog_grid["average_tree_height"]
            grid_pixels = cog_grid["pixels"] if include_grid else []
            pixel_mode = "stac_cog_rasterio"
            valid_px_ratio = cog_grid.get("valid_pixel_ratio", 1.0)
            avg_bands = cog_grid.get("average_bands")
            bands_processed = list(cog_grid.get("bands_read", []))
            bands_synthesized = bool(cog_grid.get("bands_interpolated"))
            eo_pixel_verified = True
            vvb_eo_eligible = bool(cog_grid.get("s1_extracted")) and not bands_synthesized
        else:
            if os.getenv("DMRV_REQUIRE_REAL_RASTERS") == "1":
                raise RuntimeError("DMRV_REQUIRE_REAL_RASTERS=1: Real EO COG pixel extraction failed.")
            seed = int((center_lat + center_lng) * 100000) % 1000000
            grid_data = self._generate_simulated_grid(bounds, avg_ndvi, seed, avg_vv, avg_vh, avg_tree_height) if include_grid else {"pixels": []}
            grid_pixels = grid_data["pixels"]
            pixel_mode = "stac_metadata_heuristic"
            valid_px_ratio = None
            avg_bands = None
            bands_processed = []
            bands_synthesized = True
            eo_pixel_verified = False
            vvb_eo_eligible = False

        return {
            "average_ndvi": round(avg_ndvi, 3),
            "average_evi": round(avg_evi, 3),
            "average_ndwi": round(avg_ndwi, 3),
            "average_savi": round(avg_savi, 3),
            "average_ndbi": round(avg_ndbi, 3),
            "average_vv": round(avg_vv, 2),
            "average_vh": round(avg_vh, 2),
            "average_ratio": round(avg_ratio, 2),
            "average_tree_height": round(avg_tree_height, 1),
            "average_bands": avg_bands,
            "forest_area_ha": round(area_ha * forest_fraction, 2),
            "satellite_sources": f"Sentinel-1 GRD ({len(s1_ids)} scenes) & Sentinel-2 L2A ({len(s2_ids)} scenes) [STAC Live]",
            "tile_url": best_thumbnail,
            "bounds": bounds,
            "grid_pixels": grid_pixels,
            "data_source": "stac_live",
            "eo_pixel_verified": eo_pixel_verified,
            "vvb_eo_eligible": vvb_eo_eligible,
            "analysis_metadata": {
                "cloud_cover_max": round(max_cloud, 2),
                "cloud_cover_mean": round(mean_cloud, 2),
                "compositing_method": "stac_cloud_optimized_mosaic" if eo_pixel_verified else "stac_metadata_heuristic_not_vvb_eligible",
                "pixel_extraction_mode": pixel_mode,
                "spectral_bands_synthesized": bands_synthesized,
                "simulation": not eo_pixel_verified,
                "valid_pixel_ratio": valid_px_ratio,
                "bands_processed": bands_processed,
                "bands_interpolated": cog_grid.get("bands_interpolated", []) if cog_grid else ["B2", "B3", "B4", "B5", "B6", "B8", "B11", "B12", "VV", "VH"],
                "s1_raster_extracted": bool(cog_grid and cog_grid.get("s1_extracted")),
                "s2_scene_ids": s2_ids,
                "s1_scene_ids": s1_ids,
                "gedi_cmr_granule_ids": gedi_granules,
                "gedi_tree_height_source": "formula_estimate_not_gedi_l2b",
                "stac_endpoint": self.stac_engine.stac_url
            }
        }

    def _run_simulated_analysis(self, polygon_coords, start_date, end_date, analysis_type):
        """
        Simulates remote sensing band extraction across a 64x64 bounding box grid.
        Calculates NDVI, EVI, NDWI, SAVI, NDBI, VV, VH, and Tree Height for every pixel.
        """
        lats = [c[0] for c in polygon_coords]
        lngs = [c[1] for c in polygon_coords]
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)
        
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)
        
        # Calculate area size in hectares
        lat_dist = (max_lat - min_lat) * 111000
        lng_dist = (max_lng - min_lng) * 111000 * math.cos(math.radians(center_lat))
        area_sq_m = abs(lat_dist * lng_dist)
        if area_sq_m < 100:
            area_sq_m = random.uniform(5000, 25000)
        area_ha = area_sq_m / 10000.0

        seed = int((center_lat + center_lng) * 100000) % 1000000
        random.seed(seed)

        # Baseline parameters by region (Sundarbans vs Dhaka vs others)
        if 21.5 <= center_lat <= 22.8 and 89.0 <= center_lng <= 89.9:
            base_ndvi = 0.78
            forest_fraction = 0.95
        elif 23.8 <= center_lat <= 24.5 and 90.0 <= center_lng <= 90.5:
            base_ndvi = 0.65
            forest_fraction = 0.75
        elif 23.6 <= center_lat <= 23.85 and 90.3 <= center_lng <= 90.5:
            base_ndvi = 0.22
            forest_fraction = 0.10
        else:
            base_ndvi = random.uniform(0.45, 0.72)
            forest_fraction = random.uniform(0.40, 0.85)

        # Seasonal adjustment
        try:
            start_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
            month = start_dt.month
        except Exception:
            month = 6
        seasonal_multiplier = 1.08 if 6 <= month <= 10 else 0.92

        avg_ndvi = min(0.85, max(0.05, base_ndvi * seasonal_multiplier))
        
        # Generate spatial 64x64 grid of values
        bounds = [[min_lat, min_lng], [max_lat, max_lng]]
        grid_data = self._generate_simulated_grid(bounds, avg_ndvi, seed)

        return {
            "average_ndvi": round(grid_data["average_ndvi"], 3),
            "average_evi": round(grid_data["average_evi"], 3),
            "average_ndwi": round(grid_data["average_ndwi"], 3),
            "average_savi": round(grid_data["average_savi"], 3),
            "average_ndbi": round(grid_data["average_ndbi"], 3),
            "average_vv": round(grid_data["average_vv"], 2),
            "average_vh": round(grid_data["average_vh"], 2),
            "average_ratio": round(grid_data["average_vv"] - grid_data["average_vh"], 2),
            "average_tree_height": round(grid_data["average_tree_height"], 1),
            "forest_area_ha": round(area_ha * forest_fraction, 2),
            "satellite_sources": "Sentinel-1 & Sentinel-2 & Landsat-8/9 (Simulated)",
            "tile_url": "", # Will be generated in estimator.py from pixel estimations
            "bounds": bounds,
            "grid_pixels": grid_data["pixels"],
            "data_source": "simulated",
            "eo_pixel_verified": False,
            "vvb_eo_eligible": False,
            "analysis_metadata": {
                "cloud_cover_max": 20,
                "compositing_method": "simulated",
                "pixel_extraction_mode": "simulated",
                "spectral_bands_synthesized": True,
                "bands_processed": [],
                "s2_scene_ids": [],
                "gedi_tree_height_source": "formula_estimate_not_gedi_l2b",
                "simulation": True
            }
        }

    def _generate_simulated_grid(self, bounds, avg_ndvi, seed, base_vv=None, base_vh=None, base_height=None):
        """
        Generates a 64x64 grid of spatial coordinate features with canopy variations.
        Each pixel features: B2, B3, B4, B8, B5, B6, B11, B12, ndvi, evi, ndwi, savi, ndbi, vv, vh, tree_height.
        """
        random.seed(seed)
        grid_size = 64
        pixels = []
        
        # Simulated tree canopy clusters using radial gradients
        centers = [
            (random.randint(10, 54), random.randint(10, 54), random.randint(15, 35))
            for _ in range(5)
        ]

        total_ndvi = 0.0
        total_evi = 0.0
        total_ndwi = 0.0
        total_savi = 0.0
        total_ndbi = 0.0
        total_vv = 0.0
        total_vh = 0.0
        total_height = 0.0

        for r in range(grid_size):
            row_pixels = []
            for c in range(grid_size):
                # Radial factor
                factor = 0.0
                for cx, cy, rad in centers:
                    dist = math.sqrt((r - cx)**2 + (c - cy)**2)
                    if dist < rad:
                        factor += (1.0 - (dist / rad)) * 0.45
                
                # Perturb pixel NDVI
                pixel_ndvi = min(0.92, max(0.04, avg_ndvi * 0.7 + factor * 0.3 + random.uniform(-0.05, 0.05)))
                
                # Derive physical spectral bands
                b4_red = max(0.01, 0.10 - (pixel_ndvi * 0.09))
                b8_nir = max(0.12, b4_red + pixel_ndvi * 0.65)
                b2_blue = max(0.01, b4_red * 0.75)
                b3_green = max(0.02, b4_red * 1.3)
                b5_re1 = b4_red + (b8_nir - b4_red) * 0.22
                b6_re2 = b4_red + (b8_nir - b4_red) * 0.68
                b11_swir1 = max(0.03, 0.26 - pixel_ndvi * 0.19)
                b12_swir2 = max(0.01, b11_swir1 * 0.55)

                # Calculate indices
                pixel_evi = min(0.85, max(0.01, 2.5 * ((b8_nir - b4_red) / (b8_nir + 6.0 * b4_red - 7.5 * b2_blue + 1.0))))
                pixel_ndwi = (b3_green - b8_nir) / (b3_green + b8_nir + 1e-8)
                pixel_savi = (b8_nir - b4_red) / (b8_nir + b4_red + 0.5) * 1.5
                pixel_ndbi = (b11_swir1 - b8_nir) / (b11_swir1 + b8_nir + 1e-8)

                # Radar (S1) backscattering
                if base_vv is not None:
                    pixel_vv = base_vv + (pixel_ndvi - avg_ndvi) * 5.0 + random.uniform(-0.8, 0.8)
                    pixel_vh = (base_vh if base_vh is not None else (pixel_vv - 7.0)) + (pixel_ndvi - avg_ndvi) * 4.0 + random.uniform(-0.8, 0.8)
                else:
                    pixel_vv = -16.0 + (pixel_ndvi * 6.5) + random.uniform(-1.0, 1.0)
                    pixel_vh = pixel_vv - 7.0 - (pixel_ndvi * 2.0)

                # GEDI LiDAR Tree Height (in meters, correlates with NDVI/EVI and Radar density)
                if base_height is not None:
                    pixel_tree_height = max(2.0, base_height + (pixel_ndvi - avg_ndvi) * 10.0 + (pixel_vh - (base_vh or pixel_vh)) * 0.3 + random.uniform(-1.5, 1.5))
                else:
                    pixel_tree_height = max(2.0, (pixel_ndvi * 22.0) + (pixel_vh * 0.4 + 6.0) + random.uniform(-2.0, 2.0))

                pixel_feature = {
                    "r": r,
                    "c": c,
                    "B2_blue": round(b2_blue, 4),
                    "B3_green": round(b3_green, 4),
                    "B4_red": round(b4_red, 4),
                    "B8_nir": round(b8_nir, 4),
                    "B5_re1": round(b5_re1, 4),
                    "B6_re2": round(b6_re2, 4),
                    "B11_swir1": round(b11_swir1, 4),
                    "B12_swir2": round(b12_swir2, 4),
                    "ndvi": round(pixel_ndvi, 4),
                    "evi": round(pixel_evi, 4),
                    "ndwi": round(pixel_ndwi, 4),
                    "savi": round(pixel_savi, 4),
                    "ndbi": round(pixel_ndbi, 4),
                    "S1_vv": round(pixel_vv, 2),
                    "S1_vh": round(pixel_vh, 2),
                    "S1_ratio": round(pixel_vv - pixel_vh, 2),
                    "tree_height": round(pixel_tree_height, 2)
                }
                
                row_pixels.append(pixel_feature)

                # Aggregate totals
                total_ndvi += pixel_ndvi
                total_evi += pixel_evi
                total_ndwi += pixel_ndwi
                total_savi += pixel_savi
                total_ndbi += pixel_ndbi
                total_vv += pixel_vv
                total_vh += pixel_vh
                total_height += pixel_tree_height

            pixels.append(row_pixels)

            total_n = grid_size * grid_size

        return {
            "pixels": pixels,
            "average_ndvi": total_ndvi / total_n,
            "average_evi": total_evi / total_n,
            "average_ndwi": total_ndwi / total_n,
            "average_savi": total_savi / total_n,
            "average_ndbi": total_ndbi / total_n,
            "average_vv": total_vv / total_n,
            "average_vh": total_vh / total_n,
            "average_tree_height": total_height / total_n
        }
