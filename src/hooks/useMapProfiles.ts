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
  maxDistance: 30,
};

interface UseMapProfilesOptions {
  mapCenter: Coordinates | null;
  enabled?: boolean;
}

interface UseMapProfilesReturn {
  profiles: MapProfile[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Read filter settings from localStorage
 */
function getFilterSettings(): MapFilterSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_FILTERS;
  }

  let positionFilters: string[] = [];
  const rawPositions = localStorage.getItem('showMePositions') ?? '';

  if (rawPositions) {
    try {
      positionFilters = JSON.parse(rawPositions);
    } catch {
      positionFilters = [];
    }
  }

  return {
    positionFilters,
    minAge: parseInt(localStorage.getItem('minAge') ?? '18', 10),
    maxAge: parseInt(localStorage.getItem('maxAge') ?? '80', 10),
    maxDistance: parseInt(localStorage.getItem('maxDistance') ?? '30', 10),
  };
}

export function useMapProfiles(options: UseMapProfilesOptions): UseMapProfilesReturn {
  const { mapCenter, enabled = true } = options;

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

      // Show profiles seen within last 24 hours for discovery
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, age, position, photo_url, lat, lng, last_seen, is_incognito, is_online')
        .gte('last_seen', oneDayAgo.toISOString())
        .eq('is_incognito', false)
        .not('photo_url', 'is', null)
        .not('lat', 'is', null)
        .not('lng', 'is', null)
        .limit(250);

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
      .map((profile): MapProfile | null => {
        // Parse coordinates
        const lat = parseCoordinate(profile.lat);
        const lng = parseCoordinate(profile.lng);

        if (lat === null || lng === null) return null;
        if (!profile.photo_url) return null;

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
          image: profile.photo_url,
          distance: distanceFeet,
          online: isOnline,
        };
      })
      .filter((profile): profile is MapProfile => profile !== null)
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
  }, [rawProfiles, mapCenter]);

  return {
    profiles,
    isLoading,
    error,
    refetch: fetchProfiles,
  };
}
