'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import vehiclesData from '@/data/vehicles.json';
import { calculateTotalCost, formatCurrency } from '@/lib/calculator';
import { MALIYET_KALEMLERI, YAKIT_TURLERI, VARSAYILAN_AYLIK_KM, getYearData, getYearList } from '@/lib/constants';
import AdSlot from '@/components/AdSlot/AdSlot';
import BrandLogo from '@/components/BrandLogo/BrandLogo';
import styles from './page.module.css';

const EMPTY = { brand: '', model: '', variant: '', year: '', fuel: '' };

function VehicleSelector({ id, label, selected, onChange, locked, overrides, onOverridesChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const brands = useMemo(() =>
    Object.entries(vehiclesData.brands).sort((a, b) => a[1].name.localeCompare(b[1].name, 'tr')), []);

  const models = useMemo(() => {
    if (!selected.brand) return [];
    return Object.entries(vehiclesData.brands[selected.brand]?.models || {})
      .sort((a, b) => a[1].name.localeCompare(b[1].name, 'tr'));
  }, [selected.brand]);

  const modelData = useMemo(() =>
    selected.brand && selected.model
      ? vehiclesData.brands[selected.brand]?.models[selected.model]
      : null,
  [selected.brand, selected.model]);

  const variants = useMemo(() => {
    if (!modelData?.variants) return [];
    return Object.entries(modelData.variants);
  }, [modelData]);

  const hasVariants = variants.length > 0;

  const years = useMemo(() => {
    if (!modelData) return [];
    if (hasVariants) {
      if (!selected.variant) return [];
      return getYearList(modelData.variants[selected.variant]?.years);
    }
    return getYearList(modelData.years);
  }, [modelData, hasVariants, selected.variant]);

  const fuelTypes = useMemo(() => {
    if (!modelData || !selected.year) return [];
    const yearsObj = hasVariants
      ? modelData.variants[selected.variant]?.years
      : modelData.years;
    return getYearData(yearsObj, selected.year)?.fuelTypes || [];
  }, [modelData, hasVariants, selected.variant, selected.year]);

  // Auto-select fuel when only one type is available
  useEffect(() => {
    if (fuelTypes.length === 1 && selected.fuel !== fuelTypes[0]) {
      onChange({ ...selected, fuel: fuelTypes[0] });
    }
    if (fuelTypes.length !== 1 && selected.fuel && !fuelTypes.includes(selected.fuel)) {
      onChange({ ...selected, fuel: '' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelTypes]);

  const isFullySelected = Boolean(
    selected.brand && selected.model &&
    (!hasVariants || selected.variant) &&
    selected.year && selected.fuel
  );
  const overrideCount = Object.keys(overrides).length;

  const handleOverride = (key, val) => {
    const next = { ...overrides };
    if (val === '' || val === null || val === undefined) {
      delete next[key];
    } else {
      next[key] = Number(val);
    }
    onOverridesChange(next);
  };

  return (
    <div className={`${styles.vehicleCol} ${locked ? styles.vehicleColLocked : ''}`}>
      <div className={styles.colHeader}>
        <div className={styles.colIcon}>{id}</div>
        <h2 className={styles.colTitle}>{label}</h2>
        {locked && (
          <span className={styles.lockedBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
            </svg>
            Seçili Araç
          </span>
        )}
      </div>

      <div className={styles.formGrid}>
        <div className="form-group">
          <label className="form-label">Marka</label>
          <select
            className="form-select"
            value={selected.brand}
            onChange={(e) => onChange({ ...EMPTY, brand: e.target.value })}
            disabled={locked}
          >
            <option value="">Seçin</option>
            {brands.map(([s, b]) => <option key={s} value={s}>{b.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Model</label>
          <select
            className="form-select"
            value={selected.model}
            onChange={(e) => onChange({ ...EMPTY, brand: selected.brand, model: e.target.value })}
            disabled={locked || !selected.brand}
          >
            <option value="">{selected.brand ? 'Seçin' : '—'}</option>
            {models.map(([s, m]) => <option key={s} value={s}>{m.name}</option>)}
          </select>
        </div>

        {/* Variant row — only shown when model has variants */}
        {hasVariants && (
          <div className="form-group">
            <label className="form-label">Alt Model (Varyant)</label>
            <select
              className="form-select"
              value={selected.variant}
              onChange={(e) => onChange({ ...EMPTY, brand: selected.brand, model: selected.model, variant: e.target.value })}
              disabled={locked || !selected.model}
            >
              <option value="">{selected.model ? 'Seçin' : '—'}</option>
              {variants.map(([s, v]) => <option key={s} value={s}>{v.name}</option>)}
            </select>
          </div>
        )}

        <div className={styles.row}>
          <div className="form-group">
            <label className="form-label">Yıl</label>
            <select
              className="form-select"
              value={selected.year}
              onChange={(e) => onChange({ ...selected, year: e.target.value, fuel: '' })}
              disabled={locked || (hasVariants ? !selected.variant : !selected.model)}
            >
              <option value="">{(hasVariants ? selected.variant : selected.model) ? 'Seçin' : '—'}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Yakıt</label>
            {fuelTypes.length === 1 ? (
              <div className={styles.fuelAutoTag}>
                {YAKIT_TURLERI[fuelTypes[0]]}
                <span className={styles.fuelAutoLabel}>Otomatik</span>
              </div>
            ) : (
              <select
                className="form-select"
                value={selected.fuel}
                onChange={(e) => onChange({ ...selected, fuel: e.target.value })}
                disabled={locked || !selected.year}
              >
                <option value="">{selected.year ? 'Seçin' : '—'}</option>
                {fuelTypes.map((f) => <option key={f} value={f}>{YAKIT_TURLERI[f]}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {locked && (
        <button
          className={styles.unlockBtn}
          onClick={() => onChange({ ...EMPTY })}
        >
          Değiştir
        </button>
      )}

      {/* Advanced Overrides */}
      <div className={styles.advancedSection}>
        <button
          type="button"
          className={`${styles.advancedToggle} ${!isFullySelected ? styles.advancedToggleDisabled : ''}`}
          onClick={() => isFullySelected && setShowAdvanced(!showAdvanced)}
        >
          <span className={styles.advancedIcon}>{showAdvanced ? '−' : '+'}</span>
          Özel Değerler
          {overrideCount > 0 && (
            <span className={styles.advancedCount}>{overrideCount} aktif</span>
          )}
        </button>

        {showAdvanced && isFullySelected && (
          <div className={styles.advancedFields}>
            <p className={styles.advancedHint}>Boş bırakılan alanlar için sistem ortalamaları kullanılır.</p>
            <div className={styles.advancedRow}>
              <div className="form-group">
                <label className="form-label">Kasko (Yıllık TL)</label>
                <input type="number" className="form-input" value={overrides.kasko || ''} onChange={e => handleOverride('kasko', e.target.value)} placeholder="Ort. değer" />
              </div>
              <div className="form-group">
                <label className="form-label">Trafik Sigortası (Yıllık TL)</label>
                <input type="number" className="form-input" value={overrides.sigorta || ''} onChange={e => handleOverride('sigorta', e.target.value)} placeholder="Ort. değer" />
              </div>
            </div>
            <div className={styles.advancedRow}>
              <div className="form-group">
                <label className="form-label">Periyodik Bakım (Yıllık TL)</label>
                <input type="number" className="form-input" value={overrides.bakim || ''} onChange={e => handleOverride('bakim', e.target.value)} placeholder="Ort. değer" />
              </div>
              <div className="form-group">
                <label className="form-label">Yakıt Fiyatı (TL/L)</label>
                <input type="number" step="0.01" className="form-input" value={overrides.yakitFiyat || ''} onChange={e => handleOverride('yakitFiyat', e.target.value)} placeholder="Güncel fiyat" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Yakıt Tüketimi (L/100km)</label>
              <input type="number" step="0.1" className="form-input" value={overrides.yakitTuketim || ''} onChange={e => handleOverride('yakitTuketim', e.target.value)} placeholder="Araç varsayılan değeri" />
            </div>
            {overrideCount > 0 && (
              <button type="button" className={styles.resetOverrides} onClick={() => onOverridesChange({})}>
                Tüm özel değerleri sıfırla
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KarsilastirContent() {
  const searchParams = useSearchParams();
  const km_param = Number(searchParams.get('km')) || VARSAYILAN_AYLIK_KM;

  const [km, setKm] = useState(km_param);
  const [view, setView] = useState('yearly');

  const prefilledA = {
    brand: searchParams.get('aMarka') || '',
    model: searchParams.get('aModel') || '',
    variant: searchParams.get('aVaryant') || '',
    year: searchParams.get('aYil') || '',
    fuel: searchParams.get('aYakit') || '',
  };
  const isPrefilledA = Boolean(prefilledA.brand && prefilledA.model && prefilledA.year && prefilledA.fuel);

  const [carA, setCarA] = useState(prefilledA);
  const [carB, setCarB] = useState({ ...EMPTY });
  const [carALocked, setCarALocked] = useState(isPrefilledA);
  const [overridesA, setOverridesA] = useState({});
  const [overridesB, setOverridesB] = useState({});

  const handleCarAChange = (val) => {
    setCarALocked(false);
    setCarA(val);
    setOverridesA({});
  };

  const handleCarBChange = (val) => {
    setCarB(val);
    setOverridesB({});
  };

  const calculateCar = useCallback((car, overrides = {}) => {
    if (!car.brand || !car.model || !car.year || !car.fuel) return null;
    const mData = vehiclesData.brands[car.brand]?.models[car.model];
    if (!mData) return null;
    const segment = mData.segment;

    let yearData;
    if (car.variant && mData.variants?.[car.variant]) {
      yearData = getYearData(mData.variants[car.variant].years, car.year);
    } else {
      yearData = getYearData(mData.years, car.year);
    }
    if (!yearData) return null;

    return calculateTotalCost({
      monthlyKm: km,
      consumption: yearData.consumption[car.fuel],
      fuelType: car.fuel,
      engineCC: yearData.engineCC,
      vehicleYear: Number(car.year),
      segment,
      overrides,
    });
  }, [km]);

  const resultA = useMemo(() => calculateCar(carA, overridesA), [carA, calculateCar, overridesA]);
  const resultB = useMemo(() => calculateCar(carB, overridesB), [carB, calculateCar, overridesB]);

  const getCarMeta = useCallback((car) => {
    if (!car.brand || !car.model || !car.year || !car.fuel) return null;
    const mData = vehiclesData.brands[car.brand]?.models[car.model];
    if (!mData) return null;
    const yearsObj = car.variant && mData.variants?.[car.variant]
      ? mData.variants[car.variant].years
      : mData.years;
    const yearData = getYearData(yearsObj, car.year);
    return {
      specs: mData.specs || null,
      shortReview: mData.short_review || '',
      hp: yearData?.hp?.[car.fuel] || null,
      engineCC: yearData?.engineCC || null,
      consumption: yearData?.consumption?.[car.fuel] || null,
      zeroTo100: yearData?.performance?.[car.fuel]?.zeroTo100 || null,
      maxSpeed: yearData?.performance?.[car.fuel]?.maxSpeed || null,
    };
  }, []);

  const metaA = useMemo(() => getCarMeta(carA), [carA, getCarMeta]);
  const metaB = useMemo(() => getCarMeta(carB), [carB, getCarMeta]);

  const isSameVehicle = Boolean(
    carA.brand && carA.model && carA.year && carA.fuel &&
    carA.brand === carB.brand && carA.model === carB.model &&
    carA.variant === carB.variant && carA.year === carB.year && carA.fuel === carB.fuel
  );

  const getDisplayName = (car) => {
    const b = vehiclesData.brands[car.brand]?.name || '';
    const m = vehiclesData.brands[car.brand]?.models[car.model]?.name || '';
    const v = car.variant ? vehiclesData.brands[car.brand]?.models[car.model]?.variants?.[car.variant]?.name || '' : '';
    return `${b} ${m}${v ? ' ' + v : ''}`.trim();
  };

  const presets = [500, 1000, 1500, 2000, 3000];

  const renderValue = (valA, valB, key) => {
    const amountA = valA ? valA[view] : 0;
    const amountB = valB ? valB[view] : 0;

    let winner = null;
    let diff = 0;
    if (amountA > 0 && amountB > 0) {
      if (amountA < amountB) { winner = 'A'; diff = amountB - amountA; }
      else if (amountB < amountA) { winner = 'B'; diff = amountA - amountB; }
    }

    return (
      <div key={key} className={`${styles.cRow} anim-fade-up d${key === 'total' ? '1' : '3'}`}>
        <div className={`${styles.cCol} ${styles.cColLeft}`}>
          {amountA > 0 ? (
            <span className={`${styles.cVal} ${winner === 'A' ? styles.valWinner : winner === 'B' ? styles.valLoser : ''}`}>
              {formatCurrency(amountA)}
              {winner === 'A' && <span className={styles.winnerBadge}>Ucuz</span>}
            </span>
          ) : <span className={styles.cVal}>—</span>}
          {winner === 'A' && <span className={styles.diffText}>-{formatCurrency(diff)}</span>}
        </div>

        <div className={`${styles.cCol} ${styles.cColCenter}`}>
          <span className={styles.cLabel}>
            {key === 'total' ? 'TOPLAM MALİYET' : MALIYET_KALEMLERI.find(k => k.key === key)?.label || key}
          </span>
        </div>

        <div className={`${styles.cCol} ${styles.cColRight}`}>
          {amountB > 0 ? (
            <span className={`${styles.cVal} ${winner === 'B' ? styles.valWinner : winner === 'A' ? styles.valLoser : ''}`}>
              {winner === 'B' && <span className={styles.winnerBadge}>Ucuz</span>}
              {formatCurrency(amountB)}
            </span>
          ) : <span className={styles.cVal}>—</span>}
          {winner === 'B' && <span className={styles.diffText}>-{formatCurrency(diff)}</span>}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.glow} />

      <div className="container">
        <div className={`${styles.header} anim-fade-up`}>
          <h1 className={`${styles.title} font-display`}>Araç Karşılaştırma</h1>
          <p className={styles.subtitle}>İki farklı aracı yan yana getirin, hangisinin uzun vadede daha ekonomik olduğunu tüm şeffaflığıyla görün.</p>
        </div>

        <div className={`${styles.globalOptions} anim-fade-up d1`}>
          <label className="form-label" style={{ textAlign: 'center' }}>Aylık Ortalama Kilometre</label>
          <input
            type="number"
            className="form-input"
            value={km}
            onChange={(e) => setKm(Number(e.target.value))}
            min="100"
            max="10000"
            step="100"
            style={{ textAlign: 'center', fontSize: 'var(--text-xl)' }}
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

        <div className={`${styles.setupGrid} anim-fade-up d2`}>
          <VehicleSelector
            id="A"
            label="1. Araç Seçimi"
            selected={carA}
            onChange={handleCarAChange}
            locked={carALocked}
            overrides={overridesA}
            onOverridesChange={setOverridesA}
          />
          <VehicleSelector
            id="B"
            label="2. Araç Seçimi"
            selected={carB}
            onChange={handleCarBChange}
            locked={false}
            overrides={overridesB}
            onOverridesChange={setOverridesB}
          />
        </div>

        {isSameVehicle && (
          <div className={`${styles.sameVehicleWarning} anim-fade-up`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Her iki araç da aynı seçilmiş. Anlamlı bir karşılaştırma için farklı bir araç veya yıl seçin.
          </div>
        )}

        {(resultA || resultB) && (
          <div className={styles.resultsArea}>
            <AdSlot format="horizontal" />

            <div className={styles.resultsHeader}>
              <h3 className="font-display" style={{ fontSize: 'var(--text-2xl)' }}>Karşılaştırma Sonucu</h3>
              <div className={styles.toggle}>
                <button className={`${styles.togBtn} ${view === 'monthly' ? styles.togActive : ''}`} onClick={() => setView('monthly')}>Aylık</button>
                <button className={`${styles.togBtn} ${view === 'yearly' ? styles.togActive : ''}`} onClick={() => setView('yearly')}>Yıllık</button>
              </div>
            </div>

            <div className={styles.compareTable}>
              {/* ── Header: logos + names + reviews ── */}
              <div className={`${styles.cRow} ${styles.cRowHeader}`}>
                <div className={`${styles.cCol} ${styles.cColLeft}`}>
                  {resultA ? (
                    <div className={styles.cVehicleHeader}>
                      <BrandLogo brandKey={carA.brand} brandName={vehiclesData.brands[carA.brand]?.name} size={48} />
                      <div className={`${styles.cVehicleName} ${styles.cVehicleNameLeft}`}>
                        <span>{getDisplayName(carA)}</span>
                        <span className={styles.cVehicleMeta}>
                          {carA.year} · {YAKIT_TURLERI[carA.fuel]}
                          {Object.keys(overridesA).length > 0 && <span className={styles.customBadge}>Özelleştirilmiş</span>}
                        </span>
                      </div>
                    </div>
                  ) : <span className={styles.cVehicleMeta}>Araç seçilmedi</span>}
                  {metaA?.shortReview && <p className={styles.cReview}>{metaA.shortReview}</p>}
                </div>
                <div className={`${styles.cCol} ${styles.cColCenter}`}>
                  <span className={styles.cVs}>VS</span>
                </div>
                <div className={`${styles.cCol} ${styles.cColRight}`}>
                  {resultB ? (
                    <div className={styles.cVehicleHeader} style={{ flexDirection: 'row-reverse' }}>
                      <BrandLogo brandKey={carB.brand} brandName={vehiclesData.brands[carB.brand]?.name} size={48} />
                      <div className={`${styles.cVehicleName} ${styles.cVehicleNameRight}`}>
                        <span>{getDisplayName(carB)}</span>
                        <span className={styles.cVehicleMeta}>
                          {Object.keys(overridesB).length > 0 && <span className={styles.customBadge}>Özelleştirilmiş</span>}
                          {carB.year} · {YAKIT_TURLERI[carB.fuel]}
                        </span>
                      </div>
                    </div>
                  ) : <span className={styles.cVehicleMeta}>Araç seçilmedi</span>}
                  {metaB?.shortReview && <p className={styles.cReview} style={{ textAlign: 'right' }}>{metaB.shortReview}</p>}
                </div>
              </div>

              {/* ── Specs section ── */}
              {(metaA || metaB) && (
                <div className={styles.cSpecsSection}>
                  <div className={styles.cSpecsTitle}>Teknik Özellikler</div>
                  {[
                    { label: 'Motor Gücü', aVal: metaA?.hp ? `${metaA.hp} HP` : '—', bVal: metaB?.hp ? `${metaB.hp} HP` : '—', aRaw: metaA?.hp, bRaw: metaB?.hp, higherWins: true },
                    { label: 'Motor Hacmi', aVal: metaA?.engineCC ? (metaA.engineCC > 0 ? `${metaA.engineCC} cc` : 'Elektrik') : '—', bVal: metaB?.engineCC ? (metaB.engineCC > 0 ? `${metaB.engineCC} cc` : 'Elektrik') : '—', aRaw: null, bRaw: null },
                    { label: 'Yakıt Tüketimi', aVal: metaA?.consumption != null ? `${metaA.consumption} L/100km` : '—', bVal: metaB?.consumption != null ? `${metaB.consumption} L/100km` : '—', aRaw: metaA?.consumption, bRaw: metaB?.consumption, higherWins: false },
                    { label: 'Bagaj Hacmi', aVal: metaA?.specs?.trunkLiters ? `${metaA.specs.trunkLiters} L` : '—', bVal: metaB?.specs?.trunkLiters ? `${metaB.specs.trunkLiters} L` : '—', aRaw: metaA?.specs?.trunkLiters, bRaw: metaB?.specs?.trunkLiters, higherWins: true },
                    { label: 'Depo Hacmi', aVal: metaA?.specs?.tankLiters > 0 ? `${metaA.specs.tankLiters} L` : '—', bVal: metaB?.specs?.tankLiters > 0 ? `${metaB.specs.tankLiters} L` : '—', aRaw: null, bRaw: null },
                    { label: '0–100 km/s', aVal: metaA?.zeroTo100 ? `${metaA.zeroTo100} s` : '—', bVal: metaB?.zeroTo100 ? `${metaB.zeroTo100} s` : '—', aRaw: metaA?.zeroTo100, bRaw: metaB?.zeroTo100, higherWins: false },
                    { label: 'Maks. Hız', aVal: metaA?.maxSpeed ? `${metaA.maxSpeed} km/s` : '—', bVal: metaB?.maxSpeed ? `${metaB.maxSpeed} km/s` : '—', aRaw: metaA?.maxSpeed, bRaw: metaB?.maxSpeed, higherWins: true },
                  ].map(({ label, aVal, bVal, aRaw, bRaw, higherWins }) => {
                    let winA = false, winB = false;
                    if (aRaw != null && bRaw != null && aRaw !== bRaw) {
                      winA = higherWins ? aRaw > bRaw : aRaw < bRaw;
                      winB = !winA;
                    }
                    return (
                      <div key={label} className={styles.cSpecRow}>
                        <span className={`${styles.cSpecVal} ${styles.cSpecLeft} ${winA ? styles.cSpecWinner : winB ? styles.cSpecLoser : ''}`}>{aVal}</span>
                        <span className={styles.cSpecLabel}>{label}</span>
                        <span className={`${styles.cSpecVal} ${styles.cSpecRight} ${winB ? styles.cSpecWinner : winA ? styles.cSpecLoser : ''}`}>{bVal}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Cost section ── */}
              <div className={styles.cRowTotal}>
                {renderValue(resultA?.total, resultB?.total, 'total')}
              </div>

              <div className={styles.cBreakdown}>
                {MALIYET_KALEMLERI.map((item) => (
                  renderValue(resultA?.breakdown[item.key], resultB?.breakdown[item.key], item.key)
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KarsilastirPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '8rem 0', color: 'var(--text-muted)' }}>
        Yükleniyor...
      </div>
    }>
      <KarsilastirContent />
    </Suspense>
  );
}
