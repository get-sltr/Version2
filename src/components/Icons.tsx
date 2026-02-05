// =============================================================================
// Primal Icons — Final v7
// Style: Fragmented, angular, integrated labels
// Theme: Letters in orange (#FF6B35), drawings use currentColor (adapts to theme)
// Dark mode: currentColor = white, Light mode: currentColor = black
// Accent details in orange
// =============================================================================

interface IconProps {
  size?: number;
  className?: string;
}

// =============================================================================
// Navigation
// =============================================================================

export const IconProfile = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M12 4 L12 18 L18 18 L18 10 L24 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 44 L16 32 L24 38" stroke="currentColor" strokeWidth="1"/>
    <text x="44" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="2" fill="#FF6B35">PROFILE</text>
  </svg>
);

export const IconGroups = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M8 4 L8 18 L14 18 L14 10 L20 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M28 8 L28 20 L34 20 L34 14 L40 14" stroke="currentColor" strokeWidth="1"/>
    <text x="48" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">GROUPS</text>
    <path d="M4 48 L12 38 L18 42" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 50 L32 40 L44 48" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconMessages = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M4 8 L4 32 L10 32" stroke="currentColor" strokeWidth="1"/>
    <path d="M4 8 L36 8 L36 20" stroke="currentColor" strokeWidth="1"/>
    <text x="44" y="38" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="2" fill="#FF6B35">MESSAGES</text>
    <path d="M10 48 L10 60 L22 48" stroke="currentColor" strokeWidth="1"/>
    <path d="M125 28 L125 44 L115 44" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconSearch = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M20 4 L32 4 L40 12 L40 24" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 16 L28 16 L28 22" stroke="currentColor" strokeWidth="1"/>
    <path d="M36 28 L48 44" stroke="currentColor" strokeWidth="1.5"/>
    <text x="56" y="38" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">SEARCH</text>
  </svg>
);

export const IconMap = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M8 4 L8 28" stroke="currentColor" strokeWidth="1"/>
    <path d="M14 4 L14 28" stroke="currentColor" strokeWidth="1"/>
    <path d="M4 18 L28 18" stroke="currentColor" strokeWidth="1"/>
    <path d="M4 24 L28 24" stroke="currentColor" strokeWidth="1"/>
    <path d="M11 32 L11 48 L18 56" stroke="currentColor" strokeWidth="1"/>
    <text x="52" y="38" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">MAP</text>
    <path d="M115 24 L115 40 L105 40" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconMenu = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M8 20 L44 20" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 36 L44 36" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 52 L44 52" stroke="currentColor" strokeWidth="1"/>
    <text x="56" y="40" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">MENU</text>
  </svg>
);

// =============================================================================
// Actions
// =============================================================================

export const IconRefresh = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12 L4 6 L10 6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M20 12 L20 18 L14 18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 8 L12 4 L18 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 16 L12 20 L6 14" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconFilter = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 6 L20 6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 12 L17 12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 18 L14 18" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1"/>
    <circle cx="14" cy="12" r="2" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconPlus = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4 L12 20" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 12 L20 12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 6 L8 8" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M18 6 L16 8" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconSettings = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 8 L12 4 L16 6 L16 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M16 14 L16 18 L12 20 L12 16" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 10 L4 10 L6 6 L10 6" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 18 L6 18 L4 14 L8 14" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconBack = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 6 L8 12 L14 18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 12 L20 12" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconClose = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M18 6 L6 18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 4 L6 6" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M18 18 L20 20" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconSend = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12 L20 4 L16 20 L12 14 L4 12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 14 L20 4" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconCamera = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 8 L4 18 L20 18 L20 8 L16 8 L14 5 L10 5 L8 8 L4 8" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1"/>
    <path d="M17 10 L18 10" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconHeart = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 20 L4 12 L4 8 L8 4 L12 8 L16 4 L20 8 L20 12 L12 20" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 8 L12 12" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconHeartFilled = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 20 L4 12 L4 8 L8 4 L12 8 L16 4 L20 8 L20 12 L12 20" fill="currentColor" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconBell = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4 L12 2" stroke="currentColor" strokeWidth="1"/>
    <path d="M6 10 L6 14 L4 18 L20 18 L18 14 L18 10 L12 4 L6 10" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 20 L14 20" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconLocation = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L6 8 L6 14 L12 22 L18 14 L18 8 L12 2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 22 L12 18" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconUser = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 20 L8 14 L16 14 L20 20" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 14 L8 16" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M16 14 L16 16" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconUsers = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1"/>
    <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1"/>
    <path d="M2 20 L5 15 L11 15 L14 20" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 20 L13 15 L19 15 L22 20" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconFlame = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L8 10 L10 10 L8 16 L12 12 L10 12 L14 4 L16 8 L14 8 L16 2 L18 6 L16 14 L18 14 L12 22 L6 14 L8 14 L4 6 L8 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 22 L12 18" stroke="#FF6B35" strokeWidth="1"/>
    <path d="M10 16 L14 16" stroke="#FF6B35" strokeWidth="0.5"/>
  </svg>
);

