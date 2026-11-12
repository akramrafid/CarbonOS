import React from 'react';
import { MapPin, Copy, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/ui/IconButton';

export function SpatialBoundaryCard({
  isLight,
  currentJob,
  res,
  stratum,
  copyToClipboard
}) {
  return (
    <Card className={`rounded-2xl p-5 border transition-all ${
      isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
        <div className="flex items-center space-x-2">
          <MapPin size={15} className="text-emerald" />
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            1. Project Identification & Geographic Boundary
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
          isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
        }`}>
          VM0047 Sec 4
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5 text-xs">
        <div>
          <span className={`block text-[11px] font-medium ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Project Name
          </span>
          <span className={`font-bold text-sm mt-0.5 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {currentJob?.project_name}
          </span>
        </div>
        <div>
          <span className={`block text-[11px] font-medium ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Job Identifier
          </span>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="font-mono font-bold text-xs text-emerald truncate">
              {currentJob?.id}
            </span>
            <IconButton
              icon={<Copy size={11} />}
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(currentJob?.id, 'Job ID')}
              title="Copy Job ID"
              aria-label="Copy Job Identifier"
            />
          </div>
        </div>
        <div>
          <span className={`block text-[11px] font-medium ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Forest Stratum
          </span>
          <span className={`font-bold mt-0.5 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {stratum}
          </span>
        </div>
        <div>
          <span className={`block text-[11px] font-medium ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Monitored Area
          </span>
          <span className={`font-mono font-bold tabular-nums mt-0.5 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {(res?.forest_area_ha || 3800.5).toLocaleString()} ha
          </span>
        </div>
        <div>
          <span className={`block text-[11px] font-medium ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Monitoring Window
          </span>
          <span className={`font-mono tabular-nums text-xs mt-0.5 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            {currentJob?.start_date} → {currentJob?.end_date}
          </span>
        </div>
        <div>
          <span className={`block text-[11px] font-medium ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Jurisdiction Authority
          </span>
          <span className={`font-semibold mt-0.5 block text-xs ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            Not authorized by any regulator
          </span>
        </div>
      </div>
    </Card>
  );
}

export default SpatialBoundaryCard;
