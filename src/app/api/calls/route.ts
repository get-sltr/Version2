import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '../../../lib/supabaseServer';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '../../../lib/upstash-rate-limit';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

export async function POST(request: Request) {
  // Apply rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'calls');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

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

  const body = await request.json().catch(() => null);
  const participantId = body?.participantId as string | undefined;

  if (!participantId) {
    return NextResponse.json(
      { error: 'participantId is required' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Validate participantId is a valid UUID to prevent injection
  if (!isValidUUID(participantId)) {
    return NextResponse.json(
      { error: 'Invalid participantId format' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Prevent calling yourself
  if (participantId === user.id) {
    return NextResponse.json(
      { error: 'Cannot create a call with yourself' },
      { status: 400, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  if (!process.env.DAILY_API_KEY) {
    console.error('DAILY_API_KEY is not configured');
    return NextResponse.json(
      { error: 'Video service is not configured' },
      { status: 503, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const sortedParticipants = [user.id, participantId].sort().join('-');
  const roomName = `primal-${sortedParticipants}-${Date.now()}`;

  const response = await fetch('https://api.daily.co/v1/rooms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: roomName,
      properties: {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        max_participants: 2,
        nbf: Math.floor(Date.now() / 1000) - 30,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Daily.co API error:', data);
    return NextResponse.json(
      { error: 'Unable to create video room' },
      { status: response.status || 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  return NextResponse.json(
    {
      room: {
        name: data?.name,
        url: data?.url,
        config: data?.config,
      },
    },
    { headers: rateLimitHeaders(rateLimitResult) }
  );
}
