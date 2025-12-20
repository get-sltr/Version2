'use client';

import { useState, useEffect } from 'react';

export default function PnPPage() {
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pnp');
    if (saved) setAnswer(saved as 'yes' | 'no');
  }, []);

  const handleSelect = (value: 'yes' | 'no') => {
    setAnswer(value);
    localStorage.setItem('pnp', value);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', 'Space Mono', -apple-system, BlinkMacSystemFont, serif" }}>
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Privacy Settings</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/images/pnp.jpg" alt="" style={{ width: '100%', maxWidth: '400px', borderRadius: '12px' }} />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button
            onClick={() => handleSelect('yes')}
            style={{
              flex: 1,
              padding: '20px',
              background: answer === 'yes' ? '#FF6B35' : '#1c1c1e',
              border: answer === 'yes' ? '2px solid #FF6B35' : '2px solid #333',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Yes
          </button>
          <button
            onClick={() => handleSelect('no')}
            style={{
              flex: 1,
              padding: '20px',
              background: answer === 'no' ? '#FF6B35' : '#1c1c1e',
              border: answer === 'no' ? '2px solid #FF6B35' : '2px solid #333',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
