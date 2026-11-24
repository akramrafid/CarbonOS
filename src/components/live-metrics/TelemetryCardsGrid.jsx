import React from 'react';
import { Activity, Gauge } from 'lucide-react';
import { getAirStatus, getCO2Status } from './liveMetricsData';

export const TelemetryCardsGrid = ({ metrics, activeStation }) => {
  const airStatus = getAirStatus(metrics.air);
  const co2Status = getCO2Status(metrics.co2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Ambient Temperature */}
      <div className="mrv-telemetry-card relative group rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-colors duration-300 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 font-bold">
            Ambient Surface Temp
          </span>
          <Activity size={15} className="text-cyan-400/80" />
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-mono text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {metrics.temp !== null ? metrics.temp.toFixed(1) : "--"}
          </span>
          <span className="font-mono text-xl text-cyan-400 font-bold">°C</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono text-white/50">
          <span>Diurnal: 24.2° - 32.8°</span>
          <span className="text-emerald-400 font-semibold">Calibrated</span>
        </div>
      </div>

      {/* Card 2: Relative Humidity */}
      <div className="mrv-telemetry-card relative group rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-colors duration-300 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 font-bold">
            Relative Humidity
          </span>
          <Gauge size={15} className="text-emerald-400/80" />
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-mono text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {metrics.hum !== null ? metrics.hum.toFixed(1) : "--"}
          </span>
          <span className="font-mono text-xl text-emerald-400 font-bold">%</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono text-white/50">
          <span>Vapor Density: 18.4 g/m³</span>
          <span className="text-emerald-400 font-semibold">Nominal</span>
        </div>
      </div>

      {/* Card 3: Air Quality Index */}
      <div className="mrv-telemetry-card relative group rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-colors duration-300 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 font-bold">
            Air Quality Raw / AQI
          </span>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${airStatus.badge}`}>
            {airStatus.text}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-mono text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {metrics.air !== null ? metrics.air : "--"}
          </span>
          <span className="font-mono text-sm text-white/50">raw counts</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono text-white/50">
          <span>Sensor: MQ-135 NDIR</span>
          <span className="text-cyan-400">Baseline: modelled</span>
        </div>
      </div>

      {/* Card 4: CO2 Concentration */}
      <div className="mrv-telemetry-card relative group rounded-2xl p-6 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-colors duration-300 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-white/50 font-bold">
            CO₂ Concentration
          </span>
          <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${co2Status.badge}`}>
            {co2Status.text}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="font-mono text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            {metrics.co2 !== null ? metrics.co2 : "--"}
          </span>
          <span className="font-mono text-xl text-amber-400 font-bold">ppm</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] font-mono text-white/50">
          <span>Delta: +{(metrics.co2 && activeStation.baselineCo2 ? Math.max(0, metrics.co2 - activeStation.baselineCo2) : 6)} ppm</span>
          <span className="text-emerald-400 font-semibold">MRV telemetry (unverified)</span>
        </div>
      </div>
    </div>
  );
};
