import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if this is a new OAuth user (no profile yet)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, display_name')
        .eq('id', data.user.id)
        .single();

      // If no profile exists, create one with OAuth user data
      if (!profile) {
        const metadata = data.user.user_metadata;
        const displayName = metadata?.full_name || metadata?.name || null;
        const photoUrl = metadata?.avatar_url || metadata?.picture || null;

        await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          photo_url: photoUrl,
          created_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        });

        // Redirect new OAuth users to onboarding
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Existing user - redirect to dashboard or specified next URL
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
