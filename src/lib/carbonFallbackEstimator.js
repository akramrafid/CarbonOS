/**
 * Deterministic Bangladesh Carbon Expected-Value Fallback Estimator.
 *
 * Used strictly when the FastAPI backend (:8000) is offline or undeployed
 * (for example, static frontend hosting on Vercel before connecting VITE_FASTAPI_API_URL).
 * All values are clearly marked unverified offline expectations grounded in
 * published IPCC Tier-3 / Bangladesh Forest Department stratum ranges.
 */

export function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][1];
    const yi = ring[i][0];
    const xj = ring[j][1];
    const yj = ring[j][0];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function calculateGeodesicMetrics(coords) {
  if (!coords || coords.length < 3) {
    return { areaSqM: 0, areaHa: 0, areaAcres: 0, perimeterKm: 0, centroid: [0, 0] };
  }
  const R = 6378137;
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

    const dLat = lat2 - lat1;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
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
    centroid,
  };
}

export function getBangladeshEcoZone(lat, lng) {
  if (lat >= 21.5 && lat <= 22.8 && lng >= 88.9 && lng <= 90.1) {
    return {
      zone: 'Sundarbans Mangrove Reserve',
      stratumCode: 'SUNDARBANS_MANGROVE',
      biomassMin: 220,
      biomassMax: 310,
      carbonMin: 104,
      carbonMax: 147,
      bgbRatio: 0.49,
      socTcHa: 180.4,
      elevationBaseM: 1.8,
      canopyBaseM: 14.5,
      baseNdvi: 0.76,
      forestType: 'Dense Coastal Mangrove',
    };
  }
  if (lat >= 21.4 && lat <= 24.0 && lng >= 91.5 && lng <= 92.8) {
    return {
      zone: 'Chittagong Hill Tracts (CHT)',
      stratumCode: 'CHT_TROPICAL_EVERGREEN',
      biomassMin: 240,
      biomassMax: 340,
      carbonMin: 114,
      carbonMax: 161,
      bgbRatio: 0.24,
      socTcHa: 112.0,
      elevationBaseM: 210.0,
      canopyBaseM: 19.2,
      baseNdvi: 0.81,
      forestType: 'Tropical Evergreen Rainforest',
    };
  }
  if (lat >= 24.1 && lat <= 25.3 && lng >= 91.4 && lng <= 92.6) {
    return {
      zone: 'Sylhet Semi-Evergreen Forest',
      stratumCode: 'SYLHET_SEMI_EVERGREEN',
      biomassMin: 180,
      biomassMax: 260,
      carbonMin: 85,
      carbonMax: 123,
      bgbRatio: 0.26,
      socTcHa: 105.0,
      elevationBaseM: 42.0,
      canopyBaseM: 15.8,
      baseNdvi: 0.74,
      forestType: 'Broadleaf Mixed Rainforest',
    };
  }
  if (lat >= 23.9 && lat <= 25.1 && lng >= 90.0 && lng <= 90.8) {
    return {
      zone: 'Central Sal Moist Deciduous Forest',
      stratumCode: 'CENTRAL_SAL_DECIDUOUS',
      biomassMin: 110,
      biomassMax: 160,
      carbonMin: 52,
      carbonMax: 76,
      bgbRatio: 0.28,
      socTcHa: 94.0,
      elevationBaseM: 18.5,
      canopyBaseM: 12.2,
      baseNdvi: 0.62,
      forestType: 'Shorea robusta (Sal) Canopy',
    };
  }
  if (lat >= 21.8 && lat <= 22.8 && lng >= 90.1 && lng <= 91.5) {
    return {
      zone: 'Coastal Afforestation Belt',
      stratumCode: 'COASTAL_AFFORESTATION',
      biomassMin: 130,
      biomassMax: 210,
      carbonMin: 61,
      carbonMax: 99,
      bgbRatio: 0.38,
      socTcHa: 132.0,
      elevationBaseM: 3.1,
      canopyBaseM: 11.4,
      baseNdvi: 0.68,
      forestType: 'Coastal Plantation / Estuary',
    };
  }
  return {
    zone: 'Inland Agroforestry / Village Woodlot',
    stratumCode: 'INLAND_AGROFORESTRY',
    biomassMin: 45,
    biomassMax: 95,
    carbonMin: 21,
    carbonMax: 45,
    bgbRatio: 0.28,
    socTcHa: 90.2,
    elevationBaseM: 9.2,
    canopyBaseM: 8.6,
    baseNdvi: 0.48,
    forestType: 'Open Agroforestry / Agricultural Canopy',
  };
}

