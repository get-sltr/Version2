/**
 * CCBill Webhook Endpoint
 *
 * Receives subscription lifecycle events from CCBill and updates
 * Supabase to keep premium status in sync server-side.
 *
 * Security: Rate-limited + digest verification + idempotent.
 *
 * CCBill Setup:
 * 1. Set webhook URL: https://primalgay.com/api/webhooks/ccbill
 * 2. Configure webhook secret (CCBILL_WEBHOOK_SALT env var)
 * 3. Pass Supabase user UUID in the X-userId custom field
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/admin';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';
import {
  verifyCCBillDigest,
  mapEventToPremiumUpdate,
  updatePremiumStatus,
  logWebhookEvent,
  buildPayloadSummary,
  type CCBillWebhookPayload,
} from '@/lib/ccbill-webhook';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  // Rate limiting
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

  // Parse form-encoded body (CCBill sends application/x-www-form-urlencoded)
  let payload: CCBillWebhookPayload;
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      payload = Object.fromEntries(formData.entries()) as unknown as CCBillWebhookPayload;
    } else {
      payload = (await request.json()) as CCBillWebhookPayload;
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  if (!payload.eventType) {
    return NextResponse.json(
      { error: 'Missing eventType' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Verify webhook digest
  const salt = process.env.CCBILL_WEBHOOK_SALT;
  if (salt && payload.subscriptionId) {
    if (!verifyCCBillDigest(payload, salt)) {
      console.error('[CCBill Webhook] Digest verification failed');
      return NextResponse.json(
        { error: 'Invalid digest' },
        { status: 403, headers: rateLimitHeaders(rateLimitResult) }
      );
    }
  }

  const eventId = `${payload.eventType}-${payload.transactionId || payload.subscriptionId || Date.now()}`;
  const userId = payload['X-userId'] || '';

  console.log(
    `[CCBill Webhook] Received ${payload.eventType} for user ${userId} ` +
    `(sub: ${payload.subscriptionId}, txn: ${payload.transactionId})`
  );

  // Init Supabase admin
  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error('[CCBill Webhook] Failed to initialize Supabase admin:', err);
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Idempotency check
  const logResult = await logWebhookEvent(supabaseAdmin, {
    eventId,
    eventType: payload.eventType,
    subscriptionId: payload.subscriptionId || null,
    userId: UUID_REGEX.test(userId) ? userId : null,
    payloadSummary: buildPayloadSummary(payload),
    processedSuccessfully: false,
    errorMessage: null,
  });

  if (logResult.isDuplicate) {
    console.log(`[CCBill Webhook] Duplicate event ${eventId}, skipping`);
    return NextResponse.json(
      { status: 'ok', message: 'duplicate event' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate user ID
  if (!UUID_REGEX.test(userId)) {
    console.warn(`[CCBill Webhook] X-userId "${userId}" is not a valid UUID, skipping`);
    await updateLogEntry(supabaseAdmin, eventId, true, 'Non-UUID userId, skipped profile update');
    return NextResponse.json(
      { status: 'ok', message: 'no valid user ID' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Process subscription event
  const premiumUpdate = mapEventToPremiumUpdate(payload);

  if (premiumUpdate) {
    const result = await updatePremiumStatus(supabaseAdmin, userId, premiumUpdate);

    if (!result.success) {
      await updateLogEntry(supabaseAdmin, eventId, false, result.error || 'Profile update failed');
      console.error(`[CCBill Webhook] Failed to update premium for ${userId}:`, result.error);
      return NextResponse.json(
        { status: 'ok', warning: 'profile update failed' },
        { headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    console.log(
      `[CCBill Webhook] Updated ${userId}: ` +
      `premium=${premiumUpdate.isPremium}, plan=${premiumUpdate.plan}`
    );
  } else {
    console.log(`[CCBill Webhook] Event ${payload.eventType} — no profile update needed`);
  }

  await updateLogEntry(supabaseAdmin, eventId, true, null);
  return NextResponse.json(
    { status: 'ok' },
    { headers: rateLimitHeaders(rateLimitResult) }
  );
}

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
    console.error('[CCBill Webhook] Failed to update log entry:', err);
  }
}
