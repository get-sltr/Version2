'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { IconSearch, IconMap, IconMenu, IconStar, IconUser, IconCheck, IconEye, IconCrown, IconClose } from '@/components/Icons';
import BottomNavWithBadges from '@/components/BottomNavWithBadges';
import ProBadge from '@/components/ProBadge';
import OrbitBadge from '@/components/OrbitBadge';
import { DTHBadge } from '@/components/dth';
import { useDTH } from '@/hooks/useDTH';
import { usePremium } from '@/hooks/usePremium';
import MigrationBanner from '@/components/MigrationBanner';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { glassHeader } from '@/styles/design-tokens';
import { AddToHomeScreenSplash } from '@/components/AddToHomeScreenSplash';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';

/**
 * Format distance for display
 * - Under 1 mile: shows feet (e.g., "500 ft")
 * - 1+ miles: shows miles with 1 decimal (e.g., "2.3 mi")
 * - No data: shows "Nearby"
 */
function formatDistance(distance: number | undefined): string {
  if (distance === undefined || distance === Infinity || Number.isNaN(distance)) {
    return 'Nearby';
  }

  if (distance < 1) {
    const feet = Math.round(distance * 5280);
    return `${feet} ft`;
  }

  return `${distance.toFixed(1)} mi`;
}

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const { blockedIds } = useBlockedUsers();
  const [activeFilter, setActiveFilter] = useState('online');
  const [showAd, setShowAd] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [ageDonePressed, setAgeDonePressed] = useState(false);
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [showTribesDropdown, setShowTribesDropdown] = useState(false);
  const [selectedTribes, setSelectedTribes] = useState<string[]>([]);
  const [hostingUserIds, setHostingUserIds] = useState<Set<string>>(new Set());
  const [locationSearch, setLocationSearch] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filters = [
    { id: 'online', label: 'Online' },
    { id: 'dth', label: 'DTH', icon: '💦' },
    { id: 'age', label: 'Age', hasDropdown: true },
    { id: 'position', label: 'Position', hasDropdown: true },
    { id: 'tribes', label: 'Tribes', hasDropdown: true },
    { id: 'fresh', label: 'New' },
    { id: 'photos', label: 'Photos' },
  ];

  const positionOptions = [
    { id: 'top', label: 'Top' },
    { id: 'vers-top', label: 'Vers Top' },
    { id: 'versatile', label: 'Versatile' },
    { id: 'vers-bottom', label: 'Vers Bottom' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'side', label: 'Side' }
  ];

  const tribeOptions = [
    { id: 'bear', label: 'Bear' },
    { id: 'twink', label: 'Twink' },
    { id: 'jock', label: 'Jock' },
    { id: 'otter', label: 'Otter' },
    { id: 'daddy', label: 'Daddy' },
    { id: 'leather', label: 'Leather' },
    { id: 'poz', label: 'Poz' },
    { id: 'discreet', label: 'Discreet' },
    { id: 'clean-cut', label: 'Clean-Cut' },
    { id: 'geek', label: 'Geek' },
    { id: 'military', label: 'Military' },
    { id: 'rugged', label: 'Rugged' },
    { id: 'pup', label: 'Pup' },
    { id: 'trans', label: 'Trans' },
    { id: 'queer', label: 'Queer' }
  ];

  // Fetch users who are hosting active groups
  const fetchHostingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('host_id')
        .eq('is_active', true);

      if (!error && data) {
        const hostIds = new Set(data.map(g => g.host_id).filter(Boolean) as string[]);
        setHostingUserIds(hostIds);
      }
    } catch (err) {
      console.error('Error fetching hosting users:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkUser();
      await fetchProfiles();
      await fetchHostingUsers();

      // Subscribe to real-time profile changes for current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const subscription = supabase
        .channel(`profile:${authUser.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${authUser.id}`
          },
          () => {
            // When current user's profile changes, refresh profiles list
            fetchProfiles();
          }
        )
        .subscribe();

      // Also refresh profiles every 30 seconds as fallback
      const interval = setInterval(fetchProfiles, 30000);

      // Heartbeat - update last_seen every 2 minutes to show as online
      const heartbeat = setInterval(async () => {
        if (authUser) {
          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', authUser.id);
        }
      }, 2 * 60 * 1000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
        clearInterval(heartbeat);
      };
    };
    
    const cleanup = init();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    // Mark user as online
    await supabase
      .from('profiles')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', user.id);

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setCurrentUser(profile);
  };

  const fetchProfiles = useCallback(async () => {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch current user's location directly (don't rely on state which may not be set yet)
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('lat, lng')
      .eq('id', user.id)
      .single();

    // EARLY STAGE: Show all profiles, less restrictive filtering
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('is_incognito', true);  // Only exclude explicitly incognito users (allows null)

    // Apply filters based on activeFilter
    if (activeFilter === 'online') {
      // Consider "online" if last_seen within last 90 days (very lenient for early stage)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      query = query.gte('last_seen', ninetyDaysAgo.toISOString());
    } else if (activeFilter === 'fresh') {
      // Show profiles created in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    } else if (activeFilter === 'dth') {
      // Show only DTH users with active DTH (dth_active_until > now)
      query = query.gt('dth_active_until', new Date().toISOString());
    }

    // Apply position filter if selected
    if (selectedPositions.length > 0) {
      // Map position IDs to database values
      const positionMap: Record<string, string> = {
        'top': 'top',
        'vers-top': 'vers-top',
        'versatile': 'versatile',
        'vers-bottom': 'vers-bottom',
        'bottom': 'bottom',
        'side': 'side'
      };
      const dbPositions = selectedPositions.map(p => positionMap[p] || p).filter(Boolean);
      if (dbPositions.length > 0) {
        query = query.in('position', dbPositions);
      }
    }

    // Apply age filter if set
    if (ageMin) {
      query = query.gte('age', parseInt(ageMin, 10));
    }
    if (ageMax) {
      query = query.lte('age', parseInt(ageMax, 10));
    }

    // Apply tribe filter if selected (tribes are stored as JSONB array)
    if (selectedTribes.length > 0) {
      // For JSONB array contains, we need to use a different approach
      // This will filter profiles that have any of the selected tribes
      const tribeConditions = selectedTribes.map(tribe =>
        `tribes @> '["${tribe}"]'`
      ).join(' OR ');
      // Note: This requires a raw SQL approach, but Supabase client doesn't support it directly
      // We'll filter in JavaScript instead for now
    }

    // Get user's location for distance-based sorting (from fresh DB fetch, not state)
    // Parse as numbers in case they're stored as strings
    const userLat = currentUserProfile?.lat ? parseFloat(String(currentUserProfile.lat)) : null;
    const userLng = currentUserProfile?.lng ? parseFloat(String(currentUserProfile.lng)) : null;
    const hasLocation = userLat !== null && userLng !== null &&
                       !isNaN(userLat) && !isNaN(userLng);

    // Order by last_seen (most recent first)
    // If user has location, we'll sort by distance in JavaScript
    query = query.order('last_seen', { ascending: false }).limit(200);  // Increased limit for better results

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      setProfiles([]);
      setLoading(false);
      return;
    }

    if (data) {
      let filtered = data;

      // Filter out blocked users
      if (blockedIds.size > 0) {
        filtered = filtered.filter(p => !blockedIds.has(p.id));
      }

      // Apply tribe filter in JavaScript (since Supabase client doesn't support JSONB contains easily)
      if (selectedTribes.length > 0) {
        filtered = filtered.filter(profile => {
          if (!profile.tribes || !Array.isArray(profile.tribes)) return false;
          return selectedTribes.some(tribe => profile.tribes.includes(tribe));
        });
      }

      // Calculate distance and filter by radius if user has location
      // EARLY STAGE: Very lenient distance - show profiles from anywhere
      const MAX_DISTANCE_MILES = 10000; // Essentially unlimited for early stage

      if (hasLocation) {
        filtered = filtered
          .map(profile => {
            const profileLat = typeof profile.lat === 'number' ? profile.lat : parseFloat(profile.lat);
            const profileLng = typeof profile.lng === 'number' ? profile.lng : parseFloat(profile.lng);

            if (!profileLat || !profileLng || isNaN(profileLat) || isNaN(profileLng)) {
              return { ...profile, distance: Infinity };
            }

            // Calculate distance using Haversine formula
            const R = 3958.8; // Earth radius in miles
            const dLat = (profileLat - userLat) * Math.PI / 180;
            const dLon = (profileLng - userLng) * Math.PI / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(profileLat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            return { ...profile, distance };
          })
          // Filter out profiles beyond max distance (keep profiles without location for now)
          .filter(profile => profile.distance <= MAX_DISTANCE_MILES || profile.distance === Infinity)
          .sort((a, b) => {
            // Sort by distance first, then by last_seen
            // Profiles without location (Infinity) go to the end
            if (a.distance !== b.distance) {
              return a.distance - b.distance;
            }
            const aTime = new Date(a.last_seen || 0).getTime();
            const bTime = new Date(b.last_seen || 0).getTime();
            return bTime - aTime;
          });
      }

      // Limit to 50 for display
      const displayProfiles = filtered.slice(0, 50);

      // Fetch long_session_visible from user_settings for displayed profiles
      const profileIds = displayProfiles.map(p => p.id);
      if (profileIds.length > 0) {
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('user_id, long_session_visible')
          .in('user_id', profileIds);

        if (settingsData) {
          const longSessionMap = new Map(settingsData.map(s => [s.user_id, s.long_session_visible]));
          displayProfiles.forEach(p => {
            p.long_session_visible = longSessionMap.get(p.id) ?? false;
          });
        }
      }

      setProfiles(displayProfiles);
    } else {
      setProfiles([]);
    }
    setLoading(false);
  }, [activeFilter, selectedPositions, selectedTribes, ageMin, ageMax, currentUser, blockedIds]);

  // Re-fetch when filter changes or current user updates
  useEffect(() => {
    if (currentUser) {
      fetchProfiles();
    }
  }, [fetchProfiles, currentUser]);

  const getProfileImage = (profile: any, index: number) => {
    // Use photo_url from profile or fallback to placeholder images
    if (profile.photo_url) {
      return profile.photo_url;
    }
    // Alternate between placeholder images 5 and 6
    return index % 2 === 0 ? '/images/5.jpg' : '/images/6.jpg';
  };

  const togglePosition = (positionId: string) => {
    setSelectedPositions(prev => {
      if (prev.includes(positionId)) {
        return prev.filter(id => id !== positionId);
      } else {
        return [...prev, positionId];
      }
    });
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      // Clear location filter
      setSearchedLocation(null);
      fetchProfiles();
      return;
    }

    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationSearch)}.json?access_token=${mapboxToken}&types=place,locality,region,country&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        setSearchedLocation({
          lat,
          lng,
          name: feature.place_name
        });
        // Fetch profiles near this location
        fetchProfilesAtLocation(lat, lng);
      } else {
        showToast('Location not found. Try a different city name.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      showToast('Failed to search location');
    }
  };

  const fetchProfilesAtLocation = async (searchLat: number, searchLng: number) => {
    setLoading(true);
    try {
      // Get profiles with location data
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .not('lat', 'is', null)
        .not('lng', 'is', null);

      if (error) throw error;

      if (profilesData) {
        // Calculate distance and filter profiles within ~50 miles
        const maxDistanceKm = 80; // ~50 miles
        const nearbyProfiles = profilesData
          .map(profile => {
            const distance = getDistanceKm(searchLat, searchLng, profile.lat, profile.lng);
            return { ...profile, distanceKm: distance };
          })
          .filter(profile => profile.distanceKm <= maxDistanceKm)
          .sort((a, b) => a.distanceKm - b.distanceKm);

        setProfiles(nearbyProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles at location:', error);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula to calculate distance between two points
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const clearLocationSearch = () => {
    setLocationSearch('');
    setSearchedLocation(null);
    fetchProfiles();
  };

  const handleFilterClick = (filter: any) => {
    if (filter.id === 'position') {
      setShowPositionDropdown(!showPositionDropdown);
      setShowAgeDropdown(false);
      setShowTribesDropdown(false);
    } else if (filter.id === 'age') {
      setShowAgeDropdown(!showAgeDropdown);
      setShowPositionDropdown(false);
      setShowTribesDropdown(false);
    } else if (filter.id === 'tribes') {
      setShowTribesDropdown(!showTribesDropdown);
      setShowPositionDropdown(false);
      setShowAgeDropdown(false);
    } else if (filter.id === 'dth') {
      // DTH filter - toggle on/off (premium feature)
      if (activeFilter === 'dth') {
        // Already selected, deselect and go back to 'online'
        setActiveFilter('online');
      } else {
        // Check premium status (but only after loading completes)
        if (!premiumLoading && !isPremium) {
          router.push('/premium');
          return;
        }
        // If still loading, allow access (will validate on next interaction)
        setActiveFilter('dth');
      }
      setShowPositionDropdown(false);
      setShowAgeDropdown(false);
      setShowTribesDropdown(false);
    } else {
      setActiveFilter(filter.id);
      setShowPositionDropdown(false);
      setShowAgeDropdown(false);
      setShowTribesDropdown(false);
    }
  };

  const getPositionButtonLabel = () => {
    if (selectedPositions.length === 0) return 'Position';
    if (selectedPositions.length === 1) {
      const pos = positionOptions.find(p => p.id === selectedPositions[0]);
      return pos?.label || 'Position';
    }
    return `Position (${selectedPositions.length})`;
  };

  const getAgeButtonLabel = () => {
    if (ageMin || ageMax) {
      if (ageMin && ageMax) return `Age ${ageMin}-${ageMax}`;
      if (ageMin) return `Age ${ageMin}+`;
      if (ageMax) return `Age ≤${ageMax}`;
    }
    return 'Age';
  };

  const toggleTribe = (tribeId: string) => {
    setSelectedTribes(prev => {
      if (prev.includes(tribeId)) {
        return prev.filter(id => id !== tribeId);
      } else {
        return [...prev, tribeId];
      }
    });
  };

  const getTribesButtonLabel = () => {
    if (selectedTribes.length === 0) return 'Tribes';
    if (selectedTribes.length === 1) {
      const tribe = tribeOptions.find(t => t.id === selectedTribes[0]);
      return tribe?.label || 'Tribes';
    }
    return `Tribes (${selectedTribes.length})`;
  };

  const getFilterButtonLabel = (filter: any) => {
    if (filter.id === 'position') return getPositionButtonLabel();
    if (filter.id === 'age') return getAgeButtonLabel();
    if (filter.id === 'tribes') return getTribesButtonLabel();
    return filter.label;
  };

  // DTH hook for floating button
  const { isActive: dthActive, timeRemaining: dthTimeRemaining, toggle: toggleDTH, loading: dthLoading } = useDTH();

  // Format DTH time
  const formatDTHTime = () => {
    if (!dthTimeRemaining) return '';
    const hours = Math.floor(dthTimeRemaining / 3600);
    const minutes = Math.floor((dthTimeRemaining % 3600) / 60);
    const seconds = dthTimeRemaining % 60;
    if (dthTimeRemaining <= 60) return `${seconds}s`;
    if (dthTimeRemaining <= 3600) return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: '16px', fontFamily: "'Orbitron', sans-serif", color: '#FF6B35' }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Orbitron', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", position: 'relative', overflow: 'hidden' }}>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          {toast.message}
        </div>
      )}

      {/* Dropdown backdrop dismiss */}
      {(showPositionDropdown || showAgeDropdown || showTribesDropdown) && (
        <div
          onClick={() => {
            setShowPositionDropdown(false);
            setShowAgeDropdown(false);
            setShowTribesDropdown(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        />
      )}

      {/* Add to Home Screen Splash */}
      {currentUser?.id && <AddToHomeScreenSplash userId={currentUser.id} />}

      {/* Push Notification Prompt (shows when running as PWA) */}
      {currentUser?.id && <PushNotificationPrompt userId={currentUser.id} />}

      {/* Migration Banner for old domain users */}
      <MigrationBanner />

      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.35,
        }}
      >
        <source src="/Videos/premiumpage.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, paddingBottom: '100px' }}>
      <header style={{
        ...glassHeader,
        padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 15px 12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <a href="/settings" aria-label="Settings" style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: currentUser?.photo_url ? 'transparent' : 'linear-gradient(135deg, rgba(255,107,53,0.3) 0%, rgba(255,107,53,0.1) 100%)',
            backgroundImage: currentUser?.photo_url ? `url(${currentUser.photo_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            flexShrink: 0,
            border: '2px solid rgba(255, 107, 53, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            color: '#fff',
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {!currentUser?.photo_url && <IconUser size={20} />}
          </a>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              placeholder="Search city..."
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
              style={{
                width: '100%',
                background: searchedLocation ? 'rgba(255,107,53,0.1)' : 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '14px 70px 14px 16px',
                border: searchedLocation ? '1px solid rgba(255, 107, 53, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'inherit',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.2)',
              }}
            />
            {searchedLocation && (
              <button
                onClick={clearLocationSearch}
                aria-label="Clear location search"
                style={{
                  position: 'absolute',
                  right: '40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,107,53,0.3)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  color: '#ff6b35',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
            <button
              onClick={handleLocationSearch}
              aria-label="Search location"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: searchedLocation ? '#ff6b35' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: '12px',
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSearch size={18} />
            </button>
          </div>
          <a href="/map" style={{
            background: 'rgba(255, 107, 53, 0.15)',
            border: '1px solid rgba(255, 107, 53, 0.5)',
            borderRadius: '10px',
            padding: '12px 20px',
            color: '#FF6B35',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            textDecoration: 'none',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(255, 107, 53, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}>
            {/* Shine animation */}
            <span style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              animation: 'buttonShine 2.5s ease-in-out infinite',
            }} />
            <IconMap size={14} />
            <span style={{ position: 'relative', zIndex: 1 }}>MAP</span>
          </a>
        </div>
        {searchedLocation && (
          <div style={{
            background: 'rgba(255,107,53,0.1)',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>📍</span>
              <span style={{ fontSize: '13px', color: '#ff6b35' }}>
                Viewing profiles near <strong>{searchedLocation.name}</strong>
              </span>
            </div>
            <button
              onClick={clearLocationSearch}
              style={{
                background: 'none',
                border: 'none',
                color: '#ff6b35',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px'
              }}
            >
              Clear
            </button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', marginLeft: '-15px', marginRight: '-15px', paddingLeft: '15px', paddingRight: '15px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <a href="/favorites" style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#FF6B35',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.5px',
            flexShrink: 0,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontFamily: 'inherit',
          }}>
            <IconStar size={14} />
            Faves
          </a>
          {filters.map(filter => {
            const isFilterActive = (filter.id === 'position' && selectedPositions.length > 0) ||
                                   (filter.id === 'age' && (ageMin || ageMax)) ||
                                   (filter.id === 'tribes' && selectedTribes.length > 0) ||
                                   activeFilter === filter.id;

            const isDropdownOpen = (filter.id === 'age' && showAgeDropdown) ||
                                   (filter.id === 'position' && showPositionDropdown) ||
                                   (filter.id === 'tribes' && showTribesDropdown);

            // Special DTH button with droplets - Glass style
            if (filter.id === 'dth') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: isFilterActive
                      ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isFilterActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
                    border: isFilterActive ? '1px solid rgba(255, 107, 53, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.2)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {/* Shine on active */}
                  {isFilterActive && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '200%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                      animation: 'buttonShine 3s ease-in-out infinite',
                    }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                    DTH
                    <span style={{ display: 'inline-flex', alignItems: 'flex-end', marginLeft: '4px', gap: 0 }}>
                      <svg style={{ width: '14px', height: '14px', fill: isFilterActive ? '#FF6B35' : 'rgba(255,255,255,0.7)' }} viewBox="0 0 24 24">
                        <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                      </svg>
                    </span>
                  </span>
                </button>
              );
            }

            // Online button with green dot - Glass style
            if (filter.id === 'online') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: isFilterActive
                      ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isFilterActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
                    border: isFilterActive ? '1px solid rgba(255, 107, 53, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.2)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {isFilterActive && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '200%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                      animation: 'buttonShine 3s ease-in-out infinite',
                    }} />
                  )}
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)', position: 'relative', zIndex: 10 }} />
                  <span style={{ position: 'relative', zIndex: 10 }}>Online</span>
                </button>
              );
            }

            // New button with star icon - Glass style
            if (filter.id === 'fresh') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: isFilterActive
                      ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isFilterActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
                    border: isFilterActive ? '1px solid rgba(255, 107, 53, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.2)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {isFilterActive && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '200%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                      animation: 'buttonShine 3s ease-in-out infinite',
                    }} />
                  )}
                  <svg style={{ width: '14px', height: '14px', fill: isFilterActive ? '#FF6B35' : 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 10 }} viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  <span style={{ position: 'relative', zIndex: 10 }}>New</span>
                </button>
              );
            }

            // Photos button with camera icon - Glass style
            if (filter.id === 'photos') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: isFilterActive
                      ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isFilterActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
                    border: isFilterActive ? '1px solid rgba(255, 107, 53, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.2)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {isFilterActive && (
                    <span style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '200%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                      animation: 'buttonShine 3s ease-in-out infinite',
                    }} />
                  )}
                  <svg style={{ width: '14px', height: '14px', fill: isFilterActive ? '#FF6B35' : 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 10 }} viewBox="0 0 24 24">
                    <path d="M4 4H7L9 2H15L17 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4ZM12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17Z"/>
                  </svg>
                  <span style={{ position: 'relative', zIndex: 10 }}>Photos</span>
                </button>
              );
            }

            // Regular filter buttons (Age, Position, Tribes) with dropdown - Glass style
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter)}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: isFilterActive
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isFilterActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
                  border: isFilterActive ? '1px solid rgba(255, 107, 53, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.2)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                {isFilterActive && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '200%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                    animation: 'buttonShine 3s ease-in-out infinite',
                  }} />
                )}
                <span style={{ position: 'relative', zIndex: 10 }}>{getFilterButtonLabel(filter)}</span>
                {filter.hasDropdown && (
                  <span style={{
                    position: 'relative',
                    zIndex: 10,
                    fontSize: '10px',
                    transition: 'transform 0.2s',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Age Dropdown */}
        {showAgeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, rotateX: -10, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.8
            }}
            style={{
              position: 'absolute',
              top: '120px',
              left: '15px',
              right: '15px',
              background: 'rgba(5,5,5,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
              zIndex: 200,
              padding: '18px',
              color: '#ffffff',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
            }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.12)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Age Range</span>
              <button 
                onClick={() => setShowAgeDropdown(false)}
                style={{ 
                  background: ageDonePressed ? '#FF6B35' : 'rgba(30,30,30,0.9)',
                  border: ageDonePressed ? '1px solid #FF6B35' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: ageDonePressed ? '#fff' : '#fff', 
                  fontSize: '13px', 
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  boxShadow: ageDonePressed ? '0 6px 20px rgba(255,107,53,0.35)' : '0 4px 16px rgba(0,0,0,0.35)'
                }}
                onMouseDown={() => setAgeDonePressed(true)}
                onMouseUp={() => setAgeDonePressed(false)}
                onMouseLeave={() => setAgeDonePressed(false)}
                onTouchStart={() => setAgeDonePressed(true)}
                onTouchEnd={() => setAgeDonePressed(false)}
              >
                Done
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="age-min" style={{ fontSize: '12px', color: '#cccccc', display: 'block', marginBottom: '6px' }}>
                  Min Age
                </label>
                <input
                  id="age-min"
                  type="number"
                  min="18"
                  max="99"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  placeholder="18"
                  style={{
                    width: '100%',
                    background: 'rgba(35,35,35,0.92)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(6px)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <span style={{ color: '#ffffff', paddingTop: '20px' }}>—</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="age-max" style={{ fontSize: '12px', color: '#cccccc', display: 'block', marginBottom: '6px' }}>
                  Max Age
                </label>
                <input
                  id="age-max"
                  type="number"
                  min="18"
                  max="99"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  placeholder="99"
                  style={{
                    width: '100%',
                    background: 'rgba(35,35,35,0.92)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(6px)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            {(ageMin || ageMax) && (
              <button
                onClick={() => {
                  setAgeMin('');
                  setAgeMax('');
                }}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: 'rgba(30,30,30,0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#ffffff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                }}
              >
                Clear
              </button>
            )}
          </motion.div>
        )}

        {/* Tribes Dropdown */}
        {showTribesDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, rotateX: -10, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.8
            }}
            style={{
              position: 'absolute',
              top: '120px',
              left: '15px',
              right: '15px',
              background: 'rgba(5,5,5,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
              zIndex: 200,
              padding: '16px',
              maxHeight: '350px',
              overflowY: 'auto',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Select Tribe(s)</span>
              <button
                onClick={() => setShowTribesDropdown(false)}
                style={{
                  background: 'rgba(255,107,53,0.15)',
                  border: '1px solid rgba(255,107,53,0.3)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#FF6B35',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {tribeOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => toggleTribe(option.id)}
                  style={{
                    background: selectedTribes.includes(option.id) ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.05)',
                    border: selectedTribes.includes(option.id) ? '2px solid #FF6B35' : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '10px 8px',
                    color: selectedTribes.includes(option.id) ? '#FF6B35' : 'rgba(255,255,255,0.8)',
                    fontSize: '12px',
                    fontWeight: selectedTribes.includes(option.id) ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {option.label}
                  {selectedTribes.includes(option.id) && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px'
                      }}
                    >
                      <IconCheck size={10} />
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </div>
            {selectedTribes.length > 0 && (
              <button
                onClick={() => setSelectedTribes([])}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </motion.div>
        )}

        {/* Position Dropdown */}
        {showPositionDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -20, rotateX: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, rotateX: -10, scale: 0.98 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.8
            }}
            style={{
              position: 'absolute',
              top: '120px',
              left: '15px',
              right: '15px',
              background: 'rgba(5,5,5,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,107,53,0.2)',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
              zIndex: 200,
              padding: '16px',
              maxHeight: '400px',
              overflowY: 'auto',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Select Position(s)</span>
              <button 
                onClick={() => setShowPositionDropdown(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: colors.accent, 
                  fontSize: '14px', 
                  fontWeight: 600,
                  cursor: 'pointer' 
                }}
              >
                Done
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {positionOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => togglePosition(option.id)}
                  style={{
                    background: selectedPositions.includes(option.id) ? 'rgba(255,107,53,0.15)' : colors.surface,
                    border: selectedPositions.includes(option.id) ? '2px solid #FF6B35' : `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: selectedPositions.includes(option.id) ? colors.accent : colors.text,
                    fontSize: '15px',
                    fontWeight: selectedPositions.includes(option.id) ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {option.label}
                  {selectedPositions.includes(option.id) && (
                    <IconCheck size={16} />
                  )}
                </button>
              ))}
            </div>
            {selectedPositions.length > 0 && (
              <button
                onClick={() => setSelectedPositions([])}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </motion.div>
        )}
      </header>

      {showAd && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            margin: '12px 15px',
            background: 'rgba(255, 107, 53, 0.08)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: '16px',
            padding: '16px',
            position: 'relative',
            border: '1px solid rgba(255, 107, 53, 0.2)',
            overflow: 'hidden',
          }}
        >
          {/* Background shine */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '200%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
            animation: 'buttonShine 4s ease-in-out infinite',
          }} />

          <button
            onClick={() => setShowAd(false)}
            aria-label="Close promotion"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <IconClose size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.4) 0%, rgba(255, 107, 53, 0.2) 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
              }}>
                <IconCrown size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>Upgrade to Primal+</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Unlimited profiles, no ads, see who viewed you</p>
              </div>
            </div>
            <a
              href="/premium"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8a5c 100%)',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
                fontFamily: 'inherit',
              }}
            >
              Upgrade
            </a>
          </div>
        </motion.div>
      )}

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', padding: '3px' }}>
        {profiles.length === 0 ? (
          <div style={{ gridColumn: 'span 3', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', opacity: 0.3, display: 'flex', justifyContent: 'center' }}><IconEye size={48} /></div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#fff' }}>No profiles yet</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Be the first to complete your profile!</p>
            <a href="/profile/edit" style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #ff8a5c 100%)',
              color: '#fff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
            }}>
              Set Up Profile
            </a>
          </div>
        ) : (
          profiles.map((profile, index) => (
            <motion.a
              key={profile.id}
              href={'/profile/' + profile.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              style={{
                aspectRatio: '1',
                position: 'relative',
                background: '#1a1a1a',
                borderRadius: '4px',
                overflow: 'hidden',
                textDecoration: 'none',
              }}
            >
              {/* Photo */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${getProfileImage(profile, index)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />

              {/* Long Session badge - top left */}
              {profile.long_session_visible && (
                <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 2 }}>
                  <OrbitBadge size="sm" />
                </div>
              )}

              {/* Hosting badge - pulsing indicator */}
              {hostingUserIds.has(profile.id) && (
                <div style={{
                  position: 'absolute',
                  top: profile.long_session_visible ? '32px' : '6px',
                  left: '6px',
                  zIndex: 2,
                  background: 'rgba(255, 107, 53, 0.9)',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  animation: 'hostingPulse 2s ease-in-out infinite',
                  boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)'
                }}>
                  <span style={{ fontSize: '8px' }}>👥</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#fff', letterSpacing: '0.3px' }}>HOSTING</span>
                </div>
              )}

              {/* Badges container - top right */}
              <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 2, display: 'flex', gap: '4px', alignItems: 'center' }}>
                {profile.dth_active_until && new Date(profile.dth_active_until) > new Date() && (
                  <DTHBadge isActive={true} size="sm" />
                )}
                {profile.is_premium && (
                  <ProBadge size="sm" />
                )}
              </div>

              {/* Minimal overlay - just name and distance */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '16px 6px 6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime() < 5 * 60 * 1000) && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4caf50', flexShrink: 0 }} />}
                  <span style={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}>
                    {profile.display_name || 'New User'}{profile.age ? `, ${profile.age}` : ''}
                  </span>
                </div>
                {/* Distance display */}
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', marginTop: '1px' }}>
                  {formatDistance(profile.distance)}
                </div>
              </div>
            </motion.a>
          ))
        )}
      </main>

      {/* Custom DTH Floating Button with text and flame icon */}
      <motion.button
        onClick={toggleDTH}
        disabled={dthLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '15px',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: dthLoading ? 'not-allowed' : 'pointer',
          opacity: dthLoading ? 0.5 : 1,
        }}
      >
        {/* Main button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '10px 14px',
          borderRadius: '24px',
          background: dthActive
            ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(255, 140, 90, 0.9) 100%)'
            : 'rgba(30, 30, 35, 0.9)',
          border: dthActive ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: dthActive
            ? '0 6px 30px rgba(255, 107, 53, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Shine animation when active */}
          {dthActive && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              animation: 'buttonShine 2s ease-in-out infinite',
            }} />
          )}

          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: dthActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            position: 'relative',
            zIndex: 1,
          }}>
            DTH
          </span>

          {/* Flame/Drip icon */}
          <svg
            style={{
              width: '14px',
              height: '14px',
              fill: dthActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              position: 'relative',
              zIndex: 1,
              filter: dthActive ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' : 'none',
            }}
            viewBox="0 0 24 24"
          >
            {/* Flame icon */}
            <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.577 1.409-4.824 3.5-6.018C8.5 9 8.5 8 9 6c.5 2 2 4 4 5 0-2 .5-4 1-6 1 2 3 5 3 9 0 3.866-3.134 7-7 7zm0-9c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
          </svg>
        </div>

        {/* Timer display */}
        <span style={{
          fontSize: '9px',
          fontWeight: 600,
          color: dthActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.4)',
          textShadow: dthActive ? '0 0 8px rgba(255, 107, 53, 0.5)' : 'none',
        }}>
          {dthActive ? `${formatDTHTime()} left` : 'Tap to activate'}
        </span>
      </motion.button>

      </div>

      <BottomNavWithBadges />

      {/* Global Styles for animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap');

        @keyframes buttonShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        @keyframes hostingPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 10px rgba(255, 107, 53, 0.6); }
          50% { opacity: 0.8; box-shadow: 0 0 20px rgba(255, 107, 53, 0.8); }
        }

        /* Hide scrollbar */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
