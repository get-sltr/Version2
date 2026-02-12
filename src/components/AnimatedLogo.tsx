'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  href?: string;
  showText?: boolean;
}

export function AnimatedLogo({ size = 'small', href = '/', showText = true }: AnimatedLogoProps) {
  const scales = {
    small: { logoSize: 36, text: '18px', containerGap: '10px', tagline: '8px' },
    medium: { logoSize: 48, text: '24px', containerGap: '14px', tagline: '10px' },
    large: { logoSize: 70, text: '32px', containerGap: '18px', tagline: '12px' },
  };

  const s = scales[size];

  const logoContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s.containerGap,
        textDecoration: 'none',
        color: '#FFFFFF',
      }}
    >
      {/* Logo Mark - X Icon */}
      <div
        style={{
          position: 'relative',
          width: `${s.logoSize}px`,
          height: `${s.logoSize}px`,
        }}
      >
        {/* Ambient Glow */}
        <div
          className="logo-glow"
          style={{
            position: 'absolute',
            inset: '-40%',
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%)',
            animation: 'glowPulse 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Logo Image */}
        <Image
          src="/icons/icon-512x512.png"
          alt="Primal"
          width={s.logoSize}
          height={s.logoSize}
          style={{
            borderRadius: `${s.logoSize * 0.2}px`,
            position: 'relative',
            zIndex: 2,
            filter: 'drop-shadow(0 0 15px rgba(255, 107, 53, 0.5))',
          }}
          priority
        />

        {/* Shine overlay */}
        <div
          className="logo-shine"
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.15) 60%, transparent 80%)',
            zIndex: 3,
            pointerEvents: 'none',
            borderRadius: `${s.logoSize * 0.2}px`,
            overflow: 'hidden',
          }}
        />
      </div>

      {/* PRIMAL Text */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            className="brand-text"
            style={{
              fontFamily: "'Audiowide', 'Orbitron', sans-serif",
              fontSize: s.text,
              fontWeight: 700,
              letterSpacing: '0.15em',
              background: 'linear-gradient(90deg, #a8b5c9 0%, #e8edf5 25%, #ffffff 50%, #e8edf5 75%, #a8b5c9 100%)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
            }}
          >
            PRIMAL MEN
          </span>
          <span
            style={{
              fontFamily: "'Audiowide', 'Orbitron', sans-serif",
              fontSize: s.tagline,
              fontWeight: 400,
              letterSpacing: '0.1em',
              color: '#FF6B35',
              textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            YOUR BURNING DESIRE, UNLEASHED.
          </span>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        @keyframes logoShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }
        @keyframes steelShine {
          0%, 100% {
            background-position: -200% center;
          }
          50% {
            background-position: 200% center;
          }
        }
        .logo-shine {
          animation: logoShine 3s ease-in-out infinite;
        }
        .brand-text {
          animation: steelShine 3s ease-in-out infinite;
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
