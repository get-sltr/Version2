'use client';

import { useState, useEffect } from 'react';

export default function MaxDistancePage() {
  const [maxDistance, setMaxDistance] = useState(30);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('maxDistance');
    if (saved) setMaxDistance(parseInt(saved));
  }, []);

  const handleChange = (value: number) => {
    setMaxDistance(value);
    localStorage.setItem('maxDistance', value.toString());
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Maximum Distance</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ fontSize: '72px', fontWeight: 700, marginBottom: '10px' }}>
            {maxDistance}
          </div>
          <div style={{ fontSize: '18px', color: '#888' }}>
            miles
          </div>
        </div>

        {/* Distance Slider */}
        <div style={{ marginBottom: '40px' }}>
          <input
            type="range"
            min="1"
            max="100"
            value={maxDistance}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${maxDistance}%, #333 ${maxDistance}%, #333 100%)`,
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '12px', color: '#666' }}>
            <span>1 mi</span>
            <span>100 mi</span>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5, textAlign: 'center' }}>
          You'll only see profiles within {maxDistance} mile{maxDistance !== 1 ? 's' : ''} of your location
        </p>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FF6B35;
          cursor: pointer;
          border: 4px solid #000;
        }
        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #FF6B35;
          cursor: pointer;
          border: 4px solid #000;
        }
      `}</style>
    </div>
  );
}
