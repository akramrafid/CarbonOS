import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapLibreMap, ScaleControl, Popup, setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Layers, Mountain, SplitSquareHorizontal, Compass, Maximize2, Crosshair } from 'lucide-react';
import { pointInRing } from '../lib/carbonFallbackEstimator';

// Ensure MapLibre v6 resolves its standalone module worker cleanly in Vite dev and production builds
setWorkerUrl(maplibreWorkerUrl);

const EMPTY_FC = { type: 'FeatureCollection', features: [] };

// Build spatial grid cells directly from backend EO satellite pixels clipped inside the project polygon
const buildCanopyGridGeoJSON = (drawPoints, activeLayer, selectedJob, baselineData) => {
  if (!drawPoints || drawPoints.length < 3) return EMPTY_FC;
  const gridCells = selectedJob?.grid_cells;
  if (!Array.isArray(gridCells) || gridCells.length === 0) return EMPTY_FC;

  const features = [];
  for (let i = 0; i < gridCells.length; i++) {
    const cell = gridCells[i];
    const cLat = Number(cell.lat);
    const cLng = Number(cell.lng);
    if (!Number.isFinite(cLat) || !Number.isFinite(cLng)) continue;
    if (!pointInRing(cLng, cLat, drawPoints)) continue;

    const cellNdvi = Number(cell.ndvi ?? 0);
    const cellEvi = Number(cell.evi ?? 0);
    const cellNdwi = Number(cell.ndwi ?? 0);
    const cellBiomass = Number(cell.biomass ?? 0);
    const cellCarbon = Number(cell.carbon ?? 0);
    const cellCarbonTotal = Number(cell.carbon_total ?? cellCarbon);
    const cellHeight = Number(cell.height ?? 0);

    let fillColor = '#00C853';
    if (activeLayer === 'carbon_heatmap') {
      if (cell.stratum === 'OPEN_WATER') {
        fillColor = '#0284C7';
      } else {
        const t = Math.min(1, Math.max(0, cellCarbonTotal / 250));
        fillColor = t > 0.72 ? '#7C3AED' : t > 0.48 ? '#EC4899' : t > 0.22 ? '#F59E0B' : '#94A3B8';
      }
    } else if (activeLayer === 'ndwi') {
      fillColor = cellNdwi > 0.1 ? '#0284C7' : cellNdwi > -0.15 ? '#38BDF8' : '#7DD3FC';
    } else if (activeLayer === 'evi') {
      fillColor = cellEvi > 0.55 ? '#059669' : cellEvi > 0.3 ? '#10B981' : '#94A3B8';
    } else if (activeLayer === 'forest_cover') {
      fillColor = cellNdvi > 0.45 && cellBiomass > 60 ? '#15803D' : cellNdvi > 0.2 ? '#65A30D' : '#94A3B8';
    } else {
      fillColor =
        cellNdvi < 0.12 && cellNdwi > 0.05
          ? '#0284C7'
          : cellNdvi > 0.72
          ? '#00C853'
          : cellNdvi > 0.52
          ? '#22C55E'
          : cellNdvi > 0.30
          ? '#84CC16'
          : cellNdvi > 0.15
          ? '#F59E0B'
          : '#94A3B8';
    }

    const halfLat = Math.max(0.0001, Number(cell.step_lat ?? 0.0005) * 0.46);
    const halfLng = Math.max(0.0001, Number(cell.step_lng ?? 0.0005) * 0.46);
    const x0 = cLng - halfLng;
    const x1 = cLng + halfLng;
    const y0 = cLat - halfLat;
    const y1 = cLat + halfLat;

    features.push({
      type: 'Feature',
      properties: {
        ndvi: Number(cellNdvi.toFixed(3)),
        evi: Number(cellEvi.toFixed(3)),
        ndwi: Number(cellNdwi.toFixed(3)),
        biomass_mg_ha: Number(cellBiomass.toFixed(1)),
        carbon_tc_ha: Number(cellCarbonTotal.toFixed(1)),
        carbon_agb_tc_ha: Number(cellCarbon.toFixed(1)),
        height_m: Number(cellHeight.toFixed(1)),
        extrude_height: Math.round(Math.max(0, cellHeight) * 45),
        color: fillColor,
        stratum: cell.stratum || null,
        counterfactual_tc_ha:
          baselineData?.counterfactual_carbon_tc_ha != null
            ? Number(Number(baselineData.counterfactual_carbon_tc_ha).toFixed(1))
            : null,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]],
      },
    });
  }
  return { type: 'FeatureCollection', features };
};

