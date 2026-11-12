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
