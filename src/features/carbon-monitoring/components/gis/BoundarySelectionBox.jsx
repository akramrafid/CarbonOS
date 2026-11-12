import React from 'react';
import { Navigation, CheckCircle, Sparkles, Upload } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import {
  SUNDARBANS_RESERVE,
  CHT_RESERVE,
  calculateGeodesicMetrics,
  getBangladeshEcoZone
} from '../../constants';

export function BoundarySelectionBox({
  isLight,
  drawPoints,
  setDrawPoints,
  isDrawing,
  setIsDrawing,
  setMapCenter,
  setMapZoom,
  setMapBounds,
  handleRunAnalysis,
  analyzing,
  handleBoundaryUpload
}) {
  return (
    <div
      className={`border rounded-2xl p-5 transition-all ${
        isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
      }`}
    >
      <h3
        className={`font-bold text-sm mb-3 uppercase tracking-wider flex items-center space-x-2 ${
          isLight ? 'text-[#0F291B]' : 'text-mist'
        }`}
      >
        <Navigation size={16} className="text-emerald" />
        <span>Boundary Selection</span>
      </h3>

      <div className="space-y-4">
        {/* Preset boundaries */}
        <div>
          <label
            className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
              isLight ? 'text-[#64748B]' : 'text-mist'
            }`}
          >
            Quick Boundary Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDrawPoints(SUNDARBANS_RESERVE);
                setIsDrawing(false);
                setMapCenter([22.15, 89.45]);
                setMapZoom(9);
                setMapBounds([[21.65, 89.02], [22.50, 89.85]]);
              }}
              className={`text-[11px] font-semibold text-left truncate justify-start ${
                drawPoints === SUNDARBANS_RESERVE ||
                (drawPoints.length === SUNDARBANS_RESERVE.length && drawPoints[0][0] === SUNDARBANS_RESERVE[0][0])
                  ? isLight
                    ? '!bg-[#E8F8EE] !border-[#00873E] !text-[#00873E] font-bold'
                    : '!bg-emerald/15 !border-emerald !text-emerald font-bold'
                  : ''
              }`}
            >
              Sundarbans (3,800 ha)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDrawPoints(CHT_RESERVE);
                setIsDrawing(false);
                setMapCenter([22.75, 92.25]);
                setMapZoom(9);
                setMapBounds([[21.85, 92.15], [23.70, 92.65]]);
              }}
              className={`text-[11px] font-semibold text-left truncate justify-start ${
                drawPoints === CHT_RESERVE ||
                (drawPoints.length === CHT_RESERVE.length && drawPoints[0][0] === CHT_RESERVE[0][0])
                  ? isLight
                    ? '!bg-[#E8F8EE] !border-[#00873E] !text-[#00873E] font-bold'
                    : '!bg-emerald/15 !border-emerald !text-emerald font-bold'
                  : ''
              }`}
            >
              Chittagong HT (5,420 ha)
            </Button>
          </div>
        </div>

        <div
          className={`flex items-center justify-between p-3 rounded-xl border ${
            isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
          }`}
        >
          <div>
            <span className={`text-xs font-medium block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
              Custom Draw Polygon
            </span>
            <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
              {isDrawing ? 'Click points on map' : 'Click to plot custom bounds'}
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsDrawing(!isDrawing);
              if (!isDrawing) setDrawPoints([]);
            }}
            className={isDrawing ? '!bg-amber !text-carbon font-bold' : 'font-bold'}
          >
            {isDrawing ? 'Drawing... (Click map)' : 'Start Drawing'}
          </Button>
        </div>

        {drawPoints.length >= 3 ? (() => {
          const currentMetrics = calculateGeodesicMetrics(drawPoints);
          const currentZone = getBangladeshEcoZone(currentMetrics.centroid[0], currentMetrics.centroid[1]);
          return (
            <div
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-[#E8F8EE]/60 border-[#C2E9CF]' : 'bg-emerald/10 border-emerald/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                    isLight ? 'text-[#00873E]' : 'text-emerald'
                  }`}
                >
                  <CheckCircle size={13} />
                  <span>Enclosed Boundary</span>
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isLight
                      ? 'bg-white text-[#475569] border border-[#C2E9CF]'
                      : 'bg-carbon/60 text-mist border border-white/10'
                  }`}
                >
                  {drawPoints.length} vertices
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald/15 text-xs">
                <div>
                  <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                    Geodesic Area
                  </span>
                  <span
                    className={`font-extrabold font-mono text-sm block ${
                      isLight ? 'text-[#0F291B]' : 'text-white'
                    }`}
                  >
                    {currentMetrics.areaHa} <span className="text-[10px] font-normal">ha</span>
                  </span>
                  <span className={`block text-[10px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                    ({currentMetrics.areaAcres} acres)
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] block ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                    Perimeter
                  </span>
                  <span
                    className={`font-extrabold font-mono text-sm block ${
                      isLight ? 'text-[#0F291B]' : 'text-white'
                    }`}
                  >
                    {currentMetrics.perimeterKm} <span className="text-[10px] font-normal">km</span>
                  </span>
                  <span
                    className={`block text-[10px] truncate ${isLight ? 'text-[#00873E]' : 'text-emerald'}`}
                    title={currentZone.zone}
                  >
                    {currentZone.zone.split(' ')[0]} {currentZone.zone.split(' ')[1] || ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald/15 flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRunAnalysis}
                  loading={analyzing}
                  leftIcon={<Sparkles size={14} className={analyzing ? 'animate-spin' : ''} />}
                  className="flex-1 font-bold text-xs"
                >
                  <span>{analyzing ? 'Analyzing Radar...' : 'Run AI Satellite Analysis'}</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDrawPoints([])}
                  title="Clear Boundary"
                  className="text-xs"
                >
                  Clear
                </Button>
              </div>
            </div>
          );
        })() : drawPoints.length > 0 ? (
          <div
            className={`p-3 rounded-xl border text-xs ${
              isLight ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : 'bg-amber/10 border-amber/20 text-amber'
            }`}
          >
            <div className="flex items-center justify-between font-semibold">
              <span>Vertices Plotted: {drawPoints.length}</span>
              <Button
                variant="link"
                size="sm"
                onClick={() => setDrawPoints([])}
                className="!text-red-500 underline hover:!text-red-400 text-[11px]"
              >
                Reset
              </Button>
            </div>
            <p className="text-[11px] mt-1 opacity-90">
              Click {3 - drawPoints.length} more point{3 - drawPoints.length === 1 ? '' : 's'} on the map to enclose a complete boundary.
            </p>
          </div>
        ) : null}

        {/* Upload GeoJSON/KML */}
        <div
          className={`border-2 border-dashed transition-colors rounded-xl p-4 text-center cursor-pointer relative ${
            isLight ? 'border-[#CBD5E1] hover:border-[#00873E] bg-[#F8FAFC]' : 'border-white/10 hover:border-emerald/40'
          }`}
        >
          <input
            type="file"
            onChange={handleBoundaryUpload}
            accept=".geojson,.json,.kml"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="mx-auto text-emerald mb-2" size={24} />
          <span className={`text-xs font-semibold block ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            Drag & Drop Boundary
          </span>
          <span className={`text-[10px] block mt-1 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
            GeoJSON / KML files supported
          </span>
        </div>
      </div>
    </div>
  );
}

export default BoundarySelectionBox;
