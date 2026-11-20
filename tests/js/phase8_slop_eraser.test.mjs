import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

function getAllSourceFiles(dirPath, filesList = []) {
  if (!fs.existsSync(dirPath)) return filesList;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      getAllSourceFiles(fullPath, filesList);
    } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

test('Phase 8 Copy Slop: zero banned AI-slop buzzwords across src/', () => {
  const files = getAllSourceFiles(SRC_DIR);
  const buzzwords =
    /\b(seamlessly|seamless|unlock(?:ing|s)?|empower(?:ing|s|ed)?|revolutioniz(?:e|ing|ed|es)|cutting-edge|next-generation|next-gen|leverag(?:e|ing|es|ed)|game-changing)\b/gi;
  const violations = [];

  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      // Allow Lucide `Unlock` icon component import/JSX
      if (line.includes('lucide-react') || line.includes('<Unlock')) return;
      const matches = line.match(buzzwords);
      if (matches) {
        violations.push(`${path.relative(ROOT, file)}:${idx + 1} (${matches.join(', ')})`);
      }
    });
  }

  assert.equal(
    violations.length,
    0,
    `Found banned AI-slop buzzwords in src/:\n${violations.join('\n')}`
  );
});

test('Phase 8 Visual Slop: zero pictograph emojis used as icons, zero purple/blue gradients, zero blur blobs', () => {
  const files = getAllSourceFiles(SRC_DIR);
  const pictoRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const allowedTypo = new Set(['✓', '✕', '⚠', '⚡', '●']);
  const purpleBlueGradRe = /from-(?:purple|indigo|blue)-\d+\s+to-(?:purple|indigo|blue|pink)-\d+/g;
  const blurBlobRe = /blur-(?:2xl|3xl)[^\n]*rounded-full[^\n]*pointer-events-none/g;

  const violations = [];

  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
      const rel = `${path.relative(ROOT, file)}:${idx + 1}`;
      const emojis = (line.match(pictoRe) || []).filter((ch) => !allowedTypo.has(ch));
      if (emojis.length > 0) {
        violations.push(`[Emoji Icon] ${rel}: ${emojis.join(', ')}`);
      }
      if (purpleBlueGradRe.test(line)) {
        violations.push(`[Purple/Blue Gradient] ${rel}`);
      }
      if (blurBlobRe.test(line)) {
        violations.push(`[Decorative Blur Blob] ${rel}`);
      }
    });
  }

  assert.equal(
    violations.length,
    0,
    `Found visual slop violations in src/:\n${violations.join('\n')}`
  );
});

test('Phase 8 Honesty & Demo Data: simulated profiles, roadmap targets, and seed data are labeled Demo data', () => {
  const showcaseSrc = fs.readFileSync(
    path.join(SRC_DIR, 'components/ClientShowcase.jsx'),
    'utf8'
  );
  assert.doesNotMatch(showcaseSrc, /Verified Client/);
  assert.doesNotMatch(showcaseSrc, /Verified Offset/);
  assert.match(showcaseSrc, /Demo Profile/);
  assert.match(showcaseSrc, /Demo Baseline/);

  const timelineSrc = fs.readFileSync(
    path.join(SRC_DIR, 'components/technology/DeploymentTimeline.jsx'),
    'utf8'
  );
  assert.doesNotMatch(timelineSrc, /MoEFCC letter of support secured/);
  assert.doesNotMatch(timelineSrc, /Series A close/);
  assert.match(timelineSrc, /Demo data/);

  const seed1Src = fs.readFileSync(
    path.join(SRC_DIR, 'components/marketplace/marketplaceSeedData1.js'),
    'utf8'
  );
  assert.match(seed1Src, /Demo data · Sentinel-2 NDVI/);
});

test('Phase 8 Report: docs/slop-report.md exists with itemized counts', () => {
  const reportPath = path.join(ROOT, 'docs/slop-report.md');
  assert.ok(fs.existsSync(reportPath), 'docs/slop-report.md must exist');
  const report = fs.readFileSync(reportPath, 'utf8');
  assert.match(report, /Visual Slop/);
  assert.match(report, /Copy Slop/);
  assert.match(report, /Code Slop/);
  assert.match(report, /Demo data/);
});