export const IconWave = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 14 Q8 8, 12 14 Q16 20, 20 14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 10 Q8 4, 12 10 Q16 16, 20 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M6 18 L8 16" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconWink = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 10 L8 9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 10 L18 8" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 15 Q12 18, 16 15" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconEye = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 12 Q12 4, 22 12 Q12 20, 2 12" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
  </svg>
);

export const IconChat = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4 L20 4 L20 16 L12 16 L8 20 L8 16 L4 16 L4 4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 9 L16 9" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 12 L14 12" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconHome = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12 L12 4 L20 12 L20 20 L14 20 L14 14 L10 14 L10 20 L4 20 L4 12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 4 L12 2" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconEdit = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16 4 L20 8 L8 20 L4 20 L4 16 L16 4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M14 6 L18 10" stroke="currentColor" strokeWidth="1"/>
    <path d="M4 20 L8 20" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

export const IconTrash = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 6 L6 20 L18 20 L18 6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 6 L20 6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 6 L9 4 L15 4 L15 6" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 10 L10 16" stroke="currentColor" strokeWidth="1"/>
    <path d="M14 10 L14 16" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconShare = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="18" cy="6" r="3" stroke="currentColor" strokeWidth="1"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1"/>
    <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1"/>
    <path d="M9 10 L15 7" stroke="currentColor" strokeWidth="1"/>
    <path d="M9 14 L15 17" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconBlock = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 6 L18 18" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconReport = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4 L4 20 L20 20 L12 4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 10 L12 14" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
);

export const IconCheck = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12 L10 18 L20 6" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export const IconArrowRight = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 6 L15 12 L9 18" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconLightning = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 2 L6 12 L12 12 L10 22 L18 10 L12 10 L14 2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 12 L14 10" stroke="#FF6B35" strokeWidth="0.5"/>
  </svg>
);

export const IconCrown = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 18 L4 8 L8 12 L12 4 L16 12 L20 8 L20 18 L4 18" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 4 L12 2" stroke="#FF6B35" strokeWidth="1"/>
    <path d="M6 18 L6 20" stroke="currentColor" strokeWidth="0.5"/>
    <path d="M18 18 L18 20" stroke="currentColor" strokeWidth="0.5"/>
  </svg>
);

// =============================================================================
// Grid Icon
// =============================================================================

export const IconGrid = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// =============================================================================
// Features
// =============================================================================

