'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { uploadAvatar } from '@/lib/api/profileMedia';
import { compressImage } from '@/lib/imageUtils';

export function PhotoGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'loading' | 'gate' | 'pass'>('loading');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // Unauthenticated users pass through (login page etc.)
      if (!user) {
        setState('pass');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('photo_url')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.photo_url) {
        setState('pass');
      } else {
        setState('gate');
      }
    };

    check();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const compressed = await compressImage(file);
      await uploadAvatar(compressed);
      setState('pass');
    } catch (err: any) {
      console.error('PhotoGate upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (state === 'loading') return null;
  if (state === 'pass') return <>{children}</>;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000',
      color: '#fff',
      zIndex: 99998,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #FF6B35 50%, #ffffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          PRIMAL
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '8px' }}>
          Add a Profile Photo
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}>
          Your first photo should clearly show your face. This helps others know who they&apos;re connecting with.
        </p>

        {error && (
          <div style={{
            background: 'rgba(244,67,54,0.1)',
            border: '1px solid rgba(244,67,54,0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#ff8888',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Circular upload area */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: '2px dashed rgba(255,107,53,0.5)',
            background: 'rgba(255,107,53,0.08)',
            margin: '0 auto 24px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '56px',
            transition: 'border-color 0.2s',
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? (
            <span style={{ fontSize: '16px', color: '#FF6B35' }}>Uploading...</span>
          ) : (
            <span role="img" aria-label="camera">📸</span>
          )}
        </label>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '18px',
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            background: 'rgba(255,107,53,0.15)',
            border: '1px solid rgba(255,107,53,0.5)',
            borderRadius: '12px',
            color: '#FF6B35',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading ? 'Uploading...' : 'Choose Photo'}
        </button>
      </div>
    </div>
  );
}
