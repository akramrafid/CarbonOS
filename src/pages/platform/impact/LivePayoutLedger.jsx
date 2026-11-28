import React from 'react';
import { Radio } from 'lucide-react';

export function LivePayoutLedger({ payouts }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start border-t border-border-strong/10 pt-16">
      <div className="lg:col-span-1 space-y-4">
          <span className="font-mono text-[10px] text-amber-800 dark:text-amber-400 tracking-wider uppercase font-bold px-2 py-0.5 bg-bg-surface border border-amber-500/25 rounded-full inline-block">
            DEMO SIMULATION STREAM
          </span>
            <h2 className="font-sans font-bold text-3xl text-fg-primary">Community Payout Ledger (Demo Simulation)</h2>
            <p className="text-xs text-fg-secondary leading-relaxed font-sans">
              Illustrative disbursement feed demonstrating Carbon Zero BD&apos;s planned MFS payout routing (97% grower revenue share model; sample data only).
            </p>
              <div className="p-4 bg-bg-surface border border-border-subtle rounded-2xl flex items-start space-x-3.5">
                <Radio className="w-5 h-5 text-accent shrink-0 animate-pulse mt-0.5" />
                <div className="text-xs font-sans">
                  <span className="font-bold text-fg-primary block">Simulated Mobile Banking Preview</span>
                  <span className="text-fg-secondary mt-0.5 block">Target MFS webhook payout latency under 12s per verified batch (illustrative demo entries).</span>
                </div>
              </div>
            </div>

                  <div className="lg:col-span-2 bg-bg-surface border border-border-subtle rounded-3xl p-4 sm:p-6 shadow-2xl relative space-y-4 min-w-0">
                    <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                      <span className="font-sans font-bold text-sm text-fg-primary">Sample Micro-disbursements</span>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                        DEMO SIM
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {payouts.map(p => (
                          <div key={p.id} className="p-3 bg-bg-elevated border border-border-subtle rounded-2xl flex items-center justify-between gap-3 text-xs font-sans hover:border-border-strong transition-colors min-w-0">
                            <div className="flex items-center space-x-3.5 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold shrink-0">
                                  ৳
                                </div>
                                <div className="text-left leading-none min-w-0">
                                  <div className="font-bold text-fg-primary truncate">{p.name}</div>
                                  <div className="text-[10px] text-fg-secondary font-mono mt-0.5 truncate">{p.district} District • {p.sector}</div>
                                </div>
                              </div>
                              <div className="text-right leading-none shrink-0">
                                <div className="font-mono font-bold text-amber-800 dark:text-amber-400 text-sm">+৳{p.amount} BDT</div>
                                <div className="text-[9px] text-fg-muted font-mono mt-1">{p.time}</div>
                              </div>
                            </div>
          ))}
                          </div>
                        </div>
    </div>
                    );
}

                    export default LivePayoutLedger;
