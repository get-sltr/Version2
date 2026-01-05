import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { getSupabaseAdmin, isAdmin, hasPermission, isFounder } from '@/lib/admin';

/**
 * GET /api/admin/users
 * Returns paginated user list with search/filter
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

  if (!hasPermission(user.email, 'VIEW_USERS')) {
    return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // all, premium, free, online, verified
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';

    const offset = (page - 1) * limit;

    // Check if service role key is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not configured');
      return NextResponse.json(
        { error: 'Admin service not configured - missing service role key' },
        { status: 500 }
      );
    }

    const admin = getSupabaseAdmin();

    // Build query - only select columns that exist in the database
    let query = admin
      .from('profiles')
      .select('id, email, display_name, age, photo_url, is_online, is_premium, created_at, last_seen', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter
    switch (filter) {
      case 'premium':
        query = query.eq('is_premium', true);
        break;
      case 'free':
        query = query.eq('is_premium', false);
        break;
      case 'online':
        const fifteenMinutesAgo = new Date();
        fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);
        query = query.gte('last_seen', fifteenMinutesAgo.toISOString());
        break;
      // case 'verified': - column doesn't exist yet
      //   query = query.eq('is_verified', true);
      //   break;
    }

    // Apply sorting
    const ascending = order === 'asc';
    query = query.order(sort, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, count, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Update a user (ban, verify, grant premium, etc.)
 */
export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    switch (action) {
      case 'verify':
        if (!hasPermission(user.email, 'EDIT_USER')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await admin
          .from('profiles')
          .update({ is_verified: true })
          .eq('id', userId);
        break;

      case 'unverify':
        if (!hasPermission(user.email, 'EDIT_USER')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await admin
          .from('profiles')
          .update({ is_verified: false })
          .eq('id', userId);
        break;

      case 'grant_premium':
        if (!hasPermission(user.email, 'EDIT_USER')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const premiumUntil = new Date();
        premiumUntil.setMonth(premiumUntil.getMonth() + (data?.months || 1));
        await admin
          .from('profiles')
          .update({
            is_premium: true,
            premium_until: premiumUntil.toISOString(),
          })
          .eq('id', userId);
        break;

      case 'revoke_premium':
        if (!hasPermission(user.email, 'EDIT_USER')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await admin
          .from('profiles')
          .update({
            is_premium: false,
            premium_until: null,
          })
          .eq('id', userId);
        break;

      case 'ban':
        if (!hasPermission(user.email, 'BAN_USER')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Ban user by disabling their auth account
        await admin.auth.admin.updateUserById(userId, {
          ban_duration: data?.duration || 'none', // 'none' means permanent
        });
        break;

      case 'unban':
        if (!hasPermission(user.email, 'BAN_USER')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        await admin.auth.admin.updateUserById(userId, {
          ban_duration: 'none',
        });
        break;

      case 'delete':
        // Only founder can delete users
        if (!isFounder(user.email)) {
          return NextResponse.json({ error: 'Forbidden - Founder only' }, { status: 403 });
        }
        // Delete user's profile first
        await admin.from('profiles').delete().eq('id', userId);
        // Delete auth user
        await admin.auth.admin.deleteUser(userId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, action, userId });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
