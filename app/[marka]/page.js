import Link from 'next/link';
import { notFound } from 'next/navigation';
import vehiclesData from '@/data/vehicles.json';
import AdSlot from '@/components/AdSlot/AdSlot';
import styles from './page.module.css';

export async function generateStaticParams() {
  return Object.keys(vehiclesData.brands).map((marka) => ({ marka }));
}

export async function generateMetadata({ params }) {
  const { marka } = await params;
  const brand = vehiclesData.brands[marka];
  if (!brand) return {};
  return {
    title: `${brand.name} Araç Masrafları — Aylık & Yıllık Maliyet`,
    description: `${brand.name} araçlarının yakıt, MTV, sigorta, bakım masraflarını hesaplayın. ${Object.keys(brand.models).length} model için detaylı maliyet analizi.`,
  };
}

export default async function MarkaPage({ params }) {
  const { marka } = await params;
  const brand = vehiclesData.brands[marka];
  if (!brand) notFound();

  const models = Object.entries(brand.models);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.crumbLink}>Ana Sayfa</Link>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbCurrent}>{brand.name}</span>
        </div>

        <div className={styles.header}>
          <h1 className={`${styles.title} font-display anim-fade-up`}>
            {brand.name}
          </h1>
          <p className={`${styles.subtitle} anim-fade-up d1`}>
            {brand.name} marka araçların aylık ve yıllık maliyet analizi. {models.length} model mevcut.
          </p>
        </div>

        <AdSlot format="horizontal" />

        <div className={`${styles.grid} anim-fade-up d2`}>
          {models.map(([slug, model]) => {
            const latestYear = Object.keys(model.years).sort((a, b) => b - a)[0];
            const data = model.years[latestYear];

            return (
              <Link key={slug} href="/hesapla" className={styles.card} id={`model-${slug}`}>
                <div className={styles.cardTop}>
                  <h2 className={`${styles.modelName} font-display`}>{model.name}</h2>
                  <span className={styles.segment}>{model.segment}</span>
                </div>

                <div className={styles.specs}>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Motor</span>
                    <span className={styles.specVal}>{data.engineCC} cc</span>
                  </div>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Yakıt</span>
                    <span className={styles.specVal}>{data.fuelTypes.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</span>
                  </div>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Tüketim</span>
                    <span className={styles.specVal}>{Object.values(data.consumption)[0]} L/100km</span>
                  </div>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Yıllar</span>
                    <span className={styles.specVal}>{Object.keys(model.years).length} model</span>
                  </div>
                </div>

                <div className={styles.cardCta}>
                  <span>Maliyeti Hesapla</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
