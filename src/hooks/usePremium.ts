// =============================================================================
// usePremium - Check user's premium subscription status
// =============================================================================
// On web: Always returns isPremium: true (free access)
// On native: Checks RevenueCat for subscription status
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { checkEntitlement, isNativePlatform, getPlatform } from '@/lib/revenuecat';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: Date | null;
  isLoading: boolean;
  error: string | null;
  messagesRemaining: number;
  platform: 'web' | 'ios' | 'android';
  // Refresh function
  refresh: () => Promise<void>;
}

// Module-level cache so all hook instances share the same result
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedResult: {
  isPremium: boolean;
  premiumUntil: Date | null;
  platform: 'web' | 'ios' | 'android';
  timestamp: number;
} | null = null;

function getCachedResult() {
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL_MS) {
    return cachedResult;
  }
  return null;
}

export function usePremium(): PremiumStatus {
  const cached = getCachedResult();
  const [isPremium, setIsPremium] = useState(cached?.isPremium ?? false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(cached?.premiumUntil ?? null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState(Infinity);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>(cached?.platform ?? 'web');

  const checkPremiumStatus = useCallback(async (bypassCache = false) => {
    // Return cached result if available and not bypassing
    if (!bypassCache) {
      const cached = getCachedResult();
      if (cached) {
        setIsPremium(cached.isPremium);
        setPremiumUntil(cached.premiumUntil);
        setPlatform(cached.platform);
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentPlatform = getPlatform();
      setPlatform(currentPlatform);

      // Web users get free premium access
      if (!isNativePlatform()) {
        setIsPremium(true);
        setPremiumUntil(null);
        setIsLoading(false);
        cachedResult = { isPremium: true, premiumUntil: null, platform: currentPlatform, timestamp: Date.now() };
        return;
      }

      // For native platforms, check RevenueCat first
      const hasRevenueCatPremium = await checkEntitlement('primal_premium');

      if (hasRevenueCatPremium) {
        setIsPremium(true);
        setIsLoading(false);
        cachedResult = { isPremium: true, premiumUntil: null, platform: currentPlatform, timestamp: Date.now() };
        return;
      }

      // Fallback: Check Supabase database for legacy premium status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsPremium(false);
        setIsLoading(false);
        cachedResult = { isPremium: false, premiumUntil: null, platform: currentPlatform, timestamp: Date.now() };
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

      const isCurrentlyPremium = profile.is_premium === true &&
        (premiumExpiry === null || premiumExpiry > now);

      setIsPremium(isCurrentlyPremium);
      setPremiumUntil(premiumExpiry);
      cachedResult = { isPremium: isCurrentlyPremium, premiumUntil: premiumExpiry, platform: currentPlatform, timestamp: Date.now() };

    } catch (err) {
      console.error('[usePremium] Error:', err);
      setError('Failed to verify subscription');
      // On error, default to no premium on native
      setIsPremium(!isNativePlatform());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPremiumStatus();
  }, [checkPremiumStatus]);

  const refresh = useCallback(async () => {
    await checkPremiumStatus(true);
  }, [checkPremiumStatus]);

  return {
    isPremium,
    premiumUntil,
    isLoading,
    error,
    messagesRemaining,
    platform,
    refresh
  };
}

// Utility to check if user can send a message
// For now, always returns true (no daily limits enforced)
export async function useMessage(): Promise<boolean> {
  return true;
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
