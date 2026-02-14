'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  TrackToggle,
  DisconnectButton,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track, RoomEvent, Participant } from 'livekit-client';
import { useTheme } from '@/contexts/ThemeContext';

interface VoiceChannelProps {
  channelId: string;
  channelName: string;
  onLeave?: () => void;
}

/**
 * Voice/Video Channel Component (Telegram/Discord-style)
 * Persistent channels for community voice rooms
 */
export default function VoiceChannel({ channelId, channelName, onLeave }: VoiceChannelProps) {
  const { colors } = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName: `channel-${channelId}`,
            roomType: 'channel',
          }),
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
  }, [channelId]);

  if (loading) {
    return (
      <div
        style={{
          padding: '20px',
          background: colors.surface,
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: colors.text }}>Connecting to voice channel...</div>
      </div>
    );
  }

  if (error || !token || !serverUrl) {
    return (
      <div
        style={{
          padding: '20px',
          background: colors.surface,
          borderRadius: '12px',
          textAlign: 'center',
        }}
      >
        <div style={{ color: colors.accent, marginBottom: '12px' }}>
          {error || 'Failed to connect'}
        </div>
        <button
          onClick={onLeave}
          style={{
            padding: '8px 16px',
            background: colors.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={videoEnabled}
      audio={true}
      onDisconnected={onLeave}
      style={{ background: 'transparent' }}
    >
      <ChannelUI
        channelName={channelName}
        videoEnabled={videoEnabled}
        onToggleVideo={() => setVideoEnabled(!videoEnabled)}
        onLeave={onLeave}
      />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

/**
 * Channel UI - Shows participants and controls
 */
function ChannelUI({
  channelName,
  videoEnabled,
  onToggleVideo,
  onLeave,
}: {
  channelName: string;
  videoEnabled: boolean;
  onToggleVideo: () => void;
  onLeave?: () => void;
}) {
  const { colors } = useTheme();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const room = useRoomContext();

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Channel Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔊</span>
          <span style={{ color: colors.text, fontWeight: 600 }}>{channelName}</span>
          <span
            style={{
              background: '#4caf50',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
            }}
          />
        </div>
        <span style={{ color: colors.textSecondary, fontSize: '14px' }}>
          {participants.length} in channel
        </span>
      </div>

      {/* Participants List */}
      <div style={{ padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
        {participants.map((participant) => (
          <ParticipantItem
            key={participant.identity}
            participant={participant}
            isLocal={participant.identity === localParticipant.localParticipant?.identity}
          />
        ))}

        {participants.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: colors.textSecondary,
            }}
          >
            No one else in the channel yet
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <TrackToggle
          source={Track.Source.Microphone}
          style={{
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🎤 Mute
        </TrackToggle>

        <button
          onClick={onToggleVideo}
          style={{
            padding: '10px 16px',
            background: videoEnabled ? colors.accent : 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          📹 {videoEnabled ? 'Hide Video' : 'Show Video'}
        </button>

        <DisconnectButton
          style={{
            padding: '10px 16px',
            background: '#ff4444',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Leave
        </DisconnectButton>
      </div>

      {/* Video Grid (if enabled) */}
      {videoEnabled && participants.some((p) => p.videoTrackPublications.size > 0) && (
        <div
          style={{
            padding: '12px',
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <VideoGrid participants={participants} />
        </div>
      )}
    </div>
  );
}

/**
 * Individual Participant Item
 */
function ParticipantItem({
  participant,
  isLocal,
}: {
  participant: Participant;
  isLocal: boolean;
}) {
  const { colors } = useTheme();
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: false });
  const audioTrack = tracks.find(
    (t) =>
      t.participant.identity === participant.identity &&
      t.source === Track.Source.Microphone
  );

  const isSpeaking = participant.isSpeaking;
  const isMuted = audioTrack?.publication?.isMuted !== false;

  // Parse metadata for avatar
  let avatarUrl: string | undefined;
  let displayName = participant.name || participant.identity;
  try {
    const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
    avatarUrl = metadata.avatarUrl;
    displayName = metadata.name || displayName;
  } catch {
    // Invalid metadata
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        borderRadius: '8px',
        background: isSpeaking ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
        border: isSpeaking ? '1px solid #4caf50' : '1px solid transparent',
        marginBottom: '4px',
        transition: 'all 0.2s',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: avatarUrl ? `url(${avatarUrl})` : colors.accent,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 600,
          fontSize: '14px',
          border: isSpeaking ? '2px solid #4caf50' : '2px solid transparent',
        }}
      >
        {!avatarUrl && displayName.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <div style={{ flex: 1 }}>
        <div style={{ color: colors.text, fontSize: '14px', fontWeight: 500 }}>
          {displayName}
          {isLocal && (
            <span style={{ color: colors.textSecondary, marginLeft: '4px' }}>(You)</span>
          )}
        </div>
      </div>

      {/* Status Icons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {isSpeaking && (
          <span style={{ fontSize: '14px', color: '#4caf50' }}>🎙️</span>
        )}
        {isMuted && (
          <span style={{ fontSize: '14px', opacity: 0.5 }}>🔇</span>
        )}
      </div>
    </div>
  );
}

/**
 * Video Grid for when video is enabled
 */
function VideoGrid({ participants }: { participants: Participant[] }) {
  const videoParticipants = participants.filter(
    (p) => p.videoTrackPublications.size > 0
  );

  if (videoParticipants.length === 0) {
    return null;
  }

  const gridCols = videoParticipants.length <= 2 ? 2 : videoParticipants.length <= 4 ? 2 : 3;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gap: '8px',
      }}
    >
      {videoParticipants.map((participant) => (
        <VideoTile key={participant.identity} participant={participant} />
      ))}
    </div>
  );
}

/**
 * Individual Video Tile
 */
function VideoTile({ participant }: { participant: Participant }) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const videoTrack = tracks.find(
    (t) =>
      t.participant.identity === participant.identity &&
      t.source === Track.Source.Camera
  );

  const track = videoTrack?.publication?.track;

  if (!track) {
    return null;
  }

  return (
    <div
      style={{
        aspectRatio: '16/9',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#000',
        position: 'relative',
      }}
    >
      <video
        ref={(el) => {
          if (el && track) {
            track.attach(el);
          }
        }}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        autoPlay
        playsInline
        muted
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          background: 'rgba(0,0,0,0.6)',
          padding: '4px 8px',
          borderRadius: '4px',
          color: '#fff',
          fontSize: '12px',
        }}
      >
        {participant.name || participant.identity}
      </div>
    </div>
  );
}
