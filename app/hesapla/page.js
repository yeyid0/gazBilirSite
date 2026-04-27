'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import vehiclesData from '@/data/vehicles.json';
import { YAKIT_TURLERI, VARSAYILAN_AYLIK_KM } from '@/lib/constants';
import AdSlot from '@/components/AdSlot/AdSlot';
import styles from './page.module.css';

export default function HesaplaPage() {
  const router = useRouter();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState('');
  const [fuel, setFuel] = useState('');
  const [km, setKm] = useState(VARSAYILAN_AYLIK_KM);

  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customKasko, setCustomKasko] = useState('');
  const [customSigorta, setCustomSigorta] = useState('');
  const [customBakim, setCustomBakim] = useState('');
  const [customYakitFiyat, setCustomYakitFiyat] = useState('');
  const [customTuketim, setCustomTuketim] = useState('');

  const brands = useMemo(() => Object.entries(vehiclesData.brands), []);

  const models = useMemo(() => {
    if (!brand) return [];
    return Object.entries(vehiclesData.brands[brand]?.models || {});
  }, [brand]);

  const variants = useMemo(() => {
    if (!brand || !model) return [];
    return Object.entries(vehiclesData.brands[brand]?.models[model]?.variants || {});
  }, [brand, model]);

  const hasVariants = variants.length > 0;

  const years = useMemo(() => {
    if (!brand || !model) return [];
    const m = vehiclesData.brands[brand]?.models[model];
    if (!m) return [];
    if (hasVariants) {
      if (!variant) return [];
      return Object.keys(m.variants[variant]?.years || {}).sort((a, b) => b - a);
    }
    return Object.keys(m.years || {}).sort((a, b) => b - a);
  }, [brand, model, variant, hasVariants]);

  const fuelTypes = useMemo(() => {
    if (!brand || !model || !year) return [];
    const m = vehiclesData.brands[brand]?.models[model];
    if (!m) return [];
    if (hasVariants) {
      if (!variant) return [];
      return m.variants[variant]?.years[year]?.fuelTypes || [];
    }
    return m.years[year]?.fuelTypes || [];
  }, [brand, model, year, variant, hasVariants]);

  const handleBrand = useCallback((e) => { setBrand(e.target.value); setModel(''); setVariant(''); setYear(''); setFuel(''); }, []);
  const handleModel = useCallback((e) => { setModel(e.target.value); setVariant(''); setYear(''); setFuel(''); }, []);
  const handleVariant = useCallback((e) => { setVariant(e.target.value); setYear(''); setFuel(''); }, []);
  const handleYear = useCallback((e) => { setYear(e.target.value); setFuel(''); }, []);
  const handleFuel = useCallback((e) => { setFuel(e.target.value); }, []);

  const isValid = brand && model && (!hasVariants || variant) && year && fuel && km > 0;

  const selectedVehicle = brand && model && year && fuel ? {
    brand: vehiclesData.brands[brand]?.name,
    model: vehiclesData.brands[brand]?.models[model]?.name,
    variant: variant ? vehiclesData.brands[brand]?.models[model]?.variants[variant]?.name : null,
    year,
    fuel: YAKIT_TURLERI[fuel],
    consumption: hasVariants 
      ? vehiclesData.brands[brand]?.models[model]?.variants[variant]?.years[year]?.consumption[fuel]
      : vehiclesData.brands[brand]?.models[model]?.years[year]?.consumption[fuel],
  } : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    
    const params = new URLSearchParams({ marka: brand, model, yil: year, yakit: fuel, km: km.toString() });
    if (variant) params.append('varyant', variant);
    
    // Add advanced options if present
    if (customKasko) params.append('kasko', customKasko);
    if (customSigorta) params.append('sigorta', customSigorta);
    if (customBakim) params.append('bakim', customBakim);
    if (customYakitFiyat) params.append('yakitFiyat', customYakitFiyat);
    if (customTuketim) params.append('yakitTuketim', customTuketim);

    router.push(`/sonuc?${params.toString()}`);
  };

  const presets = [500, 1000, 1500, 2000, 3000];

  // Steps with numbering
  const steps = [
    { num: '01', label: 'Araç Seçimi', desc: 'Marka ve model belirleyin' },
    { num: '02', label: 'Detaylar', desc: 'Yıl ve yakıt türü seçin' },
    { num: '03', label: 'Kullanım', desc: 'Aylık ortalama km girin' },
  ];

  return (
    <div className={styles.page}>
      {/* Ambient */}
      <div className={styles.glow} />

      <div className="container">
        <div className={styles.layout}>
          {/* Left side — steps indicator */}
          <div className={styles.sidebar}>
            <div className={styles.steps}>
              {steps.map((s, i) => {
                const isActive = i === 0 ? true : i === 1 ? !!model : !!year;
                return (
                  <div key={s.num} className={`${styles.step} ${isActive ? styles.stepActive : ''}`}>
                    <span className={styles.stepNum}>{s.num}</span>
                    <div className={styles.stepInfo}>
                      <span className={styles.stepLabel}>{s.label}</span>
                      <span className={styles.stepDesc}>{s.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side — form */}
          <div className={styles.formArea}>
            <div className={styles.formHeader}>
              <h1 className={`${styles.title} font-display anim-fade-up`}>
                Maliyet Hesapla
              </h1>
              <p className={`${styles.subtitle} anim-fade-up d1`}>
                Aracınızı seçin, sonuçları anında görün.
              </p>
            </div>

            <form onSubmit={handleSubmit} className={`${styles.form} anim-fade-up d2`}>
              {/* Row 1: Brand + Model */}
              <div className={styles.row}>
                <div className="form-group">
                  <label htmlFor="brand" className="form-label">Marka</label>
                  <select id="brand" className="form-select" value={brand} onChange={handleBrand}>
                    <option value="">Seçin</option>
                    {brands.map(([s, b]) => <option key={s} value={s}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="model" className="form-label">Model</label>
                  <select id="model" className="form-select" value={model} onChange={handleModel} disabled={!brand}>
                    <option value="">{brand ? 'Seçin' : '—'}</option>
                    {models.map(([s, m]) => <option key={s} value={s}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Variant (if any) + Year */}
              <div className={styles.row}>
                {hasVariants ? (
                  <div className="form-group">
                    <label htmlFor="variant" className="form-label">Alt Model (Varyant)</label>
                    <select id="variant" className="form-select" value={variant} onChange={handleVariant} disabled={!model}>
                      <option value="">{model ? 'Seçin' : '—'}</option>
                      {variants.map(([s, v]) => <option key={s} value={s}>{v.name}</option>)}
                    </select>
                  </div>
                ) : null}
                <div className="form-group">
                  <label htmlFor="year" className="form-label">Model Yılı</label>
                  <select id="year" className="form-select" value={year} onChange={handleYear} disabled={hasVariants ? !variant : !model}>
                    <option value="">{(hasVariants ? variant : model) ? 'Seçin' : '—'}</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {!hasVariants && (
                  <div className="form-group">
                    <label htmlFor="fuel" className="form-label">Yakıt Türü</label>
                    <select id="fuel" className="form-select" value={fuel} onChange={handleFuel} disabled={!year}>
                      <option value="">{year ? 'Seçin' : '—'}</option>
                      {fuelTypes.map((f) => <option key={f} value={f}>{YAKIT_TURLERI[f]}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Row 3: Fuel (if variants existed, it shifts here) */}
              {hasVariants && (
                <div className={styles.row}>
                  <div className="form-group">
                    <label htmlFor="fuel" className="form-label">Yakıt Türü</label>
                    <select id="fuel" className="form-select" value={fuel} onChange={handleFuel} disabled={!year}>
                      <option value="">{year ? 'Seçin' : '—'}</option>
                      {fuelTypes.map((f) => <option key={f} value={f}>{YAKIT_TURLERI[f]}</option>)}
                    </select>
                  </div>
                  <div className="form-group"></div>
                </div>
              )}

              {/* KM */}
              <div className="form-group">
                <label htmlFor="km" className="form-label">Aylık Kilometre</label>
                <input
                  id="km"
                  type="number"
                  className="form-input"
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  min="100"
                  max="10000"
                  step="100"
                />
                <div className={styles.presets}>
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.preset} ${km === p ? styles.presetActive : ''}`}
                      onClick={() => setKm(p)}
                    >
                      {p.toLocaleString('tr-TR')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Options Accordion */}
              <div className={styles.advancedWrapper}>
                <button 
                  type="button" 
                  className={styles.advancedToggle}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span className={styles.advancedIcon}>{showAdvanced ? '−' : '+'}</span>
                  Gelişmiş Seçenekler (İsteğe Bağlı)
                </button>
                
                {showAdvanced && (
                  <div className={styles.advancedContent}>
                    <p className={styles.advancedHint}>Aşağıdaki alanları boş bırakırsanız sistem ortalama verileri kullanacaktır.</p>
                    
                    <div className={styles.row}>
                      <div className="form-group">
                        <label htmlFor="kasko" className="form-label">Kasko (Yıllık TL)</label>
                        <input id="kasko" type="number" className="form-input" value={customKasko} onChange={e => setCustomKasko(e.target.value)} placeholder="Örn: 25000" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="sigorta" className="form-label">Trafik Sigortası (Yıllık TL)</label>
                        <input id="sigorta" type="number" className="form-input" value={customSigorta} onChange={e => setCustomSigorta(e.target.value)} placeholder="Örn: 8000" />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className="form-group">
                        <label htmlFor="bakim" className="form-label">Periyodik Bakım (Yıllık TL)</label>
                        <input id="bakim" type="number" className="form-input" value={customBakim} onChange={e => setCustomBakim(e.target.value)} placeholder="Örn: 12000" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="yakitFiyat" className="form-label">Yakıt Fiyatı (TL/L)</label>
                        <input id="yakitFiyat" type="number" step="0.01" className="form-input" value={customYakitFiyat} onChange={e => setCustomYakitFiyat(e.target.value)} placeholder="Örn: 42.50" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="tuketim" className="form-label">Yakıt Tüketimi (L/100km)</label>
                      <input id="tuketim" type="number" step="0.1" className="form-input" value={customTuketim} onChange={e => setCustomTuketim(e.target.value)} placeholder={selectedVehicle ? `Varsayılan: ${selectedVehicle.consumption}` : "Örn: 6.5"} />
                    </div>
                  </div>
                )}
              </div>

              {/* Selection summary */}
              {selectedVehicle && (
                <div className={styles.summary}>
                  <div className={styles.summaryDot} />
                  <div className={styles.summaryText}>
                    <span className={styles.summaryMain}>
                      {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.variant ? selectedVehicle.variant : ''} {selectedVehicle.year}
                    </span>
                    <span className={styles.summarySub}>
                      {selectedVehicle.fuel} · {km.toLocaleString('tr-TR')} km/ay · {selectedVehicle.consumption} L/100km
                    </span>
                  </div>
                </div>
              )}

              {/* AdSlot */}
              <AdSlot format="horizontal" />

              {/* Submit */}
              <button
                type="submit"
                className={`btn btn-primary btn-lg ${styles.submit}`}
                id="calculate-btn"
                disabled={!isValid}
              >
                Maliyeti Hesapla
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
