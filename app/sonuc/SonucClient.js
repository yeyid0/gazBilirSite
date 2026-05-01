'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { calculateTotalCost, formatCurrency, formatNumber, calculateProjection } from '@/lib/calculator';
import { MALIYET_KALEMLERI, YAKIT_TURLERI } from '@/lib/constants';
import AdSlot from '@/components/AdSlot/AdSlot';
import BrandLogo from '@/components/BrandLogo/BrandLogo';
import Tooltip from '@/components/Tooltip/Tooltip';
import ExportReport from '@/components/ExportReport/ExportReport';
import CostChart from '@/components/CostChart/CostChart';
import styles from './page.module.css';

const COLORS = {
  yakit: '#2563eb',
  kasko: '#3b82f6',
  sigorta: '#60a5fa',
  mtv: '#4f46e5',
  bakim: '#6366f1',
  muayene: '#8b5cf6',
};

const EDITABLE_ITEMS = {
  yakit: true,
  kasko: true,
  sigorta: true,
  bakim: true,
  mtv: false,
  muayene: false,
};

export default function SonucClient({
  marka, model, varyant, yil, yakit, km,
  initialOverrides,
  vehicleData, vehicleSpecs,
  brandName, modelName, variantName, segment, shortReview,
  fuelPricesData, insuranceRatesData, mtvRatesData,
}) {
  const [anim, setAnim] = useState({});
  const [view, setView] = useState('monthly');
  const [isExporting, setIsExporting] = useState(false);
  const [projectionData, setProjectionData] = useState([]);
  const [overrides, setOverrides] = useState(initialOverrides);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editValue2, setEditValue2] = useState('');

  const fullName = `${brandName} ${modelName} ${variantName}`.trim();

  const result = useMemo(() => {
    if (!vehicleData || !yakit) return null;
    return calculateTotalCost({
      monthlyKm: km,
      consumption: vehicleData.consumption[yakit],
      fuelType: yakit,
      engineCC: vehicleData.engineCC,
      vehicleYear: Number(yil),
      segment,
      overrides,
    });
  }, [vehicleData, yakit, km, yil, segment, overrides]);

  useEffect(() => {
    if (result?.total?.yearly) {
      setProjectionData(calculateProjection(result.total.yearly));
    }
  }, [result]);

  const baseResult = useMemo(() => {
    if (!vehicleData || !yakit) return null;
    return calculateTotalCost({
      monthlyKm: km,
      consumption: vehicleData.consumption[yakit],
      fuelType: yakit,
      engineCC: vehicleData.engineCC,
      vehicleYear: Number(yil),
      segment,
      overrides: {},
    });
  }, [vehicleData, yakit, km, yil, segment]);

  useEffect(() => {
    if (!result) return;
    const dur = 800;
    const steps = 24;
    const iv = dur / steps;
    let s = 0;
    const t = setInterval(() => {
      s++;
      const p = 1 - Math.pow(1 - s / steps, 3);
      const a = {};
      Object.entries(result.breakdown).forEach(([k, v]) => {
        a[k] = { monthly: Math.round(v.monthly * p), yearly: Math.round(v.yearly * p) };
      });
      a.total = { monthly: Math.round(result.total.monthly * p), yearly: Math.round(result.total.yearly * p) };
      setAnim(a);
      if (s >= steps) clearInterval(t);
    }, iv);
    return () => clearInterval(t);
  }, [result]);

  const handleEditClick = (key) => {
    setEditingKey(key);
    if (key === 'yakit') {
      const pKey = yakit === 'hibrit' ? 'benzin' : yakit;
      setEditValue(overrides.yakitFiyat || fuelPricesData.prices[pKey] || fuelPricesData.prices.benzin);
      setEditValue2(overrides.yakitTuketim || vehicleData.consumption[yakit]);
    } else {
      setEditValue(overrides[key] || baseResult.breakdown[key].yearly);
    }
  };

  const handleEditSave = (key) => {
    const newOverrides = { ...overrides };
    if (key === 'yakit') {
      const v1 = parseFloat(editValue);
      const v2 = parseFloat(editValue2);
      if (v1 > 0) newOverrides.yakitFiyat = v1;
      if (v2 > 0) newOverrides.yakitTuketim = v2;
    } else {
      const v = parseFloat(editValue);
      if (v >= 0) newOverrides[key] = v;
    }
    setOverrides(newOverrides);
    setEditingKey(null);
  };

  const handleEditCancel = () => setEditingKey(null);

  const handleResetOverride = (key) => {
    const newOverrides = { ...overrides };
    if (key === 'yakit') {
      delete newOverrides.yakitFiyat;
      delete newOverrides.yakitTuketim;
    } else {
      delete newOverrides[key];
    }
    setOverrides(newOverrides);
    setEditingKey(null);
  };

  if (!vehicleData || !result) {
    return (
      <div className={styles.error}>
        <div className="container" style={{ textAlign: 'center', padding: '8rem 0' }}>
          <h1 className="font-display" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--sp-4)' }}>Araç bulunamadı</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>Lütfen hesaplayıcıya geri dönün.</p>
          <Link href="/hesapla" className="btn btn-primary">Geri Dön</Link>
        </div>
      </div>
    );
  }

  const v = Object.keys(anim).length > 0 ? anim : { ...result.breakdown, total: result.total };

  const chartItems = MALIYET_KALEMLERI.map((item) => ({
    ...item,
    value: result.breakdown[item.key]?.yearly || 0,
    color: COLORS[item.key],
  })).filter(d => d.value > 0);

  const chartTotal = chartItems.reduce((s, d) => s + d.value, 0);
  const slices = chartItems.map((d, i) => {
    const precedingSum = chartItems.slice(0, i).reduce((s, item) => s + item.value, 0);
    const startAngle = (precedingSum / chartTotal) * 360;
    const angle = (d.value / chartTotal) * 360;
    const endAngle = startAngle + angle;
    const r = 90;
    const cx = 120, cy = 120;
    const sr = (startAngle - 90) * Math.PI / 180;
    const er = (endAngle - 90) * Math.PI / 180;
    const la = angle > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(sr);
    const y1 = cy + r * Math.sin(sr);
    const x2 = cx + r * Math.cos(er);
    const y2 = cy + r * Math.sin(er);
    const ir = 55;
    const ix1 = cx + ir * Math.cos(er);
    const iy1 = cy + ir * Math.sin(er);
    const ix2 = cx + ir * Math.cos(sr);
    const iy2 = cy + ir * Math.sin(sr);
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${la} 0 ${ix2} ${iy2} Z`;
    return { ...d, path, pct: ((d.value / chartTotal) * 100).toFixed(1) };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${fullName} ${yil} Yıllık Sahiplik Maliyeti — ${formatCurrency(result.total.yearly)}`,
    description: `GazBilir ile hesaplanan ${fullName} ${yil} ${YAKIT_TURLERI[yakit]} aracının Türkiye'de tahmini yıllık toplam sahiplik maliyeti: ${formatCurrency(result.total.yearly)}.`,
    author: { '@type': 'Organization', name: 'GazBilir' },
    publisher: { '@type': 'Organization', name: 'GazBilir' },
    dateModified: new Date().toISOString(),
  };

  return (
    <div className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.glow} />
      <div className="container">
        <div className={`${styles.header} anim-fade-up`}>
          <Link href="/hesapla" className={styles.back}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Yeni hesaplama
          </Link>
          <div className={styles.vehicle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 className={`${styles.vehicleName} font-display`}>{fullName}</h1>
                <div className={styles.vehicleMeta}>
                  <span className={styles.tag}>{yil}</span>
                  <span className={styles.tag}>{YAKIT_TURLERI[yakit]}</span>
                  <span className={styles.tag}>{km.toLocaleString('tr-TR')} km/ay</span>
                </div>
              </div>
              <BrandLogo brandKey={marka} brandName={brandName} size={140} />
            </div>
            {shortReview && (
              <p style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-subtle)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {shortReview}
              </p>
            )}
          </div>
        </div>

        <div className={`${styles.statsContainer} anim-fade-up d1`}>
          <div className={styles.stats}>
            {vehicleSpecs && (
              <>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⚖️</div>
                  <div className={styles.statValue}>{vehicleSpecs.weightKg} kg</div>
                  <div className={styles.statLabel}>Ağırlık</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🧳</div>
                  <div className={styles.statValue}>{vehicleSpecs.trunkLiters} L</div>
                  <div className={styles.statLabel}>Bagaj</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⛽</div>
                  <div className={styles.statValue}>{vehicleSpecs.tankLiters > 0 ? `${vehicleSpecs.tankLiters} L` : '-'}</div>
                  <div className={styles.statLabel}>Depo</div>
                </div>
              </>
            )}
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔥</div>
              <div className={styles.statValue}>{vehicleData.hp?.[yakit] || '-'} HP</div>
              <div className={styles.statLabel}>Motor Gücü</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⚙️</div>
              <div className={styles.statValue}>{vehicleData.engineCC || '-'} cc</div>
              <div className={styles.statLabel}>Motor Hacmi</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📉</div>
              <div className={styles.statValue}>{overrides.yakitTuketim || vehicleData.consumption[yakit]} L</div>
              <div className={styles.statLabel}>Tüketim (L/100km)</div>
            </div>
            {vehicleData.performance?.[yakit] && (
              <>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>⏱️</div>
                  <div className={styles.statValue}>{vehicleData.performance[yakit].zeroTo100} s</div>
                  <div className={styles.statLabel}>0-100 km/s</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>🏎️</div>
                  <div className={styles.statValue}>{vehicleData.performance[yakit].maxSpeed} km/s</div>
                  <div className={styles.statLabel}>Maks. Hız</div>
                </div>
              </>
            )}
          </div>
        </div>

        <div id="export-container" style={{ padding: '10px 0' }}>
          <div className={`${styles.totalSection} anim-fade-up d1`}>
            <div className={styles.totalCard}>
              <div className={styles.toggle}>
                <button className={`${styles.togBtn} ${view === 'monthly' ? styles.togActive : ''}`} onClick={() => setView('monthly')}>Aylık</button>
                <button className={`${styles.togBtn} ${view === 'yearly' ? styles.togActive : ''}`} onClick={() => setView('yearly')}>Yıllık</button>
              </div>
              <div className={styles.totalInner}>
                <span className={styles.totalLabel}>TOPLAM MALİYET</span>
                <span className={`${styles.totalAmount} font-display`}>
                  {formatCurrency(v.total?.[view] || 0)}
                </span>
                <span className={styles.totalPer}>
                  {view === 'monthly' ? 'aylık' : 'yıllık'} tahmini
                </span>
              </div>
              {view === 'monthly' && (
                <span className={styles.dailyHint}>
                  ≈ Günlük {formatCurrency(Math.round((v.total?.monthly || 0) / 30))}
                </span>
              )}
            </div>
          </div>

          <AdSlot format="horizontal" />

          <div className={styles.content}>
            <div className={`${styles.chartWrap} anim-fade-up d2`}>
              <div className={styles.chart}>
                <svg viewBox="0 0 240 240" className={styles.donut}>
                  {slices.map((s) => (
                    <path key={s.key} d={s.path} fill={s.color} className={styles.slice}>
                      <title>{s.label}: %{s.pct}</title>
                    </path>
                  ))}
                </svg>
                <div className={styles.chartCenter}>
                  <span className={styles.chartCenterNum}>6</span>
                  <span className={styles.chartCenterLabel}>kalem</span>
                </div>
              </div>
              <div className={styles.legend}>
                {slices.map((s) => (
                  <div key={s.key} className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ background: s.color }} />
                    <span className={styles.legendName}>{s.label}</span>
                    <span className={styles.legendPct}>%{s.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.breakdown}>
              {MALIYET_KALEMLERI.map((item, i) => {
                const val = v[item.key];
                if (!val) return null;
                const isEditable = EDITABLE_ITEMS[item.key];
                const isOverridden = item.key === 'yakit'
                  ? (overrides.yakitFiyat !== undefined || overrides.yakitTuketim !== undefined)
                  : overrides[item.key] !== undefined;
                const isEditing = editingKey === item.key;
                const color = COLORS[item.key];

                return (
                  <div key={item.key} className={`${styles.costRow} anim-fade-up d${i + 2} ${isOverridden ? styles.costRowOverridden : ''}`}>
                    <div className={styles.costMainInfo}>
                      <div className={styles.costLeft}>
                        <div className={styles.costDot} style={{ background: color, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <div className={styles.costInfo}>
                          <span className={styles.costIcon}>{item.icon}</span>
                          <div className={styles.costNameWrap}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span className={styles.costName}>{item.label}</span>
                              <Tooltip content={
                                item.key === 'mtv' ? `${vehicleData.engineCC}cc motor hacmi ve ${2026 - Number(yil)} yaş aralığına göre GİB 2026 tarifesidir.` :
                                item.key === 'yakit' ? `${overrides.yakitTuketim || vehicleData.consumption[yakit]} L/100km tüketim ve güncel fiyatlara göre hesaplanmıştır.` :
                                item.key === 'sigorta' ? `${segment} segmenti araçlar için Türkiye geneli güncel zorunlu trafik poliçesi ortalamasıdır.` :
                                item.key === 'kasko' ? `${segment} segmenti için piyasa kasko ortalamasıdır. Hasarsızlık indirimi dahil değildir.` :
                                item.key === 'bakim' ? `10.000 veya 15.000 km periyodik özel/yetkili servis bakım maliyeti ortalamasıdır.` :
                                item.key === 'muayene' ? `TÜVTÜRK binek araç periyodik muayene ücretidir (2 yılda bir ödendiği için yarısı alınmıştır).` : ''
                              } />
                            </div>
                            {isOverridden && <span className={styles.overrideBadge}>Özelleştirilmiş</span>}
                          </div>
                        </div>
                      </div>
                      <div className={styles.costRight}>
                        {!isEditing && (
                          <>
                            <div className={styles.valWrap}>
                              <span className={styles.costVal} style={{ color }}>
                                {formatCurrency(val[view])}
                              </span>
                              {isEditable && (
                                <button className={styles.editBtn} onClick={() => handleEditClick(item.key)} title="Düzenle">
                                  ✏️
                                </button>
                              )}
                            </div>
                            <span className={styles.costAlt}>
                              {view === 'monthly' ? `${formatCurrency(val.yearly)}/yıl` : `${formatCurrency(val.monthly)}/ay`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditing && (
                      <div className={styles.editForm}>
                        {item.key === 'yakit' ? (
                          <div className={styles.editGrid2}>
                            <div className="form-group">
                              <label className="form-label">Yakıt Fiyatı (TL/L)</label>
                              <input type="number" className="form-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} step="0.01" />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Tüketim (L/100km)</label>
                              <input type="number" className="form-input" value={editValue2} onChange={(e) => setEditValue2(e.target.value)} step="0.1" />
                            </div>
                          </div>
                        ) : (
                          <div className="form-group">
                            <label className="form-label">Yıllık Tutar (TL)</label>
                            <input type="number" className="form-input" value={editValue} onChange={(e) => setEditValue(e.target.value)} step="100" />
                          </div>
                        )}
                        <div className={styles.editActions}>
                          <button className="btn btn-primary" onClick={() => handleEditSave(item.key)}>Kaydet</button>
                          <button className="btn btn-ghost" onClick={handleEditCancel}>İptal</button>
                          {isOverridden && (
                            <button className={`btn btn-ghost ${styles.resetBtn}`} onClick={() => handleResetOverride(item.key)}>
                              Ortalamaya Dön
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {projectionData.length > 0 && (
          <div className="anim-fade-up d7" style={{ marginTop: 'var(--sp-8)' }}>
            <CostChart data={projectionData} />
          </div>
        )}

        <div className={`${styles.dataSources} anim-fade-up d8`}>
          <h3 className={styles.dataSourcesTitle}>Veri Kaynakları & Gerçeklik Payı</h3>
          <div className={styles.sourcesGrid}>
            <div className={styles.sourceItem}>
              <span className={styles.sourceLabel}>Yakıt Tüketimi:</span>
              <span className={styles.sourceVal}>Gerçek Kullanıcı Ortalamaları (Fabrika verisine göre +%15-25 yol/trafik payı eklenmiştir)</span>
            </div>
            <div className={styles.sourceItem}>
              <span className={styles.sourceLabel}>Yakıt Fiyatı:</span>
              <span className={styles.sourceVal}>{fuelPricesData.source} (Güncel: {fuelPricesData.lastUpdated})</span>
            </div>
            <div className={styles.sourceItem}>
              <span className={styles.sourceLabel}>MTV:</span>
              <span className={styles.sourceVal}>{mtvRatesData.source} ({mtvRatesData.year})</span>
            </div>
            <div className={styles.sourceItem}>
              <span className={styles.sourceLabel}>Sigorta/Kasko:</span>
              <span className={styles.sourceVal}>{insuranceRatesData.source}</span>
            </div>
          </div>
          <p className={styles.sourcesNote}>
            Fiyatlar ve tüketimler laboratuvar ortamı değil, Türkiye yol/trafik koşullarındaki gerçek kullanıcı verilerine (Forumlar, Spritmonitor vb.) göre hesaplanmıştır.
            <strong> Yanlarındaki ✏️ ikonuna tıklayarak tutarları kendi aracınıza göre özelleştirebilirsiniz.</strong>
          </p>
        </div>

        <AdSlot format="horizontal" />

        <div className={`${styles.bottomCta} anim-fade-up d8`} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/hesapla" className="btn btn-ghost btn-lg">
            Farklı Araç Hesapla
          </Link>
          <Link
            href={`/karsilastir?aMarka=${marka}&aModel=${model}&aYil=${yil}&aYakit=${yakit}&km=${km}`}
            className="btn btn-primary btn-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            Bu Araçla Karşılaştır
          </Link>
          <ExportReport targetId="export-container" filename={`${brandName}-${modelName}-maliyet-raporu`} />
        </div>
      </div>
    </div>
  );
}
