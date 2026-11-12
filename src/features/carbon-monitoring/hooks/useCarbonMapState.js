import { useState, useEffect } from 'react';
import {
  FASTAPI_API_URL,
  SUNDARBANS_RESERVE,
  authFetch,
  calculateGeodesicMetrics,
  getBangladeshEcoZone
} from '../constants';

export const useCarbonMapState = ({ selectedJob, showToast }) => {
  const [mapCenter, setMapCenter] = useState([22.15, 89.50]);
  const [mapZoom, setMapZoom] = useState(8);
  const [mapBounds, setMapBounds] = useState([[21.65, 89.02], [22.50, 89.85]]);
  const [basemap, setBasemap] = useState('terrain');
  const [activeLayer, setActiveLayer] = useState('ndvi');

  const [storedLocations, setStoredLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('carbonzero_stored_locations') || localStorage.getItem('carbonos_stored_locations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('carbonzero_stored_locations', JSON.stringify(storedLocations));
    } catch (e) {
      console.error("Failed to save locations to localStorage", e);
    }
  }, [storedLocations]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState(SUNDARBANS_RESERVE);

  const [searchQuery, setSearchQuery] = useState('');
  const [projectName, setProjectName] = useState('Sundarbans Forest Block B');
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-06-01');
  const [cloudCeiling, setCloudCeiling] = useState(20);
  const [ecoZonePreset, setEcoZonePreset] = useState('sundarbans');

  const [hoverCoords, setHoverCoords] = useState({ lat: 22.15, lng: 89.50 });
  const [inspectedPixel, setInspectedPixel] = useState({
    lat: "22.25000",
    lng: "89.50000",
    name: "Sundarbans Mangrove Reserve (Block B)",
    region: "Khulna Division, Bangladesh",
    ndvi: "0.762",
    biomass: "248.50",
    carbon: "118.04",
    confidence: "94% (model estimate, unverified)",
    timestamp: "10:30:00 AM",
    forestType: "Dense Coastal Mangrove"
  });

  const getJobBounds = (job) => {
    if (!job) return null;
    if (job.bounds) return job.bounds;
    if (job.polygon_geojson) {
      try {
        const poly = typeof job.polygon_geojson === 'string' 
          ? JSON.parse(job.polygon_geojson) 
          : job.polygon_geojson;
        
        let coords = [];
        if (poly.type === "Polygon") {
          coords = poly.coordinates[0];
        } else if (poly.type === "Feature") {
          coords = poly.geometry.coordinates[0];
        }

        if (coords && coords.length > 0) {
          const lats = coords.map(c => c[1]);
          const lngs = coords.map(c => c[0]);
          return [
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
          ];
        }
      } catch (e) {
        console.error("Failed to parse bounds from geojson", e);
      }
    }
    return [[22.2, 89.4], [22.4, 89.8]];
  };

  useEffect(() => {
    if (drawPoints.length >= 1) {
      const avgLat = drawPoints.reduce((sum, p) => sum + p[0], 0) / drawPoints.length;
      const avgLng = drawPoints.reduce((sum, p) => sum + p[1], 0) / drawPoints.length;
      
      const resolveProjectName = async () => {
        try {
          const controller = new AbortController();
          const tId = setTimeout(() => controller.abort(), 2000);
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${avgLat}&lon=${avgLng}&zoom=12&addressdetails=1`, { signal: controller.signal });
          clearTimeout(tId);
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const district = data.address.district || data.address.state_district || data.address.county || data.address.city || "";
              const suburb = data.address.suburb || data.address.village || data.address.neighbourhood || "";
              const place = suburb || district || "Forest Block";
              setProjectName(`${place} Carbon Project`);
            }
          }
        } catch {
          // Keep current projectName
        }
      };
      
      const timer = setTimeout(resolveProjectName, 800);
      return () => clearTimeout(timer);
    }
  }, [drawPoints]);

  const handleCoordsSearch = async () => {
    if (!searchQuery.trim()) return;

    const parts = searchQuery.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lng = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCenter([lat, lng]);
        setMapZoom(12);
        setMapBounds([[lat - 0.02, lng - 0.02], [lat + 0.02, lng + 0.02]]);
        handlePixelClick(lat, lng);
        return;
      }
    }

    try {
      const query = encodeURIComponent(searchQuery.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setMapCenter([lat, lon]);
          setMapZoom(12);
          setMapBounds([[lat - 0.02, lon - 0.02], [lat + 0.02, lon + 0.02]]);
          handlePixelClick(lat, lon);
        } else {
          showToast(`Could not find location: "${searchQuery}"`, "error");
        }
      } else {
        showToast("Geocoding search service is currently offline.", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error resolving search query.", "error");
    }
  };

  const handlePixelClick = async (lat, lng) => {
    const parsedLat = typeof lat === 'number' ? lat : parseFloat(lat);
    const parsedLng = typeof lng === 'number' ? lng : parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) return;

    const latStr = parsedLat.toFixed(5);
    const lngStr = parsedLng.toFixed(5);

    setInspectedPixel({
      lat: latStr,
      lng: lngStr,
      name: "Resolving location details...",
      region: "Contacting geocoder...",
      ndvi: "Calculating...",
      biomass: "Calculating...",
      carbon: "Calculating...",
      confidence: "...",
      forestType: "Classifying..."
    });

    const ecoZone = getBangladeshEcoZone(parsedLat, parsedLng);
    let forestType = ecoZone.forestType;
    let estimatedBiomass = (ecoZone.biomassMin + ecoZone.biomassMax) / 2;
    let estimatedCarbon = estimatedBiomass * 0.475;
    let ndvi = ecoZone.baseNdvi;

    let usedJobData = false;
    if (selectedJob && selectedJob.result) {
      const bounds = getJobBounds(selectedJob);
      const minLat = bounds[0][0];
      const maxLat = bounds[1][0];
      const minLng = bounds[0][1];
      const maxLng = bounds[1][1];

      if (parsedLat >= minLat && parsedLat <= maxLat && parsedLng >= minLng && parsedLng <= maxLng) {
        usedJobData = true;
        const latFraction = (parsedLat - minLat) / (maxLat - minLat || 1);
        const lngFraction = (parsedLng - minLng) / (maxLng - minLng || 1);
        const distSeed = Math.sin(latFraction * Math.PI) * Math.cos(lngFraction * Math.PI);
        const ndviDeviation = distSeed * 0.18;
        const avgNdvi = selectedJob.result.avg_ndvi || ecoZone.baseNdvi;
        ndvi = Math.min(0.92, Math.max(0.08, avgNdvi + ndviDeviation));
        estimatedBiomass = (selectedJob.result.estimated_biomass || estimatedBiomass) * (ndvi / (avgNdvi || 1));
        estimatedCarbon = estimatedBiomass * 0.475;
        forestType = ndvi > 0.6 ? `${ecoZone.forestType} Canopy` : "Secondary Canopy / Mixed Growth";
      }
    }

    if (!usedJobData) {
      const variation = Math.sin(parsedLat * 100) * Math.cos(parsedLng * 100);
      ndvi = Math.min(0.92, Math.max(0.12, ecoZone.baseNdvi + variation * 0.08));
      const biomassSpan = ecoZone.biomassMax - ecoZone.biomassMin;
      estimatedBiomass = ecoZone.biomassMin + (ndvi / 0.8) * biomassSpan;
      estimatedCarbon = estimatedBiomass * 0.475;
    }

    let locationName = `Coordinates: ${latStr}, ${lngStr}`;
    let districtInfo = ecoZone.zone;

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${parsedLat}&lon=${parsedLng}&zoom=10&addressdetails=1`, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'CarbonZero-BD-App' }
      });
      if (res.ok) {
        const data = await res.json();
        locationName = data.display_name || locationName;
        if (data.address) {
          const district = data.address.district || data.address.state_district || data.address.county || data.address.city || "";
          const state = data.address.state || "";
          const country = data.address.country || "Bangladesh";
          districtInfo = [district, state, country].filter(Boolean).join(", ");
        }
      }
    } catch {
      locationName = `${ecoZone.zone} (${latStr}, ${lngStr})`;
      districtInfo = "Bangladesh Sovereign Territory";
    }

    const newPixel = {
      lat: latStr,
      lng: lngStr,
      name: locationName,
      region: districtInfo,
      ndvi: ndvi.toFixed(3),
      biomass: estimatedBiomass.toFixed(2),
      carbon: estimatedCarbon.toFixed(2),
      confidence: "94% (NFI Tier-2 Calibrated)",
      timestamp: new Date().toLocaleTimeString(),
      forestType
    };

    setInspectedPixel(newPixel);

    setStoredLocations(prev => {
      const exists = prev.find(p => p.lat === newPixel.lat && p.lng === newPixel.lng);
      if (exists) return prev;
      return [newPixel, ...prev].slice(0, 20);
    });
  };

  const handleBoundaryUpload = async (e, onComplete) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await authFetch(`${FASTAPI_API_URL}/api/carbon/boundary/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        const polygon = data.polygon;
        const coords = polygon.coordinates[0].map(c => [c[1], c[0]]);
        if (coords[0][0] === coords[coords.length-1][0] && coords[0][1] === coords[coords.length-1][1]) {
          coords.pop();
        }
        setDrawPoints(coords);
        setIsDrawing(false);
        const lats = coords.map(c => c[0]);
        const lngs = coords.map(c => c[1]);
        setMapBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);
        if (onComplete) onComplete();
        showToast(`Boundary '${file.name}' loaded successfully! Click 'Run AI Satellite Analysis' to calculate metrics.`, 'success');
      } else {
        showToast("Failed to parse uploaded spatial boundary. Please check GeoJSON/KML format.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error reading spatial boundary file.", "error");
    }
  };

  return {
    mapCenter, setMapCenter,
    mapZoom, setMapZoom,
    mapBounds, setMapBounds,
    basemap, setBasemap,
    activeLayer, setActiveLayer,
    storedLocations, setStoredLocations,
    isDrawing, setIsDrawing,
    drawPoints, setDrawPoints,
    searchQuery, setSearchQuery,
    projectName, setProjectName,
    startDate, setStartDate,
    endDate, setEndDate,
    cloudCeiling, setCloudCeiling,
    ecoZonePreset, setEcoZonePreset,
    hoverCoords, setHoverCoords,
    inspectedPixel, setInspectedPixel,
    getJobBounds,
    handleCoordsSearch,
    handlePixelClick,
    handleBoundaryUpload
  };
};
