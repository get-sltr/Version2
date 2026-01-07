'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '../../contexts/ThemeContext';
import type { MapProfile, MapGroup, Coordinates } from '@/types/map';
import styles from '../map/Map.module.css';

// Dynamic imports to avoid SSR issues
const MapComponent = dynamic(
  () => import('react-map-gl/mapbox').then(mod => mod.Map),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-map-gl/mapbox').then(mod => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-map-gl/mapbox').then(mod => mod.Popup),
  { ssr: false }
);

const NavigationControl = dynamic(
  () => import('react-map-gl/mapbox').then(mod => mod.NavigationControl),
  { ssr: false }
);

const GeolocateControl = dynamic(
  () => import('react-map-gl/mapbox').then(mod => mod.GeolocateControl),
  { ssr: false }
);

// Local types
interface MapVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  address?: string;
  isOpen?: boolean;
  distance?: number;
}

interface CenterOn extends Coordinates {
  zoom?: number;
}

interface CurrentUserMapProfile {
  id?: string;
  lat?: number;
  lng?: number;
  image?: string;
}

interface MapboxMapProps {
  readonly profiles?: MapProfile[];
  readonly groups?: MapGroup[];
  readonly venues?: MapVenue[];
  readonly viewMode?: 'users' | 'groups';
  readonly mapCenter?: Coordinates | null;
  readonly currentUserProfile?: CurrentUserMapProfile | null;
  readonly centerOn?: CenterOn | null;
  readonly onViewportChange?: (viewport: any) => void;
  readonly onSelectProfile?: (profile: MapProfile) => void;
  readonly onSelectGroup?: (group: MapGroup) => void;
  readonly onEmptyClick?: () => void;
}

