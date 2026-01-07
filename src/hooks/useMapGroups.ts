// =============================================================================
// useMapGroups - Fetch groups for map display
// =============================================================================

import { useState, useEffect } from 'react';
import { getGroups } from '@/lib/api/groups';
import type { MapGroup } from '@/types/map';
import type { GroupWithHost } from '@/types/database';

interface UseMapGroupsReturn {
  groups: MapGroup[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Transform GroupWithHost from database to MapGroup for map display
 */
function transformToMapGroup(group: GroupWithHost): MapGroup {
  // Format event time for display
  let timeDisplay = 'TBD';
  if (group.event_date) {
    const eventDate = new Date(group.event_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = eventDate.toDateString() === today.toDateString();
    const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

    const timeStr = group.event_time || '';
    if (isToday) {
      timeDisplay = `Tonight ${timeStr}`;
    } else if (isTomorrow) {
      timeDisplay = `Tomorrow ${timeStr}`;
    } else {
      timeDisplay = `${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`;
    }
  }

  return {
    id: group.id,
    name: group.name,
    type: group.type,
    category: group.category,
    host: group.host?.display_name || 'Unknown Host',
    hostImage: group.host?.photo_url || null,
    hostId: group.host?.id || group.host_id,
    attendees: group.attendees,
    maxAttendees: group.max_attendees,
    time: timeDisplay,
    location: group.location || null,
    description: group.description,
    lat: group.lat || 0,
    lng: group.lng || 0,
  };
}

export function useMapGroups(): UseMapGroupsReturn {
  const [groups, setGroups] = useState<MapGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getGroups(50);
      console.log('[useMapGroups] Raw groups from API:', data.length, data);

      // Transform all groups - include those without coords too (they just won't show on map)
      const mapGroups = data.map(transformToMapGroup);
      console.log('[useMapGroups] Transformed groups:', mapGroups.length);

      setGroups(mapGroups);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError(err instanceof Error ? err.message : 'Failed to load groups');
      setGroups([]);
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
