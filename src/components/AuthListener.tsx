'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('Auth event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        // User clicked password reset link - send them to reset page
        router.push('/reset-password');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // This component doesn't render anything
  return null;
}
