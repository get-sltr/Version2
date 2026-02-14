// =============================================================================
// ProfileDrawer - True Liquid Glass profile preview
// =============================================================================

'use client';

import Link from 'next/link';
import { feetToMiles } from '@/lib/geo';
import type { ProfileDrawerProps } from '@/types/map';
import styles from './Map.module.css';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function ProfileDrawer({ profile, onClose, isOpen }: ProfileDrawerProps) {
  const distanceText =
    profile.distance !== null ? `${feetToMiles(profile.distance).toFixed(1)} mi` : 'Nearby';

  return (
    <div className={`${styles.profileDrawer} ${isOpen ? styles.open : ''}`}>
      <button
        className={styles.profileDrawerClose}
        onClick={onClose}
        aria-label="Close profile"
      >
        <CloseIcon />
      </button>

      <div className={styles.profileDrawerContent}>
        <div
          className={styles.profileDrawerAvatar}
          style={{ backgroundImage: `url(${profile.image || '/images/default-avatar.jpg'})` }}
        />

        <div className={styles.profileDrawerDetails}>
          <h2 className={styles.profileDrawerName}>
            {profile.name}
            {profile.age ? `, ${profile.age}` : ''}
          </h2>

          <div className={styles.profileDrawerStatus}>
            {profile.online && (
              <>
                <div className={styles.statusDot} />
                <span className={styles.onlineText}>Online</span>
                <span>•</span>
              </>
            )}
            <span>{distanceText}</span>
          </div>

          {profile.position && (
            <span className={styles.profileDrawerPosition}>{profile.position}</span>
          )}
        </div>
      </div>

      <div className={styles.profileDrawerActions}>
        <Link href={`/messages/${profile.id}`} className={styles.profileBtnSecondary}>
          💬
        </Link>
        <Link href={`/profile/${profile.id}`} className={styles.profileBtnPrimary}>
          View Profile
        </Link>
      </div>
    </div>
  );
}
