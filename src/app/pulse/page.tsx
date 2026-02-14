'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../contexts/ThemeContext';
import Image from 'next/image';

// Custom SVG Icons - Sharp, minimal
const Icons = {
  Video: () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="12" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M32 20L44 14V34L32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="14" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  ),
  Mic: () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="18" y="6" width="12" height="22" rx="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M12 22C12 29 17 34 24 34C31 34 36 29 36 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <line x1="24" y1="34" x2="24" y2="42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="42" x2="31" y2="42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Chat: () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <path d="M8 10H40C42 10 44 12 44 14V30C44 32 42 34 40 34H28L20 42V34H8C6 34 4 32 4 30V14C4 12 6 10 8 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="22" r="2" fill="currentColor"/>
      <circle cx="24" cy="22" r="2" fill="currentColor"/>
      <circle cx="32" cy="22" r="2" fill="currentColor"/>
    </svg>
  ),
  Screen: () => (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="8" width="40" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="24" y1="34" x2="24" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="40" x2="32" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M20 17L20 27L28 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Back: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

// Liquid Glass Card Component with Shine Effect
const GlassCard = ({ children, isHovered, onMouseEnter, onMouseLeave, style = {} }: {
  children: React.ReactNode;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,255,255,0.06) 50%, rgba(255,107,53,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isHovered ? '1px solid rgba(255,107,53,0.3)' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isHovered
          ? '0 12px 32px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.05)'
          : '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.05)',
        borderRadius: '16px',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Shiny Reflective Sweep */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: isHovered ? '150%' : '-100%',
        width: '60%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
        transform: 'skewX(-20deg)',
        transition: 'left 0.6s ease',
        pointerEvents: 'none',
        zIndex: 10
      }} />
      {children}
    </div>
  );
};

// Liquid Glass Button with Shine Effect
const GlassButton = ({ children, onClick, style = {} }: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered
          ? 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,255,255,0.08) 50%, rgba(255,107,53,0.15) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.1) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isHovered ? '1px solid rgba(255,107,53,0.4)' : '1px solid rgba(255,255,255,0.15)',
        boxShadow: isHovered
          ? '0 12px 40px rgba(255,107,53,0.25), inset 0 1px 0 rgba(255,255,255,0.3), 0 0 60px rgba(255,107,53,0.15)'
          : '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.1)',
        borderRadius: '100px',
        padding: '14px 44px',
        color: isHovered ? '#FF6B35' : '#ffffff',
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Shiny Reflective Sweep */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: isHovered ? '150%' : '-100%',
        width: '60%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        transform: 'skewX(-20deg)',
        transition: 'left 0.6s ease',
        pointerEvents: 'none'
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </button>
  );
};

export default function PulseSplashPage() {
  const { colors } = useTheme();
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [backHovered, setBackHovered] = useState(false);

  const features = [
    { Icon: Icons.Video, title: 'HD Video', desc: '4K crystal clarity' },
    { Icon: Icons.Mic, title: 'Voice', desc: 'Spatial audio' },
    { Icon: Icons.Chat, title: 'Chat', desc: 'Live messaging' },
    { Icon: Icons.Screen, title: 'Share', desc: 'Screen casting' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background Image */}
      <Image
        src="/images/8.jpg"
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
        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1
      }} />

      {/* Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Back Button */}
      <GlassCard
        isHovered={backHovered}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          borderRadius: '12px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          padding: 0
        }}
      >
        <div
          onClick={() => router.push('/map')}
          style={{
            color: backHovered ? '#FF6B35' : 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            transition: 'color 0.3s ease'
          }}
        >
          <Icons.Back />
        </div>
      </GlassCard>

      {/* Heartbeat */}
      <div style={{ position: 'relative', marginBottom: '32px', zIndex: 3 }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          background: 'radial-gradient(circle, rgba(255,107,53,0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'pulse 2s ease-in-out infinite'
        }} />
        <svg width="240" height="80" viewBox="0 0 240 80" style={{ position: 'relative', zIndex: 1 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.1"/>
              <stop offset="50%" stopColor="#FF6B35" stopOpacity="1"/>
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.1"/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 0 40 L 50 40 L 65 40 L 75 12 L 85 68 L 95 40 L 105 40 L 112 32 L 120 48 L 128 40 L 240 40"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />
          <circle r="4" fill="#FF6B35" filter="url(#glow)">
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              path="M 0 40 L 50 40 L 65 40 L 75 12 L 85 68 L 95 40 L 105 40 L 112 32 L 120 48 L 128 40 L 240 40"
            />
          </circle>
        </svg>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 'clamp(40px, 6vw, 56px)',
        fontWeight: 600,
        marginBottom: '8px',
        letterSpacing: '0.2em',
        color: '#FF6B35',
        textShadow: '0 0 40px rgba(255,107,53,0.4), 0 0 80px rgba(255,107,53,0.2)',
        zIndex: 3,
        position: 'relative'
      }}>
        THE PULSE
      </h1>

      {/* Tagline */}
      <p style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: '11px',
        letterSpacing: '0.4em',
        textTransform: 'uppercase',
        color: 'rgba(255,107,53,0.5)',
        marginBottom: '24px',
        zIndex: 3,
        position: 'relative'
      }}>
        Connection Beyond Distance
      </p>

      {/* Subtitle */}
      <p style={{
        fontSize: '15px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '48px',
        textAlign: 'center',
        maxWidth: '380px',
        lineHeight: 1.7,
        fontWeight: 300,
        zIndex: 3,
        position: 'relative'
      }}>
        Real-time video, voice, and messaging for up to 400 people. One room. One heartbeat.
      </p>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '40px',
        maxWidth: '420px',
        width: '100%',
        zIndex: 3,
        position: 'relative'
      }}>
        {features.map((feature, i) => (
          <GlassCard
            key={i}
            isHovered={hoveredCard === i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ padding: '24px 16px', textAlign: 'center', cursor: 'default' }}
          >
            <div style={{
              color: hoveredCard === i ? '#FF6B35' : 'rgba(255,255,255,0.4)',
              marginBottom: '12px',
              transition: 'all 0.4s ease',
              transform: hoveredCard === i ? 'scale(1.1)' : 'scale(1)',
              position: 'relative',
              zIndex: 1
            }}>
              <feature.Icon />
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              marginBottom: '6px',
              color: hoveredCard === i ? '#FF6B35' : 'rgba(255,255,255,0.9)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.3s ease',
              position: 'relative',
              zIndex: 1
            }}>
              {feature.title}
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.5,
              position: 'relative',
              zIndex: 1
            }}>
              {feature.desc}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{ zIndex: 3, position: 'relative' }}>
        <GlassButton onClick={() => router.push('/pulse/lobby')}>
          Enter The Pulse
        </GlassButton>
      </div>

      {/* Stats */}
      <div style={{
        marginTop: '56px',
        display: 'flex',
        gap: '48px',
        zIndex: 3,
        position: 'relative'
      }}>
        {[
          { number: '400', label: 'Participants' },
          { number: '24/7', label: 'Always On' },
          { number: 'HD', label: 'Quality' }
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '28px',
              fontWeight: 500,
              color: '#FF6B35',
              marginBottom: '4px',
              letterSpacing: '0.05em'
            }}>
              {stat.number}
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 500
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}
