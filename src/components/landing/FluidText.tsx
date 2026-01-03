'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface FluidTextProps {
  children: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  style?: React.CSSProperties;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: delay,
    },
  }),
};

const letterVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -90,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
    },
  },
};

export function FluidText({
  children,
  delay = 0,
  as = 'span',
  style,
}: FluidTextProps) {
  const Component = motion[as];
  const letters = children.split('');

  return (
    <Component
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        perspective: 1000,
        ...style,
      }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          variants={letterVariants}
          style={{
            display: 'inline-block',
            transformOrigin: 'bottom',
            whiteSpace: letter === ' ' ? 'pre' : 'normal',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </Component>
  );
}

// Simpler word-by-word reveal
interface FluidWordsProps {
  children: string;
  delay?: number;
  style?: React.CSSProperties;
}

const wordContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: delay,
    },
  }),
};

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

export function FluidWords({ children, delay = 0, style }: FluidWordsProps) {
  const words = children.split(' ');

  return (
    <motion.span
      variants={wordContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      custom={delay}
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        gap: '0.3em',
        ...style,
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariants}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
