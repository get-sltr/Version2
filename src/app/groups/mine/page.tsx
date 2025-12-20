'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyGroupsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'joined' | 'hosted'>('joined');
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);
  const [hostedGroups, setHostedGroups] = useState<any[]>([]);

  useEffect(() => {
    // Load joined groups
    const joinedIds = JSON.parse(localStorage.getItem('joinedGroups') || '[]');
    // Mock data for joined groups
    const mockJoined = joinedIds.map((id: string, i: number) => ({
      id,
      name: ['Late Night Fun 🌙', 'Pool Party 🏊', 'Game Night 🎮'][i] || 'Group',
      host: 'Jordan',
      type: 'Hangout',
      attendees: 8,
      maxAttendees: 15,
      time: 'Tonight 9:00 PM',
      location: 'West Hollywood',
      image: '/images/6.jpg'
    }));
    setJoinedGroups(mockJoined);

    // Load hosted groups
    const hosted = JSON.parse(localStorage.getItem('myHostedGroups') || '[]');
    setHostedGroups(hosted);
  }, []);

  const handleDeleteGroup = (groupId: string) => {
    if (confirm('Are you sure you want to delete this group? This cannot be undone.')) {
      const updated = hostedGroups.filter(g => g.id !== groupId);
      setHostedGroups(updated);
      localStorage.setItem('myHostedGroups', JSON.stringify(updated));
    }
  };

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
          <h1 style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>My Groups</h1>
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
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ➕ Host
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '0 20px' }}>
          <button
            onClick={() => setActiveTab('joined')}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'joined' ? '2px solid #FF6B35' : '2px solid transparent',
              color: activeTab === 'joined' ? '#fff' : '#888',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Joined ({joinedGroups.length})
          </button>
          <button
            onClick={() => setActiveTab('hosted')}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'hosted' ? '2px solid #FF6B35' : '2px solid transparent',
              color: activeTab === 'hosted' ? '#fff' : '#888',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Hosted ({hostedGroups.length})
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'joined' && (
          <>
            {joinedGroups.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#888'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>👥</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#fff' }}>
                  No Groups Joined Yet
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Explore groups on the map and join ones that interest you
                </p>
                <a
                  href="/map"
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
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Explore Groups
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {joinedGroups.map(group => (
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
                      background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      flexShrink: 0
                    }}>
                      👥
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                        {group.name}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                        {group.type} • Hosted by {group.host}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                        <span style={{ color: '#aaa' }}>
                          🕐 {group.time}
                        </span>
                        <span style={{ color: '#aaa' }}>
                          📍 {group.location}
                        </span>
                      </div>
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
                      {group.attendees}/{group.maxAttendees}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'hosted' && (
          <>
            {hostedGroups.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#888'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎯</div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#fff' }}>
                  No Groups Hosted Yet
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
                  Create a group to bring people together for fun and connection
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
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  ➕ Host a Group
                </a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hostedGroups.map(group => (
                  <div
                    key={group.id}
                    style={{
                      background: '#1c1c1e',
                      borderRadius: '16px',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        flexShrink: 0
                      }}>
                        👥
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                          {group.name}
                        </h3>
                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                          {group.type} • You're hosting
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                          <span style={{ color: '#aaa' }}>
                            🕐 {group.time}
                          </span>
                          <span style={{ color: '#aaa' }}>
                            📍 {group.location}
                          </span>
                        </div>
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
                        {group.attendees}/{group.maxAttendees}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`/groups/${group.id}`}
                        style={{
                          flex: 1,
                          background: '#FF6B35',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'none',
                          textAlign: 'center'
                        }}
                      >
                        View Group
                      </a>
                      <button
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        style={{
                          background: 'rgba(255,59,48,0.15)',
                          border: '1px solid #FF3B30',
                          borderRadius: '8px',
                          padding: '12px',
                          color: '#FF3B30',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
