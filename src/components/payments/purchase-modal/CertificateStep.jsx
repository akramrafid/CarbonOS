import React from 'react';
import { ShieldCheck, CheckCircle2, Printer, Copy, Check } from 'lucide-react';
import Button from '@/components/ui/Button';

export function CertificateStep({
  isLight,
  companyName,
  taxBin,
  activeCredit,
  farmerRemittance,
  settlementDate,
  scopeType,
  certificateSerial,
  verificationHash,
  copiedSerial,
  handleCopyHash,
  handlePrint,
  onClose
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Certificate Border Box */}
      <div
        className={`p-6 rounded-2xl border-2 relative overflow-hidden ${
          isLight
            ? 'bg-gradient-to-b from-white to-[#f2f3ee] border-emerald/40 shadow-xl'
            : 'bg-gradient-to-b from-[#080F0B] to-[#040A06] border-emerald/50 shadow-[0_0_40px_rgba(0,200,83,0.2)]'
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald/5 rounded-full blur-2xl pointer-events-none"></div>

        {/* Top Badge */}
        <div className="flex justify-between items-start border-b border-emerald/20 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
              <ShieldCheck size={22} />
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald font-bold block">
                CARBONOS DEMO
              </span>
              <h3 className="serif-drama text-lg font-bold text-white tracking-wide">
                Demo Retirement Receipt
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-[9px] text-slate-400 block">SERIAL NUMBER</span>
            <span className="font-mono text-xs font-bold text-emerald">{certificateSerial}</span>
          </div>
        </div>

        {/* Certificate Statement */}
        <div className="space-y-3 text-xs leading-relaxed my-4">
          <p className="text-slate-300">
            This demo receipt records a simulated retirement for{' '}
            <strong className="text-white underline">{companyName}</strong> (BIN: {taxBin}). Nothing was
            retired or neutralized:
          </p>

          <div
            className={`p-3.5 rounded-xl border text-center my-3 ${
              isLight ? 'bg-emerald/5 border-emerald/20' : 'bg-[#0D2B1A]/40 border-emerald/30'
            }`}
          >
            <span className="font-mono text-3xl font-bold text-emerald block">
              {activeCredit.tonnage} <span className="text-lg">tCO₂e</span>
            </span>
            <span className="text-[11px] font-sans text-slate-300">Metric tonnes CO₂e (simulated)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-400 block text-[9px]">ORIGIN PROJECT</span>
              <span className="text-white font-sans font-semibold">{activeCredit.type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">RURAL PRODUCER</span>
              <span className="text-white font-sans font-semibold">
                {activeCredit.farmer} ({activeCredit.region})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">STANDARD & METHODOLOGY</span>
              <span className="text-emerald">{activeCredit.verification}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">SETTLEMENT DATE</span>
              <span className="text-white">{settlementDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">GHG PROTOCOL ALLOCATION</span>
              <span className="text-slate-300 truncate block">{scopeType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px]">MOBILE BANKING REMITTANCE</span>
              <span className="text-emerald">৳{farmerRemittance.toLocaleString()} (97% Disbursed)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] font-mono">
            <div className="truncate mr-2">
              <span className="text-slate-500 block">ON-CHAIN VERIFICATION HASH</span>
              <span className="text-slate-400 truncate block">{verificationHash}</span>
            </div>
            <button
              onClick={handleCopyHash}
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 shrink-0 cursor-pointer"
              title="Copy Proof Hash"
            >
              {copiedSerial ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-emerald/20 text-[10px] text-slate-400">
          <span>Not a regulatory document. No registry, ministry or verifier issued it.</span>
          <span className="font-bold text-emerald">Demo · Carbon Zero BD</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <Button
          variant="secondary"
          size="md"
          onClick={handlePrint}
          className="flex-1"
        >
          <Printer size={14} className="mr-1.5" />
          <span>Print Demo Receipt</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          className="flex-1"
        >
          <CheckCircle2 size={14} className="mr-1.5" />
          <span>Return to Marketplace</span>
        </Button>
      </div>
    </div>
  );
}

export default CertificateStep;
