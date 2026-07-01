'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Loader.module.css';

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const barRef = useRef(null);
  const taglineRef = useRef(null);
  const titleRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loaderRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete,
        });
      },
    });

    // Animate loading bar fill
    tl.to(barRef.current, {
      width: '100%',
      duration: 2.2,
      ease: 'power2.inOut',
    }, 0);

    // Stagger reveal text components
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' },
      0.2
    );

    tl.fromTo(taglineRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      0.5
    );

    tl.fromTo(hintRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.4 },
      0.9
    );

    // Fade out elements right before slide-up
    tl.to([titleRef.current, taglineRef.current, barRef.current, hintRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
      stagger: 0.05
    }, '-=0.4');
  }, [onComplete]);

  return (
    <div ref={loaderRef} id="site-intro-loader" className={styles.loader}>
      <div className={styles.content}>
        <div className={styles.introText}>
          <h1 ref={titleRef} className={styles.mainTitle} style={{ opacity: 0 }}>
            CRAFTING PREMIUM <span>SHOPIFY</span> STORES
          </h1>
          <p ref={taglineRef} className={styles.tagline} style={{ opacity: 0 }}>
            Turning Your Vision Into Digital Success
          </p>
        </div>
        
        <div className={styles.bar}>
          <div ref={barRef} className={styles.fill} style={{ width: '0%' }} />
        </div>
        <p ref={hintRef} className={styles.hint} style={{ opacity: 0 }}>Loading experience...</p>
      </div>
    </div>
  );
}
