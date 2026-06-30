'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/sections/Hero';
const Loader = dynamic(() => import('@/components/ui/Loader'), { ssr: false });
const CursorGlow = dynamic(() => import('@/components/ui/CursorGlow'), { ssr: false });
const Projects = dynamic(() => import('@/components/sections/Projects'));
const About = dynamic(() => import('@/components/sections/About'));
const Contact = dynamic(() => import('@/components/sections/Contact'));
const Footer = dynamic(() => import('@/components/ui/Footer'));

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <CursorGlow />
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      <Navbar />
      <main>
        <Hero />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
