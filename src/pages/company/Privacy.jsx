import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';

const Privacy = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Privacy Policy"
          description="How we protect project developer data and ensure national security compliance."
          badge={<Badge variant="emerald">COMPANY</Badge>}
          align="center"
        />

        <div className="bg-bg-canvas registry-border p-8 md:p-12 rounded-[2rem] shadow-[0_0_30px_rgba(0,200,83,0.05)] mt-12">
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p><strong>Last Updated: January 1, 2026</strong></p>
            <p>Carbon Zero BD is committed to safeguarding your privacy. We collect data solely to verify carbon emissions reductions under the National Framework.</p>
            <h2 className="text-registry font-bold text-lg mt-6">1. Data We Collect</h2>
            <p>We collect project coordinates (GIS data), IoT telemetry (inverter logs, flow meters), and corporate identification documents necessary for project onboarding.</p>
            <h2 className="text-registry font-bold text-lg mt-6">2. How We Use Data</h2>
            <p>Data is used exclusively for MRV (Measurement, Reporting, and Verification), fraud detection via AI, and national registry tracking. We do not sell data to third parties.</p>
            <h2 className="text-registry font-bold text-lg mt-6">3. Data Residency</h2>
            <p>All sensitive national carbon data is hosted on sovereign servers physically located within Bangladesh in compliance with the Digital Security Act.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
