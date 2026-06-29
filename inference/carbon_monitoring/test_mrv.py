import sys
import os
from dotenv import load_dotenv

# Load env variables first before importing ee modules
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from carbon_monitoring.satellite import SatelliteEngine
from carbon_monitoring.estimator import CarbonEstimator

def test_satellite_engine():
    print("Testing Satellite Engine...")
    engine = SatelliteEngine()
    
    # Polygon coordinates representing a portion of Sundarbans
    sundarbans_polygon = [
        [22.25, 89.50],
        [22.35, 89.50],
        [22.35, 89.60],
        [22.25, 89.60]
    ]
    
    # Run simulated analysis
    res = engine.run_analysis(
        polygon_coords=sundarbans_polygon,
        start_date="2026-01-01",
        end_date="2026-06-01",
        analysis_type="ndvi"
      )
      
    print(f"Average NDVI: {res['average_ndvi']}")
    print(f"Canopy Area (ha): {res['forest_area_ha']}")
    print(f"Sources: {res['satellite_sources']}")
    
    assert res["average_ndvi"] > 0.5, "NDVI for Sundarbans should be high"
    assert res["forest_area_ha"] > 0, "Canopy area should be non-zero"
    assert "grid_pixels" in res, "Grid pixels must be extracted for model predictions"
    assert len(res["grid_pixels"]) == 64, "Grid must be 64x64 resolution"
    print("Satellite Engine test passed!\n")
    return res

def test_carbon_estimator(sat_result):
    print("Testing Carbon Estimator AI Pipeline...")
    estimator = CarbonEstimator()
    
    # Estimate carbon stocks
    est = estimator.estimate_carbon_stock(sat_result)
    
    print(f"Estimated Biomass Density: {est['estimated_biomass_per_ha']} Mg/ha")
    print(f"Estimated Carbon Density: {est['estimated_carbon_per_ha']} tC/ha")
    
    # Verify heatmap generation from pixel grid
    tile_url = estimator.predict_grid_heatmap(sat_result["grid_pixels"], "carbon_heatmap")
    print(f"AI Heatmap generated (starts with): {tile_url[:50]}...")
    assert tile_url.startswith("data:image/png;base64"), "Should generate valid base64 image layer from ML model predictions"

    assert est["estimated_biomass_per_ha"] > 100.0, "Biomass for dense Sundarbans forest should be high"
    assert est["estimated_carbon_per_ha"] > 50.0, "Carbon stock density should align with biomass"
    print("Carbon Estimator test passed!\n")

if __name__ == "__main__":
    try:
        sat_res = test_satellite_engine()
        test_carbon_estimator(sat_res)
        print("All MRV backend tests completed successfully!")
    except AssertionError as e:
        print(f"Test assertion failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Test failed with error: {e}")
        sys.exit(1)
