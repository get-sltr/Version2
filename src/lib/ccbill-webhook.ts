/**
 * CCBill Webhook Helpers
 *
 * Handles CCBill subscription lifecycle events (NewSaleSuccess,
 * RenewalSuccess, Cancellation, Expiration, etc.) and keeps Supabase
 * premium status in sync.
 *
 * CCBill sends form-encoded POST data with a digest for verification.
 * Digest = MD5(eventType + subscriptionId + salt) where salt is the
 * CCBill webhook secret configured in the sub-account.
 */

import { createHmac, createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// CCBill event types we handle
export type CCBillEventType =
  | 'NewSaleSuccess'
  | 'NewSaleFailure'
  | 'RenewalSuccess'
  | 'RenewalFailure'
  | 'Cancellation'
  | 'Expiration'
  | 'ChargebackIssued'
  | 'ChargebackReversal'
  | 'Void'
  | 'Refund'
  | 'BillingDateChange';

export interface CCBillWebhookPayload {
  eventType: CCBillEventType;
  subscriptionId?: string;
  transactionId?: string;
  clientAccnum?: string;
  clientSubacc?: string;
  timestamp?: string;
  dynamicPricingValidationDigest?: string;
  // Custom pass-through field: Supabase user UUID
  'X-userId'?: string;
  // Subscription details
  initialPeriod?: string;
  recurringPeriod?: string;
  initialPrice?: string;
  recurringPrice?: string;
  nextRenewalDate?: string;
  subscriptionInitialPrice?: string;
  subscriptionRecurringPrice?: string;
  billingCycleNumber?: string;
  // Cancellation/expiration
  reason?: string;
}

export interface PremiumUpdate {
  isPremium: boolean;
  expiresAt: Date | null;
  plan: string | null;
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'refunded';
}

/**
 * Verify CCBill webhook digest (MD5-based).
 * CCBill docs: digest = MD5(subscriptionId + 0/1 + salt)
 * The exact digest format depends on your CCBill sub-account config.
 */
export function verifyCCBillDigest(
  payload: CCBillWebhookPayload,
  salt: string
): boolean {
  if (!payload.dynamicPricingValidationDigest || !payload.subscriptionId) {
    return false;
  }

  const computed = createHash('md5')
    .update(payload.subscriptionId + '0' + salt)
    .digest('hex');

  if (computed === payload.dynamicPricingValidationDigest) return true;

  const alt = createHash('md5')
    .update(payload.subscriptionId + '1' + salt)
    .digest('hex');

  return alt === payload.dynamicPricingValidationDigest;
}

/**
 * Map CCBill event to premium status update
 */
export function mapEventToPremiumUpdate(
  payload: CCBillWebhookPayload
): PremiumUpdate | null {
  const { eventType, nextRenewalDate, recurringPeriod } = payload;

  const expiresAt = nextRenewalDate ? new Date(nextRenewalDate) : null;
  const plan = mapPeriodToPlan(recurringPeriod || payload.initialPeriod);

  switch (eventType) {
    case 'NewSaleSuccess':
      return { isPremium: true, expiresAt, plan, subscriptionStatus: 'active' };

    case 'RenewalSuccess':
      return { isPremium: true, expiresAt, plan, subscriptionStatus: 'active' };

    case 'Cancellation':
      // User cancelled but may still have time remaining
      return { isPremium: true, expiresAt, plan, subscriptionStatus: 'cancelled' };

    case 'Expiration':
      return { isPremium: false, expiresAt: null, plan: null, subscriptionStatus: 'expired' };

    case 'ChargebackIssued':
    case 'Refund':
    case 'Void':
      return { isPremium: false, expiresAt: null, plan: null, subscriptionStatus: 'refunded' };

    case 'ChargebackReversal':
      return { isPremium: true, expiresAt, plan, subscriptionStatus: 'active' };

    default:
      return null;
  }
}

function mapPeriodToPlan(period: string | undefined): string | null {
  if (!period) return null;
  const days = parseInt(period);
  if (isNaN(days)) return null;
  if (days <= 7) return 'week';
  if (days <= 31) return '1month';
  if (days <= 93) return '3months';
  if (days <= 186) return '6months';
  if (days <= 366) return 'yearly';
  return null;
}

/**
 * Update premium status in the profiles table
 */
export async function updatePremiumStatus(
  supabase: SupabaseClient,
  userId: string,
  update: PremiumUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_premium: update.isPremium,
        premium_until: update.expiresAt?.toISOString() ?? null,
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

/**
 * Log webhook event for idempotency and debugging
 */
export async function logWebhookEvent(
  supabase: SupabaseClient,
  entry: {
    eventId: string;
    eventType: string;
    subscriptionId: string | null;
    userId: string | null;
    payloadSummary: Record<string, unknown>;
    processedSuccessfully: boolean;
    errorMessage: string | null;
  }
): Promise<{ isDuplicate: boolean }> {
  const { data, error } = await supabase
    .from('apple_notification_log')
    .upsert(
      {
        event_id: entry.eventId,
        event_type: entry.eventType,
        original_transaction_id: entry.subscriptionId,
        user_id: entry.userId,
        payload_summary: entry.payloadSummary,
        processed_successfully: entry.processedSuccessfully,
        error_message: entry.errorMessage,
      },
      { onConflict: 'event_id', ignoreDuplicates: true }
    )
    .select('event_id');

  // If no rows returned, it was a duplicate (ignored)
  return { isDuplicate: !data || data.length === 0 };
}

export function buildPayloadSummary(
  payload: CCBillWebhookPayload
): Record<string, unknown> {
  return {
    eventType: payload.eventType,
    subscriptionId: payload.subscriptionId,
    transactionId: payload.transactionId,
    initialPrice: payload.initialPrice,
    recurringPrice: payload.recurringPrice,
    nextRenewalDate: payload.nextRenewalDate,
    reason: payload.reason,
  };
}
