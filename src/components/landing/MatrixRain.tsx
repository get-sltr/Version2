'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface RainDrop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  height: number;
  opacity: number;
}

interface Splash {
  id: number;
  x: number;
  y: number;
}

interface MatrixRainProps {
  onRevealComplete: () => void;
  targetText?: string;
}

export function MatrixRain({ onRevealComplete, targetText = 'primal' }: MatrixRainProps) {
  const [drops, setDrops] = useState<RainDrop[]>([]);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [revealedLetters, setRevealedLetters] = useState<string[]>([]);
  const [phase, setPhase] = useState<'raining' | 'revealing' | 'complete'>('raining');

  // Generate rain drops
  useEffect(() => {
    const initialDrops: RainDrop[] = [];
    for (let i = 0; i < 80; i++) {
      initialDrops.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        height: 30 + Math.random() * 60,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
    setDrops(initialDrops);

    const revealTimer = setTimeout(() => {
      setPhase('revealing');
      revealLettersSequentially();
    }, 3000);

    return () => clearTimeout(revealTimer);
  }, []);

  const revealLettersSequentially = useCallback(() => {
    const letters = targetText.split('');
    let currentIndex = 0;

    const revealNext = () => {
      if (currentIndex < letters.length) {
        const letter = letters[currentIndex];
        const splashX = 35 + (currentIndex * 10);
        setSplashes(prev => [...prev, { id: Date.now() + currentIndex, x: splashX, y: 50 }]);

        setTimeout(() => {
          setRevealedLetters(prev => [...prev, letter]);
        }, 200);

        currentIndex++;
        setTimeout(revealNext, 450);
      } else {
        setTimeout(() => {
          setPhase('complete');
          onRevealComplete();
        }, 800);
      }
    };

    revealNext();
  }, [targetText, onRevealComplete]);

  useEffect(() => {
    if (splashes.length > 0) {
      const timer = setTimeout(() => {
        setSplashes(prev => prev.slice(1));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [splashes]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Rain drops - simple lines */}
      <AnimatePresence>
        {(phase === 'raining' || phase === 'revealing') && drops.map((drop) => (
          <motion.div
            key={drop.id}
            initial={{ y: '-10vh', opacity: 0 }}
            animate={{
              y: '110vh',
              opacity: [0, drop.opacity, drop.opacity, 0],
            }}
            transition={{
              duration: drop.duration,
              delay: drop.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: `${drop.x}%`,
              width: '2px',
              height: `${drop.height}px`,
              background: 'linear-gradient(to bottom, transparent, #FF6B35 20%, #FF6B35 80%, transparent)',
              borderRadius: '2px',
              boxShadow: '0 0 8px rgba(255, 107, 53, 0.6), 0 0 20px rgba(255, 107, 53, 0.3)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Thicker accent drops */}
      <AnimatePresence>
        {(phase === 'raining' || phase === 'revealing') && drops.slice(0, 20).map((drop) => (
          <motion.div
            key={`thick-${drop.id}`}
            initial={{ y: '-10vh', opacity: 0 }}
            animate={{
              y: '110vh',
              opacity: [0, 0.8, 0.8, 0],
            }}
            transition={{
              duration: drop.duration * 1.2,
              delay: drop.delay + 0.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: `${(drop.x + 5) % 100}%`,
              width: '3px',
              height: `${drop.height * 1.5}px`,
              background: 'linear-gradient(to bottom, transparent, #FF8555 10%, #FF6B35 50%, #FF8555 90%, transparent)',
              borderRadius: '3px',
              boxShadow: '0 0 15px rgba(255, 107, 53, 0.8), 0 0 30px rgba(255, 107, 53, 0.4)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Splash rings */}
      <AnimatePresence>
        {splashes.map((splash) => (
          <motion.div
            key={splash.id}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${splash.x}%`,
              top: `${splash.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '2px solid #FF6B35',
              boxShadow: '0 0 25px rgba(255, 107, 53, 0.8), 0 0 50px rgba(255, 107, 53, 0.4)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Inner splash */}
      <AnimatePresence>
        {splashes.map((splash) => (
          <motion.div
            key={`inner-${splash.id}`}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
            style={{
              position: 'absolute',
              left: `${splash.x}%`,
              top: `${splash.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 107, 53, 0.5)',
              boxShadow: '0 0 30px rgba(255, 107, 53, 0.9)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Splash droplets */}
      <AnimatePresence>
        {splashes.map((splash) => (
          Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const distance = 60 + Math.random() * 30;
            return (
              <motion.div
                key={`${splash.id}-drop-${i}`}
                initial={{
                  x: `${splash.x}vw`,
                  y: `${splash.y}vh`,
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: `calc(${splash.x}vw + ${Math.cos(angle) * distance}px)`,
                  y: `calc(${splash.y}vh + ${Math.sin(angle) * distance}px)`,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: '#FF6B35',
                  boxShadow: '0 0 10px rgba(255, 107, 53, 1)',
                }}
              />
            );
          })
        ))}
      </AnimatePresence>

      {/* White flash */}
      <AnimatePresence>
        {splashes.map((splash) => (
          <motion.div
            key={`flash-${splash.id}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              left: `${splash.x}%`,
              top: `${splash.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
              filter: 'blur(8px)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
