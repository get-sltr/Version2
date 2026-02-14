'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface SpatialCardProps {
  children: ReactNode;
  depth?: number;
  delay?: number;
}

export function SpatialCard({ children, depth = 15, delay = 0 }: SpatialCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${depth}deg`, `-${depth}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${depth}deg`, `${depth}deg`]);

  // Lighting effect based on mouse position
  const lightX = useTransform(mouseXSpring, [-0.5, 0.5], ['30%', '70%']);
  const lightY = useTransform(mouseYSpring, [-0.5, 0.5], ['30%', '70%']);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay,
      }}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          position: 'relative',
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '20px',
          padding: '32px',
          cursor: 'default',
        }}
        whileHover={{
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 107, 53, 0.3)',
        }}
      >
        {/* Dynamic light reflection */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            background: 'radial-gradient(circle at var(--light-x) var(--light-y), rgba(255, 107, 53, 0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
            // @ts-ignore - CSS custom properties
            '--light-x': lightX,
            '--light-y': lightY,
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

        {/* Depth shadow layer */}
        <motion.div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '16px',
            backgroundColor: 'transparent',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            zIndex: -1,
            transform: 'translateZ(-30px)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
