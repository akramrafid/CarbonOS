import React from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';

export function SettingsPanel(props) {
  const {
    isLight,
    isBn,
    t,
    modelSettings = {},
    setModelSettings,
    modelPerformance = {},
    handleSelectModel,
    updatingModel = false
  } = props;

  return (
    <div className={`border rounded-3xl p-6 transition-all space-y-6 ${isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
      }`}>
      <h2 className={`text-2xl font-bold font-sans mb-6 flex items-center space-x-2 ${isLight ? 'text-fg-primary' : 'text-white'
        }`}>
        <SettingsIcon className="text-emerald" size={24} />
        <span>Digital MRV Architecture Settings</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Left Column: AI Biomass & Sensor Fusion Architecture */}
        <div className={`border rounded-2xl p-5 space-y-5 ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'
          }`}>
          <div className="flex items-start justify-between border-b pb-3">
            <div>
              <h3 className={`font-bold text-sm flex items-center space-x-2 ${isLight ? 'text-fg-primary' : 'text-white'
                }`}>
                <Cpu size={16} className="text-emerald" />
                <span>AI Biomass & Carbon Estimation Architecture</span>
              </h3>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                Multi-Modal Sensor Fusion with Ground-Truth Gate
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${modelSettings?.active_model === 'fusion'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                : 'bg-emerald/10 text-emerald border border-emerald/20'
              }`}>
              Engine: {(modelSettings?.active_model || 'fusion').toUpperCase()}
            </span>
          </div>

          {/* Models selection cards */}
          <div className="space-y-3">
            <label className={`font-bold block text-[11px] uppercase tracking-wider ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Select Active Model Pipeline
            </label>

            {/* 1. Random Forest */}
            <div
              onClick={() => handleSelectModel('random_forest')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${modelSettings.active_model === 'random_forest'
                  ? (isLight ? 'bg-emerald/5 border-emerald ring-1 ring-emerald' : 'bg-emerald/10 border-emerald/50 ring-1 ring-emerald/40')
                  : (isLight ? 'bg-white border-border-subtle hover:border-emerald/40' : 'bg-white/5 border-white/10 hover:border-white/20')
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${modelSettings.active_model === 'random_forest' ? 'border-emerald bg-emerald' : 'border-gray-400'
                    }`}>
                    {modelSettings.active_model === 'random_forest' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                    Random Forest Regressor
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald/10 text-emerald border border-emerald/20">
                  Baseline (modelled)
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 ml-6 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                Quantile conformal prediction (5th–95th percentile). Highly robust baseline across Sundarbans mangrove stands.
              </p>
            </div>

            {/* 2. XGBoost */}
            <div
              onClick={() => handleSelectModel('xgboost')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${modelSettings.active_model === 'xgboost'
                  ? (isLight ? 'bg-emerald/5 border-emerald ring-1 ring-emerald' : 'bg-emerald/10 border-emerald/50 ring-1 ring-emerald/40')
                  : (isLight ? 'bg-white border-border-subtle hover:border-emerald/40' : 'bg-white/5 border-white/10 hover:border-white/20')
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${modelSettings.active_model === 'xgboost' ? 'border-emerald bg-emerald' : 'border-gray-400'
                    }`}>
                    {modelSettings.active_model === 'xgboost' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                    XGBoost Gradient Boosting
                  </span>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Quantile Boosting
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 ml-6 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                Gradient-boosted pinball loss for asymmetric error modeling across dense tropical salinity gradients.
              </p>
            </div>

            {/* 3. Multi-Modal Sensor Fusion */}
            <div
              onClick={() => handleSelectModel('fusion')}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${modelSettings.active_model === 'fusion'
                  ? (isLight ? 'bg-purple-500/5 border-purple-500 ring-1 ring-purple-500' : 'bg-purple-500/10 border-purple-500/50 ring-1 ring-purple-500/40')
                  : (isLight ? 'bg-white border-border-subtle hover:border-purple-400' : 'bg-white/5 border-white/10 hover:border-white/20')
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${modelSettings.active_model === 'fusion' ? 'border-purple-500 bg-purple-500' : 'border-gray-400'
                    }`}>
                    {modelSettings.active_model === 'fusion' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className={`font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                    Kanop Multi-Modal Sensor Fusion Net
                  </span>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${modelSettings.fusion_model_status === 'gated_insufficient_real_data'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                  {modelSettings.fusion_model_status === 'gated_insufficient_real_data' ? 'Gated (<150 Real Plots)' : 'Deep Neural Net'}
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 ml-6 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                3-Way Neural Fusion: Optical ResNet-18 + SAR ConvNet + Canopy Height MLP. Joint pinball quantile loss.
              </p>

              {/* Safety Guardrail Callout */}
              <div className={`mt-3 ml-6 p-3 rounded-lg border text-[11px] space-y-1.5 ${isLight ? 'bg-amber-500/5 border-amber-500/20 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}>
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldAlert size={14} className="text-amber-500 shrink-0" />
                  <span>Guardrail: Multi-Modal Real-Data Gate</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Deep learning weights are locked against synthetic data hallucinations. Production activation requires ≥ 150 ground-truth NFI field plots. Inferences automatically fall back to <span className="font-mono font-bold">fusion_fallback_rf</span>.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-amber-500/15 text-[10px] font-mono">
                  <span>Gate Requirement: ≥ 150 real samples</span>
                  <span className="font-bold text-amber-500">Currently: 0 verified plots</span>
                </div>
                <div className="w-full bg-amber-500/20 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: '2%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Status footer */}
          <div className={`pt-3 border-t flex items-center justify-between text-[11px] ${isLight ? 'border-border-subtle text-fg-secondary' : 'border-white/10 text-mist'
            }`}>
            <span>Model Engine Status:</span>
            <span className="font-mono font-bold text-emerald">
              {updatingModel
                ? 'Updating Engine...'
                : `Active: ${(modelSettings?.active_model || 'fusion').toUpperCase()} (Resolved: ${modelSettings?.active_model === 'fusion' ? 'fusion_fallback_rf' : (modelSettings?.active_model || 'random_forest')})`}
            </span>
          </div>
        </div>

        {/* Right Column: Existing GEE & Validation Levels */}
        <div className="space-y-6">
          <div className={`border rounded-2xl p-5 space-y-4 ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'
            }`}>
            <h3 className={`font-bold text-sm border-b pb-2 ${isLight ? 'text-fg-primary border-border-subtle' : 'text-white border-white/5'
              }`}>Google Earth Engine (GEE) Parameters</h3>

            <div className="space-y-2">
              <label className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>GEE Connection Status</label>
              <div className={`flex items-center space-x-2 ${isLight ? 'text-fg-secondary' : 'text-white'}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse"></span>
                <span>Simulation Fallback Active (No GEE API Key loaded server-side)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>Service Account Email</label>
              <input
                type="text"
                value="gee-mrv-validator@carbonzero-bd.iam.gserviceaccount.com"
                disabled
                className={`w-full border rounded-xl px-3 py-2 text-xs cursor-not-allowed ${isLight ? 'bg-white border-border-subtle text-fg-secondary' : 'bg-white/5 border-white/10 text-mist'
                  }`}
              />
            </div>
          </div>

          <div className={`border rounded-2xl p-5 space-y-4 ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'
            }`}>
            <h3 className={`font-bold text-sm border-b pb-2 ${isLight ? 'text-fg-primary border-border-subtle' : 'text-white border-white/5'
              }`}>Digital MRV Validation Levels</h3>

            <div className="space-y-2">
              <label className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>IPCC Validation Tier</label>
              <select className={`w-full border rounded-xl px-3 py-2 text-xs cursor-pointer ${isLight ? 'bg-white border-border-subtle text-fg-primary' : 'bg-white/5 border-white/10 text-white'
                }`}>
                <option>Tier 3 - Highly localized remote sensing + field models (Active)</option>
                <option>Tier 2 - National emission and default biomass factors</option>
                <option>Tier 1 - IPCC global default coefficients</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>Telemetry Sensor Audit Ingestion</label>
              <div className={`flex items-center justify-between ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                <span>Cross-validate with local IoT soil sensor feeds</span>
                <input type="checkbox" defaultChecked className="accent-emerald w-4 h-4 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
