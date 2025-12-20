import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  generateToken,
  createRoom,
  isLiveKitConfigured,
  PULSE_ROOMS,
  type RoomType,
  type ParticipantMetadata,
} from '@/lib/livekit';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

interface TokenRequest {
  roomName: string;
  roomType?: RoomType;
}

export async function POST(request: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'livekit');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

  // Check if LiveKit is configured
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      { error: 'Video service is not configured' },
      { status: 503, headers: rateLimitHeaders(rateLimitResult) }
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

  // Parse request body
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const { roomName, roomType = 'pulse' } = body as TokenRequest;

  if (!roomName) {
    return NextResponse.json(
      { error: 'roomName is required' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate room name format
  if (!/^[a-zA-Z0-9_-]+$/.test(roomName)) {
    return NextResponse.json(
      { error: 'Invalid room name format' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Get user profile for metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, photo_url')
    .eq('id', user.id)
    .single();

  const participantName = profile?.display_name || 'Anonymous';
  const avatarUrl = profile?.photo_url || undefined;

  // Create participant metadata
  const metadata: ParticipantMetadata = {
    name: participantName,
    avatarUrl,
    userId: user.id,
    isHost: false,
    isModerator: false,
  };

  try {
    // Ensure room exists
    const room = await createRoom(roomName, roomType);
    if (!room) {
      return NextResponse.json(
        { error: 'Failed to create or access room' },
        { status: 500, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    // Generate token
    const token = await generateToken({
      roomName,
      participantName,
      participantIdentity: user.id,
      metadata,
      roomType,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // Get room info for response
    const roomInfo = PULSE_ROOMS[roomName as keyof typeof PULSE_ROOMS];

    return NextResponse.json(
      {
        token,
        room: {
          name: roomName,
          sid: room.sid,
          displayName: roomInfo?.name || roomName,
          description: roomInfo?.description || null,
        },
        participant: {
          identity: user.id,
          name: participantName,
        },
        serverUrl: process.env.NEXT_PUBLIC_LIVEKIT_URL,
      },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    return NextResponse.json(
      { error: 'Failed to generate access token' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }
}
