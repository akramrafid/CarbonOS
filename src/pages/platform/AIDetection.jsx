import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const AIDetection = () => {
  const navigate = useNavigate();
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="AI Fraud Detection"
          description="Automated anomaly flagging using geospatial and telemetry data."
          badge={<Badge variant="emerald">PLATFORM</Badge>}
          align="center"
        />

        <Card variant="featured" className="p-8 md:p-12 mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-3"></span>
            Anomaly Scanner
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Our proprietary machine learning models continuously analyze MRV streams against satellite baselines to identify false claims or overlapping project boundaries in real-time.</p>
            
            <div className="mt-8 bg-bg-canvas border border-red-500/20 p-6 rounded-xl">
              <div className="font-mono text-[11px] text-red-500 mb-4 border-b border-red-500/20 pb-2">&gt;&gt; SAMPLE FLAG REPORT (ILLUSTRATIVE DEMO): HIGH CONFIDENCE</div>
              <div className="flex flex-col space-y-3 font-mono text-xs text-mist">
                <div className="flex justify-between">
                  <span>PROJECT: BD-PIN-2025-0033 (DEMO)</span>
                  <span className="text-red-400">DOUBLE COUNTING RISK</span>
                </div>
                <div className="text-[10px] text-mist/60 border-l-2 border-red-500 pl-3">
                  Illustrative scenario: GIS Polygon overlaps BD-PIN-2025-0019 by 14% with flat NDVI baseline.
                </div>
                <div className="self-end mt-2 flex flex-wrap gap-2">
                  {/* [COMMENTED OUT FOR PERSONAL REFERENCE — un-wired Escalate to Auditor mock CTA]
                  <Button variant="destructive" size="sm">Escalate to Auditor</Button>
                  */}
                  <Button variant="secondary" size="sm" className="min-h-[44px]" onClick={() => navigate('/carbon-monitoring')}>
                    Inspect in GIS Monitor →
                  </Button>
                </div>
              </div>
            </div>
            
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIDetection;
