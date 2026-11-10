import React from 'react';
import {
  Sliders,
  Sparkles,
  RefreshCw,
  CloudRain,
  MapPin,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { FASTAPI_API_URL } from '../constants';

export function SatelliteScenePanel(props) {
  const {
    isLight,
    isBn,
    t,
    cloudCeiling,
    setCloudCeiling,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    analyzing,
    handleRunAnalysis,
    setActiveTab,
    selectedJob
  } = props;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 border rounded-3xl p-6 transition-all space-y-6 ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
          }`}>
            <h2 className={`text-2xl font-bold font-sans flex items-center space-x-2 ${
              isLight ? 'text-[#0F291B]' : 'text-white'
            }`}>
              <Sliders className="text-emerald" size={24} />
              <span>Configure AI Estimation Job</span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
              Submit boundary polygons to run cloud-masked composite calculations. The engine processes Sentinel-2 optical bands and runs a Random Forest regression model to predict organic carbon stock.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>Project/Block Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>Analysis Type Layer</label>
                <select 
                  value={activeLayer}
                  onChange={(e) => setActiveLayer(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors cursor-pointer ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <option value="ndvi">NDVI (Normalized Difference Veg Index)</option>
                  <option value="evi">EVI (Enhanced Vegetation Index)</option>
                  <option value="ndwi">NDWI (Normalized Difference Water Index)</option>
                  <option value="forest_cover">Forest Canopy Cover Mask</option>
                  <option value="carbon_heatmap">AI Carbon Heatmap Grid</option>
                </select>

                {/* Dynamic visual preview of active analysis type */}
                <div className={`mt-3 p-3.5 rounded-xl border space-y-2 ${
                  isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                      {LAYER_CONFIG[activeLayer]?.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${LAYER_CONFIG[activeLayer]?.badgeClass || 'bg-emerald text-carbon'}`}>
                      {LAYER_CONFIG[activeLayer]?.metricUnit}
                    </span>
                  </div>
                  <div 
                    className="w-full h-2.5 rounded-full shadow-inner"
                    style={{ background: LAYER_CONFIG[activeLayer]?.gradientCSS }}
                  ></div>
                  <div className={`flex justify-between text-[10px] font-mono ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                    {LAYER_CONFIG[activeLayer]?.ticks?.map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                  <p className={`text-[11px] leading-relaxed pt-1 border-t ${
                    isLight ? 'border-[#E2E8F0] text-[#64748B]' : 'border-white/5 text-mist'
                  }`}>
                    {LAYER_CONFIG[activeLayer]?.description}
                  </p>
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>Start Date (S2 Filter)</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>End Date (S2 Filter)</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>Cloud Ceiling Filter (%)</label>
                <input 
                  type="number" 
                  value={cloudCeiling}
                  onChange={(e) => setCloudCeiling(parseInt(e.target.value) || 20)}
                  min="0"
                  max="100"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F291B]' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-[#0F291B]' : 'text-mist'
                }`}>Satellite Source Sensor</label>
                <input 
                  type="text" 
                  value="Sentinel-2 MSI (10m Resolution)" 
                  disabled
                  className={`w-full border rounded-xl px-4 py-3 text-sm cursor-not-allowed ${
                    isLight ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]' : 'bg-white/5 border-white/10 text-mist'
                  }`}
                />
              </div>
            </div>

            {/* Target Boundary Status & Quick Switcher */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  <Navigation size={14} className="text-emerald" />
                  <span>Target Area Boundary</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald">
                  {drawPoints.length >= 3 ? `${calculateGeodesicMetrics(drawPoints).areaHa} ha active` : 'No boundary enclosed'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDrawPoints(SUNDARBANS_RESERVE);
                    setProjectName("Sundarbans Mangrove Reserve (Block A)");
                  }}
                  className={`text-xs py-2 px-3 rounded-xl border text-left truncate transition-all cursor-pointer ${
                    drawPoints === SUNDARBANS_RESERVE || (drawPoints.length === SUNDARBANS_RESERVE.length && drawPoints[0][0] === SUNDARBANS_RESERVE[0][0])
                      ? (isLight ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E] font-bold' : 'bg-emerald/15 border-emerald text-emerald font-bold')
                      : (isLight ? 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-mist')
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Trees size={13} className={drawPoints === SUNDARBANS_RESERVE || (drawPoints.length === SUNDARBANS_RESERVE.length && drawPoints[0][0] === SUNDARBANS_RESERVE[0][0]) ? (isLight ? 'text-[#00873E]' : 'text-emerald') : 'text-mist'} />
                    <span>Sundarbans (3,800 ha)</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDrawPoints(CHT_RESERVE);
                    setProjectName("Chittagong Hill Tracts Rain Forest");
                  }}
                  className={`text-xs py-2 px-3 rounded-xl border text-left truncate transition-all cursor-pointer ${
                    drawPoints === CHT_RESERVE || (drawPoints.length === CHT_RESERVE.length && drawPoints[0][0] === CHT_RESERVE[0][0])
                      ? (isLight ? 'bg-[#E8F8EE] border-[#00873E] text-[#00873E] font-bold' : 'bg-emerald/15 border-emerald text-emerald font-bold')
                      : (isLight ? 'bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-mist')
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Mountain size={13} className={drawPoints === CHT_RESERVE || (drawPoints.length === CHT_RESERVE.length && drawPoints[0][0] === CHT_RESERVE[0][0]) ? (isLight ? 'text-[#00873E]' : 'text-emerald') : 'text-mist'} />
                    <span>CHT Reserve (5,420 ha)</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className={`text-xs py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isLight ? 'bg-white border-[#E2E8F0] text-[#00873E] hover:bg-[#E2E8F0]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-emerald'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <PenTool size={13} className={isLight ? 'text-[#00873E]' : 'text-emerald'} />
                    <span>Draw / Edit on Map</span>
                  </span>
                </button>
              </div>
            </div>

            <div className={`pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isLight ? 'border-[#E2E8F0]' : 'border-white/5'
            }`}>
              <div className="space-y-1">
                <span className={`text-xs block ${isLight ? 'text-[#0F291B] font-semibold' : 'text-white font-medium'}`}>
                  Instant AI Estimation Engine
                </span>
                <span className={`text-[11px] flex items-center gap-1.5 ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
                  <Zap size={12} className={isLight ? 'text-[#00873E]' : 'text-emerald'} />
                  <span>Sub-120ms deterministic inference calibrated to IPCC Tier-3 and GEDI LiDAR.</span>
                </span>
              </div>
              <button 
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="bg-emerald hover:bg-emerald/90 text-carbon font-extrabold px-6 py-3 rounded-xl shadow-md transition-all flex items-center space-x-2 cursor-pointer shrink-0"
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    <span>Processing AI Model...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={18} />
                    <span>Trigger AI Estimation</span>
                  </>
                )}
              </button>
            </div>

          </div>

          <div className={`border rounded-3xl p-6 transition-all space-y-6 ${
            isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
          }`}>
            <h3 className={`font-bold text-lg border-b pb-3 ${
              isLight ? 'text-[#0F291B] border-[#E2E8F0]' : 'text-white border-white/5'
            }`}>AI Pipeline Specification</h3>
            
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
              }`}>
                <h4 className="font-bold uppercase text-[10px] tracking-wider text-emerald">Model Architecture</h4>
                <p className={isLight ? 'text-[#0F291B]' : 'text-mist'}>Random Forest Regressor (Multi-output: Biomass & Carbon)</p>
                <p className={`text-[10px] mt-2 font-mono ${isLight ? 'text-[#64748B]' : 'text-white/50'}`}>Depth: 12, Trees: 100, Features: 13 bands</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
              }`}>
                <h4 className="font-bold uppercase text-[10px] tracking-wider text-emerald">Input Feature Vectors</h4>
                <ul className={`list-disc pl-4 space-y-1 ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
                  <li>Sentinel-2 Optical (B2, B3, B4, B8)</li>
                  <li>Sentinel-2 RedEdge (B5, B6)</li>
                  <li>Sentinel-2 SWIR (B11, B12)</li>
                  <li>Indices (NDVI, EVI, NDWI)</li>
                  <li>Sentinel-1 Radar (VV, VH)</li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-white/5 border-white/5'
              }`}>
                <h4 className="font-bold uppercase text-[10px] tracking-wider text-emerald">Model Extensibility</h4>
                <p className={isLight ? 'text-[#475569]' : 'text-mist'}>Designed using abstract estimation pipelines. Integrations under development: XGBoost, LightGBM, and Deep Learning U-Net architectures for spatial predictions.</p>
              </div>
            </div>
          </div>
        </div>
  );
}

export default SatelliteScenePanel;
