import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const FrameworkDocs = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Framework Docs"
          description="Official documentation for the Bangladesh National Carbon Market Framework."
          badge={<Badge variant="emerald">COMPANY</Badge>}
          align="center"
        />

        <div className="bg-bg-canvas registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Policy & Guidelines
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Access the core policy documents that govern the issuance, tracking, and retirement of carbon credits in Bangladesh under Article 6 of the Paris Agreement.</p>
            
            <div className="mt-6 flex flex-col space-y-4">
              <a href="#" className="flex justify-between items-center p-4 bg-bg-canvas border border-emerald/10 rounded-lg hover:border-emerald/40 transition-colors">
                <span className="font-sans text-registry">National Carbon Market Framework v1.2</span>
                <span className="font-mono text-[10px] text-emerald">PDF (2.4 MB)</span>
              </a>
              <a href="#" className="flex justify-between items-center p-4 bg-bg-canvas border border-emerald/10 rounded-lg hover:border-emerald/40 transition-colors">
                <span className="font-sans text-registry">MRV Technical Specifications</span>
                <span className="font-mono text-[10px] text-emerald">PDF (1.1 MB)</span>
              </a>
              <a href="#" className="flex justify-between items-center p-4 bg-bg-canvas border border-emerald/10 rounded-lg hover:border-emerald/40 transition-colors">
                <span className="font-sans text-registry">VVB Accreditation Requirements</span>
                <span className="font-mono text-[10px] text-emerald">PDF (850 KB)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkDocs;
