'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import styles from './ProjectCard.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectCard({ project, index, isFlying }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Scroll-triggered entrance
  useEffect(() => {
    if (isFlying) return; // Skip default animation if this card is part of the flying hero stack

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
        delay: (index % 3) * 0.1,
        scrollTrigger: { trigger: cardRef.current, start: 'top 88%' },
      }
    );
  }, [index, isFlying]);

  // Mouse move handler for glow effect (tilt disabled)
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(108, 99, 255, 0.12), transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    if (glowRef.current) glowRef.current.style.background = 'none';
  };

  const { title, shortDesc, thumbnail, techStack = [], category, slug, liveUrl, storefrontPassword, featured } = project;
  const finalLiveUrl = storefrontPassword ? `/api/projects/${slug}/preview` : liveUrl;

  const isRealUrl = liveUrl && /^https?:\/\//i.test(liveUrl) && !liveUrl.includes('localhost') && !liveUrl.includes('127.0.0.1');

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${featured ? styles.featured : ''} ${isFlying ? 'flying-card' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ opacity: isFlying ? 1 : 0 }}
    >
      <div ref={glowRef} className={styles.glow} />

      {/* Thumbnail */}
      <div className={styles.thumb}>
        {isRealUrl ? (
          <div className={styles.iframeWrapper}>
            {!iframeLoaded && (
              <img
                src={thumbnail || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80'}
                alt={title}
                className={styles.placeholderImg}
                loading="lazy"
                decoding="async"
              />
            )}
            <iframe
              src={`/api/projects/${slug}/proxy?path=%2F`}
              className={`${styles.cardIframe} ${iframeLoaded ? styles.iframeLoaded : ''}`}
              title={title}
              scrolling="no"
              loading="lazy"
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        ) : thumbnail ? (
          <img src={thumbnail} alt={title} loading="lazy" decoding="async" />
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
        {featured && <span className={styles.featuredBadge}>Featured</span>}
        <div className={styles.overlay}>
          <Link href={`/projects/${slug}`} className={styles.overlayBtn}>
            View Project →
          </Link>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        <span className={styles.category}>{category}</span>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>{shortDesc}</p>

        <div className={styles.tags}>
          {techStack.slice(0, 4).map((t) => (
            <span key={t} className="tech-tag">{t}</span>
          ))}
          {techStack.length > 4 && (
            <span className="tech-tag">+{techStack.length - 4}</span>
          )}
        </div>

        <div className={styles.actions}>
          <Link href={`/projects/${slug}`} className={styles.detailBtn}>
            View Details
          </Link>
          {liveUrl && (
            <a href={finalLiveUrl} target="_blank" rel="noreferrer" className={styles.liveBtn}>
              View Live Site
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
