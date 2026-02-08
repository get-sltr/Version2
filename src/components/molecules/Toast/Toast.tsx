'use client';

import React, { useEffect } from 'react';
import { colors, radius, typography, effects } from '../../../tokens';

export interface ToastProps {
  /** Toast message */
  message: string;
  /** Toast variant */
  variant?: 'success' | 'error' | 'warning' | 'info';
  /** Duration in ms (0 for persistent) */
  duration?: number;
  /** Close handler */
  onClose: () => void;
  /** Position on screen */
  position?: 'top' | 'bottom';
  /** Whether toast is visible */
  isVisible: boolean;
}

const variantConfig = {
  success: {
    background: '#1a472a',
    border: '#22c55e',
    icon: '✓',
  },
  error: {
    background: '#4a1515',
    border: colors.semantic.error,
    icon: '✕',
  },
  warning: {
    background: '#4a3515',
    border: colors.primary.orange,
    icon: '⚠',
  },
  info: {
    background: '#1a2a4a',
    border: '#3b82f6',
    icon: 'ℹ',
  },
};

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 4000,
  onClose,
  position = 'bottom',
  isVisible,
}) => {
  const config = variantConfig[variant];

  useEffect(() => {
    if (!isVisible || duration === 0) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        [position]: '20px',
        zIndex: 1100,
        animation: `slideIn 200ms ease`,
      }}
    >
      <style>
        {`@keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(${position === 'bottom' ? '20px' : '-20px'});
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }`}
      </style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 20px',
          backgroundColor: config.background,
          border: `1px solid ${config.border}`,
          borderRadius: radius.lg,
          boxShadow: effects.shadow.md,
          minWidth: '280px',
          maxWidth: '400px',
        }}
      >
        <span
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.full,
            backgroundColor: config.border,
            color: colors.neutral.white,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.bold,
            flexShrink: 0,
          }}
        >
          {config.icon}
        </span>
        <span
          style={{
            flex: 1,
            color: colors.neutral.white,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.primary,
            lineHeight: 1.4,
          }}
        >
          {message}
        </span>
        <button
          onClick={onClose}
          aria-label="Dismiss notification"
          style={{
            background: 'none',
            border: 'none',
            color: colors.neutral.white,
            opacity: 0.6,
            cursor: 'pointer',
            padding: '4px',
            fontSize: '16px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
