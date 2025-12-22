'use client';

interface DTFNBadgeProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function DTFNBadge({ isActive, size = 'sm' }: DTFNBadgeProps) {
  if (!isActive) return null;

  const sizes = {
    sm: {
      padding: '5px',
      borderRadius: '14px',
      dropLgSize: 12,
      dropSmSize: 8,
    },
    md: {
      padding: '7px',
      borderRadius: '16px',
      dropLgSize: 16,
      dropSmSize: 10,
    },
    lg: {
      padding: '9px',
      borderRadius: '18px',
      dropLgSize: 20,
      dropSmSize: 13,
    },
  };

  const s = sizes[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: 0,
        background: '#0a0a0a',
        padding: s.padding,
        borderRadius: s.borderRadius,
        border: '2px solid #ff6b35',
        boxShadow: '0 0 12px rgba(255,107,53,0.5)',
        animation: 'dtfn-pulse-glow 2s ease-in-out infinite',
      }}
    >
      {/* Large droplet */}
      <svg
        style={{
          width: `${s.dropLgSize}px`,
          height: `${s.dropLgSize}px`,
          fill: '#ff6b35',
          filter: 'drop-shadow(0 0 3px rgba(255,107,53,0.8))',
        }}
        viewBox="0 0 24 24"
      >
        <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
      </svg>
      {/* Small droplet */}
      <svg
        style={{
          width: `${s.dropSmSize}px`,
          height: `${s.dropSmSize}px`,
          marginLeft: '-1px',
          fill: '#ff6b35',
          filter: 'drop-shadow(0 0 3px rgba(255,107,53,0.8))',
        }}
        viewBox="0 0 24 24"
      >
        <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
      </svg>

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes dtfn-pulse-glow {
          0%, 100% { box-shadow: 0 0 12px rgba(255, 107, 53, 0.5); }
          50% { box-shadow: 0 0 20px rgba(255, 107, 53, 0.8); }
        }
      `}</style>
    </div>
  );
}

export default DTFNBadge;
