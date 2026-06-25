'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ProjectCard from './ProjectCard';
import { getProjects } from '@/lib/api';
import styles from './Projects.module.css';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ['All', 'Shopify', 'E-commerce', 'Landing Page', 'Web App'];

// Demo fallback data (used if API is not connected yet)
const DEMO_PROJECTS = [
  {
    _id: '1', title: 'LuxeWear Shopify Store', slug: 'luxewear-shopify-store',
    shortDesc: 'A premium fashion Shopify store with custom sections and conversion-optimized UX.',
    category: 'Shopify', featured: true, order: 1,
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS', 'Klaviyo'], liveUrl: '#',
  },
  {
    _id: '2', title: 'GreenCart Organic Shop', slug: 'greencart-organic-shop',
    shortDesc: 'Eco-friendly product store with subscription boxes and loyalty program.',
    category: 'Shopify', featured: true, order: 2,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'Recharge', 'Smile.io', 'SCSS'], liveUrl: '#',
  },
  {
    _id: '3', title: 'TechDrop Electronics', slug: 'techdrop-electronics',
    shortDesc: 'High-performance electronics Shopify store with advanced filtering.',
    category: 'E-commerce', featured: true, order: 3,
    thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
    techStack: ['Shopify Plus', 'Liquid', 'React', 'Algolia'], liveUrl: '#',
  },
  {
    _id: '4', title: 'SkinGlow Beauty Brand', slug: 'skinglow-beauty',
    shortDesc: 'Beauty & skincare DTC brand with quiz-based product recommendations.',
    category: 'Shopify', featured: false, order: 4,
    thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'Klaviyo', 'Refersion'], liveUrl: '#',
  },
  {
    _id: '5', title: 'SportZone Athletic Gear', slug: 'sportzone-athletic',
    shortDesc: 'Multi-sport athletic gear store with custom bundle builder.',
    category: 'Shopify', featured: false, order: 5,
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS'], liveUrl: '#',
  },
  {
    _id: '6', title: 'CraftHaven Marketplace', slug: 'crafthaven-handmade',
    shortDesc: 'Multi-vendor handmade marketplace built on Shopify with headless storefront.',
    category: 'E-commerce', featured: false, order: 6,
    thumbnail: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80',
    techStack: ['Shopify Hydrogen', 'React', 'GraphQL', 'Node.js'], liveUrl: '#', githubUrl: '#',
  },
];

export default function Projects() {
  const [projects, setProjects] = useState(DEMO_PROJECTS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const headerRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await getProjects();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.log('Using demo projects (API not connected)');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();

    gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' },
      }
    );
  }, []);

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

          {/* Filter tabs */}
          <div className={styles.filters}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`${styles.filter} ${activeFilter === cat ? styles.filterActive : ''}`}
                onClick={() => setActiveFilter(cat)}
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
              <ProjectCard key={project._id} project={project} index={i} />
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
