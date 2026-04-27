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

  useEffect(() => {
    // In production, when AdSense is active, you would push to adsbygoogle:
    // try {
    //   (window.adsbygoogle = window.adsbygoogle || []).push({});
    // } catch (e) {
    //   console.error("AdSense Error:", e);
    // }
    
    // For now, we simulate a load delay to show the premium skeleton
    const timer = setTimeout(() => {
      // setIsLoaded(true); // Uncomment this when real ads are ready to hide placeholder
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${styles.adWrapper} ${styles[format]} ${className}`}>
      {!isLoaded && (
        <div className={styles.placeholder}>
          <span className={styles.label}>Reklam Alanı</span>
          <div className={styles.skeletonPulse}></div>
        </div>
      )}
      
      {/* AdSense ins tag goes here in production */}
      {/* 
      <ins 
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="YYYYYYYYYY"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      */}
    </div>
  );
}
