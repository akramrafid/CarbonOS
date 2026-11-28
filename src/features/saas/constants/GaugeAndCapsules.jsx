import React from 'react';

// 1. Semi-Circular SVG Radial Gauge Arch
export const SemiCircularGauge = ({
  score = 9.3,
  max = 10,
  label = 'Rating',
  sublabel = 'AI score',
  showIcon = false,
  percentage = null,
  isLight = false,
  badgeText = null
}) => {
  const radius = 64;
  const strokeWidth = 11;
  const circumference = Math.PI * radius; // ~201.06
  const normalizedValue = percentage !== null ? percentage / 100 : score / max;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(normalizedValue, 0), 1));
  const gradientId = `gauge-grad-${(label || 'metric').replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg viewBox="0 0 160 92" className="w-36 sm:w-40 h-auto overflow-visible" role="img" aria-label={`${label} gauge: ${score || percentage}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00E676" />
            <stop offset="50%" stopColor="#00C853" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          stroke={isLight ? '#E8ECE8' : '#152B1D'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <path
          d="M 16 80 A 64 64 0 0 1 144 80"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute top-8 sm:top-9 flex flex-col items-center justify-center text-center select-none">
        {showIcon ? (
          <div className="w-8 h-8 rounded-full bg-accent/15 border border-border-strong/30 flex items-center justify-center text-accent">
            <span className="w-4 h-4 text-accent" />
          </div>
        ) : (
          <>
            <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isLight ? 'text-fg-muted' : 'text-fg-secondary'}`}>
              {label}
            </span>
            <span className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight leading-none my-0.5 ${isLight ? 'text-fg-primary' : 'text-white'}`}>
              {score}
            </span>
            <span className={`text-[9px] font-sans font-medium ${isLight ? 'text-fg-muted' : 'text-fg-secondary'}`}>
              {sublabel}
            </span>
          </>
        )}
      </div>

      {badgeText && (
        <div className={`mt-2 px-3 py-1 rounded-full text-[10px] font-sans font-semibold border ${isLight ? 'bg-bg-muted text-fg-primary border-border-subtle' : 'bg-bg-canvas text-emerald-200 border-border-subtle'
          }`}>
          {badgeText}
        </div>
      )}
    </div>
  );
};

// 2. Segmented LED Capsule Progress Bar
export const SegmentedProgressBar = ({ totalBars = 24, activeBars = 19, isLight = false }) => {
  return (
    <div className="flex items-center space-x-1 sm:space-x-1.5 w-full py-1">
      {Array.from({ length: totalBars }).map((_, index) => {
        const isActive = index < activeBars;
        return (
          <div
            key={index}
            className={`flex-1 h-6 sm:h-7 rounded-full transition-all duration-300 ${isActive
                ? 'bg-accent shadow-[0_0_6px_rgba(0,200,83,0.3)]'
                : isLight
                  ? 'bg-bg-muted'
                  : 'bg-bg-surface'
              }`}
            title={`Segment ${index + 1} of ${totalBars} (${isActive ? 'Verified' : 'Pending'})`}
          />
        );
      })}
    </div>
  );
};

// 3. Micro Bar Chart
export const MicroBarChart = ({ isLight = false }) => {
  const bars = [
    { label: 'Apr', height: '45%', active: false },
    { label: 'May', height: '58%', active: false },
    { label: 'Jun', height: '50%', active: false },
    { label: 'Jul', height: '88%', active: true },
  ];

  return (
      <div className="flex items-end justify-end space-x-2.5 h-16 sm:h-20">
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center space-y-1.5 h-full justify-end">
            <div
              className={`w-3.5 sm:w-4 rounded-t-md transition-all duration-500 ${bar.active
                  ? 'bg-accent shadow-[0_0_8px_rgba(0,200,83,0.35)]'
                  : isLight
                    ? 'bg-accent-muted'
                    : 'bg-bg-surface'
                }`}
              style={{ height: bar.height }}
            />
            <span className={`text-[8.5px] font-mono ${isLight ? 'text-fg-secondary' : 'text-fg-muted'}`}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>
      );
};

      // 4. Carousel Slider Indicator
      export const CarouselIndicator = ({isLight = false}) => {
  return (
      <div className="flex items-center space-x-1.5 pt-1">
        <div className="w-8 h-1 rounded-full bg-accent" />
        <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-accent-muted' : 'bg-bg-surface'}`} />
        <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-accent-muted' : 'bg-bg-surface'}`} />
        <div className={`w-2.5 h-1 rounded-full ${isLight ? 'bg-accent-muted' : 'bg-bg-surface'}`} />
      </div>
      );
};
