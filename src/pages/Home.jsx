import React from 'react';
import Hero from '../components/Hero';
import TrustBar from '../components/TrustBar';
import LiveMetrics from '../components/LiveMetrics';
import PlatformModules from '../components/PlatformModules';
import Roadmap from '../components/Roadmap';
import SectorFocus from '../components/SectorFocus';
import Philosophy from '../components/Philosophy';
import FrameworkAlignment from '../components/FrameworkAlignment';
import Pricing from '../components/Pricing';

function Home() {
  return (
    <>
      <section id="hero"><Hero /></section>
      <TrustBar />
      <LiveMetrics />
      <section id="platform"><PlatformModules /></section>
      <section id="roadmap"><Roadmap /></section>
      <section id="sectors"><SectorFocus /></section>
      <section id="philosophy"><Philosophy /></section>
      <section id="framework"><FrameworkAlignment /></section>
      <section id="pricing"><Pricing /></section>
    </>
  );
}

export default Home;
