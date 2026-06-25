'use client';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './About.module.css';

gsap.registerPlugin(ScrollTrigger);

const SKILLS = [
  'Shopify', 'Liquid', 'JavaScript', 'React', 'Node.js',
  'SCSS', 'Shopify Plus', 'Hydrogen', 'GraphQL', 'Klaviyo',
  'Recharge', 'Figma', 'GSAP', 'Three.js',
];

const TOOLS = ['Shopify Partners', 'Cloudinary', 'Algolia', 'MongoDB', 'Vercel', 'Git'];

export default function About() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const skillsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        textRef.current.children,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: textRef.current, start: 'top 80%' },
        }
      );

      gsap.fromTo(
        skillsRef.current.children,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: skillsRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={`section ${styles.about}`} id="about">
      <div className="grid-bg" />
      <div className="container">
        <div className={styles.grid}>
          {/* Text side */}
          <div ref={textRef} className={styles.text}>
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
            <div className={styles.highlights}>
              {[
                { icon: '⚡', text: 'Performance-first development' },
                { icon: '🎨', text: 'Pixel-perfect UI implementation' },
                { icon: '📈', text: 'Conversion rate optimization' },
              ].map(({ icon, text }) => (
                <div key={text} className={styles.highlight}>
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills side */}
          <div className={styles.skillsWrap}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Tech Stack</p>
              <div ref={skillsRef} className={styles.tags}>
                {SKILLS.map((skill) => (
                  <span key={skill} className="tech-tag">{skill}</span>
                ))}
              </div>
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Tools & Platforms</p>
              <div className={styles.tags}>
                {TOOLS.map((tool) => (
                  <span key={tool} className={`tech-tag ${styles.tagAlt}`}>{tool}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
