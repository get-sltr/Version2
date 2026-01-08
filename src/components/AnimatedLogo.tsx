'use client';

import Link from 'next/link';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  href?: string;
}

export function AnimatedLogo({ size = 'small', href = '/' }: AnimatedLogoProps) {
  const scales = {
    small: { wrapper: 60, star: 32, text: '14px', beamHeight: 30 },
    medium: { wrapper: 100, star: 55, text: '20px', beamHeight: 50 },
    large: { wrapper: 160, star: 90, text: '32px', beamHeight: 80 },
  };

  const s = scales[size];

  const logoContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size === 'small' ? '8px' : '12px',
        textDecoration: 'none',
        color: '#FFFFFF',
      }}
    >
      {/* Star Container */}
      <div
        style={{
          position: 'relative',
          width: `${s.wrapper}px`,
          height: `${s.wrapper}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Rotating Beams */}
        <div
          className="beam-container"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: '100%',
            transform: 'translate(-50%, -50%)',
            animation: 'beamRotate 12s linear infinite',
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '1.5px',
                height: `${s.beamHeight * (0.85 + Math.random() * 0.3)}px`,
                background: 'linear-gradient(to bottom, rgba(200, 220, 255, 0.8), transparent)',
                transformOrigin: 'top center',
                transform: `translate(-50%, 0) rotate(${angle}deg)`,
              }}
            />
          ))}
        </div>

        {/* Glow Rings */}
        {[0.5, 0.72, 0.95].map((scale, i) => (
          <div
            key={i}
            className="glow-ring"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${s.wrapper * scale}px`,
              height: `${s.wrapper * scale}px`,
              border: '1px solid rgba(200, 220, 255, 0.15)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `ringExpand 1.8s ease-in-out infinite ${i * 0.2}s`,
            }}
          />
        ))}

        {/* Inner Glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${s.star * 0.35}px`,
            height: `${s.star * 0.35}px`,
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(200, 220, 255, 0.5) 40%, transparent 70%)',
            animation: 'innerBeat 1.8s ease-in-out infinite',
            zIndex: 5,
          }}
        />

        {/* The Star */}
        <svg
          viewBox="0 0 100 150"
          style={{
            width: `${s.star}px`,
            height: `${s.star * 1.5}px`,
            filter: 'drop-shadow(0 0 12px rgba(200, 220, 255, 0.6))',
            animation: 'crystallinePulse 1.8s ease-in-out infinite',
            zIndex: 10,
          }}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#c8dcff" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <polygon
            points="50,0 53,48 85,22 58,54 100,58 58,62 85,92 53,70 50,150 47,70 15,92 42,62 0,58 42,54 15,22 47,48"
            fill="url(#logoGradient)"
          />
        </svg>
      </div>

      {/* Connector Line */}
      <div
        style={{
          width: size === 'small' ? '15px' : '25px',
          height: '2px',
          background: 'linear-gradient(to right, rgba(200, 220, 255, 0.8), rgba(200, 220, 255, 0.3))',
          animation: 'connectorGlow 1.8s ease-in-out infinite',
        }}
      />

      {/* SLTR Text */}
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: s.text,
          fontWeight: 900,
          letterSpacing: '0.25em',
          color: '#fff',
          textShadow: '0 0 20px rgba(200, 220, 255, 0.4)',
          animation: 'textGlow 1.8s ease-in-out infinite',
        }}
      >
        SLTR
      </span>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes beamRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes ringExpand {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes innerBeat {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes crystallinePulse {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(200, 220, 255, 0.5)); }
          50% { filter: drop-shadow(0 0 25px rgba(200, 220, 255, 0.9)) drop-shadow(0 0 40px rgba(180, 200, 255, 0.5)); }
        }
        @keyframes connectorGlow {
          0%, 100% { opacity: 0.6; box-shadow: 0 0 8px rgba(200, 220, 255, 0.3); }
          50% { opacity: 1; box-shadow: 0 0 15px rgba(200, 220, 255, 0.6); }
        }
        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(200, 220, 255, 0.3); }
          50% { text-shadow: 0 0 35px rgba(200, 220, 255, 0.6), 0 0 50px rgba(200, 220, 255, 0.3); }
        }
      `}</style>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
