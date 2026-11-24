import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';

const ProjectOnboarding = () => {
  return (
    <div className="pt-12 pb-8 sm:pt-16 sm:pb-12 min-h-[80dvh] flex flex-col items-center noise-overlay">
      <div className="max-w-4xl w-full mx-auto px-6 lg:px-12">
        <PageHeader
          title="Project Onboarding"
          description="Submit Project Idea Notes (PIN), GIS boundary polygons, and baseline documentation to the Bangladesh National Carbon Market Framework."
          badge={<Badge variant="emerald">PLATFORM</Badge>}
          align="center"
        />

        <Card variant="featured" className="p-8 md:p-12 mt-12">
          <h2 className="font-sans font-bold text-2xl text-registry mb-6 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald mr-3"></span>
            Onboarding Portal
          </h2>
          <div className="space-y-6 font-sans text-mist text-base leading-relaxed">
            <p>Upload your Project Idea Note (PIN), methodology selection, and GeoJSON reserve boundaries for registry completeness review.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="CURRENT PIPELINE (DEMO DATA)"
                value="142"
                subtitle="Illustrative Demo Proposals"
              />
              <div className="p-6 bg-bg-surface/50 border border-emerald/10 rounded-xl flex flex-col justify-center gap-2">
                {/* [COMMENTED OUT FOR PERSONAL REFERENCE — dead un-wired primary Submit New PIN button replaced with honest disabled state until backend intake endpoint exists] */}
                <Button variant="secondary" size="lg" className="w-full min-h-[44px]" disabled aria-disabled="true">
                  Submit New PIN (Intake Offline)
                </Button>
                <p className="text-[11px] font-mono text-mist text-center">
                  Demo preview only: backend PIN submission endpoint not yet enabled.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectOnboarding;
