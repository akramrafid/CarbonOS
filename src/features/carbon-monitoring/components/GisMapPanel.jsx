import React from 'react';
import { 
  MapContainer, 
  TileLayer, 
  ImageOverlay, 
  Polygon, 
  Marker, 
  useMap, 
  useMapEvents, 
  Popup, 
  Tooltip 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  Search,
  Upload,
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Trees,
  Info,
  Download,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import {
  SUNDARBANS_RESERVE,
  CHT_RESERVE,
  BANGLADESH_BORDER,
  LAYER_CONFIG
} from '../constants';

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

// Component to force Leaflet resize on mount or tab switch so tiles render immediately
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

// Component to handle drawing points and click inspection on map
const MapEventHandler = ({ 
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

export function GisMapPanel(props) {
  const {
    isLight,
    isBn,
    t,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    mapBounds,
    setMapBounds,
    basemap,
    setBasemap,
    activeLayer,
    setActiveLayer,
    storedLocations,
    setStoredLocations,
    isDrawing,
    setIsDrawing,
    drawPoints,
    setDrawPoints,
    searchQuery,
    setSearchQuery,
    projectName,
    setProjectName,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    cloudCeiling,
    setCloudCeiling,
    hoverCoords,
    setHoverCoords,
    inspectedPixel,
    setInspectedPixel,
    analyzing,
    handleRunAnalysis,
    handleBoundaryUpload,
    handleCoordsSearch,
    handlePixelClick,
    ecoZonePreset,
    setEcoZonePreset
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Map Viewer Controls Sidebar */}
          <div className="lg:col-span-1 flex flex-col space-y-6">
            
            {/* Coordinate Search box */}
            <div className={`border rounded-2xl p-5 transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <h3 className={`font-bold text-sm mb-3 uppercase tracking-wider flex items-center space-x-2 ${
                isLight ? 'text-[#0F291B]' : 'text-mist'
              }`}>
                <MapPin size={16} className="text-emerald" />
                <span>Search Coordinates</span>
              </h3>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lat, Lng (e.g. 22.3, 89.6)"
                  className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B] placeholder-[#94A3B8]' : 'bg-white/5 border-white/10 text-white placeholder-mist/60'
                  }`}
                />
                <button 
                  onClick={handleCoordsSearch}
                  aria-label="Search coordinates"
                  title="Search coordinates"
                  className="bg-emerald text-carbon font-bold p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-emerald/80 transition-colors cursor-pointer"
                >
                  <Search size={16} />
                </button>
              </div>
            </div>

            {/* Polygon Draw Box */}
            <div className={`border rounded-2xl p-5 transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <h3 className={`font-bold text-sm mb-3 uppercase tracking-wider flex items-center space-x-2 ${
                isLight ? 'text-[#0F291B]' : 'text-mist'
              }`}>
                <Navigation size={16} className="text-emerald" />
                <span>Boundary Selection</span>
              </h3>
              
              <div className="space-y-4">
                {/* Preset boundaries */}
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                    isLight ? 'text-[#64748B]' : 'text-mist'
                  }`}>
                    Quick Boundary Presets
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setDrawPoints(SUNDARBANS_RESERVE);
                        setIsDrawing(false);
                        setMapCenter([22.15, 89.45]);
                        setMapZoom(9);
                        setMapBounds([[21.65, 89.02], [22.50, 89.85]]);
                      }}
                      className={`text-[11px] py-1.5 px-2 rounded-lg font-semibold border transition-all text-left truncate cursor-pointer ${
                        drawPoints === SUNDARBANS_RESERVE || (drawPoints.length === SUNDARBANS_RESERVE.length && drawPoints[0][0] === SUNDARBANS_RESERVE[0][0])
                          ? (isLight ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E] font-bold' : 'bg-emerald/15 border-emerald text-emerald font-bold')
                          : (isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-mist')
                      }`}
                    >
                      Sundarbans (3,800 ha)
                    </button>
                    <button
                      onClick={() => {
                        setDrawPoints(CHT_RESERVE);
                        setIsDrawing(false);
                        setMapCenter([22.75, 92.25]);
                        setMapZoom(9);
                        setMapBounds([[21.85, 92.15], [23.70, 92.65]]);
                      }}
                      className={`text-[11px] py-1.5 px-2 rounded-lg font-semibold border transition-all text-left truncate cursor-pointer ${
                        drawPoints === CHT_RESERVE || (drawPoints.length === CHT_RESERVE.length && drawPoints[0][0] === CHT_RESERVE[0][0])
                          ? (isLight ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E] font-bold' : 'bg-emerald/15 border-emerald text-emerald font-bold')
                          : (isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-mist')
                      }`}
                    >
                      Chittagong HT (5,420 ha)
                    </button>
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
                }`}>
                  <div>
                    <span className={`text-xs font-medium block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>Custom Draw Polygon</span>
                    <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                      {isDrawing ? 'Click points on map' : 'Click to plot custom bounds'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsDrawing(!isDrawing);
                      if (!isDrawing) setDrawPoints([]);
                    }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDrawing 
                        ? 'bg-amber text-carbon' 
                        : (isLight ? 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F291B]' : 'bg-white/10 hover:bg-white/20 text-white')
                    }`}
                  >
                    {isDrawing ? 'Drawing... (Click map)' : 'Start Drawing'}
                  </button>
                </div>
                
                {drawPoints.length >= 3 ? (() => {
                  const currentMetrics = calculateGeodesicMetrics(drawPoints);
                  const currentZone = getBangladeshEcoZone(currentMetrics.centroid[0], currentMetrics.centroid[1]);
                  return (
                    <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                      isLight ? 'bg-[#E8F8EE]/60 border-[#C2E9CF]' : 'bg-emerald/10 border-emerald/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                          isLight ? 'text-[#00873E]' : 'text-emerald'
                        }`}>
                          <CheckCircle size={13} />
                          <span>Enclosed Boundary</span>
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          isLight ? 'bg-white text-[#475569] border border-[#C2E9CF]' : 'bg-carbon/60 text-mist border border-white/10'
                        }`}>
                          {drawPoints.length} vertices
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald/15 text-xs">
                        <div>
                          <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Geodesic Area</span>
                          <span className={`font-extrabold font-mono text-sm block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                            {currentMetrics.areaHa} <span className="text-[10px] font-normal">ha</span>
                          </span>
                          <span className={`block text-[10px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                            ({currentMetrics.areaAcres} acres)
                          </span>
                        </div>
                        <div>
                          <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Perimeter</span>
                          <span className={`font-extrabold font-mono text-sm block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                            {currentMetrics.perimeterKm} <span className="text-[10px] font-normal">km</span>
                          </span>
                          <span className={`block text-[10px] truncate ${isLight ? 'text-[#00873E]' : 'text-emerald'}`} title={currentZone.zone}>
                            {currentZone.zone.split(' ')[0]} {currentZone.zone.split(' ')[1] || ''}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-emerald/15 flex items-center justify-between gap-2">
                        <button
                          onClick={handleRunAnalysis}
                          disabled={analyzing}
                          className={`flex-1 font-bold text-xs py-2 px-3 rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
                            isLight
                              ? 'bg-[#00873E] hover:bg-[#007033] text-white border border-[#00873E]'
                              : 'bg-emerald hover:bg-emerald-400 text-carbon border border-emerald'
                          }`}
                        >
                          <Sparkles size={14} className={analyzing ? "animate-spin" : ""} />
                          <span>{analyzing ? 'Analyzing Radar...' : 'Run AI Satellite Analysis'}</span>
                        </button>
                        <button
                          onClick={() => setDrawPoints([])}
                          title="Clear Boundary"
                          className="px-2.5 py-2 text-xs text-red-500 hover:text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  );
                })() : drawPoints.length > 0 ? (
                  <div className={`p-3 rounded-xl border text-xs ${
                    isLight ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : 'bg-amber/10 border-amber/20 text-amber'
                  }`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span>Vertices Plotted: {drawPoints.length}</span>
                      <button 
                        onClick={() => setDrawPoints([])}
                        className="text-red-500 underline hover:text-red-400 cursor-pointer text-[11px]"
                      >
                        Reset
                      </button>
                    </div>
                    <p className="text-[11px] mt-1 opacity-90">
                      Click {3 - drawPoints.length} more point{3 - drawPoints.length === 1 ? '' : 's'} on the map to enclose a complete boundary.
                    </p>
                  </div>
                ) : null}

                {/* Upload GeoJSON/KML */}
                <div className={`border-2 border-dashed transition-colors rounded-xl p-4 text-center cursor-pointer relative ${
                  isLight ? 'border-[#CBD5E1] hover:border-[#00873E] bg-[#F8FAFC]' : 'border-white/10 hover:border-emerald/40'
                }`}>
                  <input 
                    type="file" 
                    onChange={handleBoundaryUpload}
                    accept=".geojson,.json,.kml"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-emerald mb-2" size={24} />
                  <span className={`text-xs font-semibold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>Drag & Drop Boundary</span>
                  <span className={`text-[10px] block mt-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>GeoJSON / KML files supported</span>
                </div>
              </div>
            </div>

            {/* Layers toggle */}
            <div className={`border rounded-2xl p-5 transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <h3 className={`font-bold text-sm mb-4 uppercase tracking-wider flex items-center space-x-2 ${
                isLight ? 'text-[#0F291B]' : 'text-mist'
              }`}>
                <Layers size={16} className="text-emerald" />
                <span>GIS Layer Layers</span>
              </h3>
              
              <div className="space-y-2">
                {[
                  { id: 'ndvi', label: 'NDVI Vegetation Layer', color: 'bg-emerald' },
                  { id: 'evi', label: 'EVI Canopy Layer', color: 'bg-green-500' },
                  { id: 'ndwi', label: 'NDWI Canopy Water Layer', color: 'bg-blue-400' },
                  { id: 'forest_cover', label: 'Forest Cover Mask', color: 'bg-forest' },
                  { id: 'carbon_heatmap', label: 'AI Carbon Heatmap', color: 'bg-purple-500' }
                ].map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id)}
                    className={`w-full flex items-center justify-between text-xs p-3 rounded-xl border transition-all text-left cursor-pointer ${
                      activeLayer === layer.id
                        ? (isLight ? 'border-[#00873E] bg-[#E8F8EE] text-[#00873E] font-bold shadow-xs' : 'border-emerald/45 bg-emerald/10 text-white font-bold')
                        : (isLight ? 'border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#475569]' : 'border-white/10 hover:bg-white/5 text-mist')
                    }`}
                  >
                    <span>{layer.label}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${layer.color}`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Basemap Selection */}
            <div className={`border rounded-2xl p-5 transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center space-x-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>
                  <MapIcon size={16} className="text-emerald" />
                  <span>Basemap Style</span>
                </h3>
                <span className="text-[10px] text-emerald font-mono font-bold uppercase">
                  {basemap === 'terrain' ? 'Terrain (Active)' : basemap}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setBasemap('terrain')}
                  className={`text-xs py-2 rounded-xl font-bold transition-all border text-center cursor-pointer ${
                    basemap === 'terrain' 
                      ? 'bg-emerald text-carbon border-emerald shadow-sm' 
                      : (isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white')
                  }`}
                >
                  Terrain
                </button>
                <button 
                  onClick={() => setBasemap('satellite')}
                  className={`text-xs py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                    basemap === 'satellite' 
                      ? 'bg-emerald text-carbon border-emerald shadow-sm' 
                      : (isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white')
                  }`}
                >
                  Satellite
                </button>
                <button 
                  onClick={() => setBasemap('dark')}
                  className={`text-xs py-2 rounded-xl font-bold transition-all border cursor-pointer ${
                    basemap === 'dark' 
                      ? 'bg-emerald text-carbon border-emerald shadow-sm' 
                      : (isLight ? 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white')
                  }`}
                >
                  {isLight ? 'Carto Light' : 'Carto Dark'}
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Leaflet Map Container */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            
            {/* Map Frame */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 h-[500px] z-10">
              
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                className="w-full h-full"
                scrollWheelZoom={true}
              >
                {/* Instant Resize Handler to prevent grey / stuck tiles */}
                <MapResizeHandler />

                {/* Tile Layer Toggle */}
                {basemap === 'dark' || basemap === 'carto' ? (
                  <TileLayer
                    key={isLight ? 'carto-light' : 'carto-dark'}
                    url={isLight 
                      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    maxZoom={19}
                  />
                ) : basemap === 'satellite' ? (
                  <TileLayer
                    key="satellite"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; ESRI ArcGIS World Imagery'
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

                {/* Draw polygon coordinates visual styled dynamically by LAYER_CONFIG */}
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

                {/* Inspected Pixel Marker with Popup */}
                {inspectedPixel && !isNaN(parseFloat(inspectedPixel.lat)) && !isNaN(parseFloat(inspectedPixel.lng)) && (
                  <Marker position={[parseFloat(inspectedPixel.lat), parseFloat(inspectedPixel.lng)]}>
                    <Popup>
                      <div className="text-xs p-1 max-w-xs leading-tight">
                        <div className="font-bold text-[#00873E]">{inspectedPixel.forestType || "Inspected Pixel"}</div>
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

                {/* Display GEE/Simulated image overlay results */}
                {selectedJob && selectedJob.result && selectedJob.layers && selectedJob.layers.length > 0 && (
                  selectedJob.layers
                    .filter(l => l.layer_type === activeLayer)
                    .map((layer, idx) => (
                      <ImageOverlay
                        key={idx}
                        url={layer.layer_url}
                        bounds={getJobBounds(selectedJob)}
                        opacity={0.65}
                      />
                    ))
                )}

                {/* Recenter Map when boundaries loaded */}
                <RecenterMap bounds={mapBounds} center={mapCenter} zoom={mapZoom} />

                {/* Map event helper */}
                <MapEventHandler 
                  isDrawing={isDrawing} 
                  drawPoints={drawPoints} 
                  setDrawPoints={setDrawPoints} 
                  onPixelClick={handlePixelClick}
                  hoverCoords={hoverCoords}
                  setHoverCoords={setHoverCoords}
                />
              </MapContainer>

              {/* Lat/Lng Hover Indicator (Bottom Left) */}
              <div className="absolute bottom-4 left-4 bg-carbon/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] text-mist font-mono z-20">
                Lat: {hoverCoords.lat.toFixed(5)}, Lng: {hoverCoords.lng.toFixed(5)}
              </div>

              {/* Map Loading overlay */}
              {analyzing && (
                <div className="absolute inset-0 bg-carbon/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="font-bold font-sans text-lg text-white">Generating Median Sentinel-2 Composite...</h3>
                  <p className="text-xs text-mist max-w-sm text-center">Processing cloud masking filters and running Random Forest Carbon estimations on the AI Inference service.</p>
                </div>
              )}

              {/* Map Legend Overlay (Top Right) - Fully dynamic based on LAYER_CONFIG */}
              <div className="absolute top-4 right-4 bg-carbon/90 backdrop-blur-md border border-white/15 p-3.5 rounded-2xl max-w-[210px] z-20 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-mist truncate">
                    {LAYER_CONFIG[activeLayer]?.title || 'INDEX RANGE'}
                  </h4>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${LAYER_CONFIG[activeLayer]?.badgeClass || 'bg-emerald text-carbon'}`}>
                    {LAYER_CONFIG[activeLayer]?.id?.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-20 rounded shadow-inner"
                    style={{ background: LAYER_CONFIG[activeLayer]?.gradientCSS || 'linear-gradient(to top, #78350F, #F59E0B, #84CC16, #00C853)' }}
                  ></div>
                  <div className="flex flex-col justify-between h-20 text-[10px] text-mist font-mono">
                    {LAYER_CONFIG[activeLayer]?.ticks?.map((tick, i) => (
                      <span key={i} className={i === 0 ? 'text-white font-semibold' : ''}>{tick}</span>
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

            {/* Interactive Pixel Query Results (Appears on Map Click) */}
            <div className={`border rounded-3xl p-6 relative overflow-hidden transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <h3 className={`font-bold text-sm mb-4 uppercase tracking-wider flex items-center space-x-2 ${
                isLight ? 'text-[#0F291B]' : 'text-mist'
              }`}>
                <Eye size={18} className="text-emerald" />
                <span>Pixel Level Inspector & Location Resolver</span>
              </h3>

              {inspectedPixel ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-[#E8F8EE] border-[#C2E9CF]' : 'bg-emerald/10 border-emerald/20'
                  }`}>
                    <div className="flex items-center space-x-2 text-emerald mb-1 font-bold text-xs uppercase tracking-wider">
                      <MapPin size={16} />
                      <span>Resolved Location Name</span>
                    </div>
                    <p className={`text-sm font-bold leading-relaxed ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>{inspectedPixel.name}</p>
                    <p className={`text-[11px] mt-1 font-mono ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>{inspectedPixel.region} • <span className="text-emerald font-bold">{inspectedPixel.forestType}</span></p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className={`p-4 rounded-xl border ${isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'}`}>
                      <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Target Coordinates</span>
                      <span className={`text-xs font-mono font-bold mt-1 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {inspectedPixel.lat}, {inspectedPixel.lng}
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl border ${isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'}`}>
                      <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>NDVI Value</span>
                      <span className="text-sm font-bold text-emerald mt-1 block">
                        {inspectedPixel.ndvi}
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl border ${isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'}`}>
                      <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Estimated Biomass</span>
                      <span className={`text-sm font-bold mt-1 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {inspectedPixel.biomass} Mg/ha
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl border ${isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'}`}>
                      <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Estimated Carbon</span>
                      <span className={`text-sm font-bold mt-1 block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {inspectedPixel.carbon} tC/ha
                      </span>
                    </div>
                    <div className={`p-4 rounded-xl border ${isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'}`}>
                      <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Model Confidence</span>
                      <span className="text-sm font-bold text-emerald mt-1 block">
                        {inspectedPixel.confidence}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-6 border border-dashed rounded-2xl text-xs ${
                  isLight ? 'border-[#CBD5E1] text-[#64748B]' : 'border-white/5 text-mist'
                }`}>
                  Click anywhere on the map to query specific coordinate metrics and reverse-geocode location name in Bangladesh.
                </div>
              )}
            </div>

            {/* Stored Bangladesh Coordinates Registry */}
            <div className={`border rounded-3xl p-6 transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Database size={18} className="text-emerald" />
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-mist'}`}>Stored Coordinates Registry</h3>
                </div>
                {storedLocations.length > 0 && (
                  <button 
                    onClick={() => {
                      setStoredLocations([]);
                      localStorage.removeItem('carbonzero_stored_locations');
                    }}
                    className="text-[10px] px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-full font-bold transition-all cursor-pointer"
                  >
                    Clear Registry
                  </button>
                )}
              </div>

              {storedLocations.length > 0 ? (
                <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase font-bold ${
                        isLight ? 'border-[#E2E8F0] text-[#64748B]' : 'border-white/10 text-mist'
                      }`}>
                        <th className="pb-2">Coordinates</th>
                        <th className="pb-2">Location Name</th>
                        <th className="pb-2">Carbon Density</th>
                        <th className="pb-2 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y text-xs ${
                      isLight ? 'divide-[#E2E8F0] text-[#0F291B]' : 'divide-white/5 text-registry'
                    }`}>
                      {storedLocations.map((loc, idx) => (
                        <tr key={idx} className={`${isLight ? 'hover:bg-[#F8FAFC]' : 'hover:bg-white/5'} transition-colors`}>
                          <td className="py-2.5 font-mono text-[11px] text-emerald font-bold">{loc.lat}, {loc.lng}</td>
                          <td className="py-2.5 max-w-[280px] truncate font-medium" title={loc.name}>{loc.name}</td>
                          <td className="py-2.5">
                            <span className="bg-emerald/10 text-emerald text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {loc.carbon} tC/ha
                            </span>
                          </td>
                          <td className={`py-2.5 text-right font-mono text-[10px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>{loc.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-6 border border-dashed rounded-2xl text-xs ${
                  isLight ? 'border-[#CBD5E1] text-[#64748B]' : 'border-white/5 text-mist'
                }`}>
                  No coordinates stored yet. Click anywhere on the map to add locations to this registry.
                </div>
              )}
            </div>

            {/* Time slider timeline */}
            <div className={`border rounded-3xl p-6 transition-all ${
              isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
            }`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <div>
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-mist'}`}>Historical Imagery Timeline</h3>
                  <p className={`text-[11px] mt-0.5 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>Toggle satellite analysis runs across date epochs</p>
                </div>
                <span className="text-xs font-mono bg-emerald/10 text-emerald px-3 py-1 rounded-full mt-2 md:mt-0 font-bold">
                  {selectedJob ? selectedJob.start_date : 'No analysis selected'}
                </span>
              </div>
              <input 
                type="range" 
                min={0}
                max={Math.max(0, analysisHistory.length - 1)}
                value={analysisHistory.findIndex(h => h.id === selectedJob?.id) !== -1 ? analysisHistory.findIndex(h => h.id === selectedJob?.id) : 0}
                onChange={(e) => {
                  const job = analysisHistory[parseInt(e.target.value)];
                  if (job) {
                    setSelectedJob(job);
                    setMapBounds(getJobBounds(job));
                  }
                }}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald ${
                  isLight ? 'bg-[#CBD5E1]' : 'bg-white/10'
                }`}
                disabled={analysisHistory.length <= 1}
              />
              <div className={`flex justify-between text-[10px] mt-2 font-mono ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                <span>{analysisHistory[analysisHistory.length-1]?.start_date || 'Past'}</span>
                <span>{analysisHistory[0]?.start_date || 'Present'}</span>
              </div>
            </div>

          </div>
        </div>
  );
}

export default GisMapPanel;
