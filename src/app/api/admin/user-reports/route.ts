import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission } from '@/lib/admin';

// UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * GET /api/admin/user-reports
 * Returns user-to-user reports from the `reports` table
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

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    const admin = getSupabaseAdmin();

    let query = admin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) throw error;

    // Collect all user IDs (reporters + reported users)
    const allUserIds = new Set<string>();
    (reports || []).forEach((r: any) => {
      if (r.reporter_id) allUserIds.add(r.reporter_id);
      if (r.reported_user_id) allUserIds.add(r.reported_user_id);
    });

    let userProfiles: Record<string, any> = {};
    if (allUserIds.size > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, display_name, email, photo_url')
        .in('id', Array.from(allUserIds));

      if (profiles) {
        userProfiles = Object.fromEntries(profiles.map(p => [p.id, p]));
      }
    }

    // Get pending count for badge
    const { count: pendingCount } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const mappedReports = (reports || []).map((r: any) => ({
      id: r.id,
      reporterId: r.reporter_id,
      reportedUserId: r.reported_user_id,
      reportedMessageId: r.reported_message_id || null,
      reportedGroupId: r.reported_group_id || null,
      reason: r.reason,
      description: r.description || r.details || null,
      status: r.status,
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at,
      reviewedBy: r.reviewed_by,
      resolutionNotes: r.resolution_notes,
      reporter: userProfiles[r.reporter_id] || null,
      reportedUser: userProfiles[r.reported_user_id] || null,
    }));

    return NextResponse.json({
      reports: mappedReports,
      pendingCount: pendingCount || 0,
    });
  } catch (error) {
    console.error('Admin user-reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/user-reports
 * Update report status (dismiss, resolve, etc.)
 */
export async function PATCH(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { reportId, action, notes } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: 'Missing reportId or action' }, { status: 400 });
    }

    if (!isValidUUID(reportId)) {
      return NextResponse.json({ error: 'Invalid reportId' }, { status: 400 });
    }

    const validActions = ['reviewed', 'resolved', 'dismissed'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from('reports')
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        resolution_notes: notes || null,
      })
      .eq('id', reportId);

    if (error) throw error;

    return NextResponse.json({ success: true, action, reportId });
  } catch (error) {
    console.error('Admin user-report action error:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
