// =============================================================================
// MapHeader - Profile avatar, search bar, settings button
// =============================================================================

import type { MapHeaderProps } from '@/types/map';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Map.module.css';

export function MapHeader({ userImage }: MapHeaderProps) {
  const { colors } = useTheme();

  return (
    <div className={styles.headerRow}>
      <a
        href="/profile/edit"
        className={styles.profileAvatar}
        style={{
          backgroundImage: userImage ? `url(${userImage})` : 'url(/images/5.jpg)',
        }}
        aria-label="Edit your profile"
      />

      <a href="/search" className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <span style={{ color: colors.textSecondary }}>Search</span>
      </a>

      <a href="/settings" className={styles.settingsButton}>
        ☰
      </a>
    </div>
  );
}