const createUnifiedMapStyle = (initialBasemap) => {
  const vis = (id) => (initialBasemap === id ? 'visible' : 'none');
  return {
    version: 8,
    sources: {
      'src-satellite': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: 'ESRI World Imagery',
        maxzoom: 19,
      },
      'src-dark': {
        type: 'raster',
        tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxzoom: 19,
      },
      'src-terrain': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
        maxzoom: 19,
      },
      'src-light': {
        type: 'raster',
        tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxzoom: 19,
      },
      'src-terrarium-dem': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        encoding: 'terrarium',
        maxzoom: 15,
      },
    },
    layers: [
      { id: 'basemap-satellite', type: 'raster', source: 'src-satellite', layout: { visibility: vis('satellite') } },
      { id: 'basemap-dark', type: 'raster', source: 'src-dark', layout: { visibility: vis('dark') } },
      { id: 'basemap-terrain', type: 'raster', source: 'src-terrain', layout: { visibility: vis('terrain') } },
      { id: 'basemap-light', type: 'raster', source: 'src-light', layout: { visibility: vis('light') } },
    ],
  };
};

const safeSetGeoJSON = (map, sourceId, data) => {
  const src = map.getSource(sourceId);
  if (src) src.setData(data || EMPTY_FC);
};

const safeSetVis = (map, layerId, visible) => {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
};

