'use client';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import styles from './ProjectCard.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectCard({ project, index, isFlying }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

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

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -8;
    const rotY = ((x - cx) / cx) * 8;

    gsap.to(card, {
      rotateX: rotX, rotateY: rotY,
      transformPerspective: 800,
      duration: 0.4, ease: 'power2.out',
    });

    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(108, 99, 255, 0.12), transparent 70%)`;
    }
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    if (glowRef.current) glowRef.current.style.background = 'none';
  };

  const { title, shortDesc, thumbnail, techStack = [], category, slug, liveUrl, storefrontPassword, featured } = project;
  const finalLiveUrl = storefrontPassword ? `/api/projects/${slug}/preview` : liveUrl;

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
        {thumbnail ? (
          <img src={thumbnail} alt={title} loading="lazy" />
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
            Case Study
          </Link>
          {liveUrl && (
            <a href={finalLiveUrl} target="_blank" rel="noreferrer" className={styles.liveBtn}>
              Live ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
