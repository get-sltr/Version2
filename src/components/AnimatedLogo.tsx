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
    small: { logo: 48, text: '18px', gap: '10px' },
    medium: { logo: 72, text: '24px', gap: '14px' },
    large: { logo: 100, text: '32px', gap: '18px' },
  };

  const s = scales[size];

  const logoContent = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: s.gap,
        textDecoration: 'none',
        color: '#FFFFFF',
      }}
    >
      {/* Logo Container with Glow Effect */}
      <div
        className="logo-container"
        style={{
          position: 'relative',
          width: `${s.logo}px`,
          height: `${s.logo}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ambient Glow */}
        <div
          className="logo-glow"
          style={{
            position: 'absolute',
            inset: '-20%',
            background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%)',
            animation: 'glowPulse 2.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Primal Logo PNG */}
        <Image
          src="/icons/primallogo.png"
          alt="Primal"
          width={s.logo}
          height={s.logo}
          style={{
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 8px rgba(255, 107, 53, 0.4))',
            animation: 'logoPulse 2.5s ease-in-out infinite',
            position: 'relative',
            zIndex: 2,
          }}
          priority
        />
      </div>

      {/* PRIMALGAY Text */}
      {showText && (
        <>
          {/* Connector Line */}
          <div
            className="connector"
            style={{
              width: size === 'small' ? '20px' : size === 'medium' ? '30px' : '40px',
              height: '2px',
              background: 'linear-gradient(to right, rgba(255, 107, 53, 0.8), rgba(255, 107, 53, 0.2))',
              animation: 'connectorGlow 2.5s ease-in-out infinite',
            }}
          />

          {/* Brand Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              className="brand-text"
              style={{
                fontFamily: "'Audiowide', 'Orbitron', sans-serif",
                fontSize: s.text,
                fontWeight: 400,
                letterSpacing: '0.15em',
                color: '#C8DCFF',
                textShadow: '0 0 20px rgba(200, 220, 255, 0.4)',
                animation: 'textGlow 2.5s ease-in-out infinite',
              }}
            >
              PRIMALGAY
            </span>
            <span
              style={{
                fontFamily: "'Audiowide', 'Orbitron', sans-serif",
                fontSize: size === 'small' ? '8px' : size === 'medium' ? '10px' : '12px',
                fontWeight: 400,
                letterSpacing: '0.2em',
                color: '#FF6B35',
                textShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
              }}
            >
              RELEASE YOUR INNER DESIRE
            </span>
          </div>
        </>
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
        @keyframes logoPulse {
          0%, 100% { 
            filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.4));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 16px rgba(255, 107, 53, 0.6)) drop-shadow(0 0 30px rgba(255, 107, 53, 0.3));
            transform: scale(1.02);
          }
        }
        @keyframes connectorGlow {
          0%, 100% { 
            opacity: 0.6; 
            box-shadow: 0 0 8px rgba(255, 107, 53, 0.3); 
          }
          50% { 
            opacity: 1; 
            box-shadow: 0 0 15px rgba(255, 107, 53, 0.6); 
          }
        }
        @keyframes textGlow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(200, 220, 255, 0.3); 
          }
          50% { 
            text-shadow: 0 0 35px rgba(200, 220, 255, 0.6), 0 0 50px rgba(200, 220, 255, 0.3); 
          }
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
