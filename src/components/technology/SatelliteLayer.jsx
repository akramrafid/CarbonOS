import React from 'react';

const SatelliteLayer = () => {
  const satellites = [
    {
      name: "Google Earth Engine (Sentinel-2 + Landsat 8/9)",
      use: "Land use change detection, NDVI time series, forest cover monitoring",
      resolution: "10m (Sentinel-2) / 30m (Landsat)",
      revisit: "5 days",
      integration: "Direct GEE Python API + Earth Engine JS API",
      status: "Live",
      logoText: "GEE"
    },
    {
      name: "NASA GEDI (Global Ecosystem Dynamics)",
      use: "Above-ground biomass estimation via LiDAR — precise for mangrove & forest credits",
      resolution: "25m footprint",
      revisit: "Non-sun-synchronous, ~8 days",
      integration: "NASA Earthdata API",
      status: "Integrated",
      logoText: "NASA"
    },
    {
      name: "ESA Copernicus Climate Change Service",
      use: "Historical climate baselines, reference period temp/precip",
      resolution: "0.1° grid",
      revisit: "Daily",
      integration: "CDS API (cdsapi library)",
      status: "Planned",
      logoText: "ESA"
    },
    {
      name: "Planet Labs (PlanetScope)",
      use: "3m daily imagery for high-frequency crop monitoring",
      resolution: "3m",
      revisit: "Daily",
      integration: "Planet API (commercial tier)",
      status: "Phase 2",
      logoText: "PLANET"
    }
  ];

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex space-x-6 min-w-max">
        {satellites.map((sat, idx) => (
          <div key={idx} className="w-80 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm flex flex-col shrink-0">
            <div className="h-32 bg-slate-900 relative p-4 flex flex-col justify-between">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <div className="relative z-10 flex justify-between items-start">
                <div className="font-mono font-bold text-white tracking-widest">{sat.logoText}</div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                  sat.status === 'Live' ? 'bg-[#16A34A] text-white' : 
                  sat.status === 'Integrated' ? 'bg-[#0A5C36] text-white' : 
                  'bg-white/20 text-white backdrop-blur-sm'
                }`}>
                  {sat.status}
                </span>
              </div>
              <h3 className="relative z-10 text-white font-bold text-lg leading-tight mt-auto">{sat.name}</h3>
            </div>
            
            <div className="p-5 flex-1 flex flex-col space-y-4">
              <div>
                <p className="text-[10px] uppercase font-semibold text-[#475569] mb-1">Primary Use</p>
                <p className="text-sm text-[#0F172A]">{sat.use}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0] mt-auto">
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#475569] mb-1">Resolution</p>
                  <p className="text-xs font-mono text-[#0A5C36]">{sat.resolution}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-[#475569] mb-1">Revisit</p>
                  <p className="text-xs font-mono text-[#0A5C36]">{sat.revisit}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-[#E2E8F0]">
                <p className="text-[10px] uppercase font-semibold text-[#475569] mb-1">Integration</p>
                <p className="text-xs font-mono text-[#475569] bg-slate-100 p-2 rounded">{sat.integration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SatelliteLayer;
