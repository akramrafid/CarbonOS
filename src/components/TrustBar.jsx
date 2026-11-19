import React from 'react';
import { ShieldCheck, CheckCircle2, Globe2, Award, FileCheck, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TrustBar = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const items = [
    { label: "GHG Protocol Corporate Standard", badge: "METHOD", icon: ShieldCheck },
    { label: "No default grid factor: cited, approved factors only", badge: "POLICY", icon: CheckCircle2 },
    { label: "IPCC 2006 defaults, cited by table and page", badge: "SOURCES", icon: Globe2 },
    { label: "Author and approver are always different people", badge: "CONTROL", icon: Award },
    { label: "Not externally assured until a verifier signs", badge: "AUDIT", icon: FileCheck },
    { label: "97% Instant Settlement Rail", badge: "LIQUIDITY", icon: Layers }
  ];

  // Duplicate the list for seamless continuous looping
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className={`w-full border-y relative overflow-hidden py-3.5 z-20 ${
      isLight ? 'bg-[#EAECE6] border-[#0F291B]/10' : 'bg-[#050C07] border-white/[0.08]'
    }`}>
      {/* Edge gradient fade masks */}
      <div className={`absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r to-transparent z-10 pointer-events-none ${
        isLight ? 'from-[#EAECE6]' : 'from-[#050C07]'
      }`}></div>
      <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l to-transparent z-10 pointer-events-none ${
        isLight ? 'from-[#EAECE6]' : 'from-[#050C07]'
      }`}></div>

      <div className="flex whitespace-nowrap marquee-track min-w-max items-center">
        {duplicatedItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className="flex items-center space-x-3 px-6">
              <div className={`flex items-center space-x-2 border rounded-full px-3.5 py-1 transition-colors ${
                isLight
                  ? 'bg-white/95 hover:bg-white border-[#0F291B]/10 hover:border-[#15803d]/35 shadow-xs'
                  : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-emerald/30'
              }`}>
                <IconComponent size={13} className={`shrink-0 ${isLight ? 'text-[#15803d]' : 'text-emerald'}`} />
                <span className={`font-mono text-xs tracking-wide font-medium ${isLight ? 'text-[#0F291B]' : 'text-white/90'}`}>
                  {item.label}
                </span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isLight
                    ? 'bg-[#E3F2E9] text-[#14532D]'
                    : 'bg-emerald/10 text-emerald border border-emerald/20'
                }`}>
                  {item.badge}
                </span>
              </div>
              <span className={`text-sm font-bold ${isLight ? 'text-[#15803d]/45' : 'text-emerald/40'}`}>·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustBar;

