// =============================================================================
// MapToggleTabs - Glass style tabs with dropdown lists for Users and Groups
// =============================================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import type { MapToggleTabsProps, MapProfile, MapGroup } from '@/types/map';

interface ExtendedMapToggleTabsProps extends MapToggleTabsProps {
  profiles?: MapProfile[];
  groups?: MapGroup[];
  currentUserLat?: number;
  currentUserLng?: number;
  onSelectProfile?: (profile: MapProfile) => void;
  onSelectGroup?: (group: MapGroup) => void;
}

// Calculate distance between two points (Haversine formula)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

// Icons
const Icons = {
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Groups: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 21V18C3 15.79 4.79 14 7 14H11C13.21 14 15 15.79 15 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 14C19.21 14 21 15.79 21 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Location: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
};

const glassTabStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.02)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  fontFamily: "'Orbitron', sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
  position: 'relative' as const,
};

export function MapToggleTabs({
  viewMode,
  onChangeMode,
  userCount,
  groupCount,
  profiles = [],
  groups = [],
  currentUserLat,
  currentUserLng,
  onSelectProfile,
  onSelectGroup,
}: ExtendedMapToggleTabsProps) {
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);
  const [groupsDropdownOpen, setGroupsDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const usersRef = useRef<HTMLDivElement>(null);
  const groupsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (usersRef.current && !usersRef.current.contains(e.target as Node)) {
        setUsersDropdownOpen(false);
      }
      if (groupsRef.current && !groupsRef.current.contains(e.target as Node)) {
        setGroupsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sort profiles by distance
  const sortedProfiles = [...profiles]
    .filter(p => p.lat && p.lng && p.image)
    .map(p => ({
      ...p,
      distance: currentUserLat && currentUserLng
        ? getDistance(currentUserLat, currentUserLng, p.lat, p.lng)
        : 999999
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 20); // Limit to 20

  // Sort groups by distance
  const sortedGroups = [...groups]
    .filter(g => g.lat && g.lng && g.lat !== 0 && g.lng !== 0)
    .map(g => ({
      ...g,
      distance: currentUserLat && currentUserLng
        ? getDistance(currentUserLat, currentUserLng, g.lat, g.lng)
        : 999999
    }))
    .sort((a, b) => a.distance - b.distance);

  const isUsersActive = viewMode === 'users';
  const isGroupsActive = viewMode === 'groups';

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '8px',
    background: 'rgba(15,15,20,0.95)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '8px',
    maxHeight: '300px',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,53,0.1)',
    zIndex: 1000,
  };

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      padding: '0 16px 12px',
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Users Tab */}
      <div ref={usersRef} style={{ flex: 1, position: 'relative' }}>
        <button
          onClick={() => {
            onChangeMode('users');
            setUsersDropdownOpen(!usersDropdownOpen);
            setGroupsDropdownOpen(false);
          }}
          style={{
            ...glassTabStyle,
            width: '100%',
            background: isUsersActive
              ? 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))'
              : 'rgba(255,255,255,0.02)',
            borderColor: isUsersActive ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.08)',
            color: isUsersActive ? '#FF6B35' : 'rgba(255,255,255,0.5)',
            boxShadow: isUsersActive
              ? '0 0 30px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
              : 'none',
          }}
        >
          <Icons.User />
          <span>Users ({userCount})</span>
          <Icons.ChevronDown />

          {/* Glow line */}
          {isUsersActive && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '20%',
              right: '20%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #FF6B35, transparent)',
              boxShadow: '0 0 10px rgba(255,107,53,0.8)',
            }} />
          )}
        </button>

        {/* Users Dropdown */}
        {usersDropdownOpen && isUsersActive && (
          <div style={dropdownStyle}>
            {sortedProfiles.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '12px',
              }}>
                No users nearby
              </div>
            ) : (
              sortedProfiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => {
                    onSelectProfile?.(profile);
                    setUsersDropdownOpen(false);
                  }}
                  onMouseEnter={() => setHoveredItem(`user-${profile.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    background: hoveredItem === `user-${profile.id}` ? 'rgba(255,107,53,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundImage: `url(${profile.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: profile.online ? '2px solid #4ade80' : '2px solid rgba(255,255,255,0.1)',
                    flexShrink: 0,
                  }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: hoveredItem === `user-${profile.id}` ? '#FF6B35' : '#fff',
                      fontSize: '13px',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {profile.name || 'User'}
                      {profile.age && <span style={{ opacity: 0.6, marginLeft: 4 }}>{profile.age}</span>}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '11px',
                    }}>
                      <Icons.Location />
                      {formatDistance(profile.distance)}
                    </div>
                  </div>

                  {/* Online indicator */}
                  {profile.online && (
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#4ade80',
                      boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                    }} />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Groups Tab */}
      <div ref={groupsRef} style={{ flex: 1, position: 'relative' }}>
        <button
          onClick={() => {
            onChangeMode('groups');
            setGroupsDropdownOpen(!groupsDropdownOpen);
            setUsersDropdownOpen(false);
          }}
          style={{
            ...glassTabStyle,
            width: '100%',
            background: isGroupsActive
              ? 'linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))'
              : 'rgba(255,255,255,0.02)',
            borderColor: isGroupsActive ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.08)',
            color: isGroupsActive ? '#FF6B35' : 'rgba(255,255,255,0.5)',
            boxShadow: isGroupsActive
              ? '0 0 30px rgba(255,107,53,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
              : 'none',
          }}
        >
          <Icons.Groups />
          <span>Groups ({groupCount})</span>
          <Icons.ChevronDown />

          {/* Glow line */}
          {isGroupsActive && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '20%',
              right: '20%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #FF6B35, transparent)',
              boxShadow: '0 0 10px rgba(255,107,53,0.8)',
            }} />
          )}
        </button>

        {/* Groups Dropdown */}
        {groupsDropdownOpen && isGroupsActive && (
          <div style={dropdownStyle}>
            {sortedGroups.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '12px',
              }}>
                No groups nearby
              </div>
            ) : (
              sortedGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => {
                    onSelectGroup?.(group);
                    setGroupsDropdownOpen(false);
                  }}
                  onMouseEnter={() => setHoveredItem(`group-${group.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    background: hoveredItem === `group-${group.id}` ? 'rgba(255,107,53,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Group Icon */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}>
                    👥
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: hoveredItem === `group-${group.id}` ? '#FF6B35' : '#fff',
                      fontSize: '13px',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {group.name}
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '11px',
                    }}>
                      <span>{group.attendees}/{group.maxAttendees}</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icons.Location />
                        {formatDistance(group.distance)}
                      </span>
                    </div>
                  </div>

                  {/* Time */}
                  <div style={{
                    fontSize: '10px',
                    color: '#FF6B35',
                    fontWeight: 500,
                  }}>
                    {group.time}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
