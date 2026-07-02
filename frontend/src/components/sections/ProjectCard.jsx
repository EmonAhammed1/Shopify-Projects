'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ProjectCard.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function ProjectCard({ project, index, isFlying, filterKey, scatterMode = false, totalCount = 3 }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();

  // Scroll-triggered entrance & Flying cards animations
  useEffect(() => {
    if (!cardRef.current) return;
    
    // Always clear previous props to avoid styling leftovers from recycled DOM elements
    gsap.set(cardRef.current, { clearProps: "all" });

    // ── CASE 1: Normal scroll-in animation ───────────────────────────────
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

    // ── CASE 2: Scatter mode — pages without globe (All Projects, Category) ─
    if (scatterMode) {
      const card = cardRef.current;

      // Wait briefly for DOM to settle, then set up animation
      const timer = setTimeout(() => {
        if (!cardRef.current) return;

        // Force scroll to 0 immediately to ensure bounding rects are calculated at top-of-page
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
        ScrollTrigger.clearScrollMemory();

        // Find hero section — used as scroll trigger
        const heroEl = document.getElementById('scatter-hero');


        // If hero not found, just do normal entrance animation
        if (!heroEl) {
          gsap.set(card, { opacity: 1, x: 0, y: 0 });
          return;
        }

        // If user already scrolled past the hero, show at final position
        const heroRect = heroEl.getBoundingClientRect();
        const isPastHero = heroRect.bottom < 0;
        if (isPastHero) {
          gsap.set(card, { opacity: 1, x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, scale: 1, zIndex: 1 });
          return;
        }

        const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const h = typeof window !== 'undefined' ? window.innerHeight : 800;

        // Skip scatter layout on mobile/tablets for optimal readability and layout responsiveness
        if (w < 992) {
          gsap.set(card, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, rotationX: 0, rotationY: 0, zIndex: 1 });
          return;
        }

        // Layout targets depending on how many projects are active in this view
        let targets;
        if (totalCount === 1) {
          // Center of the right side hero space (shifted further right)
          targets = [
            { cx: w * 0.76, cy: h * 0.46, scale: 0.65, opacity: 0.95 }
          ];
        } else if (totalCount === 2) {
          // Two cards side-by-side (pasha-pashi, shifted further right)
          targets = [
            { cx: w * 0.66, cy: h * 0.46, scale: 0.60, opacity: 0.92 },
            { cx: w * 0.85, cy: h * 0.46, scale: 0.60, opacity: 0.92 }
          ];
        } else {
          // Three or more cards in a clean diagonal staircase cascade (shifted further right)
          targets = [
            { cx: w * 0.65, cy: h * 0.34, scale: 0.62, opacity: 0.92 },
            { cx: w * 0.76, cy: h * 0.48, scale: 0.62, opacity: 0.92 },
            { cx: w * 0.87, cy: h * 0.62, scale: 0.62, opacity: 0.92 }
          ];
        }


        const cfg = targets[index % targets.length];

        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        // Account for any active scroll offset when calculating natural top position
        const scrollXVal = typeof window !== 'undefined' ? window.scrollX : 0;
        const scrollYVal = typeof window !== 'undefined' ? window.scrollY : 0;
        
        const deltaX = cfg.cx - cardCenterX - scrollXVal;
        const deltaY = cfg.cy - cardCenterY - scrollYVal;

        // Use fromTo directly so ScrollTrigger knows exact starting coordinates
        // Using multiples of 360 degrees makes the cards look perfectly straight at start (0 scroll),
        // but they will flip and spin 3D as they animate to 0 degrees on scroll.
        gsap.fromTo(card,
          {
            x: deltaX,
            y: deltaY,
            rotation: 0,
            rotationX: -360,
            rotationY: 0,
            scale: cfg.scale,
            transformPerspective: 1200,
            opacity: cfg.opacity,
            zIndex: 30 - index,
          },
          {
            x: 0,
            y: 0,
            rotation: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            opacity: 1,
            zIndex: 1,
            transformPerspective: 1200,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              id: `scatter-${index}`,
              trigger: heroEl,
              start: 'top top',
              end: '+=450',        // increased distance for smoother and more premium feel
              scrub: 1.5,          // increased lag for softer transition
            },
          }
        );

        ScrollTrigger.refresh();
      }, 150); // increased delay ensures Next.js scroll restoration is complete

      return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll()
          .filter(st => st.vars?.id === `scatter-${index}`)
          .forEach(st => st.kill());
        gsap.set(cardRef.current, { clearProps: 'all' });
      };
    }
    
    // Prevent CASE 3 (Globe animation) from running if we are in scatterMode
    if (scatterMode) return;

    // ── CASE 3: Globe flying animation (home page) — unchanged ───────────
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
  }, [index, isFlying, filterKey, scatterMode]);


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
