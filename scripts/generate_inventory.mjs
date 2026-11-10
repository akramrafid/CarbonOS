import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(jsx?|tsx?)$/.test(file)) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = walk('src');

// 1. Largest files
const fileStats = allFiles.map(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n').length;
  const relPath = path.relative(process.cwd(), f).replace(/\\/g, '/');
  return { path: relPath, lines, content };
});

const largest = fileStats.filter(f => f.lines > 400).sort((a,b) => b.lines - a.lines);

// 2. Hex/RGB literals per file
const hexRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
const rgbRegex = /\brgba?\([^)]+\)/g;

const hexPerFile = [];
for (const f of fileStats) {
  const hexMatches = f.content.match(hexRegex) || [];
  const rgbMatches = f.content.match(rgbRegex) || [];
  const total = hexMatches.length + rgbMatches.length;
  if (total > 0) {
    hexPerFile.push({
      path: f.path,
      hexCount: hexMatches.length,
      rgbCount: rgbMatches.length,
      sample: [...new Set([...hexMatches, ...rgbMatches])].slice(0, 5)
    });
  }
}
hexPerFile.sort((a,b) => (b.hexCount + b.rgbCount) - (a.hexCount + a.rgbCount));

// 3. Spacing violations: py/pt/pb/my >= 16 (4rem) and min-h-screen / h-screen
const spacingRegex = /\b(py|pt|pb|my)-(16|20|24|28|32|36|40|44|48|52|56|60|64)\b/g;
const screenRegex = /\b(min-h-screen|h-screen)\b/g;

const spacingPerFile = [];
for (const f of fileStats) {
  const spacingMatches = f.content.match(spacingRegex) || [];
  const screenMatches = f.content.match(screenRegex) || [];
  if (spacingMatches.length > 0 || screenMatches.length > 0) {
    spacingPerFile.push({
      path: f.path,
      spacingCount: spacingMatches.length,
      spacingSamples: [...new Set(spacingMatches)],
      screenMatches: [...new Set(screenMatches)],
      screenCount: screenMatches.length
    });
  }
}
spacingPerFile.sort((a,b) => (b.spacingCount + b.screenCount) - (a.spacingCount + a.screenCount));

// 4. Repeated patterns
const repeatedPatterns = [
  {
    pattern: "Modals (Inconsistent overlay, close button, and focus behavior)",
    files: [
      "src/components/RequestDemoModal.jsx",
      "src/components/marketplace/CheckoutModal.jsx",
      "src/components/payments/PurchaseConfirmModal.jsx",
      "src/pages/platform/components/EsgAuditModal.jsx"
    ],
    issue: "Multiple distinct modal shells instead of a unified accessible Dialog primitive."
  },
  {
    pattern: "Stat Cards / Metric KPI Tiles",
    files: [
      "src/pages/platform/SaaSDashboard.jsx",
      "src/pages/platform/MRVDashboard.jsx",
      "src/pages/platform/CarbonRegistry.jsx",
      "src/pages/platform/Impact.jsx",
      "src/pages/farmers-ai/HarvestGuardDashboard.jsx",
      "src/components/LiveMetrics.jsx"
    ],
    issue: "Repeated card markup with hardcoded borders, shadows, backgrounds, and tabular numbers."
  },
  {
    pattern: "Section Headers (Badge + Title + Paragraph)",
    files: [
      "src/components/Hero.jsx",
      "src/components/Philosophy.jsx",
      "src/components/Roadmap.jsx",
      "src/components/CorporateSaaSPipeline.jsx",
      "src/components/FrameworkAlignment.jsx",
      "src/components/ClientShowcase.jsx",
      "src/pages/Technology.jsx"
    ],
    issue: "Nearly identical markup for centered pill badges, headings with gradients, and muted subtitles."
  },
  {
    pattern: "Data Tables with Ad-hoc Mobile Scrolling",
    files: [
      "src/pages/platform/CarbonRegistry.jsx",
      "src/pages/platform/MRVDashboard.jsx",
      "src/pages/platform/esg/BillAnalysisPanel.jsx",
      "src/pages/platform/components/ActivityEvidenceWorkspace.jsx"
    ],
    issue: "Inline table implementations with varying overflow wrappers and lack of sticky headers/columns."
  }
];

