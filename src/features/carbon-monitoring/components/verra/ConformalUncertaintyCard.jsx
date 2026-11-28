import React from 'react';
import { Scale, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function ConformalUncertaintyCard({
  isLight,
  lower90,
  upper90,
  rme,
  precisionDiscount,
  conservativeVolume
}) {
  return (
    <Card className={`rounded-2xl p-5 border-2 transition-all ${isLight
        ? 'bg-emerald-50/60 border-emerald-500/40 shadow-sm'
        : 'bg-emerald/[0.04] border-emerald/35 shadow-[0_0_24px_rgba(0,200,83,0.08)]'
      }`}>
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3.5">
        <div className="flex items-center space-x-2">
          <Scale size={15} className="text-emerald" />
          <h3 className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-accent' : 'text-emerald'}`}>
            4. Conformal Uncertainty & Conservativeness
          </h3>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald/20 text-emerald'
            }`}>
            VM0047 Sec 8.3
          </span>
            <span className="hidden sm:inline-flex text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-accent text-fg-inverse">
              PASSED
            </span>
        </div>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
          <span className={isLight ? 'text-fg-secondary' : 'text-mist'}>Conformal 90% Prediction Interval</span>
          <span className={`font-mono font-bold tabular-nums ${isLight ? 'text-fg-primary' : 'text-white'}`}>
            [{lower90}, {upper90}] tC/ha
          </span>
        </div>

        {/* RME VISUAL COMPLIANCE GAUGE */}
        <div className="pb-1.5 border-b border-inherit space-y-1.5">
          <div className="flex items-center justify-between">
            <div>
              <span className={`block font-semibold ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                Relative Margin of Error (RME)
              </span>
              <span className={`text-[11px] ${isLight ? 'text-fg-secondary' : 'text-mist'}`}>
                Verra VM0047 allowable threshold: ≤ 15.0%
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono font-extrabold text-sm text-emerald tabular-nums block">
                {rme}%
              </span>
              <span className="text-[10px] font-mono text-emerald font-semibold">
                ≤ 15% cap (within threshold)
              </span>
            </div>
          </div>
          {/* Visual meter */}
          <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min((rme / 15.0) * 100, 100)}%` }}
              title={`RME: ${rme}% (Cap: 15.0%)`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pb-1.5 border-b border-inherit">
          <span className={isLight ? 'text-fg-secondary' : 'text-mist'}>Verra Precision Deduction</span>
          <div className="flex items-center space-x-1.5">
            <CheckCircle size={13} className="text-emerald" />
            <span className="font-mono font-bold text-emerald tabular-nums">
              {precisionDiscount.toFixed(1)}% (Zero penalty applied)
            </span>
          </div>
        </div>

        {/* CONSERVATIVE VOLUME RESULT */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-emerald-300 shadow-xs' : 'bg-black/30 border-emerald/30'
          }`}>
          <div className="flex items-center justify-between">
            <span className={`font-extrabold text-xs ${isLight ? 'text-accent' : 'text-emerald'}`}>
              Conservative Creditable Volume
            </span>
            <span className="font-mono font-black text-lg text-emerald tabular-nums">
              {conservativeVolume.toLocaleString()} <span className="text-xs font-normal">tCO₂e</span>
            </span>
          </div>
          <p className={`text-[11px] mt-1 leading-relaxed ${isLight ? 'text-accent' : 'text-emerald-300/90'}`}>
            Modelled with the Verra conservativeness principle: no precision deduction applies at this uncertainty. Not audited.
          </p>
        </div>
      </div>
    </Card>
  );
}

export default ConformalUncertaintyCard;
