'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { initializeRevenueCat, loginRevenueCat, isNativePlatform } from '@/lib/revenuecat';

export function RevenueCatProvider() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initRC = async () => {
      // Only initialize on native platforms
      if (!isNativePlatform()) {
        console.log('[RevenueCatProvider] Skipping - not native platform');
        return;
      }

      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Initialize RevenueCat
      const success = await initializeRevenueCat(user?.id);

      if (success && user) {
        // If user is logged in, also log them in to RevenueCat
        await loginRevenueCat(user.id);
      }

      console.log('[RevenueCatProvider] Initialized:', success);
    };

    initRC();

    // Listen for auth changes to update RevenueCat user
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isNativePlatform()) return;

      if (event === 'SIGNED_IN' && session?.user) {
        await loginRevenueCat(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
