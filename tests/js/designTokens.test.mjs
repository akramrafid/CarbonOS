import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../src/index.css', import.meta.url), 'utf8');
const luminance = (hex) => hex.slice(1).match(/../g).map((v) => parseInt(v, 16) / 255)
  .map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

for (const theme of ['dark', 'light']) {
  test(`${theme} shared feedback and control tokens meet text/focus contrast`, () => {
    const block = css.match(new RegExp(`\\[data-theme="${theme}"\\] \\{([\\s\\S]*?)\\n\\}`))[1];
    const tokens = Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
    for (const state of ['success', 'warning', 'danger', 'neutral']) {
      assert.ok(contrast(tokens[`state-${state}-text`], tokens[`state-${state}-bg`]) >= 4.5, `${state} text`);
    }
    assert.ok(contrast(tokens['control-text'], tokens['control-bg']) >= 4.5, 'control text');
    assert.ok(contrast(tokens['control-primary-text'], tokens['control-primary-bg']) >= 4.5, 'button text');
    assert.ok(contrast(tokens['control-border'], tokens['control-bg']) >= 3, 'control border');
    assert.ok(contrast(tokens['control-focus'], tokens['control-bg']) >= 3, 'focus ring');
  });
}
