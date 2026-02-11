/**
 * useReducedMotion Hook
 *
 * Detects user's prefers-reduced-motion preference for accessibility.
 * Use this to disable or simplify animations for users who prefer reduced motion.
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * // With framer-motion
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { scale: 1.1 }}
 *   transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring' }}
 * />
 */

import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getInitialState(): boolean {
  // SSR safety - default to false on server
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialState);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy Safari
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation props that respect reduced motion preference
 * Returns empty/instant animations when user prefers reduced motion
 */
export function getMotionProps(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: {},
      exit: {},
      transition: { duration: 0 },
    };
  }
  return {};
}

/**
 * Get transition that respects reduced motion preference
 */
export function getTransition(
  prefersReducedMotion: boolean,
  normalTransition: object = { type: 'spring', damping: 25, stiffness: 300 }
) {
  return prefersReducedMotion ? { duration: 0 } : normalTransition;
}