const clamp = (val, minVal, maxVal) => Math.min(maxVal, Math.max(minVal, val));

function deterministicCoordinateSignal(lat, lng) {
  const wave = Math.sin(lat * 47.3) * Math.cos(lng * 39.7);
  return clamp(0.5 + 0.35 * wave, 0.12, 0.88);
}

/**
 * Computes deterministic expected carbon pools & spectral proxies at (lat, lng).
 */
export function estimateExpectedPixel({ lat, lng, startDate = '2026-01-01', endDate = '2026-06-01' }) {
  const pLat = Number(lat);
  const pLng = Number(lng);
  const eco = getBangladeshEcoZone(pLat, pLng);
  const t = deterministicCoordinateSignal(pLat, pLng);

  const biomass = eco.biomassMin + t * (eco.biomassMax - eco.biomassMin);
  const agbCarbon = biomass * 0.475;
  const bgbCarbon = agbCarbon * eco.bgbRatio;
  const socCarbon = eco.socTcHa + (t - 0.5) * 8.0;
  const totalCarbon = agbCarbon + bgbCarbon + socCarbon;
  const co2eHa = totalCarbon * (44 / 12);

  const ndvi = clamp(eco.baseNdvi + (t - 0.5) * 0.14, 0.05, 0.92);
  const evi = clamp(ndvi * 0.64, 0.04, 0.85);
  const ndwi = clamp(-0.22 - (ndvi - 0.5) * 0.45, -0.75, 0.55);
  const treeHeightM = Math.max(1.5, eco.canopyBaseM + (t - 0.5) * 4.0);
  const elevationM = Math.max(0.5, eco.elevationBaseM + (t - 0.5) * 2.4);

  return {
    lat: pLat.toFixed(5),
    lng: pLng.toFixed(5),
    ndvi: ndvi.toFixed(3),
    evi: evi.toFixed(3),
    ndwi: ndwi.toFixed(3),
    biomass: biomass.toFixed(2),
    carbon: agbCarbon.toFixed(2),
    carbonTotal: totalCarbon.toFixed(2),
    agbCarbon: agbCarbon.toFixed(2),
    bgbCarbon: bgbCarbon.toFixed(2),
    socCarbon: socCarbon.toFixed(2),
    co2eHa: co2eHa.toFixed(2),
    treeHeightM: treeHeightM.toFixed(1),
    elevationM: elevationM.toFixed(1),
    pixelExtractionMode: 'expected_offline_baseline',
    eoPixelVerified: false,
    gediSource: 'stratum_expected_baseline',
    s2ScenesCount: 0,
    s1ScenesCount: 0,
    dateRange: { start_date: startDate, end_date: endDate },
    confidence: 'Expected Baseline Estimate (offline fallback — unverified)',
    dataSource: 'expected_offline_baseline',
    stratumCode: eco.stratumCode,
    forestType: `${eco.forestType} • expected baseline`,
  };
}

/**
 * Generates an expected multi-pool dMRV polygon result & clipped 2D/3D spatial grid
 * when the backend service is unavailable (e.g. standalone Vercel deploy).
 */
