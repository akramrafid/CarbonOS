import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Satellite, FileSpreadsheet, ShieldCheck, Wallet, Sprout } from 'lucide-react';
import { useRevealOnScroll } from '../../lib/useRevealOnScroll';
import { getBoundedStaggerDelay } from '../../lib/motion';

const BENTO_TILES = [
  {
    id: 'dmrv-satellite',
    spanClass: 'col-span-12 lg:col-span-7',
    badge: 'SATELLITE & IOT DMRV',
    title: 'Multi-Spectral Biomass & Methane Telemetry',
    description:
      'Combines Sentinel-2 optical bands (NDVI, EVI, NDWI) with field IoT water-level sensors to quantify carbon stock with conformal uncertainty bounds.',
    to: '/carbon-monitoring',
    cta: 'Open GIS Biomass Studio',
    icon: Satellite,
    visualType: 'ndvi-curve',
  },
  {
    id: 'esg-dual-control',
    spanClass: 'col-span-12 lg:col-span-5',
    badge: 'GHG PROTOCOL SCOPE 1 & 2',
    title: 'Guided Utility Bill Intake & Dual-Control Audit',
    description:
      'Extracts DESCO, DPDC, BPDB, and Titas Gas bills, highlights missing fields, and enforces two-person approval before ledger posting.',
    to: '/platform/esg',
    cta: 'Launch ESG Workspace',
    icon: FileSpreadsheet,
    visualType: 'esg-stepper',
  },
  {
    id: 'registry-serials',
    spanClass: 'col-span-12 md:col-span-4',
    badge: 'IMMUTABLE LEDGER',
    title: 'Hash-Chained Credit Serials',
    description:
      'Every issued tCO₂e batch carries a deterministic SHA-256 provenance chain linking raw sensor payloads to retirement certificates.',
    to: '/platform/carbon-registry',
    cta: 'Inspect Registry',
    icon: ShieldCheck,
    visualType: 'hash-chain',
  },
  {
    id: 'farmer-mfs',
    spanClass: 'col-span-12 md:col-span-4',
    badge: 'DIRECT SETTLEMENT',
    title: 'bKash & Nagad Farmer Rails',
    description:
      'Disburses verified carbon proceeds directly to smallholder mobile wallets with transparent fee accounting.',
    to: '/platform/impact',
    cta: 'View Payout Ledger',
    icon: Wallet,
    visualType: 'mfs-bars',
  },
  {
    id: 'harvestguard-ai',
    spanClass: 'col-span-12 md:col-span-4',
    badge: 'FIELD INTELLIGENCE',
    title: 'Offline Crop Diagnosis & ETCL Risk',
    description:
      'Runs on-device ONNX leaf pathology detection with Grad-CAM heatmaps and 7-day storage spoilage alerts in Bangla.',
    to: '/farmers-ai',
    cta: 'Explore Farmers AI',
    icon: Sprout,
    visualType: 'crop-gauge',
  },
];

