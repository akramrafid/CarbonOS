import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Pricing = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className={`w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-12 relative overflow-hidden border-t ${
      isLight ? 'bg-[#F2F3EE] text-[#0F291B] border-[#0F291B]/10' : 'bg-[#040A06] text-white border-white/10'
    }`}>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header & Billing Interval Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight leading-tight ${
              isLight ? 'text-[#0F291B]' : 'text-white'
            }`}>
              Predictable Scaling for{' '}
              <span className={isLight ? 'text-[#15803d]' : 'text-[#00E676]'}>
                Carbon Developers
              </span>
            </h2>
            <p className={`font-sans text-base sm:text-lg mt-3 leading-relaxed ${
              isLight ? 'text-[#37473E]' : 'text-white/70'
            }`}>
              Sovereign infrastructure SaaS and node licensure with automated MRV pipelines and zero hidden transaction tariffs.
            </p>
          </div>

          {/* Billing Interval Switch */}
          <div className={`inline-flex flex-wrap items-center p-1 rounded-xl border gap-1 shrink-0 ${
            isLight
              ? 'bg-white border-[#0F291B]/12'
              : 'bg-[#08150D] border-[#183822]'
          }`}>
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer min-h-[38px] ${
                isLight
                  ? !isAnnual
                    ? 'bg-[#0F291B] text-white font-bold'
                    : 'text-[#46574D] hover:text-[#0F291B]'
                  : !isAnnual 
                    ? 'bg-white text-black font-bold' 
                    : 'text-gray-300 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-lg text-xs font-sans font-semibold flex items-center gap-2 transition-colors cursor-pointer min-h-[38px] ${
                isLight
                  ? isAnnual
                    ? 'bg-[#15803d] text-white font-bold'
                    : 'text-[#46574D] hover:text-[#0F291B]'
                  : isAnnual 
                    ? 'bg-[#00C853] text-[#050C07] font-bold' 
                    : 'text-gray-300 hover:text-white'
              }`}
            >
              <span>Annual Settlement</span>
              <span className={`text-[10px] font-mono font-bold uppercase ${
                isLight
                  ? isAnnual ? 'text-[#DCFCE7]' : 'text-[#15803d]'
                  : isAnnual ? 'text-[#050C07]' : 'text-[#00E676]'
              }`}>
                −20%
              </span>
            </button>
          </div>
        </div>

        {/* Unified 3-Column Institutional Pricing Matrix */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 rounded-2xl border overflow-hidden divide-y lg:divide-y-0 lg:divide-x mb-8 ${
          isLight
            ? 'bg-white border-[#0F291B]/12 divide-[#0F291B]/12 shadow-[0_12px_32px_-12px_rgba(15,41,27,0.08)]'
            : 'bg-[#080F0B] border-white/10 divide-white/10'
        }`}>
          
          {/* Tier 1: Project Developer */}
          <div className="p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                  isLight ? 'text-[#556B5E]' : 'text-white/50'
                }`}>Starter Node</span>
                <span className={`text-[11px] font-mono ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>Tier 01</span>
              </div>

              <h3 className={`font-sans font-bold text-2xl mb-2 tracking-tight ${
                isLight ? 'text-[#0F291B]' : 'text-white'
              }`}>Project Developer</h3>
              <p className={`font-sans text-xs mb-6 leading-relaxed ${
                isLight ? 'text-[#46574D]' : 'text-white/65'
              }`}>
                For local NGOs, solar developers, and clean cookstove sponsors onboarding early project batches.
              </p>

              <div className={`py-4 mb-6 border-y tabular-nums ${
                isLight ? 'border-[#0F291B]/10' : 'border-white/10'
              }`}>
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-mono text-3xl sm:text-4xl font-bold ${
                    isLight ? 'text-[#B45309]' : 'text-[#FFB300]'
                  }`}>
                    ৳{isAnnual ? '40,000' : '50,000'}
                  </span>
                  <span className={`font-mono text-xs ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>/ month</span>
                </div>
                <div className={`text-[11px] font-mono mt-1 ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>
                  {isAnnual ? 'Billed annually ৳4,80,000 / yr' : 'Billed monthly on invoice'}
                </div>
              </div>

              <div className={`text-xs font-mono uppercase tracking-wider mb-3 font-semibold ${
                isLight ? 'text-[#556B5E]' : 'text-white/50'
              }`}>Included Capabilities:</div>
              <ul className={`space-y-3 mb-8 text-xs font-sans ${isLight ? 'text-[#1F3A2A]' : 'text-white/85'}`}>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Up to <strong>5 Active Project Sites</strong> on registry</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Basic IoT telemetry sync (Blynk / HTTP API)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Automated PDF verification dossiers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Direct bKash / Nagad rural payout settlement</span>
                </li>
                <li className={`flex items-start gap-2.5 ${isLight ? 'text-[#84968B]' : 'text-white/35'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                    isLight ? 'border-[#0F291B]/20' : 'border-white/15'
                  }`}>✕</span>
                  <span>Google Earth Engine multi-spectral analysis</span>
                </li>
                <li className={`flex items-start gap-2.5 ${isLight ? 'text-[#84968B]' : 'text-white/35'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] ${
                    isLight ? 'border-[#0F291B]/20' : 'border-white/15'
                  }`}>✕</span>
                  <span>Live primary order book bid placement</span>
                </li>
              </ul>
            </div>

            <Link 
              to="/platform/esg" 
              className={`w-full py-3.5 rounded-xl font-sans font-semibold text-xs text-center border transition-colors block cursor-pointer ${
                isLight
                  ? 'bg-[#F5F8F5] hover:bg-[#E4F2EA] text-[#0F291B] border-[#0F291B]/15'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border-white/15'
              }`}
            >
              Deploy Starter Node
            </Link>
          </div>

          {/* Tier 2: Institutional (Recommended) */}
          <div className={`p-7 sm:p-8 flex flex-col justify-between ${
            isLight
              ? 'bg-[#F7FBF8]'
              : 'bg-[#0B1E13]'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-xs uppercase tracking-wider font-bold ${
                  isLight ? 'text-[#15803d]' : 'text-[#00E676]'
                }`}>Institutional Scale</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  isLight
                    ? 'bg-[#15803d] text-white'
                    : 'bg-[#00C853]/20 border border-[#00C853]/40 text-[#00E676]'
                }`}>
                  RECOMMENDED
                </span>
              </div>

              <h3 className={`font-sans font-bold text-2xl mb-2 tracking-tight ${
                isLight ? 'text-[#0F291B]' : 'text-white'
              }`}>Enterprise & Aggregators</h3>
              <p className={`font-sans text-xs mb-6 leading-relaxed ${
                isLight ? 'text-[#37473E]' : 'text-white/75'
              }`}>
                For commercial solar IPPs, industrial textile mills, agribusiness conglomerates, and registry certifiers.
              </p>

              <div className={`py-4 mb-6 border-y tabular-nums ${
                isLight ? 'border-[#15803d]/20' : 'border-[#00C853]/25'
              }`}>
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-mono text-3xl sm:text-4xl font-bold ${
                    isLight ? 'text-[#15803d]' : 'text-[#00E676]'
                  }`}>
                    ৳{isAnnual ? '1,20,000' : '1,50,000'}
                  </span>
                  <span className={`font-mono text-xs ${isLight ? 'text-[#4A5D52]' : 'text-white/55'}`}>/ month</span>
                </div>
                <div className={`text-[11px] font-mono mt-1 font-medium ${
                  isLight ? 'text-[#14532D]' : 'text-[#00E676]/90'
                }`}>
                  {isAnnual ? 'Billed annually ৳14,40,000 / yr (Save ৳3,60,000)' : 'Billed monthly on corporate invoice'}
                </div>
              </div>

              <div className={`text-xs font-mono uppercase tracking-wider mb-3 font-bold ${
                isLight ? 'text-[#15803d]' : 'text-[#00E676]'
              }`}>Everything in Starter, Plus:</div>
              <ul className={`space-y-3 mb-8 text-xs font-sans ${isLight ? 'text-[#0F291B]' : 'text-white/90'}`}>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span><strong>Unlimited Project Onboarding</strong> & MRV workflows</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Google Earth Engine Sentinel-2 NDVI & SAR radar pipeline</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>AI satellite fraud & double-crediting verification engine</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Direct wholesale liquidity market access & block trading</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>REST API + Webhooks access (50,000 calls / month)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#15803d]' : 'text-[#00E676]'}`} />
                  <span>Dedicated compliance officer & 4-hour SLA response</span>
                </li>
              </ul>
            </div>

            <Link 
              to="/platform/esg" 
              className={`w-full py-3.5 rounded-xl font-sans font-bold text-xs text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                isLight
                  ? 'bg-[#15803d] hover:bg-[#166534] text-white'
                  : 'bg-[#00C853] hover:bg-[#00E676] text-[#050C07]'
              }`}
            >
              <span>Provision Institutional Node</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Tier 3: Sovereign & Fund */}
          <div className="p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`font-mono text-xs uppercase tracking-wider font-semibold ${
                  isLight ? 'text-[#556B5E]' : 'text-white/50'
                }`}>National Architecture</span>
                <span className={`text-[11px] font-mono ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>Sovereign</span>
              </div>

              <h3 className={`font-sans font-bold text-2xl mb-2 tracking-tight ${
                isLight ? 'text-[#0F291B]' : 'text-white'
              }`}>Government & Climate Funds</h3>
              <p className={`font-sans text-xs mb-6 leading-relaxed ${
                isLight ? 'text-[#46574D]' : 'text-white/65'
              }`}>
                For ministries, multilateral climate funds, bilateral Article 6.2 partner nations, and sovereign wealth entities.
              </p>

              <div className={`py-4 mb-6 border-y ${
                isLight ? 'border-[#0F291B]/10' : 'border-white/10'
              }`}>
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-mono text-3xl sm:text-4xl font-bold ${
                    isLight ? 'text-[#0369a1]' : 'text-cyan-400'
                  }`}>
                    Bespoke SLA
                  </span>
                </div>
                <div className={`text-[11px] font-mono mt-1 ${isLight ? 'text-[#556B5E]' : 'text-white/50'}`}>
                  National mandate deployment & isolated VPC
                </div>
              </div>

              <div className={`text-xs font-mono uppercase tracking-wider mb-3 font-semibold ${
                isLight ? 'text-[#556B5E]' : 'text-white/50'
              }`}>Sovereign Capabilities:</div>
              <ul className={`space-y-3 mb-8 text-xs font-sans ${isLight ? 'text-[#1F3A2A]' : 'text-white/85'}`}>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#0369a1]' : 'text-cyan-400'}`} />
                  <span>Dedicated sovereign registry instance & on-premise HSM</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#0369a1]' : 'text-cyan-400'}`} />
                  <span>White-label ministry portal with multi-department RBAC</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#0369a1]' : 'text-cyan-400'}`} />
                  <span>Unlimited high-throughput cryptographic verification calls</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className={`shrink-0 mt-0.5 ${isLight ? 'text-[#0369a1]' : 'text-cyan-400'}`} />
                  <span>99.98% High Availability Uptime Guarantee with financial SLA</span>
                </li>
              </ul>
            </div>

            <a 
              href="mailto:institutional@carbonzerobd.com" 
              className={`w-full py-3.5 rounded-xl font-sans font-semibold text-xs text-center border transition-colors block ${
                isLight
                  ? 'bg-[#EFF6F9] hover:bg-[#0369a1] text-[#0369a1] hover:text-white border-[#0369a1]/25'
                  : 'bg-white/[0.06] hover:bg-cyan-500 hover:text-black text-white border-white/15 hover:border-cyan-500'
              }`}
            >
              Consult Climate Solutions Desk
            </a>
          </div>

        </div>

        {/* Corporate Settlement & Regulatory Compliance Strip */}
        <div className={`px-6 py-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${
          isLight
            ? 'bg-white border-[#0F291B]/12'
            : 'bg-[#080F0B] border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            <Building2 size={18} className={isLight ? 'text-[#15803d] shrink-0' : 'text-emerald-400 shrink-0'} />
            <div>
              <div className={`font-sans font-semibold text-xs ${isLight ? 'text-[#0F291B]' : 'text-white'}`}>
                Institutional Billing & Regulatory Reconciliation
              </div>
              <div className={`text-[11px] font-mono ${isLight ? 'text-[#556B5E]' : 'text-white/55'}`}>
                Bangladesh Bank RTGS, BEFTN, SWIFT, and Mushak-6.3 VAT invoicing supported
              </div>
            </div>
          </div>

          <div className={`text-xs font-mono font-semibold tabular-nums ${
            isLight ? 'text-[#15803d]' : 'text-emerald-400'
          }`}>
            99.98% SLA
          </div>
        </div>

      </div>
    </section>
  );
};

export default Pricing;

