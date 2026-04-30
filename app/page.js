import Link from 'next/link';
import styles from './page.module.css';
import vehiclesData from '@/data/vehicles.json';
import AdSlot from '@/components/AdSlot/AdSlot';
import SmartSearch from '@/components/SmartSearch/SmartSearch';
import BrandLogo from '@/components/BrandLogo/BrandLogo';
import { calculateTotalCost, formatCurrency } from '@/lib/calculator';
import { getYearList, getYearData, YAKIT_TURLERI } from '@/lib/constants';

const FUEL_COLORS = { benzin: '#ff6b35', dizel: '#4ecdc4', lpg: '#45b7d1', hibrit: '#96ceb4', elektrik: '#a78bfa' };
const STANDARD_KM = 1500;

function getLeaderboard(limit = 5) {
  const entries = [];
  Object.entries(vehiclesData.brands).forEach(([brandSlug, brand]) => {
    Object.entries(brand.models).forEach(([modelSlug, model]) => {
      const process = (yearsObj, variantSlug, variantName) => {
        const latestYear = getYearList(yearsObj)[0];
        if (!latestYear) return;
        const yearData = getYearData(yearsObj, latestYear);
        if (!yearData) return;
        let best = null;
        yearData.fuelTypes.forEach(fuel => {
          const r = calculateTotalCost({ monthlyKm: STANDARD_KM, consumption: yearData.consumption[fuel], fuelType: fuel, engineCC: yearData.engineCC, vehicleYear: Number(latestYear), segment: model.segment });
          if (!best || r.total.yearly < best.yearly) best = { yearly: r.total.yearly, monthly: r.total.monthly, fuel };
        });
        if (best) entries.push({ brandSlug, modelSlug, variantSlug, brandName: brand.name, modelName: model.name, variantName, year: latestYear, ...best });
      };
      if (model.variants && Object.keys(model.variants).length > 0) {
        Object.entries(model.variants).forEach(([vs, vd]) => process(vd.years, vs, vd.name));
      } else {
        process(model.years, null, '');
      }
    });
  });
  return entries.sort((a, b) => a.yearly - b.yearly).slice(0, limit);
}

