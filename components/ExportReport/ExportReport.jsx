'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function ExportReport({ targetId, filename }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;

    setLoading(true);
    try {
      // Temporarily hide elements that shouldn't be in the screenshot
      const hiddenElements = el.querySelectorAll('.no-export');
      hiddenElements.forEach(n => n.style.display = 'none');

      const canvas = await html2canvas(el, {
        backgroundColor: '#0a0a0f', // Match body bg
        scale: 2, // High resolution
        useCORS: true,
      });

      // Restore hidden elements
      hiddenElements.forEach(n => n.style.display = '');

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${filename}.png`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Rapor oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      className="btn btn-ghost"
      disabled={loading}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
    >
      {loading ? (
        <span>Hazırlanıyor...</span>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Görsel Olarak İndir
        </>
      )}
    </button>
  );
}
