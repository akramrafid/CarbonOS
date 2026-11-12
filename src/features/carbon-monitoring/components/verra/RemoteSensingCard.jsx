import React from 'react';
import { Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function RemoteSensingCard({ isLight }) {
  return (
    <Card className={`rounded-2xl p-5 border transition-all ${
      isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
    }`}>
      <div className="flex items-center justify-between pb-3 border-b border-inherit mb-3.5">
        <div className="flex items-center space-x-2">
          <Layers size={15} className="text-emerald" />
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            5. Earth Observation & Multi-Sensor Calibrations
          </h3>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
          isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/10 text-mist'
        }`}>
          Copernicus + NASA
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-start justify-between pb-1.5 border-b border-inherit">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Sentinel-2 MSI (Level-2A)
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              10m multispectral bands (B2, B3, B4, B8, B11, B12), sen2cor cloud mask
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">10m Res</span>
        </div>
        <div className="flex items-start justify-between pb-1.5 border-b border-inherit">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              NASA GEDI Spaceborne LiDAR (L4A)
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Full-waveform LiDAR canopy height and above-ground biomass density (AGBD)
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">25m Footprint</span>
        </div>
        <div className="flex items-start justify-between pb-1.5 border-b border-inherit">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              ALOS PALSAR-2 L-band SAR
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Dual-polarization (HV / HH) cloud-penetrating synthetic aperture radar
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">25m Mosaics</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <span className={`font-bold block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              SRTM 1-Arc-Second Global DEM
            </span>
            <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              30m topographic elevation, aspect, and slope radiometry correction
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald px-1.5 py-0.5 rounded bg-emerald/10">30m DEM</span>
        </div>
      </div>
    </Card>
  );
}

export default RemoteSensingCard;
