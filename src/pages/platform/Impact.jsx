import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Coins, 
  Award, 
  ArrowRight, 
  Compass, 
  Activity, 
  Globe, 
  Wind, 
  Building, 
  RefreshCw, 
  Sprout, 
  ArrowUpRight,
  Info 
} from 'lucide-react';

const Impact = () => {
  const [showRerf, setShowRerf] = useState(false);
  const rerfSectionRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleToggleRerf = () => {
    setShowRerf(true);
    setTimeout(() => {
      rerfSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="bg-[#080F0B] min-h-screen text-white pt-24 pb-20 px-6 lg:px-12 relative overflow-hidden">
      
      {/* FLOAT TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl shadow-xl border text-white transition-all transform duration-300 animate-bounce bg-[#0D2B1A] border-[#00C853]/30">
          <Info className="w-5 h-5 text-sky-400" />
          <span className="font-sans font-semibold text-xs tracking-wide">{toast.message}</span>
        </div>
      )}
      
      {/* Decorative background glows */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-emerald/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <span className="font-mono text-xs text-[#00C853] tracking-widest px-4 py-1.5 bg-[#0D2B1A]/60 border border-[#00C853]/20 rounded-full inline-block animate-pulse">
            ECOLOGICAL & SOCIAL IMPACT LOG
          </span>
          <h1 className="serif-drama text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Realized Carbon <br className="hidden sm:block"/>
            <span className="text-[#00C853]">Impact Outcomes</span>
          </h1>
          <p className="font-sans text-sm sm:text-base text-mist max-w-xl mx-auto leading-relaxed">
            CarbonOS monitors, registers, and monetizes verified carbon emissions reductions while directing funding into local rural communities in Bangladesh.
          </p>
        </div>

        {/* 4 Main Core Impact Segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1: Carbon Credit Generated */}
          <div className="bg-[#0D2B1A]/30 border border-[#00C853]/15 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-[#00C853]/40 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-xl aspect-square">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-bl-full group-hover:bg-[#00C853]/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center border border-[#00C853]/20 text-[#00C853]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Carbon Credit Generated</h3>
              <p className="font-mono text-3xl font-extrabold text-[#00C853] tracking-tight">1,420,950</p>
              <span className="font-mono text-xs text-mist block">tCO₂e Registered</span>
            </div>
            <p className="text-xs text-mist/75 mt-4 leading-relaxed font-sans">
              Verified offsets created under Verra VCS & Gold Standard frameworks via eco-restoration projects.
            </p>
          </div>

          {/* Card 2: Carbon Credit Sold */}
          <div className="bg-[#0D2B1A]/30 border border-[#00C853]/15 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-[#00C853]/40 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-xl aspect-square">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-bl-full group-hover:bg-[#00C853]/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center border border-[#00C853]/20 text-[#00C853]">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Carbon Credit Sold</h3>
              <p className="font-mono text-3xl font-extrabold text-[#00C853] tracking-tight">1,180,420</p>
              <span className="font-mono text-xs text-mist block">tCO₂e Retired</span>
            </div>
            <p className="text-xs text-mist/75 mt-4 leading-relaxed font-sans">
              Purchased and retired by international climate funds and corporate partners to meet net-zero targets.
            </p>
          </div>

          {/* Card 3: Directly Community Benefited */}
          <div className="bg-[#0D2B1A]/30 border border-[#00C853]/15 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-[#00C853]/40 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-xl aspect-square">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-bl-full group-hover:bg-[#00C853]/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center border border-[#00C853]/20 text-amber">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Direct Community Benefit</h3>
              <p className="font-mono text-3xl font-extrabold text-amber tracking-tight">৳24,840,500</p>
              <span className="font-mono text-xs text-mist block">BDT Disbursed</span>
            </div>
            <p className="text-xs text-mist/75 mt-4 leading-relaxed font-sans">
              Direct micro-earnings paid straight to the bKash wallets of rural farmers and solar pump operators.
            </p>
          </div>

          {/* Card 4: Zero Finance Fund */}
          <div className="bg-[#0D2B1A] border-2 border-amber/30 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-amber/60 transition-all duration-300 hover:-translate-y-1 relative group overflow-hidden shadow-xl shadow-amber/5 aspect-square">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber/5 rounded-bl-full group-hover:bg-amber/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#080F0B] flex items-center justify-center border border-amber/30 text-amber">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Zero Finance Fund</h3>
              <p className="font-mono text-3xl font-extrabold text-amber tracking-tight">৳8,500,000</p>
              <span className="font-mono text-xs text-mist block">BDT Green Capital</span>
            </div>
            <div className="space-y-3 mt-4">
              <p className="text-xs text-mist/85 leading-tight font-sans">
                Revolving zero-interest loans funded by credit sales to purchase agricultural solar gear.
              </p>
              <button 
                onClick={handleToggleRerf}
                className="w-full bg-amber hover:bg-amber/90 text-carbon font-sans font-bold text-[10px] py-2 px-3 rounded-lg transition-all flex items-center justify-center space-x-1"
              >
                <span>Renewable Energy Projects</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>

        {/* -------------------- DYNAMIC RERF DEPLOYMENT PRIORITIES SECTION -------------------- */}
        {showRerf && (
          <div 
            ref={rerfSectionRef}
            className="border-t border-[#00C853]/15 pt-16 mt-8 space-y-10 animate-fade-in transition-all duration-700"
          >
            
            {/* Header */}
            <div className="text-center space-y-3">
              <span className="font-mono text-xs text-amber tracking-wider uppercase font-bold">
                RERF Deployment Priorities
              </span>
              <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white">
                Where the Revolving Fund Flows First
              </h2>
              <p className="text-sm text-mist max-w-xl mx-auto font-sans leading-relaxed">
                Visualizing the allocation of the Zero Finance Revolving Fund across key ecological infrastructure sectors.
              </p>
            </div>

            {/* Segmented Top Percentage Bar */}
            <div className="w-full max-w-4xl mx-auto">
              <div className="h-10 flex rounded-[1rem] overflow-hidden font-mono text-xs font-bold text-white border border-white/10 shadow-lg relative">
                
                {/* 35% Solar Irrigation */}
                <div 
                  className="bg-[#0A1F13] flex items-center justify-center border-r border-white/5 hover:opacity-90 transition-opacity cursor-pointer group"
                  style={{ width: '35%' }}
                  onClick={() => showToast("Solar Irrigation projects are allocated 35% of fund flows.", "info")}
                >
                  <span className="group-hover:scale-110 transition-transform">35%</span>
                </div>

                {/* 30% Solar Cold Storage */}
                <div 
                  className="bg-[#0D2B1A] flex items-center justify-center border-r border-white/5 hover:opacity-90 transition-opacity cursor-pointer group"
                  style={{ width: '30%' }}
                  onClick={() => showToast("Solar Cold Storage setups represent 30% of revolving allocations.", "info")}
                >
                  <span className="group-hover:scale-110 transition-transform">30%</span>
                </div>

                {/* 20% Rooftop Solar */}
                <div 
                  className="bg-[#1E5C3F] flex items-center justify-center border-r border-white/5 hover:opacity-90 transition-opacity cursor-pointer group"
                  style={{ width: '20%' }}
                  onClick={() => showToast("Rooftop Solar in agro-processing consumes 20% of funds.", "info")}
                >
                  <span className="group-hover:scale-110 transition-transform">20%</span>
                </div>

                {/* 15% Biogas */}
                <div 
                  className="bg-amber text-[#080F0B] flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer group"
                  style={{ width: '15%' }}
                  onClick={() => showToast("Biogas production takes 15% of deployed fund reserves.", "info")}
                >
                  <span className="group-hover:scale-110 transition-transform">15%</span>
                </div>

              </div>
            </div>

            {/* 4 Cards Grid - Matching Reference Image */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto font-sans">
              
              {/* Card 1: Solar Irrigation */}
              <div className="bg-white text-carbon rounded-3xl p-6 flex flex-col items-center text-center shadow-lg border border-slate-100 hover:scale-[1.03] transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#0D2B1A] mb-4">
                  <Sprout className="w-6 h-6" />
                </div>
                <div className="font-mono text-3xl font-extrabold text-[#0D2B1A] mb-1">35%</div>
                <h4 className="font-sans font-bold text-sm text-[#0D2B1A] mb-3">Solar Irrigation</h4>
                <p className="text-xs text-[#4A6D55] leading-relaxed">
                  Cuts diesel dependency and lowers irrigation costs for farmers.
                </p>
              </div>

              {/* Card 2: Solar-Powered Cold Storage */}
              <div className="bg-white text-carbon rounded-3xl p-6 flex flex-col items-center text-center shadow-lg border border-slate-100 hover:scale-[1.03] transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#0D2B1A] mb-4">
                  <Wind className="w-6 h-6" />
                </div>
                <div className="font-mono text-3xl font-extrabold text-[#0D2B1A] mb-1">30%</div>
                <h4 className="font-sans font-bold text-sm text-[#0D2B1A] mb-3">Solar-Powered Cold Storage</h4>
                <p className="text-xs text-[#4A6D55] leading-relaxed">
                  Reduces post-harvest loss; lifts income for farmers and fishers.
                </p>
              </div>

              {/* Card 3: Rooftop Solar */}
              <div className="bg-white text-carbon rounded-3xl p-6 flex flex-col items-center text-center shadow-lg border border-slate-100 hover:scale-[1.03] transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-[#E8F0EB] flex items-center justify-center text-[#0D2B1A] mb-4">
                  <Building className="w-6 h-6" />
                </div>
                <div className="font-mono text-3xl font-extrabold text-[#0D2B1A] mb-1">20%</div>
                <h4 className="font-sans font-bold text-sm text-[#0D2B1A] mb-3">Rooftop Solar — Agro-Processing</h4>
                <p className="text-xs text-[#4A6D55] leading-relaxed">
                  Lowers operating costs for rural enterprises and agro-units.
                </p>
              </div>

              {/* Card 4: Biogas */}
              <div className="bg-white text-carbon rounded-3xl p-6 flex flex-col items-center text-center shadow-lg border border-slate-100 hover:scale-[1.03] transition-transform duration-300">
                <div className="w-12 h-12 rounded-full bg-[#FCF8F2] flex items-center justify-center text-amber mb-4">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div className="font-mono text-3xl font-extrabold text-amber mb-1">15%</div>
                <h4 className="font-sans font-bold text-sm text-[#0D2B1A] mb-3">Biogas from Agri-Waste</h4>
                <p className="text-xs text-[#4A6D55] leading-relaxed">
                  Converts livestock & crop waste into usable energy; cuts methane.
                </p>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Impact;
