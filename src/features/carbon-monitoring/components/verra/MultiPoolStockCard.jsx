import React from 'react';
import { Trees } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function MultiPoolStockCard({
  isLight,
  agb,
  bgb,
  soc,
  totalPools,
  agbPct,
  bgbPct,
  socPct
}) {
  return (
    <Card className={`rounded-2xl p-5 border transition-all ${
      isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
        <div className="flex items-center space-x-2">
          <Trees size={15} className="text-emerald" />
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            2. IPCC Tier-3 Multi-Pool Carbon Stocks
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
          isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
        }`}>
          VM0047 Sec 6
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-xl bg-inherit border border-inherit">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Above-Ground Biomass (AGB)
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Sentinel-2 MSI + GEDI LiDAR spaceborne model
            </span>
          </div>
          <span className="font-mono font-bold text-sm text-emerald tabular-nums">
            {agb} <span className="text-[10px] font-normal text-slate-400">tC/ha</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-inherit border border-inherit">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Below-Ground Biomass (BGB)
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              IPCC Tier-3 root-to-shoot ratio (R = 0.49 mangrove allometry)
            </span>
          </div>
          <span className="font-mono font-bold text-sm text-emerald tabular-nums">
            {bgb} <span className="text-[10px] font-normal text-slate-400">tC/ha</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-inherit border border-inherit">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Soil Organic Carbon (SOC)
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Coastal delta sediment core: 100cm depth, bulk density 0.82 g/cm³
            </span>
          </div>
          <span className="font-mono font-bold text-sm text-emerald tabular-nums">
            {soc} <span className="text-[10px] font-normal text-slate-400">tC/ha</span>
          </span>
        </div>

        {/* VISUAL MULTI-POOL PROPORTION BREAKDOWN BAR */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
            <span>Pool Distribution</span>
            <span>AGB {agbPct}% · BGB {bgbPct}% · SOC {socPct}%</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-white/5 border border-inherit">
            <div style={{ width: `${agbPct}%` }} className="bg-emerald-400 transition-all duration-500" title={`AGB: ${agbPct}%`} />
            <div style={{ width: `${bgbPct}%` }} className="bg-emerald-600 transition-all duration-500" title={`BGB: ${bgbPct}%`} />
            <div style={{ width: `${socPct}%` }} className="bg-teal-700 transition-all duration-500" title={`SOC: ${socPct}%`} />
          </div>
        </div>

        <div className={`flex items-center justify-between p-2.5 rounded-xl border mt-2.5 ${
          isLight ? 'bg-accent-muted border-border-subtle' : 'bg-emerald/10 border-emerald/20'
        }`}>
          <span className={`font-extrabold text-xs ${isLight ? 'text-accent' : 'text-emerald'}`}>
            Total Multi-Pool Carbon Density
          </span>
          <span className="font-mono font-extrabold text-base text-emerald tabular-nums">
            {totalPools} <span className="text-xs font-normal">tC/ha</span>
          </span>
        </div>
      </div>
    </Card>
  );
}

export default MultiPoolStockCard;
