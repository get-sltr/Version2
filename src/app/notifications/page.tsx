'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount
} from '@/lib/api/notifications';
import type { NotificationWithUser, NotificationType } from '@/types/database';
import { IconBack, IconBell, IconWave, IconChat, IconEye, IconStar, IconCamera, IconUsers, IconUser, IconArrowRight } from '@/components/Icons';

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

const TypeIcon = ({ type, size = 16 }: { type: NotificationType; size?: number }) => {
  switch (type) {
    case 'tap': return <IconWave size={size} />;
    case 'message': return <IconChat size={size} />;
    case 'view': return <IconEye size={size} />;
    case 'favorite': return <IconStar size={size} />;
    case 'album_share': return <IconCamera size={size} />;
    case 'group_invite': return <IconUsers size={size} />;
    case 'group_join': return <IconUsers size={size} />;
    case 'system': return <IconBell size={size} />;
    default: return <IconBell size={size} />;
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<'all' | 'taps' | 'messages' | 'views'>('all');
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications(100);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(notifications.map(n => ({
        ...n,
        read_at: n.read_at || new Date().toISOString()
      })));
      setUnreadCount(0);
    } catch (err: any) {
      alert(err.message || 'Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notif: NotificationWithUser) => {
    // Mark as read if unread
    if (!notif.read_at) {
      try {
        await markNotificationRead(notif.id);
        setNotifications(notifications.map(n =>
          n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        // Silently fail
      }
    }

    // Navigate based on type
    switch (notif.type) {
      case 'message':
        if (notif.from_user_id) {
          router.push(`/messages/${notif.from_user_id}`);
        }
        break;
      case 'tap':
        router.push('/taps');
        break;
      case 'view':
      case 'favorite':
        if (notif.from_user_id) {
          router.push(`/profile/${notif.from_user_id}`);
        }
        break;
      case 'album_share':
        router.push('/albums');
        break;
      case 'group_invite':
      case 'group_join':
        if (notif.group_id) {
          router.push(`/groups/${notif.group_id}`);
        }
        break;
      default:
        if (notif.from_user_id) {
          router.push(`/profile/${notif.from_user_id}`);
        }
    }
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => {
        if (filter === 'taps') return n.type === 'tap';
        if (filter === 'messages') return n.type === 'message';
        if (filter === 'views') return n.type === 'view';
        return true;
      });

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Cormorant Garamond', 'Space Mono', -apple-system, BlinkMacSystemFont, serif",
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: colors.background,
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: colors.accent,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <IconBack size={16} /> Back
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <div style={{
              background: colors.accent,
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#fff'
            }}>
              {unreadCount}
            </div>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: colors.accent,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '16px 20px',
        overflowX: 'auto',
        borderBottom: `1px solid ${colors.border}`
      }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'taps', label: 'Taps' },
          { id: 'messages', label: 'Messages' },
          { id: 'views', label: 'Views' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            style={{
              background: filter === tab.id ? 'rgba(255,107,53,0.2)' : colors.surface,
              border: filter === tab.id ? '1px solid rgba(255,107,53,0.5)' : `1px solid ${colors.border}`,
              borderRadius: '20px',
              padding: '8px 16px',
              color: filter === tab.id ? colors.accent : colors.textSecondary,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            Loading notifications...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.accent }}>
            <div style={{ marginBottom: '16px' }}>{error}</div>
            <button
              onClick={loadNotifications}
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

        {!loading && !error && filteredNotifications.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.textSecondary
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
              <IconBell size={48} />
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: colors.text }}>
              No notifications
            </div>
            <div style={{ fontSize: '14px' }}>
              You're all caught up!
            </div>
          </div>
        )}

        {!loading && !error && filteredNotifications.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                style={{
                  background: notif.read_at ? colors.surface : 'rgba(255,107,53,0.1)',
                  border: notif.read_at ? `1px solid ${colors.border}` : '1px solid rgba(255,107,53,0.3)',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {/* User Avatar with Type Badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#333',
                    backgroundImage: notif.from_user?.photo_url ? `url(${notif.from_user.photo_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textSecondary
                  }}>
                    {!notif.from_user?.photo_url && <IconUser size={24} />}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    background: colors.background,
                    borderRadius: '50%',
                    padding: '4px',
                    lineHeight: 1,
                    border: `2px solid ${colors.background}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TypeIcon type={notif.type} size={16} />
                  </div>
                </div>

                {/* Notification Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: notif.read_at ? colors.text : colors.accent
                    }}>
                      {notif.from_user?.display_name || notif.title || 'Notification'}
                    </span>
                    {!notif.read_at && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: colors.accent
                      }} />
                    )}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    marginBottom: '4px'
                  }}>
                    {notif.body || notif.title || 'New notification'}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: colors.textSecondary
                  }}>
                    <span>{formatRelativeTime(notif.created_at)}</span>
                    {notif.from_user?.distance && (
                      <>
                        <span>•</span>
                        <span>{notif.from_user.distance}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{
                  color: colors.textSecondary,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <IconArrowRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
