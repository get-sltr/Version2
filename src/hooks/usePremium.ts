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
  // Free tier limits
  messagesRemaining: number;
  filtersRemaining: number;
  // Refresh function
  refresh: () => Promise<void>;
}

// Free tier limits
const FREE_MESSAGE_LIMIT = 5;
const FREE_FILTER_LIMIT = 1;

export function usePremium(): PremiumStatus {
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState(FREE_MESSAGE_LIMIT);
  const [filtersRemaining, setFiltersRemaining] = useState(FREE_FILTER_LIMIT);

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
        .select('is_premium, premium_expires_at, messages_sent_today, filters_used_today, last_activity_date')
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
      const premiumExpiry = profile.premium_expires_at ? new Date(profile.premium_expires_at) : null;
      const isCurrentlyPremium = profile.is_premium && premiumExpiry && premiumExpiry > now;

      setIsPremium(isCurrentlyPremium);
      setPremiumUntil(premiumExpiry);

      // Calculate remaining limits for free users
      if (!isCurrentlyPremium) {
        // Reset daily limits if it's a new day
        const lastActivity = profile.last_activity_date ? new Date(profile.last_activity_date) : null;
        const isNewDay = !lastActivity || lastActivity.toDateString() !== now.toDateString();

        if (isNewDay) {
          // Reset counters for new day
          setMessagesRemaining(FREE_MESSAGE_LIMIT);
          setFiltersRemaining(FREE_FILTER_LIMIT);

          // Update the database
          await supabase
            .from('profiles')
            .update({
              messages_sent_today: 0,
              filters_used_today: 0,
              last_activity_date: now.toISOString()
            })
            .eq('id', user.id);
        } else {
          setMessagesRemaining(Math.max(0, FREE_MESSAGE_LIMIT - (profile.messages_sent_today || 0)));
          setFiltersRemaining(Math.max(0, FREE_FILTER_LIMIT - (profile.filters_used_today || 0)));
        }
      } else {
        // Premium users have unlimited
        setMessagesRemaining(Infinity);
        setFiltersRemaining(Infinity);
      }
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
    messagesRemaining,
    filtersRemaining,
    refresh: checkPremiumStatus
  };
}

// Utility to decrement message count for free users
export async function useMessage(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, premium_expires_at, messages_sent_today')
    .eq('id', user.id)
    .single();

  if (!profile) return false;

  // Premium users always allowed
  const premiumExpiry = profile.premium_expires_at ? new Date(profile.premium_expires_at) : null;
  if (profile.is_premium && premiumExpiry && premiumExpiry > new Date()) {
    return true;
  }

  // Check free tier limit
  const messagesSent = profile.messages_sent_today || 0;
  if (messagesSent >= FREE_MESSAGE_LIMIT) {
    return false;
  }

  // Increment counter
  await supabase
    .from('profiles')
    .update({ messages_sent_today: messagesSent + 1 })
    .eq('id', user.id);

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
