'use client';

import Link from 'next/link';

interface AnimatedLogoProps {
  size?: 'small' | 'medium' | 'large';
  href?: string;
  showText?: boolean;
}

export function AnimatedLogo({ size = 'small', href = '/', showText = true }: AnimatedLogoProps) {
  const scales = {
    small: { stripeW: 8, stripeH: 28, gap: 4, text: '18px', containerGap: '10px', tagline: '8px' },
    medium: { stripeW: 12, stripeH: 38, gap: 5, text: '24px', containerGap: '14px', tagline: '10px' },
    large: { stripeW: 16, stripeH: 50, gap: 6, text: '32px', containerGap: '18px', tagline: '12px' },
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
      {/* Logo Mark - 3 Tilted Stripes */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: `${s.gap}px`,
          height: `${s.stripeH}px`,
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

        {/* Stripe 1 - Orange */}
        <div
          style={{
            width: `${s.stripeW}px`,
            height: '100%',
            borderRadius: '3px',
            transform: 'skewX(-15deg)',
            background: 'linear-gradient(180deg, #ff9f5a 0%, #ff7b3d 100%)',
            boxShadow: '0 0 12px rgba(255, 123, 61, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          <div
            className="shine-white"
            style={{
              position: 'absolute',
              top: '-100%',
              left: '-50%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Stripe 2 - White with Orange Shine */}
        <div
          style={{
            width: `${s.stripeW}px`,
            height: '100%',
            borderRadius: '3px',
            transform: 'skewX(-15deg)',
            background: '#ffffff',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          <div
            className="shine-orange-1"
            style={{
              position: 'absolute',
              top: '-100%',
              left: '-50%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 123, 61, 0.9) 50%, transparent 100%)',
            }}
          />
        </div>

        {/* Stripe 3 - White with Orange Shine */}
        <div
          style={{
            width: `${s.stripeW}px`,
            height: '100%',
            borderRadius: '3px',
            transform: 'skewX(-15deg)',
            background: '#ffffff',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          <div
            className="shine-orange-2"
            style={{
              position: 'absolute',
              top: '-100%',
              left: '-50%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(255, 123, 61, 0.9) 50%, transparent 100%)',
            }}
          />
        </div>
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
              letterSpacing: '0.2em',
              color: '#FF6B35',
              textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
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
        @keyframes shineStripe {
          0% { top: -100%; }
          50%, 100% { top: 200%; }
        }
        @keyframes steelShine {
          0%, 100% { 
            background-position: -200% center;
          }
          50% { 
            background-position: 200% center;
          }
        }
        .shine-white {
          animation: shineStripe 2s ease-in-out infinite;
        }
        .shine-orange-1 {
          animation: shineStripe 2s ease-in-out infinite;
          animation-delay: 0.15s;
        }
        .shine-orange-2 {
          animation: shineStripe 2s ease-in-out infinite;
          animation-delay: 0.3s;
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
