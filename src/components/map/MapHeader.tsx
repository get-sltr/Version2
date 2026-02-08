// =============================================================================
// MapHeader - Single line: Grid | Search | Pulse | Menu
// =============================================================================

'use client';

import Link from 'next/link';
import type { MapHeaderProps } from '@/types/map';
import styles from './Map.module.css';

// Icons
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const PulseWaveform = () => (
  <svg width="24" height="14" viewBox="0 0 48 24" style={{ position: 'relative', zIndex: 1 }}>
    <defs>
      <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#FF6B35" stopOpacity="1" />
        <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path
      d="M0 12 L10 12 L14 12 L18 5 L24 19 L30 12 L36 12 L40 8 L44 16 L48 12"
      stroke="url(#pulseGrad)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle r="2" fill="#FF6B35">
      <animateMotion
        dur="3s"
        repeatCount="indefinite"
        path="M0 12 L10 12 L14 12 L18 5 L24 19 L30 12 L36 12 L40 8 L44 16 L48 12"
      />
    </circle>
  </svg>
);

export function MapHeader({ onMenuOpen }: MapHeaderProps) {
  return (
    <header className={styles.header}>
      {/* Grid Button */}
      <Link href="/dashboard" className={`${styles.glassBtn} ${styles.glassBtnIcon}`} title="Dashboard">
        <GridIcon />
      </Link>

      {/* Search */}
      <Link href="/search" className={`${styles.glassBtn} ${styles.headerSearch}`}>
        <SearchIcon />
        <span>Search</span>
      </Link>

      {/* Pulse */}
      <Link href="/pulse" className={`${styles.glassBtn} ${styles.headerPulse}`}>
        <div className={styles.pulseIcon}>
          <div className={styles.pulseIconGlow} />
          <PulseWaveform />
        </div>
        <div className={styles.pulseText}>
          <span className={styles.pulseTitle}>THE PULSE</span>
          <span className={styles.pulseTagline}>LIVE NOW</span>
        </div>
        <div className={styles.liveDot} />
      </Link>

      {/* Menu */}
      <button
        className={`${styles.glassBtn} ${styles.glassBtnIcon}`}
        onClick={onMenuOpen}
        title="Menu"
      >
        <MenuIcon />
      </button>
    </header>
  );
}
