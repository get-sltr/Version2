'use client';

import { useState, useEffect } from 'react';

export default function ShowDistancePage() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('showDistance');
    if (saved) setEnabled(JSON.parse(saved));
  }, []);

  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('showDistance', JSON.stringify(newValue));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Show Distance</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>📍</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
            {enabled ? 'Distance Visible' : 'Distance Hidden'}
          </h2>
          <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.5 }}>
            {enabled ? 'Others can see your distance' : 'Your distance is hidden'}
          </p>
        </div>

        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, marginRight: '15px' }}>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '5px' }}>Show My Distance</div>
              <div style={{ fontSize: '14px', color: '#888' }}>Let others see how far away you are</div>
            </div>
            <button onClick={toggle} style={{ width: '60px', height: '36px', borderRadius: '18px', border: 'none', background: enabled ? '#FF6B35' : '#333', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: enabled ? '26px' : '2px', transition: 'left 0.2s' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