export const IconStar = ({ size = 60, className }: IconProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 60 60" 
    fill="none" 
    className={className}
  >
    <path d="M30 4 L34 20 L52 20" stroke="currentColor" strokeWidth="1"/>
    <path d="M44 28 L56 46 L44 42" stroke="currentColor" strokeWidth="1"/>
    <path d="M30 36 L34 54" stroke="currentColor" strokeWidth="1"/>
    <path d="M20 42 L4 46 L16 28" stroke="currentColor" strokeWidth="1"/>
    <path d="M8 20 L26 20" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconTaps = ({ size = 140, className }: IconProps) => (
  <svg 
    width={size} 
    height={size * 0.57} 
    viewBox="0 0 140 80" 
    fill="none" 
    className={className}
  >
    <path d="M4 44 L4 18 L14 30" stroke="currentColor" strokeWidth="1"/>
    <path d="M18 26 L26 10 L34 26" stroke="currentColor" strokeWidth="1"/>
    <text x="48" y="38" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">TAPS</text>
    <path d="M8 52 L28 52" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconDTH = ({ size = 140, className }: IconProps) => (
  <svg
    width={size}
    height={size * 0.57}
    viewBox="0 0 140 80"
    fill="none"
    className={className}
  >
    <path d="M28 4 L14 32 L26 32" stroke="currentColor" strokeWidth="1"/>
    <path d="M22 40 L10 64" stroke="currentColor" strokeWidth="1"/>
    <path d="M32 28 L40 20" stroke="#FF6B35" strokeWidth="0.5"/>
    <path d="M36 38 L44 30" stroke="#FF6B35" strokeWidth="0.5"/>
    <text x="56" y="38" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">DTH</text>
  </svg>
);

// Orbit Icon - Glowing planet with rings (for Long Session indicator)
export const IconOrbit = ({ size = 24, className, animated = false }: IconProps & { animated?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width={size}
    height={size}
    className={className}
    style={animated ? { animation: 'orbitGlow 2s ease-in-out infinite' } : undefined}
  >
    <defs>
      <radialGradient id="orbitCore" cx="30%" cy="30%" r="70%">
        <stop offset="0%" style={{ stopColor: '#fff' }}/>
        <stop offset="30%" style={{ stopColor: '#ffb347' }}/>
        <stop offset="70%" style={{ stopColor: '#ff6b35' }}/>
        <stop offset="100%" style={{ stopColor: '#cc4420' }}/>
      </radialGradient>
      <linearGradient id="orbitRingA" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ff6b35' }}/>
        <stop offset="50%" style={{ stopColor: '#ffb347' }}/>
        <stop offset="100%" style={{ stopColor: '#ff6b35' }}/>
      </linearGradient>
      <linearGradient id="orbitRingB" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ffb347' }}/>
        <stop offset="50%" style={{ stopColor: '#ff8c5a' }}/>
        <stop offset="100%" style={{ stopColor: '#ffb347' }}/>
      </linearGradient>
      <filter id="orbitGlowFilter" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feFlood floodColor="#ff6b35" floodOpacity="0.8"/>
        <feComposite in2="blur" operator="in"/>
        <feMerge>
          <feMergeNode/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Orbit rings */}
    <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="url(#orbitRingA)" strokeWidth="4" transform="rotate(-25 50 50)" filter="url(#orbitGlowFilter)"/>
    <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="url(#orbitRingB)" strokeWidth="3" opacity="0.7" transform="rotate(35 50 50)" filter="url(#orbitGlowFilter)"/>
    {/* Core */}
    <circle cx="50" cy="50" r="14" fill="url(#orbitCore)" filter="url(#orbitGlowFilter)"/>
    {/* Shine */}
    <ellipse cx="45" cy="45" rx="5" ry="4" fill="#fff" opacity="0.7"/>
    {/* Particles */}
    <circle cx="12" cy="35" r="5" fill="#ffb347" filter="url(#orbitGlowFilter)"/>
    <circle cx="11" cy="34" r="2" fill="#fff" opacity="0.8"/>
    <circle cx="88" cy="65" r="4" fill="#ff8c5a" filter="url(#orbitGlowFilter)"/>
    <circle cx="87" cy="64" r="1.5" fill="#fff" opacity="0.7"/>
  </svg>
);

// =============================================================================
// Premium Feature Icons
// =============================================================================

export const IconInfinity = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 12C8 14.2 6.2 16 4 16C1.8 16 0 14.2 0 12C0 9.8 1.8 8 4 8C6.2 8 8 9.8 8 12Z" stroke="currentColor" strokeWidth="1.5" transform="translate(2, 0)"/>
    <path d="M16 12C16 9.8 17.8 8 20 8C22.2 8 24 9.8 24 12C24 14.2 22.2 16 20 16C17.8 16 16 14.2 16 12Z" stroke="currentColor" strokeWidth="1.5" transform="translate(-2, 0)"/>
    <path d="M8 12L16 12" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconTelescope = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 21L10 14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 14L7 11" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 11L14 4L20 10L13 17L7 11" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="1"/>
    <path d="M13 17L10 20" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconGhost = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C7 2 4 6 4 10V20L6 18L8 20L10 18L12 20L14 18L16 20L18 18L20 20V10C20 6 17 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
    <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
  </svg>
);

export const IconShield = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L4 6V12C4 16.4 7.4 20.4 12 22C16.6 20.4 20 16.4 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconSparkles = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19 2L19.5 4.5L22 5L19.5 5.5L19 8L18.5 5.5L16 5L18.5 4.5L19 2Z" stroke="currentColor" strokeWidth="1"/>
    <path d="M5 16L5.5 18L8 18.5L5.5 19L5 21L4.5 19L2 18.5L4.5 18L5 16Z" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconTimer = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="14" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 10V14L15 16" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 2H14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 2V4" stroke="currentColor" strokeWidth="1"/>
    <path d="M19 7L20 6" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconUndo = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 8H14C17.3 8 20 10.7 20 14C20 17.3 17.3 20 14 20H8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 4L4 8L8 12" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconGlobe = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 12H21" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 3C14.5 5.5 16 8.5 16 12C16 15.5 14.5 18.5 12 21" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 3C9.5 5.5 8 8.5 8 12C8 15.5 9.5 18.5 12 21" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconTyping = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="6" width="20" height="12" rx="6" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="17" cy="12" r="1.5" fill="currentColor"/>
  </svg>
);

