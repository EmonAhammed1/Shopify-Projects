'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';

const Loader = dynamic(() => import('@/components/ui/Loader'), { ssr: false });
const CursorGlow = dynamic(() => import('@/components/ui/CursorGlow'), { ssr: false });

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <CursorGlow />
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
