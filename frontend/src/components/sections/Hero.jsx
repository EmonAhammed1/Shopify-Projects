'use client';
import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import styles from './Hero.module.css';

const GlobeCanvas = dynamic(() => import('../three/GlobeCanvas'), { ssr: false });

export default function Hero() {
  const headingRef = useRef(null);
  const subRef = useRef(null);
  const btnsRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 2.2 });
    tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
      .fromTo(headingRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
      .fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.4')
      .fromTo(btnsRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.3');
  }, []);

  const scrollTo = (id) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} id="home">
      <div className={styles.globeWrapper}>
        <GlobeCanvas />
      </div>
      <div className={styles.scanline} style={{ zIndex: 1 }} />
      <div className={`container ${styles.content}`} style={{ pointerEvents: 'none', zIndex: 2 }}>
        <div className={styles.heroGrid}>
          {/* Left Column */}
          <div className={styles.leftCol} style={{ pointerEvents: 'auto' }}>
            <div ref={badgeRef} className={styles.badge} style={{ opacity: 0 }}>
              <span className={styles.dot} />
              Available for new projects
            </div>

            <h1 ref={headingRef} className={styles.heading} style={{ opacity: 0 }}>
              Crafting{' '}
              <span className="gradient-text">Premium</span>
              <br />
              Shopify Experiences
            </h1>

            <p ref={subRef} className={styles.sub} style={{ opacity: 0 }}>
              I build high-converting Shopify stores and e-commerce experiences
              that captivate customers and drive real results.
            </p>

            <div ref={btnsRef} className={styles.btns} style={{ opacity: 0 }}>
              <button className={styles.btnPrimary} onClick={() => scrollTo('#projects')}>
                View My Work
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className={styles.btnSecondary} onClick={() => scrollTo('#contact')}>
                Let's Talk
              </button>
            </div>

            <div className={styles.stats}>
              {[
                { value: '20+', label: 'Projects Delivered' },
                { value: '100%', label: 'Client Satisfaction' },
                { value: '3+', label: 'Years Experience' },
              ].map(({ value, label }) => (
                <div key={label} className={styles.stat}>
                  <span className={styles.statValue}>{value}</span>
                  <span className={styles.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Column Target for Flying Cards */}
          <div className={styles.rightCol} id="hero-stack-target" style={{ pointerEvents: 'none' }}>
            {/* Empty target column for layout purposes */}
          </div>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <div className={styles.scrollLine} />
        <span>Scroll</span>
      </div>
    </section>
  );
}
