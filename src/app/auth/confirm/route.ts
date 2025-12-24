import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (token_hash && type) {
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

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'recovery' | 'signup' | 'email',
      token_hash,
    });

    if (error) {
      console.error('Auth confirm error:', error);
      return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
    }

    // Handle password recovery flow
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/reset-password', request.url));
    }

    // For other types, redirect to next or dashboard
    return NextResponse.redirect(new URL(next, request.url));
  }

  // No token_hash, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
