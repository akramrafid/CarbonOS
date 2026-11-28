import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { getPrefersReducedMotion } from '../../lib/motion';
import { useToast } from '../../context/ToastContext';
import { INITIAL_PAYOUTS } from './impact/impactData';
import { ImpactStatCards } from './impact/ImpactStatCards';
import { LivePayoutLedger } from './impact/LivePayoutLedger';
import { RerfDonutSection } from './impact/RerfDonutSection';
import { VerificationCtaSection } from './impact/VerificationCtaSection';

const Impact = () => {
  const rerfSectionRef = useRef(null);
  const { showToast } = useToast();
  const [activeSegment, setActiveSegment] = useState(null);
  const [payouts, setPayouts] = useState(INITIAL_PAYOUTS);

  // Periodic simulator adding new mobile banking payments dynamically (pauses when tab is hidden)
  useEffect(() => {
    const names = ["Abul Kalam", "Rasheda Begum", "Lutfur Rahman", "Sufia Khatun", "Mohammad Ali", "Jahanara Alam"];
    const districts = ["Dinajpur", "Rangpur", "Khulna", "Sylhet", "Rajshahi", "Chittagong"];
    const sectors = ["Solar Irrigation", "Biogas Generator", "Rooftop Solar", "Mangrove Carbon"];

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
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
    }, 12000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleScrollToRerf = () => {
    rerfSectionRef.current?.scrollIntoView({
      behavior: getPrefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
        <div className="w-full max-w-[1600px] mx-auto text-fg-primary space-y-8 relative">
          {/* Page Header */}
          <div className="max-w-3xl mx-auto">
            <PageHeader
              title="Realized Carbon Impact Outcomes"
              description="Illustrative monitoring & disbursement model showing how Carbon Zero BD routes climate revenue to participating farmers in Bangladesh (demo simulation)."
              badge={<Badge variant="warning">DEMO IMPACT PREVIEW (SIMULATED)</Badge>}
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
      );
};

      export default Impact;
