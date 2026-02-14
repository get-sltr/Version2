'use client';

import { motion } from 'framer-motion';

interface RevealTextProps {
  text: string;
  isRevealed: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function RevealText({ text, isRevealed, delay = 0, style }: RevealTextProps) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
      animate={isRevealed ? {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      } : {
        opacity: 0,
        y: 20,
        filter: 'blur(10px)',
      }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={style}
    >
      {text}
    </motion.span>
  );
}

interface RevealContainerProps {
  children: React.ReactNode;
  isRevealed: boolean;
  delay?: number;
  style?: React.CSSProperties;
}

export function RevealContainer({ children, isRevealed, delay = 0, style }: RevealContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isRevealed ? {
        opacity: 1,
        y: 0,
      } : {
        opacity: 0,
        y: 30,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
