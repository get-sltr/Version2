'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../contexts/ThemeContext';
import { usePremium } from '@/hooks/usePremium';
import { PremiumPromo } from '@/components/PremiumPromo';

interface Room {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  participantCount: number;
  maxParticipants: number;
  isLive: boolean;
}

const ROOM_ICONS: Record<string, string> = {
  'club-sltr': '🎵',
  'the-orbit': '🎉',
  'the-den': '💨',
  'after-hours': '🌙',
};

const ROOM_CATEGORIES: Record<string, string> = {
  'club-sltr': 'Main',
  'the-orbit': 'Featured',
  'the-den': 'Featured',
  'after-hours': 'Featured',
};

export default function PulseLobbyPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch rooms for premium users
    if (premiumLoading || !isPremium) return;

    const fetchRooms = async () => {
      try {
        const response = await fetch('/api/livekit/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        setRooms(data.rooms || []);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms');
        // Fallback to default rooms
        setRooms([
          { id: 'club-sltr', name: 'Club SLTR', description: 'Main community hangout', theme: 'default', participantCount: 0, maxParticipants: 400, isLive: false },
          { id: 'the-orbit', name: 'The Orbit', description: '420 & chill vibes', theme: 'neon', participantCount: 0, maxParticipants: 400, isLive: false },
          { id: 'the-den', name: 'The Den', description: 'Late night sessions', theme: 'dark', participantCount: 0, maxParticipants: 400, isLive: false },
          { id: 'after-hours', name: 'After Hours', description: 'When the clubs close', theme: 'purple', participantCount: 0, maxParticipants: 400, isLive: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Refresh room counts every 30 seconds
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, [premiumLoading, isPremium]);

  // Show promo for non-premium users
  if (!premiumLoading && !isPremium) {
    return <PremiumPromo feature="The Pulse" fullPage />;
  }

  const totalParticipants = rooms.reduce((sum, room) => sum + room.participantCount, 0);

  const joinRoom = (roomId: string) => {
    router.push(`/pulse/room/${roomId}`);
  };

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
        background: 'rgba(128, 128, 128, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '20px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
          <button
            onClick={() => router.push('/map')}
            style={{
              background: 'rgba(128, 128, 128, 0.15)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.accent}`,
              borderRadius: '12px',
              padding: '10px 16px',
              color: colors.accent,
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back
          </button>

          {/* Pulse Logo */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <svg width="40" height="20" viewBox="0 0 100 40">
              <path
                d="M 0 20 L 20 20 L 25 5 L 30 35 L 35 20 L 45 20 L 50 15 L 55 25 L 60 20 L 100 20"
                stroke="#FF6B35"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,53,0.6))' }}
              />
            </svg>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: colors.text }}>
                THE PULSE
              </h1>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>Lobby</div>
            </div>
          </div>

          {/* Live Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(128, 128, 128, 0.15)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${colors.accent}`,
            borderRadius: '20px',
            padding: '8px 16px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#FF6B35',
              animation: 'pulse 2s infinite'
            }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#FF6B35' }}>
              {totalParticipants} Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '24px',
          padding: '40px',
          marginBottom: '48px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Welcome to The Pulse
          </h2>
          <p style={{
            fontSize: '16px',
            color: colors.textSecondary,
            maxWidth: '600px',
            lineHeight: 1.6
          }}>
            Join live video rooms with the community. Connect, and vibe with
            others in real-time. Select a room below to get started.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '24px', marginBottom: '12px' }}>⚡</div>
            <div style={{ color: colors.textSecondary }}>Loading rooms...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: 'rgba(255,59,48,0.1)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ color: '#FF3B30' }}>{error}</div>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => joinRoom(room.id)}
                style={{
                  background: 'rgba(128, 128, 128, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '20px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = colors.accent;
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,53,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: ROOM_CATEGORIES[room.id] === 'Main'
                    ? 'linear-gradient(135deg, #FF6B35, #ff8c5a)'
                    : 'rgba(255,255,255,0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {ROOM_CATEGORIES[room.id] || 'Room'}
                </div>

                {/* Room Icon */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255,107,53,0.3)'
                }}>
                  {ROOM_ICONS[room.id] || '🎤'}
                </div>

                {/* Room Info */}
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: colors.text
                }}>
                  {room.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: colors.textSecondary,
                  marginBottom: '20px',
                  lineHeight: 1.5
                }}>
                  {room.description || 'Join the conversation'}
                </p>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {room.participantCount > 0 && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4caf50',
                        animation: 'pulse 2s infinite'
                      }} />
                    )}
                    <span style={{
                      fontSize: '14px',
                      color: room.participantCount > 0 ? '#4caf50' : colors.textSecondary,
                      fontWeight: 600
                    }}>
                      {room.participantCount > 0
                        ? `${room.participantCount} in room`
                        : 'Be the first to join'}
                    </span>
                  </div>

                  <button
                    style={{
                      background: colors.accent,
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Join →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guidelines */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'rgba(128, 128, 128, 0.06)',
          borderRadius: '16px',
          border: `1px solid ${colors.border}`
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '12px',
            color: colors.text
          }}>
            Community Guidelines
          </h3>
          <ul style={{
            fontSize: '14px',
            color: colors.textSecondary,
            lineHeight: 1.8,
            paddingLeft: '20px'
          }}>
            <li>Be respectful and inclusive to all participants</li>
            <li>Keep conversations appropriate for the room theme</li>
            <li>Report any inappropriate behavior to moderators</li>
            <li>Have fun and make meaningful connections!</li>
          </ul>
        </div>
      </div>

      {/* Pulse Animation Keyframes */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
