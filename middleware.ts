import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/messages',
  '/profile',
  '/settings',
  '/taps',
  '/views',
  '/map',
  '/favorites',
  '/premium',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname === route);

  if (!isProtectedRoute && !isAuthRoute) {
    return NextResponse.next();
  }

  // Check for Supabase auth token in cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  // Look for auth token in cookies
  const authToken = request.cookies.get('sb-access-token')?.value
    || request.cookies.get(`sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`)?.value;

  const hasSession = !!authToken;

  // Protected route without session → redirect to login
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth route with session → redirect to dashboard
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/messages/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/taps/:path*',
    '/views/:path*',
    '/map/:path*',
    '/favorites/:path*',
    '/premium/:path*',
    '/login',
    '/signup',
  ],
};
