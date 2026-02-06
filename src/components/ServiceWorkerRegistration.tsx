'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Skip service worker on native — Capacitor handles caching
    if (Capacitor.isNativePlatform()) return;

    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, prompt user to refresh
                  console.log('New content available, refresh to update.');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return null;
}

export default ServiceWorkerRegistration;