export default function MapboxMap({
  profiles = [],
  groups = [],
  venues = [],
  viewMode = 'users',
  mapCenter,
  currentUserProfile,
  centerOn,
  onViewportChange,
  onSelectProfile,
  onSelectGroup,
  onEmptyClick
}: MapboxMapProps) {
  const { colors } = useTheme();
  const mapRef = useRef<any>(null);
  const [popup, setPopup] = useState<any>(null);
  const [localProfiles, setLocalProfiles] = useState<MapProfile[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const lastCenterRef = useRef<CenterOn | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  // Calculate effective center
  const effectiveCenter = useMemo(() => {
    if (mapCenter) return mapCenter;
    if (currentUserProfile?.lat && currentUserProfile?.lng) {
      return { lat: currentUserProfile.lat, lng: currentUserProfile.lng };
    }
    return null;
  }, [mapCenter, currentUserProfile]);

  // Initial view state
  const initialView = useMemo(
    () => ({
      latitude: effectiveCenter?.lat ?? 34.0522,
      longitude: effectiveCenter?.lng ?? -118.2437,
      zoom: 12
    }),
    [effectiveCenter]
  );

  // Theme-based map style
  const mapStyle = colors.background === '#fff'
    ? 'mapbox://styles/mapbox/light-v10'
    : 'mapbox://styles/mapbox/dark-v10';

  // Report visible profiles callback
  const reportVisibleProfiles = useCallback(() => {
    if (!mapRef.current || !onViewportChange) return;

    const bounds = mapRef.current.getBounds?.();
    if (!bounds) return;

    const visible = localProfiles.filter(
      (profile) =>
        typeof profile.lat === 'number' &&
        typeof profile.lng === 'number' &&
        bounds.contains([profile.lng, profile.lat])
    );

    const center = mapRef.current.getCenter?.();
    const zoom = mapRef.current.getZoom?.();

    onViewportChange({
      bounds,
      visible,
      center: center ? { lat: center.lat, lng: center.lng } : null,
      zoom,
    });
  }, [localProfiles, onViewportChange]);

  // Sync profiles to local state
  useEffect(() => {
    setLocalProfiles(profiles);
  }, [profiles]);

  // Report visible profiles when local profiles change
  useEffect(() => {
    reportVisibleProfiles();
  }, [localProfiles, reportVisibleProfiles]);

  // Handle centerOn changes
  useEffect(() => {
    if (!centerOn || !mapRef.current) return;

    const { lat, lng, zoom } = centerOn;
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    const last = lastCenterRef.current;
    if (last?.lat === lat && last?.lng === lng && (last?.zoom ?? null) === (zoom ?? null)) {
      return;
    }

    const currentZoom = mapRef.current.getZoom?.() ?? 12;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoom ?? Math.max(currentZoom, 13),
      essential: true,
      speed: 1.2,
    });
    lastCenterRef.current = { lat, lng, zoom };
  }, [centerOn]);

  // Hit detection radius in pixels
  const HIT_RADIUS = 24;

  // Handle map click - detect marker hits via screen coordinates
  const handleMapClick = useCallback((e: any) => {
    const map = mapRef.current;
    if (!map) return;

    const clickPoint = e.point; // {x, y} screen coords

    // Check profiles (if in users view mode)
    if (viewMode === 'users') {
      for (const profile of localProfiles) {
        if (typeof profile.lat !== 'number' || typeof profile.lng !== 'number') continue;
        if (!profile.image) continue;
        // Skip current user's profile - they have their own marker and shouldn't open drawer
        if (currentUserProfile?.id && profile.id === currentUserProfile.id) continue;

        const markerPos = map.project([profile.lng, profile.lat]);
        const distance = Math.sqrt(
          Math.pow(clickPoint.x - markerPos.x, 2) +
          Math.pow(clickPoint.y - markerPos.y, 2)
        );

        if (distance < HIT_RADIUS) {
          onSelectProfile?.(profile);
          return;
        }
      }
    }

    // Check groups (if in groups view mode)
    if (viewMode === 'groups') {
      for (const group of groups) {
        if (typeof group.lat !== 'number' || typeof group.lng !== 'number') continue;

        const markerPos = map.project([group.lng, group.lat]);
        const distance = Math.sqrt(
          Math.pow(clickPoint.x - markerPos.x, 2) +
          Math.pow(clickPoint.y - markerPos.y, 2)
        );

        if (distance < HIT_RADIUS) {
          setPopup({ type: 'group', lat: group.lat, lng: group.lng, data: group });
          onSelectGroup?.(group);
          return;
        }
      }
    }

    // Check venues (always visible)
    for (const venue of venues) {
      if (typeof venue.lat !== 'number' || typeof venue.lng !== 'number') continue;

      const markerPos = map.project([venue.lng, venue.lat]);
      const distance = Math.sqrt(
        Math.pow(clickPoint.x - markerPos.x, 2) +
        Math.pow(clickPoint.y - markerPos.y, 2)
      );

      if (distance < HIT_RADIUS) {
        setPopup({ type: 'venue', lat: venue.lat, lng: venue.lng, data: venue });
        return;
      }
    }

    // No marker hit - notify parent to close drawer
    onEmptyClick?.();
  }, [viewMode, localProfiles, groups, venues, currentUserProfile, onSelectProfile, onSelectGroup, onEmptyClick]);

  // Handle mouse move - detect hover for cursor change
  const handleMouseMove = useCallback((e: any) => {
    const map = mapRef.current;
    if (!map) return;

    const point = e.point;
    let foundHover = false;

    // Check profiles
    if (viewMode === 'users') {
      for (const profile of localProfiles) {
        if (typeof profile.lat !== 'number' || typeof profile.lng !== 'number') continue;
        if (!profile.image) continue;

        const markerPos = map.project([profile.lng, profile.lat]);
        const distance = Math.sqrt(
          Math.pow(point.x - markerPos.x, 2) +
          Math.pow(point.y - markerPos.y, 2)
        );

        if (distance < HIT_RADIUS) {
          foundHover = true;
          break;
        }
      }
    }

    // Check groups
    if (!foundHover && viewMode === 'groups') {
      for (const group of groups) {
        if (typeof group.lat !== 'number' || typeof group.lng !== 'number') continue;

        const markerPos = map.project([group.lng, group.lat]);
        const distance = Math.sqrt(
          Math.pow(point.x - markerPos.x, 2) +
          Math.pow(point.y - markerPos.y, 2)
        );

        if (distance < HIT_RADIUS) {
          foundHover = true;
          break;
        }
      }
    }

    // Check venues
    if (!foundHover) {
      for (const venue of venues) {
        if (typeof venue.lat !== 'number' || typeof venue.lng !== 'number') continue;

        const markerPos = map.project([venue.lng, venue.lat]);
        const distance = Math.sqrt(
          Math.pow(point.x - markerPos.x, 2) +
          Math.pow(point.y - markerPos.y, 2)
        );

        if (distance < HIT_RADIUS) {
          foundHover = true;
          break;
        }
      }
    }

    setHoveredId(foundHover ? 'marker' : null);
  }, [viewMode, localProfiles, groups, venues]);

  if (!token) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        Missing Mapbox Token. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapComponent
        mapboxAccessToken={token}
        mapStyle={mapStyle}
        initialViewState={initialView}
        ref={(ref: any) => {
          if (ref) {
            mapRef.current = ref.getMap();
          }
        }}
        minZoom={2}
        maxZoom={18}
        onMoveEnd={reportVisibleProfiles}
        onLoad={reportVisibleProfiles}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        cursor={hoveredId ? 'pointer' : 'grab'}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Profile Markers - visual only, clicks handled by map */}
        {viewMode === 'users' &&
          localProfiles
            .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && p.image)
            .map(profile => (
              <Marker
                key={profile.id}
                longitude={profile.lng}
                latitude={profile.lat}
                anchor="center"
              >
                <div className={styles.markerButton}>
                  {profile.online && (
                    <>
                      <div className={styles.pulseRing} />
                      <div className={styles.pulseRingDelayed} />
                    </>
                  )}
                  <div
                    className={`${styles.profilePhoto} ${
                      profile.online ? styles.profilePhotoOnline : styles.profilePhotoOffline
                    }`}
                    style={{ backgroundImage: `url(${profile.image})` }}
                  />
                </div>
              </Marker>
            ))}

        {/* Venue Markers - visual only, clicks handled by map */}
        {venues
          .filter(v => typeof v.lat === 'number' && typeof v.lng === 'number')
          .map(venue => (
            <Marker
              key={venue.id}
              longitude={venue.lng}
              latitude={venue.lat}
              anchor="center"
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
                title={venue.name}
              >
                🍸
              </div>
            </Marker>
          ))}

        {/* Current User Marker */}
        {viewMode === 'users' && effectiveCenter && currentUserProfile && (
          <Marker
            longitude={effectiveCenter.lng}
            latitude={effectiveCenter.lat}
            anchor="center"
          >
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              <div className={styles.pulseRing} />
              <div className={styles.pulseRingDelayed} />
              <div
                className={styles.currentUserPhoto}
                style={{
                  backgroundImage: currentUserProfile.image
                    ? `url(${currentUserProfile.image})`
                    : 'none',
                  backgroundColor: currentUserProfile.image ? 'transparent' : '#FF6B35',
                }}
              >
                {!currentUserProfile.image && '👤'}
              </div>
            </div>
          </Marker>
        )}

        {/* Group Markers - visual only, clicks handled by map */}
        {viewMode === 'groups' &&
          groups
            .filter(g => typeof g.lat === 'number' && typeof g.lng === 'number' && g.lat !== 0 && g.lng !== 0)
            .map(group => (
              <Marker
                key={group.id}
                longitude={group.lng}
                latitude={group.lat}
                anchor="center"
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                    border: '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(255,107,53,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                  title={group.name}
                >
                  👥
                </div>
              </Marker>
            ))}

        {/* Popup */}
        {popup && (
          <Popup
            latitude={popup.lat}
            longitude={popup.lng}
            offset={10}
            closeButton={false}
            onClose={() => setPopup(null)}
          >
            <div
              style={{
                backdropFilter: 'blur(10px)',
                padding: 12,
                borderRadius: 12,
                border: '1px solid rgba(0,0,0,0.4)',
                background: 'rgba(255,255,255,0.1)',
                color: colors.text,
                width: 200
              }}
            >
              {popup.type === 'venue' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>🍸</span>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{popup.data.name}</div>
                  </div>
                  {popup.data.category && (
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                      {popup.data.category}
                    </div>
                  )}
                  {popup.data.address && (
                    <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 6 }}>
                      {popup.data.address}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11 }}>
                    {popup.data.isOpen !== undefined && (
                      <span style={{ color: popup.data.isOpen ? '#4caf50' : '#ff5722' }}>
                        {popup.data.isOpen ? 'Open' : 'Closed'}
                      </span>
                    )}
                    {popup.data.distance && (
                      <span style={{ opacity: 0.6 }}>
                        {popup.data.distance < 1000
                          ? `${popup.data.distance}m away`
                          : `${(popup.data.distance / 1000).toFixed(1)}km away`}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {popup.type === 'group' && (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{popup.data.name}</div>
                  {popup.data.host && (
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      Hosted by {popup.data.host}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Popup>
        )}

        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
      </MapComponent>
    </div>
  );
}