export function estimateExpectedPolygonAnalysis({
  points,
  projectName = 'Bangladesh Carbon AOI',
  startDate = '2026-01-01',
  endDate = '2026-06-01',
  activeLayer = 'ndvi',
}) {
  const geoMetrics = calculateGeodesicMetrics(points);
  const [cLat, cLng] = geoMetrics.centroid;
  const eco = getBangladeshEcoZone(cLat, cLng);
  const areaHa = Math.max(0.05, geoMetrics.areaHa || 1.0);

  const lats = points.map((p) => p[0]);
  const lngs = points.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const gridCount = 9;
  const stepLat = Math.max(0.0005, (maxLat - minLat) / gridCount);
  const stepLng = Math.max(0.0005, (maxLng - minLng) / gridCount);
  const gridCells = [];

  for (let r = 0; r < gridCount; r++) {
    for (let col = 0; col < gridCount; col++) {
      const cellLat = minLat + (r + 0.5) * stepLat;
      const cellLng = minLng + (col + 0.5) * stepLng;
      if (!pointInRing(cellLng, cellLat, points)) continue;

      const px = estimateExpectedPixel({ lat: cellLat, lng: cellLng, startDate, endDate });
      gridCells.push({
        lat: Number(cellLat.toFixed(6)),
        lng: Number(cellLng.toFixed(6)),
        step_lat: stepLat,
        step_lng: stepLng,
        ndvi: Number(px.ndvi),
        evi: Number(px.evi),
        ndwi: Number(px.ndwi),
        biomass: Number(px.biomass),
        carbon: Number(px.carbon),
        carbon_total: Number(px.carbonTotal),
        height: Number(px.treeHeightM),
        stratum: eco.stratumCode,
      });
    }
  }

  if (gridCells.length === 0) {
    const px = estimateExpectedPixel({ lat: cLat, lng: cLng, startDate, endDate });
    gridCells.push({
      lat: Number(cLat.toFixed(6)),
      lng: Number(cLng.toFixed(6)),
      step_lat: stepLat,
      step_lng: stepLng,
      ndvi: Number(px.ndvi),
      evi: Number(px.evi),
      ndwi: Number(px.ndwi),
      biomass: Number(px.biomass),
      carbon: Number(px.carbon),
      carbon_total: Number(px.carbonTotal),
      height: Number(px.treeHeightM),
      stratum: eco.stratumCode,
    });
  }

  const avg = (fn) => gridCells.reduce((acc, cell) => acc + fn(cell), 0) / gridCells.length;
  const avgNdvi = Number(avg((c) => c.ndvi).toFixed(3));
  const avgBiomass = Number(avg((c) => c.biomass).toFixed(2));
  const avgAgb = Number(avg((c) => c.carbon).toFixed(2));
  const avgBgb = Number((avgAgb * eco.bgbRatio).toFixed(2));
  const avgSoc = Number(eco.socTcHa.toFixed(2));
  const totalCarbonTcHa = Number((avgAgb + avgBgb + avgSoc).toFixed(2));
  const totalTonnesCo2e = Number((totalCarbonTcHa * (44 / 12) * areaHa).toFixed(2));

  const counterfactualTcHa = Number((avgAgb * 0.78).toFixed(2));
  const grossAdditionalityTco2e = Number(Math.max(0, (avgAgb - counterfactualTcHa) * (44 / 12) * areaHa).toFixed(2));
  const bufferPct = 18.0;
  const bufferWithheldTco2e = Number((grossAdditionalityTco2e * (bufferPct / 100)).toFixed(2));
  const netCreditableTco2e = Number((grossAdditionalityTco2e - bufferWithheldTco2e).toFixed(2));

  const relativeMarginOfError = 9.4;
  const carbonLower90 = Number((avgAgb * (1 - relativeMarginOfError / 100)).toFixed(2));
  const carbonUpper90 = Number((avgAgb * (1 + relativeMarginOfError / 100)).toFixed(2));

  const geojsonCoords = [...points, points[0]].map((p) => [p[1], p[0]]);
  const nowIso = new Date().toISOString();
  const jobId = `expected-${Date.now()}`;

  return {
    id: jobId,
    status: 'completed',
    is_expected_fallback: true,
    project_name: projectName,
    analysis_type: activeLayer,
    start_date: startDate,
    end_date: endDate,
    created_at: nowIso,
    bounds: [
      [minLat, minLng],
      [maxLat, maxLng],
    ],
    polygon_geojson: JSON.stringify({
      type: 'Polygon',
      coordinates: [geojsonCoords],
    }),
    grid_cells: gridCells,
    result: {
      id: jobId,
      estimated_biomass: avgBiomass,
      estimated_carbon: avgAgb,
      tonnes_co2e: totalTonnesCo2e,
      avg_ndvi: avgNdvi,
      forest_area_ha: areaHa,
      confidence: 0.72,
      satellite_sources: 'Expected Stratum Baseline (Offline Fallback — Unverified)',
      forest_stratum: eco.stratumCode,
      carbon_agb_tc_ha: avgAgb,
      carbon_bgb_tc_ha: avgBgb,
      carbon_soc_tc_ha: avgSoc,
      carbon_lower_90: carbonLower90,
      carbon_upper_90: carbonUpper90,
      relative_margin_of_error: relativeMarginOfError,
      verra_precision_discount_pct: 0.0,
      conservative_creditable_tco2e: netCreditableTco2e,
      eo_summary: {
        pixel_extraction_mode: 'expected_offline_baseline',
      },
    },
    baseline: {
      counterfactual_carbon_tc_ha: counterfactualTcHa,
      gross_additionality_tco2e: grossAdditionalityTco2e,
      leakage_belt_area_ha: Number((areaHa * 2.75).toFixed(1)),
      leakage_risk_rating: 'LOW',
      leakage_deduction_tco2e: 0.0,
      buffer_deduction_pct: bufferPct,
      buffer_withheld_tco2e: bufferWithheldTco2e,
      net_creditable_tco2e: netCreditableTco2e,
    },
    provenance: {
      data_source: 'expected_offline_baseline',
      record_hash: 'offline-expected-estimate-unverified',
    },
  };
}

