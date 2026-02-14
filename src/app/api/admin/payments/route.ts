import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission } from '@/lib/admin';

/**
 * GET /api/admin/payments
 * Returns premium user data and subscription stats
 */
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!hasPermission(user.email, 'VIEW_PAYMENTS')) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const offset = (page - 1) * limit;

    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Stats
    const { count: totalPremium } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);

    const { count: activePremium } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .gte('premium_until', now);

    const { count: expiredPremium } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .lt('premium_until', now);

    const { count: expiringSoon } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .gte('premium_until', now)
      .lte('premium_until', sevenDaysFromNow);

    // User list query
    let query = admin
      .from('profiles')
      .select('id, display_name, email, photo_url, is_premium, premium_until, created_at, last_seen', { count: 'exact' })
      .eq('is_premium', true)
      .order('premium_until', { ascending: true });

    switch (filter) {
      case 'active':
        query = query.gte('premium_until', now);
        break;
      case 'expired':
        query = query.lt('premium_until', now);
        break;
      case 'expiring':
        query = query.gte('premium_until', now).lte('premium_until', sevenDaysFromNow);
        break;
    }

    query = query.range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      stats: {
        totalPremium: totalPremium || 0,
        activePremium: activePremium || 0,
        expiredPremium: expiredPremium || 0,
        expiringSoon: expiringSoon || 0,
      },
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payment data' }, { status: 500 });
  }
}
