import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-h))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-8) var(--sp-4)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 18vw, 9rem)',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          background: 'var(--gradient-accent)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          lineHeight: 1,
          marginBottom: 'var(--sp-4)',
        }}>
          404
        </div>
        <h1 className="font-display" style={{
          fontSize: 'var(--text-2xl)',
          marginBottom: 'var(--sp-3)',
        }}>
          Sayfa bulunamadı
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          marginBottom: 'var(--sp-6)',
          lineHeight: 1.6,
        }}>
          Aradığınız marka veya sayfa veritabanımızda yok. Belki başka bir araç araştırmak istersiniz?
        </p>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-ghost">Ana Sayfa</Link>
          <Link href="/hesapla" className="btn btn-primary">Maliyet Hesapla</Link>
        </div>
      </div>
    </div>
  );
}
