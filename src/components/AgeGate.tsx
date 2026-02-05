'use client';

import { useState, useEffect } from 'react';

const AGE_GATE_KEY = 'primal_age_verified';

export function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AGE_GATE_KEY);
      if (stored === 'true') {
        setVerified(true);
      } else {
        setVerified(false);
      }
    } catch {
      setVerified(false);
    }
  }, []);

  const handleVerify = () => {
    setError('');
    if (!dob) {
      setError('Please enter your date of birth.');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('You must be at least 18 years old to use Primal.');
      return;
    }

    try {
      localStorage.setItem(AGE_GATE_KEY, 'true');
    } catch {
      // proceed even if storage fails
    }
    setVerified(true);
  };

  // Still loading
  if (verified === null) {
    return null;
  }

  // Already verified
  if (verified) {
    return <>{children}</>;
  }

  // Show age gate
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      color: '#fff',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #FF6B35 50%, #ffffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          PRIMAL
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: 600,
          marginBottom: '8px',
        }}>
          Age Verification
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.5)',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          Primal is an 18+ app. Please enter your date of birth to continue.
        </p>

        {error && (
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#ff8888',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="age-gate-dob"
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.5)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Date of Birth
          </label>
          <input
            id="age-gate-dob"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              color: '#fff',
              colorScheme: 'dark',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleVerify}
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            background: 'rgba(255, 107, 53, 0.15)',
            border: '1px solid rgba(255, 107, 53, 0.5)',
            borderRadius: '12px',
            color: '#FF6B35',
            cursor: 'pointer',
          }}
        >
          Verify Age
        </button>

        <p style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.3)',
          marginTop: '24px',
          lineHeight: 1.6,
        }}>
          By continuing, you confirm you are at least 18 years old and agree to our{' '}
          <a href="/terms" style={{ color: '#FF6B35', textDecoration: 'none' }}>Terms of Service</a> and{' '}
          <a href="/privacy" style={{ color: '#FF6B35', textDecoration: 'none' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
