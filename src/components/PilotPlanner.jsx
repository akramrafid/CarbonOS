import { useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { buildPilotBrief, PILOT_FORMATS, PILOT_FACILITIES, PILOT_LANGUAGES, PILOT_GOALS } from '../lib/pilotBrief';

const fieldClass = 'mt-2 min-h-[44px] w-full min-w-0 rounded-lg border border-mist/40 bg-carbon px-3 py-2 text-base text-registry';

export default function PilotPlanner() {
  const [values, setValues] = useState({ facilities: 'one', formats: ['text', 'pdf'], language: 'en', goal: 'inventory' });
  const [prepared, setPrepared] = useState(false);
  const [error, setError] = useState(null);
  const update = (key, value) => { setValues((old) => ({ ...old, [key]: value })); setPrepared(false); setError(null); };
  const brief = values.formats.length ? buildPilotBrief(values) : null;
  const prepare = (event) => { event.preventDefault(); if (!brief) { setError('Choose at least one document format.'); return; } setPrepared(true); };
  const download = () => {
    const url = URL.createObjectURL(new Blob([brief.text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'CarbonOS-pilot-brief.txt'; document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28" aria-labelledby="pilot-title">
    <div className="grid items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div><p className="font-mono text-xs uppercase tracking-widest text-emerald">Start with a defined pilot</p><h2 id="pilot-title" className="mt-3 font-serif text-4xl text-registry sm:text-5xl">Bring a real workflow.<br />Set a measurable goal.</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-mist">Use the public demo with synthetic data. For a business pilot, outline the documents and reporting needs first, then agree the scope and commercial terms with the team.</p><p className="mt-5 text-sm leading-relaxed text-mist">Commercial pricing, delivery dates, and service levels have not been established. This planner creates a discussion brief you can share with your own team.</p><Link to="/platform/esg" className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-semibold text-emerald">Try the demo first <ArrowRight size={17} aria-hidden="true" /></Link></div>
      <div className="min-w-0 rounded-2xl border border-mist/25 bg-forest/15 p-5 sm:p-7">
        <form onSubmit={prepare} aria-label="Plan a pilot" className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {[['facilities', 'Pilot facilities', PILOT_FACILITIES], ['language', 'Document languages', PILOT_LANGUAGES]].map(([key, label, options]) => <label key={key} className="min-w-0 text-sm font-medium text-registry">{label}<select name={key} value={values[key]} onChange={(e) => update(key, e.target.value)} className={fieldClass}>{Object.entries(options).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>)}
          </div>
          <fieldset><legend className="text-sm font-medium text-registry">Document formats</legend><div className="mt-2 grid gap-1 sm:grid-cols-2">{Object.entries(PILOT_FORMATS).map(([id, label]) => <label key={id} className="flex min-h-[44px] items-center gap-3 text-sm text-mist"><input type="checkbox" name="formats" value={id} checked={values.formats.includes(id)} onChange={(e) => update('formats', e.target.checked ? [...values.formats, id] : values.formats.filter((format) => format !== id))} className="h-4 w-4 accent-emerald" />{label}</label>)}</div></fieldset>
          <label className="block min-w-0 text-sm font-medium text-registry">Main reporting goal<select name="goal" value={values.goal} onChange={(e) => update('goal', e.target.value)} className={fieldClass}>{Object.entries(PILOT_GOALS).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label>
          <button type="submit" className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-emerald px-5 py-3 font-semibold text-carbon transition-colors hover:opacity-90">Prepare pilot brief <ArrowRight size={17} aria-hidden="true" /></button>
          <p className="text-xs leading-relaxed text-mist">This form stays in your browser. Nothing is sent to a server, and no enquiry is submitted.</p>
          {error && <p role="alert" className="text-sm text-amber">{error}</p>}
        </form>
        {prepared && brief && <div role="region" aria-label="Prepared pilot brief" aria-live="polite" className="mt-6 space-y-4 border-t border-mist/25 pt-6">
          <h3 className="text-lg font-semibold text-registry">{brief.needsDiscovery ? 'Additional scoping required' : 'Your pilot discussion brief is ready'}</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-mist">{brief.followUp.map((item) => <li key={item}>{item}</li>)}</ul>
          <button type="button" onClick={download} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-emerald px-4 py-2 font-semibold text-emerald"><Download size={16} aria-hidden="true" />Download pilot brief</button>
        </div>}
      </div>
    </div>
  </section>;
}
