// =============================================================================
// useMediaPermissions - Request camera/microphone before video calls
// =============================================================================
// In Capacitor WKWebView, getUserMedia triggers the native iOS permission dialog.
// Info.plist must have NSCameraUsageDescription and NSMicrophoneUsageDescription.
// =============================================================================

import { useState, useCallback, useEffect } from 'react';

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
    // In Capacitor iOS WebView, navigator.mediaDevices may not exist
    // Let the video call iframe handle permissions natively
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      // Skip permission check - let Daily.co/LiveKit handle it
      setStatus('granted');
      return;
    }

    if (!navigator.permissions) {
      // Can't check permissions API — assume we need to prompt
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
      // Permissions API not available (iOS Safari) — need to prompt
      setStatus('prompt');
    }
  }, []);

  // Request permissions via getUserMedia (triggers native iOS dialog)
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (status === 'granted') return true;

    // In Capacitor iOS WebView, navigator.mediaDevices may not exist
    // Let the video call iframe handle permissions natively
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setStatus('granted');
      return true;
    }

    setStatus('checking');
    setErrorMessage(null);

    try {
      // getUserMedia triggers the native iOS/browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Stop the test stream immediately — we just needed the permission
      stream.getTracks().forEach((t) => t.stop());

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
        // No camera/mic hardware — still allow the call
        setStatus('granted');
        return true;
      }

      if (name === 'NotReadableError' || message.includes('in use')) {
        // Device is busy (another app using camera)
        setStatus('error');
        setErrorMessage('Camera or microphone is in use by another app. Close other apps and try again.');
        return false;
      }

      if (name === 'AbortError' || name === 'SecurityError') {
        // Security restriction or user aborted
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
