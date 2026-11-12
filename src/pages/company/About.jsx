import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const About = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="About Carbon Zero BD"
          description="The technical foundation for Bangladesh's transition to a green economy."
          badge={<Badge variant="emerald">COMPANY</Badge>}
          align="center"
        />

        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Our Mission
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Carbon Zero BD is a sovereign initiative aimed at digitizing, scaling, and securing the National Carbon Market. By replacing fragmented spreadsheets with real-time IoT feeds and immutable ledger technology, we ensure every carbon credit generated in Bangladesh meets global integrity standards.</p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-mono text-3xl text-registry mb-2">100%</div>
                <div className="font-sans text-xs text-mist">National Framework Alignment</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-emerald mb-2">~0ms</div>
                <div className="font-sans text-xs text-mist">Data Reconciliation Delay</div>
              </div>
              <div>
                <div className="font-mono text-3xl text-registry mb-2">24/7</div>
                <div className="font-sans text-xs text-mist">Automated MRV Monitoring</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
