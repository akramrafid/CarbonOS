import React, { useState } from 'react';
import { 
  Building, 
  Network, 
  Layers, 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin, 
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

const CONGLOMERATE_ENTITIES = [
  {
    id: "ENT-01",
    name: "Dexterity Textiles Ltd (DEPZ Plant 1)",
    division: "RMG & Knitwear Export",
    location: "DEPZ, Savar, Dhaka",
    share_pct: 100,
    headcount: 148,
    revenue_crore_bdt: 42.5,
    emissions: { scope1: 54.95, scope2: 85.80, scope3: 1526.84, total: 1667.59 },
    intensity_tco2e_per_crore: 39.24,
    color: "#10b981"
  },
  {
    id: "ENT-02",
    name: "Apex Composite Spinning Mills",
    division: "Yarn & Raw Cotton Processing",
    location: "Narayanganj Industrial Belt",
    share_pct: 100,
    headcount: 230,
    revenue_crore_bdt: 68.0,
    emissions: { scope1: 84.10, scope2: 142.50, scope3: 890.40, total: 1117.00 },
    intensity_tco2e_per_crore: 16.42,
    color: "#06b6d4"
  },
  {
    id: "ENT-03",
    name: "Padma Intermodal Logistics & Fleet",
    division: "Highway Haulage & Seaport Clearing",
    location: "Sitakunda & Chattogram Port Corridor",
    share_pct: 80,
    headcount: 55,
    revenue_crore_bdt: 21.0,
    emissions: { scope1: 112.40, scope2: 14.20, scope3: 340.50, total: 467.10 },
    intensity_tco2e_per_crore: 22.24,
    color: "#f59e0b"
  },
  {
    id: "ENT-04",
    name: "Apex Corporate Headquarters",
    division: "Executive Administration & Finance",
    location: "Gulshan Financial District, Dhaka",
    share_pct: 100,
    headcount: 42,
    revenue_crore_bdt: 0.0,
    emissions: { scope1: 8.50, scope2: 24.60, scope3: 95.20, total: 128.30 },
    intensity_tco2e_per_crore: 0.0,
    color: "#a855f7"
  }
];

export const ConglomerateTreeStudio = ({ isLight, locale }) => {
  const [selectedEntity, setSelectedEntity] = useState(CONGLOMERATE_ENTITIES[0]);
  const [viewMode, setViewMode] = useState('consolidated'); // 'consolidated' | 'entity'

  // Summary Metrics across Group
  const groupTotals = {
    scope1: CONGLOMERATE_ENTITIES.reduce((acc, curr) => acc + curr.emissions.scope1, 0),
    scope2: CONGLOMERATE_ENTITIES.reduce((acc, curr) => acc + curr.emissions.scope2, 0),
    scope3: CONGLOMERATE_ENTITIES.reduce((acc, curr) => acc + curr.emissions.scope3, 0),
    total: CONGLOMERATE_ENTITIES.reduce((acc, curr) => acc + curr.emissions.total, 0),
    workforce: CONGLOMERATE_ENTITIES.reduce((acc, curr) => acc + curr.headcount, 0),
    revenue: CONGLOMERATE_ENTITIES.reduce((acc, curr) => acc + curr.revenue_crore_bdt, 0)
  };

  const groupIntensity = (groupTotals.total / groupTotals.revenue).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border ${
        isLight 
          ? 'bg-gradient-to-r from-purple-50 to-indigo-50/50 border-purple-200' 
          : 'bg-gradient-to-r from-[#100B1A] to-[#0D1622] border-[#2A1D4E]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500">
                <Network className="w-4 h-4" />
              </div>
              <h2 className={`text-xl font-bold font-sans ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {locale.entityTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                Sweep Trees Model
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-[#8FA899]'}`}>
              {locale.entitySubtitle}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-2xl border bg-[#040A06] border-[#1B4D2E] text-purple-400">
              Holding Group: Apex Holdings (BD)
            </span>
          </div>
        </div>
      </div>

      {/* Group Consolidated Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Group Consolidated Gross</span>
          <span className="text-2xl font-bold font-mono text-emerald-500">
            {groupTotals.total.toFixed(1)} tCO₂e
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">4 reporting legal entities</span>
        </div>

        <div className={`p-4 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Group Carbon Intensity</span>
          <span className="text-2xl font-bold font-mono text-cyan-400">
            {groupIntensity} t / Cr BDT
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">৳ {groupTotals.revenue} Crore consolidated rev</span>
        </div>

        <div className={`p-4 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Total Group Workforce</span>
          <span className="text-2xl font-bold font-mono text-purple-400">
            {groupTotals.workforce} Staff
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Across Savar, Narayanganj & HQ</span>
        </div>

        <div className={`p-4 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
          <span className="text-[10px] font-mono text-gray-500 uppercase block mb-1">GHGP Consolidation</span>
          <span className="text-base font-bold font-sans text-gray-800 dark:text-gray-200 block mt-1">
            Operational Control
          </span>
          <span className="text-[10px] text-emerald-500 block mt-1">100% boundary compliance</span>
        </div>
      </div>

      {/* Main Split: Hierarchy Tree Nodes + Selected Entity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1/3: Tree Nodes */}
        <div className="space-y-3">
          <h3 className={`text-xs font-mono font-bold uppercase tracking-wider text-gray-500 px-1`}>
            Conglomerate Entity Rollup
          </h3>
          {CONGLOMERATE_ENTITIES.map(ent => {
            const isSelected = selectedEntity.id === ent.id;
            const shareOfGroup = ((ent.emissions.total / groupTotals.total) * 100).toFixed(1);

            return (
              <div
                key={ent.id}
                onClick={() => setSelectedEntity(ent)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' 
                    : (isLight ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-[#0A160F] border-[#1B4D2E] hover:border-[#2A6D42]')
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-500 block">{ent.id} • {ent.division}</span>
                    <h4 className="text-xs font-bold font-sans text-gray-900 dark:text-white mt-0.5">{ent.name}</h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-500">{shareOfGroup}%</span>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>{ent.emissions.total.toFixed(1)} tCO₂e</span>
                  <span>{ent.headcount} staff</span>
                  <span>৳ {ent.revenue_crore_bdt} Cr</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2/3: Selected Entity Deep Dive */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border space-y-6 ${
          isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {selectedEntity.id}
                </span>
                <span className="text-xs font-mono text-gray-500">{selectedEntity.location}</span>
              </div>
              <h3 className={`text-lg font-bold font-sans mt-1 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {selectedEntity.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-500 block uppercase">Entity Total</span>
              <span className="text-xl font-bold font-mono text-emerald-500">
                {selectedEntity.emissions.total.toFixed(2)} tCO₂e
              </span>
            </div>
          </div>

          {/* Scope Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'}`}>
              <span className="text-[10px] font-mono text-amber-500 uppercase block">Scope 1 Direct</span>
              <span className="text-lg font-bold font-mono text-amber-500 mt-1 block">
                {selectedEntity.emissions.scope1.toFixed(2)} t
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Fuels & generators</span>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'}`}>
              <span className="text-[10px] font-mono text-cyan-500 uppercase block">Scope 2 Grid</span>
              <span className="text-lg font-bold font-mono text-cyan-500 mt-1 block">
                {selectedEntity.emissions.scope2.toFixed(2)} t
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Purchased power</span>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'}`}>
              <span className="text-[10px] font-mono text-emerald-500 uppercase block">Scope 3 Value Chain</span>
              <span className="text-lg font-bold font-mono text-emerald-500 mt-1 block">
                {selectedEntity.emissions.scope3.toFixed(2)} t
              </span>
              <span className="text-[10px] text-gray-400 block mt-1">Yarn & transport</span>
            </div>
          </div>

          {/* Intensity Benchmarks */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'
          }`}>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
              Subsidiary Operational Benchmarks
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500 block">Carbon Intensity / Turnover:</span>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  {selectedEntity.intensity_tco2e_per_crore} tCO₂e / Crore BDT
                </span>
              </div>
              <div>
                <span className="text-gray-500 block">Emissions Per Employee:</span>
                <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                  {(selectedEntity.emissions.total / selectedEntity.headcount).toFixed(2)} tCO₂e / FTE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConglomerateTreeStudio;
