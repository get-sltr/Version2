'use client';

import { IconOrbit } from '@/components/Icons';

interface OrbitBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export function OrbitBadge({ size = 'sm' }: OrbitBadgeProps) {
  const sizes = {
    sm: {
      iconSize: 22,
      padding: '3px',
      borderRadius: '50%',
    },
    md: {
      iconSize: 28,
      padding: '4px',
      borderRadius: '50%',
    },
    lg: {
      iconSize: 36,
      padding: '5px',
      borderRadius: '50%',
    },
  };

  const s = sizes[size];

  return (
    <>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10,10,10,0.85)',
          padding: s.padding,
          borderRadius: s.borderRadius,
          border: '1px solid rgba(255,107,53,0.6)',
          boxShadow: '0 0 8px rgba(255,107,53,0.4)',
          animation: 'orbit-badge-glow 2s ease-in-out infinite',
        }}
      >
        <IconOrbit size={s.iconSize} />
      </div>

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes orbit-badge-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(255, 107, 53, 0.4); }
          50% { box-shadow: 0 0 16px rgba(255, 107, 53, 0.7); }
        }
      `}</style>
    </>
  );
}

export default OrbitBadge;
