/**
 * Blog Webhook Helpers
 *
 * Server-side utilities for processing blog posts received via webhook
 * from BabyLoveGrowth.ai. Handles validation, slug generation,
 * idempotency logging, and upsert operations.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES
// =============================================================================

/** Incoming webhook payload from BabyLoveGrowth.ai */
export interface BlogWebhookPayload {
  /** Post title (required) */
  title: string;
  /** HTML content (required) */
  content: string;
  /** URL slug — auto-generated from title if omitted */
  slug?: string;
  /** Short excerpt for cards and meta tags */
  excerpt?: string;
  /** SEO meta description */
  meta_description?: string;
  /** Featured image URL */
  featured_image_url?: string;
  /** Tags array */
  tags?: string[];
  /** Categories array */
  categories?: string[];
  /** Author name */
  author?: string;
  /** Post status: draft | published | archived */
  status?: 'draft' | 'published' | 'archived';
  /** Open Graph title override */
  og_title?: string;
  /** Open Graph description override */
  og_description?: string;
  /** Open Graph image override */
  og_image_url?: string;
  /** ISO 8601 publish date (defaults to now for published posts) */
  published_at?: string;
  /** Caller-provided idempotency key */
  idempotency_key?: string;
}

/** Result of an upsert operation */
export interface UpsertResult {
  success: boolean;
  postId?: string;
  slug?: string;
  error?: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Validate required fields in the webhook payload.
 * Returns null if valid, or an error message string.
 */
export function validatePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return 'Payload must be a JSON object';
  }

  const p = payload as Record<string, unknown>;

  if (!p.title || typeof p.title !== 'string' || p.title.trim().length === 0) {
    return 'Missing or empty "title" field';
  }

  if (!p.content || typeof p.content !== 'string' || p.content.trim().length === 0) {
    return 'Missing or empty "content" field';
  }

  if (p.status && !['draft', 'published', 'archived'].includes(p.status as string)) {
    return 'Invalid "status" — must be draft, published, or archived';
  }

  return null;
}

// =============================================================================
// SLUG GENERATION
// =============================================================================

/**
 * Convert a title string into a URL-safe slug.
 * Examples: "Hello World!" → "hello-world", "10 Tips & Tricks" → "10-tips-tricks"
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')           // Remove apostrophes/quotes
    .replace(/&/g, 'and')           // Replace & with 'and'
    .replace(/[^\w\s-]/g, '')       // Remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '')        // Trim leading/trailing hyphens
    .slice(0, 250);                 // Cap length for DB column
}

// =============================================================================
// IDEMPOTENCY LOGGING
// =============================================================================

/**
 * Log a blog webhook event for idempotency and debugging.
 * Returns isDuplicate: true if the event_id already exists.
 */
export async function logBlogWebhookEvent(
  supabaseAdmin: SupabaseClient,
  data: {
    eventId: string;
    eventType: string;
    slug: string | null;
    postId: string | null;
    payloadSummary: Record<string, unknown>;
    processedSuccessfully: boolean;
    errorMessage: string | null;
  }
): Promise<{ success: boolean; isDuplicate: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('blog_webhook_log')
      .insert({
        event_id: data.eventId,
        event_type: data.eventType,
        slug: data.slug,
        post_id: data.postId,
        payload_summary: data.payloadSummary,
        processed_successfully: data.processedSuccessfully,
        error_message: data.errorMessage,
      });

    if (error) {
      // Unique constraint violation = duplicate
      if (error.code === '23505') {
        return { success: true, isDuplicate: true };
      }
      console.error('[Blog Webhook] Failed to log event:', error);
      return { success: false, isDuplicate: false, error: error.message };
    }

    return { success: true, isDuplicate: false };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Blog Webhook] Error logging event:', message);
    return { success: false, isDuplicate: false, error: message };
  }
}

/**
 * Update the webhook log entry after processing.
 */
export async function updateBlogWebhookLog(
  supabaseAdmin: SupabaseClient,
  eventId: string,
  success: boolean,
  errorMessage: string | null,
  postId?: string
): Promise<void> {
  try {
    const update: Record<string, unknown> = {
      processed_successfully: success,
      error_message: errorMessage,
    };
    if (postId) update.post_id = postId;

    await supabaseAdmin
      .from('blog_webhook_log')
      .update(update)
      .eq('event_id', eventId);
  } catch (err) {
    console.error('[Blog Webhook] Failed to update log entry:', err);
  }
}

// =============================================================================
// UPSERT
// =============================================================================

/**
 * Insert or update a blog post by slug.
 * Uses the service role client to bypass RLS.
 */
export async function upsertBlogPost(
  supabaseAdmin: SupabaseClient,
  payload: BlogWebhookPayload
): Promise<UpsertResult> {
  try {
    const slug = payload.slug?.trim() || generateSlug(payload.title);
    const status = payload.status || 'draft';

    // Determine published_at
    let publishedAt: string | null = null;
    if (payload.published_at) {
      publishedAt = payload.published_at;
    } else if (status === 'published') {
      publishedAt = new Date().toISOString();
    }

    const row = {
      title: payload.title.trim(),
      slug,
      content: payload.content,
      excerpt: payload.excerpt?.trim() || null,
      meta_description: payload.meta_description?.trim() || null,
      featured_image_url: payload.featured_image_url?.trim() || null,
      tags: payload.tags || [],
      categories: payload.categories || [],
      author: payload.author?.trim() || 'Primal',
      status,
      og_title: payload.og_title?.trim() || null,
      og_description: payload.og_description?.trim() || null,
      og_image_url: payload.og_image_url?.trim() || null,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .upsert(row, { onConflict: 'slug' })
      .select('id, slug')
      .single();

    if (error) {
      console.error('[Blog Webhook] Upsert failed:', error);
      return { success: false, error: error.message };
    }

    return { success: true, postId: data.id, slug: data.slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Blog Webhook] Upsert error:', message);
    return { success: false, error: message };
  }
}

// =============================================================================
// SAFE LOGGING
// =============================================================================

/**
 * Build a safe summary of the payload for logging.
 * Omits full HTML content to keep log entries small.
 */
export function buildPayloadSummary(
  payload: BlogWebhookPayload
): Record<string, unknown> {
  return {
    title: payload.title,
    slug: payload.slug || null,
    status: payload.status || 'draft',
    author: payload.author || 'Primal',
    tags: payload.tags || [],
    categories: payload.categories || [],
    has_excerpt: !!payload.excerpt,
    has_featured_image: !!payload.featured_image_url,
    content_length: payload.content?.length || 0,
  };
}
