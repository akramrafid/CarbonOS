import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const RiceMethane = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Rice Methane"
          description="AWD (Alternate Wetting and Drying) techniques to reduce CH4 emissions in paddy fields."
          badge={<Badge variant="emerald">SECTORS</Badge>}
          align="center"
        />

        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Methodology & MRV
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Rice cultivation is a major source of methane in Bangladesh. AWD projects require careful MRV using water level sensors and satellite soil moisture indices.</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#040A06] border border-emerald/10 rounded-xl">
                <div className="font-mono text-[10px] text-amber mb-2">ELIGIBLE FRAMEWORK</div>
                <div className="font-sans font-bold text-registry">CDM AMS-III.AU</div>
              </div>
              <div className="p-5 bg-[#040A06] border border-emerald/10 rounded-xl">
                <div className="font-mono text-[10px] text-amber mb-2">DATA REQUIREMENT</div>
                <div className="font-sans font-bold text-registry">IoT Water Level Sensors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiceMethane;
