import { SUNDARBANS_RESERVE, CHT_RESERVE } from './geoUtils';

// Default dMRV v2 Verification Tasks (Treeconomy Pattern: W > 0.35 trigger)
export const DEFAULT_VERIFICATION_TASKS = [
  {
    id: 1,
    project_id: "sundarbans-b2",
    parcel_id: "SUND-P04",
    relative_width: 0.428,
    carbon_estimate: 118.4,
    uncertainty_lower: 93.1,
    uncertainty_upper: 143.8,
    dispatched_at: "2026-09-15T08:30:00Z",
    status: "pending",
    priority: "HIGH",
    recommended_action: "Relative uncertainty width (W=0.43 > 0.35) exceeds Verra VM0047 Tier-3 limit. High priority UAV LiDAR scan required.",
    survey_result: null
  },
  {
    id: 2,
    project_id: "sundarbans-b2",
    parcel_id: "SUND-P09",
    relative_width: 0.375,
    carbon_estimate: 104.2,
    uncertainty_lower: 84.6,
    uncertainty_upper: 123.7,
    dispatched_at: "2026-09-14T11:15:00Z",
    status: "pending",
    priority: "HIGH",
    recommended_action: "Conformal interval width exceeds threshold (W=0.38 > 0.35). Dispatch drone survey for canopy height recalibration.",
    survey_result: null
  },
  {
    id: 3,
    project_id: "sundarbans-b2",
    parcel_id: "SUND-P01",
    relative_width: 0.282,
    carbon_estimate: 142.1,
    uncertainty_lower: 122.0,
    uncertainty_upper: 162.1,
    dispatched_at: "2026-09-10T09:00:00Z",
    status: "completed",
    priority: "RESOLVED",
    recommended_action: "UAV LiDAR survey ingested. Conformal width tightened to W=0.19.",
    survey_result: {
      sensor_model: "DJI Zenmuse L1 LiDAR",
      surveyed_biomass: 248.6,
      resolution_cm: 5.0,
      operator_id: "UAV-TECH-BD-04",
      calibrated_at: "2026-09-12T14:20:00Z"
    }
  }
];

// Default Validator Co-Signatures (Open Forest Protocol Pattern: Cryptographic Multi-Validator Trust)
export const DEFAULT_SIGNATURES = [
  {
    validator_id: "val_demo_a",
    validator_name: "Demo signer A (fictional)",
    organization: "Demo validator A (fictional)",
    public_key_hex: "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a",
    signature_hex: "3045022100e4b8a2c1d9f8e7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a202201b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c",
    signed_at: "2026-09-15T10:45:12Z",
    algorithm: "Ed25519"
  },
  {
    validator_id: "val_demo_b",
    validator_name: "Demo signer B (fictional)",
    organization: "Demo validator B (fictional)",
    public_key_hex: "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60",
    signature_hex: "e2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091",
    signed_at: "2026-09-15T14:30:22Z",
    algorithm: "Ed25519"
  }
];

// Default Model Architecture Settings (Kanop Sensor Fusion with Real-Data Gate)
export const DEFAULT_MODEL_SETTINGS = {
  active_model: "random_forest",
  xgboost_available: false,
  fusion_model_available: true,
  fusion_model_loaded: false,
  fusion_model_status: "gated_insufficient_real_data",
  fusion_gate_threshold: 150,
  feature_names: [
    "B2_blue", "B3_green", "B4_red", "B8_nir", "B5_re1", "B6_re2", 
    "B11_swir1", "B12_swir2", "ndvi", "evi", "ndwi", "savi", "ndbi", 
    "S1_vv", "S1_vh", "S1_ratio", "tree_height"
  ],
  model_version: "2.0.0-dmrv",
  model_trained_on: "NFI-Sovereign-Ground-Truth"
};

// Default sovereign MRV dashboard telemetry datasets
export const DEFAULT_DASHBOARD_DATA = {
  current_carbon_estimate_tC_ha: 112.5,
  estimated_co2_storage_tCO2e: 450000,
  forest_health_score: 72.4,
  vegetation_index_ndvi: 0.724,
  forest_change_percent: 1.25,
  estimated_biomass_Mg_ha: 236.8,
  confidence_score: 0.91,
  latest_satellite_date: "2026-06-25",
  last_analysis_date: "2026-06-25",
  total_area_size_ha: 3800.5,
  active_alerts_count: 2,
  forest_stratum: "SUNDARBANS_MANGROVE",
  carbon_agb_tc_ha: 112.5,
  carbon_bgb_tc_ha: 55.13,
  carbon_soc_tc_ha: 180.4,
  carbon_total_tc_ha: 348.03,
  counterfactual_carbon_tc_ha: 92.4,
  gross_additionality_tco2e: 278500,
  leakage_belt_area_ha: 10420.0,
  leakage_risk_rating: "LOW",
  leakage_deduction_tco2e: 0.0,
  buffer_deduction_pct: 18.0,
  buffer_withheld_tco2e: 50130,
  net_creditable_tco2e: 228370,
  carbon_lower_90: 106.8,
  carbon_upper_90: 118.2,
  relative_margin_of_error: 5.1,
  verra_precision_discount_pct: 0.0,
  conservative_creditable_tco2e: 228370,
  sha256_ledger_hash: "a4f89d34e2c14092b7c62b48ec42f3609341ef99b2184adbb08764ef1a0c8672",
  ledger_verified: true
};

