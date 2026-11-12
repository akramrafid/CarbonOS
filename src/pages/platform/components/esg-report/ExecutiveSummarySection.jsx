import React from 'react';
import { Sparkles } from 'lucide-react';

export function ExecutiveSummarySection({
  isLight,
  activeClient,
  totalGrossEmissions,
  insetsTotal,
  netEmissions,
  scope1Total,
  scope2LocationTotal,
  scope2MarketTotal,
  scope3Total,
  fmt
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#00C853] font-bold">
        <span className="w-2 h-2 rounded-full bg-[#00C853]" />
        <span>Section 1 • Executive Summary</span>
      </div>

      <div className={`p-6 rounded-2xl border ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-[#152B1D]'
      }`}>
        <p className="text-sm sm:text-base leading-relaxed">
          For reporting fiscal year 2026, <strong>{activeClient.legalName}</strong> recorded a total gross carbon footprint of <strong className="text-[#00C853] font-mono">{fmt(totalGrossEmissions, 2)} tCO₂e</strong> across direct operational combustion (Scope 1), purchased grid electricity (Scope 2), and key value-chain supply stream activities (Scope 3).
        </p>
        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          With <strong>{insetsTotal} tCO₂e</strong> in verified insetting credits retired from local decarbonization investments ({activeClient.creditVintage} Vintage), the net residual corporate footprint is certified at <strong className="text-[#00C853] font-mono">{fmt(netEmissions, 2)} tCO₂e</strong>.
        </p>

        <div className="mt-4 pt-4 border-t border-[#152B1D]/40 flex items-center space-x-2 text-xs text-emerald-400">
          <Sparkles className="w-4 h-4 text-[#00C853] shrink-0" />
          <span><strong>Sustainability Milestone:</strong> {activeClient.sustainabilityHighlight}</span>
        </div>
      </div>

      {/* Executive Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-black/40 border border-[#152B1D]">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Scope 1 (Direct)</span>
          <span className="font-mono font-bold text-xl text-amber-400 mt-1 block">
            {fmt(scope1Total, 2)} <span className="text-xs">tCO₂e</span>
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">
            {((scope1Total / (totalGrossEmissions || 1)) * 100).toFixed(1)}% of total
          </span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-[#152B1D]">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Scope 2 (Grid - Loc)</span>
          <span className="font-mono font-bold text-xl text-[#00E676] mt-1 block">
            {fmt(scope2LocationTotal, 2)} <span className="text-xs">tCO₂e</span>
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">
            Grid-average factor pending approval
          </span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-[#152B1D]">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Scope 2 (Market-based)</span>
          <span className="font-mono font-bold text-xl text-sky-400 mt-1 block">
            {fmt(scope2MarketTotal, 2)} <span className="text-xs">tCO₂e</span>
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">
            Grid-average fallback: no instruments or residual mix
          </span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-[#152B1D]">
          <span className="text-[10px] font-mono uppercase text-gray-400 block">Scope 3 (Value Chain)</span>
          <span className="font-mono font-bold text-xl text-purple-400 mt-1 block">
            {fmt(scope3Total, 2)} <span className="text-xs">tCO₂e</span>
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">
            Freight, Commute, Travel
          </span>
        </div>
      </div>
    </section>
  );
}

export default ExecutiveSummarySection;
