// =============================================================================
// GroupDrawer - Slide-out panel showing group event details
// =============================================================================

import { useTheme } from '@/contexts/ThemeContext';
import type { GroupDrawerProps } from '@/types/map';
import styles from './Map.module.css';

export function GroupDrawer({ group, onClose }: GroupDrawerProps) {
  const { colors } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close group drawer"
        onClick={onClose}
        className={styles.drawerBackdrop}
      />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Close Button */}
        <button onClick={onClose} className={styles.drawerClose}>
          ×
        </button>

        {/* Group Header */}
        <div className={styles.groupHeader} style={{ borderColor: colors.border }}>
          <div className={styles.groupIcon}>👥</div>

          <h2 className={styles.groupTitle} style={{ color: colors.text }}>
            {group.name}
          </h2>

          <div className={styles.groupSubtitle} style={{ color: colors.textSecondary }}>
            {group.type} • Hosted by {group.host}
          </div>

          {/* Attendee Count */}
          <div className={styles.attendeeCount} style={{ borderColor: colors.accent }}>
            <div className={styles.attendeeNumber} style={{ color: colors.accent }}>
              {group.attendees}/{group.maxAttendees}
            </div>
            <div style={{ color: colors.textSecondary }}>People Attending</div>
          </div>
        </div>

        {/* Group Details */}
        <div className={styles.drawerContent}>
          {/* Time & Location */}
          <div className={styles.infoCards}>
            <InfoCard icon="🕐" label="When" value={group.time} colors={colors} />
            <InfoCard icon="📍" label="Where" value={group.location} colors={colors} />
          </div>

          {/* Description */}
          <section className={styles.drawerSection}>
            <h3 style={{ color: colors.text }}>About</h3>
            <p style={{ color: colors.textSecondary }}>{group.description}</p>
          </section>

          {/* Host Info */}
          <section className={styles.drawerSection}>
            <h3 style={{ color: colors.text }}>Host</h3>
            <a href={`/profile/${group.id}`} className={styles.hostCard}>
              <div
                className={styles.hostAvatar}
                style={{ backgroundImage: `url(${group.hostImage})` }}
              />
              <div>
                <div style={{ color: colors.text }}>{group.host}</div>
                <div style={{ color: colors.textSecondary }}>View Profile →</div>
              </div>
            </a>
          </section>

          {/* Attendees Preview */}
          <section className={styles.drawerSection}>
            <h3 style={{ color: colors.text }}>Attending ({group.attendees})</h3>
            <div className={styles.attendeesRow}>
              {[1, 2, 3, 4, 5].slice(0, Math.min(5, group.attendees)).map((i) => (
                <div
                  key={i}
                  className={styles.attendeeAvatar}
                  style={{ backgroundImage: `url(/images/${(i % 4) + 5}.jpg)` }}
                />
              ))}
              {group.attendees > 5 && (
                <div className={styles.attendeeMore} style={{ color: colors.text }}>
                  +{group.attendees - 5}
                </div>
              )}
            </div>
          </section>

          {/* Action Buttons */}
          <div className={styles.drawerActions}>
            <a
              href={`/groups/${group.id}`}
              className={styles.primaryButton}
              style={{ background: colors.accent }}
            >
              Join Group
            </a>
            <button className={styles.secondaryButton}>⋮</button>
          </div>
        </div>
      </div>
    </>
  );
}

// Internal info card component
interface InfoCardProps {
  icon: string;
  label: string;
  value: string;
  colors: any;
}

function InfoCard({ icon, label, value, colors }: InfoCardProps) {
  return (
    <div className={styles.infoCard}>
      <div className={styles.infoCardIcon}>{icon}</div>
      <div>
        <div style={{ color: colors.textSecondary }}>{label}</div>
        <div style={{ color: colors.text }}>{value}</div>
      </div>
    </div>
  );
}
