// =============================================================================
// Map Page - Liquid Glass Design System
// =============================================================================

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocationPresence } from '@/hooks/useLocationPresence';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useMapProfiles } from '@/hooks/useMapProfiles';
import { useMapGroups } from '@/hooks/useMapGroups';
import { useMapVenues } from '@/hooks/useMapVenues';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { postCruisingUpdate } from '@/lib/api/cruisingUpdates';
import MigrationBanner from '@/components/MigrationBanner';
import MapboxMap from '@/components/Mapbox/MapboxMap';
import { BottomNavWithBadges } from '@/components/BottomNavWithBadges';
import {
  MapHeader,
  CruisingFAB,
  CruisingPanel,
  MenuPanel,
  ProfileDrawer,
  GroupDrawer,
} from '@/components/map';
import { GoLiveButton } from '@/components/map/GoLiveButton';
import type { MapViewMode, MapProfile, MapGroup, Coordinates } from '@/types/map';

export default function MapViewPage() {
  // View state
  const [viewMode, setViewMode] = useState<MapViewMode>('users');
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [centerOn, setCenterOn] = useState<Coordinates | null>(null);
  const [clusterEnabled, setClusterEnabled] = useState(true);

  // Panel states
  const [menuOpen, setMenuOpen] = useState(false);
  const [cruisingOpen, setCruisingOpen] = useState(false);

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

  const { blockedIds, isReady: blockedReady } = useBlockedUsers();

  const { profiles, refetch: refetchProfiles } = useMapProfiles({
    mapCenter,
    blockedIds,
    enabled: blockedReady,
  });

  const { groups } = useMapGroups();

  const { venues } = useMapVenues({
    mapCenter,
    enabled: true,
    radius: 8000,
  });

  // Auto-dismiss empty state hint after 5 seconds
  const [showEmptyHint, setShowEmptyHint] = useState(true);
  useEffect(() => {
    if (profiles.length > 0) {
      setShowEmptyHint(false);
      return;
    }
    const timer = setTimeout(() => setShowEmptyHint(false), 5000);
    return () => clearTimeout(timer);
  }, [profiles.length]);

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

  const handleFiltersOpen = useCallback(() => {
    // TODO: Open filters panel
    console.log('Open filters');
  }, []);

  const handleCruisingPost = useCallback(async (text: string) => {
    // Intentionally let errors bubble so CruisingPanel's try/catch handles
    // success/error states and only closes on successful updates.
    await postCruisingUpdate(text, false, mapCenter?.lat, mapCenter?.lng);
  }, [mapCenter]);

  return (
    <div className="mapPageContainer">
      {/* Migration Banner for old domain users */}
      <MigrationBanner />

      {/* Header */}
      <MapHeader onMenuOpen={() => setMenuOpen(true)} />

      {/* Map */}
      <div className="mapContainer">
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

        {/* Empty state hint when no users are live — auto-dismisses after 5s */}
        {profiles.length === 0 && showEmptyHint && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(10, 22, 40, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '20px 24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            maxWidth: '280px',
            pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📍</div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
              No one is live nearby right now. Tap <strong style={{ color: '#FF6B35' }}>Go Live</strong> to appear on the map.
            </p>
          </div>
        )}

        {/* Cruising FAB */}
        <CruisingFAB onClick={() => setCruisingOpen(true)} />

        {/* Go Live Button - manual map check-in */}
        <GoLiveButton userId={currentUser?.id ?? null} />
      </div>

      {/* Profile Drawer */}
      {selectedProfile && (
        <ProfileDrawer
          profile={selectedProfile}
          onClose={handleCloseDrawer}
          isOpen={!!selectedProfile}
        />
      )}

      {/* Group Drawer */}
      {selectedGroup && (
        <GroupDrawer
          group={selectedGroup}
          onClose={handleCloseDrawer}
          isOpen={!!selectedGroup}
        />
      )}

      {/* Menu Panel */}
      <MenuPanel
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRefresh={handleRefresh}
        onFiltersOpen={handleFiltersOpen}
        clusterEnabled={clusterEnabled}
        onClusterToggle={() => setClusterEnabled(!clusterEnabled)}
      />

      {/* Cruising Panel */}
      <CruisingPanel
        isOpen={cruisingOpen}
        onClose={() => setCruisingOpen(false)}
        onPost={handleCruisingPost}
      />

      {/* Bottom Navigation */}
      <BottomNavWithBadges />

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

        .mapPageContainer {
          height: 100vh;
          height: 100dvh;
          background: #0a0a0f;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .mapContainer {
          flex: 1;
          position: relative;
          min-height: 0;
        }
      `}</style>
    </div>
  );
}
