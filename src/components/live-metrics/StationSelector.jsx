import React from 'react';
import { MapPin, Cpu } from 'lucide-react';
import { STATIONS } from './liveMetricsData';

export const StationSelector = ({ activeStation, onStationChange, lastUpdated }) => {
  return (
    <>
      {/* Station Navigation Selector Bar */}
      <div className="mb-8 p-1.5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl flex flex-wrap gap-1.5">
        {STATIONS.map((station) => {
          const isActive = activeStation.id === station.id;
          return (
            <button
              key={station.id}
              onClick={() => onStationChange(station)}
              className={`flex-1 min-w-[200px] px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-950/80 to-emerald-900/40 border border-emerald-500/40 shadow-lg text-white' 
                  : 'bg-transparent hover:bg-white/[0.04] text-white/60 hover:text-white border border-transparent'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans font-semibold text-xs tracking-tight">{station.name}</span>
                  {station.isLiveFeed && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE IoT
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-white/40 truncate max-w-[210px] mt-0.5">
                  {station.location.split('(')[0]}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' : 'bg-white/20'}`} />
            </button>
          );
        })}
      </div>

      {/* Selected Station Meta Bar */}
      <div className="mb-8 px-5 py-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-white/60">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-white/90">
            <MapPin size={13} className="text-emerald-400" />
            <span>{activeStation.location}</span>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5">
            <Cpu size={13} className="text-cyan-400" />
            <span>{activeStation.hardware}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-emerald-400 font-semibold">
            {activeStation.protocol}
          </span>
          {lastUpdated && (
            <span className="text-white/40">
              Synced at: <span className="text-white/80">{lastUpdated}</span>
            </span>
          )}
        </div>
      </div>
    </>
  );
};
