'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Sparkles, LogOut, User } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('ks_token');
    const userData = localStorage.getItem('ks_user');
    if (token && userData) {
      // eslint-disable-next-line
      setUser(JSON.parse(userData));
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('ks_token');
    localStorage.removeItem('ks_user');
    setUser(null);
    router.push('/');
  };

  const isHomePage = pathname === '/';

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''} ${!isHomePage ? styles.solid : ''}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🪷</span>
          <span className={styles.logoText}>
            <span className={styles.logoK}>Kalyanam</span>
            <span className={styles.logoS}>Studio</span>
          </span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/templates" className={styles.navLink}>Templates</Link>
          <Link href="/#features" className={styles.navLink}>Features</Link>
          <Link href="/#pricing" className={styles.navLink}>Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>My Invites</Link>
              <div className={styles.userMenu}>
                <div className={styles.userAvatar}>
                  <User size={16} />
                  <span>{user.name?.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/auth" className={`${styles.navLink} ${styles.loginLink}`}>Login</Link>
              <Link href="/auth?mode=signup" className="btn btn-primary btn-sm">
                <Sparkles size={14} />
                Create Invite
              </Link>
            </div>
          )}
        </div>

        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link href="/templates" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Templates</Link>
          <Link href="/#features" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Features</Link>
          <Link href="/#pricing" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Invites</Link>
              <button onClick={handleLogout} className={styles.mobileLinkBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link href="/auth?mode=signup" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign Up Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
