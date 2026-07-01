'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from './ProjectCard';
import { getProjects } from '@/lib/api';
import styles from './Projects.module.css';

gsap.registerPlugin(ScrollTrigger);

// Demo fallback data (used if API is not connected yet)
const DEMO_PROJECTS = [
  {
    _id: '1', title: 'LuxeWear Shopify Store', slug: 'luxewear-shopify-store',
    shortDesc: 'A premium fashion Shopify store with custom sections and conversion-optimized UX.',
    category: 'Fashion & Apparel Store', featured: true, order: 1,
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS', 'Klaviyo'], liveUrl: '#',
  },
  {
    _id: '2', title: 'GreenCart Organic Shop', slug: 'greencart-organic-shop',
    shortDesc: 'Eco-friendly product store with subscription boxes and loyalty program.',
    category: 'General Multi-Category eCommerce Store', featured: true, order: 2,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'Recharge', 'Smile.io', 'SCSS'], liveUrl: '#',
  },
  {
    _id: '3', title: 'TechDrop Electronics', slug: 'techdrop-electronics',
    shortDesc: 'High-performance electronics Shopify store with advanced filtering.',
    category: 'Electronics & Gadgets Store', featured: true, order: 3,
    thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    techStack: ['Shopify Plus', 'Liquid', 'React', 'Algolia'], liveUrl: '#',
  },
  {
    _id: '4', title: 'SkinGlow Beauty Brand', slug: 'skinglow-beauty',
    shortDesc: 'Beauty & skincare DTC brand with quiz-based product recommendations.',
    category: 'Beauty & Personal Care Store', featured: false, order: 4,
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'Klaviyo', 'Refersion'], liveUrl: '#',
  },
  {
    _id: '5', title: 'SportZone Athletic Gear', slug: 'sportzone-athletic',
    shortDesc: 'Multi-sport athletic gear store with custom bundle builder.',
    category: 'Sports & Outdoor Store', featured: false, order: 5,
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS'], liveUrl: '#',
  },
  {
    _id: '6', title: 'CraftHaven Marketplace', slug: 'crafthaven-handmade',
    shortDesc: 'Multi-vendor handmade marketplace built on Shopify with headless storefront.',
    category: 'Marketplace / Multi-Vendor Store', featured: false, order: 6,
    thumbnail: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
    techStack: ['Shopify Hydrogen', 'React', 'GraphQL', 'Node.js'], liveUrl: '#', githubUrl: '#',
  },
  {
    _id: '7', title: 'VibeAudio Headsets', slug: 'vibeaudio-headsets',
    shortDesc: 'Immersive audio equipment store with 3D product visualizer.',
    category: 'Electronics & Gadgets Store', featured: false, order: 7,
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    techStack: ['Shopify', 'Three.js', 'Liquid'], liveUrl: '#',
  },
  {
    _id: '8', title: 'Nova Furniture', slug: 'nova-furniture',
    shortDesc: 'Modern e-commerce store with AR placement capabilities.',
    category: 'Home & Living Store', featured: false, order: 8,
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    techStack: ['Next.js', 'Shopify Storefront API', 'Tailwind'], liveUrl: '#',
  },
  {
    _id: '9', title: 'Aura Perfumes', slug: 'aura-perfumes',
    shortDesc: 'Luxury fragrance store with custom scent profiling quiz.',
    category: 'Beauty & Personal Care Store', featured: false, order: 9,
    thumbnail: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'JavaScript'], liveUrl: '#',
  },
  {
    _id: '10', title: 'Peak Activewear', slug: 'peak-activewear',
    shortDesc: 'Performance apparel store with dynamic inventory tracking.',
    category: 'Fashion & Apparel Store', featured: false, order: 10,
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    techStack: ['Shopify Plus', 'React', 'Tailwind'], liveUrl: '#',
  },
];

