import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

const CLIENT_ID = process.env.FOURSQUARE_CLIENT_ID;
const CLIENT_SECRET = process.env.FOURSQUARE_CLIENT_SECRET;
const BASE_URL = 'https://api.foursquare.com/v2/venues';

const VENUE_CATEGORIES = [
  '4bf58dd8d48988d116941735', // Bar
  '4bf58dd8d48988d11f941735', // Nightclub
  '4bf58dd8d48988d121941735', // Lounge
  '4bf58dd8d48988d11e941735', // Cocktail Bar
  '4bf58dd8d48988d118941735', // Dive Bar
  '4bf58dd8d48988d1d8941735', // Gay Bar
];

const MAX_RADIUS = 50000;

export async function GET(request: NextRequest) {
  // Rate limiting
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'venues');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  // Auth
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401, headers: rateLimitHeaders(rateLimitResult) }
    );
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const rawRadius = searchParams.get('radius') || '8000';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json({ error: 'Invalid lat/lng values' }, { status: 400 });
  }

  const radius = String(Math.min(Math.max(1, parseInt(rawRadius) || 8000), MAX_RADIUS));

  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Foursquare credentials not configured');
    return NextResponse.json({ venues: [] });
  }

  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      ll: `${lat},${lng}`,
      radius,
      limit: '50',
      categoryId: VENUE_CATEGORIES.join(','),
      v: '20231201', // API version date
    });

    const response = await fetch(`${BASE_URL}/search?${params}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Foursquare API error:', response.status, errorText);
      return NextResponse.json({ venues: [], error: `API error: ${response.status}` });
    }

    const data = await response.json();
    const venues = (data.response?.venues || []).map((venue: any) => {
      const category = venue.categories?.[0];

      return {
        id: venue.id,
        name: venue.name,
        lat: venue.location?.lat,
        lng: venue.location?.lng,
        address: venue.location?.formattedAddress?.join(', ') || venue.location?.address,
        category: category?.name || 'Venue',
        categoryIcon: category ? `${category.icon?.prefix}64${category.icon?.suffix}` : undefined,
        distance: venue.location?.distance,
      };
    });

    return NextResponse.json({ venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ venues: [], error: 'Failed to fetch venues' });
  }
}
