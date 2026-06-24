import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  Database, 
  RefreshCw,
  Download
} from 'lucide-react';

// Custom SVG Chart component for Telemetry History
const TelemetryChart = ({ history, metricType }) => {
  const data = [...history].reverse(); // oldest first for left-to-right plot
  
  if (data.length < 2) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center border border-dashed border-emerald/10 rounded-xl bg-[#040A06]/80 p-4">
        <Activity className="w-8 h-8 text-emerald/30 animate-pulse mb-2" />
        <span className="text-xs text-mist/40 font-mono">Waiting for additional telemetry logs...</span>
      </div>
    );
  }

  const values = data.map(item => {
    if (metricType === 'co2') return item.co2;
    if (metricType === 'air') return item.air_quality;
    if (metricType === 'temp') return item.temperature;
    return item.humidity;
  });

  const maxValue = Math.max(...values, metricType === 'co2' ? 1200 : metricType === 'air' ? 120 : metricType === 'temp' ? 35 : 85);
  const minValue = Math.min(...values, metricType === 'co2' ? 300 : metricType === 'air' ? 20 : metricType === 'temp' ? 15 : 40);
  const valueRange = (maxValue - minValue) || 1;

  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((item, idx) => {
    const val = values[idx];
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minValue) / valueRange) * chartHeight;
    return { 
      x, 
      y, 
      value: val, 
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  let strokeColor = "#10b981"; // emerald
  let fillGradientId = "grad-emerald-mrv";
  
  if (metricType === 'co2') {
    strokeColor = "#f59e0b"; // amber
    fillGradientId = "grad-amber-mrv";
  } else if (metricType === 'temp') {
    strokeColor = "#06b6d4"; // cyan
    fillGradientId = "grad-cyan-mrv";
  } else if (metricType === 'hum') {
    strokeColor = "#3b82f6"; // blue
    fillGradientId = "grad-blue-mrv";
  }

  const formatVal = (v) => {
    if (metricType === 'co2') return `${v.toFixed(0)} ppm`;
    if (metricType === 'air') return `${v.toFixed(0)}`;
    if (metricType === 'temp') return `${v.toFixed(1)}°C`;
    return `${v.toFixed(1)}%`;
  };

  return (
    <div className="w-full relative">
      <svg className="w-full h-auto overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="grad-emerald-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
          </linearGradient>
          <linearGradient id="grad-amber-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0"/>
          </linearGradient>
          <linearGradient id="grad-cyan-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0"/>
          </linearGradient>
          <linearGradient id="grad-blue-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
          </linearGradient>
          
          <filter id="glow-mrv" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Gridlines */}
        <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
        <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
        <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="rgba(255,255,255,0.06)" />

        {/* Y Axis Labels */}
        <text x={paddingLeft - 8} y={paddingTop + 3} fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace" textAnchor="end">{formatVal(maxValue)}</text>
        <text x={paddingLeft - 8} y={paddingTop + chartHeight / 2 + 3} fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace" textAnchor="end">{formatVal((maxValue + minValue) / 2)}</text>
        <text x={paddingLeft - 8} y={paddingTop + chartHeight + 3} fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace" textAnchor="end">{formatVal(minValue)}</text>

        {/* X Axis Labels */}
        <text x={paddingLeft} y={height - 8} fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace" textAnchor="start">{points[0].time}</text>
        <text x={width - paddingRight} y={height - 8} fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace" textAnchor="end">{points[points.length - 1].time}</text>

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${fillGradientId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" filter="url(#glow-mrv)" />

        {/* Highlight start/mid/end dots */}
        {points.map((p, idx) => {
          const isKeyPoint = idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2);
          if (!isKeyPoint && points.length > 12) return null;
          return (
            <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#080F0B" stroke={strokeColor} strokeWidth="1.5" />
          );
        })}
      </svg>
    </div>
  );
};

