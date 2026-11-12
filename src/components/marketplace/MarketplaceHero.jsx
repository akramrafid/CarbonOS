import React from 'react';
import { CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export function MarketplaceHero({ isLight = false }) {
  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border p-8 md:p-12 transition-all duration-300">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold tracking-widest px-3 py-1 bg-emerald/10 border border-emerald/30 text-emerald rounded-full uppercase flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-ping mr-1" />
                CARBON ZERO BD • DEMO MARKETPLACE
              </span>
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                Demo listings: not registered or verified
              </span>
            </div>

            <h1
              className={`serif-drama text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] ${
                isLight ? 'text-fg-primary' : 'text-white'
              }`}
            >
              Institutional Carbon Marketplace
            </h1>

            <p
              className={`font-sans text-base sm:text-lg max-w-2xl leading-relaxed ${
                isLight ? 'text-fg-secondary' : 'text-slate-300'
              }`}
            >
              Acquire carbon credits directly from Bangladesh's rural climate stewards. Full on-chain telemetry, zero double-counting, and{' '}
              <strong className="text-emerald">97% direct liquidity</strong> disbursed to farmer mobile wallets.
            </p>
          </div>

          {/* Quick Guarantees Badge Group */}
          <div
            className={`p-4 rounded-2xl border flex flex-col space-y-2.5 shrink-0 text-xs ${
              isLight ? 'bg-white border-border-strong shadow-sm' : 'bg-bg-canvas border-emerald/20 shadow-xl'
            }`}
          >
            <div className="flex items-center space-x-2 text-emerald font-semibold">
              <CheckCircle2 size={16} />
              <span>97% Instant Mobile Banking Remittance</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <ShieldCheck size={16} className="text-amber-500" />
              <span>Not yet audited by any standard body</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Zap size={16} className="text-cyan-400" />
              <span>Zero Brokerage / 0% Intermediary Fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spot Ticker & Metric Strip */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-border-strong' : 'bg-bg-canvas border-white/10'
        }`}
      >
        <div
          className={`px-4 py-2 border-b flex items-center space-x-6 overflow-x-auto text-[11px] font-mono no-scrollbar ${
            isLight ? 'bg-bg-canvas/80 border-border-strong' : 'bg-bg-canvas border-white/5'
          }`}
        >
          <span className="font-bold text-emerald shrink-0 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span>LIVE SPOT TICKER:</span>
          </span>
          <div className="flex items-center space-x-6 shrink-0">
            <span className="text-slate-400">BD-SOLAR (demo): <strong className="text-white">৳1,450/t</strong> <span className="text-emerald font-bold">▲+2.4%</span></span>
            <span className="text-slate-400">BD-MANGROVE (demo): <strong className="text-white">৳1,820/t</strong> <span className="text-emerald font-bold">▲+3.8%</span></span>
            <span className="text-slate-400">BD-AWD RICE (demo): <strong className="text-white">৳1,250/t</strong> <span className="text-emerald font-bold">▲+1.5%</span></span>
            <span className="text-slate-400">BD-COOKSTOVE (demo): <strong className="text-white">৳980/t</strong> <span className="text-slate-400">▼-0.4%</span></span>
            <span className="text-slate-400">BD-BIOGAS (demo): <strong className="text-white">৳1,320/t</strong> <span className="text-emerald font-bold">▲+1.9%</span></span>
            <span className="text-slate-400">BD-BRICK KILN (demo): <strong className="text-white">৳1,100/t</strong> <span className="text-emerald font-bold">▲+0.8%</span></span>
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
