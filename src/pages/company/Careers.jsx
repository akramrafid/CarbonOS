import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const Careers = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Careers"
          description="Build the future of climate tech and national infrastructure with us."
          badge={<Badge variant="emerald">COMPANY</Badge>}
          align="center"
        />

        <div className="bg-bg-canvas registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Open Positions
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>We're actively looking for engineers, policy experts, and data scientists passionate about scaling transparent carbon markets.</p>
            
            <div className="mt-6 flex flex-col space-y-4">
              <div className="p-5 bg-bg-canvas border border-emerald/10 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-sans font-bold text-registry text-lg">Senior Data Engineer</div>
                  <div className="font-mono text-[10px] text-mist mt-1">Remote / Dhaka • Full-time</div>
                </div>
                <Button variant="secondary" size="sm">Apply</Button>
              </div>
              <div className="p-5 bg-bg-canvas border border-emerald/10 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-sans font-bold text-registry text-lg">Carbon Policy Analyst</div>
                  <div className="font-mono text-[10px] text-mist mt-1">Dhaka HQ • Full-time</div>
                </div>
                <Button variant="secondary" size="sm">Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
