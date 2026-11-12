import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const Terms = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Terms of Service"
          description="User agreement for accessing the Carbon Zero BD platform and registry."
          badge={<Badge variant="emerald">COMPANY</Badge>}
          align="center"
        />

        <div className="bg-[#080F0B] registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <h2 className="text-registry font-bold text-lg mt-6">1. Acceptance of Terms</h2>
            <p>By accessing Carbon Zero BD, you agree to comply with these terms and all applicable laws of Bangladesh, including the National Carbon Market Framework guidelines.</p>
            <h2 className="text-registry font-bold text-lg mt-6">2. Registry Integrity</h2>
            <p>Users must not submit false data. Intentional double-counting or falsification of MRV telemetry is a violation of federal law and will result in immediate account termination and legal action.</p>
            <h2 className="text-registry font-bold text-lg mt-6">3. Marketplace Trading</h2>
            <p>Carbon Zero BD provides the technology for peer-to-peer carbon credit trading. We do not act as a financial broker and are not liable for market price fluctuations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
