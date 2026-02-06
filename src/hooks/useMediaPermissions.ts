// =============================================================================
// useMediaPermissions - Request camera/microphone before video calls
// =============================================================================
// In Capacitor WKWebView, getUserMedia triggers the native iOS permission dialog.
// Info.plist must have NSCameraUsageDescription and NSMicrophoneUsageDescription.
// IMPORTANT: Permissions MUST be requested BEFORE initializing video SDKs.
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export type PermissionStatus = 'idle' | 'checking' | 'prompt' | 'granted' | 'denied' | 'error';

interface UseMediaPermissionsReturn {
  status: PermissionStatus;
  errorMessage: string | null;
  requestPermissions: () => Promise<boolean>;
  checkPermissions: () => Promise<void>;
}

export function useMediaPermissions(): UseMediaPermissionsReturn {
  const [status, setStatus] = useState<PermissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check current permission state without prompting
  const checkPermissions = useCallback(async () => {
    // On native Capacitor, we always need to prompt via getUserMedia
    // Don't assume granted — the iOS dialog must fire
    if (Capacitor.isNativePlatform()) {
      setStatus('prompt');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setStatus('prompt');
      return;
    }

    if (!navigator.permissions) {
      setStatus('prompt');
      return;
    }

    setStatus('checking');

    try {
      const [camera, mic] = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }).catch(() => null),
        navigator.permissions.query({ name: 'microphone' as PermissionName }).catch(() => null),
      ]);

      const cameraState = camera?.state || 'prompt';
      const micState = mic?.state || 'prompt';

      if (cameraState === 'granted' && micState === 'granted') {
        setStatus('granted');
      } else if (cameraState === 'denied' || micState === 'denied') {
        setStatus('denied');
        setErrorMessage('Camera or microphone access is blocked. Please enable in Settings.');
      } else {
        setStatus('prompt');
      }
    } catch {
      setStatus('prompt');
    }
  }, []);

  // Request permissions via getUserMedia (triggers native iOS dialog in WKWebView)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (status === 'granted') return true;

    setStatus('checking');
    setErrorMessage(null);

    try {
      // On Capacitor native, try getUserMedia which triggers the iOS permission dialog
      // This works in WKWebView — it fires the native permission prompt
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // Stop the test stream immediately — we just needed the permission
        stream.getTracks().forEach((t) => t.stop());

        setStatus('granted');
        return true;
      }

      // If getUserMedia is truly unavailable (very old WebView), still allow
      // because the video SDK iframe may handle permissions itself
      console.warn('getUserMedia not available, allowing call to proceed');
      setStatus('granted');
      return true;
    } catch (err: any) {
      console.error('Media permissions error:', err);
      const name = err?.name || '';
      const message = err?.message || '';

      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        setErrorMessage(
          'Camera/microphone access was denied. Please enable permissions in your device Settings, then try again.'
        );
        return false;
      }

      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        // No camera/mic hardware — still allow the call (audio-only)
        setStatus('granted');
        return true;
      }

      if (name === 'NotReadableError' || message.includes('in use')) {
        setStatus('error');
        setErrorMessage('Camera or microphone is in use by another app. Close other apps and try again.');
        return false;
      }

      if (name === 'AbortError' || name === 'SecurityError') {
        setStatus('error');
        setErrorMessage('Could not access camera/microphone due to security settings.');
        return false;
      }

      // Unknown error
      setStatus('error');
      setErrorMessage(err?.message || 'Could not access camera or microphone.');
      return false;
    }
  }, [status]);

  // Check on mount
  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return { status, errorMessage, requestPermissions, checkPermissions };
}
