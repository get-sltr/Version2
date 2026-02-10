/**
 * RevenueCat Webhook Helpers
 *
 * Server-side utilities for processing RevenueCat webhook events.
 * Handles verification, event parsing, and Supabase premium status updates.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES
// =============================================================================

/** RevenueCat webhook event types */
export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'CANCELLATION'
  | 'UNCANCELLATION'
  | 'BILLING_ISSUE'
  | 'PRODUCT_CHANGE'
  | 'EXPIRATION'
  | 'SUBSCRIBER_ALIAS'
  | 'TRANSFER'
  | 'TEST';

/** RevenueCat store types */
export type RevenueCatStore =
  | 'APP_STORE'
  | 'PLAY_STORE'
  | 'STRIPE'
  | 'MAC_APP_STORE'
  | 'PROMOTIONAL'
  | 'AMAZON';

/** Environment types */
export type RevenueCatEnvironment = 'PRODUCTION' | 'SANDBOX';

/** The subscriber info nested in the event */
export interface RevenueCatSubscriberInfo {
  original_app_user_id: string;
  aliases: string[];
  first_seen: string;
  non_subscriptions: Record<string, unknown>;
  subscriptions: Record<string, {
    auto_resume_date: string | null;
    billing_issues_detected_at: string | null;
    expires_date: string | null;
    grace_period_expires_date: string | null;
    is_sandbox: boolean;
    original_purchase_date: string;
    ownership_type: string;
    period_type: string;
    purchase_date: string;
    refunded_at: string | null;
    store: RevenueCatStore;
    unsubscribe_detected_at: string | null;
  }>;
  entitlements: Record<string, {
    expires_date: string | null;
    grace_period_expires_date: string | null;
    product_identifier: string;
    purchase_date: string;
  }>;
}

/** The main event payload from RevenueCat webhook */
export interface RevenueCatWebhookEvent {
  api_version: string;
  event: {
    /** Unique event ID — use for idempotency */
    id: string;
    type: RevenueCatEventType;
    /** The Supabase user_id (set via loginRevenueCat) */
    app_user_id: string;
    original_app_user_id: string;
    aliases: string[];
    /** Apple product identifier, e.g. com.sltrdigital.primal.monthly */
    product_id: string;
    /** ISO 8601 timestamp of when the entitlement was purchased */
    purchased_at_ms: number;
    /** ISO 8601 timestamp of expiration */
    expiration_at_ms: number | null;
    /** Environment */
    environment: RevenueCatEnvironment;
    /** Store */
    store: RevenueCatStore;
    /** Apple's original transaction ID */
    original_transaction_id: string;
    /** Whether this is a trial conversion */
    is_trial_conversion: boolean | null;
    /** Cancellation/expiration reason */
    cancel_reason: string | null;
    /** Expiration reason */
    expiration_reason: string | null;
    /** New product ID for PRODUCT_CHANGE events */
    new_product_id: string | null;
    /** Price in USD */
    price: number | null;
    /** Currency */
    currency: string | null;
    /** The entitlement IDs affected */
    entitlement_ids: string[] | null;
    /** Presented offering ID */
    presented_offering_id: string | null;
    /** Period type: NORMAL, TRIAL, INTRO */
    period_type: string | null;
    /** Subscriber info */
    subscriber_info?: RevenueCatSubscriberInfo;
    /** Transfer details (for TRANSFER events) */
    transferred_from: string[];
    transferred_to: string[];
    /** Event timestamp */
    event_timestamp_ms: number;
  };
}

/** Apple subscription status values */
export type AppleSubscriptionStatus =
  | 'active'
  | 'expired'
  | 'revoked'
  | 'grace_period'
  | 'billing_retry'
  | 'refunded';

// =============================================================================
// PRODUCT ID → PLAN MAPPING
// =============================================================================

/** Maps Apple product identifiers to internal plan names */
const PRODUCT_PLAN_MAP: Record<string, string> = {
  'com.sltrdigital.primal.weekly': 'week',
  'com.sltrdigital.primal.monthly': '1month',
  'com.sltrdigital.primal.3months': '3months',
  'com.sltrdigital.primal.6months': '6months',
};

/**
 * Map an Apple product ID to our internal plan name
 */
export function mapProductToPlan(productId: string): string | null {
  return PRODUCT_PLAN_MAP[productId] ?? null;
}

// =============================================================================
// WEBHOOK AUTH VERIFICATION
// =============================================================================

// =============================================================================
// EVENT PROCESSING
// =============================================================================

/** Result of mapping a RevenueCat event to a premium status change */
export interface PremiumStatusUpdate {
  isPremium: boolean;
  expiresAt: Date | null;
  plan: string | null;
  subscriptionStatus: AppleSubscriptionStatus;
}

/**
 * Determine the premium status update based on a RevenueCat event type.
 * Returns null if the event doesn't require a profiles table update.
 */
