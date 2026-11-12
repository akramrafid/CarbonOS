import React from 'react';
import { Activity } from 'lucide-react';

export const TelemetryChart = ({ history, metricType }) => {
  const data = [...history].reverse(); // oldest first for left-to-right plot

  if (data.length < 2) {
    return (
      <div className="h-[180px] flex flex-col items-center justify-center border border-dashed border-emerald/10 rounded-xl bg-[#040A06]/80 p-4">
        <Activity className="w-8 h-8 text-emerald/30 animate-pulse mb-2" />
        <span className="text-xs text-mist/40 font-mono">Waiting for additional telemetry logs...</span>
      </div>
    );
  }

  const values = data.map((item) => {
    if (metricType === 'co2') return item.co2;
    if (metricType === 'air') return item.air_quality;
    if (metricType === 'temp') return item.temperature;
    return item.humidity;
  });

  const maxValue = Math.max(
    ...values,
    metricType === 'co2' ? 1200 : metricType === 'air' ? 120 : metricType === 'temp' ? 35 : 85
  );
  const minValue = Math.min(
    ...values,
    metricType === 'co2' ? 300 : metricType === 'air' ? 20 : metricType === 'temp' ? 15 : 40
  );
  const valueRange = maxValue - minValue || 1;

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
      time: new Date(item.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  });

  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${
    points[0].x
  } ${paddingTop + chartHeight} Z`;

  let strokeColor = '#10b981';
  let fillGradientId = 'grad-emerald-mrv';

  if (metricType === 'co2') {
    strokeColor = '#f59e0b';
    fillGradientId = 'grad-amber-mrv';
  } else if (metricType === 'temp') {
    strokeColor = '#06b6d4';
    fillGradientId = 'grad-cyan-mrv';
  } else if (metricType === 'hum') {
    strokeColor = '#3b82f6';
    fillGradientId = 'grad-blue-mrv';
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
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-amber-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-cyan-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-blue-mrv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
          </linearGradient>

          <filter id="glow-mrv" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={width - paddingRight}
          y2={paddingTop}
          stroke="rgba(255,255,255,0.03)"
          strokeDasharray="3"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight / 2}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight / 2}
          stroke="rgba(255,255,255,0.03)"
          strokeDasharray="3"
        />
        <line
          x1={paddingLeft}
          y1={paddingTop + chartHeight}
          x2={width - paddingRight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255,255,255,0.06)"
        />

        <text
          x={paddingLeft - 8}
          y={paddingTop + 3}
          fill="rgba(255,255,255,0.4)"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="end"
        >
          {formatVal(maxValue)}
        </text>
        <text
          x={paddingLeft - 8}
          y={paddingTop + chartHeight / 2 + 3}
          fill="rgba(255,255,255,0.25)"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="end"
        >
          {formatVal((maxValue + minValue) / 2)}
        </text>
        <text
          x={paddingLeft - 8}
          y={paddingTop + chartHeight + 3}
          fill="rgba(255,255,255,0.4)"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="end"
        >
          {formatVal(minValue)}
        </text>

        <text
          x={paddingLeft}
          y={height - 8}
          fill="rgba(255,255,255,0.3)"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="start"
        >
          {points[0].time}
        </text>
        <text
          x={width - paddingRight}
          y={height - 8}
          fill="rgba(255,255,255,0.3)"
          fontSize="7"
          fontFamily="monospace"
          textAnchor="end"
        >
          {points[points.length - 1].time}
        </text>

        <path d={areaPath} fill={`url(#${fillGradientId})`} />
        <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="1.5" filter="url(#glow-mrv)" />

        {points.map((p, idx) => {
          const isKeyPoint =
            idx === 0 || idx === points.length - 1 || idx === Math.floor(points.length / 2);
          if (!isKeyPoint && points.length > 12) return null;
          return (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="#080F0B"
              stroke={strokeColor}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
};

export default TelemetryChart;
