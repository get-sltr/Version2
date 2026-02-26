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

/**
 * Sign in with Google using native SDK on iOS/Android,
 * or OAuth redirect on web.
 */
export async function nativeGoogleSignIn(): Promise<{ error: Error | null }> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { GoogleSignIn } = await import('@capawesome/capacitor-google-sign-in');
      const result = await GoogleSignIn.signIn();

      if (!result.idToken) {
        return { error: new Error('No ID token returned from Google Sign-In') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: result.idToken,
      });

      if (error) return { error };
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
      const result = await SignInWithApple.authorize({
        clientId: 'com.sltrdigital.primal',
        redirectURI: 'https://primalgay.com/auth/callback',
        scopes: 'email name',
      });

      if (!result.response.identityToken) {
        return { error: new Error('No identity token returned from Apple Sign-In') };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: result.response.identityToken,
      });

      if (error) return { error };
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
