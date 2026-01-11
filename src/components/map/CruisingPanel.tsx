// =============================================================================
// CruisingPanel - Marketplace text input with Liquid Glass design
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import type { CruisingPanelProps } from '@/types/map';
import styles from './Map.module.css';

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MAX_LENGTH = 280;

export function CruisingPanel({ isOpen, onClose, onPost }: CruisingPanelProps) {
  const [text, setText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const handlePost = useCallback(async () => {
    if (!text.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await onPost(text.trim());
      setText('');
      onClose();
    } catch (error) {
      // Error handled by parent - just reset state
      console.error('Post failed:', error);
    } finally {
      setIsPosting(false);
    }
  }, [text, onPost, onClose, isPosting]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && text.trim() && !isPosting) {
        handlePost();
      }
    },
    [handlePost, text, isPosting]
  );

  const isNearLimit = text.length >= 260;
  const isEmpty = text.length === 0;

  return (
    <div className={`${styles.cruisingPanel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.cruisingHeader}>
        <h2 className={styles.cruisingTitle}>
          <span style={{
            color: '#FF6B35',
            textShadow: '0 0 10px rgba(255, 107, 53, 0.5), 0 0 20px rgba(255, 107, 53, 0.3)'
          }}>
            Cruising Update
          </span>
        </h2>
        <button className={styles.menuClose} onClick={onClose} disabled={isPosting}>
          <CloseIcon />
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <div className={styles.cruisingInputWrapper}>
          <input
            type="text"
            className={styles.cruisingInput}
            placeholder="Let others know..."
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            maxLength={MAX_LENGTH}
            disabled={isPosting}
          />
          <button
            className={styles.cruisingPostBtn}
            onClick={handlePost}
            disabled={isEmpty || isPosting}
            style={{
              color: '#FF6B35',
              textShadow: isEmpty || isPosting ? 'none' : '0 0 8px rgba(255, 107, 53, 0.6)',
              transition: 'all 0.3s ease'
            }}
          >
            <SendIcon />
            {isPosting ? '...' : 'POST'}
          </button>
        </div>
        <span className={`${styles.cruisingCharCount} ${isNearLimit ? styles.limit : ''}`}>
          {text.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
