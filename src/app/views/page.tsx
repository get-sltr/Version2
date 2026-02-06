'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { usePremium } from '@/hooks/usePremium';
import { getProfileViews, markViewSeen, markAllViewsSeen, type ProfileViewWithViewer } from '@/lib/api/views';
import { IconClose, IconMenu, IconLocation } from '@/components/Icons';
import BottomNavWithBadges from '@/components/BottomNavWithBadges';

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

// Flame icon component
function FlameIcon({ size = 20, color = '#ff6b35' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M10 22C6 22 3 18.5 3 15C3 10 10 2 10 2C10 2 17 10 17 15C17 18.5 14 22 10 22Z"
        fill={color}
      />
      <path
        d="M16 18C13.5 18 11.5 15.8 11.5 13.5C11.5 10 16 5 16 5C16 5 20.5 10 20.5 13.5C20.5 15.8 18.5 18 16 18Z"
        fill={color}
        fillOpacity={0.4}
      />
    </svg>
  );
}

export default function ViewsPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [views, setViews] = useState<ProfileViewWithViewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadViews();
  }, []);

  const loadViews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfileViews();
      setViews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load views');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSeen = async (viewId: string) => {
    try {
      await markViewSeen(viewId);
      setViews(views.map(view =>
        view.id === viewId ? { ...view, seen_at: new Date().toISOString() } : view
      ));
    } catch (err) {
      // Silently fail
    }
  };

  const handleMarkAllSeen = async () => {
    try {
      await markAllViewsSeen();
      setViews(views.map(view => ({ ...view, seen_at: new Date().toISOString() })));
    } catch (err) {
      // Silently fail
    }
  };

  const unseenCount = views.filter(v => !v.seen_at).length;

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/dashboard" aria-label="Back to dashboard" style={{ color: colors.text, textDecoration: 'none', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconClose size={24} />
          </Link>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>Views</h1>
          <Link href="/settings" aria-label="Settings" style={{ color: colors.text, textDecoration: 'none', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconMenu size={24} />
          </Link>
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
        justifyContent: 'space-between',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FlameIcon size={20} />
          <span>People who checked out your profile</span>
        </div>
        {unseenCount > 0 && (
          <button
            onClick={handleMarkAllSeen}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.accent}`,
              borderRadius: '4px',
              padding: '6px 12px',
              color: colors.accent,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mark all seen
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            Loading views...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.accent }}>
            <div style={{ marginBottom: '16px' }}>{error}</div>
            <button
              onClick={loadViews}
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

        {!loading && !error && views.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '20px', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
              <FlameIcon size={64} color="#666" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px', color: colors.text }}>
              No Views Yet
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              When someone views your profile, they'll show up here
            </p>
          </div>
        )}

        {!loading && !error && views.length > 0 && views.map((view, index) => {
          // Free users can only see the first profile clearly
          const isBlurred = !isPremium && !premiumLoading && index > 0;

          return (
            <div
              key={view.id}
              onClick={() => {
                if (isBlurred) return; // Don't allow interaction with blurred items
                if (!view.seen_at) handleMarkSeen(view.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                padding: '15px 20px',
                borderBottom: `1px solid ${colors.border}`,
                position: 'relative',
                background: !view.seen_at
                  ? 'rgba(255,107,53,0.05)'
                  : 'transparent',
                filter: isBlurred ? 'blur(8px)' : 'none',
                pointerEvents: isBlurred ? 'none' : 'auto',
                userSelect: isBlurred ? 'none' : 'auto'
              }}
            >
              {/* Unseen indicator */}
              {!view.seen_at && (
                <div style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: colors.accent
                }} />
              )}

              {/* Profile Image */}
              <Link
                href={`/profile/${view.viewer.id}`}
                style={{ position: 'relative', flexShrink: 0, textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: '#333',
                    backgroundImage: view.viewer.photo_url ? `url(${view.viewer.photo_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                {view.viewer.is_online && (
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
              </Link>

              {/* User Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <Link
                    href={`/profile/${view.viewer.id}`}
                    style={{ fontSize: '17px', fontWeight: 600, textDecoration: 'none', color: colors.text }}
                  >
                    {view.viewer.display_name || 'User'}
                    {view.viewer.age && <span style={{ fontWeight: 400, color: colors.textSecondary }}>, {view.viewer.age}</span>}
                  </Link>
                  <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                    {formatRelativeTime(view.created_at)}
                  </div>
                </div>

                {/* Position badge */}
                {view.viewer.position && (
                  <div style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255,107,53,0.15)',
                    color: colors.accent,
                    marginBottom: '10px'
                  }}>
                    {view.viewer.position.replace('-', ' ')}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/profile/${view.viewer.id}`}
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
                    View Profile
                  </Link>
                  <Link
                    href={`/messages/${view.viewer.id}`}
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
                    Message
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Premium Upsell for blurred views */}
        {!loading && !error && !isPremium && !premiumLoading && views.length > 1 && (
          <div style={{
            position: 'relative',
            margin: '20px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,107,53,0.05) 100%)',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>👀</div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: colors.text }}>
              {views.length - 1} more {views.length - 1 === 1 ? 'person' : 'people'} viewed you
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '16px' }}>
              Upgrade to see everyone who's checking out your profile
            </p>
            <button
              onClick={() => router.push('/premium')}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 28px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255,107,53,0.4)'
              }}
            >
              Unlock All Views
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavWithBadges />
    </div>
  );
}
