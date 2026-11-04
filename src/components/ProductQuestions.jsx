const questions = [
  ['Can I try it without uploading company data?', 'Yes. The isolated demo provides synthetic factory activity, factors, and separate reviewer identities. Download the sample bill and policy to rehearse the workflow.'],
  ['Does AI decide the final inventory?', 'The assistant proposes values and explains sources. People review activity records and approve factors; the deterministic accounting engine calculates the inventory. A different approver locks the report.'],
  ['Can I upload scans or photos of bills?', 'Scanned-invoice OCR is not implemented. Use readable text-based PDFs, TXT, CSV/XLSX, or supported DOCX text, and check extracted values against the original. Real-document accuracy still needs evaluation.'],
  ['Does CarbonOS cover Scope 3 or submit regulatory filings?', 'The current ledger demonstrates Scope 1 and 2. Scope 3 accounting, product footprints, and automated regulatory submissions are outside this demo. Discuss those requirements before agreeing a pilot.'],
  ['Is the platform certified, audited, or a national registry?', 'This website establishes none of those claims. Internal approval, source citations, and report hashes support traceability. Independent assurance, regulatory acceptance, and production security assessment remain separate work.'],
  ['What does a pilot cost?', 'Commercial prices and service levels have not been established. The pilot planner creates a local discussion brief; it does not submit an enquiry, book a service, or commit the team to a price.'],
];

export default function ProductQuestions() {
  return <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-10" aria-labelledby="questions-title"><div><p className="font-mono text-xs uppercase tracking-widest text-mist">Before you start</p><h2 id="questions-title" className="mt-3 font-serif text-4xl text-registry">Practical questions.<br />Straight answers.</h2></div><div className="divide-y divide-mist/25">{questions.map(([title, answer]) => <details key={title} className="py-4"><summary className="min-h-[44px] cursor-pointer py-2 text-base font-semibold text-registry">{title}</summary><p className="max-w-2xl pb-3 pt-2 text-sm leading-relaxed text-mist">{answer}</p></details>)}</div></section>;
}
