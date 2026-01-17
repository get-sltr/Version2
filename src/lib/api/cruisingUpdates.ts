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
  like_count: number;
  reply_count: number;
};

export type CruisingReply = {
  id: string;
  update_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user?: {
    display_name: string | null;
    photo_url: string | null;
  };
};

export type CruisingReportReason = 'spam' | 'offensive' | 'harassment' | 'fake' | 'other';

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

  // Build insert object - posts expire after 8 hours
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
  const insertData: Record<string, unknown> = {
    user_id: user.id,
    text,
    is_hosting: isHosting,
    expires_at: new Date(Date.now() + EIGHT_HOURS_MS).toISOString()
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
    result.error.message?.match(/column "(?:lat|lng)" of relation "cruising_updates" does not exist/i)
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

// ============================================
// LIKES
// ============================================

/**
 * Like a cruising update
 */
export async function likeCruisingUpdate(updateId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cruising_likes')
    .insert({ update_id: updateId, user_id: user.id });

  // Ignore duplicate errors (already liked)
  if (error && error.code !== '23505') throw error;
}

/**
 * Unlike a cruising update
 */
export async function unlikeCruisingUpdate(updateId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cruising_likes')
    .delete()
    .eq('update_id', updateId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Check if current user has liked an update
 */
export async function hasLikedUpdate(updateId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('cruising_likes')
    .select('id')
    .eq('update_id', updateId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

/**
 * Get all liked update IDs for current user
 */
export async function getMyLikedUpdateIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from('cruising_likes')
    .select('update_id')
    .eq('user_id', user.id);

  if (error || !data) return new Set();
  return new Set(data.map(d => d.update_id));
}

// ============================================
// REPLIES
// ============================================

/**
 * Add a reply to a cruising update
 */
export async function addCruisingReply(updateId: string, text: string): Promise<CruisingReply> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!text.trim() || text.length > 500) {
    throw new Error('Reply must be 1-500 characters');
  }

  const { data, error } = await supabase
    .from('cruising_replies')
    .insert({ update_id: updateId, user_id: user.id, text: text.trim() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get replies for an update
 */
export async function getCruisingReplies(updateId: string): Promise<CruisingReply[]> {
  const { data, error } = await supabase
    .from('cruising_replies')
    .select(`
      id,
      update_id,
      user_id,
      text,
      created_at,
      profiles:user_id (
        display_name,
        photo_url
      )
    `)
    .eq('update_id', updateId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map(reply => ({
    id: reply.id,
    update_id: reply.update_id,
    user_id: reply.user_id,
    text: reply.text,
    created_at: reply.created_at,
    user: reply.profiles as { display_name: string | null; photo_url: string | null } | undefined
  }));
}

/**
 * Delete a reply (only own replies)
 */
export async function deleteCruisingReply(replyId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cruising_replies')
    .delete()
    .eq('id', replyId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// ============================================
// REPORTS
// ============================================

/**
 * Report a cruising update
 */
export async function reportCruisingUpdate(
  updateId: string,
  reason: CruisingReportReason,
  details?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('cruising_reports')
    .insert({
      update_id: updateId,
      reporter_id: user.id,
      reason,
      details: details?.trim() || null
    });

  // Ignore duplicate errors (already reported)
  if (error && error.code !== '23505') throw error;
}

/**
 * Check if current user has reported an update
 */
export async function hasReportedUpdate(updateId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('cruising_reports')
    .select('id')
    .eq('update_id', updateId)
    .eq('reporter_id', user.id)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
