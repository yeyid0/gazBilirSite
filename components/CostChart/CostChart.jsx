'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatNumber } from '@/lib/calculator';
import styles from './CostChart.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltip}>
        <p className={styles.ttYear}>{label} Yılı</p>
        <div className={styles.ttRow}>
          <span className={styles.ttDot} style={{ background: payload[0].color }}></span>
          <span className={styles.ttLabel}>Yıllık:</span>
          <span className={styles.ttValue}>{formatNumber(payload[0].value)} ₺</span>
        </div>
        <div className={styles.ttRow}>
          <span className={styles.ttDot} style={{ background: payload[1].color }}></span>
          <span className={styles.ttLabel}>Kümülatif:</span>
          <span className={styles.ttValue}>{formatNumber(payload[1].value)} ₺</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function CostChart({ data, title = "5 Yıllık Maliyet Projeksiyonu" }) {
  // Veriyi formatla
  const formattedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      yillikLabel: `${formatNumber(item.yillik)} ₺`,
      kumulatifLabel: `${formatNumber(item.kumulatif)} ₺`
    }));
  }, [data]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.desc}>Yıllık %35 enflasyon/maliyet artışı varsayımıyla (Yakıt, Sigorta, Bakım dahil) cebinizden çıkacak tahmini toplam tutar.</p>
      </div>
      
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorYillik" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--text-secondary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--text-secondary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorKumulatif" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="var(--text-muted)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="var(--text-muted)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}₺`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="yillik" 
              stroke="var(--text-secondary)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorYillik)" 
              name="Yıllık Gider"
            />
            <Area 
              type="monotone" 
              dataKey="kumulatif" 
              stroke="var(--accent-500)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorKumulatif)" 
              name="Toplam Kümülatif"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
