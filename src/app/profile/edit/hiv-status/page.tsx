'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { useTheme } from '../../../../contexts/ThemeContext';

const HIV_STATUS_OPTIONS = [
  'Negative',
  'Negative, on PrEP',
  'Positive',
  'Positive, Undetectable',
  'Don\'t know',
  'Prefer not to say',
];

export default function EditHivStatusPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        setError('Please log in to edit your HIV status.');
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('hiv_status')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message || 'Unable to load your HIV status.');
      } else if (profile?.hiv_status) {
        setSelectedStatus(profile.hiv_status);
      }

      setLoading(false);
    };

    void load();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      setError('Missing user session.');
      return;
    }

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ hiv_status: selectedStatus || null })
      .eq('id', userId);

    if (updateError) {
      setError(updateError.message || 'Unable to save HIV status.');
      setSaving(false);
      return;
    }

    router.back();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
    }}>
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
        <button
          onClick={() => router.back()}
          style={{
            color: colors.accent,
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>HIV Status</span>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          style={{
            color: saving || loading ? colors.textSecondary : colors.accent,
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 600,
            cursor: saving || loading ? 'default' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Description */}
        <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '20px' }}>
          Select your HIV status. This information helps others make informed decisions.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
            Loading...
          </div>
        ) : (
          <div style={{
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {HIV_STATUS_OPTIONS.map((status, index) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: index < HIV_STATUS_OPTIONS.length - 1 ? `1px solid ${colors.border}` : 'none',
                  color: colors.text,
                  fontSize: '15px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{status}</span>
                {selectedStatus === status && (
                  <span style={{ color: colors.accent, fontWeight: 600 }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(255,0,0,0.1)',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
