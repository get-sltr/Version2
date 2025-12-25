// =============================================================================
// MapHeader - Back button, search bar, settings button
// =============================================================================

import type { MapHeaderProps } from '@/types/map';
import { useTheme } from '@/contexts/ThemeContext';
import { IconGrid } from '@/components/Icons';
import styles from './Map.module.css';

export function MapHeader({ userImage }: MapHeaderProps) {
  const { colors } = useTheme();

  return (
    <div className={styles.headerRow}>
      {/* Back to Grid button */}
      <a
        href="/dashboard"
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: '#1c1c1e',
          border: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: '#fff',
          flexShrink: 0,
        }}
        aria-label="Back to grid"
      >
        <IconGrid size={20} />
      </a>

      <a href="/search" className={styles.searchBar}>
        <span className={styles.searchIcon}>🔍</span>
        <span style={{ color: colors.textSecondary }}>Search</span>
      </a>

      <a
        href="/profile/edit"
        className={styles.profileAvatar}
        style={{
          backgroundImage: userImage ? `url(${userImage})` : 'url(/images/5.jpg)',
        }}
        aria-label="Edit your profile"
      />
    </div>
  );
}

