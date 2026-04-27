'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import vehiclesData from '@/data/vehicles.json';
import { YAKIT_TURLERI } from '@/lib/constants';
import logosData from '@/data/logos.json';
import styles from './SmartSearch.module.css';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const router = useRouter();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Build a flat search index from all brands/models/years/variants
  const searchIndex = useMemo(() => {
    const items = [];
    Object.entries(vehiclesData.brands).forEach(([brandSlug, brand]) => {
      Object.entries(brand.models).forEach(([modelSlug, model]) => {
        if (model.variants && Object.keys(model.variants).length > 0) {
          Object.entries(model.variants).forEach(([variantSlug, variantData]) => {
            const latestYear = Object.keys(variantData.years).sort((a, b) => b - a)[0];
            const yearData = variantData.years[latestYear];
            yearData.fuelTypes.forEach(fuel => {
              items.push({
                brandSlug,
                modelSlug,
                variantSlug,
                brandName: brand.name,
                modelName: model.name,
                variantName: variantData.name,
                segment: model.segment,
                year: latestYear,
                fuel,
                fuelLabel: YAKIT_TURLERI[fuel],
                logo: logosData[brandSlug] || brand.logo,
                label: `${brand.name} ${model.name} ${variantData.name}`,
                sublabel: `${latestYear} · ${YAKIT_TURLERI[fuel]} · ${model.segment}`,
              });
            });
          });
        } else {
          const latestYear = Object.keys(model.years).sort((a, b) => b - a)[0];
          const yearData = model.years[latestYear];
          yearData.fuelTypes.forEach(fuel => {
            items.push({
              brandSlug,
              modelSlug,
              variantSlug: null,
              brandName: brand.name,
              modelName: model.name,
              variantName: '',
              segment: model.segment,
              year: latestYear,
              fuel,
              fuelLabel: YAKIT_TURLERI[fuel],
              logo: logosData[brandSlug] || brand.logo,
              label: `${brand.name} ${model.name}`,
              sublabel: `${latestYear} · ${YAKIT_TURLERI[fuel]} · ${model.segment}`,
            });
          });
        }
      });
    });
    return items;
  }, []);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return searchIndex
      .filter(item =>
        item.brandName.toLowerCase().includes(q) ||
        item.modelName.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.variantName && item.variantName.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query, searchIndex]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(results.length > 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHighlighted(0);
  }, [results]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToResult = (item) => {
    const params = new URLSearchParams({
      marka: item.brandSlug,
      model: item.modelSlug,
      yil: item.year,
      yakit: item.fuel,
      km: '1500',
    });
    if (item.variantSlug) {
      params.append('varyant', item.variantSlug);
    }
    router.push(`/sonuc?${params.toString()}`);
    setQuery('');
    setOpen(false);
  };

  const handleKey = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && results[highlighted]) {
      goToResult(results[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const fuelColor = (fuel) => {
    const map = { benzin: '#ff6b35', dizel: '#4ecdc4', lpg: '#45b7d1', hibrit: '#96ceb4', elektrik: '#6c5ce7' };
    return map[fuel] || '#fff';
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="Araç ara... (örn: Golf, Corolla, T10X)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button className={styles.clear} onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}>
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className={styles.dropdown} ref={listRef}>
          {results.map((item, i) => (
            <button
              key={`${item.brandSlug}-${item.modelSlug}-${item.fuel}`}
              className={`${styles.result} ${i === highlighted ? styles.resultActive : ''}`}
              onClick={() => goToResult(item)}
              onMouseEnter={() => setHighlighted(i)}
            >
              {item.logo.startsWith('<svg') ? (
                <div 
                  className={styles.resultLogoImg} 
                  style={{ color: 'var(--text-primary)' }}
                  dangerouslySetInnerHTML={{ __html: item.logo.replace(/ fill="[^"]*"/g, '').replace('<svg ', '<svg width="100%" height="100%" fill="currentColor" ') }}
                />
              ) : null}
              <span className={styles.resultLogo} style={{ display: item.logo.startsWith('<svg') ? 'none' : 'flex' }}>
                {item.logo.startsWith('<svg') ? '' : (item.logo.length > 2 ? item.brandName[0] : item.logo)}
              </span>
              <div className={styles.resultInfo}>
                <span className={styles.resultName}>{item.brandName} <strong>{item.modelName} {item.variantName}</strong></span>
                <span className={styles.resultMeta}>{item.year} · {item.segment}</span>
              </div>
              <span className={styles.resultFuel} style={{ background: fuelColor(item.fuel) + '22', color: fuelColor(item.fuel), border: `1px solid ${fuelColor(item.fuel)}44` }}>
                {item.fuelLabel}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          ))}
          <div className={styles.hint}>
            <kbd>↑↓</kbd> Gezin &nbsp; <kbd>Enter</kbd> Hesapla &nbsp; <kbd>Esc</kbd> Kapat
          </div>
        </div>
      )}
    </div>
  );
}
