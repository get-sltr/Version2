// =============================================================================
// Map Page - Liquid Glass Design System
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocationPresence } from '@/hooks/useLocationPresence';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { useMapProfiles } from '@/hooks/useMapProfiles';
import { useMapGroups } from '@/hooks/useMapGroups';
import { useMapVenues } from '@/hooks/useMapVenues';
import { postCruisingUpdate } from '@/lib/api/cruisingUpdates';
import MapboxMap from '@/components/Mapbox/MapboxMap';
import {
  MapHeader,
  BottomNav,
  CruisingFAB,
  CruisingPanel,
  MenuPanel,
  ProfileDrawer,
  GroupDrawer,
} from '@/components/map';
import type { MapViewMode, MapProfile, MapGroup, Coordinates, NavTab } from '@/types/map';

export default function MapViewPage() {
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<MapViewMode>('users');
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [centerOn, setCenterOn] = useState<Coordinates | null>(null);
  const [clusterEnabled, setClusterEnabled] = useState(true);

  // Panel states
  const [menuOpen, setMenuOpen] = useState(false);
  const [cruisingOpen, setCruisingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>('explore');

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

  const handleFiltersOpen = useCallback(() => {
    // TODO: Open filters panel
    console.log('Open filters');
  }, []);

  const handleCruisingPost = useCallback(async (text: string) => {
    // Intentionally let errors bubble so CruisingPanel's try/catch handles
    // success/error states and only closes on successful updates.
    await postCruisingUpdate(text, false, mapCenter?.lat, mapCenter?.lng);
  }, [mapCenter]);

  const handleTabChange = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'explore':
        // Already on map
        break;
      case 'taps':
        router.push('/taps');
        break;
      case 'sltr':
        router.push('/premium');
        break;
      case 'messages':
        router.push('/messages');
        break;
      case 'views':
        router.push('/views');
        break;
    }
  }, [router]);

  return (
    <div className="mapPageContainer">
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

        {/* Cruising FAB */}
        <CruisingFAB onClick={() => setCruisingOpen(true)} />
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
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        messageCount={3}
        viewCount={12}
        tapCount={5}
      />

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
