// =============================================================================
// GroupDrawer - True Liquid Glass group event details
// =============================================================================

'use client';

import Link from 'next/link';
import type { GroupDrawerProps } from '@/types/map';
import styles from './Map.module.css';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export function GroupDrawer({ group, onClose, isOpen }: GroupDrawerProps) {
  return (
    <div className={`${styles.groupDrawer} ${isOpen ? styles.open : ''}`}>
      <button className={styles.profileDrawerClose} onClick={onClose}>
        <CloseIcon />
      </button>

      {/* Group Header */}
      <div className={styles.groupHeader}>
        <div className={styles.groupIcon}>👥</div>
        <h2 className={styles.groupTitle}>{group.name}</h2>
        <div className={styles.groupSubtitle}>
          {group.type} • Hosted by {group.host}
        </div>
        <div className={styles.attendeeCount}>
          <div className={styles.attendeeNumber}>
            {group.attendees}/{group.maxAttendees}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>People Attending</div>
        </div>
      </div>

      {/* Time & Location */}
      <div className={styles.infoCards}>
        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>🕐</div>
          <div>
            <div className={styles.infoCardLabel}>When</div>
            <div className={styles.infoCardValue}>{group.time || 'TBD'}</div>
          </div>
        </div>
        <div className={styles.infoCard}>
          <div className={styles.infoCardIcon}>📍</div>
          <div>
            <div className={styles.infoCardLabel}>Where</div>
            <div className={styles.infoCardValue}>{group.location || 'TBD'}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <div className={styles.groupSection}>
          <h3>About</h3>
          <p>{group.description}</p>
        </div>
      )}

      {/* Host Info */}
      <div className={styles.groupSection}>
        <h3>Host</h3>
        <Link href={`/profile/${group.hostId}`} className={styles.hostCard}>
          <div
            className={styles.hostAvatar}
            style={{
              backgroundImage: `url(${group.hostImage || '/images/default-avatar.jpg'})`,
            }}
          />
          <div>
            <div className={styles.hostName}>{group.host}</div>
            <div className={styles.hostLink}>View Profile →</div>
          </div>
        </Link>
      </div>

      {/* Attendees Preview */}
      <div className={styles.groupSection}>
        <h3>Attending ({group.attendees})</h3>
        <div className={styles.attendeesRow}>
          {Array.from({ length: Math.min(5, group.attendees) }).map((_, i) => (
            <div
              key={i}
              className={styles.attendeeAvatar}
              style={{ backgroundImage: `url(/images/${(i % 4) + 5}.jpg)` }}
            />
          ))}
          {group.attendees > 5 && (
            <div className={styles.attendeeMore}>+{group.attendees - 5}</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.profileDrawerActions}>
        <Link href={`/groups/${group.id}`} className={styles.profileBtnPrimary}>
          Join Group
        </Link>
        <button className={styles.profileBtnSecondary}>⋮</button>
      </div>
    </div>
  );
}
