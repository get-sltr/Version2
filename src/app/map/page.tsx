// =============================================================================
// Map Page - Main orchestration component with glass UI
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
import { BottomNav } from '@/components/BottomNav';
import {
  MapHeader,
  MapToggleTabs,
  PulseBanner,
  ProfileDrawer,
  GroupDrawer,
  MapFilterDrawer,
  type MapFilters,
} from '@/components/map/index';
import type { MapViewMode, MapProfile, MapGroup, Coordinates } from '@/types/map';

export default function MapViewPage() {
  const { colors } = useTheme();

  // View state
  const [viewMode, setViewMode] = useState<MapViewMode>('users');
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [centerOn, setCenterOn] = useState<Coordinates | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Drawer state
  const [selectedProfile, setSelectedProfile] = useState<MapProfile | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<MapGroup | null>(null);

  // Handle map center from different sources
  const handleCenterUpdate = useCallback((coords: Coordinates) => {
    setMapCenter(coords);
    setCenterOn(coords);
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
    radius: 8000,
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

  const handleOpenFilters = useCallback(() => {
    setFiltersOpen(true);
  }, []);

  const handleApplyFilters = useCallback((filters: MapFilters) => {
    // TODO: Apply filters to profile query
    console.log('Applying filters:', filters);
    setFiltersOpen(false);
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        background: '#0a0a0f',
        color: colors.text,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '70px', // Space for bottom nav
      }}
    >
      {/* Header Section - Glass style */}
      <header style={{
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 50,
      }}>
        <MapHeader
          userImage={currentUser?.image ?? null}
          onRefresh={handleRefresh}
          onOpenFilters={handleOpenFilters}
        />
        <MapToggleTabs
          viewMode={viewMode}
          onChangeMode={setViewMode}
          userCount={profiles.length}
          groupCount={groups.length}
          profiles={profiles}
          groups={groups}
          currentUserLat={mapCenter?.lat}
          currentUserLng={mapCenter?.lng}
          onSelectProfile={handleSelectProfile}
          onSelectGroup={handleSelectGroup}
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

      {/* Filter Drawer */}
      <MapFilterDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onApply={handleApplyFilters}
      />

      {/* Bottom Navigation - Connection to other features */}
      <BottomNav />

      {/* Orbitron Font */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
      `}</style>
    </div>
  );
}
