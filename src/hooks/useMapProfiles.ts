// =============================================================================
// useMapProfiles - Fetch and filter profiles for map display
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Fetch raw profiles from Supabase
  const fetchProfiles = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // Consider "online" if last_seen within last 5 minutes
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, age, position, photo_url, lat, lng, last_seen, is_incognito')
        .gte('last_seen', fiveMinutesAgo.toISOString())
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

      setRawProfiles(data ?? []);
    } catch (err) {
      console.error('Error fetching map profiles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRawProfiles([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Initial fetch and real-time subscription
  useEffect(() => {
    if (!enabled) return;

    fetchProfiles();

    const channel = supabase
      .channel('public:profiles-map')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchProfiles)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enabled, fetchProfiles]);

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

        return {
          id: profile.id,
          name: profile.display_name || 'New User',
          age: profile.age ?? null,
          position: profile.position || '',
          lat,
          lng,
          image: profile.photo_url,
          distance: distanceFeet,
          online: true, // All profiles returned are online (filtered by last_seen within 5 mins)
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
