// =============================================================================
// useMapVenues - Fetch nearby bars/venues from Foursquare via API route
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import type { Coordinates } from '@/types/map';

interface MapVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: string;
  categoryIcon?: string;
  distance?: number;
  rating?: number;
  isOpen?: boolean;
  photoUrl?: string;
}

interface UseMapVenuesOptions {
  mapCenter: Coordinates | null;
  enabled?: boolean;
  radius?: number; // in meters
}

interface UseMapVenuesReturn {
  venues: MapVenue[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMapVenues(options: UseMapVenuesOptions): UseMapVenuesReturn {
  const { mapCenter, enabled = true, radius = 8000 } = options;

  const [venues, setVenues] = useState<MapVenue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVenues = useCallback(async () => {
    if (!enabled || !mapCenter) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/venues?lat=${mapCenter.lat}&lng=${mapCenter.lng}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      const data = await response.json();
      setVenues(data.venues || []);

      if (data.error) {
        console.warn('Venues API warning:', data.error);
      }
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load venues');
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, mapCenter, radius]);

  // Fetch when center changes significantly (more than ~500m)
  useEffect(() => {
    if (!mapCenter) return;
    fetchVenues();
  }, [
    enabled,
    // Only refetch if center moved significantly
    mapCenter ? Math.round(mapCenter.lat * 100) / 100 : null,
    mapCenter ? Math.round(mapCenter.lng * 100) / 100 : null,
    radius,
  ]);

  return {
    venues,
    isLoading,
    error,
    refetch: fetchVenues,
  };
}
