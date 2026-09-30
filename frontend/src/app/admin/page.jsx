'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api';
import styles from './admin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
      const { data } = await loginAdmin({
        email: form.email.trim(),
        password: form.password.trim(),
      });
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

        <form onSubmit={handleSubmit} className={styles.loginForm} autoComplete="off">
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="off"
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
                className={`${styles.input} ${styles.passwordInput}`}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
      </div>
    </div>
  );
}
