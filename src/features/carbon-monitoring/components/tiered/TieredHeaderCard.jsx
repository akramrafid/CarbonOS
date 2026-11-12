import React from 'react';
import { Mountain, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function TieredHeaderCard({
  isLight,
  fetchVerificationTasks,
  loadingTasks
}) {
  return (
    <Card className={`rounded-3xl p-6 md:p-8 border relative overflow-hidden transition-all ${
      isLight ? 'bg-white border-[#E2E8F0] shadow-xs' : 'bg-[#08130C] border-[#152B1D]'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="p-2 rounded-xl bg-emerald/10 text-emerald">
              <Mountain size={20} />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald/15 text-emerald border border-emerald/25">
              Treeconomy Adaptive Resolution Protocol
            </span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-bold font-sans tracking-tight mb-2 ${
            isLight ? 'text-[#0F291B]' : 'text-white'
          }`}>
            Uncertainty-Tiered Monitoring & UAV LiDAR Dispatch
          </h2>
          <p className={`text-xs md:text-sm leading-relaxed ${isLight ? 'text-[#64748B]' : 'text-mist'}`}>
            Satellite SAR & optical imagery provide nationwide temporal screening. Parcels where relative conformal uncertainty <span className="font-mono font-bold text-emerald">W = (C_upper90 - C_lower90) / C_est &gt; 0.35</span> (35%) are automatically escalated to this queue. Dispatching targeted high-density drone LiDAR surveys tightens the error bound, prevents Verra VM0047 precision discount penalties, and directly recalibrates sovereign biomass models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={fetchVerificationTasks}
            disabled={loadingTasks}
            className="text-xs font-mono px-4 py-2.5 flex items-center space-x-2"
          >
            <RefreshCw size={13} className={loadingTasks ? 'animate-spin' : ''} />
            <span>{loadingTasks ? 'Refreshing Queue...' : 'Sync Tasks'}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default TieredHeaderCard;
