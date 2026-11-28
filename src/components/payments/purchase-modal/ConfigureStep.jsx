import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

export function ConfigureStep({
  isLight,
  activeCredit,
  farmerRemittance,
  companyName,
  setCompanyName,
  taxBin,
  setTaxBin,
  scopeType,
  setScopeType,
  retireImmediately,
  setRetireImmediately,
  onProceed
}) {
  return (
    <div className="space-y-5">
      {/* Credit Summary Card */}
      <div
        className={`p-4 rounded-xl border ${isLight ? 'bg-bg-canvas/60 border-border-strong' : 'bg-bg-canvas border-emerald/20'
          }`}
      >
          <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
            <div>
                <span className="font-mono text-[10px] font-bold text-amber-800 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded mr-2">
                  {activeCredit.verification}
                </span>
                  <span className="font-mono text-[10px] text-fg-secondary">ID: {activeCredit.id}</span>
                  <h3 className="text-base font-bold mt-1 text-fg-primary">
                    {activeCredit.type}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[11px] text-fg-secondary block">TOTAL SETTLEMENT</span>
                  <span className="font-bold text-xl text-accent">৳{activeCredit.price.toLocaleString()}</span>
                </div>
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border-subtle text-xs">
                <div>
                    <span className="text-[10px] text-fg-secondary block font-mono">VOLUME</span>
                    <span className="font-semibold text-fg-primary">
                      {activeCredit.tonnage} tCO₂e
                    </span>
                </div>
                <div>
                    <span className="text-[10px] text-fg-secondary block font-mono">ORIGIN & PRODUCER</span>
                    <span className="font-semibold truncate block text-fg-primary">
                      {activeCredit.region}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] text-fg-secondary block font-mono">97% FARMER REMITTANCE</span>
                    <span className="font-semibold text-accent font-mono">
                      ৳{farmerRemittance.toLocaleString()}
                    </span>
                </div>
              </div>
            </div>

            {/* Corporate Buyer Form */}
            <div className="space-y-3.5">
              <h4
                className="text-xs font-mono font-bold tracking-wider uppercase text-fg-primary"
              >
                Corporate Beneficiary Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-fg-secondary mb-1">Company / Entity Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border font-medium focus:outline-none focus:border-accent bg-bg-surface border-border-subtle text-fg-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-fg-secondary mb-1">Tax Identification / BIN</label>
                  <input
                    type="text"
                    value={taxBin}
                    onChange={(e) => setTaxBin(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border font-mono focus:outline-none focus:border-accent bg-bg-surface border-border-subtle text-fg-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">GHG Protocol Scope Allocation</label>
                <select
                  value={scopeType}
                  onChange={(e) => setScopeType(e.target.value)}
                  className={`w-full p-2.5 text-xs rounded-lg border font-medium focus:outline-none focus:border-emerald ${isLight
                      ? 'bg-white border-slate-300 text-fg-primary'
                      : 'bg-bg-canvas border-white/10 text-white'
                    }`}
                >
                  <option>Scope 1 (Direct Facility Fuel & Gas Combustion)</option>
                  <option>Scope 2 (Purchased Electricity & Grid Steam)</option>
                  <option>Scope 3 (Supply Chain, Agriculture & Raw Materials)</option>
                </select>
              </div>

              {/* Immediate Retirement Toggle */}
              <div
                onClick={() => setRetireImmediately(!retireImmediately)}
                className={`flex items-start space-x-3 p-3.5 rounded-xl border cursor-pointer transition-all ${retireImmediately
                    ? isLight
                      ? 'bg-accent-muted border-border-strong/30'
                      : 'bg-emerald/10 border-emerald/30'
                    : isLight
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-white/5 border-white/5'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={retireImmediately}
                  onChange={() => { }}
                  className="mt-0.5 accent-emerald cursor-pointer"
                />
                <div>
                  <span
                    className={`text-xs font-bold block ${retireImmediately
                        ? isLight
                          ? 'text-accent'
                          : 'text-emerald'
                        : isLight
                          ? 'text-fg-primary'
                          : 'text-white'
                      }`}
                  >
                    Permanent Retirement & Immediate Certificate Issuance
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Permanently burns the credits on the ledger. Serial numbers are locked to your entity for CSRD /
                    ESG compliance and cannot be resold.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="md"
                onClick={onProceed}
                className="w-full sm:w-auto"
              >
                <span>Continue to Corporate Settlement</span>
                <ArrowRight size={16} className="ml-1.5" />
              </Button>
            </div>
          </div>
          );
}

          export default ConfigureStep;
