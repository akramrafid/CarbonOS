import React from 'react';
import { Leaf, Info, Users, Sparkles, ShieldCheck, TrendingDown } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { IconButton } from '../../../../components/ui/IconButton';
import { Badge } from '../../../../components/ui/Badge';
import { SemiCircularGauge, EmissionsTrendChart } from '../../constants';

export const ExecutiveShowcaseRow = ({
  isLight,
  activeClient = {},
  esgMetrics = {},
  results = {},
  inputs = {},
  setIsEsgAuditModalOpen
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Card 1: Impact Overview (Pills + Radial Gauge) */}
      <Card className="lg:col-span-5 flex flex-col justify-between p-6 lg:p-7">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald/15 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald" />
            </div>
            <h3 className={`font-sans font-bold text-base tracking-tight ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Impact Overview
            </h3>
          </div>
          <IconButton
            icon={<Info className="w-4 h-4 text-emerald" />}
            aria-label="Inspect ESG calculation methodology"
            title="Inspect ESG calculation methodology"
            onClick={() => setIsEsgAuditModalOpen(true)}
            variant="ghost"
            size="sm"
          />
        </div>

        {/* Content: Left Stacked Pills + Right SemiCircular Gauge */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center py-2">
          {/* Left Column: 3 Tactile Metric Pills */}
          <div className="sm:col-span-7 space-y-2.5">
            {/* Metric 1 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              isLight ? 'bg-bg-muted border-carbon-border' : 'bg-bg-canvas border-border-subtle'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
                  Emissions Abated & Inset
                </span>
                <Badge variant="emerald" size="sm">
                  +{esgMetrics.abatementRatio}%
                </Badge>
              </div>
              <div className="mt-1 flex items-baseline space-x-1.5 font-mono">
                <span className={`font-sans font-extrabold text-lg tracking-tight tabular-nums ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {Math.round(activeClient.activeInsets || (results.total * 0.18)).toLocaleString()}
                </span>
                <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                  tCO2e
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              isLight ? 'bg-bg-muted border-carbon-border' : 'bg-bg-canvas border-border-subtle'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
                  Facilities & Insets
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald" />
              </div>
              <div className="mt-1 flex items-baseline space-x-1.5 font-mono">
                <span className={`font-sans font-extrabold text-lg tracking-tight tabular-nums ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {(activeClient.facilities?.length || 1) + (activeClient.activeInsets ? 1 : 0)} Active
                </span>
                <span className={`text-[11px] font-sans ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                  sites & passports
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className={`p-3 rounded-2xl border transition-all ${
              isLight ? 'bg-bg-muted border-carbon-border' : 'bg-bg-canvas border-border-subtle'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-sans font-medium ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
                  Audited Workforce
                </span>
                <Users className={`w-3.5 h-3.5 ${isLight ? 'text-fg-secondary' : 'text-fg-muted'}`} />
              </div>
              <div className="mt-1 flex items-baseline space-x-1.5 font-mono">
                <span className={`font-sans font-extrabold text-lg tracking-tight tabular-nums ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                  {Number(inputs.employees || 0).toLocaleString()} FTE
                </span>
                <span className={`text-[11px] font-sans ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                  monitored
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Radial Arch Gauge with Real AI Rating */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center pt-2 sm:pt-0">
            <SemiCircularGauge 
              score={Math.round(esgMetrics.totalScore || 90)} 
              max={100} 
              label="Rating" 
              sublabel={`${esgMetrics.aiRating || 'AAA'} AI score`} 
              isLight={isLight} 
            />
            <div className="mt-3">
              <Badge variant="emerald" dot>
                <Sparkles className="w-3 h-3 mr-1 inline" />
                {esgMetrics.tier || 'Tier 1'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer Insight */}
        <div className={`pt-3 border-t text-[11px] font-sans flex items-center justify-between ${
          isLight ? 'border-carbon-border text-fg-muted' : 'border-border-subtle text-mist'
        }`}>
          <span className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
            <span>GHG Protocol Corporate Standard • ISO 14064-1</span>
          </span>
          <Badge variant="emerald" size="sm">AUDITED</Badge>
        </div>
      </Card>

      {/* Card 2: Emissions Trend (Wide Catmull-Rom Area Chart) */}
      <Card className="lg:col-span-7 flex flex-col justify-between p-6 lg:p-7">
        {/* Header with Title & Metric Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div>
            <h3 className={`font-sans font-bold text-base tracking-tight ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Emissions Trend
            </h3>
            <p className={`text-[11px] font-sans ${isLight ? 'text-fg-muted' : 'text-mist'}`}>
              12-Month Trajectory: {activeClient.name} ({activeClient.sector})
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="neutral" size="sm">Scope 1-3 Assured</Badge>
            <Badge variant="emerald" size="sm">
              <TrendingDown className="w-3 h-3 mr-1 inline text-emerald" />
              (-15%) targeted reduction glidepath
            </Badge>
          </div>
        </div>

        {/* Spline Area Chart */}
        <div className="py-2">
          <EmissionsTrendChart isLight={isLight} total={results.total || 2450} />
        </div>

        {/* Chart Legend & Telemetry Status */}
        <div className={`pt-3 border-t text-[11px] font-sans flex flex-wrap items-center justify-between gap-2 ${
          isLight ? 'border-carbon-border text-fg-muted' : 'border-border-subtle text-mist'
        }`}>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
              <span>Target Glidepath</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLight ? 'bg-slate-400' : 'bg-bg-surface'}`} />
              <span>Operational Actuals</span>
            </div>
          </div>
          <span className="font-mono text-[10px] text-mist">Standard: {activeClient.reportingStandard || 'ISO 14064-1'}</span>
        </div>
      </Card>
    </div>
  );
};

export default ExecutiveShowcaseRow;
