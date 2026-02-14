'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { useTheme } from '../../../../contexts/ThemeContext';

const TRIBES = [
  'Bear',
  'Clean-Cut',
  'Daddy',
  'Discreet',
  'Geek',
  'Jock',
  'Leather',
  'Military',
  'Otter',
  'Poz',
  'Pup',
  'Queer',
  'Rugged',
  'Trans',
  'Twink',
];

export default function EditTribesPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedTribes, setSelectedTribes] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) {
        setError('Please log in to edit your tribes.');
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tribes')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message || 'Unable to load your tribes.');
      } else if (profile?.tribes) {
        setSelectedTribes(profile.tribes);
      }

      setLoading(false);
    };

    void load();
  }, []);

  const toggleTribe = (tribe: string) => {
    setSelectedTribes((prev) =>
      prev.includes(tribe) ? prev.filter((t) => t !== tribe) : [...prev, tribe]
    );
  };

  const handleSave = async () => {
    if (!userId) {
      setError('Missing user session.');
      return;
    }

    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tribes: selectedTribes })
      .eq('id', userId);

    if (updateError) {
      setError(updateError.message || 'Unable to save tribes.');
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
        <span style={{ fontSize: '17px', fontWeight: 600 }}>My Tribes</span>
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
          Select the tribes you identify with.
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Dropdown Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '15px',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>
                {selectedTribes.length > 0
                  ? `${selectedTribes.length} selected`
                  : 'Select tribes...'}
              </span>
              <span style={{ color: colors.textSecondary }}>
                {dropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div style={{
                marginTop: '4px',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {TRIBES.map((tribe) => (
                  <button
                    key={tribe}
                    onClick={() => toggleTribe(tribe)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.text,
                      fontSize: '15px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{tribe}</span>
                    {selectedTribes.includes(tribe) && (
                      <span style={{ color: colors.accent, fontWeight: 600 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Tribes Display */}
            {selectedTribes.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  marginBottom: '10px',
                  textTransform: 'uppercase'
                }}>
                  Selected
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedTribes.map((tribe) => (
                    <button
                      key={tribe}
                      onClick={() => toggleTribe(tribe)}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(255,107,53,0.15)',
                        border: `1px solid ${colors.accent}`,
                        borderRadius: '6px',
                        color: colors.accent,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {tribe}
                      <span style={{ fontSize: '12px' }}>×</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
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
