import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseServerClient } from '@/lib/supabaseServer'
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit'

/* -------------------------------------------------------------------------- */
/*                               CONFIG & TYPES                               */
/* -------------------------------------------------------------------------- */

const STRIPE_API_VERSION = '2024-12-18.acacia' as Stripe.LatestApiVersion

const VALID_PLANS = ['week', '1month', '3months', '6months'] as const
type Plan = (typeof VALID_PLANS)[number]

const SUBSCRIPTION_PLANS: ReadonlySet<Plan> = new Set<Plan>([
  '1month',
  '3months',
  '6months',
])

interface CheckoutRequestBody {
  plan: Plan
}

interface Env {
  STRIPE_SECRET_KEY: string
  SUPABASE_URL: string
  SUPABASE_SERVICE_ROLE_KEY: string
  APP_URL: string
  PRICE_IDS: Record<Plan, string>
}

/* -------------------------------------------------------------------------- */
/*                          RUNTIME ENV LOADER                                */
/* -------------------------------------------------------------------------- */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

let cachedEnv: Env | null = null

function loadEnv(): Env {
  // Cache to avoid repeated lookups within same request
  if (cachedEnv) return cachedEnv

  cachedEnv = {
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    APP_URL: requireEnv('NEXT_PUBLIC_APP_URL'),
    PRICE_IDS: {
      week: requireEnv('STRIPE_PRICE_WEEK'),
      '1month': requireEnv('STRIPE_PRICE_1MONTH'),
      '3months': requireEnv('STRIPE_PRICE_3MONTHS'),
      '6months': requireEnv('STRIPE_PRICE_6MONTHS'),
    },
  }

  return cachedEnv
}

/* -------------------------------------------------------------------------- */
/*                             SERVICE FACTORIES                               */
/* -------------------------------------------------------------------------- */

function createStripeClient(env: Env): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: STRIPE_API_VERSION,
  })
}

function createSupabaseAdmin(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

/* -------------------------------------------------------------------------- */
/*                               VALIDATION                                    */
/* -------------------------------------------------------------------------- */

function isValidPlan(value: unknown): value is Plan {
  return typeof value === 'string' && VALID_PLANS.includes(value as Plan)
}

function parseRequestBody(body: unknown): CheckoutRequestBody {
  if (
    typeof body !== 'object' ||
    body === null ||
    !isValidPlan((body as Record<string, unknown>).plan)
  ) {
    throw new Error('Invalid request body')
  }

  return { plan: (body as Record<string, unknown>).plan as Plan }
}

/* -------------------------------------------------------------------------- */
/*                           DATA ACCESS LAYER                                 */
/* -------------------------------------------------------------------------- */

async function resolveCustomerEmail(
  supabaseAdmin: ReturnType<typeof createSupabaseAdmin>,
  userId: string,
  fallbackEmail?: string
): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Profile fetch error:', error)
    throw new Error('Failed to fetch user profile')
  }

  const email = data?.email ?? fallbackEmail

  if (!email) {
    throw new Error('Customer email unavailable')
  }

  return email
}

/* -------------------------------------------------------------------------- */
/*                             STRIPE LOGIC                                    */
/* -------------------------------------------------------------------------- */

function buildCheckoutSessionParams(
  env: Env,
  plan: Plan,
  userId: string,
  customerEmail: string
): Stripe.Checkout.SessionCreateParams {
  const isSubscription = SUBSCRIPTION_PLANS.has(plan)

  return {
    mode: isSubscription ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: env.PRICE_IDS[plan],
        quantity: 1,
      },
    ],
    success_url: `${env.APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.APP_URL}/premium`,
    customer_email: customerEmail,
    allow_promotion_codes: true,
    metadata: {
      userId,
      plan,
    },
  }
}

/* -------------------------------------------------------------------------- */
/*                                HANDLER                                     */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  console.log('ENV CHECK:', {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    allKeys: Object.keys(process.env).filter(k => k.includes('APP_URL') || k.includes('STRIPE'))
  });

  /* ------------------------------ Rate Limit ------------------------------ */
  const clientId = getClientIdentifier(request)
  const rateLimit = await checkUpstashRateLimit(clientId, 'api')

  if (!rateLimit.success) {
    const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000)

    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          ...rateLimitHeaders(rateLimit),
        },
      }
    )
  }

  try {
    /* --------------------------- Load Env -------------------------------- */
    const env = loadEnv()

    /* ------------------------------- Auth -------------------------------- */
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: rateLimitHeaders(rateLimit) }
      )
    }

    /* --------------------------- Request Body ---------------------------- */
    let body: CheckoutRequestBody
    try {
      body = parseRequestBody(await request.json())
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400, headers: rateLimitHeaders(rateLimit) }
      )
    }

    /* ------------------------- Resolve Services -------------------------- */
    const stripe = createStripeClient(env)
    const supabaseAdmin = createSupabaseAdmin(env)

    /* ------------------------ Resolve Customer --------------------------- */
    const customerEmail = await resolveCustomerEmail(
      supabaseAdmin,
      user.id,
      user.email
    )

    /* ----------------------- Create Checkout ----------------------------- */
    const sessionParams = buildCheckoutSessionParams(
      env,
      body.plan,
      user.id,
      customerEmail
    )

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json(
      { sessionId: session.id, url: session.url },
      { headers: rateLimitHeaders(rateLimit) }
    )
  } catch (error) {
    console.error('Checkout error:', error)

    return NextResponse.json(
      { error: 'Unable to process payment. Please try again later.' },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    )
  }
}
