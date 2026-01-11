// =============================================================================
// Map Page - Main component with Liquid Glass design
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import type { MapProfile, MapGroup, NavTab } from '@/types/map';
import { MapHeader } from './MapHeader';
import { BottomNav } from './BottomNav';
import { CruisingFAB } from './CruisingFAB';
import { CruisingPanel } from './CruisingPanel';
import { MenuPanel } from './MenuPanel';
import { ProfileDrawer } from './ProfileDrawer';
import { GroupDrawer } from './GroupDrawer';
import styles from './Map.module.css';

interface MapPageProps {
  // Add your Mapbox or map component here
  children?: React.ReactNode;
}

export function MapPage({ children }: MapPageProps) {
  // UI State
  const [menuOpen, setMenuOpen] = useState(false);
  const [cruisingOpen, setCruisingOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [clusterEnabled, setClusterEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('explore');

  // Drawer State
  const [selectedProfile, setSelectedProfile] = useState<MapProfile | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<MapGroup | null>(null);

  // Badge counts (would come from real data)
  const [messageCount] = useState(3);
  const [viewCount] = useState(0);
  const [tapCount] = useState(1);

  // Handlers
  const handleMenuOpen = useCallback(() => setMenuOpen(true), []);
  const handleMenuClose = useCallback(() => setMenuOpen(false), []);

  const handleCruisingOpen = useCallback(() => setCruisingOpen(true), []);
  const handleCruisingClose = useCallback(() => setCruisingOpen(false), []);

  const handleFiltersOpen = useCallback(() => {
    setFiltersOpen(true);
    // Your filters modal logic here
  }, []);

  const handleRefresh = useCallback(() => {
    // Refresh map data
    console.log('Refreshing map...');
  }, []);

  const handleClusterToggle = useCallback(() => {
    setClusterEnabled((prev) => !prev);
  }, []);

  const handleCruisingPost = useCallback(async (text: string): Promise<void> => {
    try {
      // Post cruising update to API
      console.log('Posting cruising update:', text);
      // TODO: Implement actual API call when this component is used
    } catch (error) {
      console.error('Error posting cruising update:', error);
      // Throw a user-friendly error message so the caller can display it in the UI
      throw new Error('Failed to post cruising update. Please try again.');
    }
  }, []);

  const handleProfileSelect = useCallback((profile: MapProfile) => {
    setSelectedProfile(profile);
    setSelectedGroup(null);
  }, []);

  const handleGroupSelect = useCallback((group: MapGroup) => {
    setSelectedGroup(group);
    setSelectedProfile(null);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setSelectedProfile(null);
    setSelectedGroup(null);
  }, []);

  const handleTabChange = useCallback((tab: NavTab) => {
    setActiveTab(tab);
    // Handle navigation based on tab
    switch (tab) {
      case 'explore':
        // Stay on map or go to explore
        break;
      case 'taps':
        // Navigate to taps
        break;
      case 'sltr':
        // Open SLTR+ modal or navigate
        break;
      case 'messages':
        // Navigate to messages
        break;
      case 'views':
        // Navigate to views
        break;
    }
  }, []);

  const handleBackdropClick = useCallback(() => {
    setMenuOpen(false);
    setCruisingOpen(false);
    setSelectedProfile(null);
    setSelectedGroup(null);
  }, []);

  const isAnyOverlayOpen = menuOpen || cruisingOpen || selectedProfile || selectedGroup;

  return (
    <div className={styles.mapContainer}>
      {/* Header */}
      <MapHeader onMenuOpen={handleMenuOpen} />

      {/* Map Area */}
      <div className={styles.mapArea}>
        {/* Your Mapbox component goes here */}
        {children}

        {/* Cruising FAB */}
        <CruisingFAB onClick={handleCruisingOpen} />
      </div>

      {/* Bottom Nav */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        messageCount={messageCount}
        viewCount={viewCount}
        tapCount={tapCount}
      />

      {/* Overlay Backdrop */}
      <div
        className={`${styles.overlayBackdrop} ${isAnyOverlayOpen ? styles.open : ''}`}
        onClick={handleBackdropClick}
      />

      {/* Menu Panel */}
      <MenuPanel
        isOpen={menuOpen}
        onClose={handleMenuClose}
        onRefresh={handleRefresh}
        onFiltersOpen={handleFiltersOpen}
        clusterEnabled={clusterEnabled}
        onClusterToggle={handleClusterToggle}
      />

      {/* Cruising Panel */}
      <CruisingPanel
        isOpen={cruisingOpen}
        onClose={handleCruisingClose}
        onPost={handleCruisingPost}
      />

      {/* Profile Drawer */}
      {selectedProfile && (
        <ProfileDrawer
          profile={selectedProfile}
          onClose={handleDrawerClose}
          isOpen={!!selectedProfile}
        />
      )}

      {/* Group Drawer */}
      {selectedGroup && (
        <GroupDrawer
          group={selectedGroup}
          onClose={handleDrawerClose}
          isOpen={!!selectedGroup}
        />
      )}
    </div>
  );
}

// Export all components for individual use
export { MapHeader } from './MapHeader';
export { BottomNav } from './BottomNav';
export { CruisingFAB } from './CruisingFAB';
export { CruisingPanel } from './CruisingPanel';
export { MenuPanel } from './MenuPanel';
export { ProfileDrawer } from './ProfileDrawer';
export { GroupDrawer } from './GroupDrawer';
