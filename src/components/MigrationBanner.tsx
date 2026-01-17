'use client';

import { useState, useEffect } from 'react';

const BANNER_DISMISSED_KEY = 'primal_migration_banner_dismissed';

export function MigrationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show on getsltr.com domain
    const isOldDomain = typeof window !== 'undefined' &&
      (window.location.hostname === 'getsltr.com' ||
       window.location.hostname === 'www.getsltr.com');

    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);

    if (isOldDomain && !dismissed) {
      setVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setVisible(false);
  };

  const handleGoToNewSite = () => {
    window.location.href = `https://primalgay.com${window.location.pathname}`;
  };

  if (!visible) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <span style={styles.icon}>🚀</span>
        <div style={styles.text}>
          <strong style={styles.title}>We&apos;ve moved!</strong>
          <span style={styles.message}>Our new home is at <strong>primalgay.com</strong></span>
        </div>
      </div>
      <div style={styles.actions}>
        <button onClick={handleGoToNewSite} style={styles.primaryButton}>
          Go to Primal
        </button>
        <button onClick={handleDismiss} style={styles.dismissButton}>
          ✕
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  banner: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998,
    background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  icon: {
    fontSize: 24,
  },
  text: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  primaryButton: {
    background: '#fff',
    color: '#E55A2B',
    border: 'none',
    borderRadius: 6,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  dismissButton: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 14,
  },
};

export default MigrationBanner;
