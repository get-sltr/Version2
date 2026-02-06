import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/account/delete
 * Immediately and permanently delete all user data
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Session-based client to identify the user
    const sessionClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    // Service role client for admin operations (delete auth user, bypass RLS)
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current user from session
    const { data: { user }, error: authError } = await sessionClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body.confirm) {
      return NextResponse.json(
        { error: 'Confirmation required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // ========================================
    // PERMANENTLY DELETE ALL USER DATA
    // ========================================

    // 1. Delete photos from storage
    const { data: photos } = await adminClient
      .from('profile_photos')
      .select('storage_path')
      .eq('user_id', userId);

    if (photos && photos.length > 0) {
      const paths = photos.map((p: { storage_path: string }) => p.storage_path).filter(Boolean);
      if (paths.length > 0) {
        await adminClient.storage.from('photos').remove(paths);
      }
    }

    // Also remove avatar from storage (photo_url on profile)
    const { data: profile } = await adminClient
      .from('profiles')
      .select('photo_url')
      .eq('id', userId)
      .single();

    if (profile?.photo_url) {
      // Extract storage path from URL
      const url = profile.photo_url;
      const storageMatch = url.match(/\/storage\/v1\/object\/public\/([^?]+)/);
      if (storageMatch) {
        const fullPath = storageMatch[1]; // e.g. "photos/avatars/userId/file.jpg"
        const bucket = fullPath.split('/')[0];
        const filePath = fullPath.split('/').slice(1).join('/');
        await adminClient.storage.from(bucket).remove([filePath]);
      }
    }

    // 2. Delete profile photos table entries
    await adminClient.from('profile_photos').delete().eq('user_id', userId);

    // 3. Delete albums
    await adminClient.from('profile_albums').delete().eq('user_id', userId);

    // 4. Anonymize messages (keep for other user's context but remove sender info)
    await adminClient
      .from('messages')
      .update({ content: '[deleted]', media_url: null })
      .eq('sender_id', userId);

    // 5. Delete taps
    await adminClient.from('taps').delete().or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

    // 6. Delete favorites
    await adminClient.from('favorites').delete().or(`user_id.eq.${userId},favorited_user_id.eq.${userId}`);

    // 7. Delete profile views
    await adminClient.from('profile_views').delete().or(`viewer_id.eq.${userId},viewed_id.eq.${userId}`);

    // 8. Delete blocks
    await adminClient.from('blocked_users').delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

    // 9. Delete user settings
    await adminClient.from('user_settings').delete().eq('user_id', userId);

    // 10. Delete group memberships and hosted groups
    await adminClient.from('group_messages').delete().eq('sender_id', userId);
    await adminClient.from('group_members').delete().eq('user_id', userId);
    // For groups the user hosted: delete messages, members, then the group
    const { data: hostedGroups } = await adminClient
      .from('groups')
      .select('id')
      .eq('host_id', userId);
    if (hostedGroups && hostedGroups.length > 0) {
      const groupIds = hostedGroups.map((g: { id: string }) => g.id);
      for (const gid of groupIds) {
        await adminClient.from('group_messages').delete().eq('group_id', gid);
        await adminClient.from('group_members').delete().eq('group_id', gid);
      }
      await adminClient.from('groups').delete().eq('host_id', userId);
    }

    // 11. Delete profile
    await adminClient.from('profiles').delete().eq('id', userId);

    // 12. Delete auth user (requires service role)
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteAuthError) {
      console.error('Failed to delete auth user:', deleteAuthError);
    }

    console.log(`Account ${userId} permanently deleted`);

    return NextResponse.json({
      success: true,
      deleted: true,
      message: 'Account permanently deleted.',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred during account deletion' },
      { status: 500 }
    );
  }
}
