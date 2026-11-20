import fs from 'node:fs';
import path from 'node:path';

/**
 * Automated WCAG 2.1 AA Contrast Verification Script (Phase 9)
 * Parses `src/styles/tokens.css` directly, extracts both Dark and Light theme
 * token definitions, composites rgba() foregrounds over each surface token,
 * and asserts WCAG AA (>= 4.5:1) across all foreground/surface pairs and
 * primary CTA button pairs (`--color-fg-inverse` on `--color-accent-default`).
 */

const TOKENS_PATH = path.resolve('src/styles/tokens.css');

export function parseColor(str) {
  const s = str.trim();
  if (s.startsWith('#')) {
    let hex = s.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      1,
    ];
  }
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (m) {
    return [+m[1], +m[2], +m[3], m[4] !== undefined ? +m[4] : 1];
  }
  throw new Error(`Unsupported color format: ${str}`);
}

export function compositeOver(fg, bg) {
  const alpha = fg[3];
  if (alpha >= 1) return fg;
  return [
    Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
    Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
    Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
    1,
  ];
}

export function getRelativeLuminance([r, g, b]) {
  const [rl, gl, bl] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function getContrastRatio(fgStr, bgStr) {
  const bg = parseColor(bgStr);
  const fgRaw = parseColor(fgStr);
  const fg = compositeOver(fgRaw, bg);
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function extractThemeVars(cssText) {
  const darkBlockMatch = cssText.match(/:root,\s*\[data-theme="dark"\],\s*\.dark\s*\{([\s\S]*?)\}/);
  const lightBlockMatch = cssText.match(/\[data-theme="light"\],\s*\.light\s*\{([\s\S]*?)\}/);

  if (!darkBlockMatch || !lightBlockMatch) {
    throw new Error('Could not locate Dark or Light token blocks in src/styles/tokens.css');
  }

  const parseVars = (block) => {
    const vars = {};
    const regex = /(--color-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
    let m;
    while ((m = regex.exec(block)) !== null) {
      const key = m[1].trim();
      const val = m[2].replace(/\/\*[\s\S]*?\*\//g, '').trim();
      vars[key] = val;
    }
    return vars;
  };

  return {
    dark: parseVars(darkBlockMatch[1]),
    light: parseVars(lightBlockMatch[1]),
  };
}

export function runContrastAudit() {
  const cssText = fs.readFileSync(TOKENS_PATH, 'utf8');
  const themes = extractThemeVars(cssText);

  const surfaceKeys = [
    '--color-bg-canvas',
    '--color-bg-surface',
    '--color-bg-muted',
    '--color-bg-elevated',
  ];

  const foregroundKeys = [
    '--color-fg-primary',
    '--color-fg-secondary',
    '--color-fg-muted',
    '--color-fg-accent',
    '--color-accent-default',
    '--color-status-success',
    '--color-status-warning',
    '--color-status-error',
    '--color-status-info',
  ];

  const results = [];
  const failures = [];

  for (const [themeName, vars] of Object.entries(themes)) {
    for (const fgKey of foregroundKeys) {
      const fgVal = vars[fgKey];
      if (!fgVal) {
        failures.push(`[${themeName}] Missing foreground token ${fgKey}`);
        continue;
      }
      for (const bgKey of surfaceKeys) {
        const bgVal = vars[bgKey];
        if (!bgVal) {
          failures.push(`[${themeName}] Missing surface token ${bgKey}`);
          continue;
        }
        const ratio = getContrastRatio(fgVal, bgVal);
        const passed = ratio >= 4.5;
        results.push({ theme: themeName, fgKey, bgKey, fgVal, bgVal, ratio, passed });
        if (!passed) {
          failures.push(
            `[${themeName.toUpperCase()}] ${fgKey} (${fgVal}) on ${bgKey} (${bgVal}) = ${ratio.toFixed(2)}:1 (requires >= 4.50:1)`
          );
        }
      }
    }

    // Check inverse text on primary accent button
    const invVal = vars['--color-fg-inverse'];
    const accVal = vars['--color-accent-default'];
    const ctaRatio = getContrastRatio(invVal, accVal);
    const ctaPassed = ctaRatio >= 4.5;
    results.push({
      theme: themeName,
      fgKey: '--color-fg-inverse',
      bgKey: '--color-accent-default',
      fgVal: invVal,
      bgVal: accVal,
      ratio: ctaRatio,
      passed: ctaPassed,
    });
    if (!ctaPassed) {
      failures.push(
        `[${themeName.toUpperCase()}] --color-fg-inverse (${invVal}) on --color-accent-default (${accVal}) = ${ctaRatio.toFixed(2)}:1 (requires >= 4.50:1)`
      );
    }
  }

  return { results, failures };
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('check_contrast.mjs')) {
  const { results, failures } = runContrastAudit();
  if (failures.length > 0) {
    console.error(`WCAG AA Contrast Audit FAILED (${failures.length} violations):`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  } else {
    console.log(
      `WCAG AA Contrast Audit PASSED: ${results.length} token pairs verified across Dark & Light themes (all >= 4.5:1).`
    );
  }
}

