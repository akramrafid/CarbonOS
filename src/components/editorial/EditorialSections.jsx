import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STATIONS, getAirStatus, getCO2Status } from '../live-metrics/liveMetricsData';
import { CLIENT_PROFILES, CLIENT_SECTORS } from '../../pages/platform/clientProfiles';

const SECTORS_LIST = [
  {
    idx: '01',
    name: 'Solar Irrigation & Mini-Grids',
    desc: 'Replacing diesel pump sets across 1M+ agrarian smallholders with smart telemetry metering.',
    market: '850,000 tCO₂e/yr',
    methodology: 'UNFCCC AMS-I.A',
    funding: 'Active Registry',
    additionality: 'High Additionality',
    route: '/sectors/solar-irrigation',
  },
  {
    idx: '02',
    name: 'Alternate Wetting & Drying (AWD)',
    desc: 'Low-methane rice cultivation cutting anaerobic emissions by 38% with field water loggers.',
    market: '2.10M tCO₂e/yr',
    methodology: 'AMS-III.AU',
    funding: 'Prime Asset',
    additionality: 'Co-Benefits (unverified)',
    route: '/sectors/rice-methane',
  },
  {
    idx: '03',
    name: 'Clean Household Cookstoves',
    desc: 'Tier-4 thermal efficiency biomass stoves replacing open-fire chulhas in rural households.',
    market: '400,000 tCO₂e/yr',
    methodology: 'Gold Standard GS-TPDDTEC',
    funding: 'Active Registry',
    additionality: 'Health & Gender SDG',
    route: '/sectors/clean-cookstoves',
  },
  {
    idx: '04',
    name: 'Urban Waste-to-Energy & Biogas',
    desc: 'Municipal solid waste biomethanation in Dhaka & Chattogram turning landfill gas into clean power.',
    market: '600,000 tCO₂e/yr',
    methodology: 'ACM0022 Multi-City',
    funding: 'Article 6.2 candidate (not authorized)',
    additionality: 'Circular Infrastructure',
    route: '/sectors/waste-to-energy',
  },
  {
    idx: '05',
    name: 'Sundarbans Blue Carbon',
    desc: 'Mangrove sediment carbon sequestration, tidal wetland preservation, and community stewardship.',
    market: '1.20M tCO₂e/yr',
    methodology: 'Verra VM0033 Tidal Wetland',
    funding: 'Institutional Tier',
    additionality: 'Biodiversity Hotspot',
    route: '/sectors/mangrove-carbon',
  },
  {
    idx: '06',
    name: 'Brick Kiln Modernization (HHK/Tunnel)',
    desc: 'Transforming legacy Fixed Chimney Kilns (FCK) to energy-efficient Zigzag & Hybrid Hoffman Kilns.',
    market: '780,000 tCO₂e/yr',
    methodology: 'CEMS (continuous emissions monitoring)',
    funding: 'Available Allocation',
    additionality: 'Black Carbon Mitigation',
    route: '/sectors/brick-kilns',
  },
];

