'use client';

import { useState, useEffect } from 'react';

const AGE_GATE_KEY = 'primal_age_verified';

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(AGE_GATE_KEY);
    setVerified(stored === 'true');
  }, []);

  const handleYes = () => {
    sessionStorage.setItem(AGE_GATE_KEY, 'true');
    setVerified(true);
  };

  const handleNo = () => {
    window.location.href = 'https://www.google.com';
  };

  // Still loading from sessionStorage
  if (verified === null) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 99999,
      }} />
    );
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        color: '#fff',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "var(--font-orbitron, 'Audiowide', sans-serif)",
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          color: '#FF6B35',
          marginBottom: '32px',
        }}>
          PRIMAL
        </div>

        {/* Age gate card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '40px 32px',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
          }}>
            18+
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            Age Verification Required
          </h1>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}>
            This website contains age-restricted content. By entering, you confirm that you are at least 18 years of age.
          </p>

          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button
              onClick={handleNo}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '12px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              I am under 18
            </button>
            <button
              onClick={handleYes}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              I am 18 or older
            </button>
          </div>
        </div>

        <p style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.25)',
          marginTop: '24px',
          lineHeight: 1.5,
        }}>
          By entering this site you agree to our{' '}
          <a href="/terms" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'underline' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
