import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * POST /api/admin/photos/reject
 *
 * Rejects a user's photo: removes it from their profile/storage,
 * computes a hash and stores it so the same photo can't be re-uploaded.
 *
 * Body: { userId, photoUrl, photoPath?, reason?, hash }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, photoUrl, photoPath, reason = 'nsfw', hash } = body;

    if (!userId || !photoUrl) {
      return NextResponse.json(
        { error: 'userId and photoUrl are required' },
        { status: 400 }
      );
    }

    if (!hash) {
      return NextResponse.json(
        { error: 'hash is required — compute it client-side before calling this endpoint' },
        { status: 400 }
      );
    }

    // Verify the caller is an admin
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user: admin } } = await supabaseAuth.auth.getUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check admin role
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', admin.id)
      .single();

    // Simple admin check — adjust based on your admin system
    const ADMIN_EMAILS = [process.env.NEXT_PUBLIC_FOUNDER_EMAIL, 'admin@primalgay.com'];
    if (!adminProfile?.email || !ADMIN_EMAILS.includes(adminProfile.email)) {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // 1. Store the rejected hash
    const { error: hashError } = await supabaseAdmin
      .from('rejected_photo_hashes')
      .upsert({
        hash,
        original_user_id: userId,
        original_photo_path: photoPath || photoUrl,
        rejected_by: admin.id,
        reason,
      }, {
        onConflict: 'hash',
      });

    if (hashError) {
      console.error('[Admin] Failed to store rejected hash:', hashError);
      // Continue anyway — still remove the photo
    }

    // 2. Remove the photo URL from the user's profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('photo_url, photo_urls')
      .eq('id', userId)
      .single();

    if (profile) {
      const updates: Record<string, any> = {};

      // If it's the main avatar
      if (profile.photo_url === photoUrl) {
        updates.photo_url = null;
      }

      // If it's in the photo_urls array
      if (profile.photo_urls && Array.isArray(profile.photo_urls)) {
        const filtered = profile.photo_urls.filter((url: string) => url !== photoUrl);
        if (filtered.length !== profile.photo_urls.length) {
          updates.photo_urls = filtered;
        }
      }

      if (Object.keys(updates).length > 0) {
        await supabaseAdmin
          .from('profiles')
          .update(updates)
          .eq('id', userId);
      }
    }

    // 3. Try to delete from storage if we have a path
    if (photoPath) {
      // Try both buckets
      await supabaseAdmin.storage.from('avatars').remove([photoPath]).catch(() => {});
      await supabaseAdmin.storage.from('profile-media').remove([photoPath]).catch(() => {});
    }

    // 4. Log the moderation action
    await supabaseAdmin
      .from('photo_moderation_log')
      .insert({
        user_id: userId,
        photo_path: photoPath || photoUrl,
        scan_passed: false,
        model_available: true,
        requires_manual_review: false,
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin.id,
        review_decision: 'rejected',
      })
      .then(({ error: logErr }) => {
        if (logErr) console.error('[Admin] Failed to log moderation:', logErr);
      });

    return NextResponse.json({
      success: true,
      message: 'Photo rejected, removed, and hash stored',
    });
  } catch (err) {
    console.error('[Admin] Photo reject error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
