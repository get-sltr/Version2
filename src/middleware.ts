import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/map',
  '/messages',
  '/profile/edit',
  '/settings',
  '/taps',
  '/favorites',
  '/notifications',
  '/call',
  '/pulse',
  '/groups/create',
  '/groups/mine',
  '/checkout',
  '/cruising',
  '/connections',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

// Public routes that don't need any checks
const PUBLIC_ROUTES = [
  '/',
  '/verify',
  '/auth/callback',
  '/terms',
  '/privacy',
  '/guidelines',
  '/security',
  '/cookies',
  '/dmca',
  '/premium',
];

// API routes that have their own auth handling
const API_ROUTES = ['/api'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isApiRoute(pathname: string): boolean {
  return API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Validates a redirect URL to prevent open redirect attacks.
 * Only allows relative paths that are protected routes.
 */
function isValidRedirectUrl(redirectUrl: string): boolean {
  // Must be a relative path (no protocol or domain)
  if (!redirectUrl.startsWith('/')) {
    return false;
  }

  // Block protocol-relative URLs (//example.com)
  if (redirectUrl.startsWith('//')) {
    return false;
  }

  // Block URLs with encoded characters that could bypass validation
  // Decode and re-check to prevent double encoding attacks
  try {
    const decoded = decodeURIComponent(redirectUrl);
    if (decoded !== redirectUrl) {
      // Contains encoded characters - re-validate the decoded version
      if (!decoded.startsWith('/') || decoded.startsWith('//')) {
        return false;
      }
    }
  } catch {
    // Invalid encoding - reject
    return false;
  }

  // Extract just the pathname (ignore query strings for validation)
  const pathOnly = redirectUrl.split('?')[0].split('#')[0];

  // Must be a protected route
  return isProtectedRoute(pathOnly);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') ||
    isApiRoute(pathname)
  ) {
    return NextResponse.next();
  }

  // Create a response that we can modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get current session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // Handle protected routes - redirect to login if not authenticated
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Store the intended destination for redirect after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle auth routes - redirect to dashboard if already authenticated
  if (isAuthRoute(pathname) && isAuthenticated) {
    // Check if there's a redirect parameter with strict validation
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo && isValidRedirectUrl(redirectTo)) {
      // Safe to redirect - URL has been validated
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    // Default to dashboard if no valid redirect or invalid redirect URL
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For public profile pages, allow access but track if user is authenticated
  if (pathname.startsWith('/profile/') && !pathname.startsWith('/profile/edit')) {
    // Public profile viewing is allowed for everyone
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
