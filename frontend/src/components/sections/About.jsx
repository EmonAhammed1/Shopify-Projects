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
  const textRef = useRef(null);
  const skillsRef = useRef(null);
  const toolsRef = useRef(null);

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
          opacity: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: skillsRef.current, start: 'top 85%' },
        }
      );

      gsap.fromTo(
        toolsRef.current.children,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: toolsRef.current, start: 'top 85%' },
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
                  <span className={styles.highlightIcon}>{icon}</span>
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
            <div className={styles.card}>
              <p className={styles.cardLabel}>Tools & Platforms</p>
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
      </div>
    </section>
  );
}