const PRICING_TIERS = [
  {
    id: 'starter',
    kicker: 'STARTER NODE · TIER 01',
    name: 'Project Developer',
    desc: 'For local NGOs, solar developers, and clean cookstove sponsors onboarding early project batches.',
    monthlyPrice: '৳50,000',
    annualPrice: '৳40,000',
    annualNote: 'Billed annually ৳4,80,000 / yr',
    monthlyNote: 'Billed monthly on invoice',
    ctaLabel: 'Deploy Starter Node →',
    to: '/platform/saas-dashboard',
    featured: false,
    items: [
      { label: 'Up to 5 Active Project Sites on registry', included: true },
      { label: 'Basic IoT telemetry sync (Blynk / HTTP API)', included: true },
      { label: 'Automated PDF verification dossiers', included: true },
      { label: 'Direct bKash / Nagad rural payout settlement', included: true },
      { label: 'Google Earth Engine multi-spectral analysis', included: false },
      { label: 'Live primary order book bid placement', included: false },
    ],
  },
  {
    id: 'institutional',
    kicker: 'PRIMARY SOVEREIGN TIER · RECOMMENDED',
    name: 'Enterprise & Aggregators',
    desc: 'For commercial solar IPPs, industrial textile mills, agribusiness conglomerates, and registry certifiers.',
    monthlyPrice: '৳1,50,000',
    annualPrice: '৳1,20,000',
    annualNote: 'Billed annually ৳14,40,000 / yr (Save ৳3,60,000)',
    monthlyNote: 'Billed monthly on corporate invoice',
    ctaLabel: 'Provision Institutional Node →',
    to: '/platform/saas-dashboard',
    featured: true,
    items: [
      { label: 'Unlimited Project Onboarding & MRV workflows', included: true },
      { label: 'Google Earth Engine Sentinel-2 NDVI & SAR radar pipeline', included: true },
      { label: 'AI satellite anomaly & double-crediting verification engine', included: true },
      { label: 'Direct wholesale liquidity market access & block trading', included: true },
      { label: 'REST API + Webhooks access (50,000 calls / month)', included: true },
      { label: 'Dedicated compliance officer & 4-hour SLA response', included: true },
    ],
  },
  {
    id: 'sovereign',
    kicker: 'NATIONAL ARCHITECTURE · SOVEREIGN',
    name: 'Government & Climate Funds',
    desc: 'For ministries, multilateral climate funds, bilateral Article 6.2 partner nations, and sovereign entities.',
    monthlyPrice: 'Bespoke SLA',
    annualPrice: 'Bespoke SLA',
    annualNote: 'National mandate deployment & isolated VPC',
    monthlyNote: 'National mandate deployment & isolated VPC',
    ctaLabel: 'Consult Climate Solutions Desk →',
    href: 'mailto:institutional@carbonzerobd.com',
    featured: false,
    items: [
      { label: 'Dedicated sovereign registry instance & on-premise HSM', included: true },
      { label: 'White-label ministry portal with multi-department RBAC', included: true },
      { label: 'Unlimited high-throughput cryptographic verification calls', included: true },
      { label: '99.98% High Availability Uptime Guarantee with financial SLA', included: true },
    ],
  },
];

