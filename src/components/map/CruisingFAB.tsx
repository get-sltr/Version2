// =============================================================================
// CruisingFAB - Floating button on map
// =============================================================================

'use client';

import type { CruisingFABProps } from '@/types/map';
import styles from './Map.module.css';

const StarIcon = () => (
  <svg
    className={styles.cruisingFabIcon}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function CruisingFAB({ onClick }: CruisingFABProps) {
  return (
    <button className={styles.cruisingFab} onClick={onClick}>
      <StarIcon />
      <span className={styles.cruisingFabText}>Cruising</span>
    </button>
  );
}
