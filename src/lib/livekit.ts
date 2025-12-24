/**
 * LiveKit Server Configuration
 *
 * This module handles LiveKit token generation and room management
 * for group video conferencing and voice channels.
 *
 * Setup:
 * 1. Create account at https://cloud.livekit.io or self-host
 * 2. Add to .env.local:
 *    - LIVEKIT_API_KEY
 *    - LIVEKIT_API_SECRET
 *    - NEXT_PUBLIC_LIVEKIT_URL (WebSocket URL, e.g., wss://your-app.livekit.cloud)
 */

import {
  AccessToken,
  RoomServiceClient,
  VideoGrant,
  DataPacket_Kind,
} from 'livekit-server-sdk';

// LiveKit configuration
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL;

/**
 * Check if LiveKit is properly configured
 */
export function isLiveKitConfigured(): boolean {
  return !!(LIVEKIT_API_KEY && LIVEKIT_API_SECRET && LIVEKIT_URL);
}

/**
 * Get LiveKit Room Service Client for server-side room management
 */
export function getRoomServiceClient(): RoomServiceClient | null {
  if (!isLiveKitConfigured()) {
    console.warn('LiveKit is not configured');
    return null;
  }

  // Extract host from WebSocket URL
  const host = LIVEKIT_URL!.replace('wss://', 'https://').replace('ws://', 'http://');

  return new RoomServiceClient(host, LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!);
}

/**
 * Room types for different use cases
 */
export type RoomType = 'pulse' | 'channel' | 'group';

/**
 * Room configuration based on type
 */
interface RoomConfig {
  maxParticipants: number;
  emptyTimeout: number; // seconds
  departureTimeout: number; // seconds
}

const ROOM_CONFIGS: Record<RoomType, RoomConfig> = {
  // Pulse rooms - large conference style (Zoom-like)
  pulse: {
    maxParticipants: 400,
    emptyTimeout: 300, // 5 minutes
    departureTimeout: 20,
  },
  // Channels - persistent voice/video channels (Telegram/Discord-like)
  channel: {
    maxParticipants: 100,
    emptyTimeout: 0, // Never timeout - persistent
    departureTimeout: 10,
  },
  // Group events - medium sized gatherings
  group: {
    maxParticipants: 50,
    emptyTimeout: 600, // 10 minutes
    departureTimeout: 30,
  },
};

/**
 * Participant metadata structure
 */
export interface ParticipantMetadata {
  name: string;
  avatarUrl?: string;
  userId: string;
  isHost?: boolean;
  isModerator?: boolean;
}

/**
 * Token generation options
 */
export interface TokenOptions {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  metadata?: ParticipantMetadata;
  roomType?: RoomType;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  ttl?: number; // Token TTL in seconds
}

/**
 * Generate a LiveKit access token for a participant
 */
export async function generateToken(options: TokenOptions): Promise<string> {
  if (!isLiveKitConfigured()) {
    throw new Error('LiveKit is not configured. Check environment variables.');
  }

  const {
    roomName,
    participantName,
    participantIdentity,
    metadata,
    roomType = 'pulse',
    canPublish = true,
    canSubscribe = true,
    canPublishData = true,
    ttl = 3600 * 4, // 4 hours default
  } = options;

  const config = ROOM_CONFIGS[roomType];

  // Create video grant with permissions
  const videoGrant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish,
    canSubscribe,
    canPublishData, // For chat messages
    canUpdateOwnMetadata: true,
  };

  // Create access token
  const token = new AccessToken(LIVEKIT_API_KEY!, LIVEKIT_API_SECRET!, {
    identity: participantIdentity,
    name: participantName,
    ttl,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  });

  token.addGrant(videoGrant);

  return await token.toJwt();
}

/**
 * Create or get a LiveKit room
 */
