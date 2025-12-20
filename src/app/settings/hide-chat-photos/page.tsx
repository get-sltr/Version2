'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HideChatPhotosPage() {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(false);
  const [blurLevel, setBlurLevel] = useState<'light' | 'heavy'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('hideChatPhotos');
    if (saved) {
      const data = JSON.parse(saved);
      setIsEnabled(data.enabled || false);
      setBlurLevel(data.blurLevel || 'light');
    }
  }, []);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    localStorage.setItem('hideChatPhotos', JSON.stringify({
      enabled: newEnabled,
      blurLevel,
    }));
  };

  const handleBlurLevel = (level: 'light' | 'heavy') => {
    setBlurLevel(level);
    localStorage.setItem('hideChatPhotos', JSON.stringify({
      enabled: isEnabled,
      blurLevel: level,
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        gap: '16px',
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
            lineHeight: 1,
          }}
        >
          ←
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Hide Chat Photos
        </h1>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Info Banner */}
        <div style={{
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>🔒</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
            Privacy Protection
          </h3>
          <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6, textAlign: 'center' }}>
            Blur photos in your chat conversations for extra privacy. Tap on any photo to reveal it temporarily.
          </p>
        </div>

        {/* Main Toggle */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '4px' }}>
                Hide Photos in Chat
              </div>
              <div style={{ fontSize: '14px', color: '#888' }}>
                Blur all shared photos by default
              </div>
            </div>
            <button
              onClick={handleToggle}
              style={{
                width: '51px',
                height: '31px',
                borderRadius: '31px',
                background: isEnabled ? '#FF6B35' : '#333',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '27px',
                height: '27px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: isEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* Blur Level Options */}
        {isEnabled && (
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #333',
            }}>
              <div style={{ fontSize: '13px', color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>
                Blur Intensity
              </div>
            </div>

            <button
              onClick={() => handleBlurLevel('light')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                borderBottom: '1px solid #333',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', color: '#fff', marginBottom: '4px' }}>Light Blur</div>
                <div style={{ fontSize: '13px', color: '#888' }}>Subtle blur, shapes visible</div>
              </div>
              {blurLevel === 'light' && (
                <span style={{ color: '#FF6B35', fontSize: '20px' }}>✓</span>
              )}
            </button>

            <button
              onClick={() => handleBlurLevel('heavy')}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '17px', color: '#fff', marginBottom: '4px' }}>Heavy Blur</div>
                <div style={{ fontSize: '13px', color: '#888' }}>Strong blur, content hidden</div>
              </div>
              {blurLevel === 'heavy' && (
                <span style={{ color: '#FF6B35', fontSize: '20px' }}>✓</span>
              )}
            </button>
          </div>
        )}

        {/* Preview */}
        {isEnabled && (
          <div style={{
            background: '#1c1c1e',
            borderRadius: '16px',
            padding: '20px',
          }}>
            <div style={{ fontSize: '13px', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px' }}>
              Preview
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                filter: blurLevel === 'light' ? 'blur(8px)' : 'blur(20px)',
              }} />
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                filter: blurLevel === 'light' ? 'blur(8px)' : 'blur(20px)',
              }} />
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                filter: blurLevel === 'light' ? 'blur(8px)' : 'blur(20px)',
              }} />
            </div>
            <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '12px' }}>
              Tap any photo in chat to reveal it
            </p>
          </div>
        )}

        {/* Premium Badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          marginTop: '24px',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>⭐</div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Premium Feature
          </h4>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '16px', lineHeight: 1.6 }}>
            Hide Chat Photos is available with SLTR Premium
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
              cursor: 'pointer',
            }}
          >
            Upgrade Now
          </a>
        </div>
      </div>
    </div>
  );
}
