export default function Loading() {
  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-h))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      <div style={{
        position: 'relative',
        width: 64,
        height: 64,
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: 'var(--accent-500)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        Yükleniyor
      </span>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
    </div>
  );
}
