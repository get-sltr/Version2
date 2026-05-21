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
  // All features are free while we grow the userbase.
  // When paid tiers return, restore the Supabase lookup below.
  return {
    isPremium: true,
    premiumUntil: null,
    isLoading: false,
    error: null,
    messagesRemaining: Infinity,
    platform: typeof window !== 'undefined'
      ? (navigator.userAgent.toLowerCase().includes('android') ? 'android'
        : (navigator.userAgent.toLowerCase().includes('iphone') || navigator.userAgent.toLowerCase().includes('ipad')) ? 'ios'
        : 'web')
      : 'web',
    refresh: async () => {},
  };
}

export async function useMessage(): Promise<boolean> {
  return true;
}

export function canAccessFeature(_isPremium: boolean, _feature:
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
  // All features free while we grow the userbase
  return true;
}
