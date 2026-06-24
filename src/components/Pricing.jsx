import React from 'react';
import { ArrowRight } from 'lucide-react';

const Pricing = () => {
  return (
    <section id="pricing" className="w-full bg-[#080F0B] py-[100px] px-6 lg:px-12 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <span className="font-mono text-xs text-mist tracking-widest px-3 py-1 bg-[#0D2B1A]/40 border border-[#00C853]/10 rounded-full mb-6 inline-block">
            PRICING — TRANSPARENT INFRASTRUCTURE
          </span>
          <h2 className="serif-drama text-[48px] lg:text-[64px] text-white leading-tight">
            Choose Your Scale
          </h2>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Tier 1 */}
          <div className="bg-[#080F0B]/80 registry-border rounded-[1.5rem] p-8 flex flex-col h-full border border-emerald/10">
            <h3 className="font-sans font-bold text-2xl text-registry mb-2">Starter</h3>
            <p className="font-sans text-sm text-mist mb-6">NGOs & Early Projects</p>
            <div className="mb-2">
              <span className="font-mono text-[36px] text-amber">৳50,000</span>
              <span className="font-mono text-sm text-mist"> / month</span>
            </div>
            <p className="font-sans text-sm text-mist mb-8">Up to 5 active projects</p>
            
            <ul className="flex-1 space-y-4 mb-8">
              {[
                {text: 'Project onboarding portal', incl: true},
                {text: 'Basic MRV dashboard', incl: true},
                {text: 'Carbon registry (5 projects)', incl: true},
                {text: 'PDF reporting', incl: true},
                {text: 'Email support', incl: true},
                {text: 'Satellite integration', incl: false},
                {text: 'Marketplace access', incl: false},
                {text: 'API access', incl: false},
              ].map((item, i) => (
                <li key={i} className={`flex items-start text-sm ${item.incl ? 'text-registry' : 'text-mist/40'}`}>
                  <span className={`mr-3 ${item.incl ? 'text-emerald' : 'text-mist/30'}`}>{item.incl ? '✓' : '✗'}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <button className="ghost-btn w-full py-3 rounded-lg font-sans font-bold text-sm">
              Start Free Trial
            </button>
          </div>

          {/* Tier 2 - Featured */}
          <div className="bg-[#0D2B1A] border border-[#00C853]/40 shadow-[0_0_60px_rgba(0,200,83,0.12)] rounded-[1.5rem] p-8 flex flex-col h-[105%] md:scale-[1.02] relative z-10">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="font-mono text-[11px] text-carbon bg-emerald px-3 py-1 rounded-full font-bold">
                [MOST POPULAR]
              </span>
            </div>
            <h3 className="font-sans font-bold text-2xl text-registry mb-2">Professional</h3>
            <p className="font-sans text-sm text-mist mb-6">Solar & Agri Companies</p>
            <div className="mb-2">
              <span className="font-mono text-[36px] text-emerald">৳1,50,000</span>
              <span className="font-mono text-sm text-mist"> / month</span>
            </div>
            <p className="font-sans text-sm text-mist mb-8">Unlimited projects</p>
            
            <ul className="flex-1 space-y-4 mb-8">
              {[
                'Everything in Starter',
                'Unlimited MRV automation',
                'Satellite integration (Google Earth Engine)',
                'Verification workflow engine',
                'AI fraud detection',
                'API access (10,000 calls/mo)',
                'Marketplace access',
                'Priority support',
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm text-registry">
                  <span className="mr-3 text-emerald">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button className="bg-emerald text-carbon w-full py-3 rounded-lg font-sans font-bold text-sm flex justify-center items-center space-x-2 btn-magnetic">
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Tier 3 */}
          <div className="bg-[#080F0B]/80 registry-border rounded-[1.5rem] p-8 flex flex-col h-full border border-emerald/10">
            <h3 className="font-sans font-bold text-2xl text-registry mb-2">Enterprise</h3>
            <p className="font-sans text-sm text-mist mb-6">Government & Investors</p>
            <div className="mb-2">
              <span className="font-mono text-[36px] text-amber">Custom</span>
            </div>
            <p className="font-sans text-sm text-mist mb-8">National registry scale</p>
            
            <ul className="flex-1 space-y-4 mb-8">
              {[
                'Everything in Professional',
                'Custom registry deployment',
                'White-label option',
                'Dedicated verifier seats',
                'Climate fund integrations',
                '99.9% SLA guarantee',
                'Unlimited API',
                'Government compliance package',
              ].map((item, i) => (
                <li key={i} className="flex items-start text-sm text-registry">
                  <span className="mr-3 text-emerald">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button className="ghost-btn w-full py-3 rounded-lg font-sans font-bold text-sm">
              Contact Sales
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;
