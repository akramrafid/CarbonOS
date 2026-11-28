import React from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowUpRight, ShieldCheck, Activity, Database, Layers } from 'lucide-react';

function renderModuleMiniVisual(moduleItem) {
  switch (moduleItem.vizType) {
    case 'esg':
      return (
        <div className="ed-mod-mini-viz">
          <div className="ed-mod-viz-row">
            <span className="ed-mono ed-accent-text">DESCO / TITAS OCR</span>
            <span className="ed-mono">SHA-256 LOCKED</span>
          </div>
          <div className="ed-mod-viz-bars">
            <div><span className="ed-mono">Scope 1</span><div className="ed-mod-bar"><span style={{ width: '48%' }} /></div></div>
            <div><span className="ed-mono">Scope 2</span><div className="ed-mod-bar"><span style={{ width: '82%' }} /></div></div>
            <div><span className="ed-mono">Scope 3</span><div className="ed-mod-bar"><span style={{ width: '61%' }} /></div></div>
          </div>
        </div>
      );
    case 'dmrv':
      return (
        <div className="ed-mod-mini-viz">
          <div className="ed-mod-viz-row">
            <span className="ed-mono ed-accent-text">SENTINEL-1/2 + GEDI</span>
            <span className="ed-mono">10M RESOLUTION</span>
          </div>
          <div className="ed-mod-viz-grid">
            {[0.84, 0.78, 0.91, 0.67, 0.88, 0.73, 0.94, 0.81].map((v, i) => (
              <div key={i} className="ed-mod-pixel" style={{ opacity: v }}>
                <span className="ed-mono">{Math.round(v * 100)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'registry':
      return (
        <div className="ed-mod-mini-viz">
          <div className="ed-mod-viz-row">
            <span className="ed-mono ed-accent-text">SERIAL CHAIN #BD-2026</span>
            <span className="ed-mono">CAD TRUST READY</span>
          </div>
          <div className="ed-mod-hash-stack ed-mono">
            <span>PREV: 7f83b1657ff1fc53...a910</span>
            <span className="ed-accent-text">CURR: e3b0c44298fc1c14...b855</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="ed-mod-mini-viz">
          <div className="ed-mod-viz-row">
            <span className="ed-mono ed-accent-text">LIVE PROTOCOL TELEMETRY</span>
            <span className="ed-mono">{moduleItem.badge || 'ACTIVE'}</span>
          </div>
          <div className="ed-mod-viz-bars">
            <div><span className="ed-mono">Verification</span><div className="ed-mod-bar"><span style={{ width: '92%' }} /></div></div>
            <div><span className="ed-mono">Settlement</span><div className="ed-mod-bar"><span style={{ width: '97%' }} /></div></div>
          </div>
        </div>
      );
  }
}

export function EditorialModuleModal({
  moduleItem,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) {
  if (!moduleItem) return null;

  const Icon =
    moduleItem.vizType === 'esg'
      ? ShieldCheck
      : moduleItem.vizType === 'dmrv'
      ? Layers
      : moduleItem.vizType === 'registry'
      ? Database
      : Activity;

  return (
    <aside
      className="ed-mod-modal"
      role="dialog"
      aria-label={`${moduleItem.title} architecture preview`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="ed-mod-modal-head">
        <div className="ed-mod-modal-title-row">
          <span className="ed-mod-modal-icon" aria-hidden="true">
            <Icon size={16} />
          </span>
          <div>
            <span className="ed-mono ed-accent-text">
              {moduleItem.idx} · {moduleItem.pillarTag || 'CORE WORKSPACE'}
            </span>
            <h3 className="ed-mod-modal-title">{moduleItem.title}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="ed-pill ed-pill--subtle ed-pill--compact"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>

      {renderModuleMiniVisual(moduleItem)}

      <div className="ed-mod-modal-body">
        <div className="ed-mod-detail-row">
          <span className="ed-mono ed-muted-text">HOW WE HANDLE IT</span>
          <p>{moduleItem.how}</p>
        </div>
        <div className="ed-mod-detail-row">
          <span className="ed-mono ed-muted-text">CORE IDEA</span>
          <p>{moduleItem.coreIdea}</p>
        </div>
      </div>

      <div className="ed-mod-modal-foot">
        <span className="ed-mono ed-muted-text">{moduleItem.meta}</span>
        <Link to={moduleItem.to} className="ed-pill ed-pill--accent ed-pill--compact">
          <span>Launch Workspace</span>
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

export default EditorialModuleModal;
