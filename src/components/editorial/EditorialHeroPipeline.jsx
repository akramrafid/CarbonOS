import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Cpu, ShieldCheck, Download, Layers, Satellite } from 'lucide-react';
import { PIPELINE_STEPS } from '../saas-pipeline/pipelineStepsData';
import { getPrefersReducedMotion } from '../../lib/motion';

const BANGLADESH_SCAN_NODES = [
  {
    id: 'rangpur-awd',
    name: 'Rangpur AWD Rice Corridor',
    shortLabel: 'Rangpur',
    sector: 'Methane Reduction (AWD)',
    cx: 108,
    cy: 64,
    ndvi: '0.78 NDVI',
    metric: '1,200 tCO₂e · IoT Piezometer',
  },
  {
    id: 'sylhet-solar',
    name: 'Sylhet Haor Solar Irrigation',
    shortLabel: 'Sylhet',
    sector: 'Grid Displacement',
    cx: 224,
    cy: 88,
    ndvi: '0.71 NDVI',
    metric: '940 MWh · Smart Inverter',
  },
  {
    id: 'dhaka-esg',
    name: 'Dhaka Industrial Cluster',
    shortLabel: 'Dhaka',
    sector: 'Corporate Scope 1 & 2',
    cx: 158,
    cy: 132,
    ndvi: 'DESCO / Titas',
    metric: 'Dual-Control Ledger Active',
  },
  {
    id: 'sundarbans-blue',
    name: 'Sundarbans Mangrove Reserve',
    shortLabel: 'Sundarbans',
    sector: 'Blue Carbon Allometry',
    cx: 118,
    cy: 204,
    ndvi: '0.84 NDVI',
    metric: '3,800 ha · Sentinel-2 L2A',
  },
  {
    id: 'cht-forestry',
    name: 'Chittagong Hill Agroforestry',
    shortLabel: 'CHT Hills',
    sector: 'Canopy Biomass Stock',
    cx: 248,
    cy: 196,
    ndvi: '0.81 NDVI',
    metric: '5,420 ha · SAR + Optical',
  },
];

const STORY_STEPS = [
  {
    id: 'upload',
    step: '01',
    label: 'Upload',
    detail: 'Ingest DESCO/Titas utility bills, IoT water-table logs, or GeoJSON field boundaries.',
  },
  {
    id: 'verify',
    step: '02',
    label: 'Verify',
    detail: 'Cross-check Sentinel-2 NDVI/NDWI bands and enforce two-person auditor approval.',
  },
  {
    id: 'credit',
    step: '03',
    label: 'Credit',
    detail: 'Compute conservative tCO₂e reductions with cited IPCC AR6 & national grid factors.',
  },
  {
    id: 'registry',
    step: '04',
    label: 'Registry',
    detail: 'Record hash-chained serials on the ledger with direct bKash/Nagad farmer settlement.',
  },
];

