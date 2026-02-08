'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

interface CapsuleButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'large';
}

export function CapsuleButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'default',
}: CapsuleButtonProps) {
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

  const isPrimary = variant === 'primary';
  const isLarge = size === 'large';

  const buttonContent = (
    <motion.span
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        x: translateX,
        y: translateY,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isLarge ? '18px 48px' : '14px 32px',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: isLarge ? '15px' : '14px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '50px',
        color: isPrimary ? '#000000' : '#FFFFFF',
        backgroundColor: isPrimary ? '#FF6B35' : 'transparent',
        border: isPrimary ? 'none' : '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: isPrimary
          ? '0 0 30px rgba(255, 107, 53, 0.5), 0 0 60px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 0 20px rgba(255, 255, 255, 0.1)',
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: isPrimary
          ? '0 0 40px rgba(255, 107, 53, 0.7), 0 0 80px rgba(255, 107, 53, 0.4), 0 0 120px rgba(255, 107, 53, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          : '0 0 30px rgba(255, 255, 255, 0.2), 0 0 60px rgba(255, 255, 255, 0.1)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {/* Liquid shimmer effect */}
      <motion.span
        style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: isPrimary
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          pointerEvents: 'none',
        }}
        animate={{
          left: ['−100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />

      {/* White glow pulse for primary */}
      {isPrimary && (
        <motion.span
          style={{
            position: 'absolute',
            inset: '-2px',
            borderRadius: '50px',
            background: 'transparent',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)',
            pointerEvents: 'none',
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
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
