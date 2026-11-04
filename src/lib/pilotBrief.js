export const PILOT_FORMATS = { text: 'Text / Markdown', pdf: 'Text-based PDF', spreadsheet: 'CSV / XLSX', scan: 'Scanned invoice / image' };
export const PILOT_FACILITIES = { one: '1 facility', small: '2–5 facilities', larger: '6+ facilities' };
export const PILOT_LANGUAGES = { en: 'English', bn: 'Bengali', mixed: 'English and Bengali' };
export const PILOT_GOALS = { inventory: 'Scope 1 and 2 inventory', evidence: 'Document evidence review', extended: 'Scope 3 / product footprint / regulatory filing' };

export function buildPilotBrief({ facilities, formats, language, goal }) {
  if (!PILOT_FACILITIES[facilities] || !PILOT_LANGUAGES[language] || !PILOT_GOALS[goal] ||
      !Array.isArray(formats) || !formats.length || formats.some((format) => !PILOT_FORMATS[format])) {
    throw new Error('Choose a facility range, language, goal, and at least one supported format option.');
  }
  const followUp = [];
  if (formats.includes('scan')) followUp.push('Scanned-invoice OCR is not implemented. Establish a supported text/manual path or separately evaluate OCR before the pilot.');
  if (goal === 'extended') followUp.push('Scope 3 accounting, product footprints, and automated regulatory filings are outside the current demo. Agree separate scope before committing.');
  if (language !== 'en') followUp.push('Evaluate Bengali field extraction and source attribution on representative documents; Bengali query tests do not establish invoice accuracy.');
  if (facilities === 'larger') followUp.push('Agree data volumes and run scale/concurrency checks before a multi-facility pilot.');
  followUp.push('Confirm hosting, retention/deletion, processing terms, identity setup, factor sources, commercial scope, and the accountable team before using real business data.');
  const lines = [
    'CarbonOS — pilot discussion brief', 'Status: proposed prototype evaluation; not a quote or service commitment.', '',
    `Facilities: ${PILOT_FACILITIES[facilities]}`, `Document formats: ${[...new Set(formats)].map((format) => PILOT_FORMATS[format]).join(', ')}`,
    `Languages: ${PILOT_LANGUAGES[language]}`, `Goal: ${PILOT_GOALS[goal]}`, '',
    'Proposed evaluation:',
    '1. Select a reporting period and consented, labeled sample documents.',
    '2. Confirm quantities, units, dates, meters, factor applicability, and source links.',
    '3. Exercise separate submission, review, calculation, lock, and repeat export.',
    '4. Measure extraction errors, abstentions, review time, and reporting traceability against an agreed baseline.', '',
    'Items to resolve:', ...followUp.map((item) => `- ${item}`), '',
    'Pricing and delivery dates are not published or committed. Agree them after scoping.',
    'This brief was generated locally in the browser. No enquiry was submitted.',
  ];
  return { followUp, needsDiscovery: formats.includes('scan') || goal === 'extended', text: lines.join('\n') };
}
