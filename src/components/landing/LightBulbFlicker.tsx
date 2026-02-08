'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface FlickerPoint {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface LightBulbFlickerProps {
  isActive: boolean;
  intensity?: number;
}

export function LightBulbFlicker({ isActive, intensity = 1 }: LightBulbFlickerProps) {
  const [flickerPoints, setFlickerPoints] = useState<FlickerPoint[]>([]);

  useEffect(() => {
    // Light positions based on typical light bulb locations in photos
    const points: FlickerPoint[] = [
      { id: 1, x: 15, y: 20, size: 80, delay: 0 },
      { id: 2, x: 35, y: 15, size: 60, delay: 0.1 },
      { id: 3, x: 55, y: 18, size: 70, delay: 0.2 },
      { id: 4, x: 75, y: 22, size: 65, delay: 0.15 },
      { id: 5, x: 85, y: 25, size: 55, delay: 0.25 },
      { id: 6, x: 25, y: 30, size: 50, delay: 0.3 },
      { id: 7, x: 65, y: 28, size: 45, delay: 0.35 },
    ];
    setFlickerPoints(points);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>
        {isActive && flickerPoints.map((point) => (
          <motion.div
            key={point.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, intensity * 0.8, intensity * 0.3, intensity * 0.9, intensity * 0.5, intensity],
              scale: [0.5, 1.2, 0.9, 1.1, 1],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              duration: 0.8,
              delay: point.delay,
              times: [0, 0.1, 0.3, 0.5, 0.7, 1],
            }}
            style={{
              position: 'absolute',
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 200, 100, 0.6)',
              boxShadow: `
                0 0 ${point.size * 0.5}px rgba(255, 180, 80, 0.8),
                0 0 ${point.size}px rgba(255, 150, 50, 0.5),
                0 0 ${point.size * 1.5}px rgba(255, 107, 53, 0.3)
              `,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Continuous subtle flicker when active */}
      <AnimatePresence>
        {isActive && flickerPoints.map((point) => (
          <motion.div
            key={`glow-${point.id}`}
            animate={{
              opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
              scale: [1, 1.1, 0.95, 1.05, 1],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: point.delay + 0.8,
            }}
            style={{
              position: 'absolute',
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size * 0.6,
              height: point.size * 0.6,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 220, 150, 0.4)',
              boxShadow: `0 0 ${point.size * 0.3}px rgba(255, 200, 100, 0.6)`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
