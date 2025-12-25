// =============================================================================
// ProfileDrawer - Bottom sheet showing profile preview (same info as grid)
// =============================================================================

import { useTheme } from '@/contexts/ThemeContext';
import { feetToMiles } from '@/lib/geo';
import type { ProfileDrawerProps } from '@/types/map';
import styles from './Map.module.css';

export function ProfileDrawer({ profile, onClose, accentColor }: ProfileDrawerProps) {
  const { colors } = useTheme();
  const accent = accentColor || colors.accent || '#FF6B35';

  const distanceText =
    profile.distance !== null
      ? `${feetToMiles(profile.distance).toFixed(1)} mi away`
      : 'Nearby';

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close profile drawer"
        onClick={onClose}
        className={styles.drawerBackdrop}
      />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.drawerClose}>
          ✕
        </button>

        {/* Profile Image */}
        <div
          className={styles.drawerImage}
          style={{ backgroundImage: `url(${profile.image || '/images/5.jpg'})` }}
        >
          {/* Gradient Overlay */}
          <div className={styles.drawerImageGradient} />

          {/* Name & Status - same info as grid */}
          <div className={styles.drawerImageInfo}>
            <h2 className={styles.drawerName} style={{ color: '#fff' }}>
              {profile.name}
              {profile.age ? `, ${profile.age}` : ''}
            </h2>

            <div className={styles.drawerStatus}>
              <div className={styles.onlineDot} style={{ background: accent }} />
              <span style={{ color: accent }}>Online</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>•</span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{distanceText}</span>
            </div>

            {profile.position && (
              <div
                className={styles.positionBadge}
                style={{ borderColor: accent, color: accent }}
              >
                {profile.position}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.drawerContent}>
          <div className={styles.drawerActions}>
            <a
              href={`/messages/${profile.id}`}
              className={styles.primaryButton}
              style={{ background: accent }}
            >
              💬 Message
            </a>
            <a href={`/profile/${profile.id}`} className={styles.secondaryButton}>
              👁️ View Profile
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
