'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type UseLocationPresenceOptions = {
  onFirstFix?: (coords: { lat: number; lng: number }) => void;
};

export function useLocationPresence(options?: UseLocationPresenceOptions) {
  useEffect(() => {
    let watchId: number | null = null;
    let firstFixDone = false;
    let cancelled = false;

    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      if (!navigator.geolocation) {
        console.warn('Geolocation not available in this browser');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          if (!firstFixDone && options?.onFirstFix) {
            options.onFirstFix({ lat, lng });
            firstFixDone = true;
          }

          try {
            await supabase
              .from('profiles')
              .update({
                lat,
                lng,
                is_online: true,
                last_seen: new Date().toISOString()
              })
              .eq('id', user.id);
          } catch (err) {
            console.warn('location update failed', err);
          }
        },
        err => {
          console.warn('geolocation error', err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10_000,
          timeout: 20_000
        }
      );
    };

    start();

    const markOffline = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        await supabase
          .from('profiles')
          .update({
            is_online: false,
            last_seen: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('offline update failed', err);
      }
    };

    // mark offline on tab close
    const handleBeforeUnload = () => {
      void markOffline();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      cancelled = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      void markOffline();
    };
  }, []); // Empty dependency array - options shouldn't trigger re-subscriptions
}
