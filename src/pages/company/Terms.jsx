import CompanyPage from '../../components/CompanyPage';

export default function Terms() {
  return <CompanyPage label="Prototype service status" title="Evaluate the workflow before committing to a service." intro="CarbonOS currently provides a prototype demonstration. This page describes its status; it is not a published commercial service agreement or an assurance statement.">
    <section><h2 className="font-serif text-3xl text-registry">What the demonstration provides</h2><p className="mt-3">The lead demo covers source evidence, human review, Scope 1 and 2 calculations, separate lock approval, and reproducible report exports using synthetic inputs. Additional modules explore research and illustrative scenarios; they require their own validation.</p></section>
    <section><h2 className="font-serif text-3xl text-registry">What the demonstration does not establish</h2><p className="mt-3">A demo output does not issue a carbon credit, transfer money, establish regulatory acceptance, certify an emissions inventory, or create external assurance. No production uptime, delivery date, published price, or support response time has been committed through this website.</p></section>
    <section><h2 className="font-serif text-3xl text-registry">Agree a business pilot separately</h2><p className="mt-3">Before real-data use, confirm the accountable parties, permitted data processing, hosting, retention, methodology and factor sources, acceptance criteria, scope, pricing, and support responsibilities. The local pilot brief is a discussion aid; downloading it does not submit an enquiry or book a service.</p></section>
  </CompanyPage>;
}
