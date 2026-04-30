'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/hesapla', label: 'Hesaplayıcı' },
    { href: '/asistan', label: 'Bütçe Asistanı', highlight: true },
    { href: '/karsilastir', label: 'Karşılaştır' },
  ];

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="8" width="20" height="10" rx="3" stroke="url(#logo-grad)" strokeWidth="1.5"/>
                <circle cx="7" cy="18" r="2" stroke="url(#logo-grad)" strokeWidth="1.5"/>
                <circle cx="17" cy="18" r="2" stroke="url(#logo-grad)" strokeWidth="1.5"/>
                <path d="M5 8L7 4H17L19 8" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="logo-grad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60a5fa"/>
                    <stop offset="1" stopColor="#3b82f6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className={styles.logoType}>
              Gaz<span className={styles.logoAccent}>Bilir</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            {navLinks.map(({ href, label, highlight }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}
                style={highlight ? { color: 'var(--accent-400)', fontWeight: 600 } : undefined}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className={styles.actions}>
            {mounted && (
              <button
                className={styles.themeBtn}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Temayı Değiştir"
              >
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                )}
              </button>
            )}

            <Link href="/hesapla" className={`btn btn-primary ${styles.cta}`}>
              <span>Hesapla</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>

            <button
              className={styles.menuBtn}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              <span className={styles.menuBar} style={mobileOpen ? { transform: 'rotate(45deg) translate(4px, 4px)' } : undefined} />
              <span className={styles.menuBar} style={mobileOpen ? { opacity: 0 } : undefined} />
              <span className={styles.menuBar} style={mobileOpen ? { transform: 'rotate(-45deg) translate(4px, -4px)' } : undefined} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className={`${styles.mobileNav} ${mobileOpen ? styles.open : ''}`}>
        {navLinks.map(({ href, label, highlight }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.mobileNavLink} ${pathname === href ? styles.active : ''}`}
            style={highlight ? { color: 'var(--accent-400)' } : undefined}
          >
            {label}
          </Link>
        ))}
        <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/hesapla" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Hesapla →
          </Link>
        </div>
      </div>
    </>
  );
}
