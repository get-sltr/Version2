'use client';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function ProBadge({ size = 'sm', showText = false }: ProBadgeProps) {
  const sizes = {
    sm: { badge: 16, icon: 10, text: 8 },
    md: { badge: 22, icon: 14, text: 10 },
    lg: { badge: 28, icon: 18, text: 12 },
  };

  const s = sizes[size];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        borderRadius: showText ? '12px' : '50%',
        padding: showText ? '3px 8px 3px 4px' : '0',
        width: showText ? 'auto' : s.badge,
        height: s.badge,
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(255, 165, 0, 0.4)',
      }}
      title="SLTR Pro Member"
    >
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span
          style={{
            color: '#fff',
            fontSize: s.text,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Pro
        </span>
      )}
    </div>
  );
}
