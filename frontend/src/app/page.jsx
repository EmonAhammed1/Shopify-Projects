'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/ui/Navbar';
import Hero from '@/components/sections/Hero';
const Loader = dynamic(() => import('@/components/ui/Loader'), { ssr: false });
const CursorGlow = dynamic(() => import('@/components/ui/CursorGlow'), { ssr: false });
const Projects = dynamic(() => import('@/components/sections/Projects'));
const About = dynamic(() => import('@/components/sections/About'));
const Footer = dynamic(() => import('@/components/ui/Footer'));

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('siteLoaded') === 'true') {
      setLoaded(true);
    }
  }, []);

  return (
    <>
      <CursorGlow />
      {!loaded && <Loader onComplete={() => {
        setLoaded(true);
        if (typeof window !== 'undefined') sessionStorage.setItem('siteLoaded', 'true');
      }} />}
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)', visibility: loaded ? 'visible' : 'hidden' }}>
        <Navbar />
        <main>
          <Hero />
          <Projects />
          <About />
        </main>
        <Footer />
      </div>
    </>
  );
}
