import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const AIDetection = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
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
            
            <div className="mt-8 bg-[#040A06] border border-red-500/20 p-6 rounded-xl">
              <div className="font-mono text-[11px] text-red-500 mb-4 border-b border-red-500/20 pb-2">&gt;&gt; FLAG REPORT: HIGH CONFIDENCE</div>
              <div className="flex flex-col space-y-3 font-mono text-xs text-mist">
                <div className="flex justify-between">
                  <span>PROJECT: BD-PIN-2025-0033</span>
                  <span className="text-red-400">DOUBLE COUNTING RISK</span>
                </div>
                <div className="text-[10px] text-mist/60 border-l-2 border-red-500 pl-3">
                  GIS Polygon intersects with BD-PIN-2025-0019 by 14%. Satellite imagery indicates no new tree cover.
                </div>
                <div className="self-end mt-2">
                  <Button variant="destructive" size="sm">
                    Escalate to Auditor
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
