import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');
const ALLOWED_FILES = new Set([
  path.join(SRC_DIR, 'styles', 'tokens.css'),
  path.join(SRC_DIR, 'features', 'carbon-monitoring', 'constants', 'layerConfig.js')
]);

const HEX_CLASS_REGEX = /\b(?:bg|text|border|from|to|via)-\[#[0-9a-fA-F]{3,8}\]/g;

let totalViolations = 0;
const violations = [];

function scanDirectory(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && /\.(jsx?|tsx?)$/.test(entry.name)) {
      if (ALLOWED_FILES.has(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        const matches = line.match(HEX_CLASS_REGEX);
        if (matches) {
          totalViolations += matches.length;
          violations.push({
            file: path.relative(process.cwd(), fullPath),
            line: index + 1,
            matches,
            snippet: line.trim().slice(0, 80)
          });
        }
      });
    }
  }
}

scanDirectory(SRC_DIR);

if (totalViolations > 0) {
  console.error(`\x1b[31m[check:colors] FAILED: Found ${totalViolations} raw hex class literals in src/:\x1b[0m\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} -> ${v.matches.join(', ')}`);
    console.error(`    ${v.snippet}\n`);
  }
  process.exit(1);
} else {
  console.log('\x1b[32m[check:colors] PASSED: Zero raw hex class literals found in src/.\x1b[0m');
  process.exit(0);
}

