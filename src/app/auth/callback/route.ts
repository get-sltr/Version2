import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

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
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
    }

    // If a specific redirect was requested, use that
    if (next) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    // Check if user has completed their profile (new users need onboarding)
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, position')
        .eq('id', data.user.id)
        .single();

      // If profile is incomplete, redirect to onboarding
      if (!profile?.display_name || !profile?.position) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  // Default redirect to dashboard for returning users
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
