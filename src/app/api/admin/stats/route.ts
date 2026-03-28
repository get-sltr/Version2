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

    // Pre-compute date boundaries
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    // Run ALL queries in parallel instead of sequentially
    const [
      totalUsersRes,
      todaySignupsRes,
      weekSignupsRes,
      monthSignupsRes,
      premiumUsersRes,
      activePremiumRes,
      onlineUsersRes,
      verifiedUsersRes,
      totalMessagesRes,
      totalGroupsRes,
      activeGroupsRes,
      pendingPhotoReviewsRes,
      pendingUserReportsRes,
      pendingCruisingReportsRes,
      // Single query for all signups in last 7 days (replaces 7 separate queries)
      weekSignupsDataRes,
    ] = await Promise.all([
      admin.from('profiles').select('*', { count: 'exact', head: true }),
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo.toISOString()),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true).gte('premium_until', now.toISOString()),
      admin.from('profiles').select('*', { count: 'exact', head: true }).gte('last_seen', fifteenMinutesAgo.toISOString()),
      admin.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
      admin.from('messages').select('*', { count: 'exact', head: true }),
      admin.from('groups').select('*', { count: 'exact', head: true }),
      admin.from('groups').select('*', { count: 'exact', head: true }).eq('is_active', true),
      admin.from('photo_moderation_log').select('*', { count: 'exact', head: true }).eq('requires_manual_review', true).is('review_decision', null),
      admin.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('cruising_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      // Fetch just created_at for last 7 days, bucket in JS
      admin.from('profiles').select('created_at').gte('created_at', weekAgo.toISOString()),
    ]);

    const totalUsers = totalUsersRes.count || 0;
    const premiumUsers = premiumUsersRes.count || 0;

    // Bucket signups by day in JS (replaces 7 separate DB queries)
    const signupsByDay: { date: string; count: number }[] = [];
    const dayCounts = new Map<string, number>();
    if (weekSignupsDataRes.data) {
      for (const row of weekSignupsDataRes.data) {
        const dateKey = new Date(row.created_at).toISOString().split('T')[0];
        dayCounts.set(dateKey, (dayCounts.get(dateKey) || 0) + 1);
      }
    }
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      signupsByDay.push({ date: dateKey, count: dayCounts.get(dateKey) || 0 });
    }

    const conversionRate = totalUsers > 0
      ? (premiumUsers / totalUsers * 100).toFixed(2)
      : '0';

    return NextResponse.json({
      users: {
        total: totalUsers,
        today: todaySignupsRes.count || 0,
        thisWeek: weekSignupsRes.count || 0,
        thisMonth: monthSignupsRes.count || 0,
        online: onlineUsersRes.count || 0,
        verified: verifiedUsersRes.count || 0,
      },
      premium: {
        total: premiumUsers,
        active: activePremiumRes.count || 0,
        conversionRate: `${conversionRate}%`,
      },
      content: {
        messages: totalMessagesRes.count || 0,
        groups: totalGroupsRes.count || 0,
        activeGroups: activeGroupsRes.count || 0,
      },
      moderation: {
        pendingPhotos: pendingPhotoReviewsRes.count || 0,
        pendingUserReports: pendingUserReportsRes.count || 0,
        pendingCruisingReports: pendingCruisingReportsRes.count || 0,
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
