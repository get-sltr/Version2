// =============================================================================
// PrimalStarSplash - Animated star splash screen for Next.js
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrimalStarSplashProps {
  onComplete?: () => void;
}

const Star = ({
  color1,
  color2,
  gradientId,
}: {
  color1: string;
  color2: string;
  gradientId: string;
}) => (
  <svg width={120} height={180} viewBox="0 0 100 150">
    <defs>
      <linearGradient id={gradientId} x1="10%" y1="10%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color1} />
        <stop offset="50%" stopColor={color2} />
        <stop offset="100%" stopColor={color1} />
      </linearGradient>
    </defs>
    <polygon
      points="50,0 53,48 85,22 58,54 100,58 58,62 85,92 53,70 50,150 47,70 15,92 42,62 0,58 42,54 15,22 47,48"
      fill={`url(#${gradientId})`}
    />
  </svg>
);

export function PrimalStarSplash({ onComplete }: PrimalStarSplashProps) {
  const [phase, setPhase] = useState<'flying' | 'stacking' | 'flash' | 'logo' | 'done'>('flying');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('stacking'), 2500),
      setTimeout(() => setPhase('flash'), 3300),
      setTimeout(() => setPhase('logo'), 3900),
      setTimeout(() => {
        setPhase('done');
        onComplete?.();
      }, 4500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Star animation configs using percentages via CSS
  const getStarStyle = (starNum: 1 | 2 | 3): React.CSSProperties => {
    const positions = {
      flying: {
        1: { left: '-20%', top: '-20%' },
        2: { left: '120%', top: '120%' },
        3: { left: '80%', top: '50%' },
      },
      stacking: {
        1: { left: '50%', top: '35%' },
        2: { left: '50%', top: '35%' },
        3: { left: '50%', top: '35%' },
      },
    };

    const pos = phase === 'flying' ? positions.flying[starNum] : positions.stacking[starNum];

    return {
      position: 'absolute',
      left: pos.left,
      top: pos.top,
      transform: 'translate(-50%, -50%)',
      zIndex: 5,
    };
  };

  return (
    <div style={styles.container}>
      {/* Flash overlay */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            style={styles.flash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Star 1 - White */}
      <motion.div
        style={getStarStyle(1)}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{
          scale: phase === 'flying' ? 0.3 : phase === 'stacking' ? 1.2 : 1,
          opacity: phase === 'logo' || phase === 'done' ? 0 : 1,
        }}
        transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
      >
        <Star color1="#FFFFFF" color2="#C8DCFF" gradientId="grad-white" />
      </motion.div>

      {/* Star 2 - Orange */}
      <motion.div
        style={getStarStyle(2)}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{
          scale: phase === 'flying' ? 0.3 : phase === 'stacking' ? 1.2 : 1,
          opacity: phase === 'logo' || phase === 'done' ? 0 : 1,
        }}
        transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <Star color1="#FF9500" color2="#FFB366" gradientId="grad-orange" />
      </motion.div>

      {/* Star 3 - Black */}
      <motion.div
        style={getStarStyle(3)}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{
          scale: phase === 'flying' ? 0.3 : phase === 'stacking' ? 1.2 : 1,
          opacity: phase === 'logo' || phase === 'done' ? 0 : 1,
        }}
        transition={{ duration: 2.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Star color1="#1a1a1a" color2="#444444" gradientId="grad-black" />
      </motion.div>

      {/* Logo */}
      <motion.div
        style={styles.logo}
        initial={{ opacity: 0, y: 50 }}
        animate={{
          opacity: phase === 'logo' || phase === 'done' ? 1 : 0,
          y: phase === 'logo' || phase === 'done' ? 0 : 50,
        }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={styles.primal}>PRIMAL</h1>
        <p style={styles.tagline}>RULES DONT APPLY</p>
      </motion.div>

      {/* Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&display=swap');
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#050508',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 9999,
  },
  flash: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  },
  logo: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 15,
  },
  primal: {
    fontSize: 80,
    fontWeight: 900,
    color: '#FFFFFF',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: 12,
    textShadow: '0 0 20px #FF9500, 0 0 40px #FF9500',
    margin: 0,
  },
  tagline: {
    fontSize: 16,
    color: '#FF9500',
    fontFamily: "'Orbitron', sans-serif",
    letterSpacing: 6,
    marginTop: 10,
  },
};

export default PrimalStarSplash;
