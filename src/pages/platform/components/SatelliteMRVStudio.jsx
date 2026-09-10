import React, { useState } from 'react';
import { 
  Trees, 
  Satellite, 
  ShieldCheck, 
  Award, 
  Layers, 
  TrendingUp, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  Eye,
  Check,
  RefreshCw
} from 'lucide-react';

const SATELLITE_PROJECTS = [
  {
    id: "MRV-BD-SUNDARBANS-01",
    name: "Sundarbans Coastal Mangrove Blue Carbon Reserve",
    region: "Khulna & Bagerhat, Bangladesh",
    ecosystem: "Tidal Mangrove Wetland",
    biomass_tc_ha: 248.5,
    annual_removal: 48500,
    available_insets: 12400,
    rating: "AAA",
    permanence: 98.4,
    additionality: 99.1,
    vintage: "2026",
    standard: "Verra VM0033 & GEDI LiDAR Waveform",
    coordinates: "21.9497° N, 89.1833° E",
    img: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "MRV-BD-SYLHET-CANOPY-02",
    name: "Sylhet Agroforestry & High-Canopy Tea Estate Sink",
    region: "Sreemangal, Sylhet, Bangladesh",
    ecosystem: "Subtropical Broadleaf & Tea Canopy",
    biomass_tc_ha: 182.3,
    annual_removal: 26800,
    available_insets: 8200,
    rating: "AA+",
    permanence: 94.2,
    additionality: 95.8,
    vintage: "2026",
    standard: "Gold Standard & Sentinel-2 10m NDVI",
    coordinates: "24.3065° N, 91.7296° E",
    img: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "MRV-BD-SOLAR-IRRIGATION-03",
    name: "Northern Agrarian Solar Irrigation Displacement Belt",
    region: "Dinajpur & Rangpur, Bangladesh",
    ecosystem: "Diesel Displacing Clean Mini-Grids",
    biomass_tc_ha: 0.0,
    annual_removal: 34200,
    available_insets: 15600,
    rating: "AAA",
    permanence: 100.0,
    additionality: 98.6,
    vintage: "2026",
    standard: "UNFCCC AMS-I.D & IoT Inverter Telemetry",
    coordinates: "25.6279° N, 88.6332° E",
    img: "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "MRV-BD-CHT-WATERSHED-04",
    name: "Chittagong Hill Tracts Indigenous Forest Watershed",
    region: "Bandarban & Rangamati, Bangladesh",
    ecosystem: "Montane Tropical Rain Forest",
    biomass_tc_ha: 215.8,
    annual_removal: 51200,
    available_insets: 19400,
    rating: "AA+",
    permanence: 93.6,
    additionality: 97.2,
    vintage: "2026",
    standard: "Plan Vivo & GEDI Waveform LiDAR",
    coordinates: "22.1953° N, 92.2184° E",
    img: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80"
  }
];

