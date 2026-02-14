import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { isAdmin, hasPermission, isFounder } from '@/lib/admin';
import {
  getErrors,
  getErrorStats,
  getErrorById,
  clearErrors,
} from '@/lib/error-logger';

/**
 * GET /api/admin/errors
 * Returns error logs for admin review
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

  if (!hasPermission(user.email, 'VIEW_ERRORS')) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Get single error by ID
    if (id) {
      const error = getErrorById(id);
      if (!error) {
        return NextResponse.json({ error: 'Error not found' }, { status: 404 });
      }
      return NextResponse.json({ error });
    }

    // Get error list with filters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const level = searchParams.get('level') as 'error' | 'warning' | 'info' | null;
    const source = searchParams.get('source') || undefined;
    const since = searchParams.get('since');

    const offset = (page - 1) * limit;

    const { errors, total } = getErrors({
      level: level || undefined,
      source,
      since: since ? new Date(since) : undefined,
      limit,
      offset,
    });

    const stats = getErrorStats();

    return NextResponse.json({
      errors,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin errors endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch errors' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/errors
 * Clear all errors (founder only)
 */
export async function DELETE() {
  // Authenticate user
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only founder can clear errors
  if (!isFounder(user.email)) {
    return NextResponse.json({ error: 'Forbidden - Founder only' }, { status: 403 });
  }

  try {
    clearErrors();
    return NextResponse.json({ success: true, message: 'All errors cleared' });
  } catch (error) {
    console.error('Clear errors error:', error);
    return NextResponse.json(
      { error: 'Failed to clear errors' },
      { status: 500 }
    );
  }
}
