'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useTheme } from '../../../contexts/ThemeContext';

const FREE_PHRASE_LIMIT = 1;

export default function SavedPhrasesPage() {
  const router = useRouter();
  const { colors, darkMode } = useTheme();
  const [phrases, setPhrases] = useState<string[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // Check premium status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        // Premium if is_premium is true
        const hasPremium = profile?.is_premium === true;
        setIsPremium(hasPremium);
      }

      // Load saved phrases from localStorage
      const saved = localStorage.getItem('savedPhrases');
      if (saved) {
        setPhrases(JSON.parse(saved));
      } else {
        // Default: 1 phrase for free users
        setPhrases(['What are you into?']);
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const canAddMore = isPremium || phrases.length < FREE_PHRASE_LIMIT;

  const savePhrase = () => {
    if (!newPhrase.trim()) return;

    if (!canAddMore) {
      router.push('/premium');
      return;
    }

    const updated = [...phrases, newPhrase.trim()];
    setPhrases(updated);
    localStorage.setItem('savedPhrases', JSON.stringify(updated));
    setNewPhrase('');
  };

  const deletePhrase = (index: number) => {
    const updated = phrases.filter((_, i) => i !== index);
    setPhrases(updated);
    localStorage.setItem('savedPhrases', JSON.stringify(updated));
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(phrases[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editText.trim()) {
      const updated = [...phrases];
      updated[editingIndex] = editText.trim();
      setPhrases(updated);
      localStorage.setItem('savedPhrases', JSON.stringify(updated));
      setEditingIndex(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.textSecondary }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: darkMode ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '28px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Saved Phrases
        </h1>
        {isPremium && (
          <span style={{
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            color: '#000',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            ⭐ PREMIUM
          </span>
        )}
      </header>

      <div style={{ padding: '20px' }}>
        {/* Info */}
        <div style={{
          background: darkMode ? 'rgba(255,107,53,0.1)' : 'rgba(255,107,53,0.08)',
          border: `1px solid ${darkMode ? 'rgba(255,107,53,0.3)' : 'rgba(255,107,53,0.2)'}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: colors.textSecondary,
          lineHeight: 1.6
        }}>
          💬 Quick reply templates that appear below your message input. Tap to send instantly.
        </div>

        {/* Limit indicator for free users */}
        {!isPremium && (
          <div style={{
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px', color: colors.textSecondary }}>
              Phrases: {phrases.length}/{FREE_PHRASE_LIMIT}
            </span>
            <a
              href="/premium"
              style={{
                color: '#FF6B35',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Upgrade for unlimited →
            </a>
          </div>
        )}

        {/* Add New Phrase */}
        <div style={{
          background: colors.surface,
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            Add New Phrase
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && savePhrase()}
              placeholder={canAddMore ? "Type your phrase..." : "Upgrade for more phrases"}
              maxLength={100}
              disabled={!canAddMore}
              style={{
                flex: 1,
                background: colors.background,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                padding: '14px 16px',
                color: colors.text,
                fontSize: '15px',
                outline: 'none',
                opacity: canAddMore ? 1 : 0.5
              }}
            />
            <button
              type="button"
              onClick={savePhrase}
              disabled={!newPhrase.trim()}
              style={{
                background: newPhrase.trim() ? '#FF6B35' : (darkMode ? '#333' : '#ccc'),
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: newPhrase.trim() ? 'pointer' : 'not-allowed',
                opacity: newPhrase.trim() ? 1 : 0.5
              }}
            >
              {canAddMore ? 'Add' : '🔒'}
            </button>
          </div>
          {canAddMore && (
            <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px', textAlign: 'right' }}>
              {newPhrase.length}/100
            </div>
          )}
        </div>

        {/* Phrases List */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Your Phrases ({phrases.length})
          </h3>

          {phrases.length === 0 ? (
            <div style={{
              background: colors.surface,
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
              <div>No saved phrases yet</div>
              <div style={{ fontSize: '13px', marginTop: '8px' }}>
                Add your first phrase above
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {phrases.map((phrase, index) => (
                <div
                  key={index}
                  style={{
                    background: colors.surface,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {editingIndex === index ? (
                    <>
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        maxLength={100}
                        autoFocus
                        style={{
                          flex: 1,
                          background: colors.background,
                          border: '1px solid #FF6B35',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: colors.text,
                          fontSize: '15px',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        style={{
                          background: '#FF6B35',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        style={{
                          background: darkMode ? '#333' : '#ddd',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          color: colors.text,
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{
                        flex: 1,
                        fontSize: '15px',
                        lineHeight: 1.5
                      }}>
                        {phrase}
                      </div>
                      <button
                        type="button"
                        onClick={() => startEdit(index)}
                        style={{
                          background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: colors.text,
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePhrase(index)}
                        style={{
                          background: 'rgba(255,59,48,0.15)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#FF3B30',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium Upgrade CTA - only show for non-premium */}
        {!isPremium && (
          <div style={{
            background: `linear-gradient(135deg, ${darkMode ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.1)'} 0%, ${darkMode ? 'rgba(255,107,53,0.05)' : 'rgba(255,107,53,0.02)'} 100%)`,
            border: `1px solid ${darkMode ? 'rgba(255,107,53,0.3)' : 'rgba(255,107,53,0.2)'}`,
            borderRadius: '16px',
            padding: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              Unlock Unlimited Phrases
            </h4>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px', lineHeight: 1.6 }}>
              Premium members get unlimited saved phrases to speed up their conversations
            </p>
            <a
              href="/premium"
              style={{
                display: 'inline-block',
                background: '#FF6B35',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 36px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              Upgrade to Premium
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
