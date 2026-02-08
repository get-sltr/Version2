'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { colors, typography } from '../../../tokens';
import { IconButton } from '../../atoms/IconButton';
import { Spinner } from '../../atoms/Spinner';

export interface HeaderProps {
  /** Page title */
  title: string;
  /** Show back button */
  showBack?: boolean;
  /** Back button handler (defaults to router.back) */
  onBack?: () => void;
  /** Right side action */
  rightAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'text' | 'primary';
  };
  /** Left side action (alternative to back button) */
  leftAction?: {
    label: string;
    onClick: () => void;
  };
  /** Sticky header */
  sticky?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  onBack,
  rightAction,
  leftAction,
  sticky = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      style={{
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.neutral.gray800}`,
        backgroundColor: colors.neutral.black,
        ...(sticky && {
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }),
      }}
    >
      {/* Left side */}
      <div style={{ minWidth: '70px' }}>
        {leftAction ? (
          <button
            onClick={leftAction.onClick}
            style={{
              color: colors.primary.orange,
              background: 'none',
              border: 'none',
              fontSize: typography.fontSize.base,
              fontFamily: typography.fontFamily.primary,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {leftAction.label}
          </button>
        ) : showBack ? (
          <IconButton
            icon="‹"
            aria-label="Go back"
            onClick={handleBack}
            size="md"
            variant="ghost"
          />
        ) : null}
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          fontFamily: typography.fontFamily.primary,
          color: colors.neutral.white,
          margin: 0,
          textAlign: 'center',
          flex: 1,
        }}
      >
        {title}
      </h1>

      {/* Right side */}
      <div style={{ minWidth: '70px', textAlign: 'right' }}>
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            disabled={rightAction.disabled || rightAction.loading}
            style={{
              color: rightAction.disabled || rightAction.loading
                ? '#555'
                : rightAction.variant === 'primary'
                  ? colors.primary.electricLime
                  : colors.primary.orange,
              background: 'none',
              border: 'none',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              fontFamily: typography.fontFamily.primary,
              cursor: rightAction.disabled || rightAction.loading ? 'default' : 'pointer',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {rightAction.loading && <Spinner size="sm" color="current" />}
            {rightAction.label}
          </button>
        )}
      </div>
    </header>
  );
};
