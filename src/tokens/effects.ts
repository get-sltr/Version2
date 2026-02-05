export const effects = {
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px rgba(0, 0, 0, 0.5)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
    glassDeep: '0 12px 48px rgba(0, 0, 0, 0.5)',
    glow: {
      lime: '0 0 20px rgba(204, 255, 0, 0.5)',
      online: '0 0 10px rgba(0, 255, 0, 0.6)',
      orange: '0 0 20px rgba(255, 107, 53, 0.3)',
    },
  },
  backdrop: {
    glass: 'blur(20px) saturate(180%)',
    glassHeavy: 'blur(30px) saturate(180%)',
    glassLight: 'blur(12px) saturate(150%)',
  },
  transition: {
    fast: '150ms ease',
    normal: '250ms ease',
    smooth: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