export default function HomePage() {
  const brands = Object.entries(vehiclesData.brands);
  const totalModels = brands.reduce((acc, [, b]) => acc + Object.keys(b.models).length, 0);
  const leaderboard = getLeaderboard(5);

  const features = [
    { icon: '⛽', title: 'Yakıt', desc: 'Benzin, dizel, LPG ve hibrit yakıt masrafı hesaplama' },
    { icon: '🏛️', title: 'MTV', desc: 'Motor hacmi ve araç yaşına göre vergi hesaplama' },
    { icon: '🛡️', title: 'Sigorta', desc: 'Zorunlu trafik sigortası tahmini' },
    { icon: '🔒', title: 'Kasko', desc: 'Segment bazlı kasko tahmini' },
    { icon: '🔧', title: 'Bakım', desc: 'Km\'ye göre periyodik bakım maliyeti' },
    { icon: '📋', title: 'Muayene', desc: 'Periyodik araç muayene ücreti' },
  ];

  return (
    <div className={styles.page}>
      {/* ===== Hero ===== */}
      <section className={styles.hero}>
        {/* Ambient light effects */}
        <div className={styles.heroGlow} />
        <div className={styles.heroGlow2} />
        <div className={styles.gridOverlay} />

        <div className={`container ${styles.heroContent}`}>
          <div className={`${styles.badge} anim-fade-up`}>
            <span className={styles.badgePulse} />
            <span>2026 Güncel Veriler</span>
          </div>

          <h1 className={`${styles.heroTitle} font-display anim-fade-up d1`}>
            Aracının Gerçek
            <br />
            <span className={styles.heroHighlight}>Maliyetini</span> Öğren
          </h1>

          <p className={`${styles.heroDesc} anim-fade-up d2`}>
            Yakıt, vergi, sigorta ve bakım giderlerini tek hesapla.
            <br />
            {brands.length} marka, {totalModels}+ model — saniyeler içinde.
          </p>

          <div className={`${styles.heroCta} anim-fade-up d3`}>
            <SmartSearch />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <Link href="/hesapla" className="btn btn-primary btn-xl" id="hero-cta">
                <span>Detaylı Hesapla</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/karsilastir" className="btn btn-ghost btn-xl">
                Karşılaştır
              </Link>
            </div>
            <span className={styles.ctaSub}>Ücretsiz • Kayıt gerektirmez • 23 marka</span>
          </div>

          {/* Stats row */}
          <div className={`${styles.statsRow} anim-fade-up d4`}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{brands.length}</span>
              <span className={styles.statLabel}>Marka</span>
            </div>
            <div className={styles.statDiv} />
            <div className={styles.stat}>
              <span className={styles.statNum}>{totalModels}+</span>
              <span className={styles.statLabel}>Model</span>
            </div>
            <div className={styles.statDiv} />
            <div className={styles.stat}>
              <span className={styles.statNum}>6</span>
              <span className={styles.statLabel}>Maliyet Kalemi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Leaderboard ===== */}
      <section className={styles.leaderboard}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>Sıra Tablosu</span>
            <h2 className={`${styles.sectionTitle} font-display`}>
              Piyasanın En Ekonomik Araçları
            </h2>
            <p className={styles.sectionDesc}>
              {STANDARD_KM.toLocaleString('tr-TR')} km/ay kullanıma göre toplam yıllık sahiplik maliyeti (yakıt · MTV · sigorta · kasko · bakım · muayene)
            </p>
          </div>

          <div className={styles.lbList}>
            {leaderboard.map((item, i) => {
              const params = new URLSearchParams({ marka: item.brandSlug, model: item.modelSlug, yil: item.year, yakit: item.fuel, km: String(STANDARD_KM) });
              if (item.variantSlug) params.append('varyant', item.variantSlug);
              const fuelColor = FUEL_COLORS[item.fuel] || '#fff';
              const isTop = i === 0;
              return (
                <Link key={`${item.brandSlug}-${item.modelSlug}-${item.variantSlug}-${item.fuel}`} href={`/sonuc?${params.toString()}`} className={`${styles.lbRow} ${isTop ? styles.lbRowTop : ''}`}>
                  <span className={styles.lbRank}>{String(i + 1).padStart(2, '0')}</span>
                  <div className={styles.lbInfo}>
                    <span className={styles.lbName}>
                      {item.brandName} <strong>{item.modelName}</strong>
                      {item.variantName ? <span className={styles.lbVariant}> {item.variantName}</span> : null}
                    </span>
                    <div className={styles.lbMeta}>
                      <span className={styles.lbYear}>{item.year}</span>
                      <span className={styles.lbFuel} style={{ color: fuelColor, borderColor: fuelColor + '44', background: fuelColor + '18' }}>
                        {YAKIT_TURLERI[item.fuel]}
                      </span>
                      {isTop && <span className={styles.lbBadge}>En Ekonomik</span>}
                    </div>
                  </div>
                  <div className={styles.lbCost}>
                    <span className={styles.lbYearly}>{formatCurrency(item.yearly)}<span className={styles.lbPer}>/yıl</span></span>
                    <span className={styles.lbMonthly}>{formatCurrency(item.monthly)}/ay</span>
                  </div>
                  <svg className={styles.lbArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              );
            })}
          </div>

          <div className={styles.lbFooter}>
            <Link href="/karsilastir" className="btn btn-ghost">
              Araçları Karşılaştır →
            </Link>
          </div>
        </div>
      </section>

      {/* AdSlot: Home Mid */}
      <div className="container">
        <AdSlot format="horizontal" />
      </div>

      {/* ===== Features ===== */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>Özellikler</span>
            <h2 className={`${styles.sectionTitle} font-display`}>
              Neler Hesaplanır?
            </h2>
            <p className={styles.sectionDesc}>
              Aracınızla ilgili tüm yıllık giderleri tek bir yerde görün.
            </p>
          </div>

          <div className={styles.featGrid}>
            {features.map((f, i) => (
              <div key={f.title} className={`card ${styles.featCard} anim-fade-up d${i + 1}`}>
                <div className={styles.featIcon}>
                  <span>{f.icon}</span>
                </div>
                <h3 className={styles.featTitle}>{f.title}</h3>
                <p className={styles.featDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Brands ===== */}
      <section className={styles.brands}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>Markalar</span>
            <h2 className={`${styles.sectionTitle} font-display`}>
              Desteklenen Markalar
            </h2>
          </div>

          <div className={styles.brandGrid}>
            {brands.map(([slug, brand]) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className={`${styles.brandItem}`}
                id={`brand-${slug}`}
              >
                <span className={styles.brandLogo}>
                  <BrandLogo brandKey={slug} brandName={brand.name} size={44} />
                </span>
                <span className={styles.brandName}>{brand.name}</span>
                <span className={styles.brandCount}>
                  {Object.keys(brand.models).length} model
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaBox}>
            <div className={styles.ctaGlow} />
            <h2 className={`${styles.ctaTitle} font-display`}>
              Hemen başla
            </h2>
            <p className={styles.ctaDesc}>
              30 saniyede aracının maliyetini öğren.
            </p>
            <Link href="/hesapla" className="btn btn-primary btn-lg">
              Ücretsiz Hesapla →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
