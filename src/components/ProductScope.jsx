import { Link } from 'react-router-dom';
import { ArrowUpRight, FileSearch, ShieldCheck, ScanText } from 'lucide-react';

const capabilities = [
  ['Scope 1 and 2 inventories', 'Working prototype', 'Approved activity data, versioned factors, and separate location/market-based reporting.'],
  ['Document-backed questions', 'Working prototype', 'English/Bengali retrieval with source passages, provenance, and labeled model fallback.'],
  ['Review and report exports', 'Working prototype', 'Separate submitter/reviewer/approver identities; reproducible locked CSV/JSON reports.'],
  ['Scanned-invoice OCR', 'Not implemented', 'Use supported text documents or manual entry; real-document accuracy is not established.'],
  ['Scope 3 and regulatory filings', 'Outside this demo', 'Supplier accounting, product footprints, and automated compliance submissions need further work.'],
];

export default function ProductScope() {
  return <>
    <section className="border-y border-mist/15 bg-forest/10" aria-labelledby="evidence-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-emerald">AI with visible evidence</p>
          <h2 id="evidence-title" className="mt-3 font-serif text-4xl text-registry sm:text-5xl">Ask a question.<br />Inspect the source.</h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-mist">Find the passage behind an answer. The assistant shows which source it used, identifies model-generated answers, and returns insufficient evidence when it cannot support a response.</p>
          <Link to="/platform/esg?view=evidence" className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-semibold text-emerald">Try the evidence assistant <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className="space-y-6">
          {[
            [FileSearch, 'A citation you can inspect', 'See the document, page, passage, and content fingerprint. A citation supports review; it is not a verification stamp.'],
            [ShieldCheck, 'People retain approval', 'AI proposes and explains. Separate people review activity data and approve the inventory lock.'],
            [ScanText, 'The method stays visible', 'Distinguish rules, model answers, and retrieved excerpts. Model confidence is never presented as measured accuracy.'],
          ].map(([Icon, title, description]) => <div key={title} className="flex gap-4 border-b border-mist/15 pb-6 last:border-0 last:pb-0"><Icon size={22} className="mt-1 shrink-0 text-emerald" aria-hidden="true" /><div><h3 className="text-lg font-semibold text-registry">{title}</h3><p className="mt-2 text-sm leading-relaxed text-mist">{description}</p></div></div>)}
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10" aria-labelledby="scope-title">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-xs uppercase tracking-widest text-emerald">A clear product boundary</p><h2 id="scope-title" className="mt-3 font-serif text-4xl text-registry sm:text-5xl">Know what you’re evaluating.</h2></div><Link to="/company/trust" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-emerald">Read the trust & data notes <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      <div role="region" aria-label="Current product scope table" tabIndex={0} className="overflow-x-auto rounded-xl border border-mist/25">
        <table className="w-full min-w-[650px] text-left text-sm"><caption className="sr-only">Current product scope</caption><thead className="bg-forest/20 font-mono text-xs text-mist"><tr><th scope="col" className="p-4">Capability</th><th scope="col" className="p-4">Current state</th><th scope="col" className="p-4">What to expect</th></tr></thead><tbody>{capabilities.map(([name, state, detail]) => <tr key={name} className="border-t border-mist/15"><th scope="row" className="p-4 font-semibold text-registry">{name}</th><td className="whitespace-nowrap p-4 text-emerald">{state}</td><td className="max-w-xl p-4 leading-relaxed text-mist">{detail}</td></tr>)}</tbody></table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mist">CarbonOS is a prototype. Demo values are synthetic. No customer outcomes, independent assurance, certification, or commercial service level is established by this website.</p>
    </section>
    <section id="sectors" className="border-y border-mist/15 bg-forest/10" aria-labelledby="prototype-title">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="font-mono text-xs uppercase tracking-widest text-mist">Beyond the lead demo</p><h2 id="prototype-title" className="mt-3 font-serif text-3xl text-registry">Explore additional prototypes.</h2><p className="mt-4 text-sm leading-relaxed text-mist">Agriculture and monitoring explore separate workflows. Their model accuracy, field performance, and external integrations require their own validation.</p></div><div className="divide-y divide-mist/20">{[['Crop diagnosis', '/farmers-ai', 'Image-based crop research workflow'], ['Carbon monitoring', '/carbon-monitoring', 'Geospatial monitoring research workflow'], ['Legacy platform concepts', '/platform/saas-dashboard', 'Illustrative dashboards and scenario modules']].map(([name, url, description]) => <Link key={name} to={url} className="flex min-h-[88px] items-center justify-between gap-4 py-4"><span><span className="text-lg font-semibold text-registry">{name}</span><span className="mt-1 block text-sm text-mist">{description}</span></span><ArrowUpRight size={19} className="shrink-0 text-emerald" aria-hidden="true" /></Link>)}</div></div></div>
    </section>
  </>;
}
