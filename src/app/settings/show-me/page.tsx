'use client';

import { useState, useEffect } from 'react';

export default function ShowMePage() {
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const positions = ['Top', 'Bottom', 'Versatile', 'Top Vers', 'Btm Vers', 'Side'];

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('showMePositions');
    if (saved) {
      setSelectedPositions(JSON.parse(saved));
    } else {
      // Default to all positions
      setSelectedPositions(positions);
    }
  }, []);

  const togglePosition = (position: string) => {
    let newSelections: string[];
    if (selectedPositions.includes(position)) {
      newSelections = selectedPositions.filter(p => p !== position);
    } else {
      newSelections = [...selectedPositions, position];
    }
    setSelectedPositions(newSelections);
    // Save to localStorage
    localStorage.setItem('showMePositions', JSON.stringify(newSelections));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Show Me</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
          Select the positions you want to see in your browse
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {positions.map(position => (
            <button
              key={position}
              onClick={() => togglePosition(position)}
              style={{
                padding: '16px',
                background: selectedPositions.includes(position) ? '#FF6B35' : '#1c1c1e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {position}
            </button>
          ))}
        </div>

        <p style={{ fontSize: '13px', color: '#666', marginTop: '20px', lineHeight: 1.5 }}>
          You've selected {selectedPositions.length} position{selectedPositions.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
