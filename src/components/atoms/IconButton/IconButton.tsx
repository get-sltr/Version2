import React from 'react';
import { colors, radius, effects } from '../../../tokens';

export interface IconButtonProps {
  /** Icon to display (emoji or component) */
  icon: React.ReactNode;
  /** Accessible label (required for a11y) */
  'aria-label': string;
  /** Click handler */
  onClick?: () => void;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'ghost' | 'filled' | 'outline';
  /** Disabled state */
  disabled?: boolean;
  /** Type attribute */
  type?: 'button' | 'submit' | 'reset';
}

const sizeMap = {
  sm: { dimension: 32, fontSize: 16 },
  md: { dimension: 40, fontSize: 20 },
  lg: { dimension: 48, fontSize: 24 },
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  'aria-label': ariaLabel,
  onClick,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  type = 'button',
}) => {
  const { dimension, fontSize } = sizeMap[size];

  const variantStyles: Record<string, React.CSSProperties> = {
    ghost: {
      background: 'transparent',
      border: 'none',
      color: colors.neutral.white,
    },
    filled: {
      background: colors.neutral.gray800,
      border: 'none',
      color: colors.neutral.white,
    },
    outline: {
      background: 'transparent',
      border: `2px solid ${colors.neutral.gray800}`,
      color: colors.neutral.white,
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        width: dimension,
        height: dimension,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.full,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: effects.transition.fast,
        fontSize,
        outline: 'none',
        ...variantStyles[variant],
        ...(isHovered && !disabled && {
          background: variant === 'ghost' ? 'rgba(255,255,255,0.1)' : colors.neutral.gray800,
        }),
        ...(isFocused && {
          boxShadow: `0 0 0 2px ${colors.primary.electricLime}`,
        }),
      }}
    >
      {icon}
    </button>
  );
};
