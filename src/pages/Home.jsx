import Hero from '../components/Hero';
import FactoryWorkflow from '../components/FactoryWorkflow';
import ProductScope from '../components/ProductScope';
import PilotPlanner from '../components/PilotPlanner';
import ProductQuestions from '../components/ProductQuestions';

export default function Home() {
  return <main>
    <section id="hero"><Hero /></section>
    <FactoryWorkflow />
    <ProductScope />
    <PilotPlanner />
    <ProductQuestions />
  </main>;
}
