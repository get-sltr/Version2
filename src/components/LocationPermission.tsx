'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

const STORAGE_KEY = 'primal_location_state';

interface LocationState {
  granted: boolean;
  dismissedUntil: number | null; // timestamp when dismiss expires
}

/**
 * Persist location permission state to localStorage
 * - granted: user has allowed location access
 * - dismissedUntil: user dismissed prompt, don't ask until this timestamp
 */
function getStoredState(): LocationState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { granted: false, dismissedUntil: null };
}

function saveState(state: Partial<LocationState>) {
  try {
    const current = getStoredState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...state }));
  } catch {
    // Ignore storage errors
  }
}

/**
 * LocationPermission - Handles location permission flow
 *
 * Logic:
 * 1. If already granted (localStorage), silently update location
 * 2. If browser permission is 'granted', mark as granted and update
 * 3. If browser permission is 'prompt' and not dismissed, show our prompt
 * 4. If user dismisses, don't ask again for 24 hours
 */
export function LocationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const hasChecked = useRef(false);
  const isRequesting = useRef(false);

  // Get user on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    return () => subscription.unsubscribe();
  }, []);

  // Save location to database
  const updateLocation = useCallback(async (lat: number, lng: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ lat, lng, last_seen: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Location update failed:', error);
    } else {
      saveState({ granted: true });
    }
  }, [user]);

  // Request location from browser
  const requestLocation = useCallback(() => {
    if (isRequesting.current) return;
    isRequesting.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude);
        setShowPrompt(false);
        isRequesting.current = false;
      },
      (error) => {
        console.warn('Location error:', error.message);
        setShowPrompt(false);
        isRequesting.current = false;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [updateLocation]);

  // Main permission check
  useEffect(() => {
    if (!user || hasChecked.current) return;
    hasChecked.current = true;

    const check = async () => {
      if (!navigator.geolocation) return;

      const state = getStoredState();

      // Already granted - just update location silently
      if (state.granted) {
        requestLocation();
        return;
      }

      // Recently dismissed - don't show prompt
      if (state.dismissedUntil && Date.now() < state.dismissedUntil) {
        return;
      }

      // Check browser permission state
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });

          if (permission.state === 'granted') {
            saveState({ granted: true });
            requestLocation();
          } else if (permission.state === 'prompt') {
            setShowPrompt(true);
          }
          // If 'denied', do nothing

        } catch {
          // Permissions API failed, show prompt
          setShowPrompt(true);
        }
      } else {
        // No Permissions API, show prompt
        setShowPrompt(true);
      }
    };

    check();
  }, [user, requestLocation]);

  // Reset when user changes
  useEffect(() => {
    if (!user) {
      hasChecked.current = false;
      setShowPrompt(false);
    }
  }, [user]);

  const handleEnable = () => {
    requestLocation();
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Dismiss for 24 hours
    saveState({ dismissedUntil: Date.now() + 24 * 60 * 60 * 1000 });
  };

  if (!user || !showPrompt) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
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

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          Enable Location
        </h2>

        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '28px' }}>
          Primal uses your location to show you nearby profiles on the grid and map.
          Your exact location is never shared with other users.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleEnable}
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

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '20px' }}>
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
}
