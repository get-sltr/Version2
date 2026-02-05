import type { CSSProperties } from 'react';

// =============================================================================
// Liquid Glass Design Tokens
// Extracted from Map.module.css glass patterns for reuse across surfaces.
// =============================================================================

/** Color primitives */
export const glassColors = {
  glassFill05: 'rgba(255, 255, 255, 0.05)',
  glassFill08: 'rgba(255, 255, 255, 0.08)',
  glassFill10: 'rgba(255, 255, 255, 0.10)',
  glassFill15: 'rgba(255, 255, 255, 0.15)',

  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderMedium: 'rgba(255, 255, 255, 0.15)',
  borderBright: 'rgba(255, 255, 255, 0.20)',

  accent: '#ff6b35',
  accentGlow: 'rgba(255, 107, 53, 0.3)',
  accentGlowLight: 'rgba(255, 107, 53, 0.15)',
} as const;

/** Effect primitives */
export const glassEffects = {
  blur: 'blur(20px) saturate(180%)',
  blurHeavy: 'blur(30px) saturate(180%)',
  blurLight: 'blur(12px) saturate(150%)',

  shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  shadowDeep: '0 12px 48px rgba(0, 0, 0, 0.5)',
  shadowWithInner:
    '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',

  glowOrange: '0 0 20px rgba(255, 107, 53, 0.3)',
} as const;

// =============================================================================
// Ready-to-spread CSSProperties objects
// =============================================================================

/** Standard glass card */
export const glassCard: CSSProperties = {
  background: 'rgba(10, 10, 15, 0.6)',
  backdropFilter: glassEffects.blur,
  WebkitBackdropFilter: glassEffects.blur,
  border: `1px solid ${glassColors.borderLight}`,
  borderRadius: '16px',
  boxShadow: glassEffects.shadow,
};

/** Sticky header with heavy blur */
export const glassHeader: CSSProperties = {
  position: 'sticky',
  top: 0,
  background: 'rgba(10, 10, 15, 0.7)',
  backdropFilter: glassEffects.blurHeavy,
  WebkitBackdropFilter: glassEffects.blurHeavy,
  borderBottom: `1px solid ${glassColors.border}`,
  zIndex: 100,
};

/** Modal overlay panel */
export const glassModal: CSSProperties = {
  background: 'rgba(30, 30, 35, 0.98)',
  backdropFilter: glassEffects.blurHeavy,
  WebkitBackdropFilter: glassEffects.blurHeavy,
  border: `1px solid ${glassColors.borderBright}`,
  borderRadius: '20px',
  boxShadow: glassEffects.shadowDeep,
};

/** Standard button */
export const glassButton: CSSProperties = {
  background: glassColors.glassFill10,
  backdropFilter: glassEffects.blur,
  WebkitBackdropFilter: glassEffects.blur,
  border: `1px solid ${glassColors.borderBright}`,
  borderRadius: '10px',
};

/** Active / selected button */
export const glassButtonActive: CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)',
  border: `1px solid rgba(255, 107, 53, 0.6)`,
  borderRadius: '10px',
  boxShadow: glassEffects.glowOrange,
};

/** Bottom navigation bar */
export const glassBottomNav: CSSProperties = {
  background: 'rgba(10, 10, 15, 0.85)',
  backdropFilter: glassEffects.blurHeavy,
  WebkitBackdropFilter: glassEffects.blurHeavy,
  borderTop: `1px solid ${glassColors.border}`,
};

/** Input field */
export const glassInput: CSSProperties = {
  background: glassColors.glassFill05,
  backdropFilter: glassEffects.blurLight,
  WebkitBackdropFilter: glassEffects.blurLight,
  border: `1px solid ${glassColors.borderMedium}`,
  borderRadius: '12px',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 15px rgba(0, 0, 0, 0.2)',
};

/** Dropdown panel */
export const glassDropdown: CSSProperties = {
  background: 'rgba(5, 5, 5, 0.95)',
  backdropFilter: glassEffects.blurHeavy,
  WebkitBackdropFilter: glassEffects.blurHeavy,
  border: `1px solid rgba(255, 107, 53, 0.2)`,
  borderRadius: '16px',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
};
