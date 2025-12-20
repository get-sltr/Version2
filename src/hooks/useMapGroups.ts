// =============================================================================
// useMapGroups - Fetch groups for map display
// =============================================================================

import { useState, useEffect } from 'react';
import type { MapGroup } from '@/types/map';

// TODO: Replace with Supabase query when groups table is ready
const MOCK_GROUP_NAMES = [
  'Late Night Fun',
  'Pool Party',
  'Game Night',
  'Netflix & Chill',
  'Gym Buddies',
  'Coffee Meetup',
];

const MOCK_HOST_NAMES = [
  'Alex', 'Jordan', 'Mike', 'Sam', 'Chris', 'Taylor',
];

const GROUP_TYPES = ['Hangout', 'Party', 'Sports', 'Casual'];
const CATEGORIES = ['bar', 'restaurant', 'hangout', 'gym', 'cafe'];

// LA area center for mock data
const LA_CENTER = { lat: 34.0522, lng: -118.2437 };
const SPREAD = 0.1; // ~6 miles spread

interface UseMapGroupsReturn {
  groups: MapGroup[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Generate mock groups for development
 * Replace this function body with Supabase fetch when ready
 */
function generateMockGroups(): MapGroup[] {
  return MOCK_GROUP_NAMES.map((name, i) => ({
    id: i + 1,
    name,
    host: MOCK_HOST_NAMES[i % MOCK_HOST_NAMES.length],
    hostImage: `/images/${(i % 4) + 5}.jpg`,
    type: GROUP_TYPES[i % GROUP_TYPES.length],
    category: CATEGORIES[i % CATEGORIES.length],
    attendees: 3 + i * 2,
    maxAttendees: 10 + i * 5,
    time: i < 3 ? 'Tonight 9:00 PM' : 'Tomorrow 8:00 PM',
    location: i % 2 === 0 ? 'West Hollywood' : 'Downtown LA',
    description: 'Join us for a great time!',
    lat: LA_CENTER.lat + (Math.random() - 0.5) * SPREAD,
    lng: LA_CENTER.lng + (Math.random() - 0.5) * SPREAD,
  }));
}

export function useMapGroups(): UseMapGroupsReturn {
  const [groups, setGroups] = useState<MapGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Supabase fetch
      // const { data, error } = await supabase
      //   .from('groups')
      //   .select('*')
      //   .gte('event_date', new Date().toISOString())
      //   .limit(50);

      const mockGroups = generateMockGroups();
      setGroups(mockGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    isLoading,
    error,
    refetch: fetchGroups,
  };
}
