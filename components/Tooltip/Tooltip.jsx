'use client';

import { useState } from 'react';
import styles from './Tooltip.module.css';

export default function Tooltip({ content }) {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible(!visible)}
    >
      <span className={styles.icon}>?</span>
      {visible && (
        <div className={styles.tooltip}>
          {content}
          <div className={styles.arrow} />
        </div>
      )}
    </div>
  );
}
