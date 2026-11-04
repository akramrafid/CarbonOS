import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Users, Calculator, FileCheck } from 'lucide-react';

const steps = [
  { title: 'Start with the source', icon: FileText, description: 'Upload a supported text document. Inspect the proposed quantity and the passage it came from before using it.', label: 'Source evidence', value: '125,000 kWh', note: 'Electricity consumption in the downloadable synthetic bill.', detail: 'Extraction proposes a value. A person confirms the activity.', status: 'Review required' },
  { title: 'Give review its own seat', icon: Users, description: 'Move the activity to a different reviewer. The API rejects approval by the person who submitted the record.', label: 'Separate responsibilities', value: 'Submit → Review', note: 'Switch labeled demo identities to try the actual permission checks.', detail: 'A submitted fuel record needs another person’s approval.', status: 'Human decision' },
  { title: 'Calculate from approved inputs', icon: Calculator, description: 'Apply versioned, approved factors to reviewed activity data. Inspect the formula and missing-input exceptions.', label: 'Illustrative Scope 2 calculation', value: '80 tCO₂e', note: '125,000 kWh × 0.64 kgCO₂e/kWh ÷ 1,000. The factor is a custom synthetic fixture.', detail: 'Scope 1 totals 12.06 tCO₂e in this sample. Missing market-based evidence stays unreported.', status: 'Reproducible arithmetic' },
  { title: 'Lock a report you can retrace', icon: FileCheck, description: 'A separate approver locks the period. Export a CSV or JSON snapshot with its calculation lines and source references.', label: 'Report output', value: 'CSV + JSON', note: 'Re-export the locked snapshot to reproduce its content.', detail: 'Internal approval and an immutable export do not establish external assurance.', status: 'Separate approval' },
];

export default function FactoryWorkflow() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  return <section id="platform" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28" aria-labelledby="workflow-title">
    <div className="mb-10 max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-widest text-emerald">The factory reporting workflow</p>
      <h2 id="workflow-title" className="mt-3 font-serif text-4xl leading-tight text-registry [text-wrap:balance] sm:text-5xl">From the first bill<br />to a reviewed inventory.</h2>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-mist">For ESG teams bringing utility bills, fuel records, and reviewers into one Scope 1 and 2 inventory. Explore the steps, then try them in the working workspace.</p>
    </div>
    <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.2fr] lg:gap-16">
      <div className="space-y-2" role="group" aria-label="Workflow preview steps">
        {steps.map((item, i) => <button key={item.title} type="button" onClick={() => setActive(i)} aria-pressed={active === i} aria-controls="workflow-preview"
          className={`flex min-h-[76px] w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors sm:p-5 ${active === i ? 'border-emerald bg-forest/30' : 'border-transparent hover:bg-forest/20'}`}>
          <span className="mt-1 font-mono text-xs text-emerald">0{i + 1}</span>
          <span className="min-w-0"><span className="block text-lg font-semibold text-registry">{item.title}</span><span className="mt-2 block text-sm leading-relaxed text-mist">{item.description}</span></span>
        </button>)}
      </div>
      <div id="workflow-preview" role="region" aria-label="Workflow preview" aria-live="polite" className="min-w-0 rounded-2xl border border-emerald/25 bg-forest/20 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist/20 pb-5">
          <span className="flex items-center gap-2 font-mono text-xs text-mist"><step.icon size={17} aria-hidden="true" />Walkthrough preview</span>
          <span className="rounded border border-amber/40 px-2 py-1 font-mono text-[10px] text-amber">Synthetic example</span>
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-wider text-mist">{step.label}</p>
        <p className="mt-3 break-words font-mono text-3xl font-semibold tracking-tight text-registry sm:text-4xl">{step.value}</p>
        <p className="mt-5 text-sm leading-relaxed text-mist">{step.note}</p>
        <div className="mt-8 border-l-2 border-emerald pl-4"><p className="text-sm font-semibold text-registry">{step.status}</p><p className="mt-2 text-sm leading-relaxed text-mist">{step.detail}</p></div>
        <p className="mt-8 text-xs leading-relaxed text-mist">This preview explains the sample workflow. Upload, approval, calculation, and export run through the real API inside the demo.</p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <a href="/samples/factory-electricity-demo.txt" download className="inline-flex min-h-[44px] items-center text-emerald underline underline-offset-4">Download sample bill</a>
          <Link to="/platform/esg" className="inline-flex min-h-[44px] items-center gap-2 font-semibold text-registry">Open the working demo <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </div>
  </section>;
}
