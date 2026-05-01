'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { calculateTotalCost, formatCurrency } from '@/lib/calculator';
import { YAKIT_TURLERI, VARSAYILAN_AYLIK_KM } from '@/lib/constants';
import AdSlot from '@/components/AdSlot/AdSlot';
import BrandLogo from '@/components/BrandLogo/BrandLogo';
import styles from './page.module.css';

export default function AsistanClient({ initialVehicles }) {
  const [budget, setBudget] = useState(15000);
  const [fuelFilter, setFuelFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [isCalculating, setIsCalculating] = useState(true);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      let filtered = initialVehicles;

      if (fuelFilter !== 'all') {
        filtered = filtered.filter(v => v.fuel === fuelFilter);
      }

      if (segmentFilter !== 'all') {
        filtered = filtered.filter(v => {
          if (segmentFilter === 'SUV') return v.segment.includes('SUV');
          if (segmentFilter === 'Sedan') return ['C', 'D', 'E'].includes(v.segment) && !v.segment.includes('SUV');
          if (segmentFilter === 'Hatchback') return ['A', 'B', 'C'].includes(v.segment) && !v.segment.includes('SUV');
          return true;
        });
      }

      const calculated = filtered.map(v => {
        const cost = calculateTotalCost({
          monthlyKm: VARSAYILAN_AYLIK_KM,
          consumption: v.consumption,
          fuelType: v.fuel,
          engineCC: v.engineCC,
          vehicleYear: parseInt(v.year),
          segment: v.segment,
          overrides: {},
        });
        return { ...v, totalMonthly: cost.total.monthly, totalYearly: cost.total.yearly };
      });

      const withinBudget = calculated
        .filter(v => v.totalMonthly <= budget)
        .sort((a, b) => b.totalMonthly - a.totalMonthly);

      setResults(withinBudget.slice(0, 20));
      setIsCalculating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [budget, fuelFilter, segmentFilter, initialVehicles]);

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Bütçeme Göre Araç</h1>
          <p className={styles.subtitle}>
            Aylık ayırabileceğiniz maksimum bütçeyi belirleyin, size en uygun (vergisi, yakıtı ve bakımı bütçenizi aşmayacak) araçları bulalım.
          </p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.filterCard}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  Aylık Bütçeniz
                  <span className={styles.budgetVal}>{formatCurrency(budget)}</span>
                </label>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className={styles.slider}
                />
                <div className={styles.sliderMarks}>
                  <span>2.000₺</span>
                  <span>50.000₺</span>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Yakıt Tipi</label>
                <select className="form-select" value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
                  <option value="all">Tümü</option>
                  {Object.entries(YAKIT_TURLERI).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Kasa Tipi</label>
                <select className="form-select" value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}>
                  <option value="all">Tümü</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <AdSlot format="square" />
            </div>
          </aside>

          <main className={styles.main}>
            <div className={styles.resultsHeader}>
              <h2 className={styles.resultsTitle}>Sizin İçin Uygun Araçlar</h2>
              <span className={styles.resultsCount}>
                {isCalculating ? 'Hesaplanıyor...' : `${results.length} araç bulundu`}
              </span>
            </div>

            {isCalculating ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <p>Veritabanındaki araçların kasko, vergi ve yakıtları hesaplanıyor...</p>
              </div>
            ) : results.length > 0 ? (
              <div className={styles.grid}>
                {results.map((car, idx) => (
                  <Link
                    key={`${car.brandKey}-${car.modelKey}-${car.fuel}`}
                    href={`/sonuc?marka=${car.brandKey}&model=${car.modelKey}&yil=${car.year}&yakit=${car.fuel}&km=${VARSAYILAN_AYLIK_KM}`}
                    className={styles.carCard}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className={styles.cardSilhouette} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrandLogo brandKey={car.brandKey} brandName={car.brandName} size={80} />
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardHead}>
                        <h3 className={styles.carName}>{car.brandName} {car.modelName}</h3>
                        <span className={styles.carYear}>{car.year}</span>
                      </div>
                      <div className={styles.carMeta}>
                        <span className={styles.metaBadge}>{YAKIT_TURLERI[car.fuel]}</span>
                        <span className={styles.metaBadge}>{car.segment}</span>
                      </div>
                      <div className={styles.cardCost}>
                        <span className={styles.costLabel}>Aylık Toplam Maliyet</span>
                        <span className={styles.costVal}>{formatCurrency(car.totalMonthly)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>Araç Bulunamadı</h3>
                <p>Bu bütçe ve kriterlere uygun bir araç bulamadık. Bütçeyi artırmayı deneyin.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
