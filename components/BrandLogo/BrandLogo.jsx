import logosData from '@/data/logos.json';

export default function BrandLogo({ brandKey, brandName, size = 120, className = '' }) {
  const svgContent = logosData[brandKey];
  
  if (!svgContent) {
    return (
      <div 
        className={className}
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size / 2.5,
          fontWeight: 'bold',
          color: 'var(--text-muted)',
          background: 'var(--bg-elevated)',
          borderRadius: '50%',
          flexShrink: 0,
          border: '1px solid var(--border-medium)'
        }}
      >
        {brandName ? brandName[0] : '?'}
      </div>
    );
  }

  // Mercedes özel: iki renkli logo (daire + yıldız kolları)
  if (brandKey === 'mercedes') {
    const mercedesSvg = svgContent
      .replace('<svg ', '<svg width="100%" height="100%" ')
      .replace('fill="currentColor"', 'fill="var(--text-primary)"')
      .replace('var(--mercedes-star, #0a0a12)', 'var(--bg-void, #050508)');

    return (
      <div 
        className={className} 
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        dangerouslySetInnerHTML={{ __html: mercedesSvg }}
      />
    );
  }

  // Diğer tüm markalar: tek renkli, temaya uyumlu
  // Tüm fill değerlerini kaldırıp SVG seviyesinde fill="currentColor" ekle
  const processedSvg = svgContent
    .replace('<svg ', '<svg width="100%" height="100%" fill="currentColor" ')
    .replace(/ fill="[^"]*"/g, '') // path/g içindeki tüm eski fill'leri temizle
    .replace('width="100%" height="100%" ', 'width="100%" height="100%" fill="currentColor" '); // SVG seviyesinde tekrar ekle

  return (
    <div 
      className={className} 
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--text-primary)'
      }}
      dangerouslySetInnerHTML={{ __html: processedSvg }}
    />
  );
}
