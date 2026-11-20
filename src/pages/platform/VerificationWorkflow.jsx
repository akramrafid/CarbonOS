import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const VerificationWorkflow = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Verification Workflow"
          description="Accredited auditor portal for final issuance approvals."
          badge={<Badge variant="emerald">PLATFORM</Badge>}
          align="center"
        />

        <Card variant="featured" className="p-8 md:p-12 mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Auditor Tasks
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Third-party Verification and Validation Bodies (VVBs) use this portal to audit MRV data against project baselines before authorizing credit issuance.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <Card className="p-5 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[10px] text-mist mb-1">TASK ID: VVB-2025-881</div>
                  <div className="font-sans font-bold text-registry text-lg mb-2">Solar Risk Assessment</div>
                  <div className="font-sans text-xs text-mist mb-4">Cross-check inverter logs vs claimed MWh.</div>
                </div>
                <div>
                  <Button variant="ghost" size="sm" className="text-emerald hover:text-white p-0">
                    Start Audit →
                  </Button>
                </div>
              </Card>
              <Card className="p-5 flex flex-col justify-between">
                <div>
                  <div className="font-mono text-[10px] text-mist mb-1">TASK ID: VVB-2025-882</div>
                  <div className="font-sans font-bold text-registry text-lg mb-2">GIS Boundary Audit</div>
                  <div className="font-sans text-xs text-mist mb-4">Verify mangrove reforestation polygons.</div>
                </div>
                <div>
                  <Button variant="ghost" size="sm" className="text-emerald hover:text-white p-0">
                    Start Audit →
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerificationWorkflow;
