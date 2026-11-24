import React, { useEffect, useRef } from 'react';
import { getPrefersReducedMotion } from '../../lib/motion';

/**
 * Interactive topographic carbon-flux contour canvas centered on the single accent Zero Line.
 * - Fine pointer: bends nearby contour field around cursor.
 * - Click / pointerdown: triggers an expanding scan ripple along the contours.
 * - Coarse / touch pointer: drifts gently on its own without pointer dependency.
 * - Pauses RAF when document.visibilityState === 'hidden' or prefers-reduced-motion is active.
 */
export function EditorialHeroCanvas({ theme, onRipple }) {
  const canvasRef = useRef(null);
  const onRippleRef = useRef(onRipple);
  onRippleRef.current = onRipple;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const rootEl = canvas.closest('.ed-root') || document.documentElement;
    const isFinePointer = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
    const reduced = getPrefersReducedMotion();

    const isDark = theme === 'dark';
    let inkColor = isDark ? '#F0F4F1' : '#181414';
    let accentColor = isDark ? '#00C853' : '#166534';

    const readColors = () => {
      const cs = window.getComputedStyle(rootEl);
      inkColor = cs.getPropertyValue('--ed-ink').trim() || (theme === 'dark' ? '#F0F4F1' : '#181414');
      accentColor = cs.getPropertyValue('--ed-accent').trim() || (theme === 'dark' ? '#00C853' : '#166534');
    };

    readColors();

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const pointer = { x: width * 0.62, y: height * 0.48, active: false };
    const smoothPointer = { x: width * 0.62, y: height * 0.48 };
    const ripples = [];
    let phase = 0;
    let rafId = null;

    const drawFrame = (stepPhase) => {
      ctx.clearRect(0, 0, width, height);

      const lineCount = 15;
      const zeroIndex = 7;
      const stepX = width < 640 ? 18 : 14;
      const radiusSqMax = 240 * 240;

      // Advance active click ripples
      for (let i = ripples.length - 1; i >= 0; i -= 1) {
        ripples[i].radius += 5.5;
        ripples[i].alpha *= 0.965;
        if (ripples[i].alpha < 0.03) {
          ripples.splice(i, 1);
        }
      }

      if (!isFinePointer) {
        // Gentle autonomous drift for touch / coarse-pointer viewports
        smoothPointer.x = width * (0.5 + 0.24 * Math.sin(stepPhase * 0.42));
        smoothPointer.y = height * (0.5 + 0.14 * Math.cos(stepPhase * 0.35));
      } else {
        smoothPointer.x += (pointer.x - smoothPointer.x) * 0.09;
        smoothPointer.y += (pointer.y - smoothPointer.y) * 0.09;
      }

      for (let idx = 0; idx < lineCount; idx += 1) {
        const isZeroLine = idx === zeroIndex;
        const baseY = ((idx + 1) / (lineCount + 1)) * height;

        ctx.beginPath();
        ctx.strokeStyle = isZeroLine ? accentColor : inkColor;
        ctx.lineWidth = isZeroLine ? 1.85 : 1;
        ctx.globalAlpha = isZeroLine ? 0.92 : 0.14;
        ctx.setLineDash(isZeroLine ? [] : []);

        for (let x = 0; x <= width + stepX; x += stepX) {
          const nx = x / width;
          let y =
            baseY +
            Math.sin(nx * 5.2 + stepPhase + idx * 0.38) * (isZeroLine ? 12 : 16) +
            Math.cos(nx * 2.4 - stepPhase * 0.65 + idx * 0.22) * 8;

          const dx = x - smoothPointer.x;
          const dy = y - smoothPointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSqMax) {
            const falloff = 1 - distSq / radiusSqMax;
            const influence = pointer.active || !isFinePointer ? 26 : 10;
            y += falloff * falloff * (dy >= 0 ? influence : -influence);
          }

          for (let r = 0; r < ripples.length; r += 1) {
            const rp = ripples[r];
            const rx = x - rp.x;
            const ry = y - rp.y;
            const dist = Math.hypot(rx, ry);
            const band = Math.abs(dist - rp.radius);
            if (band < 48) {
              const pulse = (1 - band / 48) * rp.alpha * 18;
              y += Math.sin((band / 48) * Math.PI) * pulse;
            }
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      // Draw crisp expanding accent ring for active click ripples
      for (let r = 0; r < ripples.length; r += 1) {
        const rp = ripples[r];
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = rp.alpha * 0.55;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (document.visibilityState === 'hidden') {
        rafId = null;
        return;
      }
      phase += 0.011;
      drawFrame(phase);
      rafId = window.requestAnimationFrame(tick);
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handlePointerDown = (e) => {
      if (
        e.target instanceof Element &&
        e.target.closest('.ed-hero-pipeline, .ed-nav, .ed-mobile-drawer, button, a, input, select, textarea, [role="dialog"]')
      ) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (y < 0 || y > rect.height) return;
      if (ripples.length >= 4) ripples.shift();
      ripples.push({ x, y, radius: 6, alpha: 0.9 });
      if (typeof onRippleRef.current === 'function') {
        onRippleRef.current();
      }
      if (reduced) {
        drawFrame(phase);
      }
    };

    const handleVisibility = () => {
      if (reduced) return;
      if (document.visibilityState === 'hidden' && rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      } else if (document.visibilityState === 'visible' && rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleResize = () => {
      readColors();
      resize();
      if (reduced) drawFrame(phase);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);

    const syncRafId = window.requestAnimationFrame(() => {
      readColors();
      if (reduced) drawFrame(phase);
    });

    if (reduced) {
      drawFrame(0);
    } else if (document.visibilityState !== 'hidden') {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(syncRafId);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="ed-hero-canvas" aria-hidden="true" />;
}

export default EditorialHeroCanvas;
