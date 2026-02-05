'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';

export default function LongSessionPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSetting = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Load from database
      const { data: settings } = await supabase
        .from('user_settings')
        .select('long_session_visible')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        setAnswer(settings.long_session_visible ? 'yes' : 'no');
      }
      setLoading(false);
    };

    loadSetting();
  }, [router]);

  const handleSelect = async (value: 'yes' | 'no') => {
    setAnswer(value);
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save to database
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        long_session_visible: value === 'yes'
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving Long Session setting:', error);
    }

    // Also store in localStorage for quick access
    localStorage.setItem('long_session', value);
    setSaving(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Cormorant Garamond', 'Space Mono', -apple-system, BlinkMacSystemFont, serif" }}>
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, background: colors.background, zIndex: 100 }}>
        <a href="/settings" style={{ color: colors.text, textDecoration: 'none', fontSize: '24px' }}>‹</a>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Long Session Preferred</span>
        <span style={{ width: '24px' }}></span>
      </header>

      <div style={{ padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <p style={{ fontSize: '16px', color: colors.textSecondary, lineHeight: 1.6 }}>
            Show others that you prefer longer hangout sessions.
            This adds a special indicator to your profile.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
          <button
            onClick={() => handleSelect('yes')}
            disabled={saving}
            style={{
              flex: 1,
              padding: '20px',
              background: answer === 'yes' ? '#FF6B35' : colors.surface,
              border: answer === 'yes' ? '2px solid #FF6B35' : `2px solid ${colors.border}`,
              borderRadius: '12px',
              color: colors.text,
              fontSize: '18px',
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              opacity: saving ? 0.7 : 1
            }}
          >
            Yes
          </button>
          <button
            onClick={() => handleSelect('no')}
            disabled={saving}
            style={{
              flex: 1,
              padding: '20px',
              background: answer === 'no' ? '#FF6B35' : colors.surface,
              border: answer === 'no' ? '2px solid #FF6B35' : `2px solid ${colors.border}`,
              borderRadius: '12px',
              color: colors.text,
              fontSize: '18px',
              fontWeight: 600,
              cursor: saving ? 'wait' : 'pointer',
              transition: 'all 0.2s',
              opacity: saving ? 0.7 : 1
            }}
          >
            No
          </button>
        </div>

        {answer === 'yes' && (
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: colors.textSecondary }}>
            Your profile will show the long session indicator to other users.
          </p>
        )}
      </div>
    </div>
  );
}
