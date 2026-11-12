import React from 'react';
import {
  Database,
  Download,
  Thermometer,
  Droplets,
  Wind,
  Activity,
  Loader2
} from 'lucide-react';
import TelemetryChart from './TelemetryChart';
import Button from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';

export function IotStationCard({
  deviceConnected,
  lastSyncTime,
  downloadExcel,
  telemetryHistory,
  metrics,
  airStatus,
  co2Status,
  chartMetric,
  setChartMetric,
  telemetryLoading,
  leftTab,
  setLeftTab
}) {
  return (
    <div className="bg-bg-canvas registry-border p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="font-sans font-bold text-2xl text-registry flex items-center">
            <Database className="w-5 h-5 text-emerald mr-2" />
            Carbon Monitor IoT Station
          </h2>
          <p className="text-[11px] text-mist/60 font-mono mt-1">
            Sensor: ESP8266 Live Feed • Blynk Cloud Sync
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadExcel}
            disabled={telemetryHistory.length === 0}
            className="flex items-center gap-1.5"
            title="Download History to Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel</span>
          </Button>

          {!deviceConnected ? (
            <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              DISCONNECTED
            </span>
          ) : (
            <span className="text-[10px] font-mono text-emerald bg-emerald/10 px-3 py-1 rounded-full border border-emerald/20 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald mr-1.5 animate-ping"></span>
              CONNECTED
            </span>
          )}
          {lastSyncTime && (
            <span className="text-[10px] font-mono text-mist/40">Synced: {lastSyncTime}</span>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Temp */}
        <div className="p-5 bg-bg-canvas border border-emerald/10 rounded-xl relative group overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">Temperature</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline mb-1">
            <span className="font-mono text-3xl font-bold text-cyan-400">
              {deviceConnected && metrics.temp !== null ? metrics.temp.toFixed(1) : '--'}
            </span>
            <span className="font-mono text-xs text-mist/60 ml-0.5">°C</span>
          </div>
          <div className="text-[9px] text-mist/40 font-mono">Live DHT Sensor</div>
        </div>

        {/* Hum */}
        <div className="p-5 bg-bg-canvas border border-emerald/10 rounded-xl relative group overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">Humidity</span>
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline mb-1">
            <span className="font-mono text-3xl font-bold text-cyan-400">
              {deviceConnected && metrics.hum !== null ? metrics.hum.toFixed(1) : '--'}
            </span>
            <span className="font-mono text-xs text-mist/60 ml-0.5">%</span>
          </div>
          <div className="text-[9px] text-mist/40 font-mono">Relative density</div>
        </div>

        {/* Air Quality */}
        <div
          className={`p-5 bg-bg-canvas border rounded-xl relative group overflow-hidden transition-all duration-500 ${
            metrics.air !== null && deviceConnected ? 'border-emerald/15' : 'border-emerald/10'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">Air Quality</span>
            <Wind className={`w-3.5 h-3.5 ${airStatus.color}`} />
          </div>
          <div className="flex items-baseline mb-1">
            <span className="font-mono text-3xl font-bold text-amber font-sans">
              {deviceConnected && metrics.air !== null ? metrics.air : '--'}
            </span>
            <span className="font-mono text-[8px] text-mist/40 ml-0.5">raw</span>
          </div>
          <span
            className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${airStatus.style}`}
          >
            {airStatus.text}
          </span>
        </div>

        {/* CO2 */}
        <div
          className={`p-5 bg-bg-canvas border rounded-xl relative group overflow-hidden transition-all duration-500 ${
            metrics.co2 !== null && deviceConnected ? 'border-emerald/15' : 'border-emerald/10'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">CO2 Level</span>
            <Activity className={`w-3.5 h-3.5 ${co2Status.color}`} />
          </div>
          <div className="flex items-baseline mb-1">
            <span className="font-mono text-3xl font-bold text-amber font-sans">
              {deviceConnected && metrics.co2 !== null ? metrics.co2 : '--'}
            </span>
            <span className="font-mono text-[8px] text-mist/40 ml-0.5">ppm</span>
          </div>
          <span
            className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${co2Status.style}`}
          >
            {co2Status.text}
          </span>
        </div>
      </div>

      {/* Historical Trends Visualized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 p-6 bg-bg-canvas border border-emerald/10 rounded-2xl flex flex-col justify-between h-[420px]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <span className="text-xs font-mono font-bold text-white tracking-wider flex items-center">
              <Activity className="w-4 h-4 text-emerald mr-1.5 animate-pulse" />
              HISTORICAL TREND ANALYSES
            </span>
            <Tabs
              tabs={[
                { id: 'co2', label: 'CO2' },
                { id: 'air', label: 'AQI' },
                { id: 'temp', label: 'TEMP' },
                { id: 'hum', label: 'HUM' }
              ]}
              activeTab={chartMetric}
              onChange={setChartMetric}
              size="sm"
            />
          </div>

          <div className="flex-1 flex items-center justify-center">
            {telemetryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-emerald" />
            ) : (
              <TelemetryChart history={telemetryHistory} metricType={chartMetric} />
            )}
          </div>
        </div>

        {/* Log stream / Mock Stream Panel */}
        <div className="p-6 bg-bg-canvas border border-emerald/10 rounded-2xl flex flex-col justify-between h-[420px]">
          <div className="flex justify-between items-center border-b border-emerald/10 pb-3 mb-3">
            <span className="text-xs font-mono font-bold text-amber tracking-wider">&gt;&gt; LOG STREAM</span>
            <Tabs
              tabs={[
                { id: 'sensor_logs', label: 'SENSOR' },
                { id: 'mock_stream', label: 'SIM' }
              ]}
              activeTab={leftTab}
              onChange={setLeftTab}
              size="sm"
            />
          </div>

          {leftTab === 'sensor_logs' ? (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[9px] text-mist/70 select-none scrollbar-thin max-h-[320px]">
              {telemetryLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-4 h-4 animate-spin text-amber" />
                </div>
              ) : telemetryHistory.length === 0 ? (
                <div className="text-center text-mist/30 mt-8">NO TELEMETRY RECORDED YET</div>
              ) : (
                telemetryHistory.map((item, idx) => {
                  const time = new Date(item.timestamp).toLocaleTimeString();
                  return (
                    <div
                      key={item.id || idx}
                      className="hover:text-white transition-colors border-b border-white/5 pb-1"
                    >
                      <span className="text-emerald/70">[{time}]</span> ESP: CO2={item.co2} AQI=
                      {item.air_quality} T={item.temperature}°C H={item.humidity}%
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[10px] text-mist/70 scrollbar-thin max-h-[320px]">
              <div>[NODE-84A] Solar output matched expected baseline. (+2.1 tCO2e)</div>
              <div>[NODE-92C] Cookstove usage confirmed via thermal sensor. (+0.4 tCO2e)</div>
              <div>[SAT-GEO] Mangrove boundary scan complete. Zero deforestation detected.</div>
              <div className="text-emerald">[FARMER-AI] Diagnosis logged. field_id: 1102 (healthy)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IotStationCard;
