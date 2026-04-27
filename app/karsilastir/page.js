'use client';

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import vehiclesData from '@/data/vehicles.json';
import { calculateTotalCost, formatCurrency } from '@/lib/calculator';
import { MALIYET_KALEMLERI, YAKIT_TURLERI, VARSAYILAN_AYLIK_KM } from '@/lib/constants';
import AdSlot from '@/components/AdSlot/AdSlot';
import styles from './page.module.css';

// VehicleSelector bileşeni — locked=true ise seçimler devre dışı, kilitli rozeti gösterir
function VehicleSelector({ id, label, selected, onChange, locked }) {
  const brands = useMemo(() => Object.entries(vehiclesData.brands), []);
  
  const models = useMemo(() => {
    if (!selected.brand) return [];
    return Object.entries(vehiclesData.brands[selected.brand]?.models || {});
  }, [selected.brand]);

  const years = useMemo(() => {
    if (!selected.brand || !selected.model) return [];
    const m = vehiclesData.brands[selected.brand]?.models[selected.model];
    return m ? Object.keys(m.years).sort((a, b) => b - a) : [];
  }, [selected.brand, selected.model]);

  const fuelTypes = useMemo(() => {
    if (!selected.brand || !selected.model || !selected.year) return [];
    return vehiclesData.brands[selected.brand]?.models[selected.model]?.years[selected.year]?.fuelTypes || [];
  }, [selected.brand, selected.model, selected.year]);

  return (
    <div className={`${styles.vehicleCol} ${locked ? styles.vehicleColLocked : ''}`}>
      <div className={styles.colHeader}>
        <div className={styles.colIcon}>{id === 'A' ? 'A' : 'B'}</div>
        <h2 className={styles.colTitle}>{label}</h2>
        {locked && (
          <span className={styles.lockedBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
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
            onChange={(e) => onChange({ brand: e.target.value, model: '', year: '', fuel: '' })}
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
            onChange={(e) => onChange({ ...selected, model: e.target.value, year: '', fuel: '' })}
            disabled={locked || !selected.brand}
          >
            <option value="">{selected.brand ? 'Seçin' : '—'}</option>
            {models.map(([s, m]) => <option key={s} value={s}>{m.name}</option>)}
          </select>
        </div>
        
        <div className={styles.row}>
          <div className="form-group">
            <label className="form-label">Yıl</label>
            <select 
              className="form-select" 
              value={selected.year} 
              onChange={(e) => onChange({ ...selected, year: e.target.value, fuel: '' })}
              disabled={locked || !selected.model}
            >
              <option value="">{selected.model ? 'Seçin' : '—'}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Yakıt</label>
            <select 
              className="form-select" 
              value={selected.fuel} 
              onChange={(e) => onChange({ ...selected, fuel: e.target.value })}
              disabled={locked || !selected.year}
            >
              <option value="">{selected.year ? 'Seçin' : '—'}</option>
              {fuelTypes.map((f) => <option key={f} value={f}>{YAKIT_TURLERI[f]}</option>)}
            </select>
          </div>
        </div>
      </div>

      {locked && (
        <button
          className={styles.unlockBtn}
          onClick={() => onChange({ brand: '', model: '', year: '', fuel: '' })}
        >
          Değiştir
        </button>
      )}
    </div>
  );
}

function KarsilastirContent() {
  const searchParams = useSearchParams();
  const km_param = Number(searchParams.get('km')) || VARSAYILAN_AYLIK_KM;
  
  const [km, setKm] = useState(km_param);
  const [view, setView] = useState('yearly');
  
  // Pre-fill Car A from URL params (when coming from sonuc page)
  const prefilledA = {
    brand: searchParams.get('aMarka') || '',
    model: searchParams.get('aModel') || '',
    year: searchParams.get('aYil') || '',
    fuel: searchParams.get('aYakit') || '',
  };
  const isPrefilledA = Boolean(prefilledA.brand && prefilledA.model && prefilledA.year && prefilledA.fuel);
  
  const [carA, setCarA] = useState(prefilledA);
  const [carB, setCarB] = useState({ brand: '', model: '', year: '', fuel: '' });
  const [carALocked, setCarALocked] = useState(isPrefilledA);

  // Handle CarA unlock
  const handleCarAChange = (val) => {
    setCarALocked(false);
    setCarA(val);
  };

  const calculateCar = useCallback((car) => {
    if (!car.brand || !car.model || !car.year || !car.fuel) return null;
    const vData = vehiclesData.brands[car.brand].models[car.model];
    const segment = vData.segment;
    const yearData = vData.years[car.year];
    
    return calculateTotalCost({
      monthlyKm: km,
      consumption: yearData.consumption[car.fuel],
      fuelType: car.fuel,
      engineCC: yearData.engineCC,
      vehicleYear: Number(car.year),
      segment,
    });
  }, [km]);

  const resultA = useMemo(() => calculateCar(carA), [carA, calculateCar]);
  const resultB = useMemo(() => calculateCar(carB), [carB, calculateCar]);

  const presets = [500, 1000, 1500, 2000, 3000];

  const renderValue = (valA, valB, key) => {
    const amountA = valA ? valA[view] : 0;
    const amountB = valB ? valB[view] : 0;
    
    // Determine winner (lower is better)
    let winner = null;
    let diff = 0;
    if (amountA > 0 && amountB > 0) {
      if (amountA < amountB) {
        winner = 'A';
        diff = amountB - amountA;
      } else if (amountB < amountA) {
        winner = 'B';
        diff = amountA - amountB;
      }
    }

    return (
      <div key={key} className={`${styles.cRow} anim-fade-up d${key === 'total' ? '1' : '3'}`}>
        {/* Car A */}
        <div className={`${styles.cCol} ${styles.cColLeft}`}>
          {amountA > 0 ? (
            <span className={`${styles.cVal} ${winner === 'A' ? styles.valWinner : winner === 'B' ? styles.valLoser : ''}`}>
              {formatCurrency(amountA)}
              {winner === 'A' && <span className={styles.winnerBadge}>Ucuz</span>}
            </span>
          ) : <span className={styles.cVal}>—</span>}
          {winner === 'A' && <span className={styles.diffText}>-{formatCurrency(diff)}</span>}
        </div>
        
        {/* Label (Center) */}
        <div className={`${styles.cCol} ${styles.cColCenter}`}>
          <span className={styles.cLabel}>
            {key === 'total' ? 'TOPLAM MALİYET' : MALIYET_KALEMLERI.find(k => k.key === key)?.label || key}
          </span>
        </div>
        
        {/* Car B */}
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

        {/* Setup Options */}
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
          <VehicleSelector id="A" label="1. Araç Seçimi" selected={carA} onChange={handleCarAChange} locked={carALocked} />
          <VehicleSelector id="B" label="2. Araç Seçimi" selected={carB} onChange={setCarB} />
        </div>

        {/* Results */}
        {(resultA || resultB) && (
          <div className={styles.resultsArea}>
            {/* AdSlot */}
            <AdSlot format="horizontal" />
            
            <div className={styles.resultsHeader}>
              <h3 className="font-display" style={{ fontSize: 'var(--text-2xl)' }}>Karşılaştırma Sonucu</h3>
              <div className={styles.toggle}>
                <button className={`${styles.togBtn} ${view === 'monthly' ? styles.togActive : ''}`} onClick={() => setView('monthly')}>Aylık</button>
                <button className={`${styles.togBtn} ${view === 'yearly' ? styles.togActive : ''}`} onClick={() => setView('yearly')}>Yıllık</button>
              </div>
            </div>

            <div className={styles.compareTable}>
              {/* Table Header */}
              <div className={`${styles.cRow} ${styles.cRowHeader}`}>
                <div className={`${styles.cCol} ${styles.cColLeft}`}>
                  {resultA ? (
                    <div className={`${styles.cVehicleName} ${styles.cVehicleNameLeft}`}>
                      <span>{vehiclesData.brands[carA.brand].name} {vehiclesData.brands[carA.brand].models[carA.model].name}</span>
                      <span className={styles.cVehicleMeta}>{carA.year} · {YAKIT_TURLERI[carA.fuel]}</span>
                    </div>
                  ) : <span className={styles.cVehicleMeta}>Araç seçilmedi</span>}
                </div>
                <div className={`${styles.cCol} ${styles.cColCenter}`}>
                  <span className={styles.cVs}>VS</span>
                </div>
                <div className={`${styles.cCol} ${styles.cColRight}`}>
                  {resultB ? (
                    <div className={`${styles.cVehicleName} ${styles.cVehicleNameRight}`}>
                      <span>{vehiclesData.brands[carB.brand].name} {vehiclesData.brands[carB.brand].models[carB.model].name}</span>
                      <span className={styles.cVehicleMeta}>{carB.year} · {YAKIT_TURLERI[carB.fuel]}</span>
                    </div>
                  ) : <span className={styles.cVehicleMeta}>Araç seçilmedi</span>}
                </div>
              </div>

              {/* Total Cost */}
              <div className={`${styles.cRowTotal}`}>
                {renderValue(resultA?.total, resultB?.total, 'total')}
              </div>

              {/* Breakdown */}
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
