import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission } from '@/lib/admin';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * GET /api/admin/reports
 * Returns cruising reports for moderation
 */
export async function GET(request: NextRequest) {
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

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Admin service not configured' },
        { status: 500 }
      );
    }

    const admin = getSupabaseAdmin();

    let query = admin
      .from('cruising_reports')
      .select(`
        *,
        cruising_updates(text, user_id)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error } = await query;

    if (error) {
      throw error;
    }

    // Map to cleaner format
    const mappedReports = (reports || []).map((r: any) => ({
      id: r.id,
      update_id: r.update_id,
      reporter_id: r.reporter_id,
      reason: r.reason,
      details: r.details,
      status: r.status,
      created_at: r.created_at,
      reviewed_at: r.reviewed_at,
      update_text: r.cruising_updates?.text || null,
      update_user_id: r.cruising_updates?.user_id || null,
    }));

    return NextResponse.json({ reports: mappedReports });
  } catch (error: unknown) {
    console.error('Admin reports error:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch reports';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/reports
 * Update report status (review, action, dismiss)
 */
export async function PATCH(request: NextRequest) {
  // Authenticate user
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin access - moderator or higher can handle reports
  if (!isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { reportId, action, deletePost } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: 'Missing reportId or action' }, { status: 400 });
    }

    if (!isValidUUID(reportId)) {
      return NextResponse.json({ error: 'Invalid reportId format' }, { status: 400 });
    }

    const validActions = ['reviewed', 'actioned', 'dismissed'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Get the report first to get update_id
    const { data: report, error: fetchError } = await admin
      .from('cruising_reports')
      .select('update_id')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Update report status
    const { error: updateError } = await admin
      .from('cruising_reports')
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reportId);

    if (updateError) {
      throw updateError;
    }

    // If actioned with deletePost flag, also delete the cruising update
    if (action === 'actioned' && deletePost && report.update_id) {
      await admin
        .from('cruising_updates')
        .delete()
        .eq('id', report.update_id);
    }

    return NextResponse.json({ success: true, action, reportId });
  } catch (error: unknown) {
    console.error('Admin report action error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
