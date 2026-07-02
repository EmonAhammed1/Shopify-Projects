'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ProjectCard.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectCard({ project, index, isFlying, filterKey }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  // Scroll-triggered entrance & Flying cards animations
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Always clear previous props to avoid styling leftovers from recycled DOM elements
    gsap.set(cardRef.current, { clearProps: "all" });

    if (!isFlying) {
      let ctx = gsap.context(() => {
        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const alreadyVisible = rect.top < window.innerHeight * 0.95;

        if (alreadyVisible) {
          // Already in viewport — just set visible immediately, no scroll-trigger
          gsap.set(card, { opacity: 1, y: 0 });
        } else {
          gsap.from(
            card,
            {
              opacity: 0,
              y: 60,
              duration: 0.7,
              ease: 'power3.out',
              delay: (index % 3) * 0.1,
              scrollTrigger: { trigger: card, start: 'top 88%' },
            }
          );
        }
      });
      ScrollTrigger.refresh();
      return () => ctx.revert();
    }

    // Flying card animation (re-syncs to globe coordinates)
    let ctx;
    let checkInterval = setInterval(() => {
      const anchor = document.getElementById(`globe-anchor-${index}`);
      const loaderExists = document.getElementById('site-intro-loader') !== null;
      const isPastHero = typeof window !== 'undefined' && window.scrollY > window.innerHeight * 0.5;
      
      let anchorStable = false;
      if (isPastHero) {
        anchorStable = true;
      } else if (anchor) {
        const rect = anchor.getBoundingClientRect();
        anchorStable = rect.width > 10 && rect.left > 10 && rect.top > 10;
      }

      if (anchorStable && !loaderExists && cardRef.current) {
        clearInterval(checkInterval);
        
        ctx = gsap.context(() => {
          const card = cardRef.current;
          
          // Clear any previous animations to get natural layout rect
          gsap.set(card, { clearProps: "all" });
          const cardRect = card.getBoundingClientRect();
          
          let deltaX = 0;
          let deltaY = 0;
          let initialScale = 1;

          if (anchor) {
            const anchorRect = anchor.getBoundingClientRect();
            const anchorCenterX = anchorRect.left + anchorRect.width / 2;
            const anchorCenterY = anchorRect.top + anchorRect.height / 2;
            
            const cardCenterX = cardRect.left + cardRect.width / 2;
            const cardCenterY = cardRect.top + cardRect.height / 2;
            
            deltaX = anchorCenterX - cardCenterX;
            deltaY = anchorCenterY - cardCenterY;
            initialScale = anchorRect.width / cardRect.width;

            // Fade out the anchor on the globe as we scroll
            gsap.to(anchor, {
              opacity: 0,
              scrollTrigger: {
                trigger: '#home',
                start: 'top top',
                end: '20% top',
                scrub: 1,
              }
            });
          } else {
             // Fallback if globe hasn't rendered anchors yet
             deltaX = -window.innerWidth / 2;
             deltaY = -window.innerHeight / 2;
             initialScale = 0.2;
          }

          gsap.fromTo(card,
            {
              x: deltaX,
              y: deltaY,
              rotation: -90,
              rotationX: -270,
              rotationY: 270,
              scale: 0.02,
              zIndex: 10 - index,
              boxShadow: 'none',
              opacity: 0,
              transformPerspective: 1000
            },
            {
              x: 0,
              y: 0,
              rotation: 0,
              rotationX: 0,
              rotationY: 0,
              scale: 1,
              zIndex: 1,
              boxShadow: 'none',
              opacity: 1,
              immediateRender: false,
              scrollTrigger: {
                trigger: '#home',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
              }
            }
          );
        });

        // Trigger a ScrollTrigger refresh after the context setup
        ScrollTrigger.refresh();
      }
    }, 50);

    return () => {
      clearInterval(checkInterval);
      if (ctx) ctx.revert();
    };
  }, [index, isFlying, filterKey]);

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

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    router.push(`/projects/${slug}`);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${featured ? styles.featured : ''} ${isFlying ? 'flying-card' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div ref={glowRef} className={styles.glow} />

      {/* Thumbnail */}
      <div className={styles.thumb}>
        {thumbnail ? (
          <>
            {!imageLoaded && (
              <div className={styles.skeletonLoader} />
            )}
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
            />
          </>
        ) : (
          <div className={styles.thumbPlaceholder} />
        )}
        {featured && <span className={styles.featuredBadge}>Featured</span>}
        <div className={styles.overlay}>
          {liveUrl ? (
            <a href={finalLiveUrl} target="_blank" rel="noreferrer" className={styles.overlayBtn}>
              View Live Store →
            </a>
          ) : (
            <Link href={`/projects/${slug}`} className={styles.overlayBtn}>
              View Project →
            </Link>
          )}
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
