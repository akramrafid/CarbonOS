import React from 'react';

const DeploymentTimeline = () => {
  const phases = [
    {
      id: "Phase 1",
      timeframe: "Q1–Q2 2025",
      title: "Pilot Deployment — Chittagong Hill Tracts",
      items: [
        "50 IoT sensor nodes across 5 agroforestry projects",
        "LoRaWAN network covering 200 hectares",
        "Google Earth Engine satellite integration live",
        "First 10 carbon credits issued on CarbonOS registry"
      ],
      milestone: "MoEFCC letter of support secured",
      active: true
    },
    {
      id: "Phase 2",
      timeframe: "Q3–Q4 2025",
      title: "National Scale-up — 8 Divisions",
      items: [
        "500 sensor nodes, 8 district coverage",
        "Drone NDVI survey program launched",
        "Corporate buyer marketplace open (beta)",
        "First verified credit sale completed"
      ],
      milestone: "$500K pilot revenue",
      active: false
    },
    {
      id: "Phase 3",
      timeframe: "2026",
      title: "Full Registry Operations",
      items: [
        "5,000+ sensor nodes nationally",
        "GHG flux analyzer network (paddy methane)",
        "International credit standard certification (VCS/Gold Standard)",
        "Bangladesh Carbon Exchange launch"
      ],
      milestone: "$5M ARR, Series A close",
      active: false
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative border-l-2 border-[#E2E8F0] ml-4 md:ml-0">
        {phases.map((phase, idx) => (
          <div key={phase.id} className="mb-12 ml-8 relative group">
            <div className={`absolute -left-[41px] w-6 h-6 rounded-full border-4 border-white ${
              phase.active ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'
            } shadow-sm transition-colors duration-300 group-hover:bg-[#0A5C36]`}></div>
            
            <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <span className={`text-xs font-mono px-3 py-1 rounded-full ${
                  phase.id === 'Phase 1' ? 'bg-[#16A34A]/10 text-[#16A34A]' :
                  phase.id === 'Phase 2' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                  'bg-[#3B82F6]/10 text-[#3B82F6]'
                }`}>
                  {phase.id}
                </span>
                <span className="text-sm font-semibold text-[#475569] mt-2 md:mt-0">{phase.timeframe}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{phase.title}</h3>
              
              <ul className="space-y-2 mb-6">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-[#16A34A] mr-2 mt-1">•</span>
                    <span className="text-[#475569]">{item}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg flex items-center">
                <div className="w-8 h-8 rounded-full bg-[#16A34A]/10 flex items-center justify-center mr-3 shrink-0">
                  <span className="text-[#16A34A]">🎯</span>
                </div>
                <div>
                  <p className="text-xs text-[#475569] uppercase tracking-wider font-semibold">Key Milestone</p>
                  <p className="font-semibold text-[#0F172A]">{phase.milestone}</p>
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
