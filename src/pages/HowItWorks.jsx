import FactoryWorkflow from '../components/FactoryWorkflow';

export default function HowItWorks() {
  return <main className="pt-32 sm:pt-36"><header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10"><p className="font-mono text-xs uppercase tracking-widest text-emerald">CarbonOS product walkthrough</p><h1 className="mt-3 max-w-3xl font-serif text-4xl text-registry sm:text-6xl">From a source document to a reviewed inventory.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-mist">Explore the synthetic factory example. The working demo uses real API controls for review, calculation, lock approval, and export.</p></header><FactoryWorkflow /></main>;
}
