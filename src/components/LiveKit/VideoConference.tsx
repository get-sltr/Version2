'use client';

import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
  useParticipants,
  Chat,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomOptions, VideoPresets } from 'livekit-client';
import { useTheme } from '@/contexts/ThemeContext';
import { useMediaPermissions } from '@/hooks/useMediaPermissions';

interface VideoConferenceProps {
  roomName: string;
  onLeave?: () => void;
}

/**
 * Main Video Conference Component (Zoom-style)
 * Used for Pulse rooms and Group events
 */
export default function VideoConference({ roomName, onLeave }: VideoConferenceProps) {
  const { colors } = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const { status: mediaStatus, errorMessage: mediaError, requestPermissions } = useMediaPermissions();

  // Only fetch token AFTER permissions are granted
  useEffect(() => {
    if (mediaStatus !== 'granted') return;

    const fetchToken = async () => {
      try {
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName, roomType: 'pulse' }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to get access token');
        }

        const data = await response.json();
        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [roomName, mediaStatus]);

  // Permission prompt screen - requires user tap
  if (mediaStatus === 'idle' || mediaStatus === 'checking' || mediaStatus === 'prompt') {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background,
          color: colors.text,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '24px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 24px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.accent}, #ff8c5a)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '44px',
            boxShadow: `0 8px 32px ${colors.accent}66`,
          }}>
            📹
          </div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>
            Allow Camera &amp; Mic
          </div>
          <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px', lineHeight: 1.5 }}>
            Primal Men needs access to your camera and microphone to join this room.
          </div>
          <button
            onClick={requestPermissions}
            disabled={mediaStatus === 'checking'}
            style={{
              padding: '16px 48px',
              background: mediaStatus === 'checking' ? `${colors.accent}80` : colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '30px',
              fontSize: '17px',
              fontWeight: 600,
              cursor: mediaStatus === 'checking' ? 'wait' : 'pointer',
              boxShadow: `0 4px 20px ${colors.accent}66`,
            }}
          >
            {mediaStatus === 'checking' ? 'Checking...' : 'Allow Access'}
          </button>
          <button
            onClick={onLeave}
            style={{
              display: 'block',
              margin: '16px auto 0',
              padding: '12px 24px',
              background: 'transparent',
              border: 'none',
              color: colors.text,
              opacity: 0.5,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Permission denied or error screen
  if (mediaStatus === 'denied' || mediaStatus === 'error') {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background,
          color: colors.text,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '360px', padding: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
            Camera &amp; Microphone Required
          </div>
          <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px', lineHeight: 1.5 }}>
            {mediaError || 'Please enable camera and microphone access in your device Settings.'}
          </div>
          <button
            onClick={onLeave}
            style={{
              padding: '12px 24px',
              background: colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background,
          color: colors.text,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>Connecting...</div>
          <div style={{ fontSize: '14px', opacity: 0.6 }}>Setting up your video</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colors.background,
          color: colors.text,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>Connection Failed</div>
          <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px' }}>{error}</div>
          <button
            onClick={onLeave}
            style={{
              padding: '12px 24px',
              background: colors.accent,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return null;
  }

  // Room options to handle device issues gracefully
  const roomOptions: RoomOptions = {
    adaptiveStream: true,
    dynacast: true,
    videoCaptureDefaults: {
      resolution: VideoPresets.h720.resolution,
    },
    // Don't fail if devices aren't available
    stopLocalTrackOnUnpublish: true,
  };

  return (
    <div style={{ height: '100vh', background: '#000' }}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={true}
        audio={true}
        options={roomOptions}
        onDisconnected={onLeave}
        onError={(err) => {
          console.error('LiveKit error:', err);
          // Don't set error state for device issues - just log them and continue
          const msg = err.message?.toLowerCase() || '';
          if (!msg.includes('device not found') && !msg.includes('media permissions') && !msg.includes('notfounderror')) {
            setError(err.message);
          }
        }}
        style={{ height: '100%' }}
        data-lk-theme="default"
      >
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Main video area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <RoomHeader roomName={roomName} />

            {/* Video Grid */}
            <div style={{ flex: 1, position: 'relative' }}>
              <VideoGrid />
            </div>

            {/* Custom Controls */}
            <div
              style={{
                padding: '16px',
                background: 'rgba(0,0,0,0.8)',
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
              }}
            >
              <ControlBar
                variation="minimal"
                controls={{
                  microphone: true,
                  camera: true,
                  screenShare: true,
                  leave: true,
                  chat: false,
                }}
              />
              <button
                onClick={() => setShowChat(!showChat)}
                style={{
                  padding: '10px 16px',
                  background: showChat ? colors.accent : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                💬 Messages
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div
              style={{
                width: '320px',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(0,0,0,0.9)',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>Messages</span>
                <button
                  onClick={() => setShowChat(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '16px',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,107,53,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  ✕
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Chat style={{ height: '100%' }} />
              </div>
            </div>
          )}
        </div>
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

/**
 * Room Header Component
 */
function RoomHeader({
  roomName,
}: {
  roomName: string;
}) {
  const participants = useParticipants();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: '#fff', fontWeight: 600 }}>{roomName}</span>
        <span
          style={{
            background: '#ff4444',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          LIVE
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          👥 {participants.length}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          ⏱️ {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}

/**
 * Custom Video Grid - displays participant tiles without built-in controls
 */
function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout
      tracks={tracks}
      style={{ height: '100%' }}
    >
      <ParticipantTile />
    </GridLayout>
  );
}
