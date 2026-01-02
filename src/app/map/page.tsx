// =============================================================================
// Map Page - Main orchestration component
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocationPresence } from '@/hooks/useLocationPresence';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useMapProfiles } from '@/hooks/useMapProfiles';
import { useMapGroups } from '@/hooks/useMapGroups';
import { useMapVenues } from '@/hooks/useMapVenues';
import MapboxMap from '@/components/Mapbox/MapboxMap';
import {
  MapHeader,
  MapToggleTabs,
  PulseBanner,
  ProfileDrawer,
  GroupDrawer,
  MapControls,
} from '@/components/map/index';
import type { MapViewMode, MapProfile, MapGroup, Coordinates } from '@/types/map';
import styles from '@/components/map/Map.module.css';

export default function MapViewPage() {
  const { colors } = useTheme();

  // View state
  const [viewMode, setViewMode] = useState<MapViewMode>('users');
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [centerOn, setCenterOn] = useState<Coordinates | null>(null);

  // Drawer state
  const [selectedProfile, setSelectedProfile] = useState<MapProfile | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<MapGroup | null>(null);

  // Handle map center from different sources
  const handleCenterUpdate = useCallback((coords: Coordinates) => {
    setMapCenter(coords);
    setCenterOn(coords); // Also fly to this location
  }, []);

  // Track user location
  useLocationPresence({
    onFirstFix: handleCenterUpdate,
  });

  // Data hooks
  const { profile: currentUser } = useCurrentUserProfile({
    onLocationLoaded: handleCenterUpdate,
  });

  const { profiles, refetch: refetchProfiles } = useMapProfiles({
    mapCenter,
  });

  const { groups } = useMapGroups();

  const { venues } = useMapVenues({
    mapCenter,
    enabled: true,
    radius: 8000, // 8km radius
  });

  // Handlers
  const handleSelectProfile = useCallback((profile: MapProfile) => {
    setCenterOn({ lat: profile.lat, lng: profile.lng });
    setSelectedProfile(profile);
    setSelectedGroup(null);
  }, []);

  const handleSelectGroup = useCallback((group: MapGroup) => {
    setCenterOn({ lat: group.lat, lng: group.lng });
    setSelectedGroup(group);
    setSelectedProfile(null);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedProfile(null);
    setSelectedGroup(null);
  }, []);

  const handleRefresh = useCallback(() => {
    refetchProfiles();
  }, [refetchProfiles]);

  return (
    <div
      style={{
        height: '100vh',
        background: colors.background,
        color: colors.text,
        fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header style={{ background: colors.background, borderBottom: `1px solid ${colors.border}` }}>
        <MapHeader userImage={currentUser?.image ?? null} />
        <MapToggleTabs
          viewMode={viewMode}
          onChangeMode={setViewMode}
          userCount={profiles.length}
          groupCount={groups.length}
        />
        <PulseBanner />
      </header>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapboxMap
          profiles={profiles}
          groups={groups}
          venues={venues}
          viewMode={viewMode}
          mapCenter={mapCenter}
          currentUserProfile={currentUser}
          centerOn={centerOn}
          onSelectProfile={handleSelectProfile}
          onSelectGroup={handleSelectGroup}
          onEmptyClick={handleCloseDrawer}
        />

        {/* Profile Drawer */}
        {selectedProfile && (
          <ProfileDrawer
            profile={selectedProfile}
            onClose={handleCloseDrawer}
            accentColor={colors.accent}
          />
        )}

        {/* Group Drawer */}
        {selectedGroup && (
          <GroupDrawer
            group={selectedGroup}
            onClose={handleCloseDrawer}
            accentColor={colors.accent}
          />
        )}
      </div>

      {/* Cruising FAB */}
      <a href="/cruising" className={styles.cruisingFab}>
        💬
      </a>

      {/* Controls */}
      <MapControls viewMode={viewMode} onRefresh={handleRefresh} />
    </div>
  );
}
