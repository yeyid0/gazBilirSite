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
            Gaz<span className={styles.accent}>Bilir</span>
          </Link>
          <p className={styles.desc}>
            Aracınızın gerçek maliyetini şeffaf ve detaylı şekilde hesaplayın.
          </p>
        </div>
        <div className={styles.right}>
          <div className={styles.col}>
            <span className={styles.colTitle}>Araçlar</span>
            <Link href="/hesapla" className={styles.link}>Maliyet Hesapla</Link>
            <Link href="/karsilastir" className={styles.link}>Karşılaştır</Link>
            <Link href="/asistan" className={styles.link}>Bütçe Asistanı</Link>
          </div>
          <div className={styles.col}>
            <span className={styles.colTitle}>Popüler Markalar</span>
            <Link href="/toyota" className={styles.link}>Toyota</Link>
            <Link href="/renault" className={styles.link}>Renault</Link>
            <Link href="/fiat" className={styles.link}>Fiat</Link>
            <Link href="/volkswagen" className={styles.link}>Volkswagen</Link>
            <Link href="/dacia" className={styles.link}>Dacia</Link>
            <Link href="/togg" className={styles.link}>Togg</Link>
          </div>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span className={styles.copy}>© {new Date().getFullYear()} GazBilir</span>
        <span className={styles.disclaimer}>Hesaplamalar tahminidir.</span>
      </div>
    </footer>
  );
}
