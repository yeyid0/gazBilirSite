import Link from 'next/link';
import { notFound } from 'next/navigation';
import vehiclesData from '@/data/vehicles.json';
import AdSlot from '@/components/AdSlot/AdSlot';
import BrandLogo from '@/components/BrandLogo/BrandLogo';
import { getYearList, getYearData } from '@/lib/constants';
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

        <div className={styles.header} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', flexWrap: 'wrap' }}>
          <BrandLogo brandKey={marka} brandName={brand.name} size={96} />
          <div>
            <h1 className={`${styles.title} font-display anim-fade-up`}>
              {brand.name}
            </h1>
            <p className={`${styles.subtitle} anim-fade-up d1`}>
              {brand.name} marka araçların aylık ve yıllık maliyet analizi. {models.length} model mevcut.
            </p>
          </div>
        </div>

        <AdSlot format="horizontal" />

        <div className={`${styles.grid} anim-fade-up d2`}>
          {models.map(([slug, model]) => {
            const yearList = getYearList(model.years);
            const latestYear = yearList[0];
            const data = latestYear ? getYearData(model.years, latestYear) : null;
            if (!data) return null;

            const defaultFuel = data.fuelTypes[0];
            const queryParams = new URLSearchParams({
              marka,
              model: slug,
              yil: latestYear,
              yakit: defaultFuel,
              km: '1500',
            }).toString();

            return (
              <Link
                key={slug}
                href={`/sonuc?${queryParams}`}
                className={styles.card}
                id={`model-${slug}`}
              >
                <div className={styles.cardTop}>
                  <h2 className={`${styles.modelName} font-display`}>{model.name}</h2>
                  <span className={styles.segment}>{model.segment}</span>
                </div>

                {model.short_review && (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    margin: 'var(--sp-2) 0 var(--sp-3)',
                  }}>
                    {model.short_review}
                  </p>
                )}

                <div className={styles.specs}>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Motor</span>
                    <span className={styles.specVal}>{data.engineCC > 0 ? `${data.engineCC} cc` : 'Elektrik'}</span>
                  </div>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Yakıt</span>
                    <span className={styles.specVal}>{data.fuelTypes.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')}</span>
                  </div>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Tüketim</span>
                    <span className={styles.specVal}>{Object.values(data.consumption)[0]} {data.fuelTypes.includes('elektrik') ? 'kWh' : 'L'}/100km</span>
                  </div>
                  <div className={styles.spec}>
                    <span className={styles.specLabel}>Yıllar</span>
                    <span className={styles.specVal}>{yearList.length} yıl verisi</span>
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
