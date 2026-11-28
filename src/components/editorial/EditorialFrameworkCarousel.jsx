import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPrefersReducedMotion } from '../../lib/motion';

export const FRAMEWORK_PILLARS = [
  {
    idx: 'STAGE 01 // REGULATORY GROUNDING',
    shortTitle: 'Regulatory Grounding',
    title: 'Built Around Published Rules',
    desc: 'Designed around Bangladesh’s climate rules as they are published. A rule enters the product only with its primary document cited; nothing here is approved or endorsed by a regulator.',
    tags: ['GHG Protocol', 'ISO 14064-1', 'IPCC 2006'],
    metrics: ['Cited Tables Only', 'No Unapproved Defaults', 'Article 6.2 Ready'],
  },
  {
    idx: 'STAGE 02 // FIELD-HARDENED VERIFICATION',
    shortTitle: 'Field-Hardened Verification',
    title: 'MRV That Works in the Field',
    desc: 'Google Earth Engine satellite integration. GPS field tagging. IoT sensor data ingestion. Mobile farmer reporting app and anomaly detection comparing satellite data against field reports in Khulna.',
    tags: ['Google Earth Engine', 'PostGIS', 'TensorFlow'],
    metrics: ['10m Sentinel-2 Pass', 'GPS Polygon Guard', 'Khulna Field Reports'],
  },
  {
    idx: 'STAGE 03 // GLOBAL FUNGIBILITY',
    shortTitle: 'Global Fungibility',
    title: 'International Standards, Local Execution',
    desc: 'Verra VCS, Gold Standard, Article 6 and CDM methodologies are referenced so Bangladesh projects speak the exact data structure expected by global institutional reviewers.',
    tags: ['Verra VCS', 'Gold Standard', 'Article 6', 'CDM'],
    metrics: ['VM0047 / VM0033 Schemas', 'CAD Trust Sync', 'BTR AEF Tables'],
  },
];

export function EditorialFrameworkCarousel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || getPrefersReducedMotion()) return undefined;
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setActiveIdx((prev) => (prev + 1) % FRAMEWORK_PILLARS.length);
    }, 5400);
    return () => window.clearInterval(timer);
  }, [paused]);

  const active = FRAMEWORK_PILLARS[activeIdx] || FRAMEWORK_PILLARS[0];

  const handlePrev = () => {
    setPaused(true);
    setActiveIdx((prev) => (prev === 0 ? FRAMEWORK_PILLARS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setPaused(true);
    setActiveIdx((prev) => (prev + 1) % FRAMEWORK_PILLARS.length);
  };

  return (
    <div
      className="ed-framework-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="ed-fw-carousel-head">
        <div className="ed-fw-stage-tabs" role="tablist" aria-label="Framework alignment stages">
          {FRAMEWORK_PILLARS.map((pillar, idx) => (
            <button
              key={pillar.idx}
              type="button"
              role="tab"
              aria-selected={idx === activeIdx}
              onClick={() => {
                setPaused(true);
                setActiveIdx(idx);
              }}
              className={`ed-fw-tab ${idx === activeIdx ? 'is-active' : ''}`}
            >
              <span className="ed-mono">0{idx + 1}</span>
              <span>{pillar.shortTitle}</span>
            </button>
          ))}
        </div>

        <div className="ed-slider-controls">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous framework stage"
            className="ed-fw-arrow-btn"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next framework stage"
            className="ed-fw-arrow-btn"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <article key={active.idx} className="ed-fw-carousel-stage">
        <div className="ed-fw-stage-main">
          <span className="ed-mono ed-accent-text">{active.idx}</span>
          <h3 className="ed-fw-stage-title">{active.title}</h3>
          <p className="ed-fw-stage-desc">{active.desc}</p>

          <div className="ed-process-tags">
            {active.tags.map((tag) => (
              <span key={tag} className="ed-process-tag ed-mono">
                [{tag}]
              </span>
            ))}
          </div>
        </div>

        <div className="ed-fw-stage-aside">
          <span className="ed-mono ed-muted-text">VERIFIED EXECUTION SPEC</span>
          <ul className="ed-fw-spec-list">
            {active.metrics.map((m) => (
              <li key={m} className="ed-mono">
                <span className="ed-accent-text">→</span> {m}
              </li>
            ))}
          </ul>
          <div className="ed-fw-progress-track" aria-hidden="true">
            <div
              className="ed-fw-progress-fill"
              style={{ width: `${((activeIdx + 1) / FRAMEWORK_PILLARS.length) * 100}%` }}
            />
          </div>
        </div>
      </article>
    </div>
  );
}

export default EditorialFrameworkCarousel;
