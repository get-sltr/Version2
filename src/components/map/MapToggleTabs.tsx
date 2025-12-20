// =============================================================================
// MapToggleTabs - Switch between Users and Groups view
// =============================================================================

import type { MapToggleTabsProps } from '@/types/map';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Map.module.css';

export function MapToggleTabs({
  viewMode,
  onChangeMode,
  userCount,
  groupCount,
}: MapToggleTabsProps) {
  const { colors } = useTheme();

  return (
    <div className={styles.toggleTabs}>
      <button
        onClick={() => onChangeMode('users')}
        className={styles.toggleTab}
        style={{
          background: viewMode === 'users' ? colors.accent : 'rgba(128, 128, 128, 0.15)',
          color: viewMode === 'users' ? '#fff' : colors.text,
        }}
      >
        👤 Users ({userCount})
      </button>

      <button
        onClick={() => onChangeMode('groups')}
        className={styles.toggleTab}
        style={{
          background: viewMode === 'groups' ? colors.accent : 'rgba(128, 128, 128, 0.15)',
          color: viewMode === 'groups' ? '#fff' : colors.text,
        }}
      >
        👥 Groups ({groupCount})
      </button>
    </div>
  );
}

