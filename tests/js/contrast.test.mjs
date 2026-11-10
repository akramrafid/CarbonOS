import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * WCAG 2.1 Contrast Ratio Calculator
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getLuminance([r, g, b]) {
  return 0.2126 * sRgbToLinear(r) + 0.7152 * sRgbToLinear(g) + 0.0722 * sRgbToLinear(b);
}

function getContrastRatio(fgHex, bgHex) {
  const l1 = getLuminance(hexToRgb(fgHex));
  const l2 = getLuminance(hexToRgb(bgHex));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// -------------------------------------------------------------
// Dark Theme Pairings (Background: #080F0B Carbon)
// -------------------------------------------------------------
test('WCAG AA: Dark theme text and accents on carbon background (#080F0B)', () => {
  const bg = '#080F0B';

  const testCases = [
    { name: 'Primary Registry Text (#F0F4F1)', fg: '#F0F4F1', minRatio: 4.5 },
    { name: 'Secondary Mist Text (#B2C4B8)', fg: '#B2C4B8', minRatio: 4.5 },
    { name: 'Accent Emerald (#00C853)', fg: '#00C853', minRatio: 4.5 },
    { name: 'Accent Amber (#FFB300)', fg: '#FFB300', minRatio: 4.5 },
    { name: 'White Text (#FFFFFF)', fg: '#FFFFFF', minRatio: 7.0 }, // AAA
  ];

  for (const { name, fg, minRatio } of testCases) {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(
      ratio >= minRatio,
      `Expected ${name} to have contrast >= ${minRatio}:1 against ${bg}, got ${ratio.toFixed(2)}:1`
    );
  }
});

// -------------------------------------------------------------
// Light Theme Pairings (Linen #f2f3ee and Card White #ffffff)
// -------------------------------------------------------------
test('WCAG AA: Light theme text on linen canvas (#f2f3ee)', () => {
  const bg = '#f2f3ee';

  const testCases = [
    { name: 'Inverse Primary Text (#181414)', fg: '#181414', minRatio: 7.0 }, // AAA
    { name: 'Charcoal Heading/Body Text (#413f3f)', fg: '#413f3f', minRatio: 4.5 },
    { name: 'Secondary Muted Mist Text (#4b5563)', fg: '#4b5563', minRatio: 4.5 },
    { name: 'Accessible Forest Emerald (#166534)', fg: '#166534', minRatio: 4.5 },
    { name: 'Accessible Deep Amber (#b45309)', fg: '#b45309', minRatio: 4.5 },
    { name: 'Accessible Ocean Blue (#0369a1)', fg: '#0369a1', minRatio: 4.5 },
    { name: 'Accessible Crimson Red (#b91c1c)', fg: '#b91c1c', minRatio: 4.5 },
  ];

  for (const { name, fg, minRatio } of testCases) {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(
      ratio >= minRatio,
      `Expected ${name} to have contrast >= ${minRatio}:1 against ${bg}, got ${ratio.toFixed(2)}:1`
    );
  }
});

test('WCAG AA: Light theme text on crisp card surface (#ffffff)', () => {
  const bg = '#ffffff';

  const testCases = [
    { name: 'Inverse Primary Text (#181414)', fg: '#181414', minRatio: 7.0 }, // AAA
    { name: 'Charcoal Heading/Body Text (#413f3f)', fg: '#413f3f', minRatio: 4.5 },
    { name: 'Secondary Muted Mist Text (#4b5563)', fg: '#4b5563', minRatio: 4.5 },
    { name: 'Accessible Forest Emerald (#166534)', fg: '#166534', minRatio: 4.5 },
    { name: 'Accessible Deep Amber (#b45309)', fg: '#b45309', minRatio: 4.5 },
    { name: 'Accessible Ocean Blue (#0369a1)', fg: '#0369a1', minRatio: 4.5 },
    { name: 'Accessible Crimson Red (#b91c1c)', fg: '#b91c1c', minRatio: 4.5 },
  ];

  for (const { name, fg, minRatio } of testCases) {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(
      ratio >= minRatio,
      `Expected ${name} to have contrast >= ${minRatio}:1 against ${bg}, got ${ratio.toFixed(2)}:1`
    );
  }
});

// -------------------------------------------------------------
// Interactive Element Contrasts (Buttons, Badges)
// -------------------------------------------------------------
test('WCAG AA: Button and interactive component contrast', () => {
  const testCases = [
    { name: 'White text on Forest Emerald button (#166534)', fg: '#ffffff', bg: '#166534', minRatio: 4.5 },
    { name: 'White text on Dark Slate CTA (#080F0B)', fg: '#ffffff', bg: '#080F0B', minRatio: 7.0 },
    { name: 'White text on Forest container (#0D2B1A)', fg: '#ffffff', bg: '#0D2B1A', minRatio: 7.0 },
    { name: 'Amber badge text (#b45309) on warm amber badge (#fef3c7)', fg: '#b45309', bg: '#fef3c7', minRatio: 4.5 },
  ];

  for (const { name, fg, bg, minRatio } of testCases) {
    const ratio = getContrastRatio(fg, bg);
    assert.ok(
      ratio >= minRatio,
      `Expected ${name} to have contrast >= ${minRatio}:1, got ${ratio.toFixed(2)}:1`
    );
  }
});