// Routes map
const routes = [
  { path: '/', component: 'src/pages/Home.jsx', desc: 'CarbonOS Corporate & National Landing Page' },
  { path: '/how-it-works', component: 'src/pages/HowItWorks.jsx', desc: 'Process Architecture & Workflow Explanation' },
  { path: '/platform/project-onboarding', component: 'src/pages/platform/ProjectOnboarding.jsx', desc: 'Step-by-step Carbon Project Registration Wizard' },
  { path: '/platform/mrv-dashboard', component: 'src/pages/platform/MRVDashboard.jsx', desc: 'Measurement, Reporting & Verification Telemetry Console' },
  { path: '/platform/carbon-registry', component: 'src/pages/platform/CarbonRegistry.jsx', desc: 'National Carbon Asset Ledger & Credit Registry' },
  { path: '/platform/verification-workflow', component: 'src/pages/platform/VerificationWorkflow.jsx', desc: 'Auditor & Validator Review Pipeline' },
  { path: '/platform/marketplace', component: 'src/components/marketplace/MarketplaceBrowse.jsx', desc: 'Credit Purchasing & Farmer Offtake Marketplace' },
  { path: '/platform/ai-detection', component: 'src/pages/platform/AIDetection.jsx', desc: 'Multi-spectral AI Remote Sensing & Change Detection' },
  { path: '/platform/saas-dashboard', component: 'src/pages/platform/SaaSDashboard.jsx', desc: 'Enterprise SaaS Carbon Accounting & Billing Portal' },
  { path: '/platform/esg', component: 'src/pages/platform/esg/EsgWorkspace.jsx', desc: 'Corporate ESG Intake, Utility Bill OCR & Scope 1-3 Calculator' },
  { path: '/platform/impact', component: 'src/pages/platform/Impact.jsx', desc: 'SDG Impact Metrics & Community Benefit Tracking' },
  { path: '/carbon-monitoring', component: 'src/pages/platform/CarbonMonitoring.jsx', desc: 'Integrated GIS Satellite & Biomass Heatmap Console' },
  { path: '/farmers-ai', component: 'src/pages/farmers-ai/FarmersAILanding.jsx', desc: 'Farmer-first AI Crop Health & Carbon Diagnostics' },
  { path: '/farmers-ai/camera', component: 'src/pages/farmers-ai/CameraCapture.jsx', desc: 'Field Camera & Offline Photo Capture UI' },
  { path: '/farmers-ai/result', component: 'src/pages/farmers-ai/DiagnosisResult.jsx', desc: 'Crop Pest/Disease Diagnosis & Treatment Advisory' },
  { path: '/harvestguard/dashboard', component: 'src/pages/farmers-ai/HarvestGuardDashboard.jsx', desc: 'Farmer Cooperative Yield & Carbon Aggregation' },
  { path: '/harvestguard/register-batch', component: 'src/pages/farmers-ai/BatchRegistration.jsx', desc: 'Agricultural Parcel & Batch Enrollment' },
  { path: '/harvestguard/risk-analysis/:batchId', component: 'src/components/farmers-ai/WeatherRiskWidget.jsx', desc: 'Micro-climate & Monsoon Risk Analysis' },
  { path: '/harvestguard/risk-map', component: 'src/components/farmers-ai/LocalRiskMap.jsx', desc: 'Geo-spatial Plot Weather & Flood Risk Map' },
  { path: '/technology', component: 'src/pages/Technology.jsx', desc: 'Core Tech Stack: Sentinel, Drone LiDAR, Grad-CAM, dMRV' },
  { path: '/dashboard/farmer', component: 'src/components/dashboard/FarmerCreditsWidget.jsx', desc: 'Smallholder Farmer Direct Credit Balance' },
  { path: '/dashboard/farmer/earnings', component: 'src/pages/platform/FarmerEarnings.jsx', desc: 'MFS / bKash Payout Ledger & History' },
  { path: '/sectors/solar-irrigation', component: 'src/pages/sectors/SolarIrrigation.jsx', desc: 'Clean Energy Irrigation Sector Profile' },
  { path: '/sectors/rice-methane', component: 'src/pages/sectors/RiceMethane.jsx', desc: 'AWD Alternate Wetting & Drying Sector Profile' },
  { path: '/sectors/clean-cookstoves', component: 'src/pages/sectors/CleanCookstoves.jsx', desc: 'Improved Biomass Cookstove Sector Profile' },
  { path: '/sectors/waste-to-energy', component: 'src/pages/sectors/WasteToEnergy.jsx', desc: 'Municipal Solid Waste Biogas Profile' },
  { path: '/sectors/mangrove-carbon', component: 'src/pages/sectors/MangroveCarbon.jsx', desc: 'Sundarbans Blue Carbon Sequestration Profile' },
  { path: '/sectors/brick-kilns', component: 'src/pages/sectors/BrickKilns.jsx', desc: 'Zigzag & HHK Industrial Kiln Modernization' },
  { path: '/company/about', component: 'src/pages/company/About.jsx', desc: 'Team, Mission & Advisory Governance' },
  { path: '/company/framework-docs', component: 'src/pages/company/FrameworkDocs.jsx', desc: 'Methodology & Article 6.2 Regulatory Alignment' },
  { path: '/company/api-docs', component: 'src/pages/company/APIDocs.jsx', desc: 'REST & GraphQL Developer Documentation' },
  { path: '/company/careers', component: 'src/pages/company/Careers.jsx', desc: 'Open Engineering & Climate Science Roles' },
  { path: '/company/privacy', component: 'src/pages/company/Privacy.jsx', desc: 'Privacy Policy & Data Sovereign Protocol' },
  { path: '/company/terms', component: 'src/pages/company/Terms.jsx', desc: 'Terms of Service & Tokenized Asset Disclaimers' },
  { path: '/forbidden', component: 'src/pages/Forbidden.jsx', desc: '403 Forbidden Access State' },
  { path: '/*', component: 'src/pages/NotFound.jsx', desc: '404 Dynamic Route Catch-all' }
];

