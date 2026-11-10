// Extracted constants for Carbon Monitoring feature
export const FASTAPI_API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FASTAPI_API_URL) || 'http://localhost:8000';

export const getAuthHeaders = () => {
  let token = null;
  try {
    const raw = sessionStorage.getItem('carbonos.esg.demo_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) token = parsed.access_token;
    }
  } catch {}
  if (!token) {
    token = localStorage.getItem('token') || sessionStorage.getItem('token') || 'demo-token-operator';
  }
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const authFetch = (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
};

// Geodesic Area & Perimeter calculation on WGS84 ellipsoid
export const calculateGeodesicMetrics = (coords) => {
  if (!coords || coords.length < 3) {
    return { areaHa: 0, areaAcres: 0, perimeterKm: 0, centroid: [0, 0] };
  }
  const R = 6378137; // Earth's mean equatorial radius in meters
  let total = 0;
  let perimeterMeters = 0;
  let sumLat = 0;
  let sumLng = 0;
  const len = coords.length;

  for (let i = 0; i < len; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % len];
    sumLat += p1[0];
    sumLng += p1[1];

    const lat1 = (p1[0] * Math.PI) / 180;
    const lat2 = (p2[0] * Math.PI) / 180;
    const lng1 = (p1[1] * Math.PI) / 180;
    const lng2 = (p2[1] * Math.PI) / 180;

    let dLng = lng2 - lng1;
    if (dLng > Math.PI) dLng -= 2 * Math.PI;
    if (dLng < -Math.PI) dLng += 2 * Math.PI;

    total += dLng * (Math.sin(lat1) + Math.sin(lat2));

    // Haversine perimeter distance
    const dLat = lat2 - lat1;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeterMeters += R * c;
  }

  const areaSqM = Math.abs((total * R * R) / 2.0);
  const areaHa = areaSqM / 10000;
  const areaAcres = areaHa * 2.47105;
  const perimeterKm = perimeterMeters / 1000;
  const centroid = [sumLat / len, sumLng / len];

  return {
    areaSqM,
    areaHa: Number(areaHa.toFixed(2)),
    areaAcres: Number(areaAcres.toFixed(2)),
    perimeterKm: Number(perimeterKm.toFixed(2)),
    centroid
  };
};

// Helper to determine ecological zone based on Bangladesh coordinates
export const getBangladeshEcoZone = (lat, lng) => {
  if (lat >= 21.5 && lat <= 22.8 && lng >= 88.9 && lng <= 90.1) {
    return {
      zone: 'Sundarbans Mangrove Reserve',
      biomassMin: 220,
      biomassMax: 310,
      carbonMin: 104,
      carbonMax: 147,
      baseNdvi: 0.76,
      forestType: 'Dense Coastal Mangrove'
    };
  } else if (lat >= 21.4 && lat <= 24.0 && lng >= 91.5 && lng <= 92.8) {
    return {
      zone: 'Chittagong Hill Tracts (CHT)',
      biomassMin: 240,
      biomassMax: 340,
      carbonMin: 114,
      carbonMax: 161,
      baseNdvi: 0.81,
      forestType: 'Tropical Evergreen Rainforest'
    };
  } else if (lat >= 24.1 && lat <= 25.3 && lng >= 91.4 && lng <= 92.6) {
    return {
      zone: 'Sylhet Semi-Evergreen Forest',
      biomassMin: 180,
      biomassMax: 260,
      carbonMin: 85,
      carbonMax: 123,
      baseNdvi: 0.74,
      forestType: 'Broadleaf Mixed Rainforest'
    };
  } else if (lat >= 23.9 && lat <= 25.1 && lng >= 90.0 && lng <= 90.8) {
    return {
      zone: 'Central Sal Moist Deciduous Forest',
      biomassMin: 110,
      biomassMax: 160,
      carbonMin: 52,
      carbonMax: 76,
      baseNdvi: 0.62,
      forestType: 'Shorea robusta (Sal) Canopy'
    };
  } else if (lat >= 21.8 && lat <= 22.8 && lng >= 90.1 && lng <= 91.5) {
    return {
      zone: 'Coastal Afforestation Belt',
      biomassMin: 130,
      biomassMax: 210,
      carbonMin: 61,
      carbonMax: 99,
      baseNdvi: 0.68,
      forestType: 'Coastal Plantation / Estuary'
    };
  } else {
    return {
      zone: 'Inland Agroforestry / Village Woodlot',
      biomassMin: 45,
      biomassMax: 95,
      carbonMin: 21,
      carbonMax: 45,
      baseNdvi: 0.48,
      forestType: 'Open Agroforestry / Agricultural Canopy'
    };
  }
};

// A component to center/zoom map when boundaries are uploaded or presets selected
export const RecenterMap = ({ bounds, center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && Array.isArray(bounds) && bounds.length === 2 && bounds[0] && bounds[1]) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [bounds, center, zoom, map]);
  return null;
};

