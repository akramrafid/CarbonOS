import React, { useState, useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { INITIAL_PAYOUTS } from './impact/impactData';
import { ImpactStatCards } from './impact/ImpactStatCards';
import { LivePayoutLedger } from './impact/LivePayoutLedger';
import { RerfDonutSection } from './impact/RerfDonutSection';
import { VerificationCtaSection } from './impact/VerificationCtaSection';

const Impact = () => {
  const rerfSectionRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [activeSegment, setActiveSegment] = useState(null);
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  // Periodic simulator adding new mobile banking payments dynamically
  useEffect(() => {
    const names = ["Abul Kalam", "Rasheda Begum", "Lutfur Rahman", "Sufia Khatun", "Mohammad Ali", "Jahanara Alam"];
    const districts = ["Dinajpur", "Rangpur", "Khulna", "Sylhet", "Rajshahi", "Chittagong"];
    const sectors = ["Solar Irrigation", "Biogas Generator", "Rooftop Solar", "Mangrove Carbon"];
    
    const interval = setInterval(() => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
      const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
      const randomAmount = (Math.floor(Math.random() * 25) * 100 + 800).toLocaleString();
      
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
        return updated.slice(0, 5);
      });

      showToast(`Disbursed ৳${randomAmount} BDT to ${randomName} (${randomDistrict}) via Mobile Wallet!`, "success");
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleScrollToRerf = () => {
    rerfSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-bg-canvas min-h-screen text-white pt-16 pb-12 px-6 lg:px-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald/5 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[450px] h-[450px] bg-emerald/10 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* Float Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4.5 py-3.5 rounded-2xl shadow-xl border text-white transition-all transform duration-300 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-bg-surface border-border-strong/30' 
            : 'bg-bg-elevated border-border-subtle/20'
        }`}>
          <Info className="w-5 h-5 text-sky-400" />
          <span className="font-sans font-semibold text-xs tracking-wide">{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto">
          <PageHeader
            title="Realized Carbon Impact Outcomes"
            description="Carbon Zero BD monitors, registers, and monetizes verified carbon emissions reductions while directing funding into local rural communities in Bangladesh."
            badge={<Badge variant="emerald">ECOLOGICAL & SOCIAL IMPACT LOG</Badge>}
            align="center"
          />
        </div>

        <ImpactStatCards onScrollToRerf={handleScrollToRerf} />

        <LivePayoutLedger payouts={payouts} />

        <RerfDonutSection
          rerfSectionRef={rerfSectionRef}
          activeSegment={activeSegment}
          setActiveSegment={setActiveSegment}
          showToast={showToast}
        />

        <VerificationCtaSection />
      </div>
    </div>
  );
};

export default Impact;
