'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface LiquidButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'default' | 'large';
}

export function LiquidButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'default',
}: LiquidButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ['-3px', '3px']);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ['-3px', '3px']);

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

  const styles = {
    primary: {
      backgroundColor: '#FF6B35',
      color: '#000000',
      border: '1px solid #FF6B35',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#FFFFFF',
      border: 'none',
    },
  };

  const sizes = {
    default: {
      padding: '14px 32px',
      fontSize: '13px',
    },
    large: {
      padding: '18px 48px',
      fontSize: '14px',
    },
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref as any}
      href={href}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...styles[variant],
        ...sizes[size],
        x: translateX,
        y: translateY,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textDecoration: 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{
        scale: 1.02,
        boxShadow: variant === 'primary'
          ? '0 0 40px rgba(255, 107, 53, 0.4)'
          : '0 0 30px rgba(255, 255, 255, 0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {/* Liquid fill effect on hover */}
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: variant === 'primary' ? '#FF8555' : 'rgba(255, 255, 255, 0.05)',
          transformOrigin: 'bottom',
          scaleY: 0,
        }}
        whileHover={{ scaleY: 1 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </Component>
  );
}
