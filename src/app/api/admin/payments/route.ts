import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission } from '@/lib/admin';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  });
}

/**
 * GET /api/admin/payments
 * Returns payment/subscription data
 */
export async function GET(request: NextRequest) {
  // Authenticate user
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin access - payments require higher permission
  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  if (!hasPermission(user.email, 'VIEW_PAYMENTS')) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const admin = getSupabaseAdmin();

    // Get premium users with their premium details
    const offset = (page - 1) * limit;
    const { data: premiumUsers, count } = await admin
      .from('profiles')
      .select('id, email, display_name, photo_url, is_premium, premium_until, created_at', { count: 'exact' })
      .eq('is_premium', true)
      .order('premium_until', { ascending: false })
      .range(offset, offset + limit - 1);

    // Try to get Stripe data if configured
    let stripeStats = null;
    try {
      const stripe = getStripe();

      // Get balance
      const balance = await stripe.balance.retrieve();

      // Get recent charges
      const charges = await stripe.charges.list({
        limit: 10,
      });

      // Get subscription stats
      const subscriptions = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
      });

      // Calculate MRR (Monthly Recurring Revenue)
      let mrr = 0;
      subscriptions.data.forEach((sub) => {
        sub.items.data.forEach((item) => {
          if (item.price.recurring) {
            const amount = item.price.unit_amount || 0;
            const interval = item.price.recurring.interval;
            // Normalize to monthly
            if (interval === 'year') {
              mrr += amount / 12;
            } else if (interval === 'month') {
              mrr += amount;
            } else if (interval === 'week') {
              mrr += amount * 4.33;
            }
          }
        });
      });

      stripeStats = {
        balance: {
          available: balance.available.reduce((sum, b) => sum + b.amount, 0) / 100,
          pending: balance.pending.reduce((sum, b) => sum + b.amount, 0) / 100,
          currency: balance.available[0]?.currency || 'usd',
        },
        mrr: mrr / 100, // Convert from cents
        activeSubscriptions: subscriptions.data.length,
        recentCharges: charges.data.map((charge) => ({
          id: charge.id,
          amount: charge.amount / 100,
          currency: charge.currency,
          status: charge.status,
          created: new Date(charge.created * 1000).toISOString(),
          customerEmail: charge.billing_details?.email,
        })),
      };
    } catch (stripeError) {
      console.warn('Stripe data fetch failed:', stripeError);
      // Continue without Stripe data
    }

    // Revenue summary from database premium users
    const activePremiumCount = premiumUsers?.filter(u =>
      u.premium_until && new Date(u.premium_until) > new Date()
    ).length || 0;

    return NextResponse.json({
      premiumUsers: premiumUsers || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary: {
        totalPremiumUsers: count || 0,
        activePremiumUsers: activePremiumCount,
      },
      stripe: stripeStats,
    });
  } catch (error) {
    console.error('Admin payments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}
