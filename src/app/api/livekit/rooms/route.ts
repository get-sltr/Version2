import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  getRoomInfo,
  isLiveKitConfigured,
  PULSE_ROOMS,
} from '@/lib/livekit';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

/**
 * GET /api/livekit/rooms
 * List all Pulse rooms with participant counts
 */
export async function GET(request: Request) {
  // Rate limiting - with error handling
  let rateLimitResult = {
    success: true,
    limit: 999,
    remaining: 999,
    reset: Date.now() + 60000,
  };

  try {
    const clientId = getClientIdentifier(request);
    rateLimitResult = await checkUpstashRateLimit(clientId, 'api');

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimitResult),
        }
      );
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Continue without rate limiting if it fails
  }

  // Check if LiveKit is configured
  if (!isLiveKitConfigured()) {
    // Return mock data if not configured (for development)
    const mockRooms = Object.entries(PULSE_ROOMS).map(([id, room]) => ({
      id,
      name: room.name,
      description: room.description,
      theme: room.theme,
      participantCount: Math.floor(Math.random() * 100) + 10,
      maxParticipants: 400,
      isLive: true,
    }));

    return NextResponse.json(
      { rooms: mockRooms, mock: true },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Authenticate user
  try {
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
  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  try {
    // Get info for all Pulse rooms
    const roomPromises = Object.entries(PULSE_ROOMS).map(async ([id, room]) => {
      try {
        const info = await getRoomInfo(id);
        return {
          id,
          name: room.name,
          description: room.description,
          theme: room.theme,
          participantCount: info?.participantCount || 0,
          maxParticipants: info?.maxParticipants || 400,
          isLive: info?.exists || false,
        };
      } catch {
        // Return default room info if individual room fetch fails
        return {
          id,
          name: room.name,
          description: room.description,
          theme: room.theme,
          participantCount: 0,
          maxParticipants: 400,
          isLive: false,
        };
      }
    });

    const rooms = await Promise.all(roomPromises);

    return NextResponse.json(
      { rooms },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }
}
