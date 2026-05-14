// =============================================================================
// usePremium - Check user's premium subscription status
// =============================================================================
// Checks Supabase profiles table for premium status (set by CCBill webhooks).
// Free users see gated features with lock/upgrade prompts.
// =============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface PremiumStatus {
  isPremium: boolean;
  premiumUntil: Date | null;
  isLoading: boolean;
  error: string | null;
  messagesRemaining: number;
  platform: 'web' | 'ios' | 'android';
  refresh: () => Promise<void>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const FREE_MESSAGE_LIMIT = 10;

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

function detectPlatform(): 'web' | 'ios' | 'android' {
  if (typeof window === 'undefined') return 'web';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('android')) return 'android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
  return 'web';
}

export function usePremium(): PremiumStatus {
  const cached = getCachedResult();
  const [isPremium, setIsPremium] = useState(cached?.isPremium ?? false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(cached?.premiumUntil ?? null);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState(FREE_MESSAGE_LIMIT);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>(cached?.platform ?? 'web');

  const checkPremiumStatus = useCallback(async (bypassCache = false) => {
    if (!bypassCache) {
      const cached = getCachedResult();
      if (cached) {
        setIsPremium(cached.isPremium);
        setPremiumUntil(cached.premiumUntil);
        setPlatform(cached.platform);
        setIsLoading(false);
        if (cached.isPremium) setMessagesRemaining(Infinity);
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      const currentPlatform = detectPlatform();
      setPlatform(currentPlatform);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsPremium(false);
        setMessagesRemaining(0);
        setIsLoading(false);
        cachedResult = { isPremium: false, premiumUntil: null, platform: currentPlatform, timestamp: Date.now() };
        return;
      }

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

      const now = new Date();
      const premiumExpiry = profile.premium_until ? new Date(profile.premium_until) : null;
      const isCurrentlyPremium = profile.is_premium === true &&
        (premiumExpiry === null || premiumExpiry > now);

      setIsPremium(isCurrentlyPremium);
      setPremiumUntil(premiumExpiry);
      setMessagesRemaining(isCurrentlyPremium ? Infinity : FREE_MESSAGE_LIMIT);
      cachedResult = { isPremium: isCurrentlyPremium, premiumUntil: premiumExpiry, platform: currentPlatform, timestamp: Date.now() };

    } catch (err) {
      console.error('[usePremium] Error:', err);
      setError('Failed to verify subscription');
      setIsPremium(false);
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

export async function useMessage(): Promise<boolean> {
  return true;
}

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