const MRVDashboard = () => {
  const BLYNK_TOKEN = "wwKSjCxjjeox9NoiH1hkiet359mok4Wf";

  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // Blynk Telemetry State
  const [metrics, setMetrics] = useState({
    temp: null,
    hum: null,
    air: null,
    co2: null
  });
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [telemetryLoading, setTelemetryLoading] = useState(true);
  const [blynkError, setBlynkError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [mitigatedToday, setMitigatedToday] = useState(450.2);
  
  // Dashboard navigation/tabs
  const [chartMetric, setChartMetric] = useState('co2'); // 'co2' | 'air' | 'temp' | 'hum'
  const [leftTab, setLeftTab] = useState('sensor_logs'); // 'sensor_logs' | 'mock_stream'

  // Fetch crop diagnostic trends
  const fetchTrends = () => {
    fetch('http://localhost:8000/api/farmers-ai/api/mrv/carbon-health-trends/')
      .then(res => res.json())
      .then(data => {
        if (!data.error && Array.isArray(data)) {
          setTrends(data);
        }
        setTrendsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch trends", err);
        setTrendsLoading(false);
      });
  };

  // Fetch telemetry history from Django API
  const fetchTelemetryHistory = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/farmers-ai/api/mrv/telemetry/history/');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTelemetryHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch telemetry history from server:", err);
      // Fallback to localStorage
      const localHistory = localStorage.getItem('carbonos_telemetry_history');
      if (localHistory) {
        setTelemetryHistory(JSON.parse(localHistory));
      }
    } finally {
      setTelemetryLoading(false);
    }
  };

  // Save new telemetry to Django API and localStorage
  const saveTelemetry = async (temp, hum, air, co2) => {
    const timestampStr = new Date().toISOString();
    const newReading = {
      temperature: temp,
      humidity: hum,
      air_quality: air,
      co2: co2,
      timestamp: timestampStr
    };

    // Save to localStorage (as backup / fallback)
    let localHistory = [];
    const stored = localStorage.getItem('carbonos_telemetry_history');
    if (stored) {
      try {
        localHistory = JSON.parse(stored);
      } catch (e) {
        localHistory = [];
      }
    }
    // Keep last 50
    localHistory = [newReading, ...localHistory].slice(0, 50);
    localStorage.setItem('carbonos_telemetry_history', JSON.stringify(localHistory));

    // Save to Django Server
    try {
      const res = await fetch('http://localhost:8000/api/farmers-ai/api/mrv/telemetry/save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          temperature: temp,
          humidity: hum,
          air_quality: air,
          co2: co2
        })
      });
      if (res.ok) {
        // Refresh history from database
        fetchTelemetryHistory();
      } else {
        setTelemetryHistory(localHistory);
      }
    } catch (err) {
      console.error("Failed to save telemetry to server, using local fallback:", err);
      setTelemetryHistory(localHistory);
    }
  };

  // Fetch live Blynk data (checked with hardware connectivity)
  const fetchBlynkLive = async () => {
    try {
      // 1. Verify if device is connected
      const connRes = await fetch(`https://blynk.cloud/external/api/isHardwareConnected?token=${BLYNK_TOKEN}`);
      if (!connRes.ok) throw new Error('Failed to query hardware status');
      const connText = await connRes.text();
      const isConnected = connText.trim() === 'true';

      setDeviceConnected(isConnected);
      setLastSyncTime(new Date().toLocaleTimeString());

      if (!isConnected) {
        setBlynkError("Blynk device is offline.");
        // Set metrics to null to denote offline state
        setMetrics({ temp: null, hum: null, air: null, co2: null });
        return;
      }

      // 2. Fetch live metrics if connected
      const res = await fetch(`https://blynk.cloud/external/api/getAll?token=${BLYNK_TOKEN}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const temp = parseFloat(data.v0);
      const hum = parseFloat(data.v1);
      const air = parseInt(data.v2);
      const co2 = parseInt(data.v3);

      setMetrics({ temp, hum, air, co2 });
      setBlynkError(null);

      // Save to database only on successful read of connected device
      if (!isNaN(temp) && !isNaN(hum) && !isNaN(air) && !isNaN(co2)) {
        await saveTelemetry(temp, hum, air, co2);
      }
    } catch (err) {
      console.error("Error fetching Blynk data:", err);
      setBlynkError("Failed to sync with Blynk Cloud.");
    }
  };

  // Export history to CSV for Excel consumption
  const downloadExcel = () => {
    if (telemetryHistory.length === 0) return;
    
    const headers = ["Timestamp", "Temperature (°C)", "Humidity (%)", "Air Quality (raw)", "CO2 Level (ppm)"];
    const rows = telemetryHistory.map(item => [
      `"${new Date(item.timestamp).toLocaleString()}"`,
      item.temperature,
      item.humidity,
      item.air_quality,
      item.co2
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `carbon_telemetry_history_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchTrends();
    fetchTelemetryHistory();
    fetchBlynkLive();

    const interval = setInterval(fetchBlynkLive, 5000);
    return () => clearInterval(interval);
  }, []);

  // Accumulate tCO2e mitigated in real-time when Blynk node is online
  useEffect(() => {
    let timer;
    if (deviceConnected) {
      timer = setInterval(() => {
        setMitigatedToday(prev => prev + 0.00012);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [deviceConnected]);

  // Status computation for Air Quality
  const getAirStatus = (raw) => {
    if (raw === null || isNaN(raw)) return { text: "Waiting...", style: "text-mist bg-white/5 border-white/10", color: "text-mist" };
    if (raw <= 250) return { text: "GOOD", style: "text-emerald bg-emerald/10 border-emerald/20", color: "text-emerald" };
    if (raw <= 450) return { text: "MODERATE", style: "text-amber-400 bg-amber-400/10 border-amber-400/20", color: "text-amber-400" };
    return { text: "POOR", style: "text-rose-500 bg-rose-500/10 border-rose-500/20", color: "text-rose-500" };
  };

  // Status computation for CO2
  const getCO2Status = (raw) => {
    if (raw === null || isNaN(raw)) return { text: "Waiting...", style: "text-mist bg-white/5 border-white/10", color: "text-mist" };
    if (raw <= 5000) return { text: "EXCELLENT", style: "text-emerald bg-emerald/10 border-emerald/20", color: "text-emerald" };
    if (raw <= 10000) return { text: "FAIR", style: "text-amber-400 bg-amber-400/10 border-amber-400/20", color: "text-amber-400" };
    return { text: "HIGH", style: "text-rose-500 bg-rose-500/10 border-rose-500/20", color: "text-rose-500" };
  };

  // Compile dynamic alerts based on blynk sensor warnings
  const getBlynkAlerts = () => {
    const alerts = [];
    if (!deviceConnected) {
      alerts.push({
        region: "Blynk IoT Node",
        risk_percentage: 100,
        total_diagnoses: 1,
        at_risk_count: 1,
        risk_type: "offline",
        message: "Blynk IoT hardware node is offline. Real-time verification stream suspended.",
        isBlynk: true
      });
    } else {
      if (metrics.co2 !== null && metrics.co2 > 5000) {
        alerts.push({
          region: "Blynk IoT Node",
          risk_percentage: metrics.co2 > 10000 ? 95 : 65,
          total_diagnoses: 1,
          at_risk_count: 1,
          risk_type: "co2",
          message: `Critical CO2 Level: ${metrics.co2} ppm. Risk of elevated soil carbon respiration.`,
          isBlynk: true
        });
      }
      if (metrics.air !== null && metrics.air > 250) {
        alerts.push({
          region: "Blynk IoT Node",
          risk_percentage: metrics.air > 450 ? 90 : 50,
          total_diagnoses: 1,
          at_risk_count: 1,
          risk_type: "air",
          message: `Poor Air Quality: ${metrics.air} raw. Potential forest fire smoke or pollution.`,
          isBlynk: true
        });
      }
      if (metrics.temp !== null && metrics.temp > 35) {
        alerts.push({
          region: "Blynk IoT Node",
          risk_percentage: metrics.temp > 40 ? 80 : 40,
          total_diagnoses: 1,
          at_risk_count: 1,
          risk_type: "heat",
          message: `Extreme Heat Stress: ${metrics.temp.toFixed(1)}°C. High risk of perennial crop dehydration.`,
          isBlynk: true
        });
      }
    }
    return alerts;
  };

  const airStatus = deviceConnected ? getAirStatus(metrics.air) : { text: "OFFLINE", style: "text-rose-400 bg-rose-500/10 border-rose-500/20", color: "text-rose-400" };
  const co2Status = deviceConnected ? getCO2Status(metrics.co2) : { text: "OFFLINE", style: "text-rose-400 bg-rose-500/10 border-rose-500/20", color: "text-rose-400" };

  const blynkAlerts = getBlynkAlerts();
  const allAlerts = [...blynkAlerts, ...trends];
  const hasAlerts = allAlerts.length > 0;

  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      
      {/* Header section */}
      <div className="w-full bg-[#040A06] border-b border-emerald/10 py-16 px-6 lg:px-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00C85311_1px,transparent_1px),linear-gradient(to_bottom,#00C85311_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        <span className="font-mono text-xs text-emerald tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/20 rounded-full mb-6 inline-block z-10">PLATFORM</span>
        <h1 className="serif-drama text-[56px] lg:text-[72px] text-white leading-tight mb-4 z-10">MRV Dashboard</h1>
        <p className="font-sans text-lg text-mist max-w-2xl z-10">Real-time Measurement, Reporting, and Verification data feeds.</p>
      </div>

      <div className="max-w-5xl w-full mx-auto px-6 lg:px-12 mt-16 relative z-10 space-y-8">
        
        {/* Core System Telemetry Card */}
        <div className="bg-[#080F0B] registry-border p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans font-bold text-2xl text-registry flex items-center">
              <span className="pulse-dot mr-3"></span>
              System Telemetry
            </h2>
            <span className="font-mono text-[10px] text-emerald bg-emerald/10 px-2 py-1 rounded">SYSTEM: NOMINAL</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg flex justify-between items-center">
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
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg">
              <div className="font-mono text-[10px] text-mist mb-2">LAST SATELLITE PASS</div>
              <div className="font-mono text-xl text-registry font-bold">14 mins ago</div>
            </div>
            <div className="p-4 bg-[#040A06] border border-emerald/10 rounded-lg flex justify-between items-center">
              <div>
                <div className="font-mono text-[10px] text-mist mb-2">tCO2e MITIGATED TODAY</div>
                <div className="font-mono text-xl text-emerald font-bold">
                  {deviceConnected ? mitigatedToday.toFixed(4) : "450.2000"}
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

        {/* ESP8266 Carbon Monitor live feeds */}
        <div className="bg-[#080F0B] registry-border p-8 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)]">
          
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
              <button 
                onClick={downloadExcel}
                disabled={telemetryHistory.length === 0}
                className="flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] text-emerald bg-[#0D2B1A] border border-emerald/30 rounded hover:bg-emerald/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Download History to Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Excel</span>
              </button>
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
                <span className="text-[10px] font-mono text-mist/40">
                  Synced: {lastSyncTime}
                </span>
              )}
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Temp */}
            <div className="p-5 bg-[#040A06] border border-emerald/10 rounded-xl relative group overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">Temperature</span>
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline mb-1">
                <span className="font-mono text-3xl font-bold text-cyan-400">
                  {deviceConnected && metrics.temp !== null ? metrics.temp.toFixed(1) : "--"}
                </span>
                <span className="font-mono text-xs text-mist/60 ml-0.5">°C</span>
              </div>
              <div className="text-[9px] text-mist/40 font-mono">Live DHT Sensor</div>
            </div>

            {/* Hum */}
            <div className="p-5 bg-[#040A06] border border-emerald/10 rounded-xl relative group overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">Humidity</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-baseline mb-1">
                <span className="font-mono text-3xl font-bold text-cyan-400">
                  {deviceConnected && metrics.hum !== null ? metrics.hum.toFixed(1) : "--"}
                </span>
                <span className="font-mono text-xs text-mist/60 ml-0.5">%</span>
              </div>
              <div className="text-[9px] text-mist/40 font-mono">Relative density</div>
            </div>

            {/* Air Quality */}
            <div className={`p-5 bg-[#040A06] border rounded-xl relative group overflow-hidden transition-all duration-500 ${metrics.air !== null && deviceConnected ? 'border-emerald/15' : 'border-emerald/10'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">Air Quality</span>
                <Wind className={`w-3.5 h-3.5 ${airStatus.color}`} />
              </div>
              <div className="flex items-baseline mb-1">
                <span className="font-mono text-3xl font-bold text-amber font-sans">
                  {deviceConnected && metrics.air !== null ? metrics.air : "--"}
                </span>
                <span className="font-mono text-[8px] text-mist/40 ml-0.5">raw</span>
              </div>
              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${airStatus.style}`}>
                {airStatus.text}
              </span>
            </div>

            {/* CO2 */}
            <div className={`p-5 bg-[#040A06] border rounded-xl relative group overflow-hidden transition-all duration-500 ${metrics.co2 !== null && deviceConnected ? 'border-emerald/15' : 'border-emerald/10'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-[9px] text-mist/50 uppercase tracking-wider">CO2 Level</span>
                <Activity className={`w-3.5 h-3.5 ${co2Status.color}`} />
              </div>
              <div className="flex items-baseline mb-1">
                <span className="font-mono text-3xl font-bold text-amber font-sans">
                  {deviceConnected && metrics.co2 !== null ? metrics.co2 : "--"}
                </span>
                <span className="font-mono text-[8px] text-mist/40 ml-0.5">ppm</span>
              </div>
              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${co2Status.style}`}>
                {co2Status.text}
              </span>
            </div>
          </div>

          {/* Historical Trends Visualized */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Area */}
            <div className="lg:col-span-2 p-6 bg-[#040A06] border border-emerald/10 rounded-2xl flex flex-col justify-between h-[420px]">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                <span className="text-xs font-mono font-bold text-white tracking-wider flex items-center">
                  <Activity className="w-4 h-4 text-emerald mr-1.5 animate-pulse" />
                  HISTORICAL TREND ANALYSES
                </span>
                <div className="flex bg-[#080F0B] p-0.5 rounded-lg border border-emerald/10 font-mono text-[8px]">
                  <button 
                    onClick={() => setChartMetric('co2')}
                    className={`px-2 py-1 rounded transition-colors ${chartMetric === 'co2' ? 'bg-[#0D2B1A] text-emerald font-bold' : 'text-mist/60 hover:text-white'}`}
                  >
                    CO2
                  </button>
                  <button 
                    onClick={() => setChartMetric('air')}
                    className={`px-2 py-1 rounded transition-colors ${chartMetric === 'air' ? 'bg-[#0D2B1A] text-emerald font-bold' : 'text-mist/60 hover:text-white'}`}
                  >
                    AQI
                  </button>
                  <button 
                    onClick={() => setChartMetric('temp')}
                    className={`px-2 py-1 rounded transition-colors ${chartMetric === 'temp' ? 'bg-[#0D2B1A] text-emerald font-bold' : 'text-mist/60 hover:text-white'}`}
                  >
                    TEMP
                  </button>
                  <button 
                    onClick={() => setChartMetric('hum')}
                    className={`px-2 py-1 rounded transition-colors ${chartMetric === 'hum' ? 'bg-[#0D2B1A] text-emerald font-bold' : 'text-mist/60 hover:text-white'}`}
                  >
                    HUM
                  </button>
                </div>
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
            <div className="p-6 bg-[#040A06] border border-emerald/10 rounded-2xl flex flex-col justify-between h-[420px]">
              <div className="flex justify-between items-center border-b border-emerald/10 pb-3 mb-3">
                <span className="text-xs font-mono font-bold text-amber tracking-wider">
                  &gt;&gt; LOG STREAM
                </span>
                <div className="flex bg-[#080F0B] p-0.5 rounded border border-emerald/10 font-mono text-[8px]">
                  <button 
                    onClick={() => setLeftTab('sensor_logs')}
                    className={`px-2 py-0.5 rounded ${leftTab === 'sensor_logs' ? 'bg-amber/10 text-amber font-bold' : 'text-mist/40'}`}
                  >
                    SENSOR
                  </button>
                  <button 
                    onClick={() => setLeftTab('mock_stream')}
                    className={`px-2 py-0.5 rounded ${leftTab === 'mock_stream' ? 'bg-amber/10 text-amber font-bold' : 'text-mist/40'}`}
                  >
                    SIM
                  </button>
                </div>
              </div>

              {leftTab === 'sensor_logs' ? (
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[9px] text-mist/70 select-none scrollbar-thin max-h-[320px]">
                  {telemetryLoading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-4 h-4 animate-spin text-amber" /></div>
                  ) : telemetryHistory.length === 0 ? (
                    <div className="text-center text-mist/30 mt-8">NO TELEMETRY RECORDED YET</div>
                  ) : (
                    telemetryHistory.map((item, idx) => {
                      const time = new Date(item.timestamp).toLocaleTimeString();
                      return (
                        <div key={item.id || idx} className="hover:text-white transition-colors border-b border-white/5 pb-1">
                          <span className="text-emerald/70">[{time}]</span> ESP: CO2={item.co2} AQI={item.air_quality} T={item.temperature}°C H={item.humidity}%
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

        {/* Farmer's AI Carbon Asset Alerts */}
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
                      <AlertTriangle className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${isCritical ? 'text-red-400' : 'text-orange-400'}`} />
                      <div className="w-full">
                        <div className="flex justify-between items-center">
                          <div className={`text-sm font-semibold tracking-wide ${isCritical ? 'text-red-400' : 'text-orange-400'}`}>
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
                          Source: Live Hardware Feed • Verification Status: {t.risk_type === 'offline' ? 'FAILED' : 'FLAGGED'}
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
                      <AlertTriangle className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${t.risk_percentage > 20 ? 'text-red-400' : 'text-orange-400'}`} />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald mr-3 shrink-0 mt-0.5" />
                    )}
                    <div className="w-full">
                      <div className="flex justify-between items-center">
                        <div className={`text-sm font-semibold tracking-wide ${t.risk_percentage > 20 ? 'text-red-200' : t.risk_percentage > 0 ? 'text-orange-200' : 'text-emerald'}`}>
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

      </div>
    </div>
  );
};

export default MRVDashboard;
