import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const APIDocs = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="API Documentation"
          description="Integrate IoT devices, retrieve registry data, and automate MRV via our RESTful APIs."
          badge={<Badge variant="emerald">COMPANY</Badge>}
          align="center"
        />

        <div className="bg-bg-canvas registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Developer Hub
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Our endpoints are secured via OAuth2.0. Contact the Carbon Zero BD admin team to provision your client keys.</p>
            
            <div className="mt-8 bg-bg-canvas border border-emerald/20 p-6 rounded-xl font-mono text-sm text-mist overflow-x-auto">
              <div className="text-emerald mb-2"># Post new telemetry data from an IoT node</div>
              <div className="text-registry mb-4">POST /api/v1/mrv/telemetry</div>
              <div className="text-mist/50 mb-2">Request Body:</div>
              <pre className="text-[11px] leading-relaxed">
{`{
  "node_id": "BD-NODE-994",
  "project_id": "BD-PIN-2025-0041",
  "timestamp": "2026-05-23T12:00:00Z",
  "metrics": {
    "kwh_generated": 45.2,
    "status": "active"
  },
  "signature": "0xabc123..."
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocs;
