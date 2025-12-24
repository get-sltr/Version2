'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

export default function PushNotificationsPage() {
  const { colors, darkMode } = useTheme();
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
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        background: colors.background,
        zIndex: 100
      }}>
        <a href="/settings" style={{ color: colors.text, textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Push Notifications</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '20px', lineHeight: 1.5 }}>
          Choose which notifications you want to receive on your device
        </p>

        {/* Master Toggle */}
        <ToggleRow
          label="Push Notifications"
          description="Enable all push notifications"
          value={settings.enabled}
          onChange={() => toggleSetting('enabled')}
          colors={colors}
          darkMode={darkMode}
        />

        {settings.enabled && (
          <>
            <div style={{ height: '20px', borderBottom: `8px solid ${colors.border}`, margin: '20px -20px' }} />

            <ToggleRow
              label="Messages"
              description="When someone sends you a message"
              value={settings.messages}
              onChange={() => toggleSetting('messages')}
              colors={colors}
              darkMode={darkMode}
            />

            <ToggleRow
              label="Matches"
              description="When you have a new match"
              value={settings.matches}
              onChange={() => toggleSetting('matches')}
              colors={colors}
              darkMode={darkMode}
            />

            <ToggleRow
              label="Likes & Taps"
              description="When someone likes or taps you"
              value={settings.likes}
              onChange={() => toggleSetting('likes')}
              colors={colors}
              darkMode={darkMode}
            />

            <ToggleRow
              label="Profile Views"
              description="When someone views your profile"
              value={settings.profileViews}
              onChange={() => toggleSetting('profileViews')}
              colors={colors}
              darkMode={darkMode}
            />

            <ToggleRow
              label="Nearby"
              description="When someone is nearby"
              value={settings.nearby}
              onChange={() => toggleSetting('nearby')}
              colors={colors}
              darkMode={darkMode}
            />

            <ToggleRow
              label="Promotions"
              description="Special offers and updates"
              value={settings.promotions}
              onChange={() => toggleSetting('promotions')}
              colors={colors}
              darkMode={darkMode}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange, colors, darkMode }: {
  label: string;
  description: string;
  value: boolean;
  onChange: () => void;
  colors: any;
  darkMode: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px 0',
      borderBottom: `1px solid ${colors.border}`
    }}>
      <div style={{ flex: 1, marginRight: '15px' }}>
        <div style={{ fontSize: '16px', marginBottom: '4px', color: colors.text }}>{label}</div>
        <div style={{ fontSize: '13px', color: colors.textSecondary }}>{description}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        style={{
          width: '50px',
          height: '30px',
          borderRadius: '15px',
          border: 'none',
          background: value ? '#FF6B35' : (darkMode ? '#333' : '#ccc'),
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        <div style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: '2px',
          left: value ? '22px' : '2px',
          transition: 'left 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}
