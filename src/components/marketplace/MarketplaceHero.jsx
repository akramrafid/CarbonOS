import React from 'react';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export function MarketplaceHero({ isLight = false }) {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border p-8 md:p-12 transition-colors duration-300">
        {/* [COMMENTED OUT FOR PERSONAL REFERENCE — removed decorative ambient blur element] */}

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold tracking-widest px-3 py-1 bg-emerald/10 border border-emerald/30 text-emerald rounded-full uppercase flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping mr-1" />
                CARBON ZERO BD • DEMO MARKETPLACE
              </span>
                <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-bg-muted border border-border-subtle text-fg-secondary">
                  Demo listings: not registered or verified
                </span>
            </div>

            <h1
              className="serif-drama text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-fg-primary"
            >
              Institutional Carbon Marketplace
            </h1>

            <p
              className="font-sans text-base sm:text-lg max-w-2xl leading-relaxed text-fg-secondary"
            >
              Illustrative demo credit listings (not registered on-chain or externally verified), modeling a{' '}
              <strong className="text-accent">97% direct liquidity</strong> target to farmer mobile wallets.
            </p>
          </div>

          {/* Quick Guarantees Badge Group */}
          <div
            className="p-4 rounded-2xl border flex flex-col space-y-2.5 shrink-0 text-xs bg-bg-surface border-border-strong shadow-sm"
          >
              <div className="flex items-center space-x-2 text-accent font-semibold">
                <CheckCircle2 size={16} />
                <span>97% Instant Mobile Banking Remittance</span>
              </div>
                <div className="flex items-center space-x-2 text-fg-secondary">
                  <ShieldCheck size={16} className="text-amber-700 dark:text-amber-500" />
                  <span>Not yet audited by any standard body</span>
                </div>
                  <div className="flex items-center space-x-2 text-fg-secondary">
                    <Zap size={16} className="text-cyan-700 dark:text-cyan-400" />
                    <span>Zero Brokerage / 0% Intermediary Fee</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spot Ticker & Metric Strip */}
            <div
              className="rounded-2xl border overflow-hidden transition-all bg-bg-surface border-border-strong"
            >
              <div
                className="px-4 py-2 border-b flex items-center space-x-6 overflow-x-auto text-[11px] font-mono no-scrollbar bg-bg-elevated/60 border-border-subtle"
              >
                  <span className="font-bold text-accent shrink-0 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span>LIVE SPOT TICKER:</span>
                  </span>
                  <div className="flex items-center space-x-6 shrink-0">
                    <span className="text-fg-secondary">BD-SOLAR (demo): <strong className="text-fg-primary">৳1,450/t</strong> <span className="text-accent font-bold">▲+2.4%</span></span>
                    <span className="text-fg-secondary">BD-MANGROVE (demo): <strong className="text-fg-primary">৳1,820/t</strong> <span className="text-accent font-bold">▲+3.8%</span></span>
                    <span className="text-fg-secondary">BD-AWD RICE (demo): <strong className="text-fg-primary">৳1,250/t</strong> <span className="text-accent font-bold">▲+1.5%</span></span>
                    <span className="text-fg-secondary">BD-COOKSTOVE (demo): <strong className="text-fg-primary">৳980/t</strong> <span className="text-fg-muted">▼-0.4%</span></span>
                    <span className="text-fg-secondary">BD-BIOGAS (demo): <strong className="text-fg-primary">৳1,320/t</strong> <span className="text-accent font-bold">▲+1.9%</span></span>
                    <span className="text-fg-secondary">BD-BRICK KILN (demo): <strong className="text-fg-primary">৳1,100/t</strong> <span className="text-accent font-bold">▲+0.8%</span></span>
                  </div>
              </div>

              {/* 4 StatCards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                <StatCard
                  title="Listed Inventory (demo)"
                  value="84,250"
                  unit="tCO₂e"
                  subtitle="Not issued under any registry"
                />
                <StatCard
                  title="Average Clean Settlement"
                  value="৳1,420"
                  unit="/ tCO₂e"
                  subtitle="0% Platform Brokerage Mark-up"
                  trend="up"
                />
                <StatCard
                  title="Direct Farmer Disbursal"
                  value="৳112.4M"
                  unit="97% Rate"
                  subtitle="Instant Mobile Wallet Remittance"
                  trend="up"
                />
                <StatCard
                  title="Smart Escrow Finality"
                  value="< 6.8s"
                  unit="Settle"
                  subtitle="Automated Ledger Retires Batch"
                />
              </div>
            </div>
          </div>
          );
}

          export default MarketplaceHero;
