'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProject, getProjects } from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import styles from './project.module.css';

const CursorGlow = dynamic(() => import('@/components/ui/CursorGlow'), { ssr: false });

const DEMO = {
  title: 'LuxeWear Shopify Store',
  shortDesc: 'A premium fashion Shopify store with custom sections.',
  description: 'LuxeWear is a full-featured fashion e-commerce store built on Shopify. The project included custom theme development, unique product section designs, cart upsell integrations, and a streamlined checkout flow. Resulted in a 38% increase in conversion rate post-launch.',
  category: 'Shopify',
  thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  screenshots: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80',
  ],
  techStack: ['Shopify', 'Liquid', 'JavaScript', 'SCSS', 'Klaviyo'],
  liveUrl: '#', githubUrl: '',
};

export default function ProjectPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getProject(slug);
        setProject(data.project);
        const rel = await getProjects({ category: data.project.category });
        setRelated(rel.data.projects.filter((p) => p.slug !== slug).slice(0, 3));
      } catch {
        setProject(DEMO);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
        </div>
      </>
    );
  }

  const { title, description, shortDesc, category, thumbnail, screenshots = [], techStack = [], liveUrl, githubUrl, storefrontPassword } = project;
  const finalLiveUrl = storefrontPassword ? `/api/projects/${slug}/preview` : liveUrl;
  const allImages = [thumbnail, ...screenshots].filter(Boolean);

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className={styles.main}>
        {/* Hero banner */}
        <div className={styles.banner}>
          <div className={styles.bannerOverlay} />
          {allImages[0] && <img src={allImages[0]} alt={title} className={styles.bannerImg} />}
          <div className={`container ${styles.bannerContent}`}>
            <Link href="/#projects" className={styles.back}>
              ← Back to Projects
            </Link>
            <span className={styles.category}>{category}</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.shortDesc}>{shortDesc}</p>
            <div className={styles.actions}>
              {liveUrl && (
                <a href={finalLiveUrl} target="_blank" rel="noreferrer" className={styles.btnPrimary}>
                  View Live Site ↗
                </a>
              )}
              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noreferrer" className={styles.btnSecondary}>
                  GitHub →
                </a>
              )}
            </div>
          </div>
        </div>

        <div className={`container ${styles.body}`}>
          <div className={styles.bodyGrid}>
            {/* Main content */}
            <div>
              <h2 className={styles.sectionTitle}>Project Overview</h2>
              <p className={styles.desc}>{description}</p>

              {/* Screenshot gallery */}
              {allImages.length > 1 && (
                <div className={styles.gallery}>
                  <h2 className={styles.sectionTitle}>Screenshots</h2>
                  <div className={styles.galleryMain}>
                    <img src={allImages[activeImg]} alt={`Screenshot ${activeImg + 1}`} />
                  </div>
                  <div className={styles.galleryThumbs}>
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={img} alt={`Thumb ${i + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sideCard}>
                <h3>Tech Stack</h3>
                <div className={styles.tags}>
                  {techStack.map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className={styles.sideCard}>
                <h3>Links</h3>
                {liveUrl ? (
                  <a href={finalLiveUrl} target="_blank" rel="noreferrer" className={styles.sideLink}>
                    🌐 Live Site
                  </a>
                ) : <p className={styles.naText}>Not available</p>}
                {githubUrl && (
                  <a href={githubUrl} target="_blank" rel="noreferrer" className={styles.sideLink}>
                    💻 GitHub Repo
                  </a>
                )}
              </div>
              <div className={styles.sideCard}>
                <h3>Category</h3>
                <span className="tech-tag" style={{ color: 'var(--accent-2)', borderColor: 'rgba(0,245,212,0.3)', background: 'rgba(0,245,212,0.08)' }}>
                  {category}
                </span>
              </div>
              <Link href="/#contact" className={styles.cta}>
                💬 Start a Similar Project
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
