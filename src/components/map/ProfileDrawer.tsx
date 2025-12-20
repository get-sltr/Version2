// =============================================================================
// ProfileDrawer - Slide-out panel showing full profile details
// =============================================================================

import { useTheme } from '@/contexts/ThemeContext';
import { formatDistance, feetToMiles } from '@/lib/geo';
import type { ProfileDrawerProps } from '@/types/map';
import styles from './Map.module.css';

export function ProfileDrawer({ profile, onClose }: ProfileDrawerProps) {
  const { colors } = useTheme();

  const distanceText =
    profile.distance !== null
      ? `${feetToMiles(profile.distance).toFixed(1)} mi away`
      : 'Distance unknown';

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

          {/* Name & Status */}
          <div className={styles.drawerImageInfo}>
            <h2 className={styles.drawerName} style={{ color: colors.text }}>
              {profile.name}
              {profile.age ? `, ${profile.age}` : ''}
            </h2>

            <div className={styles.drawerStatus}>
              <div className={styles.onlineDot} style={{ background: colors.accent }} />
              <span style={{ color: colors.accent }}>Online</span>
              <span style={{ color: colors.textSecondary }}>•</span>
              <span style={{ color: colors.textSecondary }}>{distanceText}</span>
            </div>

            {profile.position && (
              <div
                className={styles.positionBadge}
                style={{ borderColor: colors.accent, color: colors.accent }}
              >
                {profile.position}
              </div>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className={styles.drawerContent}>
          {/* Stats Grid */}
          <div className={styles.statsGrid}>
            <StatCard label="Height" value="5'10&quot;" colors={colors} />
            <StatCard label="Body Type" value="Toned" colors={colors} />
          </div>

          {/* About */}
          <section className={styles.drawerSection}>
            <h3 style={{ color: colors.text }}>About Me</h3>
            <p style={{ color: colors.textSecondary }}>
              What's up? Just looking to meet cool people and see where things go.
            </p>
          </section>

          {/* Tags */}
          <section className={styles.drawerSection}>
            <h3 style={{ color: colors.text }}>Interests</h3>
            <div className={styles.tagsContainer}>
              {['quickie', 'hung', 'kissing', 'cuddling'].map((tag) => (
                <span key={tag} className={styles.tag} style={{ color: colors.text }}>
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Action Buttons */}
          <div className={styles.drawerActions}>
            <a
              href={`/messages/${profile.id}`}
              className={styles.primaryButton}
              style={{ background: colors.accent }}
            >
              💬 Message
            </a>
            <a href={`/profile/${profile.id}`} className={styles.secondaryButton}>
              👁️
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

// Internal stat card component
interface StatCardProps {
  label: string;
  value: string;
  colors: any;
}

function StatCard({ label, value, colors }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div style={{ color: colors.textSecondary }}>{label}</div>
      <div style={{ color: colors.text }}>{value}</div>
    </div>
  );
}
