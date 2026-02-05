'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { requestNotificationPermission, isNotificationsEnabled } from './OneSignalProvider';

interface PushNotificationPromptProps {
  userId: string;
  onDismiss?: () => void;
}

/**
 * Prompt users to enable push notifications when running as PWA
 * Only shows for iOS 16.4+ and Android PWAs
 */
export function PushNotificationPrompt({ userId, onDismiss }: PushNotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    const checkNotificationStatus = async () => {
      // Only show in standalone mode (PWA)
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!isStandalone) {
        setLoading(false);
        onDismiss?.();
        return;
      }

      // Check if notifications are supported
      if (!('Notification' in window)) {
        setLoading(false);
        onDismiss?.();
        return;
      }

      // Check if already enabled
      const enabled = await isNotificationsEnabled();
      if (enabled) {
        setLoading(false);
        onDismiss?.();
        return;
      }

      // Check if user has already dismissed this prompt
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('push_prompt_dismissed_at')
          .eq('id', userId)
          .single();

        if (profile?.push_prompt_dismissed_at) {
          const dismissedTime = new Date(profile.push_prompt_dismissed_at).getTime();
          const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - dismissedTime < thirtyDaysMs) {
            setLoading(false);
            onDismiss?.();
            return;
          }
        }

        setIsVisible(true);
      } catch (error) {
        // Show prompt anyway if check fails
        setIsVisible(true);
      }
      setLoading(false);
    };

    checkNotificationStatus();
  }, [userId, onDismiss]);

  const handleDismiss = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ push_prompt_dismissed_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error saving push prompt dismissal:', error);
    }
    setIsVisible(false);
    onDismiss?.();
  };

  const handleEnableNotifications = async () => {
    setEnabling(true);
    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        // Update profile to mark notifications enabled
        await supabase
          .from('profiles')
          .update({ push_enabled_at: new Date().toISOString() })
          .eq('id', userId);
      }
      setIsVisible(false);
      onDismiss?.();
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
    setEnabling(false);
  };

  if (loading || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={styles.overlay}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={styles.modal}
        >
          {/* Bell Icon */}
          <div style={styles.iconContainer}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>

          {/* Title */}
          <h2 style={styles.title}>Stay Connected</h2>
          <p style={styles.subtitle}>
            Enable notifications to know when you get messages, taps, and matches — even when you&apos;re not using the app.
          </p>

          {/* Benefits */}
          <div style={styles.benefits}>
            <div style={styles.benefit}>
              <span style={styles.benefitIcon}>💬</span>
              <span style={styles.benefitText}>New messages</span>
            </div>
            <div style={styles.benefit}>
              <span style={styles.benefitIcon}>👋</span>
              <span style={styles.benefitText}>Taps & matches</span>
            </div>
            <div style={styles.benefit}>
              <span style={styles.benefitIcon}>👀</span>
              <span style={styles.benefitText}>Profile views</span>
            </div>
          </div>

          {/* Buttons */}
          <button
            onClick={handleEnableNotifications}
            style={styles.enableButton}
            disabled={enabling}
          >
            {enabling ? 'Enabling...' : 'Enable Notifications'}
          </button>

          <button onClick={handleDismiss} style={styles.dismissButton}>
            Not Now
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    backgroundColor: '#0A1628',
    borderRadius: 24,
    padding: '32px 24px',
    maxWidth: 360,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 107, 53, 0.2)',
  },
  iconContainer: {
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: "'Audiowide', sans-serif",
    letterSpacing: '0.05em',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 1.5,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  benefits: {
    display: 'flex',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  benefit: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    padding: '8px 12px',
    borderRadius: 20,
    border: '1px solid rgba(255, 107, 53, 0.2)',
  },
  benefitIcon: {
    fontSize: 14,
  },
  benefitText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  enableButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)',
    marginBottom: 12,
  },
  dismissButton: {
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: '14px 24px',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    width: '100%',
    transition: 'all 0.2s ease',
  },
};

export default PushNotificationPrompt;
