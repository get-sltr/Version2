'use client';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center',
      fontFamily: "'Cormorant Garamond', serif"
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>
        📡
      </div>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 700,
        marginBottom: '16px',
        color: '#FF6B35'
      }}>
        You're Offline
      </h1>
      <p style={{
        fontSize: '16px',
        color: 'rgba(255,255,255,0.7)',
        maxWidth: '300px',
        lineHeight: 1.6
      }}>
        Check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: '32px',
          background: '#FF6B35',
          border: 'none',
          borderRadius: '12px',
          padding: '14px 32px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
}
