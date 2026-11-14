import React from 'react';
import { Radio } from 'lucide-react';

export function LivePayoutLedger({ payouts }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start border-t border-border-strong/10 pt-16">
      <div className="lg:col-span-1 space-y-4">
        <span className="font-mono text-[10px] text-accent tracking-wider uppercase font-bold px-2 py-0.5 bg-bg-surface border border-border-strong/20 rounded-full inline-block">
          TRANSPARENCY STREAM
        </span>
        <h2 className="font-sans font-bold text-3xl text-white">Live Community Payout Ledger</h2>
        <p className="text-xs text-mist leading-relaxed font-sans">
          Carbon Zero BD utilizes an automated mobile financial service pipeline in Bangladesh, connecting carbon revenue directly to localized mobile wallets. Every generated credit routes 97% of funds directly to rural participants instantly.
        </p>
        <div className="p-4 bg-bg-surface/40 border border-border-strong/10 rounded-2xl flex items-start space-x-3.5">
          <Radio className="w-5 h-5 text-accent shrink-0 animate-pulse mt-0.5" />
          <div className="text-xs font-sans">
            <span className="font-bold text-white block">Active Mobile Banking Integration</span>
            <span className="text-mist mt-0.5 block">Direct payout latency averages under 12 seconds per validation scan.</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-bg-surface/20 border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl relative space-y-4 min-w-0">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <span className="font-sans font-bold text-sm text-white">Recent Micro-disbursements</span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald bg-emerald/10 border border-emerald/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping mr-1"></span>
            LIVE
          </span>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {payouts.map(p => (
            <div key={p.id} className="p-3 bg-bg-canvas/80 border border-white/5 rounded-2xl flex items-center justify-between gap-3 text-xs font-sans hover:border-border-strong/20 transition-all min-w-0">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald/10 flex items-center justify-center text-emerald font-bold shrink-0">
                  ৳
                </div>
                <div className="text-left leading-none min-w-0">
                  <div className="font-bold text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-mist/60 font-mono mt-0.5 truncate">{p.district} District • {p.sector}</div>
                </div>
              </div>
              <div className="text-right leading-none shrink-0">
                <div className="font-mono font-bold text-amber text-sm">+৳{p.amount} BDT</div>
                <div className="text-[9px] text-mist/40 font-mono mt-1">{p.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LivePayoutLedger;
