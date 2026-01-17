'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RebrandSplashProps {
  onDismiss?: () => void;
}

export function RebrandSplash({ onDismiss }: RebrandSplashProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'sltr' | 'transition' | 'primal'>('sltr');

  useEffect(() => {
    // Start animation sequence
    const timer1 = setTimeout(() => setPhase('transition'), 1500);
    const timer2 = setTimeout(() => setPhase('primal'), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          style={styles.modal}
        >
          {/* Logo Animation */}
          <div style={styles.logoContainer}>
            <AnimatePresence mode="wait">
              {phase === 'sltr' && (
                <motion.h1
                  key="sltr"
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5 }}
                  style={styles.sltrLogo}
                >
                  SLTR
                </motion.h1>
              )}
              {phase === 'transition' && (
                <motion.div
                  key="transition"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  style={styles.arrowContainer}
                >
                  <span style={styles.arrow}>→</span>
                </motion.div>
              )}
              {phase === 'primal' && (
                <motion.h1
                  key="primal"
                  initial={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  style={styles.primalLogo}
                >
                  PRIMAL
                </motion.h1>
              )}
            </AnimatePresence>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === 'primal' ? 1 : 0, y: phase === 'primal' ? 0 : 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={styles.messageContainer}
          >
            <h2 style={styles.title}>SLTR is Evolving</h2>
            <p style={styles.message}>
              We&apos;re becoming <strong style={styles.highlight}>PRIMAL</strong> — a rebrand that reflects
              who we&apos;ve become and where we&apos;re going. Bold, intuitive, built around confidence,
              connection, and authenticity.
            </p>
            <div style={styles.details}>
              <p style={styles.detailItem}>
                <span style={styles.checkmark}>✓</span> Your account, data & settings stay the same
              </p>
              <p style={styles.detailItem}>
                <span style={styles.checkmark}>✓</span> Same features you know and love
              </p>
              <p style={styles.detailItem}>
                <span style={styles.checkmark}>✓</span> Fresh look, same mission
              </p>
            </div>
            <p style={styles.tagline}>Rules Don&apos;t Apply</p>
            <p style={styles.signature}>— Kevin, Founder</p>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase === 'primal' ? 1 : 0, y: phase === 'primal' ? 0 : 20 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDismiss}
            style={styles.button}
          >
            Let&apos;s Go
          </motion.button>
        </motion.div>

        {/* Fonts */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Orbitron:wght@400;500;600;700;900&display=swap');
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(10, 22, 40, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 20,
  },
  modal: {
    backgroundColor: '#132038',
    borderRadius: 24,
    padding: '48px 32px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 107, 53, 0.1)',
    border: '1px solid rgba(255, 107, 53, 0.2)',
  },
  logoContainer: {
    height: 80,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  sltrLogo: {
    fontSize: 48,
    fontWeight: 900,
    color: '#FFFFFF',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: 8,
    margin: 0,
    textShadow: '0 0 20px rgba(255, 149, 0, 0.5)',
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 48,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  primalLogo: {
    fontSize: 48,
    fontWeight: 400,
    color: '#FFFFFF',
    fontFamily: "'Audiowide', sans-serif",
    letterSpacing: 4,
    margin: 0,
    textShadow: '0 0 30px rgba(255, 107, 53, 0.6), 0 0 60px rgba(255, 107, 53, 0.3)',
  },
  messageContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  message: {
    fontSize: 16,
    lineHeight: 1.6,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  highlight: {
    color: '#FF6B35',
    fontWeight: 600,
  },
  tagline: {
    fontSize: 14,
    color: '#B8A9C9',
    fontFamily: "'Audiowide', sans-serif",
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 16,
  },
  details: {
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 8,
    padding: '16px 20px',
    backgroundColor: 'rgba(255, 107, 53, 0.08)',
    borderRadius: 12,
    border: '1px solid rgba(255, 107, 53, 0.15)',
  },
  detailItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    margin: '8px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signature: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    marginTop: 16,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  button: {
    backgroundColor: '#FF6B35',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    padding: '16px 48px',
    fontSize: 18,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)',
    transition: 'all 0.2s ease',
  },
};

export default RebrandSplash;
