import React from 'react';
import GisSidebarControls from './gis/GisSidebarControls';
import GisLeafletViewer from './gis/GisLeafletViewer';
import GisInspectorDrawer from './gis/GisInspectorDrawer';

export function GisMapPanel(props) {
  const {
    isLight,
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
    hoverCoords,
    setHoverCoords,
    inspectedPixel,
    analyzing,
    handleRunAnalysis,
    handleBoundaryUpload,
    handleCoordsSearch,
    handlePixelClick,
    selectedJob,
    setSelectedJob,
    analysisHistory,
    getJobBounds
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Map Viewer Controls Sidebar */}
      <GisSidebarControls
        isLight={isLight}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleCoordsSearch={handleCoordsSearch}
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
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        basemap={basemap}
        setBasemap={setBasemap}
      />

      {/* Interactive Leaflet Map & Inspection Content */}
      <div className="lg:col-span-3 flex flex-col space-y-4">
        <GisLeafletViewer
          isLight={isLight}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          mapBounds={mapBounds}
          basemap={basemap}
          activeLayer={activeLayer}
          drawPoints={drawPoints}
          setDrawPoints={setDrawPoints}
          isDrawing={isDrawing}
          inspectedPixel={inspectedPixel}
          selectedJob={selectedJob}
          getJobBounds={getJobBounds}
          handlePixelClick={handlePixelClick}
          hoverCoords={hoverCoords}
          setHoverCoords={setHoverCoords}
          analyzing={analyzing}
        />

        <GisInspectorDrawer
          isLight={isLight}
          inspectedPixel={inspectedPixel}
          storedLocations={storedLocations}
          setStoredLocations={setStoredLocations}
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          analysisHistory={analysisHistory}
          setMapBounds={setMapBounds}
          getJobBounds={getJobBounds}
        />
      </div>
    </div>
  );
}

export default GisMapPanel;
