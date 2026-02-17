import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission } from '@/lib/admin';

/**
 * GET /api/admin/photos
 * Returns photos needing moderation review
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
    const filter = searchParams.get('filter') || 'pending';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    const admin = getSupabaseAdmin();

    let query = admin
      .from('photo_moderation_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    switch (filter) {
      case 'pending':
        query = query
          .eq('requires_manual_review', true)
          .is('review_decision', null);
        break;
      case 'approved':
        query = query.eq('review_decision', 'approved');
        break;
      case 'rejected':
        query = query.eq('review_decision', 'rejected');
        break;
      case 'all':
        // No filter
        break;
      default:
        query = query
          .eq('requires_manual_review', true)
          .is('review_decision', null);
    }

    const { data: photos, error } = await query;

    if (error) throw error;

    // Get unique user IDs to fetch profile info
    const userIds = Array.from(new Set((photos || []).map((p: any) => p.user_id).filter(Boolean)));

    let userProfiles: Record<string, any> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from('profiles')
        .select('id, display_name, email, photo_url')
        .in('id', userIds);

      if (profiles) {
        userProfiles = Object.fromEntries(profiles.map(p => [p.id, p]));
      }
    }

    // Get pending count for badge
    const { count: pendingCount } = await admin
      .from('photo_moderation_log')
      .select('*', { count: 'exact', head: true })
      .eq('requires_manual_review', true)
      .is('review_decision', null);

    const mappedPhotos = (photos || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      photoPath: p.photo_path,
      scanPassed: p.scan_passed,
      modelAvailable: p.model_available,
      scores: p.scores,
      failedCategory: p.failed_category,
      requiresManualReview: p.requires_manual_review,
      reviewDecision: p.review_decision,
      reviewedAt: p.reviewed_at,
      reviewedBy: p.reviewed_by,
      createdAt: p.created_at,
      user: userProfiles[p.user_id] || null,
    }));

    return NextResponse.json({
      photos: mappedPhotos,
      pendingCount: pendingCount || 0,
    });
  } catch (error) {
    console.error('Admin photos error:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/photos
 * Approve a photo (update review_decision)
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
    const { logId, decision } = body;

    if (!logId || !decision) {
      return NextResponse.json({ error: 'Missing logId or decision' }, { status: 400 });
    }

    if (!['approved', 'rejected', 'escalated'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from('photo_moderation_log')
      .update({
        review_decision: decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', logId);

    if (error) throw error;

    return NextResponse.json({ success: true, decision, logId });
  } catch (error) {
    console.error('Admin photo action error:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}
