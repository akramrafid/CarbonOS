import React from 'react';
import { TrendingUp } from 'lucide-react';
import { TELEMETRY_QUARTERS } from '../../constants';
import BiomassChartSvg from './BiomassChartSvg';
import { Tabs } from '../../../../components/ui/Tabs';

export function BiomassHorizonChart({
  isLight,
  selectedMetric,
  setSelectedMetric,
  selectedHorizon,
  setSelectedHorizon,
  hoveredQuarter,
  setHoveredQuarter
}) {
  const displayed = TELEMETRY_QUARTERS.filter((q, idx) => {
    if (selectedHorizon === '1y') return idx >= 6;
    if (selectedHorizon === 'historical') return idx <= 5;
    return true;
  });

  const metricConfig = {
    ndvi: {
      title: 'Canopy Photosynthesis Index (NDVI)',
      maxVal: 1.0,
      primaryKey: 'ndvi',
      baselineKey: 'baseline',
      unit: '',
      format: (v) => v.toFixed(3),
      gridSteps: [1.0, 0.75, 0.5, 0.25, 0.0]
    },
    biomass: {
      title: 'Above-Ground Biomass Density',
      maxVal: 300,
      primaryKey: 'biomass',
      baselineKey: 'baselineBiomass',
      unit: 'Mg/ha',
      format: (v) => `${v.toFixed(1)} Mg/ha`,
      gridSteps: [300, 225, 150, 75, 0]
    },
    carbon: {
      title: 'Organic Carbon Stock per Hectare',
      maxVal: 150,
      primaryKey: 'carbon',
      baselineKey: 'baselineCarbon',
      unit: 'tC/ha',
      format: (v) => `${v.toFixed(1)} tC/ha`,
      gridSteps: [150, 112.5, 75, 37.5, 0]
    }
  }[selectedMetric];

  const chartW = 960;
  const chartH = 260;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 40;
  const plotW = chartW - padLeft - padRight;
  const plotH = chartH - padTop - padBottom;

  const n = displayed.length;
  const colWidth = Math.min(54, Math.max(26, (plotW / n) * 0.54));

  const points = displayed.map((q, i) => {
    const x = padLeft + (i + 0.5) * (plotW / n);
    const val = q[metricConfig.primaryKey];
    const baseVal = q[metricConfig.baselineKey];
    const yVal = padTop + plotH - (val / metricConfig.maxVal) * plotH;
    const yBase = padTop + plotH - (baseVal / metricConfig.maxVal) * plotH;
    const barH = (val / metricConfig.maxVal) * plotH;
    return { q, x, val, baseVal, yVal, yBase, barH };
  });

  const baselinePathString = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yBase}`).join(' ');

  return (
    <div
      className={`col-span-1 md:col-span-2 lg:col-span-4 rounded-3xl p-6 md:p-8 border transition-all ${
        isLight
          ? 'bg-white border-border-subtle shadow-xs'
          : 'bg-bg-elevated border-border-subtle'
      }`}
    >
      {/* Chart Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <div
              className={`p-1.5 rounded-lg border ${
                isLight
                  ? 'bg-accent-muted text-accent border-border-subtle'
                  : 'bg-emerald/10 text-emerald border-emerald/20'
              }`}
            >
              <TrendingUp size={18} />
            </div>
            <h3
              className={`font-extrabold text-lg md:text-xl font-sans tracking-tight ${
                isLight ? 'text-fg-primary' : 'text-white'
              }`}
            >
              Forest Health & Carbon Accumulation Trends
            </h3>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                isLight
                  ? 'bg-bg-canvas text-fg-secondary border-border-subtle'
                  : 'bg-bg-canvas text-fg-secondary border-border-subtle'
              }`}
            >
              Multi-Temporal SAR + S2
            </span>
          </div>
          <p className={`text-xs ${isLight ? 'text-fg-secondary' : 'text-fg-secondary'}`}>
            Quarterly canopy telemetry against modelled pre-project baselines.
          </p>
        </div>

        {/* Chart Controls: Metric & Horizon Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            size="sm"
            tabs={[
              { id: 'ndvi', label: 'NDVI Index' },
              { id: 'biomass', label: 'Biomass (Mg/ha)' },
              { id: 'carbon', label: 'Carbon Stock (tC/ha)' }
            ]}
            activeTab={selectedMetric}
            onChange={setSelectedMetric}
          />

          <Tabs
            size="sm"
            tabs={[
              { id: 'all', label: 'All (10Q)' },
              { id: '1y', label: '1 Year' },
              { id: 'historical', label: 'Historical' }
            ]}
            activeTab={selectedHorizon}
            onChange={setSelectedHorizon}
          />
        </div>
      </div>

      {/* Interactive SVG Surface */}
      <BiomassChartSvg
        isLight={isLight}
        chartW={chartW}
        chartH={chartH}
        padLeft={padLeft}
        padRight={padRight}
        padTop={padTop}
        padBottom={padBottom}
        plotH={plotH}
        colWidth={colWidth}
        metricConfig={metricConfig}
        points={points}
        baselinePathString={baselinePathString}
        selectedMetric={selectedMetric}
        hoveredQuarter={hoveredQuarter}
        setHoveredQuarter={setHoveredQuarter}
      />

      {/* Chart Footer Legend & Real-time Metrics Strip */}
      <div
        className={`mt-6 pt-5 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs ${
          isLight ? 'border-border-subtle' : 'border-border-subtle'
        }`}
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-xs shrink-0 ${isLight ? 'bg-accent' : 'bg-accent'}`}></span>
            <span className={`font-semibold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Active Measured Telemetry ({metricConfig.title})
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-500"></span>
            <span className={`font-semibold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Modelled Baseline Trajectory (Pre-Project Level)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
              isLight
                ? 'bg-accent-muted text-accent border-border-subtle'
                : 'bg-emerald/10 text-emerald border-emerald/20'
            }`}
          >
            Net Delta: +18.4% YoY
          </span>
          <span
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold border ${
              isLight
                ? 'bg-bg-canvas text-fg-secondary border-border-subtle'
                : 'bg-bg-canvas text-fg-secondary border-border-subtle'
            }`}
          >
            Reserve: 18.5%
          </span>
        </div>
      </div>
    </div>
  );
}

export default BiomassHorizonChart;