export const SatelliteMRVStudio = ({ 
  isLight, 
  locale, 
  grossEmissions = 1667.64,
  retiredInsets = 250,
  onRetireInset 
}) => {
  const [selectedProject, setSelectedProject] = useState(SATELLITE_PROJECTS[0]);
  const [retireAmount, setRetireAmount] = useState(50);
  const [retiredLog, setRetiredLog] = useState([
    { id: "RET-901", project: "Sundarbans Mangrove Blue Carbon", amount: 150, date: "2026-08-14", certHash: "SHA256-SUN-8841" },
    { id: "RET-902", project: "Northern Agrarian Solar Irrigation", amount: 100, date: "2026-09-02", certHash: "SHA256-SOL-2940" }
  ]);
  const [showCertificate, setShowCertificate] = useState(false);

  const totalRetired = retiredLog.reduce((acc, curr) => acc + curr.amount, 0);
  const netFootprint = Math.max(0, grossEmissions - totalRetired);

  const handleRetire = () => {
    const newEntry = {
      id: `RET-${Math.floor(100 + Math.random() * 900)}`,
      project: selectedProject.name,
      amount: parseFloat(retireAmount) || 10,
      date: new Date().toISOString().substring(0, 10),
      certHash: `SHA256-${selectedProject.id.substring(7, 10)}-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setRetiredLog([newEntry, ...retiredLog]);
    if (onRetireInset) onRetireInset(newEntry.amount);
    setShowCertificate(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-3xl border ${
        isLight 
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-200' 
          : 'bg-gradient-to-r from-[#06140D] to-[#0A2216] border-[#1B4D2E]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <Satellite className="w-4 h-4" />
              </div>
              <h2 className={`text-xl font-bold font-sans ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {locale.satelliteTitle}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                Sentinel-2 + GEDI LiDAR
              </span>
            </div>
            <p className={`text-xs ${isLight ? 'text-gray-600' : 'text-[#8FA899]'}`}>
              {locale.satelliteSubtitle}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl border text-center ${
              isLight ? 'bg-white/80 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'
            }`}>
              <span className="text-[10px] font-mono text-gray-500 block uppercase">Gross Footprint</span>
              <span className="text-base font-bold font-mono text-gray-700 dark:text-gray-300">{grossEmissions.toFixed(1)} t</span>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${
              isLight ? 'bg-white/80 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'
            }`}>
              <span className="text-[10px] font-mono text-emerald-500 block uppercase">Retired Insets</span>
              <span className="text-base font-bold font-mono text-emerald-500">-{totalRetired} t</span>
            </div>
            <div className={`p-3 rounded-2xl border text-center bg-emerald-500/10 border-emerald-500/30`}>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block uppercase font-bold">Net Balance</span>
              <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">{netFootprint.toFixed(1)} t</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SATELLITE_PROJECTS.map(proj => {
          const isSelected = selectedProject.id === proj.id;
          return (
            <div 
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className={`rounded-3xl border overflow-hidden transition-all cursor-pointer ${
                isSelected 
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg' 
                  : (isLight ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-[#0A160F] border-[#1B4D2E] hover:border-[#2A6D42]')
              }`}
            >
              <div className="h-32 w-full relative overflow-hidden">
                <img src={proj.img} alt={proj.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500 text-white shadow-sm flex items-center space-x-1">
                  <Award className="w-3 h-3" />
                  <span>{proj.rating} Rating</span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 text-white">
                  <span className="text-[10px] font-mono text-emerald-300 block">{proj.ecosystem}</span>
                  <h4 className="text-xs font-bold leading-tight line-clamp-1">{proj.name}</h4>
                </div>
              </div>

              <div className="p-3.5 space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-500">Biomass Density:</span>
                  <span className="font-bold text-emerald-500">{proj.biomass_tc_ha} tC/ha</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-500">Available Insets:</span>
                  <span className="font-bold">{proj.available_insets.toLocaleString()} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-gray-500">Permanence Score:</span>
                  <span className="font-bold text-cyan-400">{proj.permanence}%</span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="truncate">{proj.region}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Detailed Inset Retirement Panel */}
      <div className={`p-6 rounded-3xl border ${isLight ? 'bg-white border-gray-200' : 'bg-[#0A160F] border-[#1B4D2E]'}`}>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Selected Project Inset
              </span>
              <span className="text-xs font-mono text-gray-500">{selectedProject.coordinates}</span>
            </div>
            <h3 className={`text-lg font-bold font-sans ${isLight ? 'text-gray-900' : 'text-white'}`}>
              {selectedProject.name}
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
              Verified through GEDI satellite LiDAR waveform returns and Sentinel-2 optical multi-spectral vegetation indices.
              Carbon insets from this ecosystem are certified under {selectedProject.standard} with an audit rating of {selectedProject.rating}.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'}`}>
                <span className="text-[10px] font-mono text-gray-500 block">Additionality</span>
                <span className="text-sm font-bold font-mono text-emerald-500">{selectedProject.additionality}%</span>
              </div>
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'}`}>
                <span className="text-[10px] font-mono text-gray-500 block">Annual Removal</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{(selectedProject.annual_removal / 1000).toFixed(1)}k t</span>
              </div>
              <div className={`p-3 rounded-2xl border ${isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'}`}>
                <span className="text-[10px] font-mono text-gray-500 block">Vintage Year</span>
                <span className="text-sm font-bold font-mono text-gray-300">{selectedProject.vintage}</span>
              </div>
            </div>
          </div>

          {/* Retirement Action Box */}
          <div className={`w-full lg:w-96 p-5 rounded-3xl border space-y-4 ${
            isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#040A06] border-[#1B4D2E]'
          }`}>
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-500">
              Retire Nature Insets To Corporate Ledger
            </h4>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-gray-500">Retirement Amount:</span>
                <span className="font-bold font-mono">{retireAmount} tCO₂e</span>
              </div>
              <input 
                type="range"
                min="10"
                max="500"
                step="10"
                value={retireAmount}
                onChange={(e) => setRetireAmount(e.target.value)}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-gray-500">
                <span>10 t</span>
                <span>250 t</span>
                <span>500 t</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRetire}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Retire {retireAmount} tCO₂e Insets Now</span>
              </button>
            </div>

            {showCertificate && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Retirement Certificate Issued</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  Ledger Hash: SHA256-{Math.floor(100000 + Math.random() * 900000)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ledger Log */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500 mb-3">
            Recent Inset Retirement Transactions (Immutable Carbon Ledger)
          </h4>
          <div className="space-y-2">
            {retiredLog.map((log) => (
              <div 
                key={log.id} 
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#040A06] border-[#1B4D2E]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-emerald-500">{log.id}</span>
                  <span className="text-gray-600 dark:text-gray-300 font-sans">{log.project}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-500">{log.date}</span>
                  <span className="font-bold text-cyan-400">{log.certHash}</span>
                  <span className="font-bold text-emerald-500">-{log.amount} tCO₂e</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteMRVStudio;
