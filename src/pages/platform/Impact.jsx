import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  TrendingUp, 
  Users, 
  Coins, 
  ArrowRight, 
  Compass, 
  Activity, 
  Globe, 
  Wind, 
  Building, 
  RefreshCw, 
  Sprout, 
  Info, 
  Radio, 
  Sparkles, 
  ArrowRightCircle,
  ShieldCheck,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria", 
  "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka", 
  "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", 
  "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari", 
  "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", 
  "Madaripur", "Magura", "Manikganj", "Maulvibazar", "Meherpur", "Munshiganj", 
  "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore", 
  "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", 
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", 
  "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", 
  "Thakurgaon"
];

const Impact = () => {
  const [showRerf, setShowRerf] = useState(false);
  const rerfSectionRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [activeSegment, setActiveSegment] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  // Live Mobile Banking Payouts state
  const [payouts, setPayouts] = useState([
    { id: 1, name: "Kamal Uddin", district: "Bogra", amount: "1,450", time: "2 mins ago", sector: "Solar Irrigation" },
    { id: 2, name: "Selina Akhtar", district: "Jessore", amount: "3,200", time: "12 mins ago", sector: "Biogas Generator" },
    { id: 3, name: "Morjina Begum", district: "Satkhira", amount: "2,800", time: "45 mins ago", sector: "Mangrove Carbon" },
    { id: 4, name: "Aminul Islam", district: "Mymensingh", amount: "1,950", time: "1 hour ago", sector: "Solar Cold Storage" }
  ]);

  // Periodic simulator adding new mobile banking payments dynamically
  useEffect(() => {
    const names = ["Abul Kalam", "Rasheda Begum", "Lutfur Rahman", "Sufia Khatun", "Mohammad Ali", "Jahanara Alam"];
    const districts = ["Dinajpur", "Rangpur", "Khulna", "Sylhet", "Rajshahi", "Chittagong"];
    const sectors = ["Solar Irrigation", "Biogas Generator", "Rooftop Solar", "Mangrove Carbon"];
    
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
      const randomAmount = (Math.floor(Math.random() * 25) * 100 + 800).toLocaleString(); // ৳800 to ৳3200
      
      const newPayout = {
        id: Date.now(),
        name: randomName,
        district: randomDistrict,
        amount: randomAmount,
        time: "Just now",
        sector: randomSector
      };
      
      setPayouts(prev => {
        const updated = [newPayout, ...prev.map(p => {
          if (p.time === "Just now") return { ...p, time: "1 min ago" };
          if (p.time.includes("min ago")) {
            const mins = parseInt(p.time) + 1;
            return { ...p, time: `${mins} mins ago` };
          }
          return p;
        })];
        return updated.slice(0, 5); // Keep top 5
      });

      showToast(`Disbursed ৳${randomAmount} BDT to ${randomName} (${randomDistrict}) via Mobile Wallet!`, "success");
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleScrollToRerf = () => {
    rerfSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-[#080F0B] min-h-screen text-white pt-28 pb-24 px-6 lg:px-12 relative overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-emerald/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* FLOAT TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl shadow-xl border text-white transition-all transform duration-300 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-[#0D2B1A] border-[#00C853]/30' 
            : 'bg-[#1E293B] border-[#E2E8F0]/20'
        }`}>
          <Info className="w-5 h-5 text-sky-400" />
          <span className="font-sans font-semibold text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        
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
          <div className="bg-[#0D2B1A]/30 border border-[#00C853]/15 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-[#00C853]/40 transition-all duration-300 hover:-translate-y-1.5 relative group overflow-hidden shadow-xl min-h-[300px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-bl-full group-hover:bg-[#00C853]/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center border border-[#00C853]/20 text-[#00C853]">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Carbon Credit Generated</h3>
              <p className="font-mono text-4xl font-extrabold text-[#00C853] tracking-tight">1,420,950</p>
              <span className="font-mono text-xs text-mist block">tCO₂e Registered</span>
            </div>
            <p className="text-xs text-mist/75 mt-6 leading-relaxed font-sans">
              Verified offsets created under Verra VCS & Gold Standard frameworks via eco-restoration projects.
            </p>
          </div>

          {/* Card 2: Carbon Credit Sold */}
          <div className="bg-[#0D2B1A]/30 border border-[#00C853]/15 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-[#00C853]/40 transition-all duration-300 hover:-translate-y-1.5 relative group overflow-hidden shadow-xl min-h-[300px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-bl-full group-hover:bg-[#00C853]/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center border border-[#00C853]/20 text-[#00C853]">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Carbon Credit Sold</h3>
              <p className="font-mono text-4xl font-extrabold text-[#00C853] tracking-tight">1,180,420</p>
              <span className="font-mono text-xs text-mist block">tCO₂e Retired</span>
            </div>
            <p className="text-xs text-mist/75 mt-6 leading-relaxed font-sans">
              Purchased and retired by international climate funds and corporate partners to meet net-zero targets.
            </p>
          </div>

          {/* Card 3: Directly Community Benefited */}
          <div className="bg-[#0D2B1A]/30 border border-[#00C853]/15 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-[#00C853]/40 transition-all duration-300 hover:-translate-y-1.5 relative group overflow-hidden shadow-xl min-h-[300px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00C853]/5 rounded-bl-full group-hover:bg-[#00C853]/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center border border-[#00C853]/20 text-amber">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Direct Community Benefit</h3>
              <p className="font-mono text-4xl font-extrabold text-amber tracking-tight">৳24,840,500</p>
              <span className="font-mono text-xs text-mist block">BDT Disbursed</span>
            </div>
            <p className="text-xs text-mist/75 mt-6 leading-relaxed font-sans">
              Direct micro-earnings paid straight to the mobile wallets of rural farmers and solar pump operators.
            </p>
          </div>

          {/* Card 4: Zero Finance Fund */}
          <div className="bg-[#0D2B1A] border-2 border-amber/35 rounded-[1.8rem] p-8 flex flex-col justify-between hover:border-amber/60 transition-all duration-300 hover:-translate-y-1.5 relative group overflow-hidden shadow-xl shadow-amber/5 min-h-[300px]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber/5 rounded-bl-full group-hover:bg-amber/10 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#080F0B] flex items-center justify-center border border-amber/30 text-amber">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-sans font-bold text-lg text-white/90">Zero Finance Fund</h3>
              <p className="font-mono text-4xl font-extrabold text-amber tracking-tight">৳8,500,000</p>
              <span className="font-mono text-xs text-mist block">BDT Green Capital</span>
            </div>
            <div className="space-y-3 mt-6">
              <p className="text-xs text-mist/85 leading-tight font-sans">
                Revolving zero-interest loans funded by credit sales to purchase agricultural solar gear.
              </p>
              <button 
                onClick={handleScrollToRerf}
                className="w-full bg-amber hover:bg-amber/90 text-carbon font-sans font-bold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Renewable Energy Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* -------------------- NEW SECTION: LIVE MOBILE BANKING DISBURSEMENT LEDGER -------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start border-t border-[#00C853]/10 pt-16">
          
          <div className="lg:col-span-1 space-y-4">
            <span className="font-mono text-[10px] text-[#00C853] tracking-wider uppercase font-bold px-2 py-0.5 bg-[#0D2B1A] border border-[#00C853]/20 rounded-full inline-block">
              TRANSPARENCY STREAM
            </span>
            <h2 className="font-sans font-bold text-3xl text-white">Live Community Payout Ledger</h2>
            <p className="text-xs text-mist leading-relaxed font-sans">
              CarbonOS utilizes an automated mobile financial service pipeline in Bangladesh, connecting carbon revenue directly to localized mobile wallets. Every generated credit routes 97% of funds directly to rural participants instantly.
            </p>
            <div className="p-4 bg-[#0D2B1A]/40 border border-[#00C853]/10 rounded-2xl flex items-start space-x-3.5">
              <Radio className="w-5 h-5 text-[#00C853] shrink-0 animate-pulse mt-0.5" />
              <div className="text-xs font-sans">
                <span className="font-bold text-white block">Active Mobile Banking Integration</span>
                <span className="text-mist mt-0.5 block">Direct payout latency averages under 12 seconds per validation scan.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0D2B1A]/20 border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span className="font-sans font-bold text-sm text-white">Recent Micro-disbursements</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald bg-emerald/10 border border-emerald/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping mr-1"></span>
                LIVE
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {payouts.map(p => (
                <div key={p.id} className="p-3 bg-[#080F0B]/80 border border-white/5 rounded-2xl flex items-center justify-between text-xs font-sans hover:border-[#00C853]/20 transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center text-emerald font-bold">
                      ৳
                    </div>
                    <div className="text-left leading-none">
                      <div className="font-bold text-white">{p.name}</div>
                      <div className="text-[10px] text-mist/60 font-mono mt-0.5">{p.district} District • {p.sector}</div>
                    </div>
                  </div>
                  <div className="text-right leading-none">
                    <div className="font-mono font-bold text-amber text-sm">+৳{p.amount} BDT</div>
                    <div className="text-[9px] text-mist/40 font-mono mt-1">{p.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* -------------------- DYNAMIC RERF DEPLOYMENT PRIORITIES SECTION (DONUT CHART LAYOUT) -------------------- */}
        <div 
          ref={rerfSectionRef}
          className="border-t border-[#00C853]/15 pt-16 space-y-12"
        >
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="font-mono text-xs text-amber tracking-wider uppercase font-bold">
              RERF DEPLOYMENT PRIORITIES
            </span>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white">
              Where the Revolving Fund Flows First
            </h2>
            <p className="text-sm text-mist max-w-xl mx-auto font-sans leading-relaxed">
              Visualizing the allocation of the Zero Finance Revolving Fund across key ecological infrastructure sectors.
            </p>
          </div>

          {/* Donut & Callout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center max-w-6xl mx-auto">
            
            {/* Left Side Column: Options 1 & 2 */}
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
              
              {/* Option 1: Solar Irrigation */}
              <div 
                onMouseEnter={() => setActiveSegment(1)}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => showToast("Solar Irrigation projects are allocated 35% of fund flows.", "info")}
                className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left lg:text-right ${
                  activeSegment === 1 
                    ? 'bg-[#0D2B1A] border-[#00C853] shadow-lg shadow-[#00C853]/5 -translate-y-1' 
                    : 'bg-[#0D2B1A]/20 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Pointer Line */}
                <div className={`hidden lg:block absolute right-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
                  activeSegment === 1 ? 'bg-[#00C853]' : 'bg-white/10'
                }`}></div>

                <div className="flex items-center lg:justify-end space-x-3 mb-2 lg:flex-row-reverse lg:space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#00C853]/10 flex items-center justify-center text-[#00C853]">
                    <Sprout className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald">35% FLOWS</span>
                </div>
                <h4 className="font-sans font-bold text-sm text-white mb-1.5">Solar Irrigation</h4>
                <p className="text-xs text-mist leading-relaxed font-sans">
                  Cuts diesel dependency and lowers irrigation costs for farmers.
                </p>
              </div>

              {/* Option 2: Solar-Powered Cold Storage */}
              <div 
                onMouseEnter={() => setActiveSegment(2)}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => showToast("Solar Cold Storage setups represent 30% of revolving allocations.", "info")}
                className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left lg:text-right ${
                  activeSegment === 2 
                    ? 'bg-[#0D2B1A] border-[#20E070] shadow-lg shadow-[#20E070]/5 -translate-y-1' 
                    : 'bg-[#0D2B1A]/20 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Pointer Line */}
                <div className={`hidden lg:block absolute right-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
                  activeSegment === 2 ? 'bg-[#20E070]' : 'bg-white/10'
                }`}></div>

                <div className="flex items-center lg:justify-end space-x-3 mb-2 lg:flex-row-reverse lg:space-x-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#20E070]/10 flex items-center justify-center text-[#20E070]">
                    <Wind className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#20E070]">30% FLOWS</span>
                </div>
                <h4 className="font-sans font-bold text-sm text-white mb-1.5">Solar-Powered Cold Storage</h4>
                <p className="text-xs text-mist leading-relaxed font-sans">
                  Reduces post-harvest loss; lifts income for farmers and fishers.
                </p>
              </div>

            </div>

            {/* Center Column: Interactive Donut Chart */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center relative select-none">
              <svg viewBox="0 0 120 120" className="w-60 h-60 mx-auto filter drop-shadow-[0_0_25px_rgba(0,200,83,0.05)] transform -rotate-90">
                {/* Slice 1: 35% */}
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#00C853"
                  strokeWidth={activeSegment === 1 ? "12" : "8"}
                  strokeDasharray="88.0 251.3"
                  strokeDashoffset="0"
                  onMouseEnter={() => setActiveSegment(1)}
                  onMouseLeave={() => setActiveSegment(null)}
                  onClick={() => showToast("Solar Irrigation projects are allocated 35% of fund flows.", "info")}
                  className="transition-all duration-300 cursor-pointer"
                />

                {/* Slice 2: 30% */}
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#20E070"
                  strokeWidth={activeSegment === 2 ? "12" : "8"}
                  strokeDasharray="75.4 251.3"
                  strokeDashoffset="-88.0"
                  onMouseEnter={() => setActiveSegment(2)}
                  onMouseLeave={() => setActiveSegment(null)}
                  onClick={() => showToast("Solar Cold Storage setups represent 30% of revolving allocations.", "info")}
                  className="transition-all duration-300 cursor-pointer"
                />

                {/* Slice 3: 20% */}
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#80F5A0"
                  strokeWidth={activeSegment === 3 ? "12" : "8"}
                  strokeDasharray="50.3 251.3"
                  strokeDashoffset="-163.4"
                  onMouseEnter={() => setActiveSegment(3)}
                  onMouseLeave={() => setActiveSegment(null)}
                  onClick={() => showToast("Rooftop Solar in agro-processing consumes 20% of funds.", "info")}
                  className="transition-all duration-300 cursor-pointer"
                />

                {/* Slice 4: 15% */}
                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="transparent"
                  stroke="#FFB300"
                  strokeWidth={activeSegment === 4 ? "12" : "8"}
                  strokeDasharray="37.7 251.3"
                  strokeDashoffset="-213.7"
                  onMouseEnter={() => setActiveSegment(4)}
                  onMouseLeave={() => setActiveSegment(null)}
                  onClick={() => showToast("Biogas production takes 15% of deployed fund reserves.", "info")}
                  className="transition-all duration-300 cursor-pointer"
                />
              </svg>

              {/* Central Text Panel */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-mist">RERF</span>
                <span className="font-sans font-extrabold text-xl text-white">৳8.5M</span>
                <span className="font-mono text-[8px] text-[#00C853] font-bold">100% DEPLOYED</span>
              </div>
            </div>

            {/* Right Side Column: Options 3 & 4 */}
            <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
              
              {/* Option 3: Rooftop Solar */}
              <div 
                onMouseEnter={() => setActiveSegment(3)}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => showToast("Rooftop Solar in agro-processing consumes 20% of funds.", "info")}
                className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left ${
                  activeSegment === 3 
                    ? 'bg-[#0D2B1A] border-[#80F5A0] shadow-lg shadow-[#80F5A0]/5 -translate-y-1' 
                    : 'bg-[#0D2B1A]/20 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Pointer Line */}
                <div className={`hidden lg:block absolute left-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
                  activeSegment === 3 ? 'bg-[#80F5A0]' : 'bg-white/10'
                }`}></div>

                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#80F5A0]/10 flex items-center justify-center text-[#80F5A0]">
                    <Building className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#80F5A0]">20% FLOWS</span>
                </div>
                <h4 className="font-sans font-bold text-sm text-white mb-1.5">Rooftop Solar — Agro-Processing</h4>
                <p className="text-xs text-mist leading-relaxed font-sans">
                  Lowers operating costs for rural enterprises and agro-units.
                </p>
              </div>

              {/* Option 4: Biogas from Agri-Waste */}
              <div 
                onMouseEnter={() => setActiveSegment(4)}
                onMouseLeave={() => setActiveSegment(null)}
                onClick={() => showToast("Biogas production takes 15% of deployed fund reserves.", "info")}
                className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left ${
                  activeSegment === 4 
                    ? 'bg-[#0D2B1A] border-amber shadow-lg shadow-amber/5 -translate-y-1' 
                    : 'bg-[#0D2B1A]/20 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Pointer Line */}
                <div className={`hidden lg:block absolute left-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
                  activeSegment === 4 ? 'bg-amber' : 'bg-white/10'
                }`}></div>

                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center text-amber">
                    <RefreshCw className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-amber">15% FLOWS</span>
                </div>
                <h4 className="font-sans font-bold text-sm text-white mb-1.5">Biogas from Agri-Waste</h4>
                <p className="text-xs text-mist leading-relaxed font-sans">
                  Converts livestock & crop waste into usable energy; cuts methane.
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* -------------------- NEW SECTION: AUDITING METHODOLOGY & PIPELINE -------------------- */}
        <div className="border-t border-[#00C853]/15 pt-16 space-y-10">
          <div className="text-center space-y-3">
            <span className="font-mono text-xs text-[#00C853] tracking-wider uppercase font-bold">
              VERIFICATION STANDARDS
            </span>
            <h2 className="font-sans font-bold text-3xl text-white">How CarbonOS Validates Impact</h2>
            <p className="text-sm text-mist max-w-xl mx-auto font-sans leading-relaxed">
              Our triple-tier monitoring framework secures audit integrity from hardware node to registry issuance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0D2B1A]/20 border border-white/5 rounded-3xl p-6 hover:border-[#00C853]/35 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center text-[#00C853] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-bold text-base text-white mb-2">1. Satellite Telemetry</h4>
              <p className="text-xs text-mist leading-relaxed font-sans">
                Google Earth Engine integrations track soil organic carbon, canopy coverage, and moisture indexes, delivering independent geographic validation.
              </p>
            </div>
            
            <div className="bg-[#0D2B1A]/20 border border-white/5 rounded-3xl p-6 hover:border-[#00C853]/35 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center text-[#00C853] mb-4">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-bold text-base text-white mb-2">2. IoT Sensor Streams</h4>
              <p className="text-xs text-mist leading-relaxed font-sans">
                Blynk IoT hardware nodes measure raw voltage, fuel levels, and telemetry inputs directly from equipment, cross-referencing fuel savings at the source.
              </p>
            </div>

            <div className="bg-[#0D2B1A]/20 border border-white/5 rounded-3xl p-6 hover:border-[#00C853]/35 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0D2B1A] flex items-center justify-center text-amber mb-4">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-bold text-base text-white mb-2">3. Direct Ledger Audit</h4>
              <p className="text-xs text-mist leading-relaxed font-sans">
                Financial flows are hardcoded to mobile wallet invoices. Auditing firms trace purchase capital directly to corresponding farmers' mobile banking statements.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------- NEW SECTION: PARTNER CALL-TO-ACTION -------------------- */}
        <div className="bg-gradient-to-br from-[#0D2B1A] to-[#080F0B] border border-[#00C853]/25 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853]/5 rounded-bl-full pointer-events-none"></div>
          <div className="space-y-3 max-w-2xl text-left">
            <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white">Join the Sustainable Revolution</h3>
            <p className="text-xs sm:text-sm text-mist leading-relaxed font-sans">
              Whether you are an enterprise looking to purchase certified offsets, a project developer planning clean infrastructure, or an auditor validating metrics—CarbonOS provides the tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link 
              to="/platform/marketplace" 
              className="bg-[#00C853] hover:bg-[#00A844] text-[#080F0B] font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <span>Offset Footprint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              to="/platform/project-onboarding" 
              className="bg-transparent border border-white/20 hover:border-white text-white font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all"
            >
              Onboard Project
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Impact;
