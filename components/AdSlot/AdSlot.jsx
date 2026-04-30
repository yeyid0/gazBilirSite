'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AdSlot.module.css';

/**
 * Premium AdSense AdSlot Component
 * Safely wraps AdSense <ins> tags and provides a premium placeholder
 * until the ads are loaded or if AdSense is blocked.
 * 
 * @param {string} format 'horizontal' | 'rectangle' | 'vertical'
 * @param {string} className Additional classes
 */
export default function AdSlot({ format = 'horizontal', className = '' }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef(null);
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;

  useEffect(() => {
    if (adsenseId && slotId) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      } catch (e) {
        console.error("AdSense Error:", e);
      }
    }
  }, [adsenseId, slotId]);

  // If no IDs are provided, show the premium placeholder as a visual element
  if (!adsenseId || !slotId) {
    return (
      <div className={`${styles.adWrapper} ${styles[format]} ${className}`}>
        <div className={styles.placeholder}>
          <span className={styles.label}>Reklam Alanı</span>
          <div className={styles.skeletonPulse}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.adWrapper} ${styles[format]} ${className}`}>
      {!isLoaded && (
        <div className={styles.placeholder}>
          <span className={styles.label}>Reklam Yükleniyor...</span>
          <div className={styles.skeletonPulse}></div>
        </div>
      )}
      
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
