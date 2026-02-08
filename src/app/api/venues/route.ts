import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.FOURSQUARE_CLIENT_ID;
const CLIENT_SECRET = process.env.FOURSQUARE_CLIENT_SECRET;
const BASE_URL = 'https://api.foursquare.com/v2/venues';

// Category IDs for bars/clubs (v2 format)
const VENUE_CATEGORIES = [
  '4bf58dd8d48988d116941735', // Bar
  '4bf58dd8d48988d11f941735', // Nightclub
  '4bf58dd8d48988d121941735', // Lounge
  '4bf58dd8d48988d11e941735', // Cocktail Bar
  '4bf58dd8d48988d118941735', // Dive Bar
  '4bf58dd8d48988d1d8941735', // Gay Bar
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '8000';

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat/lng' }, { status: 400 });
  }

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
