import React from 'react';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export function AssetHealthAlertsCard({ trendsLoading, hasAlerts, allAlerts }) {
  return (
    <div className="bg-[#080F0B] registry-border p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse mr-3"></span>
          <h2 className="font-sans font-bold text-2xl text-white">Carbon Asset Health Alerts</h2>
        </div>
        <span className="flex items-center text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20">
          TIER B (PERENNIALS)
        </span>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
        {trendsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
          </div>
        ) : !hasAlerts ? (
          <div className="text-xs text-gray-500 font-mono text-center py-12 border border-gray-800/40 rounded-xl bg-[#040A06]/50">
            NO TIER B DIAGNOSIS DATA YET
          </div>
        ) : (
          allAlerts.map((t, i) => {
            if (t.isBlynk) {
              const isCritical = t.risk_percentage > 80;
              return (
                <div
                  key={`blynk-alert-${i}`}
                  className={`p-4 border rounded-xl flex items-start transition-all ${
                    isCritical
                      ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${
                      isCritical ? 'text-red-400' : 'text-orange-400'
                    }`}
                  />
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <div
                        className={`text-sm font-semibold tracking-wide ${
                          isCritical ? 'text-red-400' : 'text-orange-400'
                        }`}
                      >
                        {t.region.toUpperCase()}: {t.risk_type === 'offline' ? 'OFFLINE' : 'WARNING'}
                      </div>
                      <div className="text-xs font-mono text-white font-semibold">
                        {t.risk_percentage}% Threat
                      </div>
                    </div>
                    <div className="text-xs text-mist/95 font-sans mt-1.5 leading-relaxed">
                      {t.message}
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono mt-2">
                      Source: Live Hardware Feed • Verification Status:{' '}
                      {t.risk_type === 'offline' ? 'FAILED' : 'FLAGGED'}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={i}
                className={`p-4 border rounded-xl flex items-start transition-all ${
                  t.risk_percentage > 20
                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/30'
                    : t.risk_percentage > 0
                    ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/30'
                    : 'bg-emerald/5 border-emerald/20 hover:border-emerald/30'
                }`}
              >
                {t.risk_percentage > 0 ? (
                  <AlertTriangle
                    className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${
                      t.risk_percentage > 20 ? 'text-red-400' : 'text-orange-400'
                    }`}
                  />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald mr-3 shrink-0 mt-0.5" />
                )}
                <div className="w-full">
                  <div className="flex justify-between items-center">
                    <div
                      className={`text-sm font-semibold tracking-wide ${
                        t.risk_percentage > 20
                          ? 'text-red-200'
                          : t.risk_percentage > 0
                          ? 'text-orange-200'
                          : 'text-emerald'
                      }`}
                    >
                      Region: {t.region.toUpperCase()}
                    </div>
                    <div className="text-xs font-mono text-white font-semibold">
                      {t.risk_percentage}% At Risk
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Total Tier B scans: {t.total_diagnoses} | At risk: {t.at_risk_count}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AssetHealthAlertsCard;
