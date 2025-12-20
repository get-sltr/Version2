import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission } from '@/lib/admin';

/**
 * GET /api/admin/stats
 * Returns dashboard statistics for admin users
 */
export async function GET() {
  // Authenticate user
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin access
  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  if (!hasPermission(user.email, 'VIEW_DASHBOARD')) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
  }

  try {
    const admin = getSupabaseAdmin();

    // Get total users count
    const { count: totalUsers } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todaySignups } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    // Get users created this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekSignups } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    // Get users created this month
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const { count: monthSignups } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString());

    // Get premium users count
    const { count: premiumUsers } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true);

    // Get active premium (not expired)
    const { count: activePremium } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_premium', true)
      .gte('premium_expires_at', new Date().toISOString());

    // Get online users (active in last 15 minutes)
    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
    const { count: onlineUsers } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen', fifteenMinutesAgo.toISOString());

    // Get verified users
    const { count: verifiedUsers } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true);

    // Get message count (total)
    const { count: totalMessages } = await admin
      .from('messages')
      .select('*', { count: 'exact', head: true });

    // Get groups count
    const { count: totalGroups } = await admin
      .from('groups')
      .select('*', { count: 'exact', head: true });

    // Get active groups
    const { count: activeGroups } = await admin
      .from('groups')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Calculate conversion rate
    const conversionRate = totalUsers && totalUsers > 0
      ? ((premiumUsers || 0) / totalUsers * 100).toFixed(2)
      : '0';

    // Get signups by day for the last 7 days
    const signupsByDay: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const { count } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      signupsByDay.push({
        date: date.toISOString().split('T')[0],
        count: count || 0,
      });
    }

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
        today: todaySignups || 0,
        thisWeek: weekSignups || 0,
        thisMonth: monthSignups || 0,
        online: onlineUsers || 0,
        verified: verifiedUsers || 0,
      },
      premium: {
        total: premiumUsers || 0,
        active: activePremium || 0,
        conversionRate: `${conversionRate}%`,
      },
      content: {
        messages: totalMessages || 0,
        groups: totalGroups || 0,
        activeGroups: activeGroups || 0,
      },
      signupsByDay,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
