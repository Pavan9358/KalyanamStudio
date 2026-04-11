'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import styles from './page.module.css';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
    const body = mode === 'login'
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        localStorage.setItem('ks_token', data.token);
        localStorage.setItem('ks_user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <div className={styles.leftBg} />
        <div className={styles.leftContent}>
          <Link href="/" className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className={styles.leftLogo}>
            <span className={styles.logoEmoji}>🪷</span>
            <span>KalyanamStudio</span>
          </div>
          <h1 className={styles.leftTitle}>
            Begin Your
            <br />
            <em>Wedding Journey</em>
          </h1>
          <p className={styles.leftText}>
            Create beautiful South Indian wedding invitations that your family and friends will cherish forever.
          </p>

          <div className={styles.testimonial}>
            <p className={styles.testQuote}>
              &quot;KalyanamStudio made our wedding invitation process so smooth and beautiful. Our guests loved it!&quot;
            </p>
            <div className={styles.testAuthor}>
              <div className={styles.testAvatar}>A</div>
              <div>
                <div className={styles.testName}>Ananya & Karthik</div>
                <div className={styles.testRole}>Married • Chennai, 2025</div>
              </div>
            </div>
          </div>

          {/* Floating decorations */}
          <div className={styles.floatOrn1}>✦</div>
          <div className={styles.floatOrn2}>🌺</div>
          <div className={styles.floatOrn3}>🪷</div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formCard}>
          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => setMode('signup')}
            >
              Sign Up Free
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}
            >
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>
                  {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h2>
                <p className={styles.formSubtitle}>
                  {mode === 'login'
                    ? 'Sign in to manage your invitations'
                    : 'Join thousands of couples using KalyanamStudio'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                {mode === 'signup' && (
                  <div className="form-group">
                    <label className="form-label">Your Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Priya Sharma"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`form-input ${styles.passwordInput}`}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.errorMsg}
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className={`btn btn-primary ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className={styles.btnSpinner} />
                  ) : (
                    <>
                      <Sparkles size={16} />
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>

              <p className={styles.switchText}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  className={styles.switchBtn}
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
