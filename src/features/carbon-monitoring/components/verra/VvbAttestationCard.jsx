import React from 'react';
import { Award, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function VvbAttestationCard({ isLight }) {
  return (
    <Card className={`lg:col-span-2 rounded-2xl p-5 md:p-7 border transition-all ${
      isLight ? 'bg-white border-border-subtle shadow-xs' : 'bg-bg-elevated border-border-subtle'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-inherit mb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Award size={18} className="text-emerald" />
            <h3 className={`font-extrabold text-base md:text-lg font-sans tracking-tight ${
              isLight ? 'text-fg-primary' : 'text-white'
            }`}>
              7. VVB Attestation (not yet performed)
            </h3>
          </div>
          <p className={`text-xs ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            No VVB has attested this calculation. These are the fields a verifier would review and sign.
          </p>
        </div>

        <div className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-extrabold uppercase border flex items-center space-x-2 ${
          isLight ? 'bg-accent-muted text-accent border-border-subtle' : 'bg-emerald/10 text-emerald border-emerald/25'
        }`}>
          <Check size={14} />
          <span>NOT VALIDATED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/[0.02] border-white/10'
        }`}>
          <span className={`block font-bold text-xs uppercase tracking-wider mb-2 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Reference Methodologies
          </span>
          <ul className="space-y-1.5 font-medium">
            <li className="flex items-center space-x-1.5">
              <Check size={12} className="text-emerald shrink-0" />
              <span>Verra VM0047 (v1.0) Methodology</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <Check size={12} className="text-emerald shrink-0" />
              <span>Verra VM0048 Dynamic Baseline</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <Check size={12} className="text-emerald shrink-0" />
              <span>IPCC 2019 Refinement Tier-3</span>
            </li>
          </ul>
        </div>

        <div className={`p-4 rounded-xl border ${
          isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/[0.02] border-white/10'
        }`}>
          <span className={`block font-bold text-xs uppercase tracking-wider mb-2 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            VVB Attestation
          </span>
          <p className={`text-[11px] leading-relaxed ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
            Not yet attested. A VVB would check the satellite telemetry, synthetic control counterfactual modelling, multi-pool allometry and conformal error bounds against ground-truth plots.
          </p>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/[0.02] border-white/10'
        }`}>
          <div>
            <span className={`block font-bold text-xs uppercase tracking-wider mb-1 ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              Signature
            </span>
            <span className={`font-serif italic text-sm font-bold block mt-1 ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              Not signed
            </span>
            <span className={`text-[10px] block ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
              No verifier has signed this dossier
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Timestamp:</span>
            <span className="text-emerald font-bold">{new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default VvbAttestationCard;
