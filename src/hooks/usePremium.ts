// =============================================================================
// usePremium - Check user's premium subscription status
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: Date | null;
  isLoading: boolean;
  error: string | null;
  // Refresh function
  refresh: () => Promise<void>;
}

export function usePremium(): PremiumStatus {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPremiumStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      // Get profile with premium status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_premium, premium_until')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching premium status:', profileError);
        setError('Failed to check subscription status');
        setIsPremium(false);
        setIsLoading(false);
        return;
      }

      // Check if premium is still valid
      const now = new Date();
      const premiumExpiry = profile.premium_until ? new Date(profile.premium_until) : null;
      const isCurrentlyPremium = profile.is_premium && (!premiumExpiry || premiumExpiry > now);

      setIsPremium(isCurrentlyPremium);
      setPremiumUntil(premiumExpiry);

    } catch (err) {
      console.error('Premium check error:', err);
      setError('Failed to verify subscription');
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  return {
    isPremium,
    premiumUntil,
    isLoading,
    error,
    refresh: checkPremiumStatus
  };
}

// Check if a specific feature is available
export function canAccessFeature(isPremium: boolean, feature:
  'video_call' |
  'viewed_me' |
  'incognito' |
  'travel_mode' |
  'pulse' |
  'map_posting' |
  'read_receipts' |
  'unlimited_messages' |
  'unlimited_filters'
): boolean {
  // These features are premium-only
  const premiumOnlyFeatures = [
    'video_call',
    'viewed_me',
    'incognito',
    'travel_mode',
    'pulse',
    'map_posting',
    'read_receipts',
    'unlimited_messages',
    'unlimited_filters'
  ];

  if (premiumOnlyFeatures.includes(feature)) {
    return isPremium;
  }

  return true;
}
