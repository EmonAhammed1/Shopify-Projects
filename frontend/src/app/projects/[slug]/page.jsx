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
  pages: [
    { name: 'Home Page', path: '/' },
    { name: 'Product Page', path: '/products/premium-leather-bag' },
    { name: 'Cart Page', path: '/cart' }
  ]
};

export default function ProjectPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [desktopLoading, setDesktopLoading] = useState(true);
  const [laptopLoading, setLaptopLoading] = useState(true);
  const [mobileLoading, setMobileLoading] = useState(true);

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
    setActivePageIndex(0);
    setDesktopLoading(true);
    setLaptopLoading(true);
    setMobileLoading(true);
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

  const { title, description, shortDesc, category, thumbnail, screenshots = [], techStack = [], liveUrl, githubUrl, storefrontPassword, pages = [] } = project;
  const finalLiveUrl = storefrontPassword ? `/api/projects/${slug}/preview` : liveUrl;
  const allImages = [thumbnail, ...screenshots].filter(Boolean);

  // Default to Home page of the store if pages are not configured
  const displayPages = pages && pages.length > 0 ? pages : [{ name: 'Home', path: '/' }];
  const activePage = displayPages[activePageIndex] || { name: 'Home', path: '/' };

  const isImageLink = (path) => {
    if (!path) return false;
    return path.startsWith('http') && (/\.(jpeg|jpg|gif|png|webp|svg)/i.test(path) || path.includes('ibb.co'));
  };
  const isImg = activePage && isImageLink(activePage.path);
  const isDemo = !liveUrl || liveUrl === '#' || liveUrl.startsWith('http://localhost');
  const iframeSrc = activePage && !isImg
    ? (isDemo 
        ? `/demo-iframe.html?page=${encodeURIComponent(activePage.name)}`
        : `/api/projects/${slug}/proxy?path=${encodeURIComponent(activePage.path)}`
      )
    : '';

  const handleTabClick = (idx) => {
    if (idx === activePageIndex) return;
    setDesktopLoading(true);
    setLaptopLoading(true);
    setMobileLoading(true);
    setActivePageIndex(idx);
  };

  return (
    <>
      <CursorGlow />
      <Navbar />
      <main className={styles.main}>
        {/* Hero banner */}
        <div className={styles.banner}>
          <div className={styles.bannerOverlay} />
          {project.liveUrl ? (
            <iframe
              src={isDemo ? `/demo-iframe.html?page=Home` : `/api/projects/${slug}/proxy?path=%2F`}
              className={styles.bannerBgIframe}
              title="Live Background"
            />
          ) : (
            allImages[0] && <img src={allImages[0]} alt={title} className={styles.bannerImg} />
          )}
          <div className={`container ${styles.bannerContent}`}>
            <Link href="/#projects" className={styles.back}>
              ← Back to Projects
            </Link>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.shortDesc}>{shortDesc}</p>
            
            <div className={styles.projectMeta}>
              <div className={styles.metaGroup}>
                <span className={styles.metaTitle}>Category:</span>
                <span className="tech-tag" style={{ color: 'var(--accent-2)', borderColor: 'rgba(0,245,212,0.3)', background: 'rgba(0,245,212,0.08)', fontSize: '0.8rem', padding: '4px 12px' }}>
                  {category}
                </span>
              </div>
              {techStack && techStack.length > 0 && (
                <div className={styles.metaGroup}>
                  <span className={styles.metaTitle}>Tech Stack:</span>
                  <div className={styles.tagsHorizontal}>
                    {techStack.map((t) => (
                      <span key={t} className="tech-tag" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
              <Link href="/#contact" className={styles.btnCta}>
                💬 Start a Similar Project
              </Link>
            </div>
          </div>
        </div>

        {/* Screenshot gallery (only render if there are multiple screenshots) */}
        {allImages.length > 1 && (
          <div className={`container ${styles.body}`}>
            <div className={styles.bodyGrid}>
              <div>
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
              </div>
            </div>
          </div>
        )}

        {/* Device Preview Mockup Section */}
        {(displayPages.length > 0 || liveUrl) && (
          <section className={styles.mockupSection}>
            <div className={styles.mockupContainerWide}>
              <div className={styles.mockupHeader}>
                <h2>Interactive Store Preview</h2>
                <p>Explore different sections and features of the live store in real-time across devices.</p>
              </div>

              {/* Tabs (Render only if there are multiple pages) */}
              {displayPages.length > 1 && (
                <div className={styles.mockupTabs}>
                  {displayPages.map((page, idx) => (
                    <button
                      key={page._id || idx}
                      className={`${styles.mockupTab} ${activePageIndex === idx ? styles.mockupTabActive : ''}`}
                      onClick={() => handleTabClick(idx)}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Devices Layout - Side by Side */}
              <div className={styles.devicesLayout}>
                
                {/* Desktop Mockup */}
                <div className={`${styles.mockupContainer} ${styles.desktop}`}>
                  <div className={styles.screenFrame}>
                    {desktopLoading && (
                      <div className={styles.iframeLoader}>
                        <div className={styles.loadingSpinner} />
                      </div>
                    )}
                    {activePage && isImg ? (
                      <div className={styles.pcImageWrapper}>
                        <img
                          src={activePage.path}
                          alt={activePage.name}
                          className={styles.pcImage}
                          onLoad={() => setDesktopLoading(false)}
                        />
                      </div>
                    ) : (
                      iframeSrc && (
                        <iframe
                          src={iframeSrc}
                          title="Desktop Preview"
                          className={styles.pcIframe}
                          onLoad={() => setDesktopLoading(false)}
                        />
                      )
                    )}
                  </div>
                  <div className={styles.pcStand} />
                  <div className={styles.pcBase} />
                </div>

                {/* Laptop Mockup */}
                <div className={`${styles.mockupContainer} ${styles.laptop}`}>
                  <div className={styles.screenFrame}>
                    {laptopLoading && (
                      <div className={styles.iframeLoader}>
                        <div className={styles.loadingSpinner} />
                      </div>
                    )}
                    {activePage && isImg ? (
                      <div className={styles.pcImageWrapper}>
                        <img
                          src={activePage.path}
                          alt={activePage.name}
                          className={styles.pcImage}
                          onLoad={() => setLaptopLoading(false)}
                        />
                      </div>
                    ) : (
                      iframeSrc && (
                        <iframe
                          src={iframeSrc}
                          title="Laptop Preview"
                          className={styles.pcIframe}
                          onLoad={() => setLaptopLoading(false)}
                        />
                      )
                    )}
                  </div>
                  <div className={styles.laptopKeyboardBase} />
                </div>

                {/* Mobile Mockup */}
                <div className={`${styles.mockupContainer} ${styles.mobile}`}>
                  <div className={styles.screenFrame}>
                    <div className={styles.mobileNotch} />
                    {mobileLoading && (
                      <div className={styles.iframeLoader}>
                        <div className={styles.loadingSpinner} />
                      </div>
                    )}
                    {activePage && isImg ? (
                      <div className={styles.pcImageWrapper}>
                        <img
                          src={activePage.path}
                          alt={activePage.name}
                          className={styles.pcImage}
                          onLoad={() => setMobileLoading(false)}
                        />
                      </div>
                    ) : (
                      iframeSrc && (
                        <iframe
                          src={iframeSrc}
                          title="Mobile Preview"
                          className={styles.pcIframe}
                          onLoad={() => setMobileLoading(false)}
                        />
                      )
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
