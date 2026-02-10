/**
 * RevenueCat Webhook Endpoint
 *
 * Receives subscription lifecycle events from RevenueCat and updates
 * the Supabase database to keep premium status in sync server-side.
 *
 * RevenueCat Dashboard Setup:
 * 1. Go to Project Settings → Integrations → Webhooks
 * 2. Set URL: https://primalgay.com/api/webhooks/revenuecat
 * 3. Set Authorization header value (= REVENUECAT_WEBHOOK_SECRET env var)
 * 4. Enable events: INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/admin';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';
import {
  verifyRevenueCatWebhook,
  mapProductToPlan,
  mapEventToPremiumUpdate,
  updatePremiumStatus,
  upsertAppleSubscription,
  logWebhookEvent,
  buildPayloadSummary,
  type RevenueCatWebhookEvent,
  type AppleSubscriptionStatus,
} from '@/lib/revenuecat-webhook';

// UUID v4 validation pattern (matches Supabase auth user IDs)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // ── Rate limiting ──────────────────────────────────────────────────────
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'webhook');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000
          ).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

  // ── Verify webhook authorization ───────────────────────────────────────
  const webhookSecret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[RevenueCat Webhook] REVENUECAT_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 503, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const authHeader = request.headers.get('authorization');
  // Debug: log header info (lengths only, not values, for security)
  console.log(`[RevenueCat Webhook] Auth header present: ${!!authHeader}, length: ${authHeader?.length ?? 0}, secret length: ${webhookSecret.length}, starts with Bearer: ${authHeader?.startsWith('Bearer ') ?? false}`);
  if (!verifyRevenueCatWebhook(authHeader, webhookSecret)) {
    console.warn('[RevenueCat Webhook] Invalid authorization');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Parse the event payload ────────────────────────────────────────────
  let payload: RevenueCatWebhookEvent;
  try {
    payload = (await request.json()) as RevenueCatWebhookEvent;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const { event } = payload;
  if (!event || !event.id || !event.type) {
    return NextResponse.json(
      { error: 'Invalid event payload' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  console.log(
    `[RevenueCat Webhook] Received ${event.type} for user ${event.app_user_id} ` +
    `(product: ${event.product_id}, txn: ${event.original_transaction_id})`
  );

  // ── Initialize Supabase admin client ───────────────────────────────────
  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error('[RevenueCat Webhook] Failed to initialize Supabase admin:', err);
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Idempotency check ─────────────────────────────────────────────────
  // Log the event first — if it's a duplicate, skip processing
  const logResult = await logWebhookEvent(supabaseAdmin, {
    eventId: event.id,
    eventType: event.type,
    originalTransactionId: event.original_transaction_id || null,
    userId: UUID_REGEX.test(event.app_user_id) ? event.app_user_id : null,
    payloadSummary: buildPayloadSummary(event),
    processedSuccessfully: false, // Will update after processing
    errorMessage: null,
  });

  if (logResult.isDuplicate) {
    console.log(`[RevenueCat Webhook] Duplicate event ${event.id}, skipping`);
    return NextResponse.json(
      { status: 'ok', message: 'duplicate event' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Resolve user ID ────────────────────────────────────────────────────
  // RevenueCat app_user_id is set to the Supabase UUID via loginRevenueCat()
  const userId = event.app_user_id;

  if (!UUID_REGEX.test(userId)) {
    console.warn(
      `[RevenueCat Webhook] app_user_id "${userId}" is not a valid UUID. ` +
      'This may be a RevenueCat anonymous ID. Skipping profile update.'
    );

    // Skip subscription upsert — user_id is NOT NULL with a foreign key constraint,
    // so we can't store a record without a valid user mapping. The event is still
    // logged in apple_notification_log for debugging.

    // Update log as processed (but with warning)
    await updateLogEntry(supabaseAdmin, event.id, true, 'Non-UUID app_user_id, skipped profile update');

    return NextResponse.json(
      { status: 'ok', message: 'non-uuid user, logged only' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Handle TRANSFER events specially ───────────────────────────────────
  if (event.type === 'TRANSFER') {
    // Transfer moves subscription from one user to another
    // transferred_from[] and transferred_to[] contain user IDs
    const toUsers = event.transferred_to || [];
    const fromUsers = event.transferred_from || [];

    console.log(
      `[RevenueCat Webhook] TRANSFER from [${fromUsers.join(', ')}] to [${toUsers.join(', ')}]`
    );

    // Revoke premium from old users
    for (const fromUser of fromUsers) {
      if (UUID_REGEX.test(fromUser)) {
        await updatePremiumStatus(supabaseAdmin, fromUser, {
          isPremium: false,
          expiresAt: null,
          plan: null,
          subscriptionStatus: 'expired',
        });
      }
    }

    // Grant premium to new users
    const plan = mapProductToPlan(event.product_id);
    for (const toUser of toUsers) {
      if (UUID_REGEX.test(toUser)) {
        await updatePremiumStatus(supabaseAdmin, toUser, {
          isPremium: true,
          expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
          plan,
          subscriptionStatus: 'active',
        });
      }
    }

    await updateLogEntry(supabaseAdmin, event.id, true, null);
    return NextResponse.json(
      { status: 'ok' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Handle TEST events ─────────────────────────────────────────────────
  if (event.type === 'TEST') {
    console.log('[RevenueCat Webhook] Test event received successfully');
    await updateLogEntry(supabaseAdmin, event.id, true, null);
    return NextResponse.json(
      { status: 'ok', message: 'test event received' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Process subscription event ─────────────────────────────────────────
  const premiumUpdate = mapEventToPremiumUpdate(event);

  // Upsert the apple_subscriptions record
  if (event.original_transaction_id) {
    const subStatus: AppleSubscriptionStatus = premiumUpdate
      ? premiumUpdate.subscriptionStatus
      : 'active'; // Default for events that don't change status

    await upsertAppleSubscription(supabaseAdmin, {
      userId,
      originalTransactionId: event.original_transaction_id,
      productId: event.product_id,
      status: subStatus,
      expiresAt: event.expiration_at_ms ? new Date(event.expiration_at_ms) : null,
      environment: event.environment,
      lastEventType: event.type,
    });
  }

  // Update the profiles table if this event changes premium status
  if (premiumUpdate) {
    const result = await updatePremiumStatus(supabaseAdmin, userId, premiumUpdate);

    if (!result.success) {
      await updateLogEntry(supabaseAdmin, event.id, false, result.error || 'Profile update failed');
      console.error(`[RevenueCat Webhook] Failed to update premium for ${userId}:`, result.error);

      // Still return 200 so RevenueCat doesn't retry
      // The error is logged and can be investigated
      return NextResponse.json(
        { status: 'ok', warning: 'profile update failed' },
        { headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    console.log(
      `[RevenueCat Webhook] Updated ${userId}: ` +
      `premium=${premiumUpdate.isPremium}, plan=${premiumUpdate.plan}, ` +
      `expires=${premiumUpdate.expiresAt?.toISOString() ?? 'null'}`
    );
  } else {
    console.log(`[RevenueCat Webhook] Event ${event.type} — no profile update needed`);
  }

  // ── Mark event as processed ────────────────────────────────────────────
  await updateLogEntry(supabaseAdmin, event.id, true, null);

  return NextResponse.json(
    { status: 'ok' },
    { headers: rateLimitHeaders(rateLimitResult) }
  );
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Update the notification log entry after processing
 */
async function updateLogEntry(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  eventId: string,
  success: boolean,
  errorMessage: string | null
): Promise<void> {
  try {
    await supabaseAdmin
      .from('apple_notification_log')
      .update({
        processed_successfully: success,
        error_message: errorMessage,
      })
      .eq('event_id', eventId);
  } catch (err) {
    console.error('[RevenueCat Webhook] Failed to update log entry:', err);
  }
}
