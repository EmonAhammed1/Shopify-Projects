'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ProjectCard from '@/components/sections/ProjectCard';
import { getProjects } from '@/lib/api';
import {
  slugToCategory,
  categoryToSlug,
  getCategoryDescription,
  getCategoryIcon,
} from '@/lib/categoryUtils';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import styles from './CategoryPage.module.css';

const CursorGlow = dynamic(() => import('@/components/ui/CursorGlow'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

// Full demo data
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

export default function CategoryPage() {
  const { slug } = useParams();
  const [allProjects, setAllProjects] = useState(DEMO_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const heroRef = useRef(null);
  const gridRef = useRef(null);

  // Resolve category name from slug
  const allCategories = [...new Set(allProjects.map((p) => p.category))].filter(Boolean);
  const categoryName = slugToCategory(slug, allCategories);
  const categoryProjects = categoryName
    ? allProjects.filter((p) => p.category === categoryName)
    : [];

  useEffect(() => {
    const fetchProjects = async () => {
      const cached = sessionStorage.getItem('projectsData');
      if (cached) {
        setAllProjects(JSON.parse(cached));
        setLoading(false);
      }
      try {
        const { data } = await getProjects();
        if (data.projects && data.projects.length > 0) {
          setAllProjects(data.projects);
          sessionStorage.setItem('projectsData', JSON.stringify(data.projects));
        }
      } catch {
        console.log('Using demo projects (API not connected)');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [slug]);

  // 404 check after loading
  useEffect(() => {
    if (!loading) {
      const cats = [...new Set(allProjects.map((p) => p.category))].filter(Boolean);
      const found = slugToCategory(slug, cats);
      if (!found) setNotFound(true);
    }
  }, [loading, allProjects, slug]);

  // Hero entrance animation
  useEffect(() => {
    if (loading) return;
    
    // Delayed scroll ensures we override Next.js router scroll restoration
    const scrollTimer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }, 100);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.1 }
      );
    });

    return () => {
      clearTimeout(scrollTimer);
      ctx.revert();
    };
  }, [loading]);

  // ── Not Found State ──
  if (!loading && notFound) {
    return (
      <>
        <CursorGlow />
        <Navbar />
        <main className={styles.main}>
          <div className={styles.notFound}>
            <span className={styles.notFoundIcon}>🔍</span>
            <h1>Category Not Found</h1>
            <p>We couldn't find any projects in this category.</p>
            <Link href="/projects" className={styles.backBtn}>← Back to All Projects</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const icon = categoryName ? getCategoryIcon(categoryName) : '🛒';
  const description = categoryName ? getCategoryDescription(categoryName) : '';
  const featuredInCat = categoryProjects.filter((p) => p.featured).length;

  // Other categories for nav (excluding current)
  const otherCategories = allCategories.filter((c) => c !== categoryName);

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className={styles.main}>

        {/* ─── Hero ───────────────────────────────────── */}
        <section className={styles.hero} id="scatter-hero">
          <div className={styles.heroBg}>
            <div className={styles.heroOrb1} />
            <div className={styles.heroOrb2} />
            <div className={styles.gridLines} />
          </div>

          <div className={`container ${styles.heroContent}`} ref={heroRef} style={{ opacity: 0 }}>
            {/* Breadcrumb */}
            <div className={styles.breadcrumbs}>
              <Link href="/" className={styles.breadcrumbLink}>Home</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <Link href="/projects" className={styles.breadcrumbLink}>Projects</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbCurrent}>
                {loading ? '...' : (categoryName || slug)}
              </span>
            </div>

            {/* Category Badge */}
            <div className={styles.categoryBadge}>
              <span className={styles.categoryIcon}>{icon}</span>
              <span className="section-label" style={{ margin: 0 }}>Category</span>
            </div>

            {/* Title */}
            <h1 className={styles.heroTitle}>
              {loading ? (
                <span className={styles.titleSkeleton} />
              ) : (
                <>
                  {categoryName
                    ? categoryName.split(' ').slice(0, -1).join(' ')
                    : 'Unknown'}{' '}
                  <span className="gradient-text">
                    {categoryName ? categoryName.split(' ').slice(-1)[0] : 'Category'}
                  </span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className={styles.heroSubtitle}>
              {loading ? '' : description}
            </p>

            {/* Stats */}
            {!loading && (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statNum}>{categoryProjects.length}</span>
                  <span className={styles.statLabel}>Projects</span>
                </div>
                {featuredInCat > 0 && (
                  <>
                    <div className={styles.statDivider} />
                    <div className={styles.statItem}>
                      <span className={styles.statNum}>{featuredInCat}</span>
                      <span className={styles.statLabel}>Featured</span>
                    </div>
                  </>
                )}
                <div className={styles.statDivider} />
                <div className={styles.statItem}>
                  <span className={styles.statNum}>100%</span>
                  <span className={styles.statLabel}>Satisfaction</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── Projects Grid ──────────────────────────── */}
        <section className={styles.body}>
          <div className="container">

            {loading ? (
              <div className={styles.skeletonGrid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.skeleton} />
                ))}
              </div>
            ) : categoryProjects.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📭</span>
                <h3>No Projects Yet</h3>
                <p>No projects in this category at the moment. Check back soon!</p>
                <Link href="/projects" className={styles.backBtn}>← Browse All Projects</Link>
              </div>
            ) : (
              <div className={styles.grid} ref={gridRef}>
                {categoryProjects.map((project, i) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    index={i}
                    isFlying={i < 3}
                    scatterMode={i < 3}
                    totalCount={categoryProjects.length}
                    filterKey={categoryName}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Other Categories ────────────────────────── */}
        {!loading && otherCategories.length > 0 && (
          <section className={styles.otherCats}>
            <div className="container">
              <h2 className={styles.otherCatsTitle}>
                Explore Other <span className="gradient-text">Categories</span>
              </h2>
              <div className={styles.otherCatsGrid}>
                {otherCategories.map((cat) => {
                  const count = allProjects.filter((p) => p.category === cat).length;
                  return (
                    <Link
                      key={cat}
                      href={`/projects/category/${categoryToSlug(cat)}`}
                      className={styles.catCard}
                    >
                      <span className={styles.catCardIcon}>{getCategoryIcon(cat)}</span>
                      <span className={styles.catCardName}>{cat}</span>
                      <span className={styles.catCardCount}>{count} project{count !== 1 ? 's' : ''}</span>
                      <span className={styles.catCardArrow}>→</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ─── CTA ─────────────────────────────────────── */}
        <section className={styles.cta}>
          <div className={`container ${styles.ctaInner}`}>
            <h2>Want a similar store?</h2>
            <p>Let's build a premium {categoryName || 'Shopify'} experience tailored to your brand.</p>
            <div className={styles.ctaActions}>
              <Link href="/#contact" className={styles.ctaPrimary}>
                Start a Project →
              </Link>
              <Link href="/projects" className={styles.ctaSecondary}>
                ← All Projects
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
