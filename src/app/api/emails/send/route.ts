import { NextResponse } from 'next/server';
import PrimalNotificationEmail from '@/emails/PrimalNotificationEmail';
import { sendTransactionalEmail } from '@/lib/email';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';
import { timingSafeEqual } from 'crypto';

type SendEmailRequest = {
  to: string | string[];
  subject: string;
  headline?: string;
  message?: string;
  messageLines?: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  previewText?: string;
  footerNote?: string;
};

// Allowed email types for authenticated users (non-service-token requests)
// This restricts what types of emails regular users can trigger
type AllowedUserEmailType = 'album_share' | 'profile_share' | 'group_invite';

interface UserEmailRequest extends SendEmailRequest {
  emailType: AllowedUserEmailType;
  // For album_share: the album being shared
  // For group_invite: the group being invited to
  relatedEntityId?: string;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function validateEmailAddresses(to: string | string[]): { valid: boolean; error?: string } {
  const emails = Array.isArray(to) ? to : [to];

  if (emails.length === 0) {
    return { valid: false, error: 'At least one recipient is required' };
  }

  if (emails.length > 50) {
    return { valid: false, error: 'Maximum 50 recipients allowed' };
  }

  for (const email of emails) {
    if (!isValidEmail(email)) {
      return { valid: false, error: `Invalid email address: ${email}` };
    }
  }

  return { valid: true };
}

/**
 * Timing-safe comparison to prevent timing attacks on token validation
 */
function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still do a comparison to maintain constant time
      timingSafeEqual(bufA, bufA);
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'email');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

  // Check if email service is properly configured
  if (!process.env.EMAIL_SERVICE_TOKEN) {
    console.error('EMAIL_SERVICE_TOKEN is not configured');
    return NextResponse.json(
      { error: 'Email service is not configured' },
      { status: 503, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Authentication: Service token OR authenticated user with restrictions
  const serviceToken = request.headers.get('x-primal-email-key');
  let isServiceAuth = false;
  let authenticatedUser: { id: string; email?: string } | null = null;

  // Option 1: Service token authentication (for internal services - full access)
  if (serviceToken && secureCompare(serviceToken, process.env.EMAIL_SERVICE_TOKEN)) {
    isServiceAuth = true;
  }

  // Option 2: Authenticated user session (restricted access)
  if (!isServiceAuth) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        authenticatedUser = { id: user.id, email: user.email };
      }
    } catch {
      // Session check failed, continue to reject
    }
  }

  if (!isServiceAuth && !authenticatedUser) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const payload = (await request.json().catch(() => null)) as (SendEmailRequest & { emailType?: string }) | null;

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const { to, subject } = payload;

  if (!to || !subject) {
    return NextResponse.json(
      { error: '`to` and `subject` are required' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate email addresses
  const emailValidation = validateEmailAddresses(to);
  if (!emailValidation.valid) {
    return NextResponse.json(
      { error: emailValidation.error },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate subject length
  if (subject.length > 200) {
    return NextResponse.json(
      { error: 'Subject must be 200 characters or less' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // SECURITY: For non-service-token requests, apply strict restrictions
  if (!isServiceAuth && authenticatedUser) {
    const emails = Array.isArray(to) ? to : [to];

    // Non-service users can only send to a single recipient at a time
    if (emails.length > 1) {
      return NextResponse.json(
        { error: 'You can only send to one recipient at a time' },
        { status: 403, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // emailType is required for user-triggered emails
    const allowedTypes: AllowedUserEmailType[] = ['album_share', 'profile_share', 'group_invite'];
    if (!payload.emailType || !allowedTypes.includes(payload.emailType as AllowedUserEmailType)) {
      return NextResponse.json(
        { error: 'Invalid or missing email type for user-triggered email' },
        { status: 403, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Additional validation could verify that:
    // - The user owns the album being shared (for album_share)
    // - The user is the host of the group (for group_invite)
    // This would require additional database lookups based on relatedEntityId
  }

  const lines = Array.isArray(payload.messageLines)
    ? payload.messageLines
    : payload.message
    ? [payload.message]
    : [];

  try {
    const reactEmail = PrimalNotificationEmail({
      headline: payload.headline || subject,
      messageLines: lines,
      ctaLabel: payload.ctaLabel,
      ctaUrl: payload.ctaUrl,
      previewText: payload.previewText,
      footerNote: payload.footerNote,
    });

    const data = await sendTransactionalEmail({
      to,
      subject,
      react: reactEmail,
    });

    return NextResponse.json(
      { id: data?.id },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Failed to send email', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }
}
