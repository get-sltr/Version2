'use client';

import { useState, useEffect } from 'react';

export default function AgeRangePage() {
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(80);

  useEffect(() => {
    // Load saved preferences
    const savedMin = localStorage.getItem('minAge');
    const savedMax = localStorage.getItem('maxAge');
    if (savedMin) setMinAge(parseInt(savedMin));
    if (savedMax) setMaxAge(parseInt(savedMax));
  }, []);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, maxAge - 1);
    setMinAge(newMin);
    localStorage.setItem('minAge', newMin.toString());
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, minAge + 1);
    setMaxAge(newMax);
    localStorage.setItem('maxAge', newMax.toString());
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Age Range</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{ fontSize: '48px', fontWeight: 700, marginBottom: '10px' }}>
            {minAge} - {maxAge}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            years old
          </div>
        </div>

        {/* Min Age Slider */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>Minimum Age</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{minAge}</span>
          </div>
          <input
            type="range"
            min="18"
            max="80"
            value={minAge}
            onChange={(e) => handleMinChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${((minAge - 18) / 62) * 100}%, #333 ${((minAge - 18) / 62) * 100}%, #333 100%)`,
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
        </div>

        {/* Max Age Slider */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>Maximum Age</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{maxAge}</span>
          </div>
          <input
            type="range"
            min="18"
            max="80"
            value={maxAge}
            onChange={(e) => handleMaxChange(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${((maxAge - 18) / 62) * 100}%, #333 ${((maxAge - 18) / 62) * 100}%, #333 100%)`,
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none',
            }}
          />
        </div>

        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>
          You'll only see profiles of people aged {minAge} to {maxAge}
        </p>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FF6B35;
          cursor: pointer;
          border: 3px solid #000;
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #FF6B35;
          cursor: pointer;
          border: 3px solid #000;
        }
      `}</style>
    </div>
  );
}
