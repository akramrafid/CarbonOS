import React from 'react';
import { Info, MoreHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { IconButton } from '../../../../components/ui/IconButton';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { SemiCircularGauge, MicroBarChart, CarouselIndicator, SegmentedProgressBar } from '../../constants';

export const DeepTelemetryRow = ({
  isLight,
  activeClient = {},
  esgMetrics = {},
  results = {},
  inputs = {},
  setIsEsgAuditModalOpen,
  executeRagQuery
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Carbon Overview */}
      <Card className="flex flex-col justify-between p-6">
        <div className="flex items-center justify-between pb-3">
          <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
            Carbon Target Progress
          </h3>
          <IconButton
            icon={<Info className="w-4 h-4 text-emerald" />}
            aria-label="Inspect carbon target methodology"
            title="Inspect carbon target methodology"
            onClick={() => setIsEsgAuditModalOpen(true)}
            variant="ghost"
            size="sm"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-2">
          <SemiCircularGauge 
            score={Math.min(100, Math.max(30, Math.round(((activeClient.activeInsets || 0) / (results.total || 1)) * 100 + 48)))} 
            max={100} 
            label={`${Math.min(100, Math.max(30, Math.round(((activeClient.activeInsets || 0) / (results.total || 1)) * 100 + 48)))}%`} 
            sublabel="target progress" 
            isLight={isLight} 
          />
          
          <div className="mt-3 text-center">
            <div className={`font-sans font-extrabold text-2xl tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              {results.total} <span className="text-xs font-mono font-normal text-emerald">tCO2e</span>
              {results.scope2Missing && <span className="block text-[10px] font-mono font-normal text-amber-500">excl. Scope 2 (grid-average factor needed)</span>}
            </div>
            <div className="flex items-center justify-center space-x-4 text-[10px] font-mono text-mist mt-1">
              <span>S1: {results.scope1} t</span>
              <span>•</span>
              <span>S2: {results.scope2Missing ? '—' : `${results.scope2} t`}</span>
              <span>•</span>
              <span>S3: {results.scope3} t</span>
            </div>
          </div>
        </div>

        <div className={`mt-3 p-2.5 rounded-2xl border text-center text-xs font-sans font-semibold flex items-center justify-center space-x-2 ${
          isLight ? 'bg-[#F7FAF7] border-carbon-border text-[#0F2417]' : 'bg-[#040906] border-[#152B1D] text-white'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span>Intensity: {esgMetrics.actualIntensity} t/FTE (Target: {esgMetrics.benchmarkIntensity})</span>
        </div>
      </Card>

      {/* Card 2: New ESG Data */}
      <Card className="flex flex-col justify-between p-6">
        <div className="flex items-center justify-between pb-2">
          <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
            Active Telemetry Data
          </h3>
          <IconButton
            icon={<MoreHorizontal className="w-4 h-4" />}
            aria-label="More telemetry options"
            title="More telemetry options"
            variant="ghost"
            size="sm"
          />
        </div>

        <div>
          <div className="flex items-baseline space-x-2.5">
            <span className={`font-sans font-black text-3xl lg:text-4xl tracking-tight tabular-nums ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              {((activeClient.facilities?.length || 1) * 1280 + (parseInt(inputs.employees) || 100) * 12 + Math.round((results.total || 100) * 2)).toLocaleString()}
            </span>
            <Badge variant="emerald" size="sm">
              +{Math.round((parseInt(inputs.employees) || 100) * 4 + 480).toLocaleString()} this month
            </Badge>
          </div>
          <p className={`text-[11px] font-sans mt-1 ${isLight ? 'text-[#557361]' : 'text-mist'}`}>
            Telemetry data points synced from smart meters across {activeClient.facilities?.length || 1} facilities
          </p>
        </div>

        <div className="py-2">
          <MicroBarChart isLight={isLight} />
        </div>

        <div className="pt-2 flex justify-center">
          <CarouselIndicator isLight={isLight} />
        </div>
      </Card>

      {/* Card 3: ESG Analyzer */}
      <Card className="flex flex-col justify-between p-6">
        <div className="flex items-center justify-between pb-2">
          <h3 className={`font-sans font-bold text-sm tracking-tight ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
            ESG Analyzer
          </h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => executeRagQuery("Summarize our ESG score readiness against CSRD and Bangladesh ECR standards.")}
            icon={<Sparkles className="w-3 h-3 text-emerald" />}
          >
            Run AI
          </Button>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald" />
            <p className={`text-xs font-sans font-semibold ${isLight ? 'text-[#0F2417]' : 'text-white'}`}>
              Your ESG score is <span className="text-emerald font-bold">{esgMetrics.totalScore}%</span>
            </p>
          </div>
          <p className={`text-[11px] font-sans mt-1 leading-relaxed ${isLight ? 'text-[#557361]' : 'text-mist'}`}>
            This score is classified as <strong className={isLight ? 'text-[#0B4D26]' : 'text-emerald'}>{esgMetrics.tier}</strong> under {activeClient.reportingStandard || 'GHG Protocol Standard'}.
          </p>
        </div>

        <div className="py-2 space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-mist">
            <span>Score: {esgMetrics.totalScore} / 100</span>
            <span className="text-emerald font-bold">{esgMetrics.activeCapsulesCount} / 24 Capsules Active</span>
          </div>
          <SegmentedProgressBar totalBars={24} activeBars={esgMetrics.activeCapsulesCount} isLight={isLight} />
        </div>

        <div className={`pt-3 border-t text-[10px] font-mono flex items-center justify-between ${
          isLight ? 'border-carbon-border text-[#557361]' : 'border-[#122418] text-mist'
        }`}>
          <Button 
            type="button"
            variant="link"
            size="sm"
            onClick={() => setIsEsgAuditModalOpen(true)}
            leftIcon={<Info className="w-3.5 h-3.5 text-emerald" />}
            className="text-xs"
          >
            Inspect ESG Methodology & Audit Justification &rarr;
          </Button>
          <span className="text-emerald font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{esgMetrics.activeCapsulesCount}/24 Active</span>
          </span>
        </div>
      </Card>
    </div>
  );
};

export default DeepTelemetryRow;
