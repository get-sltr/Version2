'use client';

import React, { useEffect, useRef } from 'react';
import { colors, radius, typography, effects } from '../../../tokens';
import { IconButton } from '../../atoms/IconButton';

export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'full';
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: { maxWidth: '400px' },
  md: { maxWidth: '500px' },
  lg: { maxWidth: '700px' },
  full: { maxWidth: '100%', margin: '0', height: '100vh', borderRadius: 0 },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap and restore
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={closeOnOverlayClick ? onClose : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: size === 'full' ? 0 : '20px',
        zIndex: 1000,
        animation: 'fadeIn 150ms ease',
      }}
    >
      <style>
        {`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}
      </style>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          backgroundColor: colors.neutral.richBlack,
          borderRadius: radius.xl,
          outline: 'none',
          animation: 'slideUp 200ms ease',
          ...sizeStyles[size],
        }}
      >
        {(title || showCloseButton) && (
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: `1px solid ${colors.neutral.gray800}`,
            }}
          >
            {title && (
              <h2
                id="modal-title"
                style={{
                  margin: 0,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  fontFamily: typography.fontFamily.primary,
                  color: colors.neutral.white,
                }}
              >
                {title}
              </h2>
            )}
            {!title && <span />}
            {showCloseButton && (
              <IconButton
                icon="✕"
                aria-label="Close modal"
                onClick={onClose}
                size="sm"
                variant="ghost"
              />
            )}
          </header>
        )}
        <div style={{ padding: '20px', color: colors.neutral.white }}>
          {children}
        </div>
      </div>
    </div>
  );
};
