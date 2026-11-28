import React from 'react';
import { TrendingDown, Zap, Truck, ShieldCheck } from 'lucide-react';

export function HotspotsAndCommitmentsSection({ activeClient, hotspots, fmt }) {
  return (
    <>
      {/* Section 4: Hotspots & Pareto Analysis */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-accent font-bold">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Section 4 • Pareto Hotspot Analysis (Significant Sources)</span>
        </div>

            <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-3">
              <p className="text-xs text-fg-secondary">
                The top 5 emission drivers account for over <strong>85%</strong> of total corporate emissions, presenting prime targets for prioritized decarbonization intervention:
              </p>

              <div className="space-y-2 pt-2">
                {hotspots.map((h) => (
                    <div key={h.rank} className="p-3 rounded-xl bg-bg-canvas border border-border-subtle flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-full bg-accent/15 text-accent font-mono font-bold flex items-center justify-center text-xs shrink-0">
                            {h.rank}
                          </span>
                          <div>
                            <span className="font-bold text-fg-primary block">{h.name}</span>
                            <span className="text-[10px] text-fg-secondary font-mono">{h.category} • {h.site}</span>
                          </div>
                      </div>

                        <div className="text-right font-mono shrink-0">
                          <span className="font-bold text-fg-primary block">{fmt(h.tCO2e, 2)} tCO₂e</span>
                          <span className="text-[10px] text-accent block">{h.percentage}% of footprint</span>
                        </div>
                      </div>
            ))}
                    </div>
                  </div>
      </section>

              {/* Section 5: Decarbonization Targets & Insetting Roadmap */}
              <section className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-accent font-bold">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Section 5 • Decarbonization Commitments & Insetting</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                          <TrendingDown className="w-4 h-4" />
                          <span>2030 Science-Based Target</span>
                        </div>
                          <h4 className="font-bold text-lg text-fg-primary font-mono">-35% Absolute</h4>
                          <p className="text-xs text-fg-secondary leading-relaxed">
                            Commitment to reduce absolute Scope 1 and Scope 2 emissions by 35% by 2030 from the 2024 baseline.
                          </p>
                      </div>

                          <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-2">
                            <div className="flex items-center space-x-2 text-sky-700 dark:text-sky-400 font-bold text-xs">
                              <Zap className="w-4 h-4" />
                              <span>On-Site Rooftop Solar</span>
                            </div>
                              <h4 className="font-bold text-lg text-fg-primary font-mono">PPA Net-Metering</h4>
                              <p className="text-xs text-fg-secondary leading-relaxed">
                                Displacing fossil grid electricity via high-efficiency industrial rooftop solar installations across central facilities.
                              </p>
                          </div>

                              <div className="p-5 rounded-2xl bg-bg-surface border border-border-subtle space-y-2">
                                <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-400 font-bold text-xs">
                                  <Truck className="w-4 h-4" />
                                  <span>Fleet Electrification</span>
                                </div>
                                  <h4 className="font-bold text-lg text-fg-primary font-mono">Zero-Tailpipe</h4>
                                  <p className="text-xs text-fg-secondary leading-relaxed">
                                    Phased replacement of internal combustion logistics vans and service units with electric two-wheelers and commercial EV trikes.
                                  </p>
                              </div>
                            </div>
                          </section>

                          {/* Section 6: Verification Readiness & Attestation */}
                          <section className="space-y-4">
                            <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-accent font-bold">
                              <span className="w-2 h-2 rounded-full bg-accent" />
                              <span>Section 6 • Assurance Readiness & Attestation Statement</span>
                            </div>

                              <div className="p-6 rounded-2xl bg-bg-surface border border-border-subtle space-y-6">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                  <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
                                        <ShieldCheck className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <h4 className="font-sans font-bold text-base text-fg-primary">Pre-Assurance Readiness: 96.8%</h4>
                                        <p className="text-xs text-fg-secondary">All material Scope 1 and Scope 2 items are backed by primary invoices.</p>
                                      </div>
                                    </div>

                                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      Auditor Approved
                                    </span>
                                  </div>

                                  {/* Signature Block */}
                                  <div className="pt-6 border-t border-border-subtle/40 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                                    <div>
                                      <span className="text-gray-400 text-[10px] uppercase font-mono block">ATTESTING LEAD ASSURANCE OFFICER</span>
                                      <span className="font-bold text-white text-sm mt-1 block">{activeClient.assignedAuditor}</span>
                                      <span className="text-xs text-accent block mt-0.5">CarbonZero Bangladesh Audit & Assurance Directorate</span>
                                    </div>

                                    <div>
                                      <span className="text-gray-400 text-[10px] uppercase font-mono block">STATEMENT DATE & JURISDICTION</span>
                                      <span className="font-mono text-white text-sm mt-1 block">{new Date().toISOString().slice(0, 10)}</span>
                                      <span className="text-xs text-gray-400 block mt-0.5">Dhaka, People's Republic of Bangladesh</span>
                                    </div>
                                  </div>
                                </div>
                              </section>
                            </>
                            );
}

                            export default HotspotsAndCommitmentsSection;
