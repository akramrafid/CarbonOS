import { Link } from 'react-router-dom';

export default function CompanyPage({ label = 'CarbonOS', title, intro, children }) {
  return <main className="mx-auto max-w-5xl px-4 pb-20 pt-32 sm:px-6 sm:pt-36">
    <header className="max-w-3xl border-b border-mist/25 pb-9"><p className="font-mono text-xs uppercase tracking-widest text-emerald">{label}</p><h1 className="mt-4 font-serif text-4xl leading-tight text-registry [text-wrap:balance] sm:text-6xl">{title}</h1><p className="mt-5 text-base leading-relaxed text-mist sm:text-lg">{intro}</p></header>
    <div className="space-y-10 py-10 text-base leading-relaxed text-mist">{children}</div>
    <div className="flex flex-wrap gap-4 border-t border-mist/25 pt-7"><Link to="/platform/esg" className="inline-flex min-h-[44px] items-center rounded-lg bg-emerald px-5 font-semibold text-carbon">Try the ESG demo</Link><Link to="/#pricing" className="inline-flex min-h-[44px] items-center rounded-lg border border-mist/40 px-5 text-registry">Plan a pilot</Link></div>
  </main>;
}
