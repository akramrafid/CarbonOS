import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck, Coins, ArrowRight } from 'lucide-react';

export function VerificationCtaSection() {
  return (
    <>
      {/* Auditing Methodology & Pipeline */}
      <div className="border-t border-[#00C853]/15 pt-16 space-y-10">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-[#00C853] tracking-wider uppercase font-bold">
            VERIFICATION STANDARDS
          </span>
          <h2 className="font-sans font-bold text-3xl text-white">How Carbon Zero BD Validates Impact</h2>
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

      {/* Partner Call-to-Action */}
      <div className="bg-gradient-to-br from-[#0D2B1A] to-[#080F0B] border border-[#00C853]/25 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853]/5 rounded-bl-full pointer-events-none"></div>
        <div className="space-y-3 max-w-2xl text-left">
          <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white">Join the Sustainable Revolution</h3>
          <p className="text-xs sm:text-sm text-mist leading-relaxed font-sans">
            Whether you are an enterprise looking to purchase certified offsets, a project developer planning clean infrastructure, or an auditor validating metrics—Carbon Zero BD provides the tools.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 shrink-0">
          <Link 
            to="/platform/marketplace" 
            className="bg-[#00C853] hover:bg-[#00A844] text-[#080F0B] font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Offset Footprint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link 
            to="/platform/project-onboarding" 
            className="bg-transparent border border-white/20 hover:border-white text-white font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
          >
            Onboard Project
          </Link>
        </div>
      </div>
    </>
  );
}

export default VerificationCtaSection;
