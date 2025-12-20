// =============================================================================
// MapControls - Bottom control bar with refresh and contextual actions
// =============================================================================

import type { MapControlsProps } from '@/types/map';
import { IconRefresh, IconFilter, IconPlus } from '@/components/Icons';
import styles from './Map.module.css';

export function MapControls({ viewMode, onRefresh }: MapControlsProps) {
  return (
    <div className={styles.controlsBar}>
      <button onClick={onRefresh} className={styles.controlButton}>
        <IconRefresh size={18} /> Refresh
      </button>

      {viewMode === 'users' ? (
        <a href="/settings/show-me" className={styles.controlButton}>
          <IconFilter size={18} /> Filters
        </a>
      ) : (
        <a href="/groups/create" className={styles.controlButtonPrimary}>
          <IconPlus size={18} /> Host Group
        </a>
      )}
    </div>
  );
}
