import React from 'react';
import {
  MapPin,
  Search,
  Layers,
  Map as MapIcon
} from 'lucide-react';
import BoundarySelectionBox from './BoundarySelectionBox';
import { Button, IconButton } from '../../../../components/ui/Button';
import { Tabs } from '../../../../components/ui/Tabs';

export function GisSidebarControls(props) {
  const {
    isLight,
    searchQuery,
    setSearchQuery,
    handleCoordsSearch,
    drawPoints,
    setDrawPoints,
    isDrawing,
    setIsDrawing,
    setMapCenter,
    setMapZoom,
    setMapBounds,
    handleRunAnalysis,
    analyzing,
    handleBoundaryUpload,
    activeLayer,
    setActiveLayer,
    basemap,
    setBasemap
  } = props;

  return (
    <div className="lg:col-span-1 flex flex-col space-y-6">
      {/* Coordinate Search box */}
      <div
        className={`border rounded-2xl p-5 transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}
      >
        <h3
          className={`font-bold text-sm mb-3 uppercase tracking-wider flex items-center space-x-2 ${
            isLight ? 'text-fg-primary' : 'text-mist'
          }`}
        >
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
              isLight
                ? 'bg-bg-canvas border-border-subtle text-fg-primary placeholder-[#94A3B8]'
                : 'bg-white/5 border-white/10 text-white placeholder-mist/60'
            }`}
          />
          <IconButton
            icon={<Search size={16} />}
            aria-label="Search coordinates"
            title="Search coordinates"
            onClick={handleCoordsSearch}
            variant="secondary"
          />
        </div>
      </div>

      {/* Polygon Draw & Boundary Box */}
      <BoundarySelectionBox
        isLight={isLight}
        drawPoints={drawPoints}
        setDrawPoints={setDrawPoints}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        setMapCenter={setMapCenter}
        setMapZoom={setMapZoom}
        setMapBounds={setMapBounds}
        handleRunAnalysis={handleRunAnalysis}
        analyzing={analyzing}
        handleBoundaryUpload={handleBoundaryUpload}
      />

      {/* Layers toggle */}
      <div
        className={`border rounded-2xl p-5 transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}
      >
        <h3
          className={`font-bold text-sm mb-4 uppercase tracking-wider flex items-center space-x-2 ${
            isLight ? 'text-fg-primary' : 'text-mist'
          }`}
        >
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
            <Button
              key={layer.id}
              variant="secondary"
              size="sm"
              onClick={() => setActiveLayer(layer.id)}
              className={`w-full !flex !items-center !justify-between text-xs !p-3 ${
                activeLayer === layer.id
                  ? isLight
                    ? '!border-border-strong !bg-accent-muted !text-accent font-bold shadow-xs'
                    : '!border-emerald/45 !bg-emerald/10 !text-white font-bold'
                  : ''
              }`}
            >
              <span className="flex-1 text-left">{layer.label}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${layer.color}`}></span>
            </Button>
          ))}
        </div>
      </div>

      {/* Basemap Selection */}
      <div
        className={`border rounded-2xl p-5 transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className={`font-bold text-sm uppercase tracking-wider flex items-center space-x-2 ${
              isLight ? 'text-fg-primary' : 'text-mist'
            }`}
          >
            <MapIcon size={16} className="text-emerald" />
            <span>Basemap Style</span>
          </h3>
          <span className="text-[10px] text-emerald font-mono font-bold uppercase">
            {basemap === 'terrain' ? 'Terrain (Active)' : basemap}
          </span>
        </div>
        <Tabs
          tabs={[
            { id: 'terrain', label: 'Terrain' },
            { id: 'satellite', label: 'Satellite' },
            { id: 'dark', label: isLight ? 'Carto Light' : 'Carto Dark' }
          ]}
          activeTab={basemap}
          onChange={setBasemap}
          className="w-full justify-center"
        />
      </div>
    </div>
  );
}

export default GisSidebarControls;