// Component to force Leaflet resize on mount or tab switch so tiles render immediately
export const MapResizeHandler = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

// Component to handle drawing points and click inspection on map
export const MapEventHandler = ({ 
  isDrawing, 
  drawPoints, 
  setDrawPoints, 
  onPixelClick, 
  hoverCoords, 
  setHoverCoords 
}) => {
  const map = useMap();
  
  useMapEvents({
    mousemove(e) {
      setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    click(e) {
      if (isDrawing) {
        // Drawing mode: Add vertex to polygon
        setDrawPoints([...drawPoints, [e.latlng.lat, e.latlng.lng]]);
      } else {
        // Inspection mode: Click pixel
        onPixelClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return null;
};

// Predefined forest reserve polygons in Bangladesh
export const SUNDARBANS_RESERVE = [
  [22.45, 89.02],
  [22.42, 89.25],
  [22.50, 89.50],
  [22.45, 89.82],
  [22.15, 89.85],
  [21.75, 89.80],
  [21.65, 89.30],
  [21.80, 89.05]
];

export const CHT_RESERVE = [
  [23.70, 92.15],
  [23.55, 92.40],
  [22.80, 92.50],
  [21.85, 92.65],
  [21.55, 92.20],
  [21.80, 92.05],
  [22.45, 91.95],
  [23.10, 91.80],
  [23.50, 91.95]
];

// Simplified outline of Bangladesh border
export const BANGLADESH_BORDER = [
  [26.634, 88.388], [26.376, 88.586], [26.313, 89.043], [26.068, 89.155], [25.753, 89.843],
  [25.178, 89.843], [25.197, 91.954], [25.042, 92.428], [24.168, 92.470], [23.951, 91.246],
  [23.473, 91.272], [22.846, 91.503], [22.259, 92.179], [22.016, 92.368], [21.848, 92.628],
  [21.650, 92.518], [21.200, 92.180], [20.730, 92.320], [21.050, 92.200], [21.430, 91.980],
  [21.828, 91.890], [22.316, 91.380], [22.203, 90.353], [21.802, 89.508], [21.642, 89.148],
  [22.222, 89.053], [22.923, 88.887], [23.633, 88.625], [24.103, 88.618], [24.633, 87.973],
  [25.076, 88.083], [25.293, 88.883], [25.845, 88.750], [26.333, 88.130]
];

// Predefined quarterly telemetry dataset for sovereign Bangladesh MRV
export const TELEMETRY_QUARTERS = [
  { id: '2025-q1', label: '2025 Q1', ndvi: 0.584, biomass: 184.2, carbon: 87.5, baseline: 0.510, baselineBiomass: 165.0, baselineCarbon: 78.4, status: 'Historical (unverified)', cloudCover: '4.2%', sensor: 'Sentinel-2A' },
  { id: '2025-q2', label: '2025 Q2', ndvi: 0.628, biomass: 198.5, carbon: 94.3, baseline: 0.525, baselineBiomass: 168.0, baselineCarbon: 79.8, status: 'Historical (unverified)', cloudCover: '2.8%', sensor: 'Sentinel-2B' },
  { id: '2025-q3', label: '2025 Q3', ndvi: 0.604, biomass: 192.1, carbon: 91.2, baseline: 0.535, baselineBiomass: 170.5, baselineCarbon: 81.0, status: 'Historical (unverified)', cloudCover: '5.1%', sensor: 'Sentinel-2A' },
  { id: '2025-q4', label: '2025 Q4', ndvi: 0.655, biomass: 206.4, carbon: 98.0, baseline: 0.540, baselineBiomass: 172.0, baselineCarbon: 81.7, status: 'Historical (unverified)', cloudCover: '1.9%', sensor: 'Sentinel-2B' },
  { id: '2026-q1', label: '2026 Q1', ndvi: 0.712, biomass: 224.8, carbon: 106.8, baseline: 0.550, baselineBiomass: 175.0, baselineCarbon: 83.1, status: 'Sentinel pass (unaudited)', cloudCover: '2.4%', sensor: 'Sentinel-2A' },
  { id: '2026-q2', label: '2026 Q2', ndvi: 0.748, biomass: 236.8, carbon: 112.5, baseline: 0.565, baselineBiomass: 178.5, baselineCarbon: 84.8, status: 'Latest Active Epoch', cloudCover: '1.4%', sensor: 'Sentinel-2B' },
  { id: '2026-q3', label: '2026 Q3', ndvi: 0.724, biomass: 229.4, carbon: 109.0, baseline: 0.575, baselineBiomass: 181.0, baselineCarbon: 86.0, status: 'Projected Telemetry', cloudCover: '3.2%', sensor: 'Sentinel-2A' },
  { id: '2026-q4', label: '2026 Q4', ndvi: 0.782, biomass: 247.9, carbon: 117.8, baseline: 0.585, baselineBiomass: 183.5, baselineCarbon: 87.2, status: 'Projected Telemetry', cloudCover: '1.8%', sensor: 'Sentinel-2B' },
  { id: '2027-q1', label: '2027 Q1', ndvi: 0.819, biomass: 259.6, carbon: 123.3, baseline: 0.595, baselineBiomass: 186.0, baselineCarbon: 88.4, status: 'Projected Target', cloudCover: '2.1%', sensor: 'Sentinel-2A' },
  { id: '2027-q2', label: '2027 Q2', ndvi: 0.854, biomass: 270.8, carbon: 128.6, baseline: 0.605, baselineBiomass: 188.5, baselineCarbon: 89.5, status: 'Projected Target', cloudCover: '1.6%', sensor: 'Sentinel-2B' },
];

// Analysis Layer specifications for all options
export const LAYER_CONFIG = {
  ndvi: {
    id: 'ndvi',
    name: 'NDVI (Normalized Difference Veg Index)',
    label: 'NDVI Vegetation Layer',
    title: 'NDVI VEGETATION INDEX',
    color: '#00E676',
    fillColor: '#00C853',
    fillOpacity: 0.35,
    borderColor: '#00E676',
    gradientCSS: 'linear-gradient(to top, #78350F, #F59E0B, #84CC16, #00C853)',
    ticks: ['Dense Canopy (0.85)', 'Moderate (0.50)', 'Sparse / Soil (0.15)'],
    metricUnit: 'NDVI Index',
    badgeClass: 'bg-emerald text-carbon',
    description: 'Cloud-masked Sentinel-2 (B8 - B4) / (B8 + B4) canopy chlorophyll vitality'
  },
  evi: {
    id: 'evi',
    name: 'EVI (Enhanced Vegetation Index)',
    label: 'EVI Canopy Layer',
    title: 'EVI CANOPY STRUCTURE',
    color: '#10B981',
    fillColor: '#22C55E',
    fillOpacity: 0.35,
    borderColor: '#10B981',
    gradientCSS: 'linear-gradient(to top, #A16207, #EAB308, #22C55E, #15803D)',
    ticks: ['High Biomass (0.75)', 'Mid Canopy (0.45)', 'Open Ground (0.10)'],
    metricUnit: 'EVI Index',
    badgeClass: 'bg-green-500 text-white',
    description: 'Atmospheric & soil-resistance compensated high-density canopy structure'
  },
  ndwi: {
    id: 'ndwi',
    name: 'NDWI (Normalized Difference Water Index)',
    label: 'NDWI Canopy Water Layer',
    title: 'NDWI MOISTURE / HYDROLOGY',
    color: '#06B6D4',
    fillColor: '#0284C7',
    fillOpacity: 0.35,
    borderColor: '#0284C7',
    gradientCSS: 'linear-gradient(to top, #D97706, #38BDF8, #0284C7, #0C4A6E)',
    ticks: ['Water / Tidal (+0.70)', 'Moist Canopy (+0.25)', 'Dry Terrestrial (-0.20)'],
    metricUnit: 'Moisture Saturation',
    badgeClass: 'bg-blue-400 text-carbon',
    description: 'Canopy leaf water content and tidal wetland estuary moisture dynamics'
  },
  forest_cover: {
    id: 'forest_cover',
    name: 'Forest Canopy Cover Mask',
    label: 'Forest Cover Mask',
    title: 'CANOPY COVER DENSITY (%)',
    color: '#059669',
    fillColor: '#004D25',
    fillOpacity: 0.45,
    borderColor: '#00873E',
    gradientCSS: 'linear-gradient(to top, #4B5563, #10B981, #059669, #004D25)',
    ticks: ['Dense Forest (95%)', 'Canopy Mosaic (60%)', 'Non-Forest (<20%)'],
    metricUnit: 'Canopy Density',
    badgeClass: 'bg-emerald-800 text-white',
    description: 'FAO forest-definition mask (>10% tree crown cover, >0.5 ha continuity)'
  },
  carbon_heatmap: {
    id: 'carbon_heatmap',
    name: 'AI Carbon Heatmap Grid',
    label: 'AI Carbon Heatmap Grid',
    title: 'AI CARBON DENSITY (tC/ha)',
    color: '#8B5CF6',
    fillColor: '#7C3AED',
    fillOpacity: 0.40,
    borderColor: '#C084FC',
    gradientCSS: 'linear-gradient(to top, #1E1B4B, #7C3AED, #EC4899, #F59E0B, #FBBF24)',
    ticks: ['High Carbon (150+ tC)', 'Moderate (85 tC)', 'Low Biomass (25 tC)'],
    metricUnit: 'tC/ha Organic Carbon',
    badgeClass: 'bg-purple-500 text-white',
    description: 'Random Forest multi-sensor regression calibrated against SRTM + GEDI LiDAR'
  }
};

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
  // Verra VM0047 / VM0048 Aligned Fields
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
