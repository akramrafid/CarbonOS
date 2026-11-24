import React, { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  Polygon,
  Marker,
  useMap,
  useMapEvents,
  Popup
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LAYER_CONFIG } from '../../constants';

const RecenterMap = ({ bounds, center, zoom }) => {
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

const MapResizeHandler = () => {
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

const MapEventHandler = ({
  isDrawing,
  drawPoints,
  setDrawPoints,
  onPixelClick,
  setHoverCoords
}) => {
  useMapEvents({
    mousemove(e) {
      setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    click(e) {
      if (isDrawing) {
        setDrawPoints([...drawPoints, [e.latlng.lat, e.latlng.lng]]);
      } else {
        onPixelClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });

  return null;
};

export function GisLeafletViewer(props) {
  const {
    isLight,
    mapCenter,
    mapZoom,
    mapBounds,
    basemap,
    activeLayer,
    drawPoints,
    setDrawPoints,
    isDrawing,
    inspectedPixel,
    selectedJob,
    getJobBounds,
    handlePixelClick,
    hoverCoords,
    setHoverCoords,
    analyzing
  } = props;

  return (
    <div className="isolate relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 h-[500px] z-0">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <MapResizeHandler />

        {basemap === 'dark' || basemap === 'carto' ? (
          <TileLayer
            key={isLight ? 'carto-light' : 'carto-dark'}
            url={
              isLight
                ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            }
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={19}
          />
        ) : basemap === 'satellite' ? (
          <TileLayer
            key="satellite"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; ESRI ArcGIS World Imagery"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="terrain"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        {drawPoints.length > 0 && (
          <>
            <Polygon
              positions={drawPoints}
              pathOptions={{
                color: LAYER_CONFIG[activeLayer]?.borderColor || '#00C853',
                fillColor: LAYER_CONFIG[activeLayer]?.fillColor || '#00C853',
                fillOpacity: LAYER_CONFIG[activeLayer]?.fillOpacity || 0.3,
                weight: 2.5
              }}
            />
            {isDrawing && drawPoints.map((point, idx) => (
              <Marker key={idx} position={point} />
            ))}
          </>
        )}

        {inspectedPixel &&
          !isNaN(parseFloat(inspectedPixel.lat)) &&
          !isNaN(parseFloat(inspectedPixel.lng)) && (
            <Marker position={[parseFloat(inspectedPixel.lat), parseFloat(inspectedPixel.lng)]}>
              <Popup>
                <div className="text-xs p-1 max-w-xs leading-tight">
                  <div className="font-bold text-accent">
                    {inspectedPixel.forestType || 'Inspected Pixel'}
                  </div>
                  <div className="text-gray-500 font-mono text-[10px] mt-0.5">
                    {inspectedPixel.lat}, {inspectedPixel.lng}
                  </div>
                  <div className="mt-1.5 font-medium text-gray-700">
                    Biomass: <span className="font-bold">{inspectedPixel.biomass} Mg/ha</span>
                  </div>
                  <div className="mt-1.5 font-medium text-gray-700">
                    Carbon: <span className="font-bold">{inspectedPixel.carbon} tC/ha</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    NDVI: {inspectedPixel.ndvi} • {inspectedPixel.confidence}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

        {selectedJob &&
          selectedJob.result &&
          selectedJob.layers &&
          selectedJob.layers.length > 0 &&
          getJobBounds && (
            selectedJob.layers
              .filter((l) => l.layer_type === activeLayer)
              .map((layer, idx) => (
                <ImageOverlay
                  key={idx}
                  url={layer.layer_url}
                  bounds={getJobBounds(selectedJob)}
                  opacity={0.65}
                />
              ))
          )}

        <RecenterMap bounds={mapBounds} center={mapCenter} zoom={mapZoom} />

        <MapEventHandler
          isDrawing={isDrawing}
          drawPoints={drawPoints}
          setDrawPoints={setDrawPoints}
          onPixelClick={handlePixelClick}
          setHoverCoords={setHoverCoords}
        />
      </MapContainer>

      <div className="absolute bottom-4 left-4 bg-carbon/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-mist font-mono z-20">
        Lat: {hoverCoords.lat.toFixed(5)}, Lng: {hoverCoords.lng.toFixed(5)}
      </div>

      {analyzing && (
        <div className="absolute inset-0 bg-carbon/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin"></div>
          <h3 className="font-bold font-sans text-lg text-white">Generating Median Sentinel-2 Composite...</h3>
          <p className="text-xs text-mist max-w-sm text-center">
            Processing cloud masking filters and running Random Forest Carbon estimations on the AI Inference service.
          </p>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-carbon/90 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl max-w-[210px] z-20 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-mist truncate">
            {LAYER_CONFIG[activeLayer]?.title || 'INDEX RANGE'}
          </h4>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
              LAYER_CONFIG[activeLayer]?.badgeClass || 'bg-emerald text-carbon'
            }`}
          >
            {LAYER_CONFIG[activeLayer]?.id?.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className="w-3 h-20 rounded shadow-inner"
            style={{
              background:
                LAYER_CONFIG[activeLayer]?.gradientCSS ||
                'linear-gradient(to top, #78350F, #F59E0B, #84CC16, #00C853)'
            }}
          ></div>
          <div className="flex flex-col justify-between h-20 text-[10px] text-mist font-mono">
            {LAYER_CONFIG[activeLayer]?.ticks?.map((tick, i) => (
              <span key={i} className={i === 0 ? 'text-white font-semibold' : ''}>
                {tick}
              </span>
            )) || (
              <>
                <span>High (0.85)</span>
                <span>Med (0.50)</span>
                <span>Low (0.15)</span>
              </>
            )}
          </div>
        </div>

        <p className="text-[9px] text-mist/80 border-t border-white/10 pt-1.5 leading-tight">
          {LAYER_CONFIG[activeLayer]?.description}
        </p>
      </div>
    </div>
  );
}

export default GisLeafletViewer;
