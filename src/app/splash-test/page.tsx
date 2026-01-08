'use client';

import { useState } from 'react';
import { SLTRStarSplash } from '@/components/SLTRStarSplash';

export default function SplashTestPage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SLTRStarSplash onComplete={() => setShowSplash(false)} />
      )}

      {!showSplash && (
        <div style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}>
          <h1 style={{ color: '#fff', fontFamily: 'Orbitron' }}>Splash Complete!</h1>
          <button
            onClick={() => setShowSplash(true)}
            style={{
              padding: '12px 24px',
              background: '#FF9500',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Replay Splash
          </button>
        </div>
      )}
    </>
  );
}
