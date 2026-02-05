import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logoutRevenueCat } from '@/lib/revenuecat';

/**
 * POST /api/account/delete
 * Schedule account for deletion (24-hour grace period)
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

    const body = await request.json();
    if (!body.confirm) {
      return NextResponse.json(
        { error: 'Confirmation required' },
        { status: 400 }
      );
    }

    // Calculate deletion date (24 hours from now)
    const deletionDate = new Date();
    deletionDate.setHours(deletionDate.getHours() + 24);

    // Store deletion request in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        deletion_scheduled_at: deletionDate.toISOString(),
        is_active: false,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to schedule deletion:', updateError);
      return NextResponse.json(
        { error: 'Failed to schedule account deletion' },
        { status: 500 }
      );
    }

    // Cancel RevenueCat subscription if applicable
    try {
      await logoutRevenueCat();
    } catch (e) {
      // Non-fatal - continue with deletion
      console.warn('Failed to logout from RevenueCat:', e);
    }

    // Send confirmation email
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-primal-email-key': process.env.EMAIL_SERVICE_TOKEN!,
        },
        body: JSON.stringify({
          type: 'account_deletion',
          to: user.email,
          data: {
            deletionDate: deletionDate.toISOString(),
          },
        }),
      });
    } catch (e) {
      console.warn('Failed to send deletion confirmation email:', e);
    }

    return NextResponse.json({
      success: true,
      deletionDate: deletionDate.toISOString(),
      message: 'Account scheduled for deletion. You have 24 hours to cancel.',
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/delete
 * Cancel scheduled account deletion
 */
export async function DELETE(request: NextRequest) {
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

    // Cancel deletion
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        deletion_scheduled_at: null,
        is_active: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Failed to cancel deletion:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel account deletion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account deletion cancelled',
    });

  } catch (error) {
    console.error('Cancel deletion error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * This function should be called by a scheduled job (e.g., Supabase Edge Function)
 * to permanently delete accounts after the 24-hour grace period.
 *
 * Implementation notes:
 * 1. Query profiles where deletion_scheduled_at < NOW()
 * 2. For each profile:
 *    - Delete photos from Storage
 *    - Delete/anonymize messages
 *    - Delete profile data
 *    - Delete from auth.users
 */
async function permanentlyDeleteAccount(supabase: any, userId: string) {
  // This would be implemented as a scheduled function
  // For now, just documenting the steps:

  // 1. Delete photos from storage
  const { data: photos } = await supabase
    .from('profile_photos')
    .select('storage_path')
    .eq('user_id', userId);

  if (photos) {
    for (const photo of photos) {
      await supabase.storage
        .from('photos')
        .remove([photo.storage_path]);
    }
  }

  // 2. Delete profile photos table entries
  await supabase
    .from('profile_photos')
    .delete()
    .eq('user_id', userId);

  // 3. Delete albums
  await supabase
    .from('profile_albums')
    .delete()
    .eq('user_id', userId);

  // 4. Anonymize messages (keep for other user's context but remove sender info)
  await supabase
    .from('messages')
    .update({ content: '[deleted]', media_url: null })
    .eq('sender_id', userId);

  // 5. Delete taps
  await supabase
    .from('taps')
    .delete()
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

  // 6. Delete favorites
  await supabase
    .from('favorites')
    .delete()
    .or(`user_id.eq.${userId},favorited_user_id.eq.${userId}`);

  // 7. Delete profile views
  await supabase
    .from('profile_views')
    .delete()
    .or(`viewer_id.eq.${userId},viewed_id.eq.${userId}`);

  // 8. Delete blocks
  await supabase
    .from('blocked_users')
    .delete()
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

  // 9. Delete user settings
  await supabase
    .from('user_settings')
    .delete()
    .eq('user_id', userId);

  // 10. Delete profile
  await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  // 11. Delete auth user (requires service role)
  await supabase.auth.admin.deleteUser(userId);

  console.log(`Account ${userId} permanently deleted`);
}
