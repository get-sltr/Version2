'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AuroraOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export function Aurora() {
  const [orbs, setOrbs] = useState<AuroraOrb[]>([]);

  useEffect(() => {
    // Create aurora orbs with different characteristics
    const colors = [
      'rgba(255, 107, 53, 0.15)',   // Brand orange - subtle
      'rgba(255, 107, 53, 0.08)',   // Brand orange - very subtle
      'rgba(255, 140, 90, 0.12)',   // Lighter orange
      'rgba(180, 80, 40, 0.1)',     // Deeper amber
      'rgba(255, 107, 53, 0.06)',   // Almost invisible orange
    ];

    const generatedOrbs: AuroraOrb[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 300 + Math.random() * 500,
      color: colors[i % colors.length],
      duration: 20 + Math.random() * 15,
      delay: i * 0.5,
    }));

    setOrbs(generatedOrbs);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Base dark layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000000',
        }}
      />

      {/* Aurora orbs */}
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          initial={{
            x: `${orb.x}vw`,
            y: `${orb.y}vh`,
            scale: 0.8,
          }}
          animate={{
            x: [
              `${orb.x}vw`,
              `${(orb.x + 30) % 100}vw`,
              `${(orb.x - 20 + 100) % 100}vw`,
              `${orb.x}vw`,
            ],
            y: [
              `${orb.y}vh`,
              `${(orb.y - 25 + 100) % 100}vh`,
              `${(orb.y + 20) % 100}vh`,
              `${orb.y}vh`,
            ],
            scale: [0.8, 1.2, 0.9, 0.8],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            backgroundColor: orb.color,
            filter: 'blur(100px)',
            willChange: 'transform',
          }}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
