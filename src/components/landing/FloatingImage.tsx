'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

interface FloatingImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  depth?: number; // Controls parallax intensity
  rotation?: number; // Initial rotation
  delay?: number;
  className?: string;
}

export function FloatingImage({
  src,
  alt,
  width,
  height,
  depth = 1,
  rotation = 0,
  delay = 0,
}: FloatingImageProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Parallax effect based on scroll
  const y = useTransform(scrollYProgress, [0, 1], [100 * depth, -100 * depth]);
  const springY = useSpring(y, { stiffness: 100, damping: 30 });

  // Subtle rotation on scroll
  const rotateZ = useTransform(scrollYProgress, [0, 1], [rotation - 5, rotation + 5]);
  const springRotate = useSpring(rotateZ, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay,
      }}
      style={{
        y: springY,
        rotateZ: springRotate,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      <motion.div
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: -5,
          z: 50,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Image container with depth shadow */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6), 0 10px 30px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
            }}
          />

          {/* Subtle vignette overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Floating depth shadow */}
        <motion.div
          style={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            right: '5%',
            bottom: '-20%',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            borderRadius: '50%',
            filter: 'blur(40px)',
            zIndex: -1,
            transformOrigin: 'center',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
