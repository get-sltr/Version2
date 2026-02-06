// =============================================================================
// useMapProfiles - Fetch and filter profiles for map display
// =============================================================================

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { haversineMiles, milesToFeet, parseCoordinate } from '@/lib/geo';
import type { MapProfile, Coordinates, MapFilterSettings } from '@/types/map';

const DEFAULT_FILTERS: MapFilterSettings = {
  positionFilters: [],
  minAge: 18,
  maxAge: 80,
  maxDistance: 15, // 15 miles default radius for App Store launch
};

interface UseMapProfilesOptions {
  mapCenter: Coordinates | null;
  enabled?: boolean;
  blockedIds?: Set<string>;
}

interface UseMapProfilesReturn {
  profiles: MapProfile[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Read filter settings from localStorage
 * Uses same keys as MapFilterDrawer for consistency
 */
function getFilterSettings(): MapFilterSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_FILTERS;
  }

  let positionFilters: string[] = [];
  const rawPositions = localStorage.getItem('mapFilterPositions') ?? '';

  if (rawPositions) {
    try {
      positionFilters = JSON.parse(rawPositions);
    } catch {
      positionFilters = [];
    }
  }

  return {
    positionFilters,
    minAge: parseInt(localStorage.getItem('mapFilterAgeMin') ?? '18', 10),
    maxAge: parseInt(localStorage.getItem('mapFilterAgeMax') ?? '80', 10),
    maxDistance: parseInt(localStorage.getItem('maxDistance') ?? '50', 10), // Default 50 miles
  };
}

export function useMapProfiles(options: UseMapProfilesOptions): UseMapProfilesReturn {
  const { mapCenter, enabled = true, blockedIds } = options;

  const [rawProfiles, setRawProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent infinite loops
  const currentUserIdRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  // Get current user ID once
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      currentUserIdRef.current = user?.id ?? null;
    });
  }, []);

  // Fetch raw profiles from Supabase
  const fetchProfiles = useCallback(async () => {
    if (!enabled) return;

    // Debounce: don't fetch more than once per 5 seconds
    const now = Date.now();
    if (now - lastFetchRef.current < 5000) {
      return;
    }
    lastFetchRef.current = now;

    try {
      setIsLoading(true);
      setError(null);

      // Show profiles seen within last 7 days for discovery (more like Grindr/Sniffies)
      // This gives a better user experience with more profiles visible
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, age, position, photo_url, lat, lng, last_seen, is_incognito, is_online')
        .gte('last_seen', sevenDaysAgo.toISOString())
        .neq('is_incognito', true)  // Allow null (same as dashboard)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        // Photo not required - will use placeholder if missing
        .limit(500);

      if (fetchError) {
        console.warn('Failed to load profiles for map:', fetchError);
        setError(fetchError.message);
        setRawProfiles([]);
        return;
      }

      console.log('Map profiles loaded:', data?.length ?? 0, 'profiles');
      setRawProfiles(data ?? []);
    } catch (err) {
      console.error('Error fetching map profiles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRawProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Debounced fetch for real-time updates
  const debouncedFetch = useCallback((changedUserId?: string) => {
    // Skip if it's the current user's own update
    if (changedUserId && changedUserId === currentUserIdRef.current) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounced fetch
    debounceTimerRef.current = setTimeout(() => {
      fetchProfiles();
    }, 2000); // Wait 2 seconds before fetching
  }, [fetchProfiles]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!enabled) return;

    fetchProfiles();

    const channel = supabase
      .channel('public:profiles-map')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => debouncedFetch(payload.new?.id)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'profiles' },
        () => debouncedFetch()
      )
      // Only listen for significant updates (not location/last_seen)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          // Skip location-only updates (these happen constantly)
          const old = payload.old as any;
          const updated = payload.new as any;
          
          // Only refetch if something visible changed
          const significantChange = 
            old?.display_name !== updated?.display_name ||
            old?.photo_url !== updated?.photo_url ||
            old?.is_incognito !== updated?.is_incognito ||
            old?.position !== updated?.position ||
            old?.age !== updated?.age;
          
          if (significantChange) {
            debouncedFetch(updated?.id);
          }
        }
      )
      .subscribe();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      void supabase.removeChannel(channel);
    };
  }, [enabled, fetchProfiles, debouncedFetch]);

  // Transform and filter profiles
  const profiles = useMemo(() => {
    if (!rawProfiles.length) return [];

    const filters = getFilterSettings();
    const normalizedPositionFilters = filters.positionFilters.map((p) => p.toLowerCase());

    return rawProfiles
      .map((profile, index): MapProfile | null => {
        // Parse coordinates
        const lat = parseCoordinate(profile.lat);
        const lng = parseCoordinate(profile.lng);

        if (lat === null || lng === null) return null;

        // Use placeholder image if no photo (alternating between 5.jpg and 6.jpg)
        const image = profile.photo_url || (index % 2 === 0 ? '/images/5.jpg' : '/images/6.jpg');

        // Calculate distance if we have map center
        let distanceFeet: number | null = null;
        if (mapCenter) {
          const miles = haversineMiles(mapCenter, { lat, lng });
          distanceFeet = Number.isFinite(miles) ? milesToFeet(miles) : null;
        }

        // Consider online if last_seen within 5 minutes or is_online flag is true
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const lastSeenTime = profile.last_seen ? new Date(profile.last_seen).getTime() : 0;
        const isOnline = profile.is_online || lastSeenTime > fiveMinutesAgo;

        return {
          id: profile.id,
          name: profile.display_name || 'New User',
          age: profile.age ?? null,
          position: profile.position || '',
          lat,
          lng,
          image,
          distance: distanceFeet,
          online: isOnline,
        };
      })
      .filter((profile): profile is MapProfile => profile !== null)
      .filter((profile) => {
        // Filter out blocked users
        if (blockedIds && blockedIds.has(profile.id)) return false;
        return true;
      })
      .filter((profile) => {
        // Age filter
        if (profile.age !== null) {
          if (profile.age < filters.minAge || profile.age > filters.maxAge) {
            return false;
          }
        }

        // Position filter
        if (normalizedPositionFilters.length > 0) {
          const normalizedPosition = profile.position.toLowerCase();
          if (!normalizedPosition || !normalizedPositionFilters.includes(normalizedPosition)) {
            return false;
          }
        }

        // Distance filter
        if (mapCenter && profile.distance !== null) {
          const milesAway = profile.distance / 5280;
          if (milesAway > filters.maxDistance) {
            return false;
          }
        }

        return true;
      });
  }, [rawProfiles, mapCenter, blockedIds]);

  return {
    profiles,
    isLoading,
    error,
    refetch: fetchProfiles,
  };
}
