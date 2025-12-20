'use client';

import { useEffect, useState } from 'react';

// Snowflake component
function Snowflake({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'fixed',
      color: '#fff',
      fontSize: style.fontSize || '1rem',
      textShadow: '0 0 5px rgba(255,255,255,0.8)',
      pointerEvents: 'none',
      zIndex: 1000,
      animation: `fall ${style.animationDuration || '10s'} linear infinite`,
      ...style,
    }}>
      *
    </div>
  );
}

// Ornament component - static, no animation
function Ornament({ color, size }: { color: string; size: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 30% 30%, ${color === 'gold' ? '#ffd700' : '#c41e3a'}, ${color === 'gold' ? '#b8860b' : '#8b0000'})`,
      boxShadow: `0 0 15px ${color === 'gold' ? 'rgba(255,215,0,0.4)' : 'rgba(196,30,58,0.4)'}, inset 0 -5px 10px rgba(0,0,0,0.3)`,
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Ornament cap */}
      <div style={{
        position: 'absolute',
        top: -6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: size * 0.25,
        height: 8,
        background: 'linear-gradient(to bottom, #c0c0c0, #808080)',
        borderRadius: '2px 2px 0 0',
      }} />
      {/* Shine */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '25%',
        height: '25%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.6)',
      }} />
    </div>
  );
}

export default function LandingPage() {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  useEffect(() => {
    // Generate snowflakes
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      style: {
        left: `${Math.random() * 100}%`,
        top: `${-10 - Math.random() * 20}%`,
        fontSize: `${Math.random() * 1.5 + 0.5}rem`,
        opacity: Math.random() * 0.7 + 0.3,
        animationDuration: `${Math.random() * 5 + 8}s`,
        animationDelay: `${Math.random() * 5}s`,
      },
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      color: '#000',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Snow animation keyframes */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
        @keyframes sway {
          0%, 100% {
            transform: translateX(-50%) rotate(10deg);
          }
          50% {
            transform: translateX(-50%) rotate(20deg);
          }
        }
      `}</style>

      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} style={flake.style} />
      ))}

      {/* Background images */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        opacity: 0.15,
        filter: 'grayscale(100%) contrast(1.2)',
        pointerEvents: 'none'
      }}>
        <img src="/images/1.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <img src="/images/xmas.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <img src="/images/xmas.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <img src="/images/4.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '60px 30px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Paper Airplane Logo */}
        <img
          src="/images/p-plane.png"
          alt="SLTR Logo"
          style={{
            width: 'clamp(120px, 25vw, 250px)',
            height: 'auto',
            marginBottom: '30px'
          }}
        />

        {/* SLTR with Santa Hat */}
        <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(56px, 12vw, 220px)',
            fontWeight: 700,
            letterSpacing: '0.35em',
            margin: 0,
            lineHeight: 1,
            textTransform: 'lowercase',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <span>s</span>
          <span style={{ margin: '0 0.1em' }}> </span>
          <span>l</span>
          <span style={{ margin: '0 0.1em' }}> </span>
          <span>t</span>
          <span style={{ margin: '0 0.1em' }}> </span>
          {/* R with Santa Hat */}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            r
            {/* Santa Hat */}
            <svg
              viewBox="0 0 120 100"
              style={{
                position: 'absolute',
                top: '-0.1em',
                left: '50%',
                transform: 'translateX(-50%) rotate(15deg)',
                width: '0.6em',
                height: 'auto',
                zIndex: 20,
                filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))',
                animation: 'sway 3s ease-in-out infinite',
              }}
            >
              {/* Hat body - fuller shape */}
              <path d="M15 85 Q30 30 60 25 Q90 30 105 85 Z" fill="#c41e3a" stroke="#8b0000" strokeWidth="2"/>
              {/* White fur trim at bottom */}
              <ellipse cx="60" cy="88" rx="50" ry="12" fill="#fff"/>
              {/* Pompom at tip */}
              <circle cx="60" cy="20" r="15" fill="#fff"/>
            </svg>
          </span>
        </h1>

        <p style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: 'clamp(12px, 2vw, 18px)',
          letterSpacing: '0.5em',
          textTransform: 'lowercase',
          marginTop: '30px',
          marginBottom: '20px',
          opacity: 0.6,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}>
          <Ornament color="red" size={16} />
          <span>no rules apply</span>
          <Ornament color="gold" size={16} />
        </p>

        <p style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: 'clamp(9px, 1.2vw, 14px)',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: '80px',
          opacity: 0.4,
          whiteSpace: 'nowrap'
        }}>intelligent | innovative | intuitive</p>

        {/* Festive buttons with red/gold accents */}
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/signup" style={{
            padding: '22px 60px',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
            color: '#fff',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(196, 30, 58, 0.4)',
            border: 'none',
          }}>Get Started</a>

          <a href="/login" style={{
            padding: '22px 60px',
            fontSize: '13px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '4px',
            background: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)',
            color: '#000',
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
            border: 'none',
          }}>Log In</a>
        </div>
      </div>

      <footer style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '30px',
        textAlign: 'center',
        zIndex: 10
      }}>
        <p style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: '11px',
          letterSpacing: '0.2em',
          opacity: 0.4,
          marginBottom: '15px'
        }}>SLTR DIGITAL LLC</p>

        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/about" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>About</a>
          <a href="/privacy" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>Terms</a>
          <a href="/guidelines" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>Guidelines</a>
          <a href="/cookies" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>Cookies</a>
          <a href="/security" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>Security</a>
          <a href="/dmca" style={{ fontSize: '11px', color: '#000', opacity: 0.4, textDecoration: 'none' }}>DMCA</a>
        </div>

        <p style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: '10px',
          opacity: 0.3,
          marginTop: '20px'
        }}>© 2025 SLTR Digital LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
