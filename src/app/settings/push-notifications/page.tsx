'use client';

import { useState, useEffect } from 'react';

export default function PushNotificationsPage() {
  const [settings, setSettings] = useState({
    enabled: true,
    messages: true,
    matches: true,
    likes: true,
    profileViews: true,
    nearby: false,
    promotions: false,
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('pushNotifications');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const toggleSetting = (key: string) => {
    const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
    setSettings(newSettings);
    localStorage.setItem('pushNotifications', JSON.stringify(newSettings));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <a href="/settings" style={{ color: '#fff', textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Push Notifications</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '20px', lineHeight: 1.5 }}>
          Choose which notifications you want to receive on your device
        </p>

        {/* Master Toggle */}
        <ToggleRow 
          label="Push Notifications" 
          description="Enable all push notifications"
          value={settings.enabled} 
          onChange={() => toggleSetting('enabled')} 
        />

        {settings.enabled && (
          <>
            <div style={{ height: '20px', borderBottom: '8px solid #1c1c1e', margin: '20px -20px' }} />
            
            <ToggleRow 
              label="Messages" 
              description="When someone sends you a message"
              value={settings.messages} 
              onChange={() => toggleSetting('messages')} 
            />
            
            <ToggleRow 
              label="Matches" 
              description="When you have a new match"
              value={settings.matches} 
              onChange={() => toggleSetting('matches')} 
            />
            
            <ToggleRow 
              label="Likes & Taps" 
              description="When someone likes or taps you"
              value={settings.likes} 
              onChange={() => toggleSetting('likes')} 
            />
            
            <ToggleRow 
              label="Profile Views" 
              description="When someone views your profile"
              value={settings.profileViews} 
              onChange={() => toggleSetting('profileViews')} 
            />
            
            <ToggleRow 
              label="Nearby" 
              description="When someone is nearby"
              value={settings.nearby} 
              onChange={() => toggleSetting('nearby')} 
            />
            
            <ToggleRow 
              label="Promotions" 
              description="Special offers and updates"
              value={settings.promotions} 
              onChange={() => toggleSetting('promotions')} 
            />
          </>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #1c1c1e' }}>
      <div style={{ flex: 1, marginRight: '15px' }}>
        <div style={{ fontSize: '16px', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{description}</div>
      </div>
      <button onClick={onChange} style={{ width: '50px', height: '30px', borderRadius: '15px', border: 'none', background: value ? '#FF6B35' : '#333', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: value ? '22px' : '2px', transition: 'left 0.2s' }} />
      </button>
    </div>
  );
}
