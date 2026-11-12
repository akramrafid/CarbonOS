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
