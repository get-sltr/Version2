import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe lazily to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-12-15.clover',
  });
}

function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

// Plan duration in days
const PLAN_DURATIONS: Record<string, number> = {
  week: 7,
  '1month': 30,
  '3months': 90,
  '6months': 180,
};

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const supabase = getSupabase();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, plan } = session.metadata || {};

        if (userId && plan) {
          const durationDays = PLAN_DURATIONS[plan] || 30;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + durationDays);

          // Update user's premium status
          await supabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_until: expiresAt.toISOString(),
            })
            .eq('id', userId);

          console.log(`Premium activated for user ${userId}, plan: ${plan}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        // Get userId from subscription metadata (set during checkout)
        const userId = subscription.metadata?.userId;

        if (userId) {
          const isActive = subscription.status === 'active';
          // Get the end date from the subscription items
          const periodEnd = subscription.items?.data?.[0]?.current_period_end;

          await supabase
            .from('profiles')
            .update({
              is_premium: isActive,
              premium_until: isActive && periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : null,
            })
            .eq('id', userId);

          console.log(`Subscription updated for user ${userId}, active: ${isActive}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Get userId from subscription metadata (set during checkout)
        const userId = subscription.metadata?.userId;

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              is_premium: false,
              premium_until: null,
            })
            .eq('id', userId);

          console.log(`Premium cancelled for user ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        // Get userId from invoice metadata or subscription metadata
        const userId = (invoice.subscription_details as any)?.metadata?.userId;

        if (userId) {
          console.log(`Payment failed for user ${userId}`);
          // Optionally send notification or email to user
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
