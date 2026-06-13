import React from 'react';

const TechStackDiagram = () => {
  const layers = [
    {
      level: "Layer 5",
      name: "Interface",
      tech: "Vite React dashboard, Farmer mobile app (PWA), Buyer marketplace, MoEFCC regulatory portal",
      color: "bg-[#0F172A]",
      textColor: "text-white"
    },
    {
      level: "Layer 4",
      name: "Platform",
      tech: "Node.js REST API, WebSockets, CarbonOS Credit Registry, Smart Contract Engine",
      color: "bg-[#0A5C36]",
      textColor: "text-white"
    },
    {
      level: "Layer 3",
      name: "Processing",
      tech: "Background workers (MRV pipeline), Google Earth Engine, PyTorch models",
      color: "bg-[#16A34A]",
      textColor: "text-white"
    },
    {
      level: "Layer 2",
      name: "Storage",
      tech: "TimescaleDB (time-series), PostGIS (geospatial), Redis (cache), MinIO (raw sensor files)",
      color: "bg-[#22C55E]",
      textColor: "text-[#0F172A]"
    },
    {
      level: "Layer 1",
      name: "Data Ingestion",
      tech: "MQTT broker (EMQX), LoRaWAN network server (ChirpStack), Kafka streams",
      color: "bg-[#F8FAFC]",
      textColor: "text-[#475569]",
      border: "border-2 border-dashed border-[#E2E8F0]"
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {layers.map((layer, idx) => (
        <div 
          key={layer.level} 
          className={`relative p-6 rounded-xl ${layer.color} ${layer.textColor} ${layer.border || ''} shadow-sm hover:-translate-y-1 transition-transform duration-300`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-2 md:mb-0 w-1/4">
              <span className="text-xs font-mono uppercase tracking-widest opacity-80">{layer.level}</span>
              <h3 className="text-xl font-bold">{layer.name}</h3>
            </div>
            <div className="w-3/4">
              <p className="font-mono text-sm leading-relaxed opacity-90">{layer.tech}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TechStackDiagram;
