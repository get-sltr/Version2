import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Price IDs from Stripe Dashboard - UPDATE THESE after creating products in Stripe
const PRICE_IDS: Record<string, string> = {
  week: process.env.STRIPE_PRICE_WEEK || 'price_1SfFfd3Au54W8cq8U0OdFUmo',
  '1month': process.env.STRIPE_PRICE_1MONTH || 'price_1SfFhM3Au54W8cq8P6aYPkoB',
  '3months': process.env.STRIPE_PRICE_3MONTHS || 'price_1SfFk33Au54W8cq8OZLMJQ0p',
  '6months': process.env.STRIPE_PRICE_6MONTHS || 'price_1SfFlK3Au54W8cq8vOkI7X0h',
};

// Valid plan names for validation
const VALID_PLANS = ['week', '1month', '3months', '6months'] as const;
type ValidPlan = typeof VALID_PLANS[number];

function isValidPlan(plan: unknown): plan is ValidPlan {
  return typeof plan === 'string' && VALID_PLANS.includes(plan as ValidPlan);
}

export async function POST(request: NextRequest) {
  // Rate limiting - prevent checkout abuse
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'api');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

  // Authentication - verify user session
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in to continue.' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const { plan } = body;

    // Validate plan
    if (!isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const stripe = getStripe();
    const supabaseAdmin = getSupabaseAdmin();

    // Get user email from Supabase using authenticated user's ID (not client-provided)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    // Create Stripe checkout session with verified user ID
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: plan === 'week' ? 'payment' : 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      customer_email: profile?.email || user.email,
      metadata: {
        userId: user.id, // Use verified user ID from session, not client input
        plan,
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json(
      { sessionId: session.id, url: session.url },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }
}
