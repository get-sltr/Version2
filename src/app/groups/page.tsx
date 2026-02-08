'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getGroups } from '@/lib/api/groups';
import type { GroupWithHost } from '@/types/database';
import BottomNavWithBadges from '@/components/BottomNavWithBadges';

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupWithHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGroups(100);
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date?: string, time?: string) => {
    if (!date) return 'Date TBD';
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return time ? `Today ${time}` : 'Today';
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return time ? `Tomorrow ${time}` : 'Tomorrow';
    }

    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return time ? `${dateStr} ${time}` : dateStr;
  };

  const filteredGroups = groups.filter(group => {
    if (filter === 'all') return true;
    return group.type?.toLowerCase() === filter.toLowerCase();
  });

  const groupTypes = ['all', 'Hangout', 'Party', 'Sports', 'Casual', 'Dinner', 'Drinks', 'Gaming', 'Other'];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif" }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        zIndex: 100
      }}>
        <div style={{
          padding: '15px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF6B35',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0
            }}
          >
            ‹
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>Groups</h1>
          <a
            href="/groups/mine"
            style={{
              background: 'transparent',
              border: '1px solid #FF6B35',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#FF6B35',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              marginRight: '8px'
            }}
          >
            My Groups
          </a>
          <a
            href="/groups/create"
            style={{
              background: '#FF6B35',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            + Host
          </a>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '0 20px 15px',
          overflowX: 'auto'
        }}>
          {groupTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                background: filter === type ? '#FF6B35' : 'transparent',
                border: filter === type ? '1px solid #FF6B35' : '1px solid #333',
                borderRadius: '20px',
                padding: '6px 14px',
                color: filter === type ? '#fff' : '#888',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
            Loading groups...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#FF3B30' }}>
            {error}
            <button
              onClick={loadGroups}
              style={{
                display: 'block',
                margin: '20px auto 0',
                background: '#FF6B35',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#888'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>👥</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#fff' }}>
              No Groups Found
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              {filter === 'all'
                ? 'Be the first to create a group!'
                : `No ${filter} groups available right now`}
            </p>
            <a
              href="/groups/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FF6B35',
                border: 'none',
                borderRadius: '12px',
                padding: '14px 24px',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              + Host a Group
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredGroups.map(group => (
              <a
                key={group.id}
                href={`/groups/${group.id}`}
                style={{
                  background: '#1c1c1e',
                  borderRadius: '16px',
                  padding: '16px',
                  textDecoration: 'none',
                  color: '#fff',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: group.host?.photo_url
                    ? `url(${group.host.photo_url}) center/cover`
                    : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  flexShrink: 0
                }}>
                  {!group.host?.photo_url && '👥'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                    {group.name}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                    {group.type} • Hosted by {group.host?.display_name || 'Unknown'}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#aaa' }}>
                      🕐 {formatDateTime(group.event_date, group.event_time)}
                    </span>
                    {group.location && (
                      <span style={{ color: '#aaa' }}>
                        📍 {group.location}
                      </span>
                    )}
                  </div>
                  {group.tags && group.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {group.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          style={{
                            background: 'rgba(255,107,53,0.15)',
                            color: '#FF6B35',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '10px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{
                  background: 'rgba(255,107,53,0.15)',
                  border: '1px solid #FF6B35',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FF6B35',
                  whiteSpace: 'nowrap'
                }}>
                  {group.attendees}/{group.max_attendees}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <BottomNavWithBadges />
    </div>
  );
}
