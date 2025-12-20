'use client';

import React, { useState } from 'react';
import { colors, radius, typography, effects } from '../../../tokens';
import { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  children,
  onClick,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '8px 12px', fontSize: typography.fontSize.sm },
    md: { padding: '12px 16px', fontSize: typography.fontSize.base },
    lg: { padding: '16px 24px', fontSize: typography.fontSize.lg },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: colors.primary.electricLime, color: colors.neutral.black },
    secondary: { background: 'transparent', color: colors.primary.electricLime, border: `2px solid ${colors.primary.electricLime}` },
    ghost: { background: 'transparent', color: colors.neutral.white },
    danger: { background: colors.semantic.error, color: colors.neutral.white },
  };

  const hoverStyles: Record<string, React.CSSProperties> = {
    primary: { background: '#b8e600' },
    secondary: { background: 'rgba(204, 255, 0, 0.1)' },
    ghost: { background: 'rgba(255, 255, 255, 0.1)' },
    danger: { background: '#cc3333' },
  };

  const focusRingColor: Record<string, string> = {
    primary: colors.neutral.black,
    secondary: colors.primary.electricLime,
    ghost: colors.primary.electricLime,
    danger: colors.neutral.white,
  };

  const baseStyles: React.CSSProperties = {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.semibold,
    borderRadius: radius.lg,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: effects.transition.normal,
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    outline: 'none',
    position: 'relative',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(isHovered && !disabled ? hoverStyles[variant] : {}),
    ...(isFocused && {
      boxShadow: `0 0 0 3px ${focusRingColor[variant]}40, 0 0 0 1px ${focusRingColor[variant]}`,
    }),
  };

  return (
    <button
      style={baseStyles}
      onClick={onClick}
      disabled={disabled}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </button>
  );
};