export default function Projects() {
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const headerRef = useRef(null);
  const filtersRef = useRef(null);

  // Dynamically extract unique categories from projects that are present
  const categoriesList = ['All', ...new Set(projects.map((p) => p.category))].filter(Boolean);

  useEffect(() => {
    const fetchProjects = async () => {
      const cached = sessionStorage.getItem('projectsData');
      if (cached) {
        setProjects(JSON.parse(cached));
        setLoading(false);
      }

      try {
        const { data } = await getProjects();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          sessionStorage.setItem('projectsData', JSON.stringify(data.projects));
        }
      } catch (err) {
        console.log('Using demo projects (API not connected)');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []); // Run only once on mount

  // GSAP Entrance Animations for Header and Filters (runs once when loading finishes)
  useEffect(() => {
    if (loading) return;

    let ctx = gsap.context(() => {
      // Header entrance animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
        }
      );

      // Filters entrance animation
      if (filtersRef.current) {
        gsap.fromTo(
          filtersRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            delay: 0.1,
            scrollTrigger: { trigger: filtersRef.current, start: 'top 85%' },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading]);

  // GSAP Scroll-triggered Flying Cards Animation (from Hero Globe to Grid)
  useEffect(() => {
    if (loading || projects.length === 0) return;

    let ctx;
    let timer;

    timer = setTimeout(() => {
      ctx = gsap.context(() => {
        // Flying Cards Animation from Hero Globe -> Projects Grid
        const cards = document.querySelectorAll('.flying-card');
        if (cards.length === 0) return;

        cards.forEach((card, i) => {
          // Find corresponding anchor on the globe
          const anchor = document.getElementById(`globe-anchor-${i}`);
          
          // Force the card to clear any previous transforms to get accurate natural rect
          gsap.set(card, { clearProps: "all" });
          const cardRect = card.getBoundingClientRect();
          
          let deltaX = 0;
          let deltaY = 0;
          let initialScale = 1;

          if (anchor) {
            const anchorRect = anchor.getBoundingClientRect();
            
            // Center of globe anchor
            const anchorCenterX = anchorRect.left + anchorRect.width / 2;
            const anchorCenterY = anchorRect.top + anchorRect.height / 2;
            
            // Center of card
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
                end: '20% top', // fade out quickly
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
              rotation: 0,
              rotationX: 0,
              rotationY: 0,
              scale: initialScale,
              zIndex: 10 - i,
              boxShadow: 'none',
              opacity: 0
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
              scrollTrigger: {
                trigger: '#home',
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
              }
            }
          );
        });

        // Refresh ScrollTrigger to ensure correct trigger positions after setting up
        ScrollTrigger.refresh();
      });
    }, 1500); // Wait longer to ensure 3D canvas is fully loaded and anchors are placed

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
    };
  }, [loading, projects, activeFilter]);

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section className={`section ${styles.projects}`} id="projects">
      <div className="container">
        <div ref={headerRef} className={styles.header} style={{ opacity: 0 }}>
          <span className="section-label">My Work</span>
          <h2>
            Featured <span className="gradient-text">Projects</span>
          </h2>
          <p>A selection of Shopify stores and e-commerce experiences I've built.</p>
        </div>

        {/* Filter tabs container */}
        <div ref={filtersRef} className={styles.filtersWrapper} style={{ opacity: 0 }}>
          <button 
            className={styles.mobileFilterBtn} 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <span className={styles.mobileFilterBtnLeft}>
              <svg className={styles.mobileFilterIcon} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter: <span className={styles.activeFilterName}>{activeFilter}</span>
            </span>
            <svg className={`${styles.chevronIcon} ${mobileFiltersOpen ? styles.chevronActive : ''}`} width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className={`${styles.filters} ${mobileFiltersOpen ? styles.filtersActive : ''}`}>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                className={`${styles.filter} ${activeFilter === cat ? styles.filterActive : ''}`}
                onClick={() => {
                  setActiveFilter(cat);
                  setMobileFiltersOpen(false);
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((project, i) => (
              <ProjectCard 
                key={project._id} 
                project={project} 
                index={i} 
                isFlying={activeFilter === 'All' && i < 3}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <p className={styles.empty}>No projects in this category yet.</p>
        )}
      </div>
    </section>
  );
}
