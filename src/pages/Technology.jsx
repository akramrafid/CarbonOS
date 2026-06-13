import React from 'react';
import DeviceCard from '../components/technology/DeviceCard';
import SatelliteLayer from '../components/technology/SatelliteLayer';
import TechStackDiagram from '../components/technology/TechStackDiagram';
import DeploymentTimeline from '../components/technology/DeploymentTimeline';

const Technology = () => {
  const devices = [
    { name: "Soil Carbon Sensor", model: "METER Group TEROS 12", measures: "Soil moisture, EC, temp — used to infer SOC", frequency: "Every 15 minutes", phase: "Phase 1", status: "Deployed" },
    { name: "Agromet Weather Station", model: "Davis Instruments Vantage Pro 2", measures: "Temp, humidity, rainfall, wind, solar radiation", frequency: "Every 5 minutes", phase: "Phase 1", status: "Deployed" },
    { name: "Biomass Load Cell", model: "HX711-based array", measures: "Crop weight at harvest — verifies yield", frequency: "Per harvest event", phase: "Phase 1", status: "Pilot" },
    { name: "Eddy Covariance Tower", model: "Campbell Scientific EC155", measures: "Net ecosystem CO₂ exchange (NEE)", frequency: "10 Hz raw, 30-min avg", phase: "Phase 2", status: "Planned" },
    { name: "Drone-based NDVI Scanner", model: "DJI Matrice 300 RTK + RedEdge-MX", measures: "Canopy health and carbon proxy", frequency: "Monthly flights", phase: "Phase 2", status: "Pilot" },
    { name: "LoRaWAN Edge Gateway", model: "RAK7268 WisGate Edge Lite 2", measures: "Aggregates data from up to 2000 nodes", frequency: "Continuous", phase: "Phase 1", status: "Deployed" },
    { name: "Solar-Powered Data Logger", model: "Campbell Scientific CR300 Series", measures: "Off-grid field data logging", frequency: "Configurable", phase: "Phase 1", status: "Deployed" },
    { name: "GHG Flux Analyzer", model: "Picarro G2508 CRDS Analyzer", measures: "CH₄, N₂O, CO₂, NH₃, H₂O (Paddy methane)", frequency: "1 Hz continuous", phase: "Phase 3", status: "Planned" }
  ];

  return (
    <div className="bg-[#F8FAFC] font-sans pt-24 pb-16">
      
      {/* SECTION 1: HERO */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto text-center">
          <span className="font-mono text-sm tracking-widest text-[#16A34A] uppercase mb-4 block">
            // PITCH POINT: Hardware-agnostic, LoRaWAN-native
          </span>
          <h1 className="text-[48px] leading-tight font-bold text-[#0F172A] tracking-[-0.02em] mb-6 max-w-4xl mx-auto">
            The Infrastructure Behind Every Verified Carbon Credit
          </h1>
          <p className="text-lg text-[#475569] max-w-3xl mx-auto mb-12">
            CarbonOS operates a full-stack MRV infrastructure — combining ground-level IoT sensors with satellite remote sensing and AI-powered analytics. Processing 50,000+ readings/hour.
          </p>
          
          {/* Schematic Diagram placeholder */}
          <div className="w-full max-w-5xl mx-auto bg-[#0F172A] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-white font-mono text-sm shadow-xl">
            <div className="flex flex-col items-center"><div className="w-12 h-12 bg-[#16A34A]/20 rounded-lg border border-[#16A34A] mb-2 flex items-center justify-center">📡</div><span>Field Sensors</span></div>
            <div className="text-[#16A34A]">→</div>
            <div className="flex flex-col items-center"><div className="w-12 h-12 bg-white/10 rounded-lg border border-white/20 mb-2 flex items-center justify-center">📶</div><span>Edge Gateway</span></div>
            <div className="text-[#16A34A]">→</div>
            <div className="flex flex-col items-center"><div className="w-12 h-12 bg-white/10 rounded-lg border border-white/20 mb-2 flex items-center justify-center">☁️</div><span>Cloud Backend</span></div>
            <div className="text-[#16A34A]">↔</div>
            <div className="flex flex-col items-center"><div className="w-12 h-12 bg-blue-500/20 rounded-lg border border-blue-500/50 mb-2 flex items-center justify-center">🛰️</div><span>Satellites</span></div>
            <div className="text-[#16A34A]">→</div>
            <div className="flex flex-col items-center"><div className="w-12 h-12 bg-amber-500/20 rounded-lg border border-amber-500/50 mb-2 flex items-center justify-center">📝</div><span>Registry</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GROUND-LEVEL IoT DEVICES */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-[32px] font-bold text-[#0F172A] mb-4">Ground-Level IoT Sensors</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">Continuous, tamper-proof environmental data collection across 5 agro-ecological zones.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {devices.map((device, i) => (
              <DeviceCard key={i} {...device} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SATELLITE LAYER */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-[#E2E8F0] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-[32px] font-bold text-[#0F172A] mb-4">Satellite & Remote Sensing Layer</h2>
            <p className="text-[#475569] max-w-2xl">Cross-referencing ground truth data with orbital imagery for landscape-scale verification.</p>
          </div>
          <SatelliteLayer />
        </div>
      </section>

      {/* SECTION 4: SOFTWARE STACK */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-[32px] font-bold text-[#0F172A] mb-4">Software & AI Stack</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">An enterprise-grade, scalable architecture processing massive geospatial datasets.</p>
          </div>
          <TechStackDiagram />
        </div>
      </section>

      {/* SECTION 5: ROADMAP */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-[32px] font-bold text-[#0F172A] mb-4">Deployment Roadmap</h2>
            <p className="text-[#475569] max-w-2xl mx-auto">Our path from regional pilot to national carbon registry.</p>
          </div>
          <DeploymentTimeline />
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0A5C36] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-8">Ready to integrate your project into CarbonOS?</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-[#16A34A] hover:bg-[#16A34A]/90 text-white font-bold py-4 px-8 rounded-xl transition-colors w-full sm:w-auto text-lg">
              Register a Carbon Project →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Technology;