export const DmrvMapStudio = ({
  drawPoints,
  setDrawPoints,
  isDrawing,
  basemap,
  setBasemap,
  activeLayer,
  layerConfig,
  osmContext,
  osmOverlays,
  inspectedPixel,
  activeAlerts,
  selectedJob,
  baselineData,
  donorPlotsGeoJson,
  mapBounds,
  mapCenter,
  mapZoom,
  onPixelClick,
  onHoverCoords,
  onFinishDrawing,
  analyzing,
  isLight,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const loadedRef = useRef(false);
  const isDrawingRef = useRef(isDrawing);
  const drawPointsRef = useRef(drawPoints);
  const onPixelClickRef = useRef(onPixelClick);
  const onHoverCoordsRef = useRef(onHoverCoords);
  const onFinishDrawingRef = useRef(onFinishDrawing);
  const syncLatestRef = useRef(null);

  const [is3D, setIs3D] = useState(false);
  const [swipeActive, setSwipeActive] = useState(false);
  const [swipePct, setSwipePct] = useState(52);
  const [showCanopyGrid, setShowCanopyGrid] = useState(true);
  const [hoverInfo, setHoverInfo] = useState({ lat: 22.15, lng: 89.5, zoom: 8.2 });

  useEffect(() => {
    isDrawingRef.current = isDrawing;
    drawPointsRef.current = drawPoints;
    onPixelClickRef.current = onPixelClick;
    onHoverCoordsRef.current = onHoverCoords;
    onFinishDrawingRef.current = onFinishDrawing;
  }, [isDrawing, drawPoints, onPixelClick, onHoverCoords, onFinishDrawing]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const canvas = map.getCanvas?.();
    if (canvas) {
      canvas.style.cursor = isDrawing ? 'crosshair' : '';
    }
    if (isDrawing) {
      map.doubleClickZoom?.disable();
    } else {
      map.doubleClickZoom?.enable();
    }
  }, [isDrawing]);

  const canopyGridFC = useMemo(
    () => buildCanopyGridGeoJSON(drawPoints, activeLayer, selectedJob, baselineData),
    [drawPoints, activeLayer, selectedJob, baselineData]
  );

  // Initialize MapLibre WebGL instance once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: createUnifiedMapStyle(basemap || 'terrain'),
      center: [mapCenter?.[1] ?? 89.5, mapCenter?.[0] ?? 22.15],
      zoom: mapZoom ?? 8,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });
    mapRef.current = map;

    map.addControl(new ScaleControl({ maxWidth: 110, unit: 'metric' }), 'bottom-right');

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          try {
            map.resize();
          } catch {
            // ignore resize during unmount
          }
        })
      : null;
    if (resizeObserver && containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    map.on('load', () => {
      // GeoJSON sources
      map.addSource('aoi-polygon', { type: 'geojson', data: EMPTY_FC });
      map.addSource('aoi-draw-path', { type: 'geojson', data: EMPTY_FC });
      map.addSource('aoi-vertices', { type: 'geojson', data: EMPTY_FC });
      map.addSource('canopy-grid', { type: 'geojson', data: EMPTY_FC });
      map.addSource('leakage-belt', { type: 'geojson', data: EMPTY_FC });
      map.addSource('osm-forest', { type: 'geojson', data: EMPTY_FC });
      map.addSource('osm-water', { type: 'geojson', data: EMPTY_FC });
      map.addSource('osm-roads', { type: 'geojson', data: EMPTY_FC });
      map.addSource('osm-industrial', { type: 'geojson', data: EMPTY_FC });
      map.addSource('overture-buildings', { type: 'geojson', data: EMPTY_FC });
      map.addSource('frontier-hotspots', { type: 'geojson', data: EMPTY_FC });
      map.addSource('donor-plots', { type: 'geojson', data: EMPTY_FC });
      map.addSource('alerts-points', { type: 'geojson', data: EMPTY_FC });
      map.addSource('inspected-point', { type: 'geojson', data: EMPTY_FC });

      // 1. 10 km Leakage Belt Ring
      map.addLayer({
        id: 'leakage-belt-fill',
        type: 'fill',
        source: 'leakage-belt',
        paint: { 'fill-color': '#F59E0B', 'fill-opacity': 0.08 },
      });
      map.addLayer({
        id: 'leakage-belt-line',
        type: 'line',
        source: 'leakage-belt',
        paint: { 'line-color': '#F59E0B', 'line-width': 2.2, 'line-dasharray': [4, 3] },
      });

      // 2. Frontier Encroachment Pressure Heatmap
      map.addLayer({
        id: 'frontier-heatmap',
        type: 'heatmap',
        source: 'frontier-hotspots',
        paint: {
          'heatmap-weight': ['coalesce', ['get', 'risk_score'], 0.4],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 6, 0.8, 12, 1.8],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.25, 'rgba(56,189,248,0.35)',
            0.55, 'rgba(245,158,11,0.65)',
            0.85, 'rgba(244,63,94,0.85)',
            1, 'rgba(225,29,72,0.95)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 6, 18, 12, 34],
          'heatmap-opacity': 0.72,
        },
      });

      // 3. QuackOSM GeoParquet / Overpass Vector Layers
      map.addLayer({
        id: 'osm-forest-fill',
        type: 'fill',
        source: 'osm-forest',
        paint: { 'fill-color': '#10B981', 'fill-opacity': 0.22 },
      });
      map.addLayer({
        id: 'osm-forest-line',
        type: 'line',
        source: 'osm-forest',
        paint: { 'line-color': '#10B981', 'line-width': 1.4 },
      });
      map.addLayer({
        id: 'osm-water-fill',
        type: 'fill',
        source: 'osm-water',
        paint: { 'fill-color': '#38BDF8', 'fill-opacity': 0.22 },
      });
      map.addLayer({
        id: 'osm-water-line',
        type: 'line',
        source: 'osm-water',
        paint: { 'line-color': '#38BDF8', 'line-width': 1.8 },
      });
      map.addLayer({
        id: 'osm-roads-line',
        type: 'line',
        source: 'osm-roads',
        paint: { 'line-color': '#FB923C', 'line-width': 2.0, 'line-opacity': 0.9 },
      });

      // 4. Overture Buildings (extrudable footprints)
      map.addLayer({
        id: 'overture-buildings-layer',
        type: 'fill-extrusion',
        source: 'overture-buildings',
        paint: {
          'fill-extrusion-color': '#A855F7',
          'fill-extrusion-height': ['coalesce', ['get', 'height_m'], 6],
          'fill-extrusion-opacity': 0.78,
        },
      });

      // 5. Industrial & Brick Kilns
      map.addLayer({
        id: 'osm-industrial-circle',
        type: 'circle',
        source: 'osm-industrial',
        paint: {
          'circle-radius': 6,
          'circle-color': '#F43F5E',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      // 6. Canopy Grid (2D Choropleth & 3D Biomass Extrusion)
      map.addLayer({
        id: 'canopy-grid-2d',
        type: 'fill',
        source: 'canopy-grid',
        paint: {
          'fill-color': ['coalesce', ['get', 'color'], '#00C853'],
          'fill-opacity': 0.44,
          'fill-outline-color': 'rgba(255,255,255,0.12)',
        },
      });
      map.addLayer({
        id: 'canopy-grid-3d',
        type: 'fill-extrusion',
        source: 'canopy-grid',
        layout: { visibility: 'none' },
        paint: {
          'fill-extrusion-color': ['coalesce', ['get', 'color'], '#00C853'],
          'fill-extrusion-height': ['coalesce', ['get', 'extrude_height'], 600],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85,
        },
      });

      // 7. Project AOI Border, Live Draw Path & Vertices
      map.addLayer({
        id: 'aoi-fill',
        type: 'fill',
        source: 'aoi-polygon',
        paint: { 'fill-color': '#00C853', 'fill-opacity': 0.16 },
      });
      map.addLayer({
        id: 'aoi-outline',
        type: 'line',
        source: 'aoi-polygon',
        paint: { 'line-color': '#00E676', 'line-width': 3 },
      });
      map.addLayer({
        id: 'aoi-draw-polyline',
        type: 'line',
        source: 'aoi-draw-path',
        paint: {
          'line-color': '#FFB300',
          'line-width': 2.5,
          'line-dasharray': [2, 2],
        },
      });
      map.addLayer({
        id: 'aoi-vertex-dots',
        type: 'circle',
        source: 'aoi-vertices',
        paint: {
          'circle-radius': 6,
          'circle-color': '#FFB300',
          'circle-stroke-color': '#040906',
          'circle-stroke-width': 2,
        },
      });

      // 8. Control Donor Plots (VT0007 Spatial Donors)
      map.addLayer({
        id: 'donor-plots-circle',
        type: 'circle',
        source: 'donor-plots',
        paint: {
          'circle-radius': 7,
          'circle-color': '#14B8A6',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
        },
      });

      // 9. Satellite Alerts & Inspected Pixel Pin
      map.addLayer({
        id: 'alerts-circle',
        type: 'circle',
        source: 'alerts-points',
        paint: {
          'circle-radius': 8,
          'circle-color': ['match', ['get', 'severity'], 'critical', '#EF4444', '#F59E0B'],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
        },
      });
      map.addLayer({
        id: 'inspected-pixel-pin',
        type: 'circle',
        source: 'inspected-point',
        paint: {
          'circle-radius': 8,
          'circle-color': '#00E676',
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2.5,
        },
      });

      loadedRef.current = true;
      if (isDrawingRef.current) {
        const canvas = map.getCanvas?.();
        if (canvas) canvas.style.cursor = 'crosshair';
        map.doubleClickZoom?.disable();
      }
      if (syncLatestRef.current) {
        syncLatestRef.current();
      }
    });

    map.on('dblclick', (e) => {
      if (isDrawingRef.current && drawPointsRef.current?.length >= 3 && onFinishDrawingRef.current) {
        e.preventDefault();
        onFinishDrawingRef.current();
      }
    });

    map.on('mousemove', (e) => {
      setHoverInfo({
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        zoom: map.getZoom(),
      });
      if (onHoverCoordsRef.current) {
        onHoverCoordsRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    map.on('click', (e) => {
      // Check clickable vector features first (Donor plots / Industrial / Alerts) when not drawing
      if (!isDrawingRef.current) {
        const hitLayers = ['donor-plots-circle', 'osm-industrial-circle', 'alerts-circle', 'canopy-grid-2d', 'canopy-grid-3d']
          .filter((id) => map.getLayer(id));
        const hits = map.queryRenderedFeatures(e.point, { layers: hitLayers });
        const featureHit = hits.find((h) => ['donor-plots-circle', 'osm-industrial-circle', 'alerts-circle'].includes(h.layer.id));
        if (featureHit) {
          const props = featureHit.properties || {};
          const html = `
            <div style="font-family:Poppins,sans-serif;font-size:11px;color:#0F291B;max-width:220px;">
              <div style="font-weight:700;margin-bottom:3px;">${props.name || props.donor_id || props.alert_type || 'GIS Feature'}</div>
              ${props.weight_pct != null ? `<div>Match Weight: <b>${props.weight_pct}%</b></div>` : ''}
              ${props.latest_carbon_tc_ha != null ? `<div>Donor Carbon: <b>${props.latest_carbon_tc_ha} tC/ha</b> (${props.distance_km} km away)</div>` : ''}
              ${props.message ? `<div>${props.message}</div>` : ''}
              ${props.osm_id ? `<div style="color:#64748B;font-size:10px;">ID: ${props.osm_id}</div>` : ''}
            </div>`;
          new Popup({ offset: 12 }).setLngLat(e.lngLat).setHTML(html).addTo(map);
        }
        if (onPixelClickRef.current) {
          onPixelClickRef.current(e.lngLat.lat, e.lngLat.lng);
        }
      } else {
        setDrawPoints((prev) => [...prev, [e.lngLat.lat, e.lngLat.lng]]);
      }
    });

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      loadedRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync basemap raster layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    ['satellite', 'dark', 'terrain', 'light'].forEach((id) => {
      safeSetVis(map, `basemap-${id}`, (basemap || 'terrain') === id);
    });
  }, [basemap]);

  // Sync 2D vs 3D Terrain & Biomass Extrusion mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (is3D) {
      map.setTerrain({ source: 'src-terrarium-dem', exaggeration: 1.8 });
      map.easeTo({ pitch: 52, bearing: -16, duration: 750 });
    } else {
      map.setTerrain(null);
      map.easeTo({ pitch: 0, bearing: 0, duration: 550 });
    }
    safeSetVis(map, 'canopy-grid-2d', showCanopyGrid && !is3D);
    safeSetVis(map, 'canopy-grid-3d', showCanopyGrid && is3D);
  }, [is3D, showCanopyGrid]);

  // Sync polygon, canopy grid, OSM + Overture + Donors + Alerts GeoJSON layers
  useEffect(() => {
    const map = mapRef.current;
    const syncData = () => {
      if (!map || !map.getSource('aoi-polygon')) return;
      if (drawPoints && drawPoints.length >= 3) {
        const ring = [...drawPoints, drawPoints[0]].map((p) => [p[1], p[0]]);
        safeSetGeoJSON(map, 'aoi-polygon', {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} }],
        });
      } else {
        safeSetGeoJSON(map, 'aoi-polygon', EMPTY_FC);
      }

      if (drawPoints && drawPoints.length >= 2 && (isDrawing || drawPoints.length < 3)) {
        safeSetGeoJSON(map, 'aoi-draw-path', {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: drawPoints.map((p) => [p[1], p[0]]) },
            properties: {},
          }],
        });
      } else {
        safeSetGeoJSON(map, 'aoi-draw-path', EMPTY_FC);
      }

      safeSetGeoJSON(map, 'aoi-vertices', {
        type: 'FeatureCollection',
        features: (isDrawing || (drawPoints && drawPoints.length < 3))
          ? (drawPoints || []).map((p, idx) => ({
              type: 'Feature',
              properties: { idx },
              geometry: { type: 'Point', coordinates: [p[1], p[0]] },
            }))
          : [],
      });

      safeSetGeoJSON(map, 'canopy-grid', canopyGridFC);
      safeSetVis(map, 'canopy-grid-2d', showCanopyGrid && !is3D);
      safeSetVis(map, 'canopy-grid-3d', showCanopyGrid && is3D);

      safeSetGeoJSON(map, 'leakage-belt', osmContext?.leakage_belt?.geojson || EMPTY_FC);
      safeSetVis(map, 'leakage-belt-fill', Boolean(osmOverlays?.leakageBelt));
      safeSetVis(map, 'leakage-belt-line', Boolean(osmOverlays?.leakageBelt));

      safeSetGeoJSON(map, 'osm-forest', osmContext?.layers?.forest || EMPTY_FC);
      safeSetVis(map, 'osm-forest-fill', Boolean(osmOverlays?.forest));
      safeSetVis(map, 'osm-forest-line', Boolean(osmOverlays?.forest));

      safeSetGeoJSON(map, 'osm-water', osmContext?.layers?.water || EMPTY_FC);
      safeSetVis(map, 'osm-water-fill', Boolean(osmOverlays?.water));
      safeSetVis(map, 'osm-water-line', Boolean(osmOverlays?.water));

      safeSetGeoJSON(map, 'osm-roads', osmContext?.layers?.roads || EMPTY_FC);
      safeSetVis(map, 'osm-roads-line', Boolean(osmOverlays?.roads));

      safeSetGeoJSON(map, 'osm-industrial', osmContext?.layers?.industrial || EMPTY_FC);
      safeSetVis(map, 'osm-industrial-circle', Boolean(osmOverlays?.industrial));

      safeSetGeoJSON(map, 'overture-buildings', osmContext?.layers?.overture_buildings || EMPTY_FC);
      safeSetVis(map, 'overture-buildings-layer', Boolean(osmOverlays?.overture_buildings ?? true));

      safeSetGeoJSON(map, 'frontier-hotspots', osmContext?.layers?.hotspots || EMPTY_FC);
      safeSetVis(map, 'frontier-heatmap', Boolean(osmOverlays?.hotspots ?? true));

      safeSetGeoJSON(map, 'donor-plots', donorPlotsGeoJson || EMPTY_FC);
      safeSetVis(map, 'donor-plots-circle', Boolean(osmOverlays?.donorPlots ?? true));

      safeSetGeoJSON(map, 'alerts-points', {
        type: 'FeatureCollection',
        features: (activeAlerts || [])
          .filter((a) => !a.is_resolved && Array.isArray(a.location) && a.location.length === 2)
          .map((a) => ({
            type: 'Feature',
            properties: { id: a.id, severity: a.severity, alert_type: a.alert_type, message: a.message },
            geometry: { type: 'Point', coordinates: [a.location[1], a.location[0]] },
          })),
      });

      if (inspectedPixel && !isNaN(parseFloat(inspectedPixel.lat)) && !isNaN(parseFloat(inspectedPixel.lng))) {
        safeSetGeoJSON(map, 'inspected-point', {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: [parseFloat(inspectedPixel.lng), parseFloat(inspectedPixel.lat)] },
          }],
        });
      } else {
        safeSetGeoJSON(map, 'inspected-point', EMPTY_FC);
      }
    };

    syncLatestRef.current = syncData;
    if (!map) return;
    if (loadedRef.current) {
      syncData();
    }
  }, [drawPoints, isDrawing, canopyGridFC, osmContext, osmOverlays, donorPlotsGeoJson, activeAlerts, inspectedPixel, showCanopyGrid, is3D]);

  // Fit bounds when preset/search/job changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapBounds || mapBounds.length !== 2) return;
    try {
      const [[minLat, minLng], [maxLat, maxLng]] = mapBounds;
      if ([minLat, minLng, maxLat, maxLng].every((v) => Number.isFinite(v))) {
        map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 48, maxZoom: 13, duration: 600 });
      }
    } catch {
      // Ignore malformed transient bounds
    }
  }, [mapBounds]);

  const handleFitAoi = () => {
    const map = mapRef.current;
    if (!map || !drawPoints || drawPoints.length < 3) return;
    const lats = drawPoints.map((p) => p[0]);
    const lngs = drawPoints.map((p) => p[1]);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: 54, maxZoom: 13, pitch: is3D ? 52 : 0, duration: 600 }
    );
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 h-[560px] z-10 select-none">
      <div ref={containerRef} className="w-full h-full" />

      {/* Epoch T0 vs T1 Split-Swipe Overlay Curtain */}
      {swipeActive && (
        <>
          <div
            className="pointer-events-none absolute inset-0 z-10 border-r-2 border-emerald-400"
            style={{
              clipPath: `inset(0 ${100 - swipePct}% 0 0)`,
              background: 'linear-gradient(135deg, rgba(120,53,15,0.22), rgba(245,158,11,0.16))',
              backdropFilter: 'sepia(0.35) contrast(0.92)',
            }}
          />
          <div
            className="absolute top-0 bottom-0 z-20 w-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(0,230,118,0.9)] pointer-events-none"
            style={{ left: `${swipePct}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#040906]/95 border border-emerald-400 text-emerald-400 text-[10px] font-mono px-2 py-1 rounded-full whitespace-nowrap shadow-lg">
              T0 2020 ◀ ▶ T1 2026
            </div>
          </div>
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30 bg-[#040906]/90 border border-white/15 rounded-full px-4 py-1.5 flex items-center gap-3 shadow-xl">
            <span className="text-[10px] font-mono text-amber-300 font-bold">Baseline T0</span>
            <input
              type="range"
              min={5}
              max={95}
              value={swipePct}
              onChange={(e) => setSwipePct(Number(e.target.value))}
              aria-label="Epoch comparison split slider"
              className="w-36 sm:w-48 accent-emerald-400 cursor-ew-resize"
            />
            <span className="text-[10px] font-mono text-emerald font-bold">Current T1</span>
          </div>
        </>
      )}

      {/* WebGL Studio Controls Bar (Top Left) */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 max-w-[70%]">
        <button
          type="button"
          onClick={() => setIs3D((v) => !v)}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer ${
            is3D
              ? 'bg-emerald text-carbon border-emerald shadow-md'
              : 'bg-[#040906]/85 text-white border-white/15 hover:border-emerald/50'
          }`}
        >
          <Mountain size={13} />
          <span>{is3D ? '3D Canopy & DEM' : '2D Map'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowCanopyGrid((v) => !v)}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer ${
            showCanopyGrid
              ? 'bg-[#040906]/85 text-emerald border-emerald/40'
              : 'bg-[#040906]/85 text-mist border-white/15'
          }`}
        >
          <Layers size={13} />
          <span>Biomass Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setSwipeActive((v) => !v)}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border backdrop-blur-md transition-all cursor-pointer ${
            swipeActive
              ? 'bg-amber text-carbon border-amber shadow-md'
              : 'bg-[#040906]/85 text-white border-white/15 hover:border-amber/50'
          }`}
        >
          <SplitSquareHorizontal size={13} />
          <span>Epoch Swipe</span>
        </button>

        <button
          type="button"
          onClick={handleFitAoi}
          title="Zoom to Active AOI Polygon"
          className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 bg-[#040906]/85 text-mist hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
        >
          <Crosshair size={13} />
          <span>Fit AOI</span>
        </button>
      </div>

      {/* Basemap Quick Switcher Pills (Bottom Center-Left) */}
      <div className="hidden sm:flex items-center gap-1 absolute bottom-12 left-3 z-20 bg-[#040906]/85 backdrop-blur-md border border-white/15 rounded-xl p-1">
        {[
          { id: 'satellite', label: 'Satellite' },
          { id: 'dark', label: 'Dark' },
          { id: 'terrain', label: 'Terrain' },
          { id: 'light', label: 'Light' },
        ].map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBasemap && setBasemap(b.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
              (basemap || 'terrain') === b.id ? 'bg-emerald text-carbon' : 'text-mist hover:text-white'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Lat/Lng/Zoom HUD (Bottom Left) */}
      <div className="absolute bottom-3 left-3 bg-[#040906]/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-mist font-mono z-20">
        Lat: {hoverInfo.lat.toFixed(5)}, Lng: {hoverInfo.lng.toFixed(5)} · Z{hoverInfo.zoom.toFixed(1)}
        {isDrawing && <span className="ml-2 text-amber font-bold">DRAW MODE</span>}
      </div>

      {/* Map Loading overlay */}
      {analyzing && (
        <div className="absolute inset-0 bg-carbon/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin"></div>
          <h3 className="font-bold font-sans text-lg text-white">Running Multi-Sensor Satellite &amp; dMRV Pipeline...</h3>
          <p className="text-xs text-mist max-w-sm text-center">
            Ingesting Sentinel-2 COG bands, Sentinel-1 backscatter, QuackOSM GeoParquet belt &amp; synthetic control plots.
          </p>
        </div>
      )}

      {/* Dynamic Legend Overlay (Top Right) */}
      <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-[#040906]/90 backdrop-blur-md border border-white/15 p-2.5 sm:p-3.5 rounded-2xl max-w-[175px] sm:max-w-[220px] z-20 space-y-2 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-mist truncate">
            {layerConfig?.[activeLayer]?.title || 'INDEX RANGE'}
          </h4>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${layerConfig?.[activeLayer]?.badgeClass || 'bg-emerald text-carbon'}`}>
            {layerConfig?.[activeLayer]?.id?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-20 rounded shadow-inner"
            style={{ background: layerConfig?.[activeLayer]?.gradientCSS || 'linear-gradient(to top, #78350F, #F59E0B, #84CC16, #00C853)' }}
          />
          <div className="flex flex-col justify-between h-20 text-[10px] text-mist font-mono">
            {(layerConfig?.[activeLayer]?.ticks || ['High (0.85)', 'Med (0.50)', 'Low (0.15)']).map((tick, i) => (
              <span key={i} className={i === 0 ? 'text-white font-semibold' : ''}>{tick}</span>
            ))}
          </div>
        </div>

        <div className="text-[9px] text-mist/85 border-t border-white/10 pt-1.5 space-y-1">
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> VT0007 Donor Plots</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Overture Buildings</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Frontier Heat / Kilns</div>
        </div>
      </div>
    </div>
  );
};

export default DmrvMapStudio;
