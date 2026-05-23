import React from 'react';

const TrustBar = () => {
  const items = [
    "🇧🇩 Bangladesh Carbon Framework 2024",
    "✓ Verra VCS Compatible",
    "✓ Gold Standard Ready",
    "✓ Article 6 Compliant",
    "✓ MRV Mandatory System",
    "✓ National Registry Aligned",
    "✓ DOE Bangladesh Approved",
    "✓ UNFCCC Reporting Ready"
  ];

  // Duplicate the list for seamless looping
  const duplicatedItems = [...items, ...items];

  return (
    <section className="w-full h-14 bg-[#0D2B1A]/40 border-y border-[#00C853]/15 overflow-hidden flex items-center">
      <div className="flex whitespace-nowrap marquee-track min-w-max">
        {duplicatedItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="font-mono text-[13px] text-mist tracking-wide px-4">
              {item}
            </span>
            <span className="text-emerald text-lg font-bold px-2">·</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustBar;
