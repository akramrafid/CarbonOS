import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';

const ProjectOnboarding = () => {
  return (
    <div className="pt-24 pb-16 min-h-[80vh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Project Onboarding"
          description="Submit your PIN and design documents seamlessly into the National Framework."
          badge={<Badge variant="emerald">PLATFORM</Badge>}
          align="center"
        />

        <Card variant="featured" className="p-8 md:p-12 mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Onboarding Portal
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Welcome to the digital gateway for carbon project origination in Bangladesh. Upload your Project Idea Note (PIN) and GIS polygon boundaries securely.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="CURRENT PIPELINE"
                value="142"
                subtitle="Active Proposals"
              />
              <div className="p-6 bg-[#0D2B1A]/50 border border-emerald/10 rounded-xl flex flex-col justify-center">
                <Button variant="primary" size="lg" className="w-full">
                  Submit New PIN
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectOnboarding;
