'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="8" width="20" height="10" rx="3" stroke="url(#logo-grad)" strokeWidth="1.5"/>
              <circle cx="7" cy="18" r="2" stroke="url(#logo-grad)" strokeWidth="1.5"/>
              <circle cx="17" cy="18" r="2" stroke="url(#logo-grad)" strokeWidth="1.5"/>
              <path d="M5 8L7 4H17L19 8" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff"/>
                  <stop offset="1" stopColor="#a1a1aa"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className={styles.logoType}>
            Gaz<span className={styles.logoAccent}>Bilir</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}
          >
            Ana Sayfa
          </Link>
          <Link
            href="/hesapla"
            className={`${styles.navLink} ${pathname === '/hesapla' ? styles.active : ''}`}
          >
            Hesaplayıcı
          </Link>
          <Link
            href="/asistan"
            className={`${styles.navLink} ${pathname === '/asistan' ? styles.active : ''}`}
            style={{ color: 'var(--accent-500)', fontWeight: '600' }}
          >
            🌟 Bütçe Asistanı
          </Link>
          <Link
            href="/karsilastir"
            className={`${styles.navLink} ${pathname === '/karsilastir' ? styles.active : ''}`}
          >
            Karşılaştır
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              aria-label="Temayı Değiştir"
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          )}
          <Link href="/hesapla" className={`btn btn-primary ${styles.cta}`}>
            <span>Hesapla</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
