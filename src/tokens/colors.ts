export const colors = {
  primary: {
    orange: '#FF6B35',
    orangeHover: '#FF8555',
    electricLime: '#CCFF00',
    electricLimeHover: '#B8E600',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    richBlack: '#0A0A0A',
    /** Dark gray for cards/containers on black bg */
    gray900: '#1C1C1E',
    /** Medium-dark gray for borders */
    gray800: '#262626',
    /** Medium gray for secondary borders */
    gray700: '#333333',
    /** Text on dark backgrounds - WCAG AA compliant */
    gray400: '#A3A3A3',
    /** Muted text on dark backgrounds - WCAG AA for large text */
    gray500: '#8A8A8A',
    /** Disabled/placeholder text */
    gray600: '#666666',
  },
  semantic: {
    /** Online status indicator */
    online: '#22C55E',
    onlineGlow: 'rgba(34, 197, 94, 0.5)',
    /** Error states - WCAG AA compliant on dark */
    error: '#EF4444',
    errorLight: '#FCA5A5',
    errorDark: '#991B1B',
    /** Success states */
    success: '#22C55E',
    successLight: '#86EFAC',
    successDark: '#166534',
    /** Warning states */
    warning: '#F59E0B',
    warningLight: '#FCD34D',
    warningDark: '#92400E',
    /** Info states */
    info: '#3B82F6',
    infoLight: '#93C5FD',
    infoDark: '#1E40AF',
  },
  /** Background colors for different surfaces */
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    elevated: '#1C1C1E',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  /** Text colors with WCAG compliance notes */
  text: {
    /** Primary text on dark bg - 21:1 contrast ratio */
    primary: '#FFFFFF',
    /** Secondary text on dark bg - 7.4:1 contrast ratio (AAA) */
    secondary: '#A3A3A3',
    /** Muted text on dark bg - 4.6:1 contrast ratio (AA for large text) */
    muted: '#8A8A8A',
    /** Disabled text */
    disabled: '#666666',
    /** Inverse text for light backgrounds */
    inverse: '#000000',
  },
};
