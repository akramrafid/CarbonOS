import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap, Building2, HelpCircle, FileCheck2 } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="w-full bg-[#040A06] text-white py-28 px-6 lg:px-12 relative overflow-hidden border-t border-white/10">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-emerald-950/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-[#00C853]/40 text-[#00E676] font-mono text-xs font-semibold uppercase tracking-wider mb-5 shadow-[0_0_15px_rgba(0,230,118,0.15)]">
            <span>Sovereign Infrastructure SaaS & Node Licensure</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white leading-tight">
            Predictable Scaling for{' '}
            <span className="bg-gradient-to-r from-[#00E676] via-[#10B981] to-[#00C853] bg-clip-text text-transparent font-extrabold">
              Carbon Developers
            </span>
          </h2>
          <p className="font-sans text-base sm:text-lg text-white/70 mt-4 leading-relaxed">
            Deploy automated MRV, satellite data pipelines, and sovereign ledger registry nodes with zero hidden transaction tariffs.
          </p>

          {/* Billing Interval Toggle Switch */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-[#08150D] border border-[#183822] shadow-lg backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2.5 rounded-xl text-xs font-sans font-semibold transition-all duration-200 cursor-pointer ${
                !isAnnual 
                  ? 'bg-white text-black shadow-md font-bold' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2.5 rounded-xl text-xs font-sans font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                isAnnual 
                  ? 'bg-[#00C853] text-[#050C07] font-bold shadow-[0_0_20px_rgba(0,200,83,0.35)]' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Annual Settlement</span>
              <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isAnnual 
                  ? 'bg-[#050C07]/20 text-[#050C07]' 
                  : 'bg-[#00C853]/20 text-[#00E676] border border-[#00C853]/30'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
          
          {/* Tier 1: Project Developer */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 shadow-xl relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">Starter Node</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">Tier 01</span>
              </div>

              <h3 className="font-sans font-bold text-2xl text-white mb-2 tracking-tight">Project Developer</h3>
              <p className="font-sans text-xs text-white/60 mb-6 leading-relaxed">
                For local NGOs, solar developers, and clean cookstove sponsors onboarding early project batches.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#FFB300]">
                    ৳{isAnnual ? '40,000' : '50,000'}
                  </span>
                  <span className="font-mono text-xs text-white/50">/ month</span>
                </div>
                <div className="text-[11px] font-mono text-white/40 mt-1">
                  {isAnnual ? 'Billed annually ৳4,80,000 / yr' : 'Billed monthly on invoice'}
                </div>
              </div>

              <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 font-semibold">Included Capabilities:</div>
              <ul className="space-y-3 mb-8 text-xs font-sans text-white/80">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Up to <strong>5 Active Project Sites</strong> on registry</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Basic IoT telemetry sync (Blynk / HTTP API)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Automated PDF verification dossiers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Direct bKash / Nagad rural payout settlement</span>
                </li>
                <li className="flex items-start gap-2.5 text-white/30">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">✕</span>
                  <span>Google Earth Engine multi-spectral analysis</span>
                </li>
                <li className="flex items-start gap-2.5 text-white/30">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[10px]">✕</span>
                  <span>Live primary order book bid placement</span>
                </li>
              </ul>
            </div>

            <Link 
              to="/platform/saas-dashboard" 
              className="w-full py-3.5 rounded-xl font-sans font-semibold text-xs text-center bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/15 hover:border-white/30 transition-all duration-200 block cursor-pointer"
            >
              Deploy Starter Node
            </Link>
          </div>

          {/* Tier 2: Institutional (Most Popular) */}
          <div className="bg-gradient-to-b from-[#0D2818] to-[#08150D] border-2 border-[#00C853]/60 shadow-[0_0_50px_rgba(0,200,83,0.18)] rounded-[2.2rem] p-8 flex flex-col justify-between relative z-10 group">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="font-mono text-[10px] text-[#050C07] bg-[#00E676] px-3.5 py-1 rounded-full font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(0,230,118,0.4)] flex items-center gap-1.5 border border-[#00E676]">
                <Zap size={12} className="fill-[#050C07] text-[#050C07]" />
                <span>Primary Sovereign Tier</span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <span className="font-mono text-xs uppercase tracking-widest text-[#00E676] font-bold">Institutional Scale</span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#00C853]/20 border border-[#00C853]/40 text-[#00E676] font-bold">
                  RECOMMENDED
                </span>
              </div>

              <h3 className="font-sans font-bold text-2xl text-white mb-2 tracking-tight">Enterprise & Aggregators</h3>
              <p className="font-sans text-xs text-white/70 mb-6 leading-relaxed">
                For commercial solar IPPs, industrial textile mills, agribusiness conglomerates, and registry certifiers.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-black/60 border border-[#00C853]/30">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#00E676]">
                    ৳{isAnnual ? '1,20,000' : '1,50,000'}
                  </span>
                  <span className="font-mono text-xs text-white/50">/ month</span>
                </div>
                <div className="text-[11px] font-mono text-[#00E676]/90 mt-1 font-medium">
                  {isAnnual ? 'Billed annually ৳14,40,000 / yr (Save ৳3,60,000)' : 'Billed monthly on corporate invoice'}
                </div>
              </div>

              <div className="text-xs font-mono uppercase tracking-wider text-[#00E676] mb-3 font-bold">Everything in Starter, Plus:</div>
              <ul className="space-y-3 mb-8 text-xs font-sans text-white/90">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span><strong>Unlimited Project Onboarding</strong> & MRV workflows</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Google Earth Engine Sentinel-2 NDVI & SAR radar pipeline</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>AI satellite fraud & double-crediting verification engine</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Direct wholesale liquidity market access & block trading</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>REST API + Webhooks access (50,000 calls / month)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-[#00E676] shrink-0 mt-0.5" />
                  <span>Dedicated compliance officer & 4-hour SLA response</span>
                </li>
              </ul>
            </div>

            <Link 
              to="/platform/saas-dashboard" 
              className="w-full py-4 rounded-xl font-sans font-bold text-xs text-center bg-[#00C853] hover:bg-[#00E676] text-[#050C07] transition-all duration-200 shadow-[0_0_25px_rgba(0,200,83,0.35)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Provision Institutional Node</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Tier 3: Sovereign & Fund */}
          <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 hover:border-white/20 shadow-xl relative group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-widest text-white/50 font-bold">National Architecture</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">Sovereign</span>
              </div>

              <h3 className="font-sans font-bold text-2xl text-white mb-2 tracking-tight">Government & Climate Funds</h3>
              <p className="font-sans text-xs text-white/60 mb-6 leading-relaxed">
                For ministries, multilateral climate funds, bilateral Article 6.2 partner nations, and sovereign wealth entities.
              </p>

              <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl sm:text-4xl font-extrabold text-cyan-400">
                    Bespoke SLA
                  </span>
                </div>
                <div className="text-[11px] font-mono text-white/40 mt-1">
                  National mandate deployment & isolated VPC
                </div>
              </div>

              <div className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3 font-semibold">Sovereign Capabilities:</div>
              <ul className="space-y-3 mb-8 text-xs font-sans text-white/80">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Dedicated sovereign registry instance & on-premise HSM</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Article 6.2 ITMO authorization & UNFCCC sync protocol</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>White-label ministry portal with multi-department RBAC</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>Unlimited high-throughput cryptographic verification calls</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span>99.98% High Availability Uptime Guarantee with financial SLA</span>
                </li>
              </ul>
            </div>

            <a 
              href="mailto:institutional@carbonzerobd.com" 
              className="w-full py-3.5 rounded-xl font-sans font-semibold text-xs text-center bg-white/[0.06] hover:bg-cyan-500 hover:text-black text-white border border-white/10 hover:border-cyan-500 transition-all duration-200 block"
            >
              Consult Climate Solutions Desk
            </a>
          </div>

        </div>

        {/* Corporate Settlement & Regulatory Compliance Trust Badges */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-emerald-400 shrink-0" />
            <div>
              <div className="font-sans font-bold text-xs text-white">
                Institutional Billing & Regulatory Reconciliation
              </div>
              <div className="text-[11px] font-mono text-white/50">
                Bangladesh Bank RTGS, BEFTN, SWIFT, and Mushak-6.3 VAT invoicing supported
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/70">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>SOC-2 Type II Aligned</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
              <FileCheck2 size={13} className="text-cyan-400" />
              <span>MoEFCC Verified</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>99.98% SLA</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;

