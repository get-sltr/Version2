import { supabase } from '../supabase';
import type {
  Group,
  GroupWithHost,
  GroupMember,
  GroupType,
  GroupCategory,
  GroupMemberStatus,
  ProfilePreview
} from '@/types/database';

/**
 * Get all active groups
 */
export async function getGroups(limit = 50): Promise<GroupWithHost[]> {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      host:profiles!groups_host_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        is_dtfn
      )
    `)
    .eq('is_active', true)
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((group: any) => ({
    ...group,
    host: group.host as ProfilePreview
  }));
}

/**
 * Get a single group by ID
 */
export async function getGroup(groupId: number): Promise<GroupWithHost | null> {
  const { data, error } = await supabase
    .from('groups')
    .select(`
      *,
      host:profiles!groups_host_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        is_dtfn
      )
    `)
    .eq('id', groupId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    ...data,
    host: data.host as ProfilePreview
  };
}

/**
 * Get groups hosted by the current user
 */
export async function getMyHostedGroups(): Promise<Group[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get groups the current user has joined
 */
export async function getMyJoinedGroups(): Promise<GroupWithHost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group:groups (
        *,
        host:profiles!groups_host_id_fkey (
          id,
          display_name,
          age,
          position,
          photo_url,
          is_online,
          is_dtfn
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'approved');

  if (error) throw error;

  return (data || [])
    .filter((item: any) => item.group)
    .map((item: any) => ({
      ...item.group,
      host: item.group.host as ProfilePreview
    }));
}

/**
 * Create a new group
 */
export async function createGroup(groupData: {
  name: string;
  type: GroupType;
  category?: GroupCategory;
  description?: string;
  location?: string;
  address?: string;
  lat?: number;
  lng?: number;
  event_date?: string;
  event_time?: string;
  max_attendees?: number;
  min_age?: number;
  max_age?: number;
  tags?: string[];
  is_private?: boolean;
  requires_approval?: boolean;
}): Promise<Group> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try to get host's profile for location (but don't fail if it doesn't work)
  let profileLat: number | null = null;
  let profileLng: number | null = null;
  let profileCity: string | null = null;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('lat, lng, city')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      profileLat = typeof profile.lat === 'number' && !Number.isNaN(profile.lat) ? profile.lat : null;
      profileLng = typeof profile.lng === 'number' && !Number.isNaN(profile.lng) ? profile.lng : null;
      profileCity = profile.city || null;
    }
  } catch (err) {
    console.warn('Could not fetch profile for group creation:', err);
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      host_id: user.id,
      name: groupData.name,
      type: groupData.type,
      category: groupData.category || null,
      description: groupData.description || null,
      location: profileCity || groupData.location || null,
      address: groupData.address || null,
      lat: profileLat,
      lng: profileLng,
      event_date: groupData.event_date || null,
      event_time: groupData.event_time || null,
      max_attendees: groupData.max_attendees || 10,
      min_age: groupData.min_age || 18,
      max_age: groupData.max_age || 99,
      tags: groupData.tags || [],
      is_private: groupData.is_private || false,
      requires_approval: groupData.requires_approval || false
    })
    .select('*')
    .single();

  if (error) {
    console.error('Group creation error:', error);
    throw new Error(error.message || 'Failed to create group');
  }

  if (!data) {
    throw new Error('Group was created but no data was returned');
  }

  return data;
}

/**
 * Update a group
 */
export async function updateGroup(
  groupId: number,
  updates: Partial<Omit<Group, 'id' | 'host_id' | 'created_at'>>
): Promise<Group> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('groups')
    .update(updates)
    .eq('id', groupId)
    .eq('host_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel a group
 */
export async function cancelGroup(groupId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('groups')
    .update({
      is_active: false,
      cancelled_at: new Date().toISOString()
    })
    .eq('id', groupId)
    .eq('host_id', user.id);

  if (error) throw error;
}

/**
 * Join a group
 */
export async function joinGroup(groupId: number): Promise<GroupMember> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if group exists and has space
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('attendees, max_attendees, requires_approval')
    .eq('id', groupId)
    .eq('is_active', true)
    .single();

  if (groupError) throw new Error('Group not found');
  if (group.attendees >= group.max_attendees) {
    throw new Error('Group is full');
  }

  const status: GroupMemberStatus = group.requires_approval ? 'pending' : 'approved';

  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      status
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already a member of this group');
    }
    throw error;
  }

  return data;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupId: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('group_members')
    .update({
      status: 'left',
      left_at: new Date().toISOString()
    })
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get group members
 */
export async function getGroupMembers(
  groupId: number,
  status?: GroupMemberStatus
): Promise<(GroupMember & { profile: ProfilePreview })[]> {
  let query = supabase
    .from('group_members')
    .select(`
      *,
      profile:profiles!group_members_user_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        is_dtfn
      )
    `)
    .eq('group_id', groupId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('joined_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((member: any) => ({
    ...member,
    profile: member.profile as ProfilePreview
  }));
}

/**
 * Approve a group member (host only)
 */
export async function approveMember(groupId: number, userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user is the host
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('host_id')
    .eq('id', groupId)
    .single();

  if (groupError || group.host_id !== user.id) {
    throw new Error('Only the host can approve members');
  }

  const { error } = await supabase
    .from('group_members')
    .update({ status: 'approved' })
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .eq('status', 'pending');

  if (error) throw error;
}

/**
 * Reject a group member (host only)
 */
export async function rejectMember(groupId: number, userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user is the host
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('host_id')
    .eq('id', groupId)
    .single();

  if (groupError || group.host_id !== user.id) {
    throw new Error('Only the host can reject members');
  }

  const { error } = await supabase
    .from('group_members')
    .update({ status: 'rejected' })
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Get nearby groups
 */
export async function getNearbyGroups(
  lat: number,
  lng: number,
  radiusMeters = 50000
): Promise<GroupWithHost[]> {
  // Note: This requires PostGIS extension and the location_point column
  const { data, error } = await supabase.rpc('get_nearby_groups', {
    user_lat: lat,
    user_lng: lng,
    max_distance_meters: radiusMeters
  });

  if (error) {
    // Fallback to fetching all groups if function doesn't exist
    return getGroups(100);
  }

  return data || [];
}

/**
 * Check if user is a member of a group
 */
export async function isGroupMember(groupId: number): Promise<GroupMemberStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('group_members')
    .select('status')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data.status as GroupMemberStatus;
}
