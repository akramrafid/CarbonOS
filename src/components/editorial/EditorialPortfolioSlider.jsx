import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sun, Sprout, Flame, Recycle, Trees, Factory } from 'lucide-react';
import { getPrefersReducedMotion } from '../../lib/motion';
import AnimatedNumber from './AnimatedNumber';

const PORTFOLIOS = [
  {
    idx: '01',
    name: 'Solar Irrigation & Mini-Grids',
    region: 'Rajshahi · Sylhet · Khulna',
    desc: 'Replacing diesel pump sets across 1M+ agrarian smallholders with smart GSM-metered DC solar pumps and direct mobile settlement.',
    abatementNum: 850000,
    abatementUnit: 'tCO₂e/yr',
    methodology: 'UNFCCC AMS-I.A',
    funding: 'Active Registry',
    additionality: 'High Additionality',
    sensors: '14,200 Smart Inverters',
    sdg: 'SDG 7 · SDG 13',
    route: '/sectors/solar-irrigation',
    icon: Sun,
  },
  {
    idx: '02',
    name: 'Alternate Wetting & Drying (AWD)',
    region: 'Rangpur · Bogura · Dinajpur',
    desc: 'Low-methane Boro rice cultivation cutting anaerobic CH4 emissions by 38% via field water-level piezometers and farmer SMS alerts.',
    abatementNum: 2100000,
    abatementUnit: 'tCO₂e/yr',
    methodology: 'AMS-III.AU',
    funding: 'Prime Asset',
    additionality: 'Co-Benefits Tracked',
    sensors: '6,840 Water Table Nodes',
    sdg: 'SDG 2 · SDG 13',
    route: '/sectors/rice-methane',
    icon: Sprout,
  },
  {
    idx: '03',
    name: 'Clean Household Cookstoves',
    region: 'Mymensingh · Barishal · Cumilla',
    desc: 'Tier-4 thermal efficiency biomass stoves replacing open-fire chulhas across rural households with acoustic/thermal usage loggers.',
    abatementNum: 400000,
    abatementUnit: 'tCO₂e/yr',
    methodology: 'Gold Standard GS-TPDDTEC',
    funding: 'Active Registry',
    additionality: 'Health & Gender SDG',
    sensors: '32,500 Thermal Loggers',
    sdg: 'SDG 3 · SDG 5',
    route: '/sectors/clean-cookstoves',
    icon: Flame,
  },
  {
    idx: '04',
    name: 'Urban Waste-to-Energy & Biogas',
    region: 'Dhaka North/South · Chattogram',
    desc: 'Municipal solid waste biomethanation capturing landfill methane and feeding industrial heat and captive micro-turbines.',
    abatementNum: 600000,
    abatementUnit: 'tCO₂e/yr',
    methodology: 'ACM0022 Multi-City',
    funding: 'Article 6.2 Candidate',
    additionality: 'Circular Infrastructure',
    sensors: '48 CH4 Optical Arrays',
    sdg: 'SDG 11 · SDG 12',
    route: '/sectors/waste-to-energy',
    icon: Recycle,
  },
  {
    idx: '05',
    name: 'Sundarbans Blue Carbon',
    region: 'Khulna · Satkhira · Bagerhat',
    desc: 'Mangrove sediment carbon sequestration, tidal wetland preservation, and community coastal resilience verified via Sentinel-1/2 + GEDI.',
    abatementNum: 1200000,
    abatementUnit: 'tCO₂e/yr',
    methodology: 'Verra VM0033 Tidal Wetland',
    funding: 'Institutional Tier',
    additionality: 'Biodiversity Hotspot',
    sensors: '3,800 ha Orbital AOI',
    sdg: 'SDG 14 · SDG 15',
    route: '/sectors/mangrove-carbon',
    icon: Trees,
  },
  {
    idx: '06',
    name: 'Brick Kiln Modernization (HHK/Tunnel)',
    region: 'Savar · Gazipur · Narayanganj',
    desc: 'Transforming legacy Fixed Chimney Kilns to Hybrid Hoffman & Tunnel Kilns with CEMS black-carbon flue gas telemetry.',
    abatementNum: 780000,
    abatementUnit: 'tCO₂e/yr',
    methodology: 'CEMS Telemetry Protocol',
    funding: 'Available Allocation',
    additionality: 'Black Carbon Mitigation',
    sensors: '112 Stack CEMS Units',
    sdg: 'SDG 9 · SDG 13',
    route: '/sectors/brick-kilns',
    icon: Factory,
  },
];

