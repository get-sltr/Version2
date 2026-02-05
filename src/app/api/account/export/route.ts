import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiter: 1 export per 24 hours per user
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, '24 h'),
  analytics: true,
  prefix: 'primal:export',
});

/**
 * POST /api/account/export
 * Generate a data export for the user
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Rate limit check
    const { success, remaining, reset } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Export rate limit exceeded. Please try again in 24 hours.' },
        { status: 429, headers: { 'X-RateLimit-Reset': reset.toString() } }
      );
    }

    // Collect user data
    const exportData: Record<string, any> = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email,
    };

    // Profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profile) {
      // Remove sensitive fields
      delete profile.deletion_scheduled_at;
      exportData.profile = profile;
    }

    // User settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settings) {
      exportData.settings = settings;
    }

    // Photos
    const { data: photos } = await supabase
      .from('profile_photos')
      .select('id, storage_path, public_url, caption, is_private, is_nsfw, created_at')
      .eq('user_id', user.id);

    exportData.photos = photos || [];

    // Albums
    const { data: albums } = await supabase
      .from('profile_albums')
      .select('*')
      .eq('user_id', user.id);

    exportData.albums = albums || [];

    // Messages sent
    const { data: messagesSent } = await supabase
      .from('messages')
      .select('id, recipient_id, content, type, created_at')
      .eq('sender_id', user.id)
      .eq('deleted_by_sender', false)
      .order('created_at', { ascending: false })
      .limit(1000);

    exportData.messagesSent = messagesSent || [];

    // Messages received
    const { data: messagesReceived } = await supabase
      .from('messages')
      .select('id, sender_id, content, type, created_at')
      .eq('recipient_id', user.id)
      .eq('deleted_by_recipient', false)
      .order('created_at', { ascending: false })
      .limit(1000);

    exportData.messagesReceived = messagesReceived || [];

    // Taps sent
    const { data: tapsSent } = await supabase
      .from('taps')
      .select('id, recipient_id, tap_type, created_at')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500);

    exportData.tapsSent = tapsSent || [];

    // Taps received
    const { data: tapsReceived } = await supabase
      .from('taps')
      .select('id, sender_id, tap_type, created_at, viewed_at')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500);

    exportData.tapsReceived = tapsReceived || [];

    // Favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('id, favorited_user_id, note, created_at')
      .eq('user_id', user.id);

    exportData.favorites = favorites || [];

    // Blocked users
    const { data: blockedUsers } = await supabase
      .from('blocked_users')
      .select('id, blocked_id, reason, created_at')
      .eq('blocker_id', user.id);

    exportData.blockedUsers = blockedUsers || [];

    // Profile views (who you viewed)
    const { data: viewedProfiles } = await supabase
      .from('profile_views')
      .select('id, viewed_id, created_at')
      .eq('viewer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500);

    exportData.viewedProfiles = viewedProfiles || [];

    // Groups joined
    const { data: groups } = await supabase
      .from('group_members')
      .select(`
        id,
        group_id,
        role,
        joined_at,
        group:groups(name, type, description)
      `)
      .eq('user_id', user.id);

    exportData.groups = groups || [];

    // Update last export timestamp
    await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        last_data_export: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    // Generate download URL
    // In production, you'd upload this to storage and generate a signed URL
    // For now, we'll return the data directly as a data URL
    const jsonStr = JSON.stringify(exportData, null, 2);
    const base64 = Buffer.from(jsonStr).toString('base64');
    const downloadUrl = `data:application/json;base64,${base64}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresIn: '24 hours',
    });

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate data export' },
      { status: 500 }
    );
  }
}
