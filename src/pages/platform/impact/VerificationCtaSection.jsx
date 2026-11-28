import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileCheck, Coins, ArrowRight } from 'lucide-react';

export function VerificationCtaSection() {
  return (
    <>
      {/* Auditing Methodology & Pipeline */}
      <div className="border-t border-border-strong/15 pt-16 space-y-10">
        <div className="text-center space-y-3">
          <span className="font-mono text-xs text-accent tracking-wider uppercase font-bold">
            VERIFICATION STANDARDS
          </span>
            <h2 className="font-sans font-bold text-3xl text-fg-primary">How Carbon Zero BD Validates Impact</h2>
            <p className="text-sm text-fg-secondary max-w-xl mx-auto font-sans leading-relaxed">
              Our triple-tier monitoring framework secures audit integrity from hardware node to registry issuance.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 hover:border-border-strong transition-all">
                <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                  <h4 className="font-sans font-bold text-base text-fg-primary mb-2">1. Satellite Telemetry</h4>
                  <p className="text-xs text-fg-secondary leading-relaxed font-sans">
                    Google Earth Engine integrations track soil organic carbon, canopy coverage, and moisture indexes, delivering independent geographic validation.
                  </p>
              </div>

                  <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 hover:border-border-strong transition-all">
                    <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-accent mb-4">
                      <FileCheck className="w-5 h-5" />
                    </div>
                      <h4 className="font-sans font-bold text-base text-fg-primary mb-2">2. IoT Sensor Streams</h4>
                      <p className="text-xs text-fg-secondary leading-relaxed font-sans">
                        Blynk IoT hardware nodes measure raw voltage, fuel levels, and telemetry inputs directly from equipment, cross-referencing fuel savings at the source.
                      </p>
                  </div>

                      <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 hover:border-border-strong transition-all">
                        <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center text-amber-700 dark:text-amber-400 mb-4">
                          <Coins className="w-5 h-5" />
                        </div>
                          <h4 className="font-sans font-bold text-base text-fg-primary mb-2">3. Direct Ledger Audit</h4>
                          <p className="text-xs text-fg-secondary leading-relaxed font-sans">
                            Financial flows are hardcoded to mobile wallet invoices. Auditing firms trace purchase capital directly to corresponding farmers' mobile banking statements.
                          </p>
                      </div>
                    </div>
                  </div>

                  {/* Partner Call-to-Action */}
                    <div className="bg-bg-surface border border-border-strong rounded-[2rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full pointer-events-none"></div>
                      <div className="space-y-3 max-w-2xl text-left">
                          <h3 className="font-sans font-bold text-2xl sm:text-3xl text-fg-primary">Join the Sustainable Revolution</h3>
                          <p className="text-xs sm:text-sm text-fg-secondary leading-relaxed font-sans">
                            Whether you are an enterprise looking to purchase certified offsets, a project developer planning clean infrastructure, or an auditor validating metrics—Carbon Zero BD provides the tools.
                          </p>
                      </div>
                      <div className="flex flex-wrap gap-4 shrink-0">
                        <Link
                          to="/platform/marketplace"
                          className="bg-accent hover:bg-accent-hover text-fg-inverse font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                        >
                          <span>Offset Footprint</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to="/platform/project-onboarding"
                          className="bg-bg-elevated border border-border-strong hover:border-accent text-fg-primary font-sans font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                        >
                          Onboard Project
                        </Link>
                      </div>
                    </div>
                  </>
                  );
}

                  export default VerificationCtaSection;
