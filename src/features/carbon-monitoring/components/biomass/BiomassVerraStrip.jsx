import React from 'react';
import { Scale, ShieldCheck, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export function BiomassVerraStrip({ isLight, dashboardData, setActiveTab }) {
  return (
    <div
      className={`col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-6 md:p-7 border transition-all ${
        isLight
          ? 'bg-white border-[#E2E8F0] shadow-xs'
          : 'bg-[#08130C] border-[#152B1D]'
      }`}
    >
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b mb-6 ${
          isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
        }`}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div
              className={`p-1.5 rounded-lg border ${
                isLight
                  ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                  : 'bg-emerald/10 text-emerald border-emerald/20'
              }`}
            >
              <Scale size={18} />
            </div>
            <h3
              className={`font-extrabold text-lg md:text-xl font-sans tracking-tight ${
                isLight ? 'text-[#0F291B]' : 'text-white'
              }`}
            >
              Verra VM0047 & VM0048 Multi-Pool Accounting & Conservativeness
            </h3>
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isLight
                  ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                  : 'bg-emerald/10 text-emerald border-emerald/25'
              }`}
            >
              {dashboardData.forest_stratum || 'SUNDARBANS_MANGROVE'}
            </span>
          </div>
          <p className={`text-xs ${isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'}`}>
            IPCC Tier-3 multi-pool living and sediment carbon stocks, dynamic counterfactual additionality, and conformal uncertainty guarantees.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setActiveTab('verra_audit')}
          className="whitespace-nowrap"
        >
          <ShieldCheck size={16} className="mr-1.5" />
          <span>Open Full VVB Audit Dossier</span>
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pillar 1: Multi-Pool Stocks */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between ${
            isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                }`}
              >
                IPCC Tier-3 Multi-Pool Stocks
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald">tC/ha</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Above-Ground Biomass (AGB)
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}
                >
                  {dashboardData.carbon_agb_tc_ha || 112.5}
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Below-Ground Biomass (BGB, R=0.49)
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}
                >
                  {dashboardData.carbon_bgb_tc_ha || 55.13}
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Soil Organic Carbon (SOC, 100cm)
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}
                >
                  {dashboardData.carbon_soc_tc_ha || 180.4}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
            }`}
          >
            <span className={`text-xs font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
              Total Organic Carbon Density
            </span>
            <span className="text-base font-mono font-extrabold tabular-nums text-emerald">
              {dashboardData.carbon_total_tc_ha || 348.03} <span className="text-xs font-normal">tC/ha</span>
            </span>
          </div>
        </div>

        {/* Pillar 2: Dynamic Synthetic Baseline */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between ${
            isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                }`}
              >
                Dynamic Synthetic Baseline (VM0048)
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  isLight
                    ? 'bg-[#E8F8EE] text-[#00873E] border-[#C2E9CF]'
                    : 'bg-emerald/10 text-emerald border-emerald/20'
                }`}
              >
                Abadie et al.
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Counterfactual Baseline Stock
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}
                >
                  {dashboardData.counterfactual_carbon_tc_ha || 92.4} tC/ha
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Gross Additionality
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}
                >
                  {(dashboardData.gross_additionality_tco2e || 278500).toLocaleString()} tCO₂e
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  10km Leakage Belt Deduction
                </span>
                <span className="font-mono font-bold text-emerald">
                  0.0 tCO₂e (Risk: {dashboardData.leakage_risk_rating || 'LOW'})
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Verra Risk Buffer Withholding (18%)
                </span>
                <span className="font-mono font-bold tabular-nums text-amber-600 dark:text-amber-400">
                  -{(dashboardData.buffer_withheld_tco2e || 50130).toLocaleString()} tCO₂e
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
            }`}
          >
            <span className={`text-xs font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
              Net Creditable Volume
            </span>
            <span className="text-base font-mono font-extrabold tabular-nums text-emerald">
              {(dashboardData.net_creditable_tco2e || 228370).toLocaleString()}{' '}
              <span className="text-xs font-normal">tCO₂e</span>
            </span>
          </div>
        </div>

        {/* Pillar 3: Conformal Uncertainty & Conservativeness */}
        <div
          className={`rounded-2xl p-5 border flex flex-col justify-between ${
            isLight ? 'bg-[#F8FAFC] border-[#E2E8F0]' : 'bg-[#050C07] border-[#152B1D]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#64748B]' : 'text-[#94A3B8]'
                }`}
              >
                Conformal Uncertainty (90% CI)
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald">VM0047 Sec 8.3</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Conformal 90% Confidence Interval
                </span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    isLight ? 'text-[#0F291B]' : 'text-white'
                  }`}
                >
                  [{dashboardData.carbon_lower_90 || 106.8}, {dashboardData.carbon_upper_90 || 118.2}] tC/ha
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Relative Margin of Error (RME)
                </span>
                <span className="font-mono font-bold tabular-nums text-emerald">
                  {dashboardData.relative_margin_of_error || 5.1}% (Threshold: ≤ 15%)
                </span>
              </div>
              <div
                className={`flex items-center justify-between pb-1.5 border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
                }`}
              >
                <span className={isLight ? 'text-[#475569]' : 'text-[#94A3B8]'}>
                  Verra Precision Deduction
                </span>
                <span className="font-mono font-bold text-emerald">
                  0.0% (Zero penalty applied)
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-4 pt-3 border-t flex items-center justify-between ${
              isLight ? 'border-[#E2E8F0]' : 'border-[#152B1D]'
            }`}
          >
            <span className={`text-xs font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
              Conservative Creditable Volume
            </span>
            <span className="text-base font-mono font-extrabold tabular-nums text-emerald">
              {(dashboardData.conservative_creditable_tco2e || 228370).toLocaleString()}{' '}
              <span className="text-xs font-normal">tCO₂e</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiomassVerraStrip;