function TileMicroVisual({ type }) {
  if (type === 'ndvi-curve') {
    return (
      <div className="w-full h-24 rounded-xl bg-bg-canvas/80 border border-border-subtle p-3 flex items-center justify-between gap-4">
        <svg viewBox="0 0 220 56" className="w-full h-14 overflow-visible" aria-hidden="true">
          <path
            d="M4,46 Q42,40 76,24 T148,14 T214,8"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M4,46 Q42,40 76,24 T148,14 T214,8 L214,52 L4,52 Z"
            fill="rgba(0, 200, 83, 0.12)"
          />
          <circle cx="76" cy="24" r="3.5" fill="var(--color-accent)" />
          <circle cx="148" cy="14" r="3.5" fill="var(--color-accent)" />
          <circle cx="214" cy="8" r="4" fill="var(--color-accent)" />
        </svg>
        <div className="shrink-0 text-right font-mono">
          <div className="text-[10px] text-fg-muted uppercase">Sundarbans NDVI</div>
          <div className="text-base font-bold text-accent tabular-nums">0.84 ± 0.03</div>
          <div className="text-[10px] text-fg-secondary">95% CI Conformal</div>
        </div>
      </div>
    );
  }

  if (type === 'esg-stepper') {
    return (
      <div className="w-full h-24 rounded-xl bg-bg-canvas/80 border border-border-subtle p-3 flex flex-col justify-between font-mono text-[11px]">
        <div className="flex items-center justify-between text-fg-secondary">
          <span>DESCO-2026-09.pdf</span>
          <span className="text-accent font-semibold">10/10 Fields Verified</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {['Uploaded', 'Parsed', 'Confirmed', 'Approved'].map((step, i) => (
            <div
              key={step}
              className={`px-2 py-1 rounded text-center text-[10px] border ${
                i < 3
                  ? 'bg-accent/15 border-accent/40 text-accent font-semibold'
                  : 'bg-bg-elevated border-border-subtle text-fg-primary'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'hash-chain') {
    return (
      <div className="w-full h-20 rounded-xl bg-bg-canvas/80 border border-border-subtle p-3 flex items-center justify-between font-mono text-[10px]">
        <div className="px-2 py-1 rounded bg-bg-elevated border border-border-subtle text-fg-secondary">
          #0491 · 8f3a…c2
        </div>
        <div className="flex-1 border-t border-dashed border-accent mx-2" />
        <div className="px-2 py-1 rounded bg-accent/15 border border-accent/40 text-accent font-semibold">
          #0492 · 4d9e…1b
        </div>
      </div>
    );
  }

  if (type === 'mfs-bars') {
    return (
      <div className="w-full h-20 rounded-xl bg-bg-canvas/80 border border-border-subtle p-3 flex flex-col justify-center space-y-2 font-mono text-[10px]">
        <div className="flex justify-between text-fg-secondary">
          <span>Direct Farmer Wallet Share</span>
          <span className="text-accent font-bold tabular-nums">97.0%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-bg-elevated overflow-hidden flex">
          <div className="h-full bg-accent" style={{ width: '97%' }} />
          <div className="h-full bg-fg-muted/40" style={{ width: '3%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-20 rounded-xl bg-bg-canvas/80 border border-border-subtle p-3 flex items-center justify-between font-mono text-[10px]">
      <div>
        <div className="text-fg-muted uppercase">Boro Rice · Leaf Blast</div>
        <div className="text-xs font-bold text-fg-primary mt-0.5">Grad-CAM Confidence 94%</div>
      </div>
      <span className="px-2 py-1 rounded-lg bg-accent/15 border border-accent/30 text-accent font-bold">
        ONNX Ready
      </span>
    </div>
  );
}

export function BentoModulesGrid() {
  const { ref, isVisible } = useRevealOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      data-testid="bento-modules-grid"
      className="mt-12 grid grid-cols-12 gap-5"
    >
      {BENTO_TILES.map((tile, idx) => {
        const Icon = tile.icon;
        const delaySec = getBoundedStaggerDelay(idx, 0.04);

        return (
          <div
            key={tile.id}
            style={{
              transitionDelay: `${delaySec}s`,
            }}
            className={`${tile.spanClass} group rounded-3xl bg-bg-surface border border-border-subtle p-6 flex flex-col justify-between gap-5 card-glow-hover transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-semibold px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25">
                  {tile.badge}
                </span>
                <span className="p-2 rounded-xl bg-bg-elevated border border-border-subtle text-fg-secondary group-hover:text-accent transition-colors">
                  <Icon size={18} aria-hidden="true" />
                </span>
              </div>

              <h3 className="font-sans font-bold text-lg sm:text-xl text-fg-primary tracking-tight">
                {tile.title}
              </h3>
              <p className="font-sans text-xs sm:text-sm text-fg-secondary leading-relaxed">
                {tile.description}
              </p>
            </div>

            <div className="space-y-4">
              <TileMicroVisual type={tile.visualType} />

              <Link
                to={tile.to}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:underline focus-ring-standard rounded py-1"
              >
                <span>{tile.cta}</span>
                <ArrowUpRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BentoModulesGrid;

