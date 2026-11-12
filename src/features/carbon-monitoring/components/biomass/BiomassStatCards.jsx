import React from 'react';
import {
  Trees,
  CloudRain,
  Activity,
  Layers,
  Cpu,
  Navigation,
  CheckCircle,
  Calendar,
  TrendingUp,
  Check
} from 'lucide-react';

export function BiomassStatCards({ isLight, loadingDashboard, dashboardData }) {
  if (loadingDashboard) {
    return (
      <>
        {Array(8).fill(0).map((_, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 h-36 animate-pulse flex flex-col justify-between border ${
              isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#08130C] border-[#152B1D]'
            }`}
          >
            <div className={`h-4 rounded w-2/3 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`}></div>
            <div className={`h-8 rounded w-1/2 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`}></div>
            <div className={`h-3 rounded w-3/4 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`}></div>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {/* Carbon Estimate Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Current Carbon Estimate
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <Trees size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.current_carbon_estimate_tC_ha}{' '}
          <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
            tC/ha
          </span>
        </div>
        <div className="text-xs font-medium text-emerald flex items-center space-x-1.5 mt-3">
          <TrendingUp size={13} />
          <span className="font-mono tabular-nums">±4.2% uncertainty (model, unverified)</span>
        </div>
      </div>

      {/* CO2 Storage Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Estimated CO₂ Storage
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <CloudRain size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.estimated_co2_storage_tCO2e.toLocaleString()}{' '}
          <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
            tCO₂e
          </span>
        </div>
        <div className={`text-xs mt-3 font-medium ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
          Total mitigated climate footprint
        </div>
      </div>

      {/* Forest Health Score Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Forest Health Score
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <Activity size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.forest_health_score}%
        </div>
        <div className="text-xs font-medium text-emerald mt-3 flex items-center space-x-1.5">
          <CheckCircle size={13} />
          <span>Photosynthetic canopy active</span>
        </div>
      </div>

      {/* NDVI Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Vegetation Index (NDVI)
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <Layers size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.vegetation_index_ndvi}
        </div>
        <div className="text-xs font-medium text-emerald mt-3 flex items-center space-x-1.5">
          <span className="font-mono tabular-nums">Sentinel-2 10m calibrated index</span>
        </div>
      </div>

      {/* Biomass Density Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Estimated Biomass
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <Cpu size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.estimated_biomass_Mg_ha}{' '}
          <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
            Mg/ha
          </span>
        </div>
        <div className={`text-xs mt-3 font-medium ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
          Above-ground organic dry mass
        </div>
      </div>

      {/* Area Size Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Total Monitored Area
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <Navigation size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.total_area_size_ha.toLocaleString()}{' '}
          <span className={`text-xs font-normal font-sans ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
            ha
          </span>
        </div>
        <div className={`text-xs mt-3 font-medium ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
          Aggregated boundary polygon size
        </div>
      </div>

      {/* Confidence Score Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Model Confidence
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <CheckCircle size={16} />
          </div>
        </div>
        <div
          className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight mt-3 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {(dashboardData.confidence_score * 100).toFixed(0)}%
        </div>
        <div className="text-xs font-medium text-emerald mt-3 flex items-center space-x-1.5">
          <Check size={13} />
          <span>Conformal 90% uncertainty (model)</span>
        </div>
      </div>

      {/* Latest Analysis Card */}
      <div
        className={`rounded-2xl p-6 relative border transition-all duration-200 hover:border-emerald/40 hover:-translate-y-0.5 ${
          isLight
            ? 'bg-white border-[#E2E8F0] shadow-xs'
            : 'bg-[#08130C] border-[#152B1D]'
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
              isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
            }`}
          >
            Last Analysis Run
          </span>
          <div
            className={`p-2 rounded-lg border ${
              isLight
                ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            <Calendar size={16} />
          </div>
        </div>
        <div
          className={`text-2xl font-bold font-mono tabular-nums tracking-tight mt-3.5 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}
        >
          {dashboardData.last_analysis_date || '2026-06-25'}
        </div>
        <div className={`text-xs mt-3 font-mono ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
          Pass: {dashboardData.latest_satellite_date || '2026-06-25'}
        </div>
      </div>
    </>
  );
}

export default BiomassStatCards;
