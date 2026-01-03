'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

interface BracketButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function BracketButton({
  children,
  href,
  onClick,
  variant = 'primary',
  disabled = false,
}: BracketButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);

  // Magnetic effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ['-4px', '4px']);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ['-4px', '4px']);

  // Liquid fill progress
  const fillProgress = useMotionValue(0);
  const fillSpring = useSpring(fillProgress, { stiffness: 200, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width);
    y.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseEnter = () => {
    if (!disabled) fillProgress.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    fillProgress.set(0);
  };

  const isPrimary = variant === 'primary';

  const buttonContent = (
    <motion.span
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      style={{
        x: translateX,
        y: translateY,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '16px 32px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        color: isPrimary ? '#000000' : '#FFFFFF',
        backgroundColor: 'transparent',
        border: 'none',
        opacity: disabled ? 0.5 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {/* Left bracket */}
      <motion.span
        style={{
          fontSize: '20px',
          fontWeight: 300,
          color: '#FF6B35',
          marginRight: '4px',
        }}
        animate={{
          x: [-2, 0, -2],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        [
      </motion.span>

      {/* Liquid fill background */}
      <motion.span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isPrimary ? '#FF6B35' : 'rgba(255, 107, 53, 0.2)',
          transformOrigin: 'bottom',
          scaleY: fillSpring,
          zIndex: 0,
        }}
        initial={{ height: '100%', scaleY: 0 }}
      />

      {/* Liquid wave effect */}
      <motion.span
        style={{
          position: 'absolute',
          top: 0,
          left: '-10%',
          width: '120%',
          height: '10px',
          backgroundColor: isPrimary ? '#FF8555' : 'rgba(255, 107, 53, 0.3)',
          borderRadius: '50%',
          transformOrigin: 'center',
          opacity: 0,
        }}
        animate={{
          y: [0, -2, 0],
          scaleX: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Text content */}
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>

      {/* Right bracket */}
      <motion.span
        style={{
          fontSize: '20px',
          fontWeight: 300,
          color: '#FF6B35',
          marginLeft: '4px',
        }}
        animate={{
          x: [2, 0, 2],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ]
      </motion.span>

      {/* Glow effect on hover */}
      <motion.span
        style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '4px',
          border: '1px solid transparent',
          pointerEvents: 'none',
        }}
        whileHover={{
          borderColor: 'rgba(255, 107, 53, 0.5)',
          boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
        }}
      />
    </motion.span>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
