'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { IconBack, IconUser, IconArrowRight } from '@/components/Icons';

export default function SettingsPage() {
  const router = useRouter();
  const { darkMode, toggleDarkMode, colors } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }
      setUser(authUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif", paddingBottom: '40px' }}>
      {/* Header */}
      <header style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{
          width: '100%',
          maxWidth: '780px',
          background: '#FF6B35',
          color: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12), inset 0 0 18px rgba(255,255,255,0.18)',
          border: '1px solid rgba(255, 107, 53, 0.9)',
          padding: '12px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <a href="/dashboard" style={{ position: 'absolute', left: '16px', color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center' }}><IconBack size={24} /></a>
          <span style={{ fontSize: '17px', fontWeight: 700 }}>Settings</span>
        </div>
      </header>

      {/* Profile Section */}
      <div style={{ padding: '20px', borderBottom: `8px solid ${colors.border}` }}>
        <a href="/profile/edit" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: colors.text }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: colors.surface, backgroundImage: profile?.photo_url ? `url(${profile.photo_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FF6B35', boxShadow: '0 0 18px rgba(255, 107, 53, 0.35), inset 0 0 10px rgba(255,255,255,0.35)' }}>
            {!profile?.photo_url && <IconUser size={24} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>{profile?.display_name || 'Edit Profile'}</div>
            <div style={{ fontSize: '14px', color: colors.textSecondary, marginTop: '4px' }}>Update your photos and info</div>
          </div>
          <span style={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}><IconArrowRight size={20} /></span>
        </a>
      </div>

      {/* Account */}
      <Section title="ACCOUNT" glow="strong">
        <a href="/settings/account" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Account Settings" hasArrow accentBorder />
        </a>
        <MenuItem label="Phone Number" value={profile?.phone || 'Not set'} accentBorder />
        <MenuItem label="Email" value={user?.email || 'Not set'} accentBorder />
        <MenuItem label="Password" value="••••••••" accentBorder />
      </Section>

      {/* Preferences */}
      <Section title="PREFERENCES" glow="soft">
        <MenuItem label="Distance Unit" value="Miles" hasArrow />
        <a href="/settings/show-me" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Show Me" value="Top, Bottom, Versatile, Top Vers, Btm Vers, Side" hasArrow />
        </a>
        <a href="/settings/age-range" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Age Range" value="18-80" hasArrow />
        </a>
        <a href="/settings/max-distance" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Maximum Distance" value="30 mi" hasArrow />
        </a>
        <a href="/settings/saved-phrases" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Saved Phrases" hasArrow />
        </a>
      </Section>

      {/* Notifications */}
      <Section title="NOTIFICATIONS" glow="soft">
        <a href="/settings/push-notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Push Notifications" hasArrow />
        </a>
        <a href="/settings/email-notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Email Notifications" hasArrow />
        </a>
      </Section>

      {/* Display */}
      <Section title="DISPLAY">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: '15px' }}>Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            style={{
              width: '51px',
              height: '31px',
              background: darkMode ? colors.accent : colors.surface,
              borderRadius: '16px',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.3s'
            }}
          >
            <div style={{
              width: '27px',
              height: '27px',
              background: '#fff',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: darkMode ? '22px' : '2px',
              transition: 'left 0.3s'
            }} />
          </button>
        </div>
      </Section>

      {/* Privacy */}
      <Section title="PRIVACY">
        <a href="/settings/travel-mode" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Travel Mode" value="Off" hasArrow />
        </a>
        <a href="/settings/incognito" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Incognito Mode" value="Off" hasArrow />
        </a>
        <a href="/settings/show-distance" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Show Distance" hasArrow />
        </a>
        <a href="/settings/show-age" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Show Age" hasArrow />
        </a>
        <ToggleMenuItem label="PnP" storageKey="pnp" />
        <a href="/settings/blocked-users" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Blocked Users" hasArrow />
        </a>
        <a href="/settings/hide-chat-photos" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Hide Chat Photos" hasArrow />
        </a>
      </Section>

      {/* Legal */}
      <Section title="LEGAL">
        <a href="/terms" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Terms of Service" hasArrow />
        </a>
        <a href="/privacy" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Privacy Policy" hasArrow />
        </a>
        <a href="/guidelines" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Community Guidelines" hasArrow />
        </a>
      </Section>

      {/* App Info */}
      <Section title="APP">
        <MenuItem label="Version" value="2.0" />
        <a href="/settings/help" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Help & Support" hasArrow />
        </a>
        <a href="/settings/priority-support" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Priority Support" value={profile?.is_premium ? '⭐ Active' : ''} hasArrow />
        </a>
        <a href="/settings/rate" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Rate SLTR" hasArrow />
        </a>
      </Section>

      {/* Company Info */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: colors.textSecondary, fontSize: '12px', lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>SLTR DIGITAL LLC</div>
        <div style={{ marginBottom: '8px' }}>INNOVATIVE | INTELLIGENCE | INTUITIVE</div>
        <div style={{ marginBottom: '8px' }}>Los Angeles, California</div>
        <div>© 2025 SLTR Digital LLC. All Rights Reserved.</div>
      </div>

      {/* Logout */}
      <div style={{ padding: '20px' }}>
        <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.accent}`, color: colors.accent, padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
          Log Out
        </button>
      </div>
    </div>
  );
}

