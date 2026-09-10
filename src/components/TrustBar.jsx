import React from 'react';
import { ShieldCheck, CheckCircle2, Globe2, Award, FileCheck, Layers } from 'lucide-react';

const TrustBar = () => {
  const items = [
    { label: "MoEFCC S.R.O. 349 Aligned", badge: "STATUTORY", icon: ShieldCheck },
    { label: "DoE Grid Baseline 0.550 kg CO₂e/kWh", badge: "OFFICIAL", icon: CheckCircle2 },
    { label: "UNFCCC Article 6.2 ITMO Ready", badge: "GLOBAL", icon: Globe2 },
    { label: "Verra VCS & Gold Standard Synced", badge: "REGISTRY", icon: Award },
    { label: "ISO 14064-2 Verified Telemetry", badge: "AUDIT", icon: FileCheck },
    { label: "97% Instant Settlement Rail", badge: "LIQUIDITY", icon: Layers }
  ];

  // Duplicate the list for seamless continuous looping
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="w-full bg-[#050C07] border-y border-white/[0.08] relative overflow-hidden py-3.5 z-20">
      {/* Edge gradient fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050C07] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050C07] to-transparent z-10 pointer-events-none"></div>

      <div className="flex whitespace-nowrap marquee-track min-w-max items-center">
        {duplicatedItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="flex items-center space-x-3 px-6">
              <div className="flex items-center space-x-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-emerald/30 rounded-full px-3.5 py-1 transition-colors">
                <IconComponent size={13} className="text-emerald shrink-0" />
                <span className="font-mono text-xs text-white/90 tracking-wide font-medium">
                  {item.label}
                </span>
                <span className="bg-emerald/10 text-emerald text-[9px] font-mono px-1.5 py-0.2 rounded border border-emerald/20 font-bold">
                  {item.badge}
                </span>
              </div>
              <span className="text-emerald/40 text-sm font-bold">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBar;