export const DEFAULT_ANALYSIS_HISTORY = [
  {
    id: "mrv-2026-06-25-sundarbans",
    status: "completed",
    project_name: "Sundarbans Forest Block B",
    analysis_type: "ndvi",
    start_date: "2026-06-01",
    end_date: "2026-06-25",
    created_at: "2026-06-25T10:30:00Z",
    result: {
      estimated_biomass: 236.8,
      estimated_carbon: 112.5,
      tonnes_co2e: 450000,
      avg_ndvi: 0.724,
      forest_area_ha: 3800.5,
      confidence: 0.91,
      satellite_sources: "Sentinel-2 MSI & Sentinel-1 SAR (NFI Tier-3)",
      forest_stratum: "SUNDARBANS_MANGROVE",
      carbon_agb_tc_ha: 112.5,
      carbon_bgb_tc_ha: 55.13,
      carbon_soc_tc_ha: 180.4,
      carbon_lower_90: 106.8,
      carbon_upper_90: 118.2,
      relative_margin_of_error: 5.1,
      verra_precision_discount_pct: 0.0,
      conservative_creditable_tco2e: 228370
    },
    baseline: {
      counterfactual_carbon_tc_ha: 92.4,
      gross_additionality_tco2e: 278500,
      leakage_belt_area_ha: 10420.0,
      leakage_risk_rating: "LOW",
      leakage_deduction_tco2e: 0.0,
      buffer_deduction_pct: 18.0,
      buffer_withheld_tco2e: 50130,
      net_creditable_tco2e: 228370
    },
    provenance: {
      genesis_hash: "0000000000000000000000000000000000000000000000000000000000000000",
      previous_hash: "0000000000000000000000000000000000000000000000000000000000000000",
      sha256_hash: "a4f89d34e2c14092b7c62b48ec42f3609341ef99b2184adbb08764ef1a0c8672",
      signature_scheme: "SHA256_ECDSA_SECP256K1"
    },
    polygon_geojson: JSON.stringify({
      type: "Polygon",
      coordinates: [SUNDARBANS_RESERVE.map(c => [c[1], c[0]])]
    }),
    bounds: [[21.65, 89.02], [22.50, 89.85]]
  },
  {
    id: "mrv-2026-05-18-cht",
    status: "completed",
    project_name: "Chittagong Hill Tracts Reserve",
    analysis_type: "carbon_heatmap",
    start_date: "2026-05-01",
    end_date: "2026-05-18",
    created_at: "2026-05-18T14:15:00Z",
    result: {
      estimated_biomass: 286.4,
      estimated_carbon: 136.0,
      tonnes_co2e: 712000,
      avg_ndvi: 0.812,
      forest_area_ha: 5420.0,
      confidence: 0.93,
      satellite_sources: "Sentinel-2 MSI & Sentinel-1 SAR (NFI Tier-3)",
      forest_stratum: "TROPICAL_HILL_FOREST",
      carbon_agb_tc_ha: 136.0,
      carbon_bgb_tc_ha: 32.64,
      carbon_soc_tc_ha: 65.0,
      carbon_lower_90: 129.2,
      carbon_upper_90: 142.8,
      relative_margin_of_error: 5.0,
      verra_precision_discount_pct: 0.0,
      conservative_creditable_tco2e: 382400
    },
    baseline: {
      counterfactual_carbon_tc_ha: 110.2,
      gross_additionality_tco2e: 466340,
      leakage_belt_area_ha: 14850.0,
      leakage_risk_rating: "LOW",
      leakage_deduction_tco2e: 0.0,
      buffer_deduction_pct: 18.0,
      buffer_withheld_tco2e: 83940,
      net_creditable_tco2e: 382400
    },
    provenance: {
      genesis_hash: "a4f89d34e2c14092b7c62b48ec42f3609341ef99b2184adbb08764ef1a0c8672",
      previous_hash: "a4f89d34e2c14092b7c62b48ec42f3609341ef99b2184adbb08764ef1a0c8672",
      sha256_hash: "7fbc39a1801264c89d2fe09b2316e87f893452cb66230f1498b584982a71d02c",
      signature_scheme: "SHA256_ECDSA_SECP256K1"
    },
    polygon_geojson: JSON.stringify({
      type: "Polygon",
      coordinates: [CHT_RESERVE.map(c => [c[1], c[0]])]
    }),
    bounds: [[21.55, 91.80], [23.70, 92.65]]
  }
];

export const DEFAULT_ALERTS = [
  {
    id: "alert-1",
    alert_type: "rapid_decline",
    severity: "critical",
    location: [22.45, 89.65],
    message: "Rapid vegetation decline detected. Average NDVI dropped to 0.28.",
    suggested_action: "Deploy drone inspections or local forestry patrol immediately.",
    is_resolved: false,
    timestamp: "2026-06-25T08:14:00Z"
  },
  {
    id: "alert-2",
    alert_type: "fire_risk",
    severity: "warning",
    location: [22.15, 89.45],
    message: "High canopy dryness and elevated thermal readings suggest fire risk in this forest block.",
    suggested_action: "Alert local fire suppression units; monitor weather patterns.",
    is_resolved: false,
    timestamp: "2026-06-24T16:30:00Z"
  }
];
