'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '../../../contexts/ThemeContext';
import { usePremium } from '@/hooks/usePremium';
import { PremiumPromo } from '@/components/PremiumPromo';

// ============================================================================
// TYPES
// ============================================================================
interface Room {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  participantCount: number;
  maxParticipants: number;
  isLive: boolean;
}

// ============================================================================
// ICONS
// ============================================================================
const Icons = {
  Back: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Desktop: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="7" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Vinyl: () => (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="24" cy="24" r="2" fill="currentColor"/>
    </svg>
  ),
  Star: () => (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <path d="M24 4L28 18L42 14L32 24L42 34L28 30L24 44L20 30L6 34L16 24L6 14L20 18L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Square: () => (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <rect x="10" y="10" width="28" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="18" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  ),
  Moon: () => (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
      <path d="M34 24C34 31.18 28.18 37 21 37C13.82 37 8 31.18 8 24C8 16.82 13.82 11 21 11C15 16 15 32 21 37" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="34" cy="12" r="2" fill="currentColor"/>
      <circle cx="40" cy="20" r="1.5" fill="currentColor"/>
      <circle cx="36" cy="28" r="1" fill="currentColor"/>
    </svg>
  ),
};

const ROOM_ICONS: Record<string, React.FC> = {
  'club-sltr': Icons.Vinyl,
  'the-orbit': Icons.Star,
  'the-den': Icons.Square,
  'after-hours': Icons.Moon,
};

const ROOM_META: Record<string, { badge: string; isPrimary: boolean }> = {
  'club-sltr': { badge: 'Main', isPrimary: true },
  'the-orbit': { badge: 'Featured', isPrimary: false },
  'the-den': { badge: 'Featured', isPrimary: false },
  'after-hours': { badge: 'Featured', isPrimary: false },
};

// ============================================================================
// COMPONENTS
// ============================================================================
const Heartbeat: React.FC = () => (
  <div style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '60px',
      height: '40px',
      background: 'radial-gradient(ellipse, rgba(255,107,53,0.4) 0%, transparent 70%)',
      filter: 'blur(10px)',
      animation: 'pulseGlow 3s ease-in-out infinite'
    }} />
    <svg width="48" height="24" viewBox="0 0 48 24" style={{ position: 'relative', zIndex: 1 }}>
      <defs>
        <linearGradient id="hbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.2"/>
          <stop offset="50%" stopColor="#FF6B35" stopOpacity="1"/>
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <path
        d="M 0 12 L 12 12 L 16 12 L 20 4 L 24 20 L 28 12 L 32 12 L 35 8 L 38 16 L 41 12 L 48 12"
        stroke="url(#hbGrad)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle r="3" fill="#FF6B35">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M 0 12 L 12 12 L 16 12 L 20 4 L 24 20 L 28 12 L 32 12 L 35 8 L 38 16 L 41 12 L 48 12"
        />
      </circle>
    </svg>
  </div>
);

