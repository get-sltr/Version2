import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  getRoomInfo,
  listParticipants,
  isLiveKitConfigured,
  PULSE_ROOMS,
} from '@/lib/livekit';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

interface RouteParams {
  roomName: string;
}

/**
 * GET /api/livekit/rooms/[roomName]
 * Get detailed info about a specific room including participants
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<RouteParams> }
) {
  const { roomName } = await params;

  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'api');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate room name
  if (!roomName || !/^[a-zA-Z0-9_-]+$/.test(roomName)) {
    return NextResponse.json(
      { error: 'Invalid room name' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Check if LiveKit is configured
  if (!isLiveKitConfigured()) {
    // Return mock data for development
    const roomInfo = PULSE_ROOMS[roomName as keyof typeof PULSE_ROOMS];
    if (!roomInfo) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    return NextResponse.json(
      {
        room: {
          id: roomName,
          name: roomInfo.name,
          description: roomInfo.description,
          theme: roomInfo.theme,
          participantCount: Math.floor(Math.random() * 100) + 10,
          maxParticipants: 400,
          isLive: true,
        },
        participants: [],
        mock: true,
      },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Authenticate user
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    // Get room info
    const info = await getRoomInfo(roomName);
    const roomConfig = PULSE_ROOMS[roomName as keyof typeof PULSE_ROOMS];

    if (!info?.exists && !roomConfig) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Get participants if room exists
    let participants: Array<{
      identity: string;
      name: string;
      avatarUrl?: string;
      joinedAt: number;
    }> = [];

    if (info?.exists) {
      const rawParticipants = await listParticipants(roomName);
      participants = rawParticipants.map((p) => {
        let metadata: { avatarUrl?: string } = {};
        try {
          metadata = p.metadata ? JSON.parse(p.metadata) : {};
        } catch {
          // Invalid metadata
        }
        return {
          identity: p.identity,
          name: p.name,
          avatarUrl: metadata.avatarUrl,
          joinedAt: p.joinedAt,
        };
      });
    }

    return NextResponse.json(
      {
        room: {
          id: roomName,
          name: roomConfig?.name || roomName,
          description: roomConfig?.description || null,
          theme: roomConfig?.theme || 'default',
          participantCount: info?.participantCount || 0,
          maxParticipants: info?.maxParticipants || 400,
          isLive: info?.exists || false,
        },
        participants,
      },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Error fetching room info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room info' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }
}
