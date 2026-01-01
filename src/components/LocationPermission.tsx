'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const LOCATION_PROMPT_DISMISSED_KEY = 'sltr_location_prompt_dismissed';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * LocationPermission - Requests location permission after user logs in
 * Shows a prompt if permission is not granted, updates user's location in database
 */
export function LocationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [user, setUser] = useState<User | null>(null);
  const isRequestingLocation = useRef(false);

  // Check if user recently dismissed the prompt
  const wasRecentlyDismissed = (): boolean => {
    try {
      const dismissed = localStorage.getItem(LOCATION_PROMPT_DISMISSED_KEY);
      if (!dismissed) return false;
      const dismissedAt = parseInt(dismissed, 10);
      return Date.now() - dismissedAt < DISMISS_DURATION_MS;
    } catch {
      return false;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Only check location when we have an authenticated user
  useEffect(() => {
    if (user) {
      checkAndRequestLocation();
    } else {
      // Reset state when user logs out
      setShowPrompt(false);
      setPermissionState('checking');
    }
  }, [user]);

  const checkAndRequestLocation = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    // Check permission state if available
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(permission.state as 'prompt' | 'granted' | 'denied');

        if (permission.state === 'prompt') {
          // Only show prompt if not recently dismissed
          if (!wasRecentlyDismissed()) {
            setShowPrompt(true);
          }
        } else if (permission.state === 'granted') {
          // Already granted, get location silently
          requestLocation();
        }

        // Listen for permission changes
        permission.onchange = () => {
          setPermissionState(permission.state as 'prompt' | 'granted' | 'denied');
          if (permission.state === 'granted') {
            setShowPrompt(false);
            requestLocation();
          }
        };
      } catch {
        // Permissions API not fully supported, try requesting directly
        if (!wasRecentlyDismissed()) {
          setShowPrompt(true);
        }
      }
    } else {
      // No permissions API, show prompt if not recently dismissed
      if (!wasRecentlyDismissed()) {
        setShowPrompt(true);
      }
    }
  };

  const requestLocation = () => {
    if (!user) {
      console.warn('No user logged in, skipping location save');
      return;
    }

    // Prevent duplicate requests
    if (isRequestingLocation.current) {
      return;
    }
    isRequestingLocation.current = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;

        const { error } = await supabase
          .from('profiles')
          .update({
            lat,
            lng,
            last_seen: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) {
          console.error('Location update failed:', error);
        } else {
          console.log('Location saved:', { lat, lng, userId: user.id });
        }

        setShowPrompt(false);
        setPermissionState('granted');
        isRequestingLocation.current = false;
      },
      (error) => {
        console.warn('Location error:', error.message);
        if (error.code === 1) {
          setPermissionState('denied');
        }
        setShowPrompt(false);
        isRequestingLocation.current = false;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleEnableLocation = () => {
    requestLocation();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 24 hours
    try {
      localStorage.setItem(LOCATION_PROMPT_DISMISSED_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }
  };

  // Don't render anything if no user or no prompt needed
  if (!user || !showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '24px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid rgba(255,107,53,0.3)',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,107,53,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px',
          }}
        >
          📍
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '12px',
          }}
        >
          Enable Location
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.6,
            marginBottom: '28px',
          }}
        >
          SLTR uses your location to show you nearby profiles on the grid and map.
          Your exact location is never shared with other users.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleEnableLocation}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #FF6B35, #ff8c5a)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Enable Location
          </button>
          <button
            onClick={handleDismiss}
            style={{
              width: '100%',
              padding: '16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '12px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            Not Now
          </button>
        </div>

        {/* Note */}
        <p
          style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '20px',
          }}
        >
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
}
