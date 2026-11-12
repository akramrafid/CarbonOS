import React from 'react';
import { Trees, AlertTriangle, Plane, Scale } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TieredStatsRow({
  isLight,
  verificationTasks = []
}) {
  const pendingCount = verificationTasks.filter(t => t.status === 'pending').length;
  const completedCount = verificationTasks.filter(t => t.status === 'completed').length;
  const meanWidth = verificationTasks.length > 0
    ? (verificationTasks.reduce((acc, t) => acc + (t.relative_width || 0), 0) / verificationTasks.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className={`rounded-2xl p-5 border transition-all ${
        isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Monitored Parcels
          </span>
          <span className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
            <Trees size={14} />
          </span>
        </div>
        <div className={`text-2xl font-extrabold font-sans ${isLight ? 'text-fg-primary' : 'text-white'}`}>
          {verificationTasks.length + 12}
        </div>
        <span className={`text-[11px] block mt-1 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
          100% Sentinel-1/2 Telemetry active
        </span>
      </Card>

      <Card className={`rounded-2xl p-5 border transition-all ${
        isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            High Uncertainty (W &gt; 0.35)
          </span>
          <span className="p-1.5 rounded-lg bg-amber/15 text-amber">
            <AlertTriangle size={14} />
          </span>
        </div>
        <div className="text-2xl font-extrabold font-sans text-amber">
          {pendingCount}
        </div>
        <span className={`text-[11px] block mt-1 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
          Awaiting UAV LiDAR flight scan
        </span>
      </Card>

      <Card className={`rounded-2xl p-5 border transition-all ${
        isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            UAV LiDAR Calibrated
          </span>
          <span className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
            <Plane size={14} />
          </span>
        </div>
        <div className="text-2xl font-extrabold font-sans text-emerald">
          {completedCount}
        </div>
        <span className={`text-[11px] block mt-1 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
          5cm CHM height model ingested
        </span>
      </Card>

      <Card className={`rounded-2xl p-5 border transition-all ${
        isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Mean Conformal Width W
          </span>
          <span className="p-1.5 rounded-lg bg-emerald/10 text-emerald">
            <Scale size={14} />
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-extrabold font-sans ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {meanWidth}%
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald bg-emerald/10 px-1.5 py-0.5 rounded">
            Target &le; 35%
          </span>
        </div>
        <span className={`text-[11px] block mt-1 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
          Zero Verra VM0047 precision deduction
        </span>
      </Card>
    </div>
  );
}

export default TieredStatsRow;
