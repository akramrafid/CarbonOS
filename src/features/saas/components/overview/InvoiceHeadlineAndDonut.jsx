import React from 'react';
import { TrendingDown, PieChart, Activity, Lightbulb, Plus } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Tabs } from '../../../../components/ui/Tabs';
import { CarbonDistributionDonut } from '../../constants';

export const InvoiceHeadlineAndDonut = ({
  isLight,
  activeMatrix = { categories: [], topImpactCategories: [] },
  unitMode = 'tonnes',
  setUnitMode,
  setIsAddCustomModalOpen,
  donutHoveredId,
  setDonutHoveredId
}) => {
  return (
    <div className="space-y-6">
      {/* EXECUTIVE HEADLINE METRICS CARD */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Left: Total Footprint Readout */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`font-mono text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-fg-muted' : 'text-mist'
                }`}>
                Total Invoiced Carbon Footprint
              </span>
              <Badge variant="emerald" size="sm">
                <TrendingDown className="w-3 h-3 mr-1 inline text-emerald" />
                {Math.abs(activeMatrix.trendVsLastMonth || 8.4)}% vs last month
              </Badge>
            </div>
            <div className="flex items-baseline space-x-3">
              <div className={`font-sans font-extrabold text-3xl sm:text-4xl tracking-tight tabular-nums ${isLight ? 'text-fg-primary' : 'text-white'
                }`}>
                {unitMode === 'tonnes'
                  ? `${activeMatrix.totalFootprintTonnes?.toLocaleString() || 0}`
                  : `${activeMatrix.totalFootprintKg?.toLocaleString() || 0}`
                }
              </div>
              <div className="font-mono text-base font-bold text-emerald">
                {unitMode === 'tonnes' ? 'tCO₂e' : 'kg CO₂e'}
              </div>
            </div>
            <div className={`text-xs ${isLight ? 'text-mist' : 'text-mist'}`}>
              Calculated from {activeMatrix.categories?.filter(c => c.carbonKg > 0).length || 0} active corporate emission categories • estimate, not assured
            </div>
          </div>

          {/* Right: Quick Stats & Unit Mode Toggle */}
          <div className="flex flex-wrap items-center gap-4">
            <div className={`px-4 py-2.5 rounded-xl border text-left ${isLight ? 'bg-white border-carbon-border' : 'bg-bg-elevated border-border-subtle'
              }`}>
              <div className="text-[10px] uppercase font-mono font-bold text-mist">
                Invoiced Spend
              </div>
              <div className={`text-sm font-bold font-mono tabular-nums ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                ৳ {activeMatrix.totalSpendBdt?.toLocaleString() || 0} <span className="text-[10px] font-normal text-mist">BDT</span>
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-xl border text-left ${isLight ? 'bg-white border-carbon-border' : 'bg-bg-elevated border-border-subtle'
              }`}>
              <div className="text-[10px] uppercase font-mono font-bold text-mist">
                Carbon Intensity
              </div>
              <div className="text-sm font-bold font-mono text-emerald">
                {activeMatrix.totalSpendBdt > 0
                  ? ((activeMatrix.totalFootprintKg / activeMatrix.totalSpendBdt) * 1000).toFixed(2)
                  : "0.00"
                } <span className="text-[10px] font-normal text-mist">kg/৳1k</span>
              </div>
            </div>

            {/* Unit Toggle Buttons */}
            <Tabs
              tabs={[
                { id: 'kg', label: 'kg CO₂e' },
                { id: 'tonnes', label: 'Tonnes (t)' }
              ]}
              activeTab={unitMode}
              onChange={setUnitMode}
              size="sm"
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddCustomModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Custom Item
            </Button>
          </div>
        </div>
      </Card>

      {/* Visual Category Distribution (Donut) & Top Impact Categories (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Donut Chart */}
        <Card className="lg:col-span-6 p-5 flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center border-b pb-3 mb-2 border-inherit">
            <div className="flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-emerald" />
              <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${isLight ? 'text-fg-primary' : 'text-white'
                }`}>
                Emission Distribution by Category
              </h4>
            </div>
            <span className="text-[10px] font-mono text-mist">
              Hover slices for breakdown
            </span>
          </div>

          <CarbonDistributionDonut
            categories={activeMatrix.categories}
            totalKg={activeMatrix.totalFootprintKg}
            totalTonnes={activeMatrix.totalFootprintTonnes}
            unitMode={unitMode}
            hoveredId={donutHoveredId}
            onHover={setDonutHoveredId}
            isLight={isLight}
          />
        </Card>

        {/* Right Column: Top Impact Categories & Decarbonization AI Tip */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-inherit">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald" />
                <h4 className={`text-xs font-bold uppercase font-mono tracking-wider ${isLight ? 'text-fg-primary' : 'text-white'
                  }`}>
                  Top Impact Drivers
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald font-bold">
                Prioritized by Magnitude
              </span>
            </div>

            <div className="space-y-2.5">
              {(activeMatrix.topImpactCategories || []).map(top => (
                <div
                  key={top.id}
                  className={`p-3 rounded-xl border transition-all ${isLight
                      ? 'bg-bg-muted border-carbon-border hover:border-emerald'
                      : 'bg-bg-elevated border-border-subtle hover:border-emerald/40'
                    }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm"
                        style={{ backgroundColor: top.color }}
                      >
                        {top.rank}
                      </span>
                      <span className={`text-xs font-bold ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                        {top.name}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-emerald tabular-nums">
                        {unitMode === 'tonnes' ? `${top.carbonTonnes} t` : `${top.carbonKg.toLocaleString()} kg`}
                      </span>
                      <span className="ml-2 text-[10px] font-bold text-mist">
                        ({top.percentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200/40 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${top.percentage}%`,
                        backgroundColor: top.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Decarbonization Recommendation Card */}
          <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${isLight ? 'bg-emerald-50/60 border-emerald/30' : 'bg-bg-surface border-border-subtle'
            }`}>
            <div className="p-2 rounded-xl shrink-0 bg-emerald/15 text-emerald">
              <Lightbulb className="w-4 h-4 text-emerald" />
            </div>
            <div className="space-y-1">
              <div className={`text-xs font-bold font-sans ${isLight ? 'text-fg-primary' : 'text-white'}`}>
                AI Decarbonization Action Plan
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-fg-secondary' : 'text-emerald-200'}`}>
                {activeMatrix.quickTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeadlineAndDonut;
