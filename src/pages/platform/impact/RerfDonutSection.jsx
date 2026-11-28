import React from 'react';
import { Sprout, Wind, Building, RefreshCw } from 'lucide-react';

export function RerfDonutSection({
  rerfSectionRef,
  activeSegment,
  setActiveSegment,
  showToast
}) {
  return (
    <div 
      ref={rerfSectionRef}
      className="border-t border-border-strong/15 pt-16 space-y-12"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="font-mono text-xs text-amber-700 dark:text-amber-400 tracking-wider uppercase font-bold">
          RERF DEPLOYMENT PRIORITIES
        </span>
        <h2 className="font-sans font-bold text-3xl sm:text-4xl text-fg-primary">
          Where the Revolving Fund Flows First
        </h2>
        <p className="text-sm text-fg-secondary max-w-xl mx-auto font-sans leading-relaxed">
          Visualizing the allocation of the Zero Finance Revolving Fund across key ecological infrastructure sectors.
        </p>
      </div>

      {/* Donut & Callout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center max-w-6xl mx-auto">
        {/* Left Side Column: Options 1 & 2 */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
          {/* Option 1: Solar Irrigation */}
          <div 
            onMouseEnter={() => setActiveSegment(1)}
            onMouseLeave={() => setActiveSegment(null)}
            onClick={() => showToast("Solar Irrigation projects are allocated 35% of fund flows.", "info")}
            className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left lg:text-right ${
              activeSegment === 1 
                ? 'bg-bg-surface border-border-strong shadow-lg shadow-[#00C853]/5 -translate-y-1' 
                : 'bg-bg-surface border-border-subtle hover:border-border-strong'
            }`}
          >
            <div className={`hidden lg:block absolute right-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
              activeSegment === 1 ? 'bg-accent' : 'bg-border-subtle'
            }`}></div>

            <div className="flex items-center lg:justify-end space-x-3 mb-2 lg:flex-row-reverse lg:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">35% FLOWS</span>
            </div>
            <h4 className="font-sans font-bold text-sm text-fg-primary mb-1.5">Solar Irrigation</h4>
            <p className="text-xs text-fg-secondary leading-relaxed font-sans">
              Cuts diesel dependency and lowers irrigation costs for farmers.
            </p>
          </div>

          {/* Option 2: Solar-Powered Cold Storage */}
          <div 
            onMouseEnter={() => setActiveSegment(2)}
            onMouseLeave={() => setActiveSegment(null)}
            onClick={() => showToast("Solar Cold Storage setups represent 30% of revolving allocations.", "info")}
            className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left lg:text-right ${
              activeSegment === 2 
                ? 'bg-bg-surface border-accent shadow-lg shadow-[#20E070]/5 -translate-y-1' 
                : 'bg-bg-surface border-border-subtle hover:border-border-strong'
            }`}
          >
            <div className={`hidden lg:block absolute right-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
              activeSegment === 2 ? 'bg-accent' : 'bg-border-subtle'
            }`}></div>

            <div className="flex items-center lg:justify-end space-x-3 mb-2 lg:flex-row-reverse lg:space-x-reverse">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <Wind className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-accent">30% FLOWS</span>
            </div>
            <h4 className="font-sans font-bold text-sm text-fg-primary mb-1.5">Solar-Powered Cold Storage</h4>
            <p className="text-xs text-fg-secondary leading-relaxed font-sans">
              Reduces post-harvest loss; lifts income for farmers and fishers.
            </p>
          </div>
        </div>

        {/* Center Column: Interactive Donut Chart */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center relative select-none">
          <svg viewBox="0 0 120 120" className="w-60 h-60 mx-auto filter drop-shadow-[0_0_25px_rgba(0,200,83,0.05)] transform -rotate-90">
            {/* Slice 1: 35% */}
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="transparent"
              stroke="#00C853"
              strokeWidth={activeSegment === 1 ? "12" : "8"}
              strokeDasharray="88.0 251.3"
              strokeDashoffset="0"
              onMouseEnter={() => setActiveSegment(1)}
              onMouseLeave={() => setActiveSegment(null)}
              onClick={() => showToast("Solar Irrigation projects are allocated 35% of fund flows.", "info")}
              className="transition-all duration-500 ease-out cursor-pointer"
            />

            {/* Slice 2: 30% */}
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="transparent"
              stroke="#20E070"
              strokeWidth={activeSegment === 2 ? "12" : "8"}
              strokeDasharray="75.4 251.3"
              strokeDashoffset="-88.0"
              onMouseEnter={() => setActiveSegment(2)}
              onMouseLeave={() => setActiveSegment(null)}
              onClick={() => showToast("Solar Cold Storage setups represent 30% of revolving allocations.", "info")}
              className="transition-all duration-500 ease-out cursor-pointer"
            />

            {/* Slice 3: 20% */}
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="transparent"
              stroke="#80F5A0"
              strokeWidth={activeSegment === 3 ? "12" : "8"}
              strokeDasharray="50.3 251.3"
              strokeDashoffset="-163.4"
              onMouseEnter={() => setActiveSegment(3)}
              onMouseLeave={() => setActiveSegment(null)}
              onClick={() => showToast("Rooftop Solar in agro-processing consumes 20% of funds.", "info")}
              className="transition-all duration-500 ease-out cursor-pointer"
            />

            {/* Slice 4: 15% */}
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="transparent"
              stroke="#FFB300"
              strokeWidth={activeSegment === 4 ? "12" : "8"}
              strokeDasharray="37.7 251.3"
              strokeDashoffset="-213.7"
              onMouseEnter={() => setActiveSegment(4)}
              onMouseLeave={() => setActiveSegment(null)}
              onClick={() => showToast("Biogas production takes 15% of deployed fund reserves.", "info")}
              className="transition-all duration-500 ease-out cursor-pointer"
            />
          </svg>

          {/* Central Text Panel */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none mt-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-fg-secondary">RERF</span>
            <span className="font-sans font-extrabold text-xl text-fg-primary">৳8.5M</span>
            <span className="font-mono text-[8px] text-accent font-bold">100% DEPLOYED</span>
          </div>
        </div>

        {/* Right Side Column: Options 3 & 4 */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-center">
          {/* Option 3: Rooftop Solar */}
          <div 
            onMouseEnter={() => setActiveSegment(3)}
            onMouseLeave={() => setActiveSegment(null)}
            onClick={() => showToast("Rooftop Solar in agro-processing consumes 20% of funds.", "info")}
            className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left ${
              activeSegment === 3 
                ? 'bg-bg-surface border-emerald-400 shadow-lg shadow-[#80F5A0]/5 -translate-y-1' 
                : 'bg-bg-surface border-border-subtle hover:border-border-strong'
            }`}
          >
            <div className={`hidden lg:block absolute left-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
              activeSegment === 3 ? 'bg-emerald-400' : 'bg-border-subtle'
            }`}></div>

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                <Building className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">20% FLOWS</span>
            </div>
            <h4 className="font-sans font-bold text-sm text-fg-primary mb-1.5">Rooftop Solar — Agro-Processing</h4>
            <p className="text-xs text-fg-secondary leading-relaxed font-sans">
              Lowers operating costs for rural enterprises and agro-units.
            </p>
          </div>

          {/* Option 4: Biogas from Agri-Waste */}
          <div 
            onMouseEnter={() => setActiveSegment(4)}
            onMouseLeave={() => setActiveSegment(null)}
            onClick={() => showToast("Biogas production takes 15% of deployed fund reserves.", "info")}
            className={`p-6 rounded-3xl border transition-all duration-300 relative group cursor-pointer text-left ${
              activeSegment === 4 
                ? 'bg-bg-surface border-amber shadow-lg shadow-amber/5 -translate-y-1' 
                : 'bg-bg-surface border-border-subtle hover:border-border-strong'
            }`}
          >
            <div className={`hidden lg:block absolute left-[-18px] top-1/2 -translate-y-1/2 w-[18px] h-[2px] transition-colors ${
              activeSegment === 4 ? 'bg-amber' : 'bg-border-subtle'
            }`}></div>

            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">15% FLOWS</span>
            </div>
            <h4 className="font-sans font-bold text-sm text-fg-primary mb-1.5">Biogas from Agri-Waste</h4>
            <p className="text-xs text-fg-secondary leading-relaxed font-sans">
              Converts livestock & crop waste into usable energy; cuts methane.
            </p>
          </div>
        </div >
      </div >
    </div >
  );
}

export default RerfDonutSection;