/**
 * Parses uploaded .geojson, .json, or .kml polygon boundaries offline in the browser.
 * Returns [[lat, lng], ...] coordinates for the outer ring.
 */
export function parseLocalBoundaryFileText(fileName, text) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.kml')) {
    const match = String(text || '').match(/<coordinates[^>]*>([\s\S]*?)<\/coordinates>/i);
    if (!match) return null;
    const pts = match[1]
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(',').map(Number))
      .filter((nums) => nums.length >= 2 && Number.isFinite(nums[0]) && Number.isFinite(nums[1]))
      .map(([lng, lat]) => [lat, lng]);
    if (pts.length > 3 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
      pts.pop();
    }
    return pts.length >= 3 ? pts : null;
  }

  const parsed = JSON.parse(text);
  const extractRing = (geom) => {
    if (!geom) return null;
    if (geom.type === 'FeatureCollection') return extractRing(geom.features?.[0]?.geometry);
    if (geom.type === 'Feature') return extractRing(geom.geometry);
    if (geom.type === 'Polygon') return geom.coordinates?.[0] || null;
    if (geom.type === 'MultiPolygon') return geom.coordinates?.[0]?.[0] || null;
    return null;
  };
  const ring = extractRing(parsed);
  if (!Array.isArray(ring) || ring.length < 3) return null;
  const coords = ring
    .filter((c) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1]))
    .map(([lng, lat]) => [lat, lng]);
  if (coords.length > 3 && coords[0][0] === coords[coords.length - 1][0] && coords[0][1] === coords[coords.length - 1][1]) {
    coords.pop();
  }
  return coords.length >= 3 ? coords : null;
}