function Section({ title, glow, children }: { title: string; glow?: 'soft' | 'strong'; children: React.ReactNode }) {
  const { colors, darkMode } = useTheme();
  // Glass background adapts to theme
  const glassBg = darkMode
    ? 'rgba(28, 28, 30, 0.9)'  // Dark glass
    : 'rgba(255, 255, 255, 0.95)';  // Light glass
  const boxShadow = glow === 'strong'
    ? '0 8px 28px rgba(0,0,0,0.18), inset 0 0 24px rgba(255,107,53,0.08)'
    : '0 6px 22px rgba(0,0,0,0.12), inset 0 0 18px rgba(180,180,180,0.08)';
  const borderColor = darkMode ? 'rgba(255, 107, 53, 0.4)' : 'rgba(255, 107, 53, 0.6)';
  const innerBorderColor = darkMode ? 'rgba(80, 80, 80, 0.4)' : 'rgba(180, 180, 180, 0.4)';

  return (
    <div style={{ padding: '20px', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '10px', paddingLeft: '5px' }}>{title}</div>
      <div style={{
        position: 'relative',
        background: glassBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow
      }}>
        {/* Orange rim border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          border: `2px solid ${borderColor}`,
          pointerEvents: 'none',
          zIndex: 2
        }} />
        {/* Glass border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          border: `1px solid ${innerBorderColor}`,
          pointerEvents: 'none',
          zIndex: 1
        }} />
        <div style={{ padding: '0 15px', position: 'relative', zIndex: 0, color: colors.text }}>{children}</div>
      </div>
    </div>
  );
}

function MenuItem({ label, value, hasArrow, accentBorder }: { label: string; value?: string; hasArrow?: boolean; accentBorder?: boolean }) {
  const { colors, darkMode } = useTheme();
  const borderStyle = accentBorder
    ? `2px solid ${darkMode ? 'rgba(255, 107, 53, 0.5)' : 'rgba(255, 107, 53, 0.7)'}`
    : `1px solid ${darkMode ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.8)'}`;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: borderStyle }}>
      <span style={{ fontSize: '16px', color: colors.text }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {value && <span style={{ fontSize: '14px', color: colors.textSecondary, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>}
        {hasArrow && <span style={{ color: colors.textSecondary, display: 'flex', alignItems: 'center' }}><IconArrowRight size={16} /></span>}
      </div>
    </div>
  );
}

function ToggleMenuItem({ label, storageKey }: { label: string; storageKey: string }) {
  const { colors, darkMode } = useTheme();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'yes') setEnabled(true);
  }, [storageKey]);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem(storageKey, newValue ? 'yes' : 'no');
  };

  const borderStyle = `1px solid ${darkMode ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.8)'}`;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: borderStyle }}>
      <span style={{ fontSize: '16px', color: colors.text }}>{label}</span>
      <button
        onClick={handleToggle}
        style={{
          width: '51px',
          height: '31px',
          background: enabled ? colors.accent : (darkMode ? '#333' : '#ccc'),
          borderRadius: '16px',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.3s'
        }}
      >
        <div style={{
          width: '27px',
          height: '27px',
          background: '#fff',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: enabled ? '22px' : '2px',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}
