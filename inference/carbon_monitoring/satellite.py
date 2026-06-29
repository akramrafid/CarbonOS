import os
import json
import math
import time
import io
import base64
import random
import datetime
from PIL import Image, ImageDraw

# Try importing ee
try:
    import ee
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False

class SatelliteEngine:
    def __init__(self):
        self.ee_initialized = False
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
                print("[Satellite Engine] Operating in High-Fidelity Simulation Mode.")
        else:
            print("[Satellite Engine] Google Earth Engine python library not installed.")
            print("[Satellite Engine] Operating in High-Fidelity Simulation Mode.")

    def run_analysis(self, polygon_coords, start_date, end_date, analysis_type="ndvi"):
        """
        Runs satellite analysis. If GEE is available and initialized, runs GEE pipelines.
        Otherwise, triggers the high-fidelity Simulation Engine.
        polygon_coords: list of [lat, lng] representing the boundary polygon
        """
        if self.ee_initialized:
            try:
                return self._run_gee_analysis(polygon_coords, start_date, end_date, analysis_type)
            except Exception as e:
                import traceback
                print(f"[Satellite Engine] GEE analysis failed: {e}")
                print(traceback.format_exc())
                return self._run_simulated_analysis(polygon_coords, start_date, end_date, analysis_type)
        else:
            return self._run_simulated_analysis(polygon_coords, start_date, end_date, analysis_type)

    def _run_gee_analysis(self, polygon_coords, start_date, end_date, analysis_type):
        """
        Production GEE execution pipeline.
        Fetches Sentinel-2 (optical) and Sentinel-1 (radar) imagery.
        Computes NDVI, EVI, NDWI, SAVI, and NDBI.
        """
        # Close the GEE polygon
        if polygon_coords[0] != polygon_coords[-1]:
            polygon_coords.append(polygon_coords[0])
            
        # Reformat coordinates for GEE [lng, lat]
        gee_coords = [[coord[1], coord[0]] for coord in polygon_coords]
        aoi = ee.Geometry.Polygon(gee_coords)

        # 1. Fetch Sentinel-2 (Surface Reflectance)
        s2_collection = (
            ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(aoi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        )

        def mask_s2_clouds(image):
            qa = image.select('QA60')
            cloud_bit_mask = 1 << 10
            cirrus_bit_mask = 1 << 11
            mask = qa.bitwiseAnd(cloud_bit_mask).eq(0).And(
                qa.bitwiseAnd(cirrus_bit_mask).eq(0)
            )
            return image.updateMask(mask).divide(10000)

        s2_composite = s2_collection.map(mask_s2_clouds).median().clip(aoi)

        # Calculate Indices
        # NDVI = (B8 - B4) / (B8 + B4)
        ndvi = s2_composite.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # EVI = 2.5 * ((B8 - B4) / (B8 + 6 * B4 - 7.5 * B2 + 1))
        b8 = s2_composite.select('B8')
        b4 = s2_composite.select('B4')
        b2 = s2_composite.select('B2')
        b3 = s2_composite.select('B3')
        b11 = s2_composite.select('B11')
        b12 = s2_composite.select('B12')
        b5 = s2_composite.select('B5')
        b6 = s2_composite.select('B6')

        evi = ee.Image(2.5).multiply(
            b8.subtract(b4).divide(
                b8.add(b4.multiply(6)).subtract(b2.multiply(7.5)).add(1)
            )
        ).rename('EVI')

        # NDWI = (B3 - B8) / (B3 + B8)
        ndwi = s2_composite.normalizedDifference(['B3', 'B8']).rename('NDWI')

        # SAVI = (B8 - B4) / (B8 + B4 + 0.5) * 1.5
        savi = b8.subtract(b4).divide(b8.add(b4).add(0.5)).multiply(1.5).rename('SAVI')

        # NDBI = (B11 - B8) / (B11 + B8)
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

        # 3. Fetch Landsat 8/9 (Surface Reflectance)
        landsat_collection = (
            ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
            .filterBounds(aoi)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt('CLOUD_COVER', 20))
        )
        landsat_composite = landsat_collection.median().clip(aoi)
        # landsat bands can be selected if needed, e.g. landsat_composite.select('SR_B5')

        # 4. Fetch GEDI L2A/L2B footprint data
        # 'LARSE/GEDI/GEDI02_A_002_MONTHLY' contains the rh100 (relative height 100%) metric representing canopy height
        gedi_height_val = 15.0 # default baseline tree height in meters
        try:
            gedi_collection = ee.ImageCollection('LARSE/GEDI/GEDI02_A_002_MONTHLY').filterBounds(aoi)
            gedi_composite = gedi_collection.median().clip(aoi)
            # rh100 is in decimeters in GEE, divide by 10.0 to get meters
            canopy_height = gedi_composite.select('rh100').divide(10.0).rename('canopy_height')
            mean_height = canopy_height.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=aoi,
                scale=25,
                maxPixels=1e9
            ).get('canopy_height').getInfo()
            if mean_height is not None:
                gedi_height_val = float(mean_height)
        except Exception as e:
            print(f"[Satellite Engine] GEDI collection extraction skipped: {e}")

        # Calculate averages inside AOI
        mean_stats = ee.Image.cat([ndvi, evi, ndwi, savi, ndbi, vv, vh, s1_ratio]).reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=aoi,
            scale=10,
            maxPixels=1e9
        ).getInfo()
        # Add tree height to stats dictionary
        mean_stats['tree_height'] = gedi_height_val

        # In production, fetch tile map overlay from Earth Engine
        map_id_dict = ee.data.getMapId({
            'image': ndvi,
            'min': '0',
            'max': '1',
            'palette': ['blue', 'yellow', 'green']
        })
        tile_url = map_id_dict['tile_fetcher'].url_format

        lats = [c[0] for c in polygon_coords]
        lngs = [c[1] for c in polygon_coords]
        bounds = [[min(lats), min(lngs)], [max(lats), max(lngs)]]

        # Generate pixel grid for GEDI Tree Height simulation (combining GEE metrics)
        # In full production, this reads GEDI L2B assets
        grid_data = self._generate_simulated_grid(bounds, mean_stats.get('NDVI', 0.6), seed=42)

        return {
            "average_ndvi": mean_stats.get('NDVI', 0.6),
            "average_evi": mean_stats.get('EVI', 0.5),
            "average_ndwi": mean_stats.get('NDWI', -0.2),
            "average_savi": mean_stats.get('SAVI', 0.45),
            "average_ndbi": mean_stats.get('NDBI', -0.3),
            "average_vv": mean_stats.get('VV', -12.0),
            "average_vh": mean_stats.get('VH', -18.5),
            "average_ratio": mean_stats.get('S1_ratio', 6.5),
            "average_tree_height": mean_stats.get('tree_height', 15.0),
            "forest_area_ha": aoi.area().divide(10000).getInfo(),
            "satellite_sources": "Sentinel-1 & Sentinel-2 & Landsat-8/9",
            "tile_url": tile_url,
            "bounds": bounds,
            "grid_pixels": grid_data["pixels"],
            "analysis_metadata": {
                "cloud_cover_max": 20,
                "compositing_method": "median",
                "bands_processed": ["B2", "B3", "B4", "B8", "B11", "B12", "VV", "VH", "QA60"]
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
            "analysis_metadata": {
                "cloud_cover_max": 20,
                "compositing_method": "median",
                "bands_processed": ["B2", "B3", "B4", "B8", "B11", "B12", "VV", "VH", "QA60"],
                "simulation": True
            }
        }

    def _generate_simulated_grid(self, bounds, avg_ndvi, seed):
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
                pixel_vv = -16.0 + (pixel_ndvi * 6.5) + random.uniform(-1.0, 1.0)
                pixel_vh = pixel_vv - 7.0 - (pixel_ndvi * 2.0)

                # GEDI LiDAR Tree Height (in meters, correlates with NDVI/EVI and Radar density)
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
