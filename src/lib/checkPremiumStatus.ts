// =============================================================================
// checkPremiumStatus - Verify and sync premium subscription on sign-in
// =============================================================================

import { createClient } from '@supabase/supabase-js';

// Use service role for admin operations
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Check and update premium status for a user
 * Call this on sign-in to ensure premium status is accurate
 */
export async function checkAndSyncPremiumStatus(userId: string): Promise<{
  isPremium: boolean;
  plan: string | null;
  expiresAt: Date | null;
}> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { isPremium: false, plan: null, expiresAt: null };
  }

  try {
    // Get current profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_premium, premium_until')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return { isPremium: false, plan: null, expiresAt: null };
    }

    const now = new Date();
    const expiresAt = profile.premium_until ? new Date(profile.premium_until) : null;

    // Check if premium has expired
    if (profile.is_premium && expiresAt && expiresAt < now) {
      // Premium expired - update database
      await supabase
        .from('profiles')
        .update({
          is_premium: false,
          // Keep the plan info for records
        })
        .eq('id', userId);

      console.log(`Premium expired for user ${userId}`);
      return { isPremium: false, plan: null, expiresAt };
    }

    // Premium is still valid or user was never premium
    return {
      isPremium: profile.is_premium || false,
      plan: null,
      expiresAt,
    };
  } catch (err) {
    console.error('Error checking premium status:', err);
    return { isPremium: false, plan: null, expiresAt: null };
  }
}

/**
 * Get subscription details for display
 */
export function getSubscriptionDetails(plan: string | null, expiresAt: Date | null): {
  planName: string;
  duration: string;
  renewalDate: string;
  isAutoRenew: boolean;
} {
  const planNames: Record<string, string> = {
    week: '1 Week',
    '1month': '1 Month',
    '3months': '3 Months',
    '6months': '6 Months',
  };

  const isAutoRenew = plan !== 'week'; // Week plan doesn't auto-renew

  return {
    planName: plan ? planNames[plan] || 'Premium' : 'Free',
    duration: plan ? planNames[plan] || '' : '',
    renewalDate: expiresAt ? expiresAt.toLocaleDateString() : '',
    isAutoRenew,
  };
}
