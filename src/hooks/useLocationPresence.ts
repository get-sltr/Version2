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
    let permissionStatus: PermissionStatus | null = null;

    const startWatching = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      if (!navigator.geolocation) {
        console.warn('Geolocation not available in this browser');
        return;
      }

      // Don't start if already watching
      if (watchId !== null) return;

      // Check permission state before requesting location
      let hasPermission = false;
      
      if ('permissions' in navigator) {
        try {
          permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          hasPermission = permissionStatus.state === 'granted';
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            if (permissionStatus?.state === 'granted' && !watchId && !cancelled) {
              // Permission was granted, start watching
              void startWatching();
            } else if (permissionStatus?.state === 'denied' || permissionStatus?.state === 'prompt') {
              // Permission was denied or reset, stop watching
              if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
              }
            }
          };
        } catch {
          // Permissions API not fully supported, will try to watch anyway
          // but this will trigger a prompt if permission not granted
        }
      }

      // Only start watching if permission is granted
      // If permissions API is not available, we'll try but it may prompt
      if (hasPermission || !('permissions' in navigator)) {
        try {
          watchId = navigator.geolocation.watchPosition(
            async pos => {
              if (cancelled) return;
              
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
              // If permission denied, stop trying
              if (err.code === 1) {
                if (watchId !== null) {
                  navigator.geolocation.clearWatch(watchId);
                  watchId = null;
                }
              }
            },
            {
              enableHighAccuracy: true,
              maximumAge: 10_000,
              timeout: 20_000
            }
          );
        } catch (err) {
          console.warn('Failed to start location watching:', err);
        }
      } else {
        // Permission not granted, don't request it here
        // Let LocationPermission component handle the permission request
        console.log('Location permission not granted, waiting for user to grant permission');
      }
    };

    void startWatching();

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
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      void markOffline();
    };
  }, []); // Empty dependency array - options shouldn't trigger re-subscriptions
}
