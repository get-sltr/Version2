// =============================================================================
// MapToggleTabs - Switch between Users and Groups view
// =============================================================================

import type { MapToggleTabsProps } from '@/types/map';
import styles from './Map.module.css';

export function MapToggleTabs({
  viewMode,
  onChangeMode,
  userCount,
  groupCount,
}: MapToggleTabsProps) {
  const isUsersActive = viewMode === 'users';
  const isGroupsActive = viewMode === 'groups';

  return (
    <div className={styles.toggleTabs}>
      <button
        onClick={() => onChangeMode('users')}
        className={styles.toggleTab}
        style={{
          background: '#0a0a0a',
          color: isUsersActive ? '#ff6b35' : '#888',
          border: isUsersActive ? '1px solid #ff6b35' : '1px solid #333',
          boxShadow: isUsersActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
        }}
      >
        <span style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: isUsersActive ? '#ff6b35' : '#333',
          boxShadow: isUsersActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
        }} />
        👤 Users ({userCount})
      </button>

      <button
        onClick={() => onChangeMode('groups')}
        className={styles.toggleTab}
        style={{
          background: '#0a0a0a',
          color: isGroupsActive ? '#ff6b35' : '#888',
          border: isGroupsActive ? '1px solid #ff6b35' : '1px solid #333',
          boxShadow: isGroupsActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
        }}
      >
        <span style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          background: isGroupsActive ? '#ff6b35' : '#333',
          boxShadow: isGroupsActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
        }} />
        👥 Groups ({groupCount})
      </button>
    </div>
  );
}

