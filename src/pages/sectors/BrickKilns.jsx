import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const BrickKilns = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Brick Kilns"
          description="Upgrading traditional kilns to Zigzag or Tunnel technologies to slash emissions."
          badge={<Badge variant="emerald">SECTORS</Badge>}
          align="center"
        />

        <div className="bg-bg-canvas registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Methodology & MRV
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Brick kilns are a major pollution source. Upgrading technologies drastically reduces coal consumption. Carbon Zero BD tracks fuel inputs and brick production output for accurate crediting.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-bg-canvas border border-emerald/10 rounded-xl">
                <div className="font-mono text-[10px] text-amber mb-2">ELIGIBLE FRAMEWORK</div>
                <div className="font-sans font-bold text-registry">CDM AMS-III.Z</div>
              </div>
              <div className="p-5 bg-bg-canvas border border-emerald/10 rounded-xl">
                <div className="font-mono text-[10px] text-amber mb-2">DATA REQUIREMENT</div>
                <div className="font-sans font-bold text-registry">Production Logs & Coal Audits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrickKilns;
