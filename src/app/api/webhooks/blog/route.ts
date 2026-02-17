/**
 * Blog Webhook Endpoint
 *
 * Receives blog post content from BabyLoveGrowth.ai and upserts it
 * into the blog_posts table for SEO content publishing.
 *
 * Security: Rate-limited + Bearer token auth + idempotent.
 *
 * BabyLoveGrowth.ai Setup:
 * 1. Go to Integrations → Webhook → Connect
 * 2. Set URL: https://primalgay.com/api/webhooks/blog
 * 3. Auth header: Bearer <BLOG_WEBHOOK_SECRET>
 */

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/admin';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';
import {
  validatePayload,
  generateSlug,
  logBlogWebhookEvent,
  updateBlogWebhookLog,
  upsertBlogPost,
  buildPayloadSummary,
  type BlogWebhookPayload,
} from '@/lib/blog-webhook';

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

  // ── Auth: Bearer token ─────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.BLOG_WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error('[Blog Webhook] BLOG_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Parse JSON body ────────────────────────────────────────────────────
  let payload: BlogWebhookPayload;
  try {
    const rawBody = await request.json();
    console.log('[Blog Webhook] Raw payload keys:', Object.keys(rawBody));
    console.log('[Blog Webhook] Raw payload:', JSON.stringify(rawBody).slice(0, 2000));
    payload = rawBody as BlogWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Normalize BabyLoveGrowth.ai field names ─────────────────────────
  const raw = payload as Record<string, unknown>;
  // Content: content_html → content
  if (!raw.content && raw.content_html) {
    payload.content = raw.content_html as string;
  }
  // Meta description: metaDescription → meta_description
  if (!raw.meta_description && raw.metaDescription) {
    payload.meta_description = raw.metaDescription as string;
    payload.excerpt = raw.metaDescription as string;
  }
  // Featured image: heroImageUrl → featured_image_url
  if (!raw.featured_image_url && raw.heroImageUrl) {
    payload.featured_image_url = raw.heroImageUrl as string;
  }
  // Tags from keywords
  if (!raw.tags && raw.keywords) {
    const kw = raw.keywords as string;
    payload.tags = kw.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  // Default to published
  if (!raw.status) {
    payload.status = 'published';
  }

  // ── Validate payload ───────────────────────────────────────────────────
  const validationError = validatePayload(payload);
  if (validationError) {
    console.error('[Blog Webhook] Validation failed:', validationError, 'Raw keys:', Object.keys(raw));
    return NextResponse.json(
      { error: validationError },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const slug = payload.slug?.trim() || generateSlug(payload.title);
  const eventId = payload.idempotency_key || `blog:${slug}:${Date.now()}`;
  const eventType = payload.status === 'archived' ? 'archive' : 'upsert';

  console.log(
    `[Blog Webhook] Received ${eventType} for "${payload.title}" (slug: ${slug})`
  );

  // ── Initialize Supabase admin client ───────────────────────────────────
  let supabaseAdmin;
  try {
    supabaseAdmin = getSupabaseAdmin();
  } catch (err) {
    console.error('[Blog Webhook] Failed to initialize Supabase admin:', err);
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Idempotency check ─────────────────────────────────────────────────
  const logResult = await logBlogWebhookEvent(supabaseAdmin, {
    eventId,
    eventType,
    slug,
    postId: null,
    payloadSummary: buildPayloadSummary(payload),
    processedSuccessfully: false,
    errorMessage: null,
  });

  if (logResult.isDuplicate) {
    console.log(`[Blog Webhook] Duplicate event ${eventId}, skipping`);
    return NextResponse.json(
      { status: 'ok', message: 'duplicate event' },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Upsert the blog post ──────────────────────────────────────────────
  const result = await upsertBlogPost(supabaseAdmin, payload);

  if (!result.success) {
    await updateBlogWebhookLog(supabaseAdmin, eventId, false, result.error || 'Upsert failed');
    console.error(`[Blog Webhook] Failed to upsert post:`, result.error);
    return NextResponse.json(
      { error: 'Failed to save post', detail: result.error },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // ── Mark event as processed ────────────────────────────────────────────
  await updateBlogWebhookLog(supabaseAdmin, eventId, true, null, result.postId);

  // ── Revalidate blog pages instantly ──────────────────────────────────
  try {
    revalidatePath('/blog');
    revalidatePath(`/blog/${result.slug}`);
    revalidatePath('/sitemap.xml');
  } catch (err) {
    console.error('[Blog Webhook] Revalidation error:', err);
  }

  console.log(
    `[Blog Webhook] Post saved: id=${result.postId}, slug=${result.slug}`
  );

  return NextResponse.json(
    { status: 'ok', post_id: result.postId, slug: result.slug },
    { status: 200, headers: rateLimitHeaders(rateLimitResult) }
  );
}
