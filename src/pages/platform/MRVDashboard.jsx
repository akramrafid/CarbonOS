import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import SystemTelemetryCard from './mrv/SystemTelemetryCard';
import IotStationCard from './mrv/IotStationCard';
import AssetHealthAlertsCard from './mrv/AssetHealthAlertsCard';

const DJANGO_API_URL = import.meta.env.VITE_DJANGO_API_URL || '';

const MRVDashboard = () => {
  const BLYNK_TOKEN = import.meta.env.VITE_BLYNK_AUTH_TOKEN || '';

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
  const [chartMetric, setChartMetric] = useState('co2');
  const [leftTab, setLeftTab] = useState('sensor_logs');

  const fetchTrends = () => {
    if (!DJANGO_API_URL) {
      setTrendsLoading(false);
      return;
    }
    fetch(`${DJANGO_API_URL}/api/farmers-ai/mrv/carbon-health-trends/`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error && Array.isArray(data)) {
          setTrends(data);
        }
        setTrendsLoading(false);
      })
      .catch(() => {
        setTrendsLoading(false);
      });
  };

  const fetchTelemetryHistory = async () => {
    if (!DJANGO_API_URL) {
      const localHistory = localStorage.getItem('carbonos_telemetry_history');
      if (localHistory) {
        try {
          setTelemetryHistory(JSON.parse(localHistory));
        } catch {
          setTelemetryHistory([]);
        }
      }
      setTelemetryLoading(false);
      return;
    }
    try {
      const res = await fetch(`${DJANGO_API_URL}/api/farmers-ai/mrv/telemetry/history/`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTelemetryHistory(data);
      }
    } catch {
      const localHistory = localStorage.getItem('carbonos_telemetry_history');
      if (localHistory) {
        try {
          setTelemetryHistory(JSON.parse(localHistory));
        } catch {
          setTelemetryHistory([]);
        }
      }
    } finally {
      setTelemetryLoading(false);
    }
  };

  const saveTelemetry = async (temp, hum, air, co2) => {
    const timestampStr = new Date().toISOString();
    const newReading = {
      temperature: temp,
      humidity: hum,
      air_quality: air,
      co2: co2,
      timestamp: timestampStr
    };

    let localHistory = [];
    const stored = localStorage.getItem('carbonos_telemetry_history');
    if (stored) {
      try {
        localHistory = JSON.parse(stored);
      } catch {
        localHistory = [];
      }
    }
    localHistory = [newReading, ...localHistory].slice(0, 50);
    localStorage.setItem('carbonos_telemetry_history', JSON.stringify(localHistory));

    if (!DJANGO_API_URL) {
      setTelemetryHistory(localHistory);
      return;
    }

    try {
      const res = await fetch(`${DJANGO_API_URL}/api/farmers-ai/mrv/telemetry/save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: temp,
          humidity: hum,
          air_quality: air,
          co2: co2
        })
      });
      if (res.ok) {
        fetchTelemetryHistory();
      } else {
        setTelemetryHistory(localHistory);
      }
    } catch {
      setTelemetryHistory(localHistory);
    }
  };

  const fetchBlynkLive = async () => {
    if (!BLYNK_TOKEN) {
      setDeviceConnected(false);
      setBlynkError('Blynk auth token not configured (Sandbox telemetry mode).');
      setMetrics({ temp: null, hum: null, air: null, co2: null });
      setTelemetryLoading(false);
      return;
    }
    try {
      const connRes = await fetch(
        `https://blynk.cloud/external/api/isHardwareConnected?token=${BLYNK_TOKEN}`
      );
      if (!connRes.ok) throw new Error('Failed to query hardware status');
      const connText = await connRes.text();
      const isConnected = connText.trim() === 'true';

      setDeviceConnected(isConnected);
      setLastSyncTime(new Date().toLocaleTimeString());

      if (!isConnected) {
        setBlynkError('Blynk device is offline.');
        setMetrics({ temp: null, hum: null, air: null, co2: null });
        return;
      }

      const res = await fetch(`https://blynk.cloud/external/api/getAll?token=${BLYNK_TOKEN}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const temp = parseFloat(data.v0);
      const hum = parseFloat(data.v1);
      const air = parseInt(data.v2);
      const co2 = parseInt(data.v3);

      setMetrics({ temp, hum, air, co2 });
      setBlynkError(null);

      if (!isNaN(temp) && !isNaN(hum) && !isNaN(air) && !isNaN(co2)) {
        await saveTelemetry(temp, hum, air, co2);
      }
    } catch {
      setBlynkError('Failed to sync with Blynk Cloud.');
    }
  };

  const downloadExcel = () => {
    if (telemetryHistory.length === 0) return;

    const headers = [
      'Timestamp',
      'Temperature (°C)',
      'Humidity (%)',
      'Air Quality (raw)',
      'CO2 Level (ppm)'
    ];
    const rows = telemetryHistory.map((item) => [
      `"${new Date(item.timestamp).toLocaleString()}"`,
      item.temperature,
      item.humidity,
      item.air_quality,
      item.co2
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `carbon_telemetry_history_${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchTrends();
    fetchTelemetryHistory();
    fetchBlynkLive();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchBlynkLive();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    if (deviceConnected) {
      timer = setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        setMitigatedToday((prev) => prev + 0.00012);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [deviceConnected]);

  const getAirStatus = (raw) => {
    if (raw === null || isNaN(raw))
      return { text: 'Waiting...', style: 'text-mist bg-white/5 border-white/10', color: 'text-mist' };
    if (raw <= 250)
      return { text: 'GOOD', style: 'text-emerald bg-emerald/10 border-emerald/20', color: 'text-emerald' };
    if (raw <= 450)
      return {
        text: 'MODERATE',
        style: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        color: 'text-amber-400'
      };
    return { text: 'POOR', style: 'text-rose-500 bg-rose-500/10 border-rose-500/20', color: 'text-rose-500' };
  };

  const getCO2Status = (raw) => {
    if (raw === null || isNaN(raw))
      return { text: 'Waiting...', style: 'text-mist bg-white/5 border-white/10', color: 'text-mist' };
    if (raw <= 5000)
      return {
        text: 'EXCELLENT',
        style: 'text-emerald bg-emerald/10 border-emerald/20',
        color: 'text-emerald'
      };
    if (raw <= 10000)
      return {
        text: 'FAIR',
        style: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        color: 'text-amber-400'
      };
    return { text: 'HIGH', style: 'text-rose-500 bg-rose-500/10 border-rose-500/20', color: 'text-rose-500' };
  };

  const getBlynkAlerts = () => {
    const alerts = [];
    if (!deviceConnected) {
      alerts.push({
        region: 'Blynk IoT Node',
        risk_percentage: 100,
        total_diagnoses: 1,
        at_risk_count: 1,
        risk_type: 'offline',
        message: 'Blynk IoT hardware node is offline. Real-time verification stream suspended.',
        isBlynk: true
      });
    } else {
      if (metrics.co2 !== null && metrics.co2 > 5000) {
        alerts.push({
          region: 'Blynk IoT Node',
          risk_percentage: metrics.co2 > 10000 ? 95 : 65,
          total_diagnoses: 1,
          at_risk_count: 1,
          risk_type: 'co2',
          message: `Critical CO2 Level: ${metrics.co2} ppm. Risk of elevated soil carbon respiration.`,
          isBlynk: true
        });
      }
      if (metrics.air !== null && metrics.air > 250) {
        alerts.push({
          region: 'Blynk IoT Node',
          risk_percentage: metrics.air > 450 ? 90 : 50,
          total_diagnoses: 1,
          at_risk_count: 1,
          risk_type: 'air',
          message: `Poor Air Quality: ${metrics.air} raw. Potential forest fire smoke or pollution.`,
          isBlynk: true
        });
      }
      if (metrics.temp !== null && metrics.temp > 35) {
        alerts.push({
          region: 'Blynk IoT Node',
          risk_percentage: metrics.temp > 40 ? 80 : 40,
          total_diagnoses: 1,
          at_risk_count: 1,
          risk_type: 'heat',
          message: `Extreme Heat Stress: ${metrics.temp.toFixed(
            1
          )}°C. High risk of perennial crop dehydration.`,
          isBlynk: true
        });
      }
    }
    return alerts;
  };

  const airStatus = deviceConnected
    ? getAirStatus(metrics.air)
    : {
        text: 'OFFLINE',
        style: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        color: 'text-rose-400'
      };
  const co2Status = deviceConnected
    ? getCO2Status(metrics.co2)
    : {
        text: 'OFFLINE',
        style: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
        color: 'text-rose-400'
      };

  const blynkAlerts = getBlynkAlerts();
  const allAlerts = [...blynkAlerts, ...trends];
  const hasAlerts = allAlerts.length > 0;

  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-5xl w-full mx-auto px-6 lg:px-12 relative z-10 space-y-8">
        <PageHeader
          title="MRV Dashboard"
          description="Real-time Measurement, Reporting, and Verification data feeds from IoT sensor stations and satellite telemetry."
          badge={<Badge variant="emerald">Live STAC & IoT</Badge>}
          breadcrumbs={[
            { label: 'Platform', path: '/platform/mrv-dashboard' },
            { label: 'MRV Telemetry', path: '/platform/mrv-dashboard' }
          ]}
        />

        {/* Core System Telemetry Card */}
        <SystemTelemetryCard
          deviceConnected={deviceConnected}
          mitigatedToday={mitigatedToday}
        />

        {/* ESP8266 Carbon Monitor live feeds */}
        <IotStationCard
          deviceConnected={deviceConnected}
          lastSyncTime={lastSyncTime}
          downloadExcel={downloadExcel}
          telemetryHistory={telemetryHistory}
          metrics={metrics}
          airStatus={airStatus}
          co2Status={co2Status}
          chartMetric={chartMetric}
          setChartMetric={setChartMetric}
          telemetryLoading={telemetryLoading}
          leftTab={leftTab}
          setLeftTab={setLeftTab}
        />

        {/* Farmer's AI Carbon Asset Alerts */}
        <AssetHealthAlertsCard
          trendsLoading={trendsLoading}
          hasAlerts={hasAlerts}
          allAlerts={allAlerts}
        />
      </div>
    </div>
  );
};

export default MRVDashboard;
