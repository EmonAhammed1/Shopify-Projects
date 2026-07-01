'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  SiShopify, SiReact, SiNodedotjs, SiJavascript, SiSass, 
  SiGraphql, SiFigma, SiGreensock, SiThreedotjs, SiCloudinary, 
  SiAlgolia, SiVercel, SiMongodb 
} from 'react-icons/si';
import { FaGitAlt, FaCode, FaEnvelope } from 'react-icons/fa';
import styles from './About.module.css';

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  { name: 'Shopify', icon: SiShopify, color: '#96BF48' },
  { name: 'Liquid', icon: FaCode, color: '#7AB55C' },
  { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
  { name: 'React', icon: SiReact, color: '#61DAFB' },
  { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
  { name: 'SCSS', icon: SiSass, color: '#CC6699' },
  { name: 'Shopify Plus', icon: SiShopify, color: '#5E8E3E' },
  { name: 'Hydrogen', icon: SiShopify, color: '#47C1BF' },
  { name: 'GraphQL', icon: SiGraphql, color: '#E10098' },
  { name: 'Klaviyo', icon: FaEnvelope, color: '#FF5A5F' },
  { name: 'Recharge', icon: FaCode, color: '#00A699' },
  { name: 'Figma', icon: SiFigma, color: '#F24E1E' },
  { name: 'GSAP', icon: SiGreensock, color: '#88CE02' },
  { name: 'Three.js', icon: SiThreedotjs, color: '#FFFFFF' },
];

const TOOLS = [
  { name: 'Shopify Partners', icon: SiShopify, color: '#96BF48' },
  { name: 'Cloudinary', icon: SiCloudinary, color: '#F1485B' },
  { name: 'Algolia', icon: SiAlgolia, color: '#003DFF' },
  { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
  { name: 'Vercel', icon: SiVercel, color: '#FFFFFF' },
  { name: 'Git', icon: FaGitAlt, color: '#F05032' },
];

export default function About() {
  const sectionRef = useRef(null);
  const introCardRef = useRef(null);
  const statsCardRef = useRef(null);
  const techCardRef = useRef(null);
  const focusCardRef = useRef(null);
  const skillsRef = useRef(null);
  const toolsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = [
        introCardRef.current,
        statsCardRef.current,
        techCardRef.current,
        focusCardRef.current
      ];

      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={`section ${styles.about}`} id="about">
      <div className="grid-bg" />
      <div className={styles.glow1} />
      <div className={styles.glow2} />
      <div className="container">
        <div className={styles.bentoGrid}>
          {/* Card 1: Intro */}
          <div ref={introCardRef} className={`${styles.bentoCard} ${styles.introCard}`}>
            <div className={styles.cyberTag}>// 01. PROFILE</div>
            <div className={styles.cardPattern} />
            <span className="section-label">About Me</span>
            <h2>
              E-commerce Developer<br />
              <span className="gradient-text">& Shopify Expert</span>
            </h2>
            <p>
              I specialize in building high-performance Shopify stores and e-commerce
              experiences that combine beautiful design with conversion-focused engineering.
              From custom theme development to headless commerce, I bring brands to life online.
            </p>
            <p>
              Every project starts with understanding your customers — then I craft an
              experience that feels effortless, loads fast, and converts browsers into buyers.
            </p>
          </div>

          {/* Card 2: Stats */}
          <div ref={statsCardRef} className={`${styles.bentoCard} ${styles.statsCard}`}>
            <div className={styles.cyberTag}>// 02. METRICS</div>
            <div className={styles.cardPattern} />
            
            <div className={styles.statsGrid}>
              {/* Performance */}
              <div className={styles.statItem}>
                <div className={styles.speedometerContainer}>
                  <svg className={styles.svgCircle} viewBox="0 0 100 100">
                    <circle className={styles.circleBg} cx="50" cy="50" r="42" />
                    <circle className={styles.circleProgress} style={{ stroke: '#96BF48', filter: 'drop-shadow(0 0 6px #96BF48)', strokeDashoffset: 4.2 }} cx="50" cy="50" r="42" />
                  </svg>
                  <span className={styles.statVal} style={{ color: '#96BF48' }}>99+</span>
                </div>
                <span className={styles.statLabel}>Performance</span>
              </div>

              {/* Accessibility */}
              <div className={styles.statItem}>
                <div className={styles.speedometerContainer}>
                  <svg className={styles.svgCircle} viewBox="0 0 100 100">
                    <circle className={styles.circleBg} cx="50" cy="50" r="42" />
                    <circle className={styles.circleProgress} style={{ stroke: '#47C1BF', filter: 'drop-shadow(0 0 6px #47C1BF)', strokeDashoffset: 0 }} cx="50" cy="50" r="42" />
                  </svg>
                  <span className={styles.statVal} style={{ color: '#47C1BF' }}>100%</span>
                </div>
                <span className={styles.statLabel}>Accessibility</span>
              </div>

              {/* Best Practices */}
              <div className={styles.statItem}>
                <div className={styles.speedometerContainer}>
                  <svg className={styles.svgCircle} viewBox="0 0 100 100">
                    <circle className={styles.circleBg} cx="50" cy="50" r="42" />
                    <circle className={styles.circleProgress} style={{ stroke: '#7AB55C', filter: 'drop-shadow(0 0 6px #7AB55C)', strokeDashoffset: 0 }} cx="50" cy="50" r="42" />
                  </svg>
                  <span className={styles.statVal} style={{ color: '#7AB55C' }}>100%</span>
                </div>
                <span className={styles.statLabel}>Best Practices</span>
              </div>

              {/* SEO */}
              <div className={styles.statItem}>
                <div className={styles.speedometerContainer}>
                  <svg className={styles.svgCircle} viewBox="0 0 100 100">
                    <circle className={styles.circleBg} cx="50" cy="50" r="42" />
                    <circle className={styles.circleProgress} style={{ stroke: '#5E8E3E', filter: 'drop-shadow(0 0 6px #5E8E3E)', strokeDashoffset: 0 }} cx="50" cy="50" r="42" />
                  </svg>
                  <span className={styles.statVal} style={{ color: '#5E8E3E' }}>100%</span>
                </div>
                <span className={styles.statLabel}>SEO</span>
              </div>
            </div>

            <div className={styles.statDivider} />

            <div className={styles.expertBadgeItem}>
              <div className={styles.badgePulseIcon}>
                <SiShopify className={styles.badgeIcon} />
              </div>
              <div className={styles.badgeText}>
                <span className={styles.badgeTitle}>SHOPIFY EXPERT</span>
                <span className={styles.badgeDesc}>Official Theme & Headless</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tech Stack & Tools (Wide) */}
          <div ref={techCardRef} className={`${styles.bentoCard} ${styles.techCard}`}>
            <div className={styles.cyberTag}>// 03. CAPABILITIES</div>
            <div className={styles.cardPattern} />
            <div className={styles.techStackContainer}>
              <div className={styles.techSection}>
                <h3 className={styles.bentoSubLabel}>Tech Stack</h3>
                <div ref={skillsRef} className={styles.tags}>
                  {SKILLS.map((skill) => (
                    <span 
                      key={skill.name} 
                      className="tech-tag" 
                      style={{ '--hover-color': skill.color }}
                    >
                      <skill.icon className="tech-tag-icon" />
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={styles.verticalDivider} />
              
              <div className={styles.techSection}>
                <h3 className={styles.bentoSubLabel}>Tools & Platforms</h3>
                <div ref={toolsRef} className={styles.tags}>
                  {TOOLS.map((tool) => (
                    <span 
                      key={tool.name} 
                      className="tech-tag"
                      style={{ '--hover-color': tool.color }}
                    >
                      <tool.icon className="tech-tag-icon" />
                      {tool.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Focus/Highlights */}
          <div ref={focusCardRef} className={`${styles.bentoCard} ${styles.focusCard}`}>
            <div className={styles.cyberTag}>// 04. CORE_SPECIALTIES</div>
            <div className={styles.cardPattern} />
            <h3 className={styles.bentoSubLabel}>Core Focus</h3>
            <div className={styles.highlightsList}>
              {[
                { icon: '⚡', title: 'Performance-First', desc: 'Lightning-fast loading speeds.' },
                { icon: '🎨', title: 'Pixel-Perfect UI', desc: 'Flawless design transitions.' },
                { icon: '📈', title: 'Conversion Rate', desc: 'Optimized to turn clicks into sales.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className={styles.highlightItem}>
                  <div className={styles.highlightIcon}>{icon}</div>
                  <div className={styles.highlightText}>
                    <span className={styles.highlightTitle}>
                      <span className={styles.codeBracket}>[</span>
                      {title}
                      <span className={styles.codeBracket}>]</span>
                    </span>
                    <span className={styles.highlightDesc}>{desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
