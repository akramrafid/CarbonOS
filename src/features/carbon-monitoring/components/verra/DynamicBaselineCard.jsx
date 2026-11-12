import React from 'react';
import { Activity } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function DynamicBaselineCard({
  isLight,
  counterfactual,
  grossAdditionality,
  leakageBelt,
  leakageRisk,
  leakageDeduction,
  bufferPct,
  bufferWithheld,
  netCreditable
}) {
  return (
    <Card className={`rounded-2xl p-5 border transition-all ${
      isLight ? 'bg-white border-[#CBD5E1] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
        <div className="flex items-center space-x-2">
          <Activity size={15} className="text-emerald" />
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            3. Dynamic Baseline & Additionality (VM0048)
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
          isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
        }`}>
          Abadie et al.
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
          <span className={isLight ? 'text-[#475569]' : 'text-mist'}>Synthetic Control Counterfactual</span>
          <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            {counterfactual} tC/ha
          </span>
        </div>
        <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
          <span className={isLight ? 'text-[#475569]' : 'text-mist'}>Gross Additionality (Actual - Baseline)</span>
          <span className="font-mono font-bold tabular-nums text-emerald">
            +{grossAdditionality.toLocaleString()} tCO₂e
          </span>
        </div>
        <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
          <div>
            <span className={`block font-semibold ${isLight ? 'text-[#475569]' : 'text-mist'}`}>
              10 km Leakage Belt Area
            </span>
            <span className={`text-[11px] ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
              {leakageBelt.toLocaleString()} ha monitored · Activity displacement: {leakageRisk}
            </span>
          </div>
          <span className="font-mono font-bold tabular-nums text-emerald">
            {leakageDeduction.toFixed(1)} tCO₂e deduction
          </span>
        </div>
        <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
          <span className={isLight ? 'text-[#475569]' : 'text-mist'}>
            Verra AFOLU Risk Buffer Withholding ({bufferPct}%)
          </span>
          <span className="font-mono font-bold tabular-nums text-amber-500 dark:text-amber-400">
            -{bufferWithheld.toLocaleString()} tCO₂e
          </span>
        </div>
        <div className={`flex items-center justify-between p-2.5 rounded-xl border mt-2 ${
          isLight ? 'bg-[#F8FAFC] border-[#CBD5E1]' : 'bg-white/5 border-white/10'
        }`}>
          <span className={`font-extrabold ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
            Net Creditable Carbon Volume
          </span>
          <span className="font-mono font-extrabold text-base text-emerald tabular-nums">
            {netCreditable.toLocaleString()} <span className="text-xs font-normal">tCO₂e</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

export default DynamicBaselineCard;
