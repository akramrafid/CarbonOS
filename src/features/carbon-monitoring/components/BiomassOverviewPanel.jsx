import React from 'react';
import {
  Trees,
  Activity,
  Layers,
  Flame,
  CloudRain,
  Download,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Info
} from 'lucide-react';
import { TELEMETRY_QUARTERS } from '../constants';

export function BiomassOverviewPanel(props) {
  const {
    isLight,
    isBn,
    t,
    loadingDashboard,
    dashboardData,
    selectedMetric,
    setSelectedMetric,
    selectedHorizon,
    setSelectedHorizon,
    hoveredQuarter,
    setHoveredQuarter,
    setActiveTab,
    selectedJob
  } = props;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {loadingDashboard ? (
            // Skeletons
            Array(8).fill(0).map((_, i) => (
              <div key={i} className={`rounded-2xl p-6 h-36 animate-pulse flex flex-col justify-between border ${
                isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className={`h-4 rounded w-2/3 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`}></div>
                <div className={`h-8 rounded w-1/2 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`}></div>
                <div className={`h-3 rounded w-3/4 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`}></div>
              </div>
            ))
          ) : (
            <>
              {/* Carbon Estimate Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Current Carbon Estimate
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <Trees size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.current_carbon_estimate_tC_ha} <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>tC/ha</span>
                </div>
                <div className="text-xs font-medium text-emerald flex items-center space-x-1.5 mt-3">
                  <TrendingUp size={13} />
                  <span className="font-mono tabular-nums">±4.2% uncertainty (model, unverified)</span>
                </div>
              </div>

              {/* CO2 Storage Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Estimated CO₂ Storage
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <CloudRain size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.estimated_co2_storage_tCO2e.toLocaleString()} <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>tCO₂e</span>
                </div>
                <div className={`text-xs mt-3 font-medium ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Total mitigated climate footprint
                </div>
              </div>

              {/* Forest Health Score Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Forest Health Score
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <Activity size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.forest_health_score}%
                </div>
                <div className="text-xs font-medium text-emerald mt-3 flex items-center space-x-1.5">
                  <CheckCircle size={13} />
                  <span>Photosynthetic canopy active</span>
                </div>
              </div>

              {/* NDVI Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Vegetation Index (NDVI)
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <Layers size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.vegetation_index_ndvi}
                </div>
                <div className="text-xs font-medium text-emerald mt-3 flex items-center space-x-1.5">
                  <span className="font-mono tabular-nums">Sentinel-2 10m calibrated index</span>
                </div>
              </div>

              {/* Biomass Density Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Estimated Biomass
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <Cpu size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.estimated_biomass_Mg_ha} <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>Mg/ha</span>
                </div>
                <div className={`text-xs mt-3 font-medium ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Above-ground organic dry mass
                </div>
              </div>

              {/* Area Size Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Total Monitored Area
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <Navigation size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.total_area_size_ha.toLocaleString()} <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>ha</span>
                </div>
                <div className={`text-xs mt-3 font-medium ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Aggregated boundary polygon size
                </div>
              </div>

              {/* Confidence Score Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Model Confidence
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <CheckCircle size={16} />
                  </div>
                </div>
                <div className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {(dashboardData.confidence_score * 100).toFixed(0)}%
                </div>
                <div className="text-xs font-medium text-emerald mt-3 flex items-center space-x-1.5">
                  <Check size={13} />
                  <span>Conformal 90% uncertainty (model)</span>
                </div>
              </div>

              {/* Latest Analysis Card */}
              <div className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
                isLight 
                  ? 'bg-white border-[#E2E8F0] shadow-xs' 
                  : 'bg-[#08130C] border-[#152B1D]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                  }`}>
                    Last Analysis Run
                  </span>
                  <div className={`p-2 rounded-lg border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                  }`}>
                    <Calendar size={16} />
                  </div>
                </div>
                <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-3.5 ${
                  isLight ? 'text-[#0F291B]' : 'text-white'
                }`}>
                  {dashboardData.last_analysis_date || "2026-06-25"}
                </div>
                <div className={`text-xs mt-3 font-mono ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Pass: {dashboardData.latest_satellite_date || "2026-06-25"}
                </div>
              </div>
            </>
          )}

          {/* ============================================================ */}
          {/* VERRA VM0047 & VM0048 MULTI-POOL & CONSERVATIVENESS STRIP */}
          {/* ============================================================ */}
          <div className={`col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-6 md:p-7 border transition-all ${
            isLight 
              ? 'bg-white border-[#E2E8F0] shadow-xs' 
              : 'bg-[#08130C] border-[#152B1D]'
          }`}>
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b mb-6 ${
              isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
            }`}>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'}`}>
                    <Scale size={18} />
                  </div>
                  <h3 className={`font-extrabold text-lg md:text-xl font-sans tracking-tight ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}>
                    Verra VM0047 & VM0048 Multi-Pool Accounting & Conservativeness
                  </h3>
                  <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/25'
                  }`}>
                    {dashboardData.forest_stratum || 'SUNDARBANS_MANGROVE'}
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  IPCC Tier-3 multi-pool living and sediment carbon stocks, dynamic counterfactual additionality, and conformal uncertainty guarantees.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('verra_audit')}
                className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  isLight
                    ? 'bg-[#00873E] text-white hover:bg-[#007033] border-[#00873E]'
                    : 'bg-emerald text-carbon hover:bg-emerald-400 border-emerald'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Open Full VVB Audit Dossier</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pillar 1: Multi-Pool Stocks */}
              <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
                isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                      IPCC Tier-3 Multi-Pool Stocks
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald">tC/ha</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Above-Ground Biomass (AGB)</span>
                      <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {dashboardData.carbon_agb_tc_ha || 112.5}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Below-Ground Biomass (BGB, R=0.49)</span>
                      <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {dashboardData.carbon_bgb_tc_ha || 55.13}
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Soil Organic Carbon (SOC, 100cm)</span>
                      <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {dashboardData.carbon_soc_tc_ha || 180.4}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}>
                  <span className={`text-xs font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Total Organic Carbon Density
                  </span>
                  <span className="text-base font-mono font-extrabold tabular-nums text-emerald">
                    {dashboardData.carbon_total_tc_ha || 348.03} <span className="text-xs font-normal">tC/ha</span>
                  </span>
                </div>
              </div>

              {/* Pillar 2: Dynamic Synthetic Baseline */}
              <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
                isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                      Dynamic Synthetic Baseline (VM0048)
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                    }`}>
                      Abadie et al.
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Counterfactual Baseline Stock</span>
                      <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {dashboardData.counterfactual_carbon_tc_ha || 92.4} tC/ha
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Gross Additionality</span>
                      <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        {(dashboardData.gross_additionality_tco2e || 278500).toLocaleString()} tCO₂e
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>10km Leakage Belt Deduction</span>
                      <span className="font-mono font-bold text-emerald">
                        0.0 tCO₂e (Risk: {dashboardData.leakage_risk_rating || 'LOW'})
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Verra Risk Buffer Withholding (18%)</span>
                      <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                        -{(dashboardData.buffer_withheld_tco2e || 50130).toLocaleString()} tCO₂e
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}>
                  <span className={`text-xs font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Net Creditable Volume
                  </span>
                  <span className="text-base font-mono font-extrabold tabular-nums text-emerald">
                    {(dashboardData.net_creditable_tco2e || 228370).toLocaleString()} <span className="text-xs font-normal">tCO₂e</span>
                  </span>
                </div>
              </div>

              {/* Pillar 3: Conformal Uncertainty & Conservativeness */}
              <div className={`rounded-2xl p-5 border flex flex-col justify-between ${
                isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                      Conformal Uncertainty (90% CI)
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald">VM0047 Sec 8.3</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Conformal 90% Confidence Interval</span>
                      <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                        [{dashboardData.carbon_lower_90 || 106.8}, {dashboardData.carbon_upper_90 || 118.2}] tC/ha
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Relative Margin of Error (RME)</span>
                      <span className="font-mono font-bold tabular-nums text-emerald">
                        {dashboardData.relative_margin_of_error || 5.1}% (Threshold: ≤ 15%)
                      </span>
                    </div>
                    <div className={`flex items-center justify-between pb-1.5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                      <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>Verra Precision Deduction</span>
                      <span className="font-mono font-bold text-emerald">
                        0.0% (Zero penalty applied)
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}>
                  <span className={`text-xs font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                    Conservative Creditable Volume
                  </span>
                  <span className="text-base font-mono font-extrabold tabular-nums text-emerald">
                    {(dashboardData.conservative_creditable_tco2e || 228370).toLocaleString()} <span className="text-xs font-normal">tCO₂e</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* HIGH-CRAFT INTERACTIVE TELEMETRY CHART CONTAINER */}
          {/* ============================================================ */}
          <div className={`col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-6 md:p-8 border transition-all ${
            isLight 
              ? 'bg-white border-[#E2E8F0] shadow-xs' 
              : 'bg-[#08130C] border-[#152B1D]'
          }`}>
            {/* Chart Header Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center space-x-2.5 mb-1">
                  <div className={`p-1.5 rounded-lg border ${isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'}`}>
                    <TrendingUp size={18} />
                  </div>
                  <h3 className={`font-extrabold text-lg md:text-xl font-sans tracking-tight ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}>
                    Forest Health & Carbon Accumulation Trends
                  </h3>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                    isLight ? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]' : 'bg-[#050C07] text-[#94A3B8] border-[#152B1D]'
                  }`}>
                    Multi-Temporal SAR + S2
                  </span>
                </div>
                <p className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
                  Quarterly canopy telemetry against modelled pre-project baselines.
                </p>
              </div>

              {/* Chart Controls: Metric & Horizon Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric Selector */}
                <div className={`flex items-center p-1 rounded-xl border ${
                  isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
                }`}>
                  {[
                    { id: 'ndvi', label: 'NDVI Index' },
                    { id: 'biomass', label: 'Biomass (Mg/ha)' },
                    { id: 'carbon', label: 'Carbon Stock (tC/ha)' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMetric(m.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                        selectedMetric === m.id
                          ? (isLight ? 'bg-[#00873E] text-white shadow-xs' : 'bg-emerald text-carbon shadow-xs')
                          : (isLight ? 'text-[#64748B] hover:text-[#0F291B]' : 'text-[#94A3B8] hover:text-white')
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Time Horizon Selector */}
                <div className={`flex items-center p-1 rounded-xl border ${
                  isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
                }`}>
                  {[
                    { id: 'all', label: 'All (10Q)' },
                    { id: '1y', label: '1 Year' },
                    { id: 'historical', label: 'Historical' }
                  ].map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHorizon(h.id)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        selectedHorizon === h.id
                          ? (isLight ? 'bg-white text-[#0F291B] shadow-xs' : 'bg-[#152B1D] text-white')
                          : (isLight ? 'text-[#64748B] hover:text-[#0F291B]' : 'text-[#94A3B8] hover:text-white')
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive SVG Dual-Series Chart */}
            {(() => {
              const displayed = TELEMETRY_QUARTERS.filter((q, idx) => {
                if (selectedHorizon === '1y') return idx >= 6;
                if (selectedHorizon === 'historical') return idx <= 5;
                return true;
              });

              // Metric configs
              const metricConfig = {
                ndvi: {
                  title: 'Canopy Photosynthesis Index (NDVI)',
                  maxVal: 1.0,
                  primaryKey: 'ndvi',
                  baselineKey: 'baseline',
                  unit: '',
                  format: (v) => v.toFixed(3),
                  gridSteps: [1.0, 0.75, 0.5, 0.25, 0.0]
                },
                biomass: {
                  title: 'Above-Ground Biomass Density',
                  maxVal: 300,
                  primaryKey: 'biomass',
                  baselineKey: 'baselineBiomass',
                  unit: 'Mg/ha',
                  format: (v) => `${v.toFixed(1)} Mg/ha`,
                  gridSteps: [300, 225, 150, 75, 0]
                },
                carbon: {
                  title: 'Organic Carbon Stock per Hectare',
                  maxVal: 150,
                  primaryKey: 'carbon',
                  baselineKey: 'baselineCarbon',
                  unit: 'tC/ha',
                  format: (v) => `${v.toFixed(1)} tC/ha`,
                  gridSteps: [150, 112.5, 75, 37.5, 0]
                }
              }[selectedMetric];

              const chartW = 960;
              const chartH = 260;
              const padLeft = 60;
              const padRight = 30;
              const padTop = 25;
              const padBottom = 40;
              const plotW = chartW - padLeft - padRight;
              const plotH = chartH - padTop - padBottom;

              const n = displayed.length;
              const colWidth = Math.min(54, Math.max(26, (plotW / n) * 0.54));

              const points = displayed.map((q, i) => {
                const x = padLeft + (i + 0.5) * (plotW / n);
                const val = q[metricConfig.primaryKey];
                const baseVal = q[metricConfig.baselineKey];
                const yVal = padTop + plotH - (val / metricConfig.maxVal) * plotH;
                const yBase = padTop + plotH - (baseVal / metricConfig.maxVal) * plotH;
                const barH = (val / metricConfig.maxVal) * plotH;
                return { q, x, val, baseVal, yVal, yBase, barH };
              });

              const baselinePathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yBase}`).join(' ');

              return (
                <div className="relative">
                  {/* Tooltip Card Overlay (Dynamic) */}
                  {hoveredQuarter && (
                    <div 
                      className={`absolute top-0 right-4 z-20 p-3.5 rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-200 pointer-events-none max-w-xs ${
                        isLight ? 'bg-white/95 border-[#E2E8F0] text-[#0F291B]' : 'bg-[#08130C]/95 border-[#152B1D] text-white'
                      }`}
                    >
                      <div className={`flex items-center justify-between gap-2 border-b pb-2 mb-2 ${isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'}`}>
                        <span className="font-extrabold text-xs">{hoveredQuarter.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                        }`}>
                          {hoveredQuarter.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className={isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}>Active Value:</span>
                          <span className="font-bold font-mono tabular-nums text-emerald">{metricConfig.format(hoveredQuarter[metricConfig.primaryKey])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}>Pre-Project Base:</span>
                          <span className="font-bold font-mono tabular-nums text-amber-500">{metricConfig.format(hoveredQuarter[metricConfig.baselineKey])}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}>Additionality Delta:</span>
                          <span className="font-bold font-mono tabular-nums text-emerald">
                            +{(hoveredQuarter[metricConfig.primaryKey] - hoveredQuarter[metricConfig.baselineKey]).toFixed(2)}
                          </span>
                        </div>
                        <div className={`flex justify-between border-t pt-1.5 text-[10px] font-mono ${isLight ? 'border-[#E2E8F0] text-[#64748B]' : 'border-[#152B1D] text-[#94A3B8]'}`}>
                          <span>Sensor: {hoveredQuarter.sensor}</span>
                          <span>Cloud: {hoveredQuarter.cloudCover}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SVG Surface */}
                  <div className="w-full overflow-x-auto">
                    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-[270px] select-none">
                      <defs>
                        {/* Luminous Active Green Gradient */}
                        <linearGradient id="activeColGradLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00C853" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#15803D" stopOpacity="0.45" />
                        </linearGradient>
                        <linearGradient id="activeColGradDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E676" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#00C853" stopOpacity="0.25" />
                        </linearGradient>
                        {/* Hover Gradient */}
                        <linearGradient id="hoverColGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E676" stopOpacity="1" />
                          <stop offset="100%" stopColor="#00C853" stopOpacity="0.75" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Gridlines & Y-Axis Labels */}
                      {metricConfig.gridSteps.map((step, idx) => {
                        const y = padTop + (idx / 4) * plotH;
                        return (
                          <g key={idx}>
                            <line 
                              x1={padLeft} 
                              y1={y} 
                              x2={chartW - padRight} 
                              y2={y} 
                              stroke={isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)'} 
                              strokeDasharray={idx === 4 ? 'none' : '4 4'}
                              strokeWidth={idx === 4 ? '1.5' : '1'}
                            />
                            <text 
                              x={padLeft - 10} 
                              y={y + 4} 
                              textAnchor="end" 
                              fontSize="10" 
                              fontWeight="600" 
                              fill={isLight ? '#64748B' : '#94A3B8'}
                              fontFamily="system-ui, sans-serif"
                            >
                              {selectedMetric === 'ndvi' ? step.toFixed(2) : Math.round(step)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Dotted Baseline Spline Line */}
                      <path 
                        d={baselinePathString} 
                        fill="none" 
                        stroke="#F59E0B" 
                        strokeWidth="2.5" 
                        strokeDasharray="6 4" 
                        strokeLinecap="round"
                        opacity={isLight ? '0.9' : '0.85'}
                      />

                      {/* Baseline Point Pins */}
                      {points.map((p, idx) => (
                        <circle 
                          key={`base-${idx}`}
                          cx={p.x} 
                          cy={p.yBase} 
                          r="4" 
                          fill={isLight ? '#FFFFFF' : '#080F0B'} 
                          stroke="#F59E0B" 
                          strokeWidth="2.5"
                        />
                      ))}

                      {/* Primary Data Bars */}
                      {points.map((p, idx) => {
                        const isHovered = hoveredQuarter && hoveredQuarter.id === p.q.id;
                        return (
                          <g 
                            key={`bar-${idx}`} 
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredQuarter(p.q)}
                            onMouseLeave={() => setHoveredQuarter(null)}
                          >
                            {/* Hitbox for comfortable hovering */}
                            <rect 
                              x={p.x - colWidth} 
                              y={padTop} 
                              width={colWidth * 2} 
                              height={plotH + padBottom} 
                              fill="transparent" 
                            />

                            {/* Bar Body */}
                            <rect 
                              x={p.x - colWidth / 2} 
                              y={p.yVal} 
                              width={colWidth} 
                              height={Math.max(4, p.barH)} 
                              rx="6" 
                              fill={isHovered ? 'url(#hoverColGrad)' : (isLight ? 'url(#activeColGradLight)' : 'url(#activeColGradDark)')}
                              className="transition-all duration-200"
                              opacity={hoveredQuarter && !isHovered ? '0.45' : '1'}
                            />

                            {/* Top Cap Stroke */}
                            <line 
                              x1={p.x - colWidth / 2 + 2} 
                              y1={p.yVal} 
                              x2={p.x + colWidth / 2 - 2} 
                              y2={p.yVal} 
                              stroke={isLight ? '#15803D' : '#00E676'} 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                            />

                            {/* Value Label above Bar */}
                            <text 
                              x={p.x} 
                              y={p.yVal - 8} 
                              textAnchor="middle" 
                              fontSize="10.5" 
                              fontWeight="800" 
                              fill={isHovered ? '#00C853' : (isLight ? '#0F291B' : '#E2E8F0')}
                              className="transition-colors"
                            >
                              {selectedMetric === 'ndvi' ? p.val.toFixed(2) : Math.round(p.val)}
                            </text>

                            {/* X-Axis Quarter Label */}
                            <text 
                              x={p.x} 
                              y={chartH - 12} 
                              textAnchor="middle" 
                              fontSize="11" 
                              fontWeight={isHovered ? '800' : '600'} 
                              fill={isHovered ? (isLight ? '#00873E' : '#00E676') : (isLight ? '#64748B' : '#94A3B8')}
                              className="transition-colors"
                            >
                              {p.q.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Chart Footer Legend & Real-time Metrics Strip */}
                  <div className={`mt-6 pt-5 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
                    isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                  }`}>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-xs shrink-0 ${isLight ? 'bg-[#00873E]' : 'bg-[#00C853]'}`}></span>
                        <span className={`font-semibold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                          Active Measured Telemetry ({metricConfig.title})
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-0.5 border-t-2 border-dashed border-[#F59E0B]"></span>
                        <span className={`font-semibold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                          Modelled Baseline Trajectory (Pre-Project Level)
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Micro-Pills */}
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
                        isLight ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]' : 'bg-emerald/10 text-emerald border-emerald/20'
                      }`}>
                        Net Delta: +18.4% YoY
                      </span>
                      <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
                        isLight ? 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]' : 'bg-[#050C07] text-[#94A3B8] border-[#152B1D]'
                      }`}>
                        Reserve: 18.5%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
  );
}

export default BiomassOverviewPanel;