export const IconAlbums = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 14L13 11L17 15" stroke="currentColor" strokeWidth="1"/>
    <circle cx="11" cy="10" r="1.5" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconDoubleCheck = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 12L7 17L12 8" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 12L13 17L22 6" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconBookmark = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 4H18V20L12 16L6 20V4Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9 8H15" stroke="currentColor" strokeWidth="1"/>
    <path d="M9 11H13" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconVideo = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 10L22 7V17L16 14" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconBadge = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2L15 5H19V9L22 12L19 15V19H15L12 22L9 19H5V15L2 12L5 9V5H9L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1"/>
    <path d="M12 10V14" stroke="currentColor" strokeWidth="1"/>
    <path d="M10 12H14" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconEyeOff = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 4L20 20" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6.5 9.5C4.5 11 3 12 3 12C3 12 7 18 12 18C13.5 18 14.8 17.5 16 17" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M17.5 14.5C19.5 13 21 12 21 12C21 12 17 6 12 6C10.5 6 9.2 6.5 8 7" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconPin = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 4L16 4L18 10L14 14V20L12 22L10 20V14L6 10L8 4Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M6 10H18" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconHeadset = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 12V10C4 5.6 7.6 2 12 2C16.4 2 20 5.6 20 10V12" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="2" y="12" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="18" y="12" width="4" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M20 18V19C20 20.1 19.1 21 18 21H14" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="21" r="2" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconAirplane = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4L14 10H20L22 12L20 14H14L12 20L10 14H4L2 12L4 10H10L12 4Z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1"/>
  </svg>
);

export const IconUnlock = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 11V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
  </svg>
);

export const IconDownload = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 4V16" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 18H20" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

export const IconClock = ({ size = 24, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

// =============================================================================
// Export All
// =============================================================================

export const Icons = {
  // Navigation
  Profile: IconProfile,
  Groups: IconGroups,
  Messages: IconMessages,
  Search: IconSearch,
  Map: IconMap,
  Menu: IconMenu,
  // Actions
  Refresh: IconRefresh,
  Filter: IconFilter,
  Plus: IconPlus,
  Settings: IconSettings,
  Back: IconBack,
  Close: IconClose,
  Send: IconSend,
  Camera: IconCamera,
  Heart: IconHeart,
  HeartFilled: IconHeartFilled,
  Bell: IconBell,
  Location: IconLocation,
  User: IconUser,
  Users: IconUsers,
  Flame: IconFlame,
  Wave: IconWave,
  Wink: IconWink,
  Eye: IconEye,
  Chat: IconChat,
  Home: IconHome,
  Edit: IconEdit,
  Trash: IconTrash,
  Share: IconShare,
  Block: IconBlock,
  Report: IconReport,
  Check: IconCheck,
  Lightning: IconLightning,
  Crown: IconCrown,
  // Features
  Star: IconStar,
  Taps: IconTaps,
  DTH: IconDTH,
  Orbit: IconOrbit,
  // Premium
  Infinity: IconInfinity,
  Telescope: IconTelescope,
  Ghost: IconGhost,
  Shield: IconShield,
  Sparkles: IconSparkles,
  Timer: IconTimer,
  Undo: IconUndo,
  Globe: IconGlobe,
  Typing: IconTyping,
  Albums: IconAlbums,
  DoubleCheck: IconDoubleCheck,
  Bookmark: IconBookmark,
  Video: IconVideo,
  Badge: IconBadge,
  EyeOff: IconEyeOff,
  Pin: IconPin,
  Headset: IconHeadset,
  Airplane: IconAirplane,
  Unlock: IconUnlock,
  Download: IconDownload,
  Clock: IconClock,
};

export default Icons;
