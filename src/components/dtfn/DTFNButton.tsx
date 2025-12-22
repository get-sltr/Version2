'use client';

import { useState, useEffect } from 'react';
import { useDTFN } from '@/hooks/useDTFN';

export function DTFNButton() {
  const { isActive, timeRemaining, toggle, loading } = useDTFN();
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (!timeRemaining) {
      setDisplayTime('');
      return;
    }

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    if (timeRemaining <= 60) {
      setDisplayTime(`${seconds}s`);
    } else if (timeRemaining <= 3600) {
      setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setDisplayTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [timeRemaining]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={toggle}
        disabled={loading}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '12px 18px',
          fontSize: '15px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          borderRadius: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease-out',
          background: '#0a0a0a',
          color: isActive ? '#ff6b35' : '#444',
          border: isActive ? '1px solid #ff6b35' : '1px solid #222',
          boxShadow: isActive ? '0 5px 25px rgba(255,107,53,0.3)' : 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        {/* Bottom glow bar */}
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '3px',
            transition: 'all 0.3s',
            background: isActive ? '#ff6b35' : '#222',
            boxShadow: isActive ? '0 0 15px rgba(255,107,53,0.8)' : 'none',
          }}
        />

        <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
          DTFN
          <span style={{ display: 'inline-flex', alignItems: 'flex-end', marginLeft: '2px', gap: 0 }}>
            {/* Large droplet */}
            <svg
              style={{
                width: '14px',
                height: '14px',
                transition: 'all 0.3s',
                fill: isActive ? '#ff6b35' : '#444',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(255,107,53,0.8))' : 'none',
              }}
              viewBox="0 0 24 24"
            >
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
            {/* Small droplet */}
            <svg
              style={{
                width: '9px',
                height: '9px',
                marginLeft: '-1px',
                transition: 'all 0.3s',
                fill: isActive ? '#ff6b35' : '#444',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(255,107,53,0.8))' : 'none',
              }}
              viewBox="0 0 24 24"
            >
              <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
            </svg>
          </span>
        </span>
      </button>

      {/* Timer display */}
      <span
        style={{
          fontSize: '12px',
          fontFamily: 'monospace',
          color: isActive ? '#ff6b35' : '#666',
        }}
      >
        {isActive ? `${displayTime} remaining` : 'Tap to activate'}
      </span>
    </div>
  );
}

export default DTFNButton;
