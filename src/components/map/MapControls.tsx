// =============================================================================
// MapControls - Bottom control bar with refresh and filter drawer
// =============================================================================

'use client';

import { useState } from 'react';
import type { MapControlsProps } from '@/types/map';
import { IconRefresh, IconFilter, IconPlus } from '@/components/Icons';
import { MapFilterDrawer, type MapFilters } from './MapFilterDrawer';
import styles from './Map.module.css';

interface ExtendedMapControlsProps extends MapControlsProps {
  onFiltersApply?: (filters: MapFilters) => void;
}

export function MapControls({ viewMode, onRefresh, onFiltersApply }: ExtendedMapControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleFiltersApply = (filters: MapFilters) => {
    onFiltersApply?.(filters);
    onRefresh(); // Refresh the map with new filters
  };

  return (
    <>
      <div className={styles.controlsBar}>
        <button onClick={onRefresh} className={styles.controlButton}>
          <IconRefresh size={18} /> Refresh
        </button>

        {viewMode === 'users' ? (
          <button
            onClick={() => setShowFilters(true)}
            className={styles.controlButton}
          >
            <IconFilter size={18} /> Filters
          </button>
        ) : (
          <a href="/groups/create" className={styles.controlButtonPrimary}>
            <IconPlus size={18} /> Host Group
          </a>
        )}
      </div>

      <MapFilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFiltersApply}
      />
    </>
  );
}