let md = `# Codebase Inventory & Structural Audit

Generated as part of **Phase 0: Preflight and Baseline** for the comprehensive UI/UX overhaul.

---

## 1. Route Map
Total active routes: **${routes.length}**

| Path | Primary Component | Responsibility & Description |
| :--- | :--- | :--- |
${routes.map(r => `| \`${r.path}\` | [${path.basename(r.component)}](file:///${path.resolve(r.component).replace(/\\\\/g, '/')}) | ${r.desc} |`).join('\n')}

---

## 2. Monolithic & Large Files (>400 Lines)
The following **${largest.length}** files exceed the 400-line modularity threshold and require decomposition into domain panels under \`src/features/\`:

| Lines | File Path | Modularity Risk & Notes |
| :---: | :--- | :--- |
${largest.map(f => {
  let note = "High complexity component needing decomposition.";
  if (f.path.includes('CarbonMonitoring.jsx')) note = "Monolithic GIS, heatmap, charts, layer toggles, and state (~5.7k lines).";
  else if (f.path.includes('SaaSDashboard.jsx')) note = "Monolithic enterprise suite with ESG, billing, metrics, and modals (~5.0k lines).";
  else if (f.path.includes('CarbonRegistry.jsx')) note = "Registry ledger, table filters, retirement modals, and issuance flows (~1.7k lines).";
  else if (f.path.includes('ActivityEvidenceWorkspace.jsx')) note = "Evidence uploads, audit trails, and document reviewers (~1.3k lines).";
  else if (f.path.includes('MarketplaceBrowse.jsx')) note = "Product cards, cart state, checkout drawers, and filtering (~1.3k lines).";
  else if (f.path.includes('DiagnosisResult.jsx')) note = "Diagnosis card, treatment actions, disease explanations, and weather (~1.0k lines).";
  return `| **${f.lines}** | [${f.path}](file:///${path.resolve(f.path).replace(/\\\\/g, '/')}) | ${note} |`;
}).join('\n')}

---

## 3. Near-Duplicate Components & Repeated JSX Blocks

${repeatedPatterns.map(p => `### ${p.pattern}
**Identified In:**
${p.files.map(f => `- [\`${f}\`](file:///${path.resolve(f).replace(/\\\\/g, '/')})`).join('\n')}

**Issue & Remediation Plan:**
${p.issue}
`).join('\n')}

---

## 4. Hardcoded Hex & RGB Literals per File
Files containing hardcoded color literals that must be mapped to semantic CSS tokens:
Total files affected: **${hexPerFile.length}**

| File | Hex Literals | RGB(A) Literals | Sample Literals |
| :--- | :---: | :---: | :--- |
${hexPerFile.slice(0, 30).map(h => `| [\`${h.path}\`](file:///${path.resolve(h.path).replace(/\\\\/g, '/')}) | ${h.hexCount} | ${h.rgbCount} | \`${h.sample.join(', ')}\` |`).join('\n')}
${hexPerFile.length > 30 ? `| *...and ${hexPerFile.length - 30} additional files* | | | |` : ''}

---

## 5. Spacing Rhythm & Viewport Height Violations
Identified **${spacingPerFile.length}** files utilizing excessive vertical spacing (\`py-\`, \`pt-\`, \`pb-\`, \`my-\` $\\ge$ 16 / 4rem) or fixed \`h-screen\` / \`min-h-screen\`:

| File | $\\ge$ 4rem Classes | \`h-screen\` / \`min-h-screen\` | Discovered Tokens |
| :--- | :---: | :---: | :--- |
${spacingPerFile.slice(0, 25).map(s => `| [\`${s.path}\`](file:///${path.resolve(s.path).replace(/\\\\/g, '/')}) | ${s.spacingCount} | ${s.screenCount} | \`${[...s.spacingSamples, ...s.screenMatches].join(', ')}\` |`).join('\n')}
${spacingPerFile.length > 25 ? `| *...and ${spacingPerFile.length - 25} additional files* | | | |` : ''}

---

## 6. Summary of Action Items for Upcoming Phases
1. **Phase 1 (Architecture)**: Extract \`CarbonMonitoring.jsx\` (5,707 lines) and \`SaaSDashboard.jsx\` (4,967 lines) into feature slices. Unify \`Card\`, \`Modal\`, \`StatCard\`, and \`DataTable\`.
2. **Phase 2 (Design Tokens & Spacing)**: Eliminate 100+ hardcoded hex colors; replace unconstrained \`py-24\`/\`py-32\` with parent-controlled \`--section-y: clamp(2.5rem, 5vw, 5rem)\`.
3. **Phase 3 (Card Clipping)**: Address overflow-clipping and lack of \`min-w-0\` in cards across grid containers.
4. **Phase 4-5 (Navigation & Footer)**: Introduce config-driven \`nav.config.js\` and \`footer.config.js\` with responsive drawer/rail system.
`;

fs.writeFileSync('docs/inventory.md', md, 'utf8');
console.log('Successfully generated docs/inventory.md');
