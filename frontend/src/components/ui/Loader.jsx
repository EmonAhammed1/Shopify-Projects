'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import styles from './Loader.module.css';

export default function Loader({ onComplete }) {
  const loaderRef = useRef(null);
  const barRef = useRef(null);
  const textRef = useRef(null);

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

    tl.to(barRef.current, {
      width: '100%',
      duration: 1.6,
      ease: 'power2.inOut',
    }).to(
      textRef.current,
      {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: 'power2.in',
      },
      '-=0.3'
    );
  }, [onComplete]);

  return (
    <div ref={loaderRef} id="site-intro-loader" className={styles.loader}>
      <div className={styles.content}>
        <p ref={textRef} className={styles.logo}>
          &lt;Portfolio /&gt;
        </p>
        <div className={styles.bar}>
          <div ref={barRef} className={styles.fill} style={{ width: '0%' }} />
        </div>
        <p className={styles.hint}>Loading experience...</p>
      </div>
    </div>
  );
}
