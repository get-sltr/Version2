import React from 'react';
import { colors, typography } from '../../../tokens';

export interface BadgeProps {
  variant?: 'default' | 'online' | 'distance' | 'new';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { backgroundColor: colors.neutral.gray800, color: colors.neutral.white },
    online: { backgroundColor: colors.semantic.online, color: colors.neutral.black },
    distance: { backgroundColor: colors.neutral.gray800, color: '#A3A3A3' },
    new: { backgroundColor: colors.primary.orange, color: colors.neutral.white },
  };

  return (
    <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '9999px', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, ...variantStyles[variant] }}>
      {children}
    </span>
  );
};
