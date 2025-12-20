// =============================================================================
// useCurrentUserProfile - Fetch current user's profile for "You" pin
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { CurrentUserProfile, Coordinates } from '@/types/map';

interface UseCurrentUserProfileOptions {
  onLocationLoaded?: (coords: Coordinates) => void;
}

interface UseCurrentUserProfileReturn {
  profile: CurrentUserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCurrentUserProfile(
  options: UseCurrentUserProfileOptions = {}
): UseCurrentUserProfileReturn {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, lat, lng, photo_url')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.warn('Failed to load current user profile:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (!data) {
        setProfile(null);
        return;
      }

      const image = data.photo_url || null;

      const userProfile: CurrentUserProfile = {
        id: data.id,
        name: data.display_name || 'You',
        lat: data.lat,
        lng: data.lng,
        image,
      };

      setProfile(userProfile);

      // Notify parent if user has location
      if (userProfile.lat && userProfile.lng && options.onLocationLoaded) {
        options.onLocationLoaded({
          lat: userProfile.lat,
          lng: userProfile.lng,
        });
      }
    } catch (err) {
      console.error('Error fetching current user profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [options.onLocationLoaded]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}
