'use client';

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/lib/supabase';

/**
 * OneSignalProvider - Initializes OneSignal push notifications
 * Should be added to the root layout
 */
export function OneSignalProvider() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      if (initialized) return;
      if (typeof window === 'undefined') return;

      // Skip on localhost - OneSignal only works on production domain
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('OneSignal: Skipping initialization on localhost');
        return;
      }

      const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
      if (!appId) {
        console.warn('OneSignal App ID not configured');
        return;
      }

      try {
        await OneSignal.init({
          appId,
          allowLocalhostAsSecureOrigin: true,
        });

        setInitialized(true);

        // Listen for subscription changes
        OneSignal.Notifications.addEventListener('permissionChange', async (permission) => {
          if (permission) {
            await linkUserToOneSignal();
          }
        });

        // Check if already subscribed and link user
        const permission = await OneSignal.Notifications.permission;
        if (permission) {
          await linkUserToOneSignal();
        }
      } catch (error) {
        console.error('OneSignal initialization error:', error);
      }
    };

    initOneSignal();
  }, [initialized]);

  return null;
}

/**
 * Link the current Supabase user to their OneSignal player ID
 * This allows sending targeted notifications to specific users
 */
async function linkUserToOneSignal() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get OneSignal player/subscription ID
    const playerId = await OneSignal.User.PushSubscription.id;
    if (!playerId) return;

    // Set external user ID in OneSignal (links to Supabase user)
    await OneSignal.login(user.id);

    // Optionally store player ID in your database for server-side notifications
    const { error } = await supabase
      .from('profiles')
      .update({ onesignal_player_id: playerId })
      .eq('id', user.id);

    if (error) {
      // Column may not exist yet - fail silently
      console.debug('OneSignal player ID not saved:', error.message);
    }

    console.log('OneSignal linked to user:', user.id);
  } catch (error) {
    console.error('Error linking OneSignal user:', error);
  }
}

/**
 * Request push notification permission
 * Call this when user clicks "Enable Notifications" button
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    await OneSignal.Notifications.requestPermission();
    const permission = await OneSignal.Notifications.permission;

    if (permission) {
      await linkUserToOneSignal();
    }

    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Check if notifications are enabled
 */
export async function isNotificationsEnabled(): Promise<boolean> {
  try {
    return await OneSignal.Notifications.permission;
  } catch {
    return false;
  }
}

/**
 * Add a tag to the user (for segmentation)
 * e.g., addTag('interests', 'bears') or addTag('city', 'LA')
 */
export async function addTag(key: string, value: string): Promise<void> {
  try {
    await OneSignal.User.addTag(key, value);
  } catch (error) {
    console.error('Error adding OneSignal tag:', error);
  }
}

/**
 * Remove a tag from the user
 */
export async function removeTag(key: string): Promise<void> {
  try {
    await OneSignal.User.removeTag(key);
  } catch (error) {
    console.error('Error removing OneSignal tag:', error);
  }
}
