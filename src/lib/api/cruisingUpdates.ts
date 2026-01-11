import { supabase } from '../supabase';
import type { ProfilePreview } from '@/types/database';

export type CruisingUpdate = {
  id: string;
  user_id: string;
  text: string;
  is_hosting: boolean;
  lat: number | null;
  lng: number | null;
  expires_at: string;
  created_at: string;
};

export type CruisingUpdateWithUser = CruisingUpdate & {
  user: ProfilePreview;
  distance?: number;
};

/**
 * Calculate distance between two coordinates in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Fetch profile preview by ID
 */
async function fetchProfilePreview(userId: string): Promise<ProfilePreview | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, age, position, photo_url, is_online, is_dtfn, height, weight, body_type')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfilePreview;
}

/**
 * Get all cruising updates (no expiration filter - posts persist)
 */
export async function getCruisingUpdates(
  userLat?: number,
  userLng?: number,
  sortBy: 'time' | 'distance' = 'time'
): Promise<CruisingUpdateWithUser[]> {
  const { data, error } = await supabase
    .from('cruising_updates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  const updates = data || [];

  // Get unique user IDs
  const userIds = Array.from(new Set(updates.map(u => u.user_id)));

  // Fetch user profiles
  const profiles = await Promise.all(
    userIds.map(id => fetchProfilePreview(id))
  );

  const profileMap = new Map<string, ProfilePreview>();
  userIds.forEach((id, i) => {
    if (profiles[i]) profileMap.set(id, profiles[i]!);
  });

  // Map updates with user data and distance
  let result = updates.map(update => {
    const user = profileMap.get(update.user_id);
    let distance: number | undefined;

    if (userLat && userLng && update.lat && update.lng) {
      distance = calculateDistance(userLat, userLng, update.lat, update.lng);
    }

    return {
      ...update,
      user: user || {
        id: update.user_id,
        display_name: null,
        age: null,
        position: null,
        photo_url: null,
        is_online: false
      },
      distance
    };
  });

  // Sort by distance if requested
  if (sortBy === 'distance' && userLat && userLng) {
    result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  return result;
}

/**
 * Post a cruising update
 */
export async function postCruisingUpdate(
  text: string,
  isHosting = false,
  lat?: number,
  lng?: number
): Promise<CruisingUpdate> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Build insert object - posts persist indefinitely (far future expiration for DB compatibility)
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    text,
    is_hosting: isHosting,
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
  };

  // Add location if provided (requires migration to add columns)
  if (lat !== undefined && lng !== undefined) {
    insertData.lat = lat;
    insertData.lng = lng;
  }

  // Try insert with location first, fall back to without if columns don't exist
  let result = await supabase
    .from('cruising_updates')
    .insert(insertData)
    .select()
    .single();

  // Check for PostgreSQL undefined column error (42703) or specific column error message
  if (result.error && (
    result.error.code === '42703' || 
    result.error.message?.match(/column "(?:lat|lng)" (?:does not exist|of relation)/i)
  )) {
    delete insertData.lat;
    delete insertData.lng;
    result = await supabase
      .from('cruising_updates')
      .insert(insertData)
      .select()
      .single();
  }

  if (result.error) throw result.error;
  return result.data;
}

/**
 * Delete a cruising update
 */
export async function deleteCruisingUpdate(updateId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cruising_updates')
    .delete()
    .eq('id', updateId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get my active updates
 */
export async function getMyCruisingUpdates(): Promise<CruisingUpdate[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('cruising_updates')
    .select('*')
    .eq('user_id', user.id)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
