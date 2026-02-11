/**
 * Skeleton Component
 *
 * Loading placeholder that respects prefers-reduced-motion.
 * Use for async content to improve perceived performance.
 */

'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SkeletonProps {
  /** Width - can be number (px) or string (e.g., '100%') */
  width?: number | string;
  /** Height - can be number (px) or string */
  height?: number | string;
  /** Border radius - 'none' | 'sm' | 'md' | 'lg' | 'full' | number */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full' | number;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const radiusMap = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

export function Skeleton({
  width = '100%',
  height = 16,
  radius = 'md',
  className,
  style,
}: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();

  const borderRadius = typeof radius === 'number' ? radius : radiusMap[radius];

  return (
    <div
      className={className}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.08)',
        backgroundImage: prefersReducedMotion
          ? undefined
          : 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 100%)',
        backgroundSize: '200% 100%',
        animation: prefersReducedMotion ? 'none' : 'skeleton-shimmer 1.5s infinite',
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonText - Multiple lines of skeleton text
 */
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  lineHeight = 14,
  gap = 8,
  lastLineWidth = '70%',
}: SkeletonTextProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={lineHeight}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          radius="sm"
        />
      ))}
    </div>
  );
}

/**
 * SkeletonAvatar - Circular skeleton for profile pictures
 */
interface SkeletonAvatarProps {
  size?: number;
}

export function SkeletonAvatar({ size = 48 }: SkeletonAvatarProps) {
  return <Skeleton width={size} height={size} radius="full" />;
}

/**
 * SkeletonCard - Card-shaped skeleton for profile cards
 */
interface SkeletonCardProps {
  aspectRatio?: string;
}

export function SkeletonCard({ aspectRatio = '1' }: SkeletonCardProps) {
  return (
    <Skeleton
      width="100%"
      height="auto"
      radius="lg"
      style={{ aspectRatio }}
    />
  );
}

/**
 * SkeletonProfileCard - Profile grid card skeleton
 */
export function SkeletonProfileCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <SkeletonCard aspectRatio="1" />
      <div style={{ padding: '0 4px' }}>
        <Skeleton width="60%" height={14} radius="sm" />
        <div style={{ height: 4 }} />
        <Skeleton width="40%" height={12} radius="sm" />
      </div>
    </div>
  );
}

/**
 * SkeletonProfileGrid - Grid of profile card skeletons
 */
interface SkeletonProfileGridProps {
  count?: number;
  columns?: number;
}

export function SkeletonProfileGrid({ count = 9, columns = 3 }: SkeletonProfileGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
        padding: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProfileCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonMessageRow - Message list item skeleton
 */
export function SkeletonMessageRow() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
      }}
    >
      <SkeletonAvatar size={52} />
      <div style={{ flex: 1 }}>
        <Skeleton width="40%" height={16} radius="sm" />
        <div style={{ height: 6 }} />
        <Skeleton width="70%" height={14} radius="sm" />
      </div>
      <Skeleton width={40} height={12} radius="sm" />
    </div>
  );
}

/**
 * SkeletonMessageList - List of message row skeletons
 */
interface SkeletonMessageListProps {
  count?: number;
}

export function SkeletonMessageList({ count = 8 }: SkeletonMessageListProps) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMessageRow key={i} />
      ))}
    </div>
  );
}
