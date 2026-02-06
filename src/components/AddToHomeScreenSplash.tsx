'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { AnimatedLogo } from './AnimatedLogo';
import { supabase } from '../lib/supabase';

interface AddToHomeScreenSplashProps {
  userId: string;
  onDismiss?: () => void;
}

type Platform = 'ios-safari' | 'ios-other' | 'android' | 'desktop' | 'standalone';

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'desktop';

  // Check if already running as PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
  const isAndroid = /android/.test(ua);

  if (isIOS && isSafari) return 'ios-safari';
  if (isIOS) return 'ios-other';
  if (isAndroid) return 'android';
  return 'desktop';
}

export function AddToHomeScreenSplash({ userId, onDismiss }: AddToHomeScreenSplashProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>('desktop');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDismissalStatus = async () => {
      // Don't show on native iOS/Android app
      if (Capacitor.isNativePlatform()) {
        setLoading(false);
        onDismiss?.();
        return;
      }

      const detectedPlatform = detectPlatform();
      setPlatform(detectedPlatform);

      // Don't show if already installed as PWA
      if (detectedPlatform === 'standalone') {
        setLoading(false);
        onDismiss?.();
        return;
      }

      // Check if user has dismissed this before (within last 7 days) via Supabase
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('a2hs_dismissed_at')
          .eq('id', userId)
          .single();

        if (profile?.a2hs_dismissed_at) {
          const dismissedTime = new Date(profile.a2hs_dismissed_at).getTime();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - dismissedTime < sevenDaysMs) {
            setLoading(false);
            onDismiss?.();
            return;
          }
        }

        setIsVisible(true);
      } catch (error) {
        // If error checking, show the splash anyway
        setIsVisible(true);
      }
      setLoading(false);
    };

    checkDismissalStatus();

    // Listen for beforeinstallprompt (Android Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [userId, onDismiss]);

  const handleDismiss = async () => {
    // Save dismissal to Supabase
    try {
      await supabase
        .from('profiles')
        .update({ a2hs_dismissed_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error saving dismissal:', error);
    }
    setIsVisible(false);
    onDismiss?.();
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        handleDismiss();
      }
      setDeferredPrompt(null);
    }
  };

  if (loading || !isVisible) return null;

  const renderInstructions = () => {
    switch (platform) {
      case 'ios-safari':
        return (
          <div style={styles.instructions}>
            <div style={styles.step}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepContent}>
                <p style={styles.stepText}>
                  Tap the <strong style={styles.highlight}>Share</strong> button
                </p>
                <div style={styles.iconDemo}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                  <span style={styles.iconLabel}>at the bottom of Safari</span>
                </div>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepContent}>
                <p style={styles.stepText}>
                  Scroll and tap <strong style={styles.highlight}>&quot;Add to Home Screen&quot;</strong>
                </p>
                <div style={styles.iconDemo}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  <span style={styles.iconLabel}>in the share menu</span>
                </div>
              </div>
            </div>
            <div style={styles.step}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepContent}>
                <p style={styles.stepText}>
                  Tap <strong style={styles.highlight}>&quot;Add&quot;</strong> in the top right
                </p>
              </div>
            </div>
          </div>
        );

      case 'ios-other':
        return (
          <div style={styles.instructions}>
            <div style={styles.warningBox}>
              <p style={styles.warningText}>
                For the best experience, open Primal in <strong style={styles.highlight}>Safari</strong> to add it to your home screen.
              </p>
            </div>
            <p style={styles.subText}>
              Copy this link and paste it in Safari:
            </p>
            <div style={styles.urlBox}>
              <span style={styles.urlText}>primalgay.com</span>
            </div>
          </div>
        );

      case 'android':
        return (
          <div style={styles.instructions}>
            {deferredPrompt ? (
              <button onClick={handleInstall} style={styles.installButton}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Install Primal App
              </button>
            ) : (
              <>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>1</div>
                  <div style={styles.stepContent}>
                    <p style={styles.stepText}>
                      Tap the <strong style={styles.highlight}>menu</strong> button
                    </p>
                    <div style={styles.iconDemo}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF6B35">
                        <circle cx="12" cy="5" r="2"/>
                        <circle cx="12" cy="12" r="2"/>
                        <circle cx="12" cy="19" r="2"/>
                      </svg>
                      <span style={styles.iconLabel}>in the top right of Chrome</span>
                    </div>
                  </div>
                </div>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>2</div>
                  <div style={styles.stepContent}>
                    <p style={styles.stepText}>
                      Tap <strong style={styles.highlight}>&quot;Add to Home screen&quot;</strong>
                    </p>
                  </div>
                </div>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>3</div>
                  <div style={styles.stepContent}>
                    <p style={styles.stepText}>
                      Tap <strong style={styles.highlight}>&quot;Add&quot;</strong> to confirm
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return (
          <div style={styles.instructions}>
            <p style={styles.desktopText}>
              For the best experience, visit <strong style={styles.highlight}>primalgay.com</strong> on your phone and add it to your home screen.
            </p>
          </div>
        );
    }
  };

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
          {/* Logo */}
          <div style={styles.logoContainer}>
            <AnimatedLogo size="medium" href={undefined} showText={false} />
          </div>

          {/* Title */}
          <h2 style={styles.title}>Add Primal to Home Screen</h2>
          <p style={styles.subtitle}>
            Get the full app experience — faster access, push notifications, and a cleaner interface.
          </p>

          {/* Benefits */}
          <div style={styles.benefits}>
            <div style={styles.benefit}>
              <span style={styles.benefitIcon}>⚡</span>
              <span style={styles.benefitText}>Instant access</span>
            </div>
            <div style={styles.benefit}>
              <span style={styles.benefitIcon}>🔔</span>
              <span style={styles.benefitText}>Push notifications</span>
            </div>
            <div style={styles.benefit}>
              <span style={styles.benefitIcon}>📱</span>
              <span style={styles.benefitText}>Full screen mode</span>
            </div>
          </div>

          {/* Platform-specific instructions */}
          {renderInstructions()}

          {/* Dismiss Button */}
          <button onClick={handleDismiss} style={styles.dismissButton}>
            Maybe Later
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
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 107, 53, 0.2)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  logoContainer: {
    marginBottom: 24,
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
    gap: 16,
    marginBottom: 28,
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
  instructions: {
    textAlign: 'left',
    marginBottom: 24,
  },
  step: {
    display: 'flex',
    gap: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    lineHeight: 1.4,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  highlight: {
    color: '#FF6B35',
    fontWeight: 600,
  },
  iconDemo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  iconLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  warningBox: {
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    border: '1px solid rgba(255, 107, 53, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    lineHeight: 1.5,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  subText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 12,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  urlBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: '12px 16px',
  },
  urlText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FF6B35',
    fontFamily: 'monospace',
  },
  desktopText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 1.6,
    textAlign: 'center',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  installButton: {
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

export default AddToHomeScreenSplash;
