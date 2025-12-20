/**
 * Foursquare Places API Integration
 * Used to fetch nearby LGBTQ+ friendly bars, clubs, and venues
 */

const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;
const BASE_URL = 'https://api.foursquare.com/v3/places';

export interface FoursquareVenue {
  fsq_id: string;
  name: string;
  location: {
    address?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    country?: string;
    formatted_address?: string;
  };
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  categories: Array<{
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }>;
  distance?: number;
  rating?: number;
  hours?: {
    display?: string;
    is_local_holiday?: boolean;
    open_now?: boolean;
  };
  photos?: Array<{
    id: string;
    prefix: string;
    suffix: string;
    width: number;
    height: number;
  }>;
}

export interface MapVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  category: string;
  categoryIcon?: string;
  distance?: number;
  rating?: number;
  isOpen?: boolean;
  photoUrl?: string;
}

// Category IDs for LGBTQ+ friendly venues
const VENUE_CATEGORIES = {
  gayBar: '13003', // Gay Bar
  nightclub: '10032', // Nightclub
  bar: '13003', // Bar
  lounge: '13009', // Lounge
  pub: '13012', // Pub
  cocktailBar: '13017', // Cocktail Bar
  wineBar: '13035', // Wine Bar
  diveBar: '13019', // Dive Bar
  sportsBar: '13028', // Sports Bar
  restaurant: '13065', // Restaurant
  cafe: '13034', // Cafe
  brunch: '13026', // Brunch
};

/**
 * Search for nearby venues (bars, clubs, restaurants)
 */
export async function searchNearbyVenues(
  lat: number,
  lng: number,
  options: {
    radius?: number; // in meters, max 100000
    limit?: number;
    categories?: string[];
    query?: string;
  } = {}
): Promise<MapVenue[]> {
  if (!FOURSQUARE_API_KEY) {
    console.warn('Foursquare API key not configured');
    return [];
  }

  const {
    radius = 5000, // 5km default
    limit = 50,
    categories = [
      VENUE_CATEGORIES.gayBar,
      VENUE_CATEGORIES.nightclub,
      VENUE_CATEGORIES.bar,
      VENUE_CATEGORIES.lounge,
      VENUE_CATEGORIES.cocktailBar,
    ],
    query,
  } = options;

  try {
    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: radius.toString(),
      limit: limit.toString(),
      categories: categories.join(','),
      fields: 'fsq_id,name,location,geocodes,categories,distance,rating,hours,photos',
      sort: 'DISTANCE',
    });

    if (query) {
      params.append('query', query);
    }

    const response = await fetch(`${BASE_URL}/search?${params}`, {
      headers: {
        Authorization: FOURSQUARE_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data = await response.json();
    const venues: FoursquareVenue[] = data.results || [];

    return venues.map(transformVenue);
  } catch (error) {
    console.error('Error fetching Foursquare venues:', error);
    return [];
  }
}

/**
 * Search specifically for gay bars and LGBTQ+ venues
 */
export async function searchLGBTQVenues(
  lat: number,
  lng: number,
  radius: number = 10000
): Promise<MapVenue[]> {
  if (!FOURSQUARE_API_KEY) return [];

  try {
    // Search with LGBTQ+ related keywords
    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: radius.toString(),
      limit: '50',
      query: 'gay lgbtq queer',
      fields: 'fsq_id,name,location,geocodes,categories,distance,rating,hours,photos',
      sort: 'RELEVANCE',
    });

    const response = await fetch(`${BASE_URL}/search?${params}`, {
      headers: {
        Authorization: FOURSQUARE_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const data = await response.json();
    const venues: FoursquareVenue[] = data.results || [];

    return venues.map(transformVenue);
  } catch (error) {
    console.error('Error fetching LGBTQ+ venues:', error);
    return [];
  }
}

/**
 * Get venue details by ID
 */
export async function getVenueDetails(fsqId: string): Promise<MapVenue | null> {
  if (!FOURSQUARE_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      fields: 'fsq_id,name,location,geocodes,categories,rating,hours,photos,description,website,tel',
    });

    const response = await fetch(`${BASE_URL}/${fsqId}?${params}`, {
      headers: {
        Authorization: FOURSQUARE_API_KEY,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Foursquare API error: ${response.status}`);
    }

    const venue: FoursquareVenue = await response.json();
    return transformVenue(venue);
  } catch (error) {
    console.error('Error fetching venue details:', error);
    return null;
  }
}

/**
 * Transform Foursquare venue to our MapVenue format
 */
function transformVenue(venue: FoursquareVenue): MapVenue {
  const category = venue.categories?.[0];
  const photo = venue.photos?.[0];

  return {
    id: venue.fsq_id,
    name: venue.name,
    lat: venue.geocodes.main.latitude,
    lng: venue.geocodes.main.longitude,
    address: venue.location.formatted_address || venue.location.address,
    category: category?.name || 'Venue',
    categoryIcon: category ? `${category.icon.prefix}64${category.icon.suffix}` : undefined,
    distance: venue.distance,
    rating: venue.rating,
    isOpen: venue.hours?.open_now,
    photoUrl: photo ? `${photo.prefix}300x300${photo.suffix}` : undefined,
  };
}

/**
 * Get photo URL for a venue
 */
export function getVenuePhotoUrl(
  prefix: string,
  suffix: string,
  size: string = '300x300'
): string {
  return `${prefix}${size}${suffix}`;
}
