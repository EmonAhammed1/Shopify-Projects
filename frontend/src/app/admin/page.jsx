'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api';
import styles from './admin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState('');

  useEffect(() => {
    // Already logged in? Redirect
    if (typeof window !== 'undefined' && localStorage.getItem('portfolio_token')) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const { data } = await loginAdmin(form);
      localStorage.setItem('portfolio_token', data.token);
      localStorage.setItem('portfolio_admin', JSON.stringify(data.admin));
      console.log('✅ Admin logged in:', data.admin.email);
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('❌ Login failed:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Invalid credentials');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Background */}
      <div className={styles.bg}>
        <div className={`glow-orb glow-orb--purple ${styles.orb1}`} />
        <div className={`glow-orb glow-orb--cyan ${styles.orb2}`} />
      </div>

      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <p className={styles.loginLogo}>&lt;<span>Portfolio</span> /&gt;</p>
          <h1 className={styles.loginTitle}>Admin Access</h1>
          <p className={styles.loginSub}>Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email" type="email" placeholder="admin@portfolio.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password" type="password" placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required className={styles.input}
            />
          </div>

          {error && <p className={styles.errorMsg}>⚠️ {error}</p>}

          <button type="submit" className={styles.loginBtn} disabled={status === 'loading'}>
            {status === 'loading' ? (
              <><span className={styles.spinner} /> Signing in...</>
            ) : (
              'Sign In →'
            )}
          </button>
        </form>

        <p className={styles.hint}>
          Default: admin@portfolio.com / admin123456
        </p>
      </div>
    </div>
  );
}
