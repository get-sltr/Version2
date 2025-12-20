'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabase';
import { useTheme } from '../../../../contexts/ThemeContext';

const TAGS = [
  'adventurous',
  'anime',
  'art',
  'beach',
  'bear',
  'beard',
  'bi',
  'bdsm',
  'brunch',
  'chub',
  'cleancut',
  'college',
  'concerts',
  'cooking',
  'couple',
  'cub',
  'cuddling',
  'daddy',
  'dancing',
  'dating',
  'discreet',
  'diy',
  'dom',
  'drag',
  'drugfree',
  'fashion',
  'femme',
  'ff',
  'friends',
  'ftm',
  'fwb',
  'gaming',
  'gaymer',
  'gear',
  'geek',
  'gym',
  'hairy',
  'hiking',
  'jock',
  'karaoke',
  'kissing',
  'leather',
  'lesbian',
  'ltr',
  'masc',
  'military',
  'movies',
  'mtf',
  'muscle',
  'music',
  'naps',
  'nerd',
  'nosmoking',
  'nudist',
  'oral',
  'otter',
  'outgoing',
  'parent',
  'pickleball',
  'piercings',
  'poly',
  'poz',
  'pup',
  'reading',
  'reliable',
  'roleplay',
  'romantic',
  'rough',
  'rugged',
  'sauna',
  'shy',
  'smooth',
  'sober',
  'sub',
  'tattoos',
  'tennis',
  'theater',
  'trans',
  'tv',
  'twink',
  'twunk',
  'vanilla',
  'weightlifting',
  'workingout',
  'writing',
  'yoga',
];

export default function EditTagsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
        setError('Please log in to edit your tags.');
        setLoading(false);
        return;
      }

      setUserId(user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tags')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message || 'Unable to load your tags.');
      } else if (profile?.tags) {
        setSelectedTags(profile.tags);
      }

      setLoading(false);
    };

    void load();
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 10) {
        return prev;
      }
      return [...prev, tag];
    });
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
      .update({ tags: selectedTags })
      .eq('id', userId);

    if (updateError) {
      setError(updateError.message || 'Unable to save tags.');
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
        <span style={{ fontSize: '17px', fontWeight: 600 }}>My Tags</span>
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
          Select up to 10 tags that describe you.
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
                {selectedTags.length > 0
                  ? `${selectedTags.length}/10 selected`
                  : 'Select tags...'}
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
                {TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const isDisabled = !isSelected && selectedTags.length >= 10;
                  return (
                    <button
                      key={tag}
                      onClick={() => !isDisabled && toggleTag(tag)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${colors.border}`,
                        color: isDisabled ? colors.textSecondary : colors.text,
                        fontSize: '15px',
                        textAlign: 'left',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: isDisabled ? 0.5 : 1
                      }}
                    >
                      <span>{tag}</span>
                      {isSelected && (
                        <span style={{ color: colors.accent, fontWeight: 600 }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Tags Display */}
            {selectedTags.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <div style={{
                  fontSize: '13px',
                  color: colors.textSecondary,
                  marginBottom: '10px',
                  textTransform: 'uppercase'
                }}>
                  Selected ({selectedTags.length}/10)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
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
                      {tag}
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
