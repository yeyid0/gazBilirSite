import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.divider}>
        <div className={styles.dividerLine}/>
      </div>
      <div className={`container ${styles.inner}`}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            araba<span className={styles.accent}>sepeti</span>
          </Link>
          <p className={styles.desc}>
            Aracınızın gerçek maliyetini şeffaf ve detaylı şekilde hesaplayın.
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.col}>
            <span className={styles.colTitle}>Araçlar</span>
            <Link href="/hesapla" className={styles.link}>Maliyet Hesapla</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Markalar</span>
            <Link href="/toyota" className={styles.link}>Toyota</Link>
            <Link href="/volkswagen" className={styles.link}>Volkswagen</Link>
            <Link href="/fiat" className={styles.link}>Fiat</Link>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span className={styles.copy}>© {new Date().getFullYear()} arabasepeti</span>
        <span className={styles.disclaimer}>Hesaplamalar tahminidir.</span>
      </div>
    </footer>
  );
}
