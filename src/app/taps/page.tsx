'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { getReceivedTaps, getSentTaps, markTapViewed, sendTap } from '@/lib/api/taps';
import { IconFlame, IconWave, IconWink, IconEye, IconClose, IconMenu, IconLocation } from '@/components/Icons';
import BottomNavWithBadges from '@/components/BottomNavWithBadges';
import type { TapWithUser, TapType } from '@/types/database';
import posthog from 'posthog-js';

const formatRelativeTime = (isoDate: string) => {
  const timestamp = new Date(isoDate).getTime();
  if (Number.isNaN(timestamp)) return '';

  const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
  return new Date(isoDate).toLocaleDateString();
};

const TapIcon = ({ tapType, size = 16 }: { tapType: TapType; size?: number }) => {
  switch (tapType) {
    case 'flame': return <IconFlame size={size} />;
    case 'wave': return <IconWave size={size} />;
    case 'wink': return <IconWink size={size} />;
    case 'looking': return <IconEye size={size} />;
    default: return <IconFlame size={size} />;
  }
};

export default function TapsPage() {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedTaps, setReceivedTaps] = useState<TapWithUser[]>([]);
  const [sentTaps, setSentTaps] = useState<TapWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTaps();
  }, []);

  const loadTaps = async () => {
    try {
      setLoading(true);
      setError(null);
      const [received, sent] = await Promise.all([
        getReceivedTaps(),
        getSentTaps()
      ]);
      setReceivedTaps(received);
      setSentTaps(sent);
    } catch (err: any) {
      setError(err.message || 'Failed to load taps');
    } finally {
      setLoading(false);
    }
  };

  const handleTapBack = async (userId: string, tapType: TapType = 'flame') => {
    try {
      await sendTap(userId, tapType);
      const sent = await getSentTaps();
      setSentTaps(sent);

      // Capture tap_back_sent event in PostHog
      posthog.capture('tap_back_sent', {
        recipient_id: userId,
        tap_type: tapType,
      });

      alert('Tap sent!');
    } catch (err: any) {
      alert(err.message || 'Failed to send tap');
    }
  };

  const handleViewTap = async (tapId: string) => {
    try {
      await markTapViewed(tapId);
      setReceivedTaps(receivedTaps.map(tap =>
        tap.id === tapId ? { ...tap, viewed_at: new Date().toISOString() } : tap
      ));
    } catch (err) {
      // Silently fail
    }
  };

  const taps = activeTab === 'received' ? receivedTaps : sentTaps;
  const unviewedCount = receivedTaps.filter(t => !t.viewed_at).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Cormorant Garamond', 'Space Mono', -apple-system, BlinkMacSystemFont, serif",
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <header style={{
        padding: '15px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 15px)',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        background: colors.background,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <Link href="/dashboard" aria-label="Back to dashboard" style={{ color: colors.text, textDecoration: 'none', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconClose size={24} />
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Taps</h1>
          <Link href="/settings" aria-label="Settings" style={{ color: colors.text, textDecoration: 'none', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconMenu size={24} />
          </Link>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('received')}
            style={{
              flex: 1,
              background: activeTab === 'received' ? colors.accent : 'rgba(128, 128, 128, 0.15)',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              color: activeTab === 'received' ? '#fff' : colors.text,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: activeTab === 'received' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
              position: 'relative'
            }}
          >
            Received
            {unviewedCount > 0 && (
              <span style={{
                marginLeft: '6px',
                background: '#fff',
                color: colors.accent,
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {unviewedCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            style={{
              flex: 1,
              background: activeTab === 'sent' ? colors.accent : 'rgba(128, 128, 128, 0.15)',
              border: 'none',
              borderRadius: '4px',
              padding: '10px',
              color: activeTab === 'sent' ? '#fff' : colors.text,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: activeTab === 'sent' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            Sent {sentTaps.length > 0 && `(${sentTaps.length})`}
          </button>
        </div>
      </header>

      {/* Info Banner */}
      <div style={{
        padding: '15px 20px',
        background: 'rgba(255,107,53,0.1)',
        borderBottom: `1px solid ${colors.border}`,
        fontSize: '14px',
        lineHeight: 1.5,
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <IconFlame size={20} />
        <span>
          {activeTab === 'received'
            ? "Someone's interested! Tap back or send a message."
            : "Your taps will appear here. They'll be notified when you tap them."}
        </span>
      </div>

      {/* Content */}
      <div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            Loading taps...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.accent }}>
            <div style={{ marginBottom: '16px' }}>{error}</div>
            <button
              onClick={loadTaps}
              style={{
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && taps.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '20px', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
              {activeTab === 'received' ? <IconWave size={64} /> : <IconFlame size={64} />}
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: colors.text }}>
              {activeTab === 'received' ? 'No Taps Yet' : 'No Sent Taps'}
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              {activeTab === 'received'
                ? "When someone taps you, they'll show up here"
                : 'Tap someone on their profile to show interest'}
            </p>
          </div>
        )}

        {!loading && !error && taps.length > 0 && taps.map(tap => (
          <div
            key={tap.id}
            onClick={() => activeTab === 'received' && !tap.viewed_at && handleViewTap(tap.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              padding: '15px 20px',
              borderBottom: `1px solid ${colors.border}`,
              position: 'relative',
              background: activeTab === 'received' && !tap.viewed_at
                ? 'rgba(255,107,53,0.05)'
                : 'transparent'
            }}
          >
            {/* Profile Image */}
            <Link
              href={`/profile/${tap.user.id}`}
              style={{ position: 'relative', flexShrink: 0, textDecoration: 'none' }}
            >
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#333',
                  backgroundImage: tap.user.photo_url ? `url(${tap.user.photo_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              {tap.user.is_online && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: colors.accent,
                    border: `3px solid ${colors.background}`
                  }}
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: colors.accent,
                  border: `2px solid ${colors.background}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
              >
                <TapIcon tapType={tap.tap_type} size={16} />
              </div>
            </Link>

            {/* User Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <Link
                  href={`/profile/${tap.user.id}`}
                  style={{ fontSize: '17px', fontWeight: 600, textDecoration: 'none', color: colors.text }}
                >
                  {tap.user.display_name || 'User'}
                </Link>
                <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                  {formatRelativeTime(tap.created_at)}
                </div>
              </div>
              {tap.user.distance && (
                <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconLocation size={14} /> {tap.user.distance} away
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {activeTab === 'received' ? (
                  <>
                    <Link
                      href={`/messages/${tap.user.id}`}
                      style={{
                        flex: 1,
                        background: colors.accent,
                        border: `2px solid ${colors.background}`,
                        borderRadius: '4px',
                        padding: '10px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block',
                        boxShadow: '0 2px 12px rgba(255,107,53,0.3)'
                      }}
                    >
                      Message
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTapBack(tap.user.id); }}
                      style={{
                        flex: 1,
                        background: 'rgba(128, 128, 128, 0.15)',
                        border: `2px solid ${colors.background}`,
                        borderRadius: '4px',
                        padding: '10px',
                        color: colors.text,
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      Tap Back <IconFlame size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/profile/${tap.user.id}`}
                      style={{
                        flex: 1,
                        background: 'rgba(128, 128, 128, 0.15)',
                        border: `2px solid ${colors.background}`,
                        borderRadius: '4px',
                        padding: '10px',
                        color: colors.text,
                        fontSize: '14px',
                        fontWeight: 600,
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'block',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      View Profile
                    </Link>
                    <div style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      color: tap.viewed_at ? colors.accent : colors.textSecondary,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {tap.viewed_at ? <><IconEye size={16} /> Viewed</> : 'Not viewed'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNavWithBadges />
    </div>
  );
}