export function mapEventToPremiumUpdate(
  event: RevenueCatWebhookEvent['event']
): PremiumStatusUpdate | null {
  const plan = mapProductToPlan(event.product_id);
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms)
    : null;

  switch (event.type) {
    case 'INITIAL_PURCHASE':
      return {
        isPremium: true,
        expiresAt,
        plan,
        subscriptionStatus: 'active',
      };

    case 'RENEWAL':
      return {
        isPremium: true,
        expiresAt,
        plan,
        subscriptionStatus: 'active',
      };

    case 'PRODUCT_CHANGE': {
      const newPlan = event.new_product_id
        ? mapProductToPlan(event.new_product_id)
        : plan;
      return {
        isPremium: true,
        expiresAt,
        plan: newPlan,
        subscriptionStatus: 'active',
      };
    }

    case 'BILLING_ISSUE':
      return {
        isPremium: true, // Keep premium during billing retry
        expiresAt,
        plan,
        subscriptionStatus: 'billing_retry',
      };

    case 'EXPIRATION':
      return {
        isPremium: false,
        expiresAt,
        plan,
        subscriptionStatus: 'expired',
      };

    case 'CANCELLATION':
      // User cancelled but still has access until period ends
      // Don't change is_premium — it will expire naturally
      return null;

    case 'UNCANCELLATION':
      // User re-enabled auto-renew, no status change needed
      return null;

    case 'SUBSCRIBER_ALIAS':
      // Internal RevenueCat event, no status change
      return null;

    case 'TRANSFER':
      // Handled separately in the route (needs user_id swap)
      return null;

    case 'TEST':
      // Test event, no changes
      return null;

    default:
      return null;
  }
}

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Update premium status on the profiles table.
 * Uses the service role client to bypass RLS.
 */
export async function updatePremiumStatus(
  supabaseAdmin: SupabaseClient,
  userId: string,
  update: PremiumStatusUpdate
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: update.isPremium,
        premium_until: update.expiresAt?.toISOString() ?? null,
        premium_plan: update.plan,
      })
      .eq('id', userId);

    if (error) {
      console.error('[RevenueCat Webhook] Failed to update profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[RevenueCat Webhook] Error updating profile:', message);
    return { success: false, error: message };
  }
}

/**
 * Upsert a record in the apple_subscriptions table.
 */
export async function upsertAppleSubscription(
  supabaseAdmin: SupabaseClient,
  data: {
    userId: string;
    originalTransactionId: string;
    productId: string;
    status: AppleSubscriptionStatus;
    expiresAt: Date | null;
    environment: RevenueCatEnvironment;
    lastEventType: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('apple_subscriptions')
      .upsert(
        {
          user_id: data.userId,
          original_transaction_id: data.originalTransactionId,
          product_id: data.productId,
          status: data.status,
          expires_at: data.expiresAt?.toISOString() ?? null,
          environment: data.environment === 'PRODUCTION' ? 'Production' : 'Sandbox',
          last_event_type: data.lastEventType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'original_transaction_id' }
      );

    if (error) {
      console.error('[RevenueCat Webhook] Failed to upsert subscription:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[RevenueCat Webhook] Error upserting subscription:', message);
    return { success: false, error: message };
  }
}

/**
 * Log a webhook event to the apple_notification_log table.
 * Returns false if the event was already processed (duplicate).
 */
export async function logWebhookEvent(
  supabaseAdmin: SupabaseClient,
  data: {
    eventId: string;
    eventType: string;
    originalTransactionId: string | null;
    userId: string | null;
    payloadSummary: Record<string, unknown>;
    processedSuccessfully: boolean;
    errorMessage: string | null;
  }
): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('apple_notification_log')
      .insert({
        event_id: data.eventId,
        event_type: data.eventType,
        original_transaction_id: data.originalTransactionId,
        user_id: data.userId,
        payload_summary: data.payloadSummary,
        processed_successfully: data.processedSuccessfully,
        error_message: data.errorMessage,
      });

    if (error) {
      // Check for unique constraint violation (duplicate event)
      if (error.code === '23505') {
        return { success: true, isDuplicate: true };
      }
      console.error('[RevenueCat Webhook] Failed to log event:', error);
      return { success: false, isDuplicate: false, error: error.message };
    }

    return { success: true, isDuplicate: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[RevenueCat Webhook] Error logging event:', message);
    return { success: false, isDuplicate: false, error: message };
  }
}

/**
 * Build a safe summary of the event for logging.
 * Excludes sensitive data, keeps only what's needed for debugging.
 */
export function buildPayloadSummary(
  event: RevenueCatWebhookEvent['event']
): Record<string, unknown> {
  return {
    type: event.type,
    product_id: event.product_id,
    store: event.store,
    environment: event.environment,
    expiration_at_ms: event.expiration_at_ms,
    is_trial_conversion: event.is_trial_conversion,
    cancel_reason: event.cancel_reason,
    expiration_reason: event.expiration_reason,
    new_product_id: event.new_product_id,
    period_type: event.period_type,
    price: event.price,
    currency: event.currency,
    entitlement_ids: event.entitlement_ids,
  };
}
