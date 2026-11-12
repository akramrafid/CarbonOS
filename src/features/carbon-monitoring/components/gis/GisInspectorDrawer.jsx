import React from 'react';
import { Eye, MapPin, Database } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

export function GisInspectorDrawer(props) {
  const {
    isLight,
    inspectedPixel,
    storedLocations = [],
    setStoredLocations,
    selectedJob,
    setSelectedJob,
    analysisHistory = [],
    setMapBounds,
    getJobBounds
  } = props;

  return (
    <>
      {/* Interactive Pixel Query Results (Appears on Map Click) */}
      <div
        className={`border rounded-3xl p-6 relative overflow-hidden transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}
      >
        <h3
          className={`font-bold text-sm mb-4 uppercase tracking-wider flex items-center space-x-2 ${
            isLight ? 'text-fg-primary' : 'text-mist'
          }`}
        >
          <Eye size={18} className="text-emerald" />
          <span>Pixel Level Inspector & Location Resolver</span>
        </h3>

        {inspectedPixel ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-2xl border ${
                isLight ? 'bg-accent-muted border-border-subtle' : 'bg-emerald/10 border-emerald/20'
              }`}
            >
              <div className="flex items-center space-x-2 text-emerald mb-1 font-bold text-xs uppercase tracking-wider">
                <MapPin size={16} />
                <span>Resolved Location Name</span>
              </div>
              <p className={`text-sm font-bold leading-relaxed ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                {inspectedPixel.name}
              </p>
              <p className={`text-[11px] mt-1 font-mono ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                {inspectedPixel.region} • <span className="text-emerald font-bold">{inspectedPixel.forestType}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>Target Coordinates</span>
                <span className={`text-xs font-mono font-bold mt-1 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {inspectedPixel.lat}, {inspectedPixel.lng}
                </span>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>NDVI Value</span>
                <span className="text-sm font-bold text-emerald mt-1 block">
                  {inspectedPixel.ndvi}
                </span>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>Estimated Biomass</span>
                <span className={`text-sm font-bold mt-1 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {inspectedPixel.biomass} Mg/ha
                </span>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>Estimated Carbon</span>
                <span className={`text-sm font-bold mt-1 block ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {inspectedPixel.carbon} tC/ha
                </span>
              </div>
              <div className={`p-4 rounded-xl border ${isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/5'}`}>
                <span className={`text-[10px] block ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>Model Confidence</span>
                <span className="text-sm font-bold text-emerald mt-1 block">
                  {inspectedPixel.confidence}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`text-center py-6 border border-dashed rounded-2xl text-xs ${
              isLight ? 'border-border-subtle text-fg-secondary' : 'border-white/5 text-mist'
            }`}
          >
            Click anywhere on the map to query specific coordinate metrics and reverse-geocode location name in Bangladesh.
          </div>
        )}
      </div>

      {/* Stored Bangladesh Coordinates Registry */}
      <div
        className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database size={18} className="text-emerald" />
            <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-fg-primary' : 'text-mist'}`}>
              Stored Coordinates Registry
            </h3>
          </div>
          {storedLocations.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setStoredLocations([]);
                localStorage.removeItem('carbonzero_stored_locations');
              }}
              className="text-[10px] font-bold"
            >
              Clear Registry
            </Button>
          )}
        </div>

        {storedLocations.length > 0 ? (
          <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr
                  className={`border-b text-[10px] uppercase font-bold ${
                    isLight ? 'border-border-subtle text-fg-secondary' : 'border-white/10 text-mist'
                  }`}
                >
                  <th className="pb-2">Coordinates</th>
                  <th className="pb-2">Location Name</th>
                  <th className="pb-2">Carbon Density</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y text-xs ${
                  isLight ? 'divide-[#E2E8F0] text-fg-primary' : 'divide-white/5 text-registry'
                }`}
              >
                {storedLocations.map((loc, idx) => (
                  <tr
                    key={idx}
                    className={`${isLight ? 'hover:bg-bg-canvas' : 'hover:bg-white/5'} transition-colors`}
                  >
                    <td className="py-2.5 font-mono text-[11px] text-emerald font-bold">
                      {loc.lat}, {loc.lng}
                    </td>
                    <td className="py-2.5 max-w-[280px] truncate font-medium" title={loc.name}>
                      {loc.name}
                    </td>
                    <td className="py-2.5">
                      <span className="bg-emerald/10 text-emerald text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {loc.carbon} tC/ha
                      </span>
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono text-[10px] ${
                        isLight ? 'text-fg-secondary' : 'text-mist'
                      }`}
                    >
                      {loc.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            className={`text-center py-6 border border-dashed rounded-2xl text-xs ${
              isLight ? 'border-border-subtle text-fg-secondary' : 'border-white/5 text-mist'
            }`}
          >
            No coordinates stored yet. Click anywhere on the map to add locations to this registry.
          </div>
        )}
      </div>

      {/* Time slider timeline */}
      <div
        className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div>
            <h3 className={`font-bold text-sm uppercase tracking-wider ${isLight ? 'text-fg-primary' : 'text-mist'}`}>
              Historical Imagery Timeline
            </h3>
            <p className={`text-[11px] mt-0.5 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Toggle satellite analysis runs across date epochs
            </p>
          </div>
          <span className="text-xs font-mono bg-emerald/10 text-emerald px-3 py-1 rounded-full mt-2 md:mt-0 font-bold">
            {selectedJob ? selectedJob.start_date : 'No analysis selected'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(0, analysisHistory.length - 1)}
          value={
            analysisHistory.findIndex((h) => h.id === selectedJob?.id) !== -1
              ? analysisHistory.findIndex((h) => h.id === selectedJob?.id)
              : 0
          }
          onChange={(e) => {
            const job = analysisHistory[parseInt(e.target.value)];
            if (job && setSelectedJob) {
              setSelectedJob(job);
              if (getJobBounds && setMapBounds) {
                setMapBounds(getJobBounds(job));
              }
            }
          }}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald ${
            isLight ? 'bg-slate-300' : 'bg-white/10'
          }`}
          disabled={analysisHistory.length <= 1}
        />
        <div
          className={`flex justify-between text-[10px] mt-2 font-mono ${
            isLight ? 'text-fg-secondary' : 'text-mist'
          }`}
        >
          <span>{analysisHistory[analysisHistory.length - 1]?.start_date || 'Past'}</span>
          <span>{analysisHistory[0]?.start_date || 'Present'}</span>
        </div>
      </div>
    </>
  );
}

export default GisInspectorDrawer;
