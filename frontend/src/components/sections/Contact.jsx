'use client';
import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { submitContact } from '@/lib/api';
import styles from './Contact.module.css';

gsap.registerPlugin(ScrollTrigger);

const CONTACT_INFO = [
  { icon: '📧', label: 'Email', value: 'hello@portfolio.com' },
  { icon: '⚡', label: 'Response Time', value: 'Within 24 hours' },
  { icon: '🌍', label: 'Availability', value: 'Remote worldwide' },
];

export default function Contact() {
  const sectionRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-animate',
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error('Contact submit error:', err.message);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section ref={sectionRef} className={`section ${styles.contact}`} id="contact">
      <div className="grid-bg" />
      <div className="container">
        <div className={styles.grid}>
          {/* Left info */}
          <div className={styles.info}>
            <span className="section-label contact-animate">Get In Touch</span>
            <h2 className="contact-animate">
              Let's Build Something <span className="gradient-text">Great</span>
            </h2>
            <p className="contact-animate">
              Ready to elevate your Shopify store or launch a new e-commerce project?
              I'd love to hear about your vision.
            </p>

            <div className={styles.infoCards}>
              {CONTACT_INFO.map(({ icon, label, value }) => (
                <div key={label} className={`${styles.infoCard} contact-animate`}>
                  <span className={styles.infoIcon}>{icon}</span>
                  <div>
                    <p className={styles.infoLabel}>{label}</p>
                    <p className={styles.infoValue}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative orb */}
            <div className={`glow-orb glow-orb--purple ${styles.orb}`} />
          </div>

          {/* Right form */}
          <form className={`${styles.form} contact-animate`} onSubmit={handleSubmit} noValidate>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="name">Name</label>
                <input
                  id="name" type="text" name="name" placeholder="Your name"
                  value={form.name} onChange={handleChange} required
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email" type="email" name="email" placeholder="your@email.com"
                  value={form.email} onChange={handleChange} required
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>
              <input
                id="subject" type="text" name="subject" placeholder="Project inquiry"
                value={form.subject} onChange={handleChange} required
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message" name="message" rows={6}
                placeholder="Tell me about your project..."
                value={form.message} onChange={handleChange} required
                className={styles.textarea}
              />
            </div>

            <button type="submit" className={styles.submit} disabled={status === 'loading'}>
              {status === 'loading' ? (
                <><span className={styles.spinner} /> Sending...</>
              ) : status === 'success' ? (
                '✅ Message Sent!'
              ) : status === 'error' ? (
                '❌ Failed — try again'
              ) : (
                'Send Message →'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
