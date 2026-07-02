'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ProjectCard from '@/components/sections/ProjectCard';
import { getProjects } from '@/lib/api';
import { categoryToSlug } from '@/lib/categoryUtils';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import styles from './ProjectsPage.module.css';

const CursorGlow = dynamic(() => import('@/components/ui/CursorGlow'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// Demo fallback data
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const router = useRouter();

  const heroRef = useRef(null);
  const filtersRef = useRef(null);
  const statsRef = useRef(null);

  const categoriesList = ['All', ...new Set(projects.map((p) => p.category))].filter(Boolean);

  const getCategoryCount = (cat) => {
    if (cat === 'All') return projects.length;
    return projects.filter((p) => p.category === cat).length;
  };

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
      } catch {
        console.log('Using demo projects (API not connected)');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Hero entrance animation
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        filtersRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
      );
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, [loading]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(timer);
  }, [loading]);

  // On /projects page — always show ALL projects (search only)
  const filtered = projects.filter((p) => {
    return (
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.techStack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Navigate to category page on category pill click
  const handleCategoryClick = (cat) => {
    setMobileFiltersOpen(false);
    router.push(`/projects/category/${categoryToSlug(cat)}`);
  };

  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className={styles.main}>
        {/* ─── Page Hero ─────────────────────────────── */}
        <section className={styles.hero} id="scatter-hero">
          <div className={styles.heroBg}>
            <div className={styles.heroOrb1} />
            <div className={styles.heroOrb2} />
            <div className={styles.gridLines} />
          </div>

          <div className={`container ${styles.heroContent}`} ref={heroRef} style={{ opacity: 0 }}>
            <Link href="/" className={styles.breadcrumb}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>

            <span className="section-label">Portfolio</span>
            <h1 className={styles.heroTitle}>
              All <span className="gradient-text">Projects</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A complete collection of Shopify stores and e-commerce experiences I've crafted — from luxury fashion to high-performance electronics.
            </p>

            {/* Stats row */}
            <div className={styles.stats} ref={statsRef}>
              <div className={styles.statItem}>
                <span className={styles.statNum}>{projects.length}+</span>
                <span className={styles.statLabel}>Projects</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>{featuredCount}</span>
                <span className={styles.statLabel}>Featured</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>{categoriesList.length - 1}</span>
                <span className={styles.statLabel}>Categories</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <span className={styles.statNum}>100%</span>
                <span className={styles.statLabel}>Client Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Filters + Search + Grid ─────────────── */}
        <section className={styles.body}>
          <div className="container">
            {/* Search + Filters bar */}
            <div className={styles.toolbar} ref={filtersRef} style={{ opacity: 0 }}>
              {/* Search */}
              <div className={styles.searchWrapper}>
                <svg className={styles.searchIcon} width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search projects, tech stack..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className={styles.searchClear} onClick={() => setSearchQuery('')}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button
                className={styles.mobileFilterBtn}
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <span className={styles.mobileFilterBtnLeft}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className={styles.activeFilterName}>All</span>
                </span>
                <svg
                  className={`${styles.chevronIcon} ${mobileFiltersOpen ? styles.chevronActive : ''}`}
                  width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Filter pills — 'All' stays on page, others navigate to category page */}
              <div className={`${styles.filters} ${mobileFiltersOpen ? styles.filtersActive : ''}`}>
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filter} ${cat === 'All' ? styles.filterActive : styles.filterNav}`}
                    onClick={() => {
                      if (cat === 'All') {
                        setMobileFiltersOpen(false);
                      } else {
                        handleCategoryClick(cat);
                      }
                    }}
                  >
                    {cat}
                    <span className={styles.filterCount}>{getCategoryCount(cat)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results info */}
            {!loading && (
              <div className={styles.resultsInfo}>
                <span>
                  Showing <strong>{filtered.length}</strong> of <strong>{projects.length}</strong> projects
                  {searchQuery && <> matching &quot;<em>{searchQuery}</em>&quot;</>}
                </span>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className={styles.skeletonGrid}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>No projects found</h3>
                <p>Try adjusting your search or filter to find what you're looking for.</p>
                <button
                  className={styles.resetBtn}
                  onClick={() => { setSearchQuery(''); }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((project, i) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={i}
                    isFlying={i < 3}
                    scatterMode={i < 3}
                    totalCount={filtered.length}
                    filterKey="all"
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── CTA Section ─────────────────────────── */}
        <section className={styles.cta}>
          <div className={`container ${styles.ctaInner}`}>
            <h2>Have a project in mind?</h2>
            <p>Let's build something amazing together. I'm available for new Shopify projects.</p>
            <div className={styles.ctaActions}>
              <Link href="/#contact" className={styles.ctaPrimary}>
                Start a Project →
              </Link>
              <Link href="/" className={styles.ctaSecondary}>
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