export async function createRoom(
  roomName: string,
  roomType: RoomType = 'pulse'
): Promise<{ name: string; sid: string } | null> {
  const roomService = getRoomServiceClient();
  if (!roomService) return null;

  const config = ROOM_CONFIGS[roomType];

  try {
    // Try to get existing room first
    const rooms = await roomService.listRooms([roomName]);
    if (rooms.length > 0) {
      return {
        name: rooms[0].name,
        sid: rooms[0].sid,
      };
    }

    // Create new room
    const room = await roomService.createRoom({
      name: roomName,
      emptyTimeout: config.emptyTimeout,
      maxParticipants: config.maxParticipants,
      departureTimeout: config.departureTimeout,
    });

    return {
      name: room.name,
      sid: room.sid,
    };
  } catch (error) {
    console.error('Error creating LiveKit room:', error);
    return null;
  }
}

/**
 * List all participants in a room
 */
export async function listParticipants(roomName: string): Promise<
  Array<{
    identity: string;
    name: string;
    metadata?: string;
    joinedAt: number;
  }>
> {
  const roomService = getRoomServiceClient();
  if (!roomService) return [];

  try {
    const participants = await roomService.listParticipants(roomName);
    return participants.map((p) => ({
      identity: p.identity,
      name: p.name,
      metadata: p.metadata,
      joinedAt: Number(p.joinedAt),
    }));
  } catch (error) {
    console.error('Error listing participants:', error);
    return [];
  }
}

/**
 * Get room info including participant count
 */
export async function getRoomInfo(
  roomName: string
): Promise<{
  exists: boolean;
  participantCount: number;
  maxParticipants: number;
} | null> {
  const roomService = getRoomServiceClient();
  if (!roomService) return null;

  try {
    const rooms = await roomService.listRooms([roomName]);
    if (rooms.length === 0) {
      return {
        exists: false,
        participantCount: 0,
        maxParticipants: 0,
      };
    }

    const room = rooms[0];
    return {
      exists: true,
      participantCount: room.numParticipants,
      maxParticipants: room.maxParticipants,
    };
  } catch (error) {
    console.error('Error getting room info:', error);
    return null;
  }
}

/**
 * Delete/end a room
 */
export async function deleteRoom(roomName: string): Promise<boolean> {
  const roomService = getRoomServiceClient();
  if (!roomService) return false;

  try {
    await roomService.deleteRoom(roomName);
    return true;
  } catch (error) {
    console.error('Error deleting room:', error);
    return false;
  }
}

/**
 * Remove a participant from a room
 */
export async function removeParticipant(
  roomName: string,
  participantIdentity: string
): Promise<boolean> {
  const roomService = getRoomServiceClient();
  if (!roomService) return false;

  try {
    await roomService.removeParticipant(roomName, participantIdentity);
    return true;
  } catch (error) {
    console.error('Error removing participant:', error);
    return false;
  }
}

/**
 * Mute a participant's track (for moderation)
 */
export async function muteParticipant(
  roomName: string,
  participantIdentity: string,
  trackSid: string,
  muted: boolean
): Promise<boolean> {
  const roomService = getRoomServiceClient();
  if (!roomService) return false;

  try {
    await roomService.mutePublishedTrack(roomName, participantIdentity, trackSid, muted);
    return true;
  } catch (error) {
    console.error('Error muting participant:', error);
    return false;
  }
}

/**
 * Send data message to all participants in a room
 */
export async function sendRoomMessage(
  roomName: string,
  data: string | Uint8Array,
  destinationIdentities?: string[]
): Promise<boolean> {
  const roomService = getRoomServiceClient();
  if (!roomService) return false;

  try {
    const payload = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    await roomService.sendData(
      roomName,
      payload,
      DataPacket_Kind.RELIABLE,
      { destinationIdentities }
    );
    return true;
  } catch (error) {
    console.error('Error sending room message:', error);
    return false;
  }
}

/**
 * Predefined Pulse room names (persistent community rooms)
 */
export const PULSE_ROOMS = {
  'club-sltr': {
    name: 'Club SLTR',
    description: 'Main community hangout',
    theme: 'default',
  },
  'the-orbit': {
    name: 'The Orbit',
    description: '420 & chill vibes',
    theme: 'neon',
  },
  'the-den': {
    name: 'The Den',
    description: 'Late night sessions',
    theme: 'dark',
  },
  'after-hours': {
    name: 'After Hours',
    description: 'When the clubs close',
    theme: 'purple',
  },
} as const;

export type PulseRoomId = keyof typeof PULSE_ROOMS;
