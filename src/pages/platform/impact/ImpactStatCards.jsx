import React from 'react';
import { Activity, Globe, Users, Coins, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function ImpactStatCards({ onScrollToRerf }) {
  return (
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
          <Button 
            variant="primary"
            size="sm"
            onClick={onScrollToRerf}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full"
          >
            Renewable Energy Projects
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ImpactStatCards;
