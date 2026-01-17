import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allowed hosts for redirects (add your domains here)
const ALLOWED_HOSTS = [
  'getsltr.com',
  'www.getsltr.com',
  'primalgay.com',
  'www.primalgay.com',
  'localhost',
  'localhost:3000',
];

/**
 * Validate redirect URL to prevent open redirect attacks
 * Only allows relative paths or URLs to allowed hosts
 */
function sanitizeRedirectPath(path: string): string {
  // Default to dashboard if empty
  if (!path) return '/dashboard';

  // Must start with / for relative path
  if (!path.startsWith('/')) return '/dashboard';

  // Block protocol-relative URLs (//evil.com)
  if (path.startsWith('//')) return '/dashboard';

  // Block URLs with protocol
  if (path.includes('://')) return '/dashboard';

  // Block encoded characters that could bypass checks
  if (path.includes('%')) {
    try {
      const decoded = decodeURIComponent(path);
      if (decoded.startsWith('//') || decoded.includes('://')) {
        return '/dashboard';
      }
    } catch {
      return '/dashboard';
    }
  }

  // Remove any @ symbols which can be used for open redirects
  if (path.includes('@')) return '/dashboard';

  return path;
}

/**
 * Validate x-forwarded-host against allowed hosts
 */
function isAllowedHost(host: string | null): boolean {
  if (!host) return false;
  const normalizedHost = host.toLowerCase().trim();
  return ALLOWED_HOSTS.some(allowed =>
    normalizedHost === allowed || normalizedHost.endsWith(`.${allowed}`)
  );
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/dashboard';

  // Sanitize the redirect path to prevent open redirect
  const next = sanitizeRedirectPath(rawNext);

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
      } else if (forwardedHost && isAllowedHost(forwardedHost)) {
        // Only use forwarded host if it's in our allowed list
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        // Fallback to request origin (safe)
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
