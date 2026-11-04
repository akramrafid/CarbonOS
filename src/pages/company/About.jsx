import CompanyPage from '../../components/CompanyPage';

export default function About() {
  return <CompanyPage label="About CarbonOS" title="A clearer path from factory evidence to a reviewed inventory." intro="CarbonOS is a project focused on sustainability evidence and carbon reporting workflows for Bangladesh. The lead demonstration serves factory ESG and compliance teams.">
    <section><h2 className="font-serif text-3xl text-registry">Start with a workflow people can inspect</h2><p className="mt-3">The working ESG prototype connects source documents, separate human review, Scope 1 and 2 calculations, and reproducible reports. AI helps extract values and explain sources; people retain approval responsibility.</p></section>
    <section><h2 className="font-serif text-3xl text-registry">A focused prototype, with room to validate</h2><p className="mt-3">The public demo uses synthetic data. Real-document evaluation, independent accounting and security review, production operations, and commercial pilot terms still need work. Agriculture, monitoring, and registry concepts are additional prototypes with separate evidence requirements.</p></section>
    <section><h2 className="font-serif text-3xl text-registry">Make a pilot measurable</h2><p className="mt-3">Use a defined reporting period and representative, consented source documents. Measure extraction errors, abstention, review effort, and reporting traceability against an agreed baseline. No customer outcomes or time-saving figures are asserted here.</p></section>
  </CompanyPage>;
}
