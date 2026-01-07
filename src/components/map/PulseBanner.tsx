// =============================================================================
// PulseBanner - Glass style banner for The Pulse with tagline
// =============================================================================

'use client';

import { useState } from 'react';

// Heartbeat animation component
const Heartbeat = () => (
  <div style={{ position: 'relative', width: 40, height: 20 }}>
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '50px',
      height: '30px',
      background: 'radial-gradient(ellipse, rgba(255,107,53,0.4) 0%, transparent 70%)',
      filter: 'blur(8px)',
      animation: 'pulseGlow 3s ease-in-out infinite'
    }} />
    <svg width="40" height="20" viewBox="0 0 48 24" style={{ position: 'relative', zIndex: 1 }}>
      <defs>
        <linearGradient id="hbGradBanner" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.2"/>
          <stop offset="50%" stopColor="#FF6B35" stopOpacity="1"/>
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      <path
        d="M 0 12 L 12 12 L 16 12 L 20 4 L 24 20 L 28 12 L 32 12 L 35 8 L 38 16 L 41 12 L 48 12"
        stroke="url(#hbGradBanner)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle r="2.5" fill="#FF6B35">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M 0 12 L 12 12 L 16 12 L 20 4 L 24 20 L 28 12 L 32 12 L 35 8 L 38 16 L 41 12 L 48 12"
        />
      </circle>
    </svg>
  </div>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function PulseBanner() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="/pulse"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        margin: '0 16px 12px',
        padding: '16px 20px',
        background: isHovered
          ? 'linear-gradient(135deg, rgba(255,107,53,0.12), rgba(255,107,53,0.04))'
          : 'linear-gradient(135deg, rgba(255,107,53,0.08), rgba(255,107,53,0.02))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid',
        borderColor: isHovered ? 'rgba(255,107,53,0.35)' : 'rgba(255,107,53,0.15)',
        borderRadius: '16px',
        textDecoration: 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 0 40px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 0 30px rgba(255,107,53,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Shine effect on hover */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: isHovered ? '150%' : '-100%',
        width: '60%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
        transform: 'skewX(-20deg)',
        transition: 'left 0.6s ease',
        pointerEvents: 'none'
      }} />

      {/* Heartbeat Icon */}
      <Heartbeat />

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: '#FF6B35',
          marginBottom: '2px',
        }}>
          THE PULSE
        </div>
        <div style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '9px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(255,107,53,0.5)',
        }}>
          Connection Beyond Distance
        </div>
      </div>

      {/* Live indicator and arrow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#FF6B35',
            animation: 'pulseDot 2s ease-in-out infinite',
            boxShadow: '0 0 8px rgba(255,107,53,0.6)',
          }} />
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '10px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.08em',
          }}>
            LIVE
          </span>
        </div>

        <div style={{
          color: '#FF6B35',
          transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}>
          <ArrowIcon />
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </a>
  );
}
