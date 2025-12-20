'use client';

import { useState, useEffect } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { PremiumPromo } from '@/components/PremiumPromo';

export default function IncognitoModePage() {
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [enabled, setEnabled] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('incognitoMode');
    if (saved) {
      setEnabled(JSON.parse(saved));
    }
  }, []);

  // Show promo for non-premium users after loading
  useEffect(() => {
    if (!premiumLoading && !isPremium) {
      setShowPromo(true);
    }
  }, [premiumLoading, isPremium]);

  const toggleIncognito = () => {
    if (!isPremium) {
      setShowPromo(true);
      return;
    }
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('incognitoMode', JSON.stringify(newValue));
  };

  // Show promo modal for non-premium users
  if (showPromo && !isPremium) {
    return <PremiumPromo feature="Incognito Mode" fullPage />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Incognito Mode</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Icon & Status */}
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {enabled ? '🕶️' : '👁️'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
            {enabled ? 'You\'re Hidden' : 'You\'re Visible'}
          </h2>
          <p style={{ fontSize: '15px', color: '#888', lineHeight: 1.5 }}>
            {enabled 
              ? 'Your profile is hidden from browse and search'
              : 'Your profile appears in browse and search'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{ background: '#1c1c1e', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1, marginRight: '15px' }}>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '5px' }}>Incognito Mode</div>
              <div style={{ fontSize: '14px', color: '#888' }}>Stay completely off grid</div>
            </div>
            <button onClick={toggleIncognito} style={{ width: '60px', height: '36px', borderRadius: '18px', border: 'none', background: enabled ? '#FF6B35' : '#333', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: enabled ? '26px' : '2px', transition: 'left 0.2s' }} />
            </button>
          </div>
        </div>

        {/* Info Boxes */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ background: enabled ? '#1c3d1c' : '#3d2c1c', borderRadius: '8px', padding: '15px', marginBottom: '15px', border: `1px solid ${enabled ? '#2d5d2d' : '#5d4d3d'}` }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              {enabled ? '✓ When Incognito is ON:' : 'When Incognito is ON:'}
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#bbb', lineHeight: 1.8 }}>
              <li>You won't appear in browse or search results</li>
              <li>Others can't see when you view their profiles</li>
              <li>You can still message existing matches</li>
              <li>Your existing matches can still see and message you</li>
            </ul>
          </div>

          <div style={{ background: enabled ? '#3d2c1c' : '#1c3d1c', borderRadius: '8px', padding: '15px', border: `1px solid ${enabled ? '#5d4d3d' : '#2d5d2d'}` }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
              {enabled ? 'When Incognito is OFF:' : '✓ When Incognito is OFF:'}
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#bbb', lineHeight: 1.8 }}>
              <li>Your profile appears in browse and search</li>
              <li>Others can see when you view their profiles</li>
              <li>You can match with new people</li>
              <li>You appear in "nearby" and other features</li>
            </ul>
          </div>
        </div>

        {enabled && (
          <div style={{ background: '#3d2c1c', borderRadius: '8px', padding: '15px', border: '1px solid #5d4d3d', marginTop: '20px' }}>
            <div style={{ fontSize: '13px', color: '#FF6B35', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <div>
                <strong>Note:</strong> While in Incognito Mode, you won't be able to match with new people. Turn it off to start meeting people again.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