export function EditorialLiveTelemetry() {
  const [activeStation, setActiveStation] = useState(STATIONS[0]);
  const [metrics, setMetrics] = useState({ temp: 29.2, hum: 68.5, air: 114, co2: 424 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState(
    'Showing reference environmental baseline (Direct hardware stream requires server telemetry proxy).'
  );
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchReferenceFeed = () => {
    setIsRefreshing(true);
    setMetrics({ temp: 29.2, hum: 68.5, air: 114, co2: 424 });
    setNotice(
      'Showing reference environmental baseline (Direct hardware stream requires server telemetry proxy).'
    );
    setLastUpdated(new Date().toLocaleTimeString());
    setIsRefreshing(false);
  };

  const handleStationChange = (station) => {
    setActiveStation(station);
    if (station.isLiveFeed) {
      fetchReferenceFeed();
    } else {
      setMetrics(station.mockData);
      setNotice('');
      setLastUpdated(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    if (!activeStation.isLiveFeed) return undefined;
    fetchReferenceFeed();
    const interval = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchReferenceFeed();
    }, 6000);
    return () => window.clearInterval(interval);
  }, [activeStation]);

  const airStatus = getAirStatus(metrics.air);
  const co2Status = getCO2Status(metrics.co2);
  const co2Delta =
    metrics.co2 && activeStation.baselineCo2
      ? Math.max(0, metrics.co2 - activeStation.baselineCo2)
      : 6;

  return (
    <section id="telemetry" className="ed-band">
      <div className="ed-container">
        <div className="ed-section-header">
          <div>
            <span className="ed-mono ed-accent-text">
              NATIONAL MRV GROUND STATION TELEMETRY NETWORK
            </span>
            <h2 className="ed-section-title">REAL-TIME ECOLOGICAL GROUND TRUTH</h2>
            <p className="ed-section-sub">
              Every carbon credit issued on Carbon Zero BD is anchored to physical IoT micro-stations,
              continuous optical analyzers, and cryptographic ledger proof.
            </p>
          </div>
          <div className="ed-telemetry-head-actions">
            <span className="ed-mono ed-muted-text">NODES: 4 ACTIVE · LATENCY ~18MS</span>
            <button
              type="button"
              onClick={
                activeStation.isLiveFeed
                  ? fetchReferenceFeed
                  : () => handleStationChange(activeStation)
              }
              disabled={isRefreshing}
              className="ed-pill ed-pill--subtle"
            >
              {isRefreshing ? 'Syncing...' : 'Sync Feed'}
            </button>
          </div>
        </div>

        {/* 4 Station Selector Bar */}
        <div className="ed-station-grid" role="group" aria-label="Select MRV telemetry station">
          {STATIONS.map((station) => {
            const isSelected = station.id === activeStation.id;
            return (
              <button
                key={station.id}
                type="button"
                onClick={() => handleStationChange(station)}
                className={`ed-station-btn ${isSelected ? 'is-active' : ''}`}
              >
                <div className="ed-station-top">
                  <span className="ed-station-name">{station.name}</span>
                  {station.isLiveFeed && <span className="ed-mono ed-accent-text">LIVE IoT</span>}
                </div>
                <span className="ed-mono ed-muted-text">{station.location.split('(')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Station Meta Strip */}
        <div className="ed-meta-strip">
          <div className="ed-meta-strip-left ed-mono">
            <span>{activeStation.location}</span>
            <span>·</span>
            <span>{activeStation.hardware}</span>
          </div>
          <div className="ed-meta-strip-right ed-mono">
            <span className="ed-accent-text">{activeStation.protocol}</span>
            {lastUpdated && <span className="ed-muted-text">Synced: {lastUpdated}</span>}
          </div>
        </div>

        {notice && (
          <div className="ed-notice-bar">
            <span className="ed-mono ed-muted-text">{notice}</span>
            <span className="ed-mono ed-muted-text">Secured via SHA-256 local ledger</span>
          </div>
        )}

        {/* 4 Telemetry Readout Cells */}
        <div className="ed-metrics-grid">
          <div className="ed-metric-cell">
            <div className="ed-metric-top">
              <span className="ed-mono ed-muted-text">AMBIENT SURFACE TEMP</span>
              <span className="ed-mono ed-accent-text">CALIBRATED</span>
            </div>
            <div className="ed-metric-num">
              {metrics.temp !== null ? metrics.temp.toFixed(1) : '--'}
              <span className="ed-metric-unit">°C</span>
            </div>
            <span className="ed-mono ed-muted-text">Diurnal: 24.2° – 32.8°</span>
          </div>

          <div className="ed-metric-cell">
            <div className="ed-metric-top">
              <span className="ed-mono ed-muted-text">RELATIVE HUMIDITY</span>
              <span className="ed-mono ed-accent-text">NOMINAL</span>
            </div>
            <div className="ed-metric-num">
              {metrics.hum !== null ? metrics.hum.toFixed(1) : '--'}
              <span className="ed-metric-unit">%</span>
            </div>
            <span className="ed-mono ed-muted-text">Vapor Density: 18.4 g/m³</span>
          </div>

          <div className="ed-metric-cell">
            <div className="ed-metric-top">
              <span className="ed-mono ed-muted-text">AIR QUALITY RAW / AQI</span>
              <span className="ed-mono ed-accent-text">{airStatus.text}</span>
            </div>
            <div className="ed-metric-num">
              {metrics.air !== null ? metrics.air : '--'}
              <span className="ed-metric-unit">raw</span>
            </div>
            <span className="ed-mono ed-muted-text">Sensor: MQ-135 · Baseline: modelled</span>
          </div>

          <div className="ed-metric-cell">
            <div className="ed-metric-top">
              <span className="ed-mono ed-muted-text">CO₂ CONCENTRATION</span>
              <span className="ed-mono ed-accent-text">{co2Status.text}</span>
            </div>
            <div className="ed-metric-num">
              {metrics.co2 !== null ? metrics.co2 : '--'}
              <span className="ed-metric-unit">ppm</span>
            </div>
            <span className="ed-mono ed-muted-text">
              Delta: +{co2Delta} ppm · MRV telemetry (unverified)
            </span>
          </div>
        </div>

        <div className="ed-band-foot">
          <div>
            <strong className="ed-foot-strong">
              Simulated &amp; Reference Telemetry Preview
            </strong>
            <span className="ed-mono ed-muted-text ed-foot-sub">
              Demo frames sampled: 14,820 · Connect signed MRV backend for hardware-attested ingestion
            </span>
          </div>
          <Link to="/platform/mrv-dashboard" className="ed-pill ed-pill--subtle">
            Full MRV Terminal →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EditorialClientShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredClients =
    selectedCategory === 'all'
      ? CLIENT_PROFILES
      : CLIENT_PROFILES.filter((c) => c.category === selectedCategory);

  return (
    <section id="clients" className="ed-band">
      <div className="ed-container">
        <div className="ed-section-header">
          <div>
            <span className="ed-mono ed-accent-text">
              DEMO DATA · ILLUSTRATIVE BANGLADESH SECTOR PROFILES
            </span>
            <h2 className="ed-section-title">SECTOR REFERENCE PROFILES</h2>
            <p className="ed-section-sub">
              Explore illustrative Scope 1, 2, and 3 operational baselines modeled across electric
              mobility, student transit, circular jute biopolymers, and higher education campuses.
            </p>
          </div>
          <span className="ed-mono ed-muted-text">{filteredClients.length} PROFILES SHOWN</span>
        </div>

        <div className="ed-filter-bar" role="group" aria-label="Filter reference client sectors">
          {CLIENT_SECTORS.map((sec) => {
            const isActive = selectedCategory === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedCategory(sec.id)}
                className={`ed-pill ed-pill--subtle ${isActive ? 'is-filter-active' : ''}`}
              >
                <span>{sec.label}</span>
                <span className="ed-mono">({sec.count})</span>
              </button>
            );
          })}
        </div>

        <div className="ed-clients-grid">
          {filteredClients.map((client) => {
            const cleanUrl = client.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
            return (
              <article key={client.id} className="ed-client-cell">
                <div className="ed-client-head">
                  <span className="ed-mono ed-accent-text">DEMO PROFILE</span>
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ed-client-url ed-mono"
                    title={`Visit ${client.name} official website`}
                  >
                    {cleanUrl} ↗
                  </a>
                </div>

                <div>
                  <h3 className="ed-client-name">{client.name}</h3>
                  <span className="ed-mono ed-muted-text ed-client-sector">{client.sector}</span>
                </div>

                <p className="ed-client-hq ed-mono ed-muted-text">{client.headquarters}</p>
                <p className="ed-client-highlight">{client.sustainabilityHighlight}</p>

                <div className="ed-client-foot">
                  <span className="ed-mono ed-muted-text">
                    {client.facilities.length} Active Sites
                  </span>
                  <div className="ed-client-baseline">
                    <span className="ed-mono ed-accent-text">
                      {client.activeInsets.toLocaleString()} tCO₂e
                    </span>
                    <span className="ed-mono ed-muted-text">Demo Baseline</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="ed-band-foot">
          <div>
            <strong className="ed-foot-strong">
              Onboard Your Enterprise ESG Inventory in 24 Hours
            </strong>
            <span className="ed-mono ed-muted-text ed-foot-sub">
              Automated PDF utility invoice extraction and DoE gazette alignment
            </span>
          </div>
          <Link to="/platform/saas-dashboard" className="ed-pill ed-pill--accent">
            Explore Client Dashboard →
          </Link>
        </div>
      </div>
    </section>
  );
}

export function EditorialSectorFocus() {
  return (
    <section id="sectors" className="ed-band">
      <div className="ed-container">
        <div className="ed-section-header">
          <div>
            <span className="ed-mono ed-accent-text">CARBONOS PRIORITY SECTORS</span>
            <h2 className="ed-section-title">HIGH-INTEGRITY CARBON PORTFOLIOS</h2>
            <p className="ed-section-sub">
              Six priority sectors where Bangladeshi projects can show measurable reductions and
              direct social co-benefits.
            </p>
          </div>
          <span className="ed-mono ed-muted-text">06 PRIORITY CORRIDORS</span>
        </div>

        <div className="ed-sectors-grid">
          {SECTORS_LIST.map((sector) => (
            <article key={sector.idx} className="ed-sector-cell">
              <div className="ed-sector-top">
                <span className="ed-mono ed-muted-text">{sector.idx} · {sector.methodology}</span>
                <span className="ed-mono ed-accent-text">{sector.funding}</span>
              </div>

              <h3 className="ed-sector-name">{sector.name}</h3>
              <p className="ed-sector-desc">{sector.desc}</p>

              <div className="ed-sector-metrics">
                <div>
                  <span className="ed-mono ed-muted-text">ANNUAL ABATEMENT</span>
                  <strong className="ed-sector-val">{sector.market}</strong>
                </div>
                <div>
                  <span className="ed-mono ed-muted-text">ADDITIONALITY</span>
                  <strong className="ed-sector-val ed-accent-text">{sector.additionality}</strong>
                </div>
              </div>

              <div className="ed-sector-actions">
                <Link to={sector.route} className="ed-pill ed-pill--subtle">
                  Sector Dossier →
                </Link>
                <Link to="/platform/marketplace" className="ed-pill ed-pill--subtle">
                  Browse Credits
                </Link>
              </div>
            </article>
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

export function EditorialPricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="ed-band">
      <div className="ed-container">
        <div className="ed-section-header">
          <div>
            <span className="ed-mono ed-accent-text">
              SOVEREIGN INFRASTRUCTURE SAAS &amp; NODE LICENSURE
            </span>
            <h2 className="ed-section-title">PREDICTABLE SCALING FOR DEVELOPERS</h2>
            <p className="ed-section-sub">
              Deploy automated MRV, satellite data pipelines, and sovereign ledger registry nodes
              with zero hidden transaction tariffs.
            </p>
          </div>

          <div className="ed-billing-toggle" role="group" aria-label="Billing interval">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`ed-pill ed-pill--subtle ${!isAnnual ? 'is-filter-active' : ''}`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`ed-pill ed-pill--subtle ${isAnnual ? 'is-filter-active' : ''}`}
            >
              <span>Annual Settlement</span>
              <span className="ed-mono">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="ed-pricing-grid">
          {PRICING_TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`ed-pricing-cell ${tier.featured ? 'is-featured' : ''}`}
            >
              <div className="ed-pricing-head">
                <span className="ed-mono ed-accent-text">{tier.kicker}</span>
                <h3 className="ed-pricing-name">{tier.name}</h3>
                <p className="ed-pricing-desc">{tier.desc}</p>
              </div>

              <div className="ed-pricing-cost">
                <div className="ed-pricing-price-row">
                  <strong className="ed-pricing-amount">
                    {isAnnual ? tier.annualPrice : tier.monthlyPrice}
                  </strong>
                  {tier.monthlyPrice !== 'Bespoke SLA' && (
                    <span className="ed-mono ed-muted-text">/ month</span>
                  )}
                </div>
                <span className="ed-mono ed-muted-text">
                  {isAnnual ? tier.annualNote : tier.monthlyNote}
                </span>
              </div>

              <ul className="ed-pricing-list">
                {tier.items.map((item) => (
                  <li
                    key={item.label}
                    className={`ed-pricing-item ${item.included ? '' : 'is-excluded'}`}
                  >
                    <span className="ed-mono ed-accent-text" aria-hidden="true">
                      {item.included ? '✓' : '✕'}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>

              <div className="ed-pricing-cta">
                {tier.href ? (
                  <a href={tier.href} className="ed-pill">
                    {tier.ctaLabel}
                  </a>
                ) : (
                  <Link
                    to={tier.to}
                    className={`ed-pill ${tier.featured ? 'ed-pill--accent' : ''}`}
                  >
                    {tier.ctaLabel}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="ed-band-foot">
          <div>
            <strong className="ed-foot-strong">
              Institutional Billing &amp; Regulatory Reconciliation
            </strong>
            <span className="ed-mono ed-muted-text ed-foot-sub">
              Bangladesh Bank RTGS, BEFTN, SWIFT, and Mushak-6.3 VAT invoicing supported
            </span>
          </div>
          <span className="ed-mono ed-accent-text">99.98% SLA</span>
        </div>
      </div>
    </section>
  );
}