export function EditorialPortfolioSlider() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || getPrefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setActiveIdx((prev) => (prev + 1) % PORTFOLIOS.length);
    }, 6200);
    return () => window.clearInterval(timer);
  }, [paused]);

  const active = PORTFOLIOS[activeIdx] || PORTFOLIOS[0];
  const Icon = active.icon;

  const handlePrev = () => {
    setPaused(true);
    setActiveIdx((prev) => (prev === 0 ? PORTFOLIOS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setPaused(true);
    setActiveIdx((prev) => (prev + 1) % PORTFOLIOS.length);
  };

  return (
    <section id="sectors" className="ed-band">
      <div className="ed-container">
        <div className="ed-section-header">
          <div>
            <span className="ed-mono ed-accent-text">CARBONOS PRIORITY SECTORS</span>
            <h2 className="ed-section-title">HIGH-INTEGRITY CARBON PORTFOLIOS</h2>
            <p className="ed-section-sub">
              Six priority corridors across Bangladesh monitored with continuous orbital telemetry,
              ground IoT nodes, and verifiable smallholder co-benefits.
            </p>
          </div>
          <div className="ed-slider-controls">
            <span className="ed-mono ed-muted-text">
              {active.idx} / 0{PORTFOLIOS.length} CORRIDOR
            </span>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous carbon sector"
              className="ed-pill ed-pill--subtle ed-pill--compact"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next carbon sector"
              className="ed-pill ed-pill--subtle ed-pill--compact"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Interactive Environmental Showcase Slide */}
        <div
          className="ed-portfolio-stage"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Left Visual Backdrop & Live Micro-Dashboard */}
          <div className="ed-portfolio-visual">
            <div
              className="ed-portfolio-photo"
              style={{ backgroundImage: 'url("/farmers_hero_banner.png")' }}
              aria-hidden="true"
            />
            <div className="ed-portfolio-scrim" aria-hidden="true" />

            <div className="ed-portfolio-viz-overlay">
              <div className="ed-portfolio-viz-top">
                <span className="ed-mono ed-accent-text">{active.region}</span>
                <span className="ed-portfolio-icon-badge" aria-hidden="true">
                  <Icon size={18} />
                </span>
              </div>

              <div className="ed-portfolio-telemetry-strip">
                <div className="ed-portfolio-tel-cell">
                  <span className="ed-mono ed-muted-text">ANNUAL ABATEMENT</span>
                  <strong className="ed-portfolio-kpi">
                    <AnimatedNumber value={active.abatementNum} decimals={0} />{' '}
                    <span className="ed-mono ed-accent-text">{active.abatementUnit}</span>
                  </strong>
                </div>
                <div className="ed-portfolio-tel-cell">
                  <span className="ed-mono ed-muted-text">FIELD INSTRUMENTATION</span>
                  <strong className="ed-mono">{active.sensors}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Dossier Details & CTAs */}
          <div className="ed-portfolio-content">
            <div className="ed-portfolio-meta-row">
              <span className="ed-mono ed-accent-text">{active.idx} · {active.methodology}</span>
              <span className="ed-mono ed-pipe-status-pill">{active.funding}</span>
            </div>

            <h3 className="ed-portfolio-title">{active.name}</h3>
            <p className="ed-portfolio-desc">{active.desc}</p>

            <div className="ed-sector-metrics">
              <div>
                <span className="ed-mono ed-muted-text">ADDITIONALITY</span>
                <strong className="ed-sector-val ed-accent-text">{active.additionality}</strong>
              </div>
              <div>
                <span className="ed-mono ed-muted-text">SDG ALIGNMENT</span>
                <strong className="ed-sector-val">{active.sdg}</strong>
              </div>
            </div>

            <div className="ed-sector-actions">
              <Link to={active.route} className="ed-pill ed-pill--accent">
                Sector Dossier →
              </Link>
              <Link to="/platform/marketplace" className="ed-pill ed-pill--subtle">
                Browse Credits
              </Link>
            </div>
          </div>
        </div>

        {/* Corridor Selector Pills */}
        <div className="ed-portfolio-tabs" role="tablist" aria-label="Select carbon sector portfolio">
          {PORTFOLIOS.map((sec, idx) => (
            <button
              key={sec.idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              onClick={() => {
                setPaused(true);
                setActiveIdx(idx);
              }}
              className={`ed-portfolio-tab ${idx === activeIdx ? 'is-active' : ''}`}
            >
              <span className="ed-mono">{sec.idx}</span>
              <span>{sec.name}</span>
            </button>
          ))}
        </div>

        <p className="ed-footnote ed-mono ed-muted-text">
          Sector listings are informational. No project here has been registered or verified by a
          regulator or a third party.
        </p>
      </div>
    </section>
  );
}

export default EditorialPortfolioSlider;