interface RoomCardProps {
  room: Room;
  onJoin: (id: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
  const [hovered, setHovered] = useState(false);
  const IconComponent = ROOM_ICONS[room.id] || Icons.Vinyl;
  const meta = ROOM_META[room.id] || { badge: 'Room', isPrimary: false };

  return (
    <div
      onClick={() => onJoin(room.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,107,53,0.06)' : 'rgba(255,255,255,0.02)',
        borderRadius: '16px',
        padding: '28px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? '0 0 50px rgba(255,107,53,0.1)' : 'none'
      }}
    >
      {/* Shine effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: hovered ? '150%' : '-100%',
        width: '60%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        transform: 'skewX(-20deg)',
        transition: 'left 0.6s ease',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hovered ? '#FF6B35' : 'rgba(255,255,255,0.5)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.05)' : 'scale(1)'
        }}>
          <IconComponent />
        </div>
        <span style={{
          fontSize: '9px',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 500,
          color: meta.isPrimary ? '#FF6B35' : 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em'
        }}>
          {meta.badge}
        </span>
      </div>

      {/* Info */}
      <h3 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '18px',
        fontWeight: 600,
        marginBottom: '6px',
        color: hovered ? '#FF6B35' : '#ffffff',
        letterSpacing: '0.05em',
        transition: 'color 0.3s ease'
      }}>
        {room.name}
      </h3>
      <p style={{
        fontSize: '13px',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: '24px',
        lineHeight: 1.5
      }}>
        {room.description || 'Join the conversation'}
      </p>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: room.participantCount > 0 ? '#FF6B35' : 'rgba(255,255,255,0.35)'
        }}>
          {room.participantCount > 0 && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#FF6B35',
              animation: 'pulseDot 3s ease-in-out infinite'
            }} />
          )}
          {room.participantCount > 0 ? `${room.participantCount} online` : 'Be first'}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onJoin(room.id); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 0',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
        >
          Join <Icons.Arrow />
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
export default function PulseLobbyPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/livekit/rooms', { headers: { 'Cache-Control': 'no-cache' } });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch {
      setRooms([
        { id: 'club-sltr', name: 'Club SLTR', description: 'Main community hangout', theme: 'default', participantCount: 0, maxParticipants: 400, isLive: false },
        { id: 'the-orbit', name: 'The Orbit', description: 'Celebrate & connect', theme: 'neon', participantCount: 0, maxParticipants: 400, isLive: false },
        { id: 'the-den', name: 'The Den', description: 'Chill vibes only', theme: 'dark', participantCount: 0, maxParticipants: 400, isLive: false },
        { id: 'after-hours', name: 'After Hours', description: 'When the night calls', theme: 'purple', participantCount: 0, maxParticipants: 400, isLive: false },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (premiumLoading || !isPremium) return;
    fetchRooms();
    const interval = setInterval(fetchRooms, 30000);
    return () => clearInterval(interval);
  }, [premiumLoading, isPremium, fetchRooms]);

  const totalOnline = useMemo(() => rooms.reduce((sum, r) => sum + r.participantCount, 0), [rooms]);
  const joinRoom = useCallback((id: string) => router.push(`/pulse/room/${id}`), [router]);

  if (!premiumLoading && !isPremium) {
    return <PremiumPromo feature="The Pulse" fullPage />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Image */}
      <Image
        src="/images/9.png"
        alt="Background"
        fill
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          zIndex: 0
        }}
        priority
      />

      {/* Dark Overlay for readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1
      }} />

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(10,10,15,0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 24px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => router.push('/map')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF6B35'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
            >
              <Icons.Back /> Back
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Heartbeat />
              <div>
                <h1 style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  color: '#FF6B35'
                }}>
                  THE PULSE
                </h1>
                <span style={{
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase'
                }}>
                  Lobby
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#FF6B35',
              animation: 'pulseDot 3s ease-in-out infinite'
            }} />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: '#FF6B35',
              letterSpacing: '0.05em'
            }}>
              {totalOnline} Online
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: '48px 24px', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Welcome */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 600,
            marginBottom: '10px',
            color: '#FF6B35',
            letterSpacing: '0.12em'
          }}>
            Welcome to The Pulse
          </h2>
          <p style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'rgba(255,107,53,0.5)',
            marginBottom: '16px'
          }}>
            Connection Beyond Distance
          </p>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Live video rooms with the community. Select a room to join.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 12px',
              border: '2px solid rgba(255,107,53,0.2)',
              borderTopColor: '#FF6B35',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Loading rooms...</p>
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '40px'
          }}>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onJoin={joinRoom} />
            ))}
          </div>
        )}

        {/* Guidelines */}
        <div style={{
          padding: '24px',
          borderRadius: '16px',
          background: 'rgba(255,107,53,0.03)',
          border: '1px solid rgba(255,107,53,0.15)',
          boxShadow: '0 0 30px rgba(255,107,53,0.04)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '9px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase'
            }}>
              Community Guidelines
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10px',
              color: 'rgba(255,107,53,0.6)'
            }}>
              <Icons.Desktop />
              Best experienced on desktop or laptop
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {['Be respectful & inclusive', 'Keep it appropriate', 'Report bad behavior', 'Have fun connecting'].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,107,53,0.4)' }} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Keyframes */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          main > div:nth-child(3) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
