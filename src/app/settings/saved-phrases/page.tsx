'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SavedPhrasesPage() {
  const router = useRouter();
  const [phrases, setPhrases] = useState<string[]>([]);
  const [newPhrase, setNewPhrase] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Load saved phrases from localStorage
    const saved = localStorage.getItem('savedPhrases');
    if (saved) {
      setPhrases(JSON.parse(saved));
    } else {
      // Default phrases
      setPhrases([
        'Pretty open here. Vers/btm',
        'Into most things, kissing sucking',
        'Looking for now',
        'Can host',
        'What are you into?',
        'Send more pics?'
      ]);
    }
  }, []);

  const savePhrase = () => {
    if (newPhrase.trim()) {
      const updated = [...phrases, newPhrase.trim()];
      setPhrases(updated);
      localStorage.setItem('savedPhrases', JSON.stringify(updated));
      setNewPhrase('');
    }
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '16px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
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
      </header>

      <div style={{ padding: '20px' }}>
        {/* Info */}
        <div style={{
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          color: '#aaa',
          lineHeight: 1.6
        }}>
          💬 Quick reply templates that appear below your chat input. Tap to send instantly.
        </div>

        {/* Add New Phrase */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px'
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
              placeholder="Type your phrase..."
              maxLength={100}
              style={{
                flex: 1,
                background: '#000',
                border: '1px solid #333',
                borderRadius: '12px',
                padding: '14px 16px',
                color: '#fff',
                fontSize: '15px',
                outline: 'none'
              }}
            />
            <button
              onClick={savePhrase}
              disabled={!newPhrase.trim()}
              style={{
                background: newPhrase.trim() ? '#FF6B35' : '#333',
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
              Add
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'right' }}>
            {newPhrase.length}/100
          </div>
        </div>

        {/* Phrases List */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            Your Phrases ({phrases.length})
          </h3>
          
          {phrases.length === 0 ? (
            <div style={{
              background: '#1c1c1e',
              borderRadius: '16px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#666'
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
                    background: '#1c1c1e',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
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
                          background: '#000',
                          border: '1px solid #FF6B35',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          color: '#fff',
                          fontSize: '15px',
                          outline: 'none'
                        }}
                      />
                      <button
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
                        onClick={cancelEdit}
                        style={{
                          background: '#333',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 16px',
                          color: '#fff',
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
                        onClick={() => startEdit(index)}
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#fff',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
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

        {/* Premium Badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>⭐</div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Premium Feature
          </h4>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '16px', lineHeight: 1.6 }}>
            Unlimited saved phrases available with SLTR Premium
          </p>
          <a
            href="/premium"
            style={{
              display: 'inline-block',
              background: '#FF6B35',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            Upgrade Now
          </a>
        </div>
      </div>
    </div>
  );
}
