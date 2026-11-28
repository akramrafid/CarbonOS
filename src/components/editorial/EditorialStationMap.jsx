import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPrefersReducedMotion } from '../../lib/motion';

export const STATION_COORDS = {
  khulna: { lat: 22.58, lng: 89.33, zoom: 11, ndvi: '0.74 NDVI' },
  sundarbans: { lat: 22.25, lng: 89.58, zoom: 11, ndvi: '0.84 NDVI' },
  rangpur: { lat: 25.58, lng: 89.28, zoom: 11, ndvi: '0.78 NDVI' },
  dhaka: { lat: 23.76, lng: 90.39, zoom: 12, ndvi: '0.31 NDVI · CEMS' },
};

const createPulseIcon = (isActive) =>
  L.divIcon({
    className: 'ed-station-pin-wrap',
    html: `<span class="ed-station-pin ${isActive ? 'is-active' : ''}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

function StationFlyController({ activeStationId }) {
  const map = useMap();
  const prevIdRef = useRef(activeStationId);

  useEffect(() => {
    const container = map.getContainer();
    if (!container || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  useEffect(() => {
    const coords = STATION_COORDS[activeStationId] || STATION_COORDS.khulna;
    const isInitial = prevIdRef.current === activeStationId;
    prevIdRef.current = activeStationId;
    if (getPrefersReducedMotion() || isInitial) {
      map.setView([coords.lat, coords.lng], coords.zoom, { animate: false });
    } else {
      map.flyTo([coords.lat, coords.lng], coords.zoom, { duration: 1.1 });
    }
  }, [activeStationId, map]);

  return null;
}

export function EditorialStationMap({ stations, activeStation, onSelectStation }) {
  const [layerMode, setLayerMode] = useState('satellite');
  const coords = STATION_COORDS[activeStation?.id] || STATION_COORDS.khulna;

  return (
    <div className="ed-earthdata-box">
      <div className="ed-earthdata-head">
        <div className="ed-earthdata-title-group">
          <span className="ed-earthdata-dot" aria-hidden="true" />
          <span className="ed-mono ed-accent-text">
            NASA EARTHDATA · SENTINEL-2 ORBITAL VIEWPORT
          </span>
        </div>
        <div className="ed-earthdata-controls">
          <span className="ed-mono ed-muted-text">
            {coords.lat.toFixed(2)}°N, {coords.lng.toFixed(2)}°E · {coords.ndvi}
          </span>
          <button
            type="button"
            onClick={() => setLayerMode((m) => (m === 'satellite' ? 'osm' : 'satellite'))}
            className="ed-pill ed-pill--subtle ed-pill--compact ed-mono"
          >
            {layerMode === 'satellite' ? 'Satellite Layer' : 'Street Grid'}
          </button>
        </div>
      </div>

      <div className="ed-earthdata-viewport">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={coords.zoom}
          scrollWheelZoom={false}
          attributionControl={false}
          className="ed-earthdata-map"
        >
          {layerMode === 'satellite' ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
            />
          )}

          <StationFlyController activeStationId={activeStation?.id} />

          {stations.map((st) => {
            const c = STATION_COORDS[st.id] || STATION_COORDS.khulna;
            const isSelected = st.id === activeStation?.id;
            return (
              <React.Fragment key={st.id}>
                <Circle
                  center={[c.lat, c.lng]}
                  radius={isSelected ? 4200 : 2200}
                  pathOptions={{
                    color: isSelected ? '#00C853' : '#94A3B8',
                    weight: isSelected ? 2 : 1,
                    fillColor: '#00C853',
                    fillOpacity: isSelected ? 0.18 : 0.06,
                  }}
                />
                <Marker
                  position={[c.lat, c.lng]}
                  icon={createPulseIcon(isSelected)}
                  eventHandlers={{
                    click: () => onSelectStation?.(st),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <span className="font-mono text-xs">{st.name}</span>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Orbital Reticle HUD */}
        <div className="ed-earthdata-reticle" aria-hidden="true">
          <div className="ed-earthdata-sweep" />
        </div>
        <div className="ed-earthdata-hud ed-mono">
          <span>ACTIVE NODE: {activeStation?.name}</span>
          <span className="ed-accent-text">{activeStation?.type}</span>
        </div>
      </div>
    </div>
  );
}

export default EditorialStationMap;
