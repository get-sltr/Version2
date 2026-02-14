'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { IconBack, IconUser, IconArrowRight } from '@/components/Icons';

export default function SettingsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [savedPhrases, setSavedPhrases] = useState<string[]>([]);
  const [travelMode, setTravelMode] = useState<{ isActive: boolean; city: string } | null>(null);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(99);
  const [maxDistance, setMaxDistance] = useState(30);

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

      // Load saved phrases from localStorage
      const saved = localStorage.getItem('savedPhrases');
      if (saved) {
        setSavedPhrases(JSON.parse(saved));
      }

      // Load travel mode
      const travelData = localStorage.getItem('travelMode');
      if (travelData) {
        setTravelMode(JSON.parse(travelData));
      }

      // Load age range
      const savedMinAge = localStorage.getItem('minAge');
      const savedMaxAge = localStorage.getItem('maxAge');
      if (savedMinAge) setMinAge(parseInt(savedMinAge));
      if (savedMaxAge) setMaxAge(parseInt(savedMaxAge));

      // Load max distance
      const savedDistance = localStorage.getItem('maxDistance');
      if (savedDistance) setMaxDistance(parseInt(savedDistance));
    };

    loadProfile();
  }, [router]);

  const handleMinAgeChange = (value: string) => {
    const numValue = parseInt(value) || 18;
    const clamped = Math.max(18, Math.min(numValue, maxAge - 1));
    setMinAge(clamped);
    localStorage.setItem('minAge', clamped.toString());
  };

  const handleMaxAgeChange = (value: string) => {
    const numValue = parseInt(value) || 99;
    const clamped = Math.max(minAge + 1, Math.min(numValue, 99));
    setMaxAge(clamped);
    localStorage.setItem('maxAge', clamped.toString());
  };

  const handleDistanceChange = (value: string) => {
    const numValue = parseInt(value) || 30;
    const clamped = Math.max(1, Math.min(numValue, 100));
    setMaxDistance(clamped);
    localStorage.setItem('maxDistance', clamped.toString());
  };

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
      <header style={{ padding: '12px 20px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
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
          <a href="/dashboard" aria-label="Back to dashboard" style={{ position: 'absolute', left: '16px', color: '#FFFFFF', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 }}><IconBack size={24} /></a>
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
      <Section title="ACCOUNT">
        <a href="/settings/account" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Account Settings" hasArrow />
        </a>
        <MenuItem label="Phone Number" value={profile?.phone || 'Not set'} />
        <MenuItem label="Email" value={user?.email || 'Not set'} />
        <MenuItem label="Password" value="••••••••" />
      </Section>

      {/* Preferences */}
      <Section title="PREFERENCES">
        <MenuItem label="Distance Unit" value="Miles" hasArrow />
        <a href="/settings/show-me" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Show Me" value="Top, Bottom, Versatile, Top Vers, Btm Vers, Side" hasArrow />
        </a>
        {/* Age Range - Inline Inputs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid rgba(60, 60, 60, 0.6)' }}>
          <span style={{ fontSize: '16px', color: colors.text }}>Age Range</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              value={minAge}
              onChange={(e) => handleMinAgeChange(e.target.value)}
              min={18}
              max={98}
              style={{
                width: '50px',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                background: '#1c1c1e',
                color: colors.text,
                outline: 'none'
              }}
            />
            <span style={{ color: colors.textSecondary }}>-</span>
            <input
              type="number"
              value={maxAge}
              onChange={(e) => handleMaxAgeChange(e.target.value)}
              min={19}
              max={99}
              style={{
                width: '50px',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                background: '#1c1c1e',
                color: colors.text,
                outline: 'none'
              }}
            />
          </div>
        </div>
        {/* Max Distance - Inline Input */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid rgba(60, 60, 60, 0.6)' }}>
          <span style={{ fontSize: '16px', color: colors.text }}>Maximum Distance</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="number"
              value={maxDistance}
              onChange={(e) => handleDistanceChange(e.target.value)}
              min={1}
              max={100}
              style={{
                width: '55px',
                padding: '8px',
                fontSize: '14px',
                textAlign: 'center',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                background: '#1c1c1e',
                color: colors.text,
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>mi</span>
          </div>
        </div>
        <a href="/settings/saved-phrases" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem
            label="Saved Phrases"
            value={savedPhrases.length > 0 ? `${savedPhrases.length} phrase${savedPhrases.length > 1 ? 's' : ''}` : 'None'}
            hasArrow
          />
        </a>
        {/* Show preview of first phrase */}
        {savedPhrases.length > 0 && (
          <a href="/settings/saved-phrases" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
              padding: '12px 0',
              borderBottom: '1px solid rgba(60, 60, 60, 0.6)',
              fontSize: '13px',
              color: colors.textSecondary,
              fontStyle: 'italic'
            }}>
              "{savedPhrases[0].length > 40 ? savedPhrases[0].substring(0, 40) + '...' : savedPhrases[0]}"
            </div>
          </a>
        )}
      </Section>

      {/* Notifications */}
      <Section title="NOTIFICATIONS">
        <a href="/settings/push-notifications" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Push Notifications" hasArrow />
        </a>
      </Section>

      {/* Privacy */}
      <Section title="PRIVACY">
        <a href="/settings/travel-mode" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Travel Mode" value={travelMode?.isActive ? travelMode.city : 'Off'} hasArrow />
        </a>
        <a href="/settings/incognito" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Incognito Mode" value="Off" hasArrow />
        </a>
        <ToggleMenuItem label="Show Distance" storageKey="showDistance" />
        <ToggleMenuItem label="Show Age" storageKey="showAge" />
        <DbToggleMenuItem label="Long Session" column="long_session_visible" userId={user?.id} />
        <DbToggleMenuItem label="Hosting" column="is_hosting" userId={user?.id} />
        <DbToggleMenuItem label="Show NSFW Content" column="show_nsfw" userId={user?.id} />
        <a href="/settings/blocked-users" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Blocked Users" hasArrow />
        </a>
        <a href="/settings/hide-message-photos" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MenuItem label="Hide Message Photos" hasArrow />
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
          <MenuItem label="Rate Primal Men" hasArrow />
        </a>
      </Section>

      {/* Company Info */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: colors.textSecondary, fontSize: '12px', lineHeight: 1.6 }}>
        <div style={{ fontWeight: 600, marginBottom: '8px' }}>PRIMAL MEN</div>
        <div style={{ marginBottom: '8px' }}>YOUR BURNING DESIRE, UNLEASHED.</div>
        <div style={{ marginBottom: '8px' }}>Los Angeles, California</div>
        <div>© 2025–2026 Primal Men. All Rights Reserved.</div>
      </div>

      {/* Logout */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button onClick={handleLogout} style={{ width: '100%', background: 'transparent', border: `1px solid ${colors.accent}`, color: colors.accent, padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>
          Log Out
        </button>
        <a href="/settings/account/delete" style={{ width: '100%', background: 'transparent', border: '1px solid rgba(244,67,54,0.5)', color: '#f44336', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
          Delete Account
        </a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  const glassBg = 'rgba(28, 28, 30, 0.9)';
  const boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
  const borderColor = 'rgba(80, 80, 80, 0.5)';

  return (
    <div style={{ padding: '20px', marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textSecondary, marginBottom: '10px', paddingLeft: '5px' }}>{title}</div>
      <div style={{
        position: 'relative',
        background: glassBg,
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow,
        border: `1px solid ${borderColor}`
      }}>
        <div style={{ padding: '0 15px', position: 'relative', zIndex: 0, color: colors.text }}>{children}</div>
      </div>
    </div>
  );
}

function MenuItem({ label, value, hasArrow }: { label: string; value?: string; hasArrow?: boolean }) {
  const { colors } = useTheme();
  const borderStyle = '1px solid rgba(60, 60, 60, 0.6)';

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
  const { colors } = useTheme();
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

  const borderStyle = '1px solid rgba(60, 60, 60, 0.6)';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: borderStyle }}>
      <span id={`toggle-label-${storageKey}`} style={{ fontSize: '16px', color: colors.text }}>{label}</span>
      <button
        role="switch"
        aria-checked={enabled}
        aria-labelledby={`toggle-label-${storageKey}`}
        onClick={handleToggle}
        style={{
          width: '51px',
          height: '31px',
          background: enabled ? colors.accent : '#333',
          borderRadius: '16px',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.3s',
          minWidth: '44px',
          minHeight: '31px',
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

function DbToggleMenuItem({ label, column, userId }: { label: string; column: string; userId?: string }) {
  const { colors } = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select(column)
        .eq('user_id', userId)
        .maybeSingle();
      if (data) setEnabled(!!(data as any)[column]);
      setLoaded(true);
    };
    load();
  }, [userId, column]);

  const handleToggle = async () => {
    if (!userId) return;
    const newValue = !enabled;
    setEnabled(newValue);
    await supabase
      .from('user_settings')
      .upsert({ user_id: userId, [column]: newValue } as any, { onConflict: 'user_id' });
  };

  const borderStyle = '1px solid rgba(60, 60, 60, 0.6)';

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: borderStyle }}>
      <span style={{ fontSize: '16px', color: colors.text }}>{label}</span>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={!loaded}
        style={{
          width: '51px',
          height: '31px',
          background: enabled ? colors.accent : '#333',
          borderRadius: '16px',
          border: 'none',
          position: 'relative',
          cursor: loaded ? 'pointer' : 'default',
          transition: 'background 0.3s',
          minWidth: '44px',
          minHeight: '31px',
          opacity: loaded ? 1 : 0.5,
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
