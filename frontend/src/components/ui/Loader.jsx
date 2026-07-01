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
    let isLoaded = false;
    let barAnim = null;

    const exitLoader = () => {
      const exitTl = gsap.timeline({
        onComplete: () => {
          if (loaderRef.current) {
            gsap.to(loaderRef.current, {
              yPercent: -100,
              duration: 0.8,
              ease: 'power3.inOut',
              onComplete,
            });
          } else {
            onComplete();
          }
        }
      });

      const targets = [titleRef.current, taglineRef.current, barRef.current, hintRef.current].filter(Boolean);
      if (targets.length > 0) {
        exitTl.to(targets, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          ease: 'power2.in',
          stagger: 0.05
        });
      } else {
        // If targets are already null/unmounted, trigger slide up immediately
        if (loaderRef.current) {
          gsap.to(loaderRef.current, {
            yPercent: -100,
            duration: 0.8,
            ease: 'power3.inOut',
            onComplete,
          });
        } else {
          onComplete();
        }
      }
    };

    const handleLoad = () => {
      isLoaded = true;
      if (barAnim && barRef.current) {
        gsap.to(barRef.current, {
          width: '100%',
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
          onComplete: exitLoader
        });
      }
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Start text entrance animations
    const tl = gsap.timeline();

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

    // Animate bar to 90% first, then wait for page load resolution
    barAnim = gsap.to(barRef.current, {
      width: '90%',
      duration: 1.8,
      ease: 'power1.out',
      onComplete: () => {
        if (isLoaded) {
          gsap.to(barRef.current, {
            width: '100%',
            duration: 0.4,
            ease: 'power2.out',
            onComplete: exitLoader
          });
        }
      }
    });

    return () => {
      window.removeEventListener('load', handleLoad);
    };
  }, [onComplete]);

  return (
    <div ref={loaderRef} id="site-intro-loader" className={styles.loader}>
      <div className={styles.content}>
        <div className={styles.introText}>
          <h1 ref={titleRef} className={styles.mainTitle} style={{ opacity: 0 }}>
            MAKE YOUR VISION <span>COME TRUE</span>
          </h1>
          <p ref={taglineRef} className={styles.tagline} style={{ opacity: 0 }}>
            Designing High-Converting E-commerce Experiences
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
