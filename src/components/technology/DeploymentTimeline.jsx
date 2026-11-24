import React from 'react';
import { Target } from 'lucide-react';

const DeploymentTimeline = () => {
  const phases = [
    {
      id: "Phase 1",
      timeframe: "Q1–Q2 2025",
      title: "Pilot Deployment: Chittagong Hill Tracts",
      items: [
        "50 IoT sensor nodes across 5 agroforestry projects",
        "LoRaWAN network covering 200 hectares",
        "Google Earth Engine satellite integration live",
        "First 10 carbon credits issued on Carbon Zero BD registry"
      ],
      milestone: "Pilot Registry & Telemetry Validation (Demo data)",
      active: true
    },
    {
      id: "Phase 2",
      timeframe: "Q3–Q4 2025",
      title: "National Scale-up: 8 Divisions",
      items: [
        "500 sensor nodes, 8 district coverage",
        "Drone NDVI survey program launched",
        "Corporate buyer marketplace open (beta)",
        "Verified credit batch settlement testing"
      ],
      milestone: "Multi-Division dMRV Coverage Target (Demo data)",
      active: false
    },
    {
      id: "Phase 3",
      timeframe: "2026",
      title: "Full Registry Operations",
      items: [
        "5,000+ sensor nodes nationally",
        "GHG flux analyzer network (paddy methane)",
        "International methodology alignment (Verra VCS / Gold Standard)",
        "Article 6.2 CAD Trust metadata bridge"
      ],
      milestone: "National Registry & Article 6.2 Readiness Target (Demo data)",
      active: false
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative border-l-2 border-border-subtle ml-4 md:ml-0">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="mb-12 ml-8 relative group">
            <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-bg-canvas ${
              phase.active ? 'bg-accent' : 'bg-bg-muted'
            } shadow-sm transition-colors duration-300 group-hover:bg-accent`}></div>
            
            <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <span className={`text-xs font-mono px-3 py-1 rounded-full ${
                  phase.id === 'Phase 1' ? 'bg-accent/10 text-accent' :
                  phase.id === 'Phase 2' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {phase.id}
                </span>
                <span className="text-sm font-semibold text-fg-secondary mt-2 md:mt-0">{phase.timeframe}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-fg-primary mb-4">{phase.title}</h3>
              
              <ul className="space-y-2 mb-6">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-accent mr-2 mt-1">•</span>
                    <span className="text-fg-secondary">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-bg-canvas border border-border-subtle p-4 rounded-lg flex items-center">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mr-3 shrink-0 text-accent">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-fg-secondary uppercase tracking-wider font-semibold">Key Milestone</p>
                  <p className="font-semibold text-fg-primary">{phase.milestone}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeploymentTimeline;
