'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '../../contexts/ThemeContext';

// Dynamic imports to avoid SSR issues
const MapComponent = dynamic(() => import('react-map-gl/mapbox').then(mod => mod.Map), { ssr: false }) as any;
const Popup = dynamic(() => import('react-map-gl/mapbox').then(mod => mod.Popup), { ssr: false }) as any;
const Marker = dynamic(() => import('react-map-gl/mapbox').then(mod => mod.Marker), { ssr: false }) as any;
const NavigationControl = dynamic(() => import('react-map-gl/mapbox').then(mod => mod.NavigationControl), { ssr: false }) as any;
const GeolocateControl = dynamic(() => import('react-map-gl/mapbox').then(mod => mod.GeolocateControl), { ssr: false }) as any;


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
  onSelectGroup
}: any) {
  const { colors } = useTheme();
  const mapRef = useRef<any>(null);
  const [popup, setPopup] = useState<any>(null);
  const [localProfiles, setLocalProfiles] = useState<any[]>([]);
  const lastCenterRef = useRef<{ lat: number; lng: number; zoom?: number } | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const effectiveCenter = useMemo(() => {
    if (mapCenter) return mapCenter;
    if (currentUserProfile?.lat && currentUserProfile?.lng) {
      return { lat: currentUserProfile.lat, lng: currentUserProfile.lng };
    }
    return null;
  }, [mapCenter, currentUserProfile]);

  // Initial position
  const initialView = useMemo(
    () => ({
      latitude: effectiveCenter?.lat ?? 34.0522,
      longitude: effectiveCenter?.lng ?? -118.2437,
      zoom: 12
    }),
    [effectiveCenter]
  );

  // Theme-based basemap
  const mapStyle =
    colors.background === '#fff'
      ? 'mapbox://styles/mapbox/light-v10'
      : 'mapbox://styles/mapbox/dark-v10';

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

  // Sync profiles to local list (for GPU rendering)
  useEffect(() => {
    setLocalProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    reportVisibleProfiles();
  }, [localProfiles, reportVisibleProfiles]);

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


  if (!token) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        Missing Mapbox Token.  
        Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapComponent
        mapboxAccessToken={token}
        mapStyle={mapStyle}
        initialViewState={initialView}
        ref={ref => {
          if (!ref) return;
          mapRef.current = ref.getMap();
        }}
        minZoom={2}
        maxZoom={18}
        onMoveEnd={reportVisibleProfiles}
        onLoad={reportVisibleProfiles}
        style={{ width: '100%', height: '100%' }}
      >
        {/* User Profiles as Photo Pins - with orange pulsating ring for online users */}
        {viewMode === 'users' &&
          localProfiles
            .filter(p => {
              const valid = typeof p.lat === 'number' &&
                typeof p.lng === 'number' &&
                p.image;
              // Don't exclude current user - show all profiles
              return valid;
            })
            .map(profile => (
              <Marker
                key={profile.id}
                longitude={profile.lng}
                latitude={profile.lat}
                anchor="center"
                onClick={() => onSelectProfile?.(profile)}
              >
                <div
                  onClick={() => onSelectProfile?.(profile)}
                  style={{
                    position: 'relative',
                    width: 48,
                    height: 48,
                    cursor: 'pointer'
                  }}
                >
                  {/* Pulsating glow rings for online users */}
                  {profile.online && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'rgba(255, 107, 53, 0.4)',
                          animation: 'pulse-glow 2s ease-out infinite',
                          pointerEvents: 'none',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          background: 'rgba(255, 107, 53, 0.3)',
                          animation: 'pulse-glow 2s ease-out infinite 0.5s',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  )}
                  {/* Profile photo */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      backgroundImage: `url(${profile.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: profile.online ? '3px solid #FF6B35' : '2px solid #fff',
                      boxShadow: profile.online ? '0 0 12px rgba(255,107,53,0.6)' : '0 2px 6px rgba(0,0,0,0.4)',
                      zIndex: 1,
                    }}
                  />
                </div>
              </Marker>
            ))}

        {/* Venue markers (bars, clubs, etc.) */}
        {venues
          .filter((v: any) => typeof v.lat === 'number' && typeof v.lng === 'number')
          .map((venue: any) => (
            <Marker
              key={venue.id}
              longitude={venue.lng}
              latitude={venue.lat}
              anchor="center"
              onClick={() => setPopup({ type: 'venue', lat: venue.lat, lng: venue.lng, data: venue })}
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
                  cursor: 'pointer',
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

        {/* Current user pin - with orange pulsating glow */}
        {viewMode === 'users' && effectiveCenter && currentUserProfile && (
          <Marker longitude={effectiveCenter.lng} latitude={effectiveCenter.lat} anchor="center">
            <div style={{ position: 'relative', width: 48, height: 48 }}>
              {/* Pulsating glow rings */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 107, 53, 0.4)',
                  animation: 'pulse-glow 2s ease-out infinite',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 107, 53, 0.3)',
                  animation: 'pulse-glow 2s ease-out infinite 0.5s',
                  pointerEvents: 'none',
                }}
              />
              {/* Profile photo */}
              <div
                style={{
                  position: 'relative',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundImage: currentUserProfile.image ? `url(${currentUserProfile.image})` : 'none',
                  backgroundColor: currentUserProfile.image ? 'transparent' : '#FF6B35',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '3px solid #FF6B35',
                  boxShadow: '0 0 12px rgba(255,107,53,0.6)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {!currentUserProfile.image && '👤'}
              </div>
              <style>{`
                @keyframes pulse-glow {
                  0% {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 0.6;
                  }
                  100% {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          </Marker>
        )}

        {/* Groups as markers when in groups view mode */}
        {viewMode === 'groups' &&
          groups
            .filter((g: any) => typeof g.lat === 'number' && typeof g.lng === 'number')
            .map((group: any) => (
              <Marker
                key={group.id}
                longitude={group.lng}
                latitude={group.lat}
                anchor="center"
                onClick={() => {
                  setPopup({ type: 'group', lat: group.lat, lng: group.lng, data: group });
                  onSelectGroup?.(group);
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                    border: '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(255,107,53,0.5)',
                    cursor: 'pointer',
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
              {popup.type === 'profile' ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: '50%',
                      backgroundImage: `url(${
                        popup.data.image ||
                        (popup.data.id % 2 ? '/images/5.jpg' : '/images/6.jpg')
                      })`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid #000'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {popup.data.name}, {popup.data.age}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {popup.data.position}
                    </div>
                  </div>
                </div>
              ) : popup.type === 'venue' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>🍸</span>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{popup.data.name}</div>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                    {popup.data.category}
                  </div>
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
              ) : (
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{popup.data.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Hosted by {popup.data.host}
                  </div>
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
