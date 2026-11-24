import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Layers } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { getPrefersReducedMotion } from '../../../lib/motion';
import { LAYER_CONFIG } from '../constants';

/**
 * Phase 7: Satellite / dMRV & Crop AI Visual Comparison Card
 * - Self-drawing boundary polygon SVG (`stroke-dasharray` / `stroke-dashoffset`)
 * - Smooth layer crossfade
 * - Interactive Grad-CAM Original-to-Heatmap toggle + Opacity Slider (0%–100%)
 */
export function GradCamComparisonCard({
  activeLayer = 'ndvi',
  drawPoints = [],
  isLight = false,
}) {
  const [gradCamOpacity, setGradCamOpacity] = useState(65);
  const [viewMode, setViewMode] = useState('blend'); // 'original' | 'blend' | 'heatmap'
  const [polygonDrawn, setPolygonDrawn] = useState(() => getPrefersReducedMotion());

  const effectiveOpacity =
    viewMode === 'original' ? 0 : viewMode === 'heatmap' ? 100 : gradCamOpacity;

  // Normalize lat/lng drawPoints into a 240x110 SVG viewBox polygon
  const svgPolygonPoints = useMemo(() => {
    if (!Array.isArray(drawPoints) || drawPoints.length < 3) {
      return '36,24 198,18 214,82 126,96 28,78';
    }
    const lats = drawPoints.map((p) => p[0]);
    const lngs = drawPoints.map((p) => p[1]);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 0.0001);
    const lngSpan = Math.max(maxLng - minLng, 0.0001);

    return drawPoints
      .map(([lat, lng]) => {
        const x = 24 + ((lng - minLng) / lngSpan) * 192;
        const y = 92 - ((lat - minLat) / latSpan) * 74;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [drawPoints]);

  useEffect(() => {
    if (getPrefersReducedMotion()) {
      setPolygonDrawn(true);
      return undefined;
    }
    setPolygonDrawn(false);
    const rafId = window.requestAnimationFrame(() => {
      setPolygonDrawn(true);
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [svgPolygonPoints]);

  const layerGradient =
    LAYER_CONFIG[activeLayer]?.gradientCSS ||
    'linear-gradient(90deg, #064E3B 0%, #10B981 55%, #00E676 100%)';

  return (
    <div
      className={`p-4 rounded-xl border space-y-3 ${
        isLight ? 'bg-bg-canvas border-border-subtle' : 'bg-white/5 border-white/10'
      }`}
      data-testid="gradcam-comparison-card"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold uppercase text-[10px] tracking-wider text-emerald flex items-center gap-1.5">
          <Layers size={13} />
          <span>dMRV Layer & Grad-CAM Inspector</span>
        </span>
        <span className="text-[11px] font-mono tabular-nums text-emerald">
          Overlay: {effectiveOpacity}%
        </span>
      </div>

      {/* Layer Crossfade + Self-Drawing Boundary Polygon Viewport */}
      <div className="relative h-28 rounded-lg overflow-hidden border border-border-subtle bg-bg-muted">
        {/* Base Optical Sentinel-2 Band */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              'radial-gradient(circle at 30% 40%, rgba(16, 185, 129, 0.22), rgba(8, 15, 11, 0.92))',
          }}
        />

        {/* Crossfading Spectral / Grad-CAM Heatmap Overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300 ease-out"
          style={{
            background: layerGradient,
            opacity: (effectiveOpacity / 100) * 0.72,
            mixBlendMode: 'screen',
          }}
          data-testid="gradcam-heatmap-layer"
        />

        {/* Self-Drawing Boundary Polygon SVG */}
        <svg
          viewBox="0 0 240 110"
          className="relative z-10 w-full h-full"
          role="img"
          aria-label="Self-drawing target reserve boundary polygon"
        >
          <polygon
            key={svgPolygonPoints}
            points={svgPolygonPoints}
            fill="rgba(0, 200, 83, 0.14)"
            stroke="var(--color-accent-default)"
            strokeWidth="2"
            strokeDasharray="600"
            strokeDashoffset={polygonDrawn ? 0 : 600}
            style={{
              transition: 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          />
        </svg>
      </div>

      {/* Mode Switch Buttons (Original / Blend / Grad-CAM) */}
      <div className="flex items-center justify-between gap-1.5">
        {[
          ['original', 'Original (0%)'],
          ['blend', 'Blend'],
          ['heatmap', 'Grad-CAM (100%)'],
        ].map(([modeKey, label]) => (
          <Button
            key={modeKey}
            type="button"
            variant={viewMode === modeKey ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              setViewMode(modeKey);
              if (modeKey === 'original') setGradCamOpacity(0);
              if (modeKey === 'heatmap') setGradCamOpacity(100);
              if (modeKey === 'blend' && (gradCamOpacity === 0 || gradCamOpacity === 100)) {
                setGradCamOpacity(65);
              }
            }}
            className="text-[11px] font-mono px-2.5 py-1 h-8"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Grad-CAM Opacity Slider */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <label
            htmlFor="dmrv-gradcam-opacity"
            className={`font-mono flex items-center gap-1 ${
              isLight ? 'text-fg-secondary' : 'text-mist'
            }`}
          >
            <Eye size={12} className="text-emerald" />
            <span>Grad-CAM Attribution Opacity</span>
          </label>
          <span className="font-mono tabular-nums text-emerald">{effectiveOpacity}%</span>
        </div>
        <input
          id="dmrv-gradcam-opacity"
          type="range"
          min="0"
          max="100"
          value={effectiveOpacity}
          aria-label="Grad-CAM heatmap opacity"
          onChange={(e) => {
            setViewMode('blend');
            setGradCamOpacity(Number(e.target.value));
          }}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <p className={`text-[10px] font-mono ${isLight ? 'text-fg-secondary' : 'text-mist/80'}`}>
          Schematic boundary &amp; layer blend preview (illustrative UI; pixel Grad-CAM comes from inference server).
        </p>
      </div>
    </div>
  );
}

export default GradCamComparisonCard;