export function EditorialHeroPipeline() {
  const [activeView, setActiveView] = useState('pipeline');
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => !getPrefersReducedMotion());
  const [selectedNodeId, setSelectedNodeId] = useState('sundarbans-blue');
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);

  const steps = PIPELINE_STEPS;
  const currentStep = steps[activeStep] || steps[0];
  const selectedNode =
    BANGLADESH_SCAN_NODES.find((n) => n.id === selectedNodeId) || BANGLADESH_SCAN_NODES[0];
  const activeStory = STORY_STEPS[activeStoryIdx] || STORY_STEPS[0];

  useEffect(() => {
    if (!isPlaying || activeView !== 'pipeline' || getPrefersReducedMotion()) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPlaying, activeView, steps.length]);

  const handleSelectStep = (idx) => {
    setIsPlaying(false);
    setActiveStep(idx);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev === 0 ? steps.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  return (
    <aside
      className="ed-hero-pipeline"
      aria-label="Corporate SaaS Pipeline interactive workflow board"
    >
      {/* Top Hairline Header & Dual View Switcher */}
      <div className="ed-pipe-head">
        <div className="ed-pipe-title-group">
          <span className="ed-pipe-status-sq" aria-hidden="true" />
          <span className="ed-mono ed-pipe-heading">CORPORATE SAAS PIPELINE</span>
          <span className="ed-mono ed-pipe-tag">SCOPE 1–3</span>
        </div>

        <div className="ed-pipe-controls">
          <div className="ed-pipe-switch" role="tablist" aria-label="Pipeline visualization mode">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'pipeline'}
              onClick={() => setActiveView('pipeline')}
              className={`ed-pipe-mode-btn ${activeView === 'pipeline' ? 'is-active' : ''}`}
            >
              <Layers size={11} aria-hidden="true" />
              <span>Pipeline</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'satellite'}
              onClick={() => setActiveView('satellite')}
              className={`ed-pipe-mode-btn ${activeView === 'satellite' ? 'is-active' : ''}`}
            >
              <Satellite size={11} aria-hidden="true" />
              <span>Satellite</span>
            </button>
          </div>

          {activeView === 'pipeline' && (
            <div className="ed-pipe-nav-btns">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
                className="ed-pipe-ctrl-btn ed-mono"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous pipeline stage"
                className="ed-pipe-ctrl-btn ed-mono"
              >
                ←
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next pipeline stage"
                className="ed-pipe-ctrl-btn ed-mono"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {activeView === 'pipeline' ? (
        <div className="ed-pipe-body">
          {/* 4-Step Hairline Stepper */}
          <div className="ed-pipe-steps" role="tablist" aria-label="Pipeline stages">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={step.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectStep(idx)}
                  className={`ed-pipe-step-btn ${isActive ? 'is-active' : ''}`}
                >
                  <span className="ed-mono ed-pipe-step-num">{`0${idx + 1}`}</span>
                  <span className="ed-pipe-step-name">{step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Stage Diagram Canvas (Zero Bounce / Zero Shake / Responsive Diagrams) */}
          <div className="ed-pipe-stage" aria-live="polite">
            {/* Stage 1: Document Dropzone & File Intake Visualization */}
            {activeStep === 0 && (
              <div className="ed-pipe-panel ed-viz-stage">
                <div className="ed-viz-upload-scene">
                  <div className="ed-viz-doc-fan" aria-hidden="true">
                    <div className="ed-viz-back-doc ed-viz-back-doc--left">
                      <FileText size={20} />
                    </div>
                    <div className="ed-viz-dropzone-core">
                      <Upload size={30} className="ed-accent-text" />
                      <span className="ed-mono ed-accent-text">INGEST</span>
                    </div>
                    <div className="ed-viz-back-doc ed-viz-back-doc--right">
                      <FileText size={20} />
                    </div>
                  </div>

                  <div className="ed-viz-file-chips">
                    <div className="ed-viz-chip">
                      <span className="ed-mono ed-accent-text">PDF</span>
                      <span className="ed-viz-chip-sub">DESCO / DPDC</span>
                    </div>
                    <div className="ed-viz-chip">
                      <span className="ed-mono ed-accent-text">JPG</span>
                      <span className="ed-viz-chip-sub">Titas Gas Bill</span>
                    </div>
                    <div className="ed-viz-chip">
                      <span className="ed-mono ed-accent-text">CSV</span>
                      <span className="ed-viz-chip-sub">Diesel Log</span>
                    </div>
                  </div>
                </div>

                <div className="ed-viz-caption">
                  <strong className="ed-mono ed-accent-text">DROP FILES HERE</strong>
                  <span>PDF, JPG, CSV utility bills &amp; fuel memos bound to SHA-256 digests</span>
                </div>
              </div>
            )}

            {/* Stage 2: AI OCR & Scope 1-3 Branching Diagram */}
            {activeStep === 1 && (
              <div className="ed-pipe-panel ed-viz-stage">
                <div className="ed-viz-ocr-diagram">
                  {/* Left: Extracting Core Node */}
                  <div className="ed-viz-cpu-node">
                    <Cpu size={28} className="ed-accent-text" aria-hidden="true" />
                    <span className="ed-mono ed-accent-text">EXTRACTING</span>
                    <span className="ed-viz-cpu-sub ed-mono">kWh · m³ · L</span>
                    <div className="ed-viz-scan-bar" aria-hidden="true" />
                  </div>

                  {/* Center: SVG Branching Flow Paths */}
                  <svg
                    className="ed-viz-flow-svg"
                    viewBox="0 0 120 180"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M 0 90 C 48 90, 52 28, 120 28" className="ed-viz-path-bg" />
                    <path d="M 0 90 C 48 90, 52 28, 120 28" className="ed-viz-path-active" />
                    <path d="M 0 90 L 120 90" className="ed-viz-path-bg" />
                    <path d="M 0 90 L 120 90" className="ed-viz-path-active" />
                    <path d="M 0 90 C 48 90, 52 152, 120 152" className="ed-viz-path-bg" />
                    <path d="M 0 90 C 48 90, 52 152, 120 152" className="ed-viz-path-active" />
                  </svg>

                  {/* Right: Scope 1, 2, 3 Target Nodes */}
                  <div className="ed-viz-scope-stack">
                    <div className="ed-viz-scope-node">
                      <div className="ed-viz-scope-head">
                        <span className="ed-mono ed-accent-text">SCOPE 1</span>
                        <span className="ed-viz-node-dot" />
                      </div>
                      <strong className="ed-viz-scope-title">Direct</strong>
                      <span className="ed-viz-scope-sub">Fuel / Diesel</span>
                    </div>

                    <div className="ed-viz-scope-node">
                      <div className="ed-viz-scope-head">
                        <span className="ed-mono ed-accent-text">SCOPE 2</span>
                        <span className="ed-viz-node-dot" />
                      </div>
                      <strong className="ed-viz-scope-title">Indirect</strong>
                      <span className="ed-viz-scope-sub">Grid Electricity</span>
                    </div>

                    <div className="ed-viz-scope-node">
                      <div className="ed-viz-scope-head">
                        <span className="ed-mono ed-accent-text">SCOPE 3</span>
                        <span className="ed-viz-node-dot" />
                      </div>
                      <strong className="ed-viz-scope-title">Value Chain</strong>
                      <span className="ed-viz-scope-sub">Supply Chain</span>
                    </div>
                  </div>
                </div>

                <div className="ed-viz-caption">
                  <span>OCR extracts and categorizes utility telemetry into GHG Protocol scopes</span>
                </div>
              </div>
            )}

            {/* Stage 3: Reviewed Source Doc -> Scope 1/2/3 Bar Chart Visualization */}
            {activeStep === 2 && (
              <div className="ed-pipe-panel ed-viz-stage">
                <div className="ed-viz-audit-diagram">
                  <div className="ed-viz-reviewed-node">
                    <ShieldCheck size={18} className="ed-accent-text" aria-hidden="true" />
                    <div>
                      <span className="ed-mono ed-accent-text">REVIEWED</span>
                      <span className="ed-viz-reviewed-sub ed-mono">Source Doc · SHA-256</span>
                    </div>
                  </div>

                  <svg
                    className="ed-viz-audit-lines"
                    viewBox="0 0 300 36"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line x1="150" y1="0" x2="55" y2="36" className="ed-viz-dashed-line" />
                    <line x1="150" y1="0" x2="150" y2="36" className="ed-viz-dashed-line" />
                    <line x1="150" y1="0" x2="245" y2="36" className="ed-viz-dashed-line" />
                  </svg>

                  <div className="ed-viz-chart-columns">
                    <div className="ed-viz-col-wrap">
                      <div className="ed-viz-col-bar" style={{ height: '64px' }}>
                        <span className="ed-viz-col-pin" aria-hidden="true" />
                        <span className="ed-mono ed-accent-text">42t</span>
                      </div>
                      <span className="ed-mono ed-viz-col-label">Scope 1</span>
                    </div>

                    <div className="ed-viz-col-wrap">
                      <div className="ed-viz-col-bar" style={{ height: '98px' }}>
                        <span className="ed-viz-col-pin" aria-hidden="true" />
                        <span className="ed-mono ed-accent-text">88t</span>
                      </div>
                      <span className="ed-mono ed-viz-col-label">Scope 2</span>
                    </div>

                    <div className="ed-viz-col-wrap">
                      <div className="ed-viz-col-bar" style={{ height: '48px' }}>
                        <span className="ed-viz-col-pin" aria-hidden="true" />
                        <span className="ed-mono ed-accent-text">23t</span>
                      </div>
                      <span className="ed-mono ed-viz-col-label">Scope 3</span>
                    </div>
                  </div>
                </div>

                <div className="ed-viz-caption">
                  <span>Emissions are traced to the original source files a reviewer approved</span>
                </div>
              </div>
            )}

            {/* Stage 4: One-Click Report -> Compliance Standards Branching Diagram */}
            {activeStep === 3 && (
              <div className="ed-pipe-panel ed-viz-stage">
                <div className="ed-viz-export-diagram">
                  <div className="ed-viz-report-hub">
                    <Download size={22} className="ed-accent-text" aria-hidden="true" />
                    <div>
                      <strong className="ed-mono">REPORT PACK</strong>
                      <span className="ed-viz-reviewed-sub ed-mono">One-Click Export</span>
                    </div>
                  </div>

                  <svg
                    className="ed-viz-audit-lines"
                    viewBox="0 0 300 32"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M 150 0 C 120 14, 75 14, 55 32" className="ed-viz-path-active" />
                    <path d="M 150 0 L 150 32" className="ed-viz-path-active" />
                    <path d="M 150 0 C 180 14, 225 14, 245 32" className="ed-viz-path-active" />
                  </svg>

                  <div className="ed-viz-export-cards">
                    <div className="ed-viz-export-card">
                      <span className="ed-mono ed-accent-text">METHOD</span>
                      <strong className="ed-viz-export-name">GHG Protocol</strong>
                      <span className="ed-mono ed-accent-text">✓ Scope 1 &amp; 2</span>
                    </div>

                    <div className="ed-viz-export-card">
                      <span className="ed-mono ed-accent-text">STANDARD</span>
                      <strong className="ed-viz-export-name">ISO 14064-1</strong>
                      <span className="ed-mono ed-accent-text">Statement format</span>
                    </div>

                    <div className="ed-viz-export-card">
                      <span className="ed-mono ed-accent-text">REGULATION</span>
                      <strong className="ed-viz-export-name">EU CBAM</strong>
                      <span className="ed-mono ed-pipe-muted">Not yet supported</span>
                    </div>
                  </div>
                </div>

                <div className="ed-viz-caption">
                  <span>Structured export ready for national MRV and ISO 14064-1 auditing</span>
                </div>
              </div>
            )}
          </div>

          {/* Stable Stage Details Box */}
          <div className="ed-pipe-detail">
            <div className="ed-pipe-detail-head">
              <span className="ed-mono ed-accent-text">
                STAGE 0{activeStep + 1} · {currentStep.sub}
              </span>
              <span className="ed-mono ed-pipe-status-pill">{currentStep.statusText}</span>
            </div>
            <p className="ed-pipe-detail-desc">{currentStep.desc}</p>
          </div>
        </div>
      ) : (
        <div className="ed-pipe-body">
          <div className="ed-pipe-sat-wrap">
            <div className="ed-pipe-panel-head">
              <span className="ed-mono ed-accent-text">SENTINEL-2 ORBITAL PASS · BANGLADESH GRID</span>
              <span className="ed-mono ed-pipe-muted">{selectedNode.ndvi}</span>
            </div>

            <div className="ed-pipe-sat-frame">
              <svg
                viewBox="0 0 340 230"
                className="ed-pipe-sat-svg"
                role="img"
                aria-label="Interactive satellite scan over Bangladesh carbon project corridors"
              >
                <g className="ed-sat-grid">
                  <line x1="0" y1="58" x2="340" y2="58" />
                  <line x1="0" y1="115" x2="340" y2="115" />
                  <line x1="0" y1="172" x2="340" y2="172" />
                  <line x1="85" y1="0" x2="85" y2="230" />
                  <line x1="170" y1="0" x2="170" y2="230" />
                  <line x1="255" y1="0" x2="255" y2="230" />
                </g>
                <path
                  d="M84,32 L142,24 L178,52 L248,58 L262,104 L234,138 L268,180 L244,218 L196,198 L152,216 L96,208 L82,160 L66,108 Z"
                  className="ed-sat-outline"
                />
                <path
                  d="M126,28 Q144,92 158,128 T184,206 M224,64 Q190,114 164,140"
                  className="ed-sat-rivers"
                />
                {BANGLADESH_SCAN_NODES.map((node) => (
                  <line
                    key={`link-${node.id}`}
                    x1={node.cx}
                    y1={node.cy}
                    x2={158}
                    y2={132}
                    className={`ed-sat-link ${node.id === selectedNode.id ? 'is-selected' : ''}`}
                  />
                ))}
                {BANGLADESH_SCAN_NODES.map((node) => {
                  const isSelected = node.id === selectedNode.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="ed-sat-node"
                    >
                      {isSelected && <circle cx={node.cx} cy={node.cy} r="13" className="ed-sat-halo" />}
                      <circle
                        cx={node.cx}
                        cy={node.cy}
                        r={isSelected ? '5.5' : '4'}
                        className={`ed-sat-dot ${isSelected ? 'is-selected' : ''}`}
                      />
                    </g>
                  );
                })}
              </svg>
              <div className="ed-pipe-sat-readout">
                <span className="ed-mono">{selectedNode.name}</span>
                <span className="ed-mono ed-accent-text">{selectedNode.metric}</span>
              </div>
            </div>

            <div className="ed-pipe-corridors" role="group" aria-label="Select Bangladesh corridor">
              {BANGLADESH_SCAN_NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`ed-pipe-corridor-btn ed-mono ${node.id === selectedNode.id ? 'is-active' : ''}`}
                >
                  {node.shortLabel}
                </button>
              ))}
            </div>

            <div className="ed-pipe-metrics-pair">
              <div className="ed-pipe-metric-cell">
                <span className="ed-mono ed-pipe-muted">TOTAL REDUCTION</span>
                <strong className="ed-pipe-metric-val">
                  10.42M <span className="ed-accent-text">tCO₂e</span>
                </strong>
              </div>
              <div className="ed-pipe-metric-cell">
                <span className="ed-mono ed-pipe-muted">FARMER PAYOUT RAIL</span>
                <strong className="ed-pipe-metric-val ed-accent-text">৳412.8M</strong>
              </div>
            </div>

            <div className="ed-pipe-steps" role="tablist" aria-label="Satellite MRV storytelling stages">
              {STORY_STEPS.map((st, idx) => (
                <button
                  key={st.id}
                  type="button"
                  role="tab"
                  aria-selected={activeStoryIdx === idx}
                  onClick={() => setActiveStoryIdx(idx)}
                  className={`ed-pipe-step-btn ${activeStoryIdx === idx ? 'is-active' : ''}`}
                >
                  <span className="ed-mono ed-pipe-step-num">{st.step}</span>
                  <span className="ed-pipe-step-name">{st.label}</span>
                </button>
              ))}
            </div>
            <p className="ed-pipe-detail-desc">
              <strong className="ed-mono ed-accent-text">[{activeStory.label}]</strong> {activeStory.detail}
            </p>
          </div>
        </div>
      )}

      {/* Hairline Audit Footnote */}
      <div className="ed-pipe-foot">
        <span className="ed-mono ed-pipe-muted">
          Every ledger entry traceable to primary source document · v2.4 MRV
        </span>
        <Link to="/platform/saas-dashboard" className="ed-pipe-foot-link ed-mono">
          Open Workspace →
        </Link>
      </div>
    </aside>
  );
}

export default EditorialHeroPipeline;
