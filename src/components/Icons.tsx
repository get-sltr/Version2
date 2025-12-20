// =============================================================================
// SLTR Icons — Final v7
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

export const IconDTFN = ({ size = 140, className }: IconProps) => (
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
    <text x="56" y="38" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="500" letterSpacing="3" fill="#FF6B35">DTFN</text>
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
  DTFN: IconDTFN,
};

export default Icons;
