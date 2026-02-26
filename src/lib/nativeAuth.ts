/**
 * Native authentication helpers for iOS/Android
 *
 * On native platforms, uses native SDKs (Sign in with Apple, Google Sign-In)
 * to get ID tokens, then exchanges them with Supabase via signInWithIdToken().
 *
 * On web, falls back to existing signInWithOAuth() redirect flow.
 */

import { Capacitor } from '@capacitor/core';
import { supabase } from './supabase';

// Google Web client ID — the @capawesome plugin requires the WEB client ID
// in initialize(). The iOS client ID is read from Info.plist (GIDClientID).
const GOOGLE_WEB_CLIENT_ID = '696145455871-h57ar2uvvkk6ksrgf4f3nd7og0f4ueaj.apps.googleusercontent.com';

/**
 * Generate a random nonce string for Apple Sign-In
 */
function generateNonce(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const values = crypto.getRandomValues(new Uint8Array(length));
  for (const val of values) {
    result += chars[val % chars.length];
  }
  return result;
}

/**
 * SHA-256 hash a string (for Apple Sign-In nonce)
 */
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hash);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * After native signInWithIdToken, check if the user has a profile.
 * New users get redirected to onboarding; existing users go to dashboard.
 */
async function redirectAfterNativeAuth(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/dashboard';
    return;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // New user — create skeleton profile and send to onboarding
    const metadata = user.user_metadata;
    await supabase.from('profiles').insert({
      id: user.id,
      display_name: metadata?.full_name || metadata?.name || null,
      photo_url: metadata?.avatar_url || metadata?.picture || null,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    });
    window.location.href = '/onboarding';
  } else {
    window.location.href = '/dashboard';
  }
}

/**
 * Sign in with Google using native SDK on iOS/Android,
 * or OAuth redirect on web.
 */
export async function nativeGoogleSignIn(): Promise<{ error: Error | null }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');
      // clientId MUST be the Web client ID per plugin docs.
      // The iOS client ID is read from Info.plist GIDClientID automatically.
      await GoogleSignIn.initialize({
        clientId: GOOGLE_WEB_CLIENT_ID,
      });
      const result = await GoogleSignIn.signIn();

      if (!result.idToken) {
        return { error: new Error('No ID token returned from Google Sign-In') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.idToken,
      });

      if (error) return { error };
      await redirectAfterNativeAuth();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Google Sign-In failed') };
    }
  }

  // Web fallback: use OAuth redirect
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Sign in with Apple using native SDK on iOS,
 * or OAuth redirect on web.
 */
export async function nativeAppleSignIn(): Promise<{ error: Error | null }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');

      // Generate nonce for Supabase verification
      const rawNonce = generateNonce();
      const hashedNonce = await sha256(rawNonce);

      const result = await SignInWithApple.authorize({
        clientId: 'com.sltrdigital.primal',
        redirectURI: 'https://primalgay.com/auth/callback',
        scopes: 'email name',
        nonce: hashedNonce,
      });

      if (!result.response.identityToken) {
        return { error: new Error('No identity token returned from Apple Sign-In') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.response.identityToken,
        nonce: rawNonce,
      });

      if (error) return { error };
      await redirectAfterNativeAuth();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Apple Sign-In failed') };
    }
  }

  // Web fallback: use OAuth redirect
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { error: error ? new Error(error.message) : null };
}
