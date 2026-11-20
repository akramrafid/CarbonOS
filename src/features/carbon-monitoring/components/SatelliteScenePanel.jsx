import React from 'react';
import {
  Sliders,
  Sparkles,
  RefreshCw,
  CloudRain,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Navigation,
  Trees,
  Mountain,
  PenTool,
  Zap,
  Cpu
} from 'lucide-react';
import {
  FASTAPI_API_URL,
  LAYER_CONFIG,
  SUNDARBANS_RESERVE,
  CHT_RESERVE,
  calculateGeodesicMetrics
} from '../constants';
import { Button } from '../../../components/ui/Button';
import { GradCamComparisonCard } from './GradCamComparisonCard';

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
    selectedJob,
    activeLayer = 'ndvi',
    setActiveLayer = () => {},
    drawPoints = [],
    setDrawPoints = () => {}
  } = props;

  const [projectName, setProjectName] = React.useState(
    props.projectName || "Sundarbans Mangrove Reserve (Block A)"
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 border rounded-3xl p-6 transition-all space-y-6 ${
            isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
          }`}>
            <h2 className={`text-2xl font-bold font-sans flex items-center space-x-2 ${
              isLight ? 'text-fg-primary' : 'text-white'
            }`}>
              <Sliders className="text-emerald" size={24} />
              <span>Configure AI Estimation Job</span>
            </h2>
            <p className={`text-xs ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Submit boundary polygons to run cloud-masked composite calculations. The engine processes Sentinel-2 optical bands and runs a Random Forest regression model to predict organic carbon stock.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-fg-primary' : 'text-mist'
                }`}>Project/Block Name</label>
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-bg-canvas border-border-subtle text-fg-primary' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-fg-primary' : 'text-mist'
                }`}>Analysis Type Layer</label>
                <select 
                  value={activeLayer}
                  onChange={(e) => setActiveLayer(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors cursor-pointer ${
                    isLight ? 'bg-bg-canvas border-border-subtle text-fg-primary' : 'bg-white/5 border-white/10 text-white'
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
                  isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
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
                  <div className={`flex justify-between text-[10px] font-mono ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                    {LAYER_CONFIG[activeLayer]?.ticks?.map((t, i) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                  <p className={`text-[11px] leading-relaxed pt-1 border-t ${
                    isLight ? 'border-border-subtle text-fg-secondary' : 'border-white/5 text-mist'
                  }`}>
                    {LAYER_CONFIG[activeLayer]?.description}
                  </p>
                </div>
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-fg-primary' : 'text-mist'
                }`}>Start Date (S2 Filter)</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-bg-canvas border-border-subtle text-fg-primary' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-fg-primary' : 'text-mist'
                }`}>End Date (S2 Filter)</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-bg-canvas border-border-subtle text-fg-primary' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-fg-primary' : 'text-mist'
                }`}>Cloud Ceiling Filter (%)</label>
                <input 
                  type="number" 
                  value={cloudCeiling}
                  onChange={(e) => setCloudCeiling(parseInt(e.target.value) || 20)}
                  min="0"
                  max="100"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald/50 transition-colors ${
                    isLight ? 'bg-bg-canvas border-border-subtle text-fg-primary' : 'bg-white/5 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
                  isLight ? 'text-fg-primary' : 'text-mist'
                }`}>Satellite Source Sensor</label>
                <input 
                  type="text" 
                  value="Sentinel-2 MSI (10m Resolution)" 
                  disabled
                  className={`w-full border rounded-xl px-4 py-3 text-sm cursor-not-allowed ${
                    isLight ? 'bg-bg-muted border-border-subtle text-fg-secondary' : 'bg-white/5 border-white/10 text-mist'
                  }`}
                />
              </div>
            </div>

            {/* Target Boundary Status & Quick Switcher */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                  isLight ? 'text-fg-primary' : 'text-white'
                }`}>
                  <Navigation size={14} className="text-emerald" />
                  <span>Target Area Boundary</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald">
                  {drawPoints.length >= 3 ? `${calculateGeodesicMetrics(drawPoints).areaHa} ha active` : 'No boundary enclosed'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDrawPoints(SUNDARBANS_RESERVE);
                    setProjectName("Sundarbans Mangrove Reserve (Block A)");
                  }}
                  className={`text-xs text-left truncate justify-start ${
                    drawPoints === SUNDARBANS_RESERVE || (drawPoints.length === SUNDARBANS_RESERVE.length && drawPoints[0][0] === SUNDARBANS_RESERVE[0][0])
                      ? (isLight ? '!bg-accent-muted !border-border-strong !text-accent font-bold' : '!bg-emerald/15 !border-emerald !text-emerald font-bold')
                      : ''
                  }`}
                  leftIcon={<Trees size={13} className={drawPoints === SUNDARBANS_RESERVE || (drawPoints.length === SUNDARBANS_RESERVE.length && drawPoints[0][0] === SUNDARBANS_RESERVE[0][0]) ? (isLight ? 'text-accent' : 'text-emerald') : 'text-mist'} />}
                >
                  <span>Sundarbans (3,800 ha)</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setDrawPoints(CHT_RESERVE);
                    setProjectName("Chittagong Hill Tracts Rain Forest");
                  }}
                  className={`text-xs text-left truncate justify-start ${
                    drawPoints === CHT_RESERVE || (drawPoints.length === CHT_RESERVE.length && drawPoints[0][0] === CHT_RESERVE[0][0])
                      ? (isLight ? '!bg-accent-muted !border-border-strong !text-accent font-bold' : '!bg-emerald/15 !border-emerald !text-emerald font-bold')
                      : ''
                  }`}
                  leftIcon={<Mountain size={13} className={drawPoints === CHT_RESERVE || (drawPoints.length === CHT_RESERVE.length && drawPoints[0][0] === CHT_RESERVE[0][0]) ? (isLight ? 'text-accent' : 'text-emerald') : 'text-mist'} />}
                >
                  <span>CHT Reserve (5,420 ha)</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setActiveTab('map')}
                  className="text-xs text-center justify-center"
                  leftIcon={<PenTool size={13} className={isLight ? 'text-accent' : 'text-emerald'} />}
                >
                  <span>Draw / Edit on Map</span>
                </Button>
              </div>
            </div>

            <div className={`pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              isLight ? 'border-border-subtle' : 'border-white/5'
            }`}>
              <div className="space-y-1">
                <span className={`text-xs block ${isLight ? 'text-fg-primary font-semibold' : 'text-white font-medium'}`}>
                  Instant AI Estimation Engine
                </span>
                <span className={`text-[11px] flex items-center gap-1.5 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                  <Zap size={12} className={isLight ? 'text-accent' : 'text-emerald'} />
                  <span>Sub-120ms deterministic inference calibrated to IPCC Tier-3 and GEDI LiDAR.</span>
                </span>
              </div>
              <Button 
                variant="primary"
                size="lg"
                onClick={handleRunAnalysis}
                loading={analyzing}
                leftIcon={analyzing ? <RefreshCw size={18} className="animate-spin" /> : <Cpu size={18} />}
                className="font-extrabold shrink-0"
              >
                <span>{analyzing ? 'Processing AI Model...' : 'Trigger AI Estimation'}</span>
              </Button>
            </div>

          </div>

          <div className={`border rounded-3xl p-6 transition-all space-y-6 ${
            isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
          }`}>
            <h3 className={`font-bold text-lg border-b pb-3 ${
              isLight ? 'text-fg-primary border-border-subtle' : 'text-white border-white/5'
            }`}>AI Pipeline Specification</h3>
            
            <div className="space-y-4 text-xs">
              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'
              }`}>
                <h4 className="font-bold uppercase text-[10px] tracking-wider text-emerald">Model Architecture</h4>
                <p className={isLight ? 'text-fg-primary' : 'text-mist'}>Random Forest Regressor (Multi-output: Biomass & Carbon)</p>
                <p className={`text-[10px] mt-2 font-mono ${isLight ? 'text-fg-secondary' : 'text-white/50'}`}>Depth: 12, Trees: 100, Features: 13 bands</p>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'
              }`}>
                <h4 className="font-bold uppercase text-[10px] tracking-wider text-emerald">Input Feature Vectors</h4>
                <ul className={`list-disc pl-4 space-y-1 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                  <li>Sentinel-2 Optical (B2, B3, B4, B8)</li>
                  <li>Sentinel-2 RedEdge (B5, B6)</li>
                  <li>Sentinel-2 SWIR (B11, B12)</li>
                  <li>Indices (NDVI, EVI, NDWI)</li>
                  <li>Sentinel-1 Radar (VV, VH)</li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'
              }`}>
                <h4 className="font-bold uppercase text-[10px] tracking-wider text-emerald">Model Extensibility</h4>
                <p className={isLight ? 'text-fg-secondary' : 'text-mist'}>Designed using abstract estimation pipelines. Integrations under development: XGBoost, LightGBM, and Deep Learning U-Net architectures for spatial predictions.</p>
              </div>

              {/* Phase 7: Self-Drawing Boundary Polygon, Layer Crossfade & Grad-CAM Opacity Slider */}
              <GradCamComparisonCard
                activeLayer={activeLayer}
                drawPoints={drawPoints}
                isLight={isLight}
              />
            </div>
          </div>
        </div>
  );
}

export default SatelliteScenePanel;
