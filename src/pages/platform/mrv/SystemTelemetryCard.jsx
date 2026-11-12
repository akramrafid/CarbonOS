import React from 'react';

export function SystemTelemetryCard({ deviceConnected, mitigatedToday }) {
  return (
    <div className="bg-bg-canvas registry-border p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-sans font-bold text-2xl text-registry flex items-center">
          <span className="pulse-dot mr-3"></span>
          System Telemetry
        </h2>
        <span className="font-mono text-[10px] text-emerald bg-emerald/10 px-2 py-1 rounded">
          SYSTEM: NOMINAL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-bg-canvas border border-emerald/10 rounded-lg flex justify-between items-center">
          <div>
            <div className="font-mono text-[10px] text-mist mb-2">ACTIVE IOT NODES</div>
            <div className="font-mono text-xl text-registry font-bold">
              {deviceConnected ? '12,409' : '12,408'}
            </div>
          </div>
          {deviceConnected && (
            <span className="text-[8px] font-mono text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded animate-pulse">
              +1 BLYNK LIVE
            </span>
          )}
        </div>

        <div className="p-4 bg-bg-canvas border border-emerald/10 rounded-lg">
          <div className="font-mono text-[10px] text-mist mb-2">LAST SATELLITE PASS</div>
          <div className="font-mono text-xl text-registry font-bold">14 mins ago</div>
        </div>

        <div className="p-4 bg-bg-canvas border border-emerald/10 rounded-lg flex justify-between items-center">
          <div>
            <div className="font-mono text-[10px] text-mist mb-2">tCO2e MITIGATED TODAY</div>
            <div className="font-mono text-xl text-emerald font-bold">
              {deviceConnected ? mitigatedToday.toFixed(4) : '450.2000'}
            </div>
          </div>
          {deviceConnected && (
            <span className="text-[8px] font-mono text-emerald bg-emerald/10 border border-emerald/20 px-2 py-0.5 rounded animate-pulse">
              LIVE MEASURING
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemTelemetryCard;
