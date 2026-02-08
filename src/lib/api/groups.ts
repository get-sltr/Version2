import { supabase } from '../supabase';
import type {
  Group,
  GroupWithHost,
  GroupMember,
  GroupType,
  GroupMemberRole,
  ProfilePreview
} from '@/types/database';

/**
 * Fetch profile preview by ID
 */
async function fetchProfilePreview(userId: string): Promise<ProfilePreview | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, age, position, photo_url, is_online, dth_active_until')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfilePreview;
}

/**
 * Get all active groups
 */
export async function getGroups(limit = 50): Promise<GroupWithHost[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('event_date', { ascending: true })
    .limit(limit);

  if (error) throw error;

  // Fetch host profiles in parallel
  const groups = data || [];
  const hostIds = Array.from(new Set(groups.map(g => g.host_id).filter(Boolean)));

  const hostProfiles = await Promise.all(
    hostIds.map(id => fetchProfilePreview(id))
  );

  const hostMap = new Map<string, ProfilePreview>();
  hostIds.forEach((id, i) => {
    if (hostProfiles[i]) hostMap.set(id, hostProfiles[i]!);
  });

  return groups.map(group => ({
    ...group,
    host: hostMap.get(group.host_id) || {
      id: group.host_id,
      display_name: 'Unknown',
      age: null,
      position: null,
      photo_url: null,
      is_online: false,
      dth_active_until: null
    }
  }));
}

/**
 * Get a single group by ID
 */
export async function getGroup(groupId: string): Promise<GroupWithHost | null> {
  if (!groupId || typeof groupId !== 'string') {
    console.error('Invalid group ID:', groupId);
    return null;
  }

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!data) return null;

  // Fetch host profile separately
  const host = await fetchProfilePreview(data.host_id);

  return {
    ...data,
    host: host || {
      id: data.host_id,
      display_name: 'Unknown',
      age: null,
      position: null,
      photo_url: null,
      is_online: false,
      dth_active_until: null
    }
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

  // Get member records
  const { data: memberData, error: memberError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', user.id);

  if (memberError) throw memberError;
  if (!memberData || memberData.length === 0) return [];

  // Get groups
  const groupIds = memberData.map(m => m.group_id);
  const { data: groupsData, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds);

  if (groupsError) throw groupsError;

  // Fetch host profiles
  const groups = groupsData || [];
  const hostIds = Array.from(new Set(groups.map(g => g.host_id).filter(Boolean)));

  const hostProfiles = await Promise.all(
    hostIds.map(id => fetchProfilePreview(id))
  );

  const hostMap = new Map<string, ProfilePreview>();
  hostIds.forEach((id, i) => {
    if (hostProfiles[i]) hostMap.set(id, hostProfiles[i]!);
  });

  return groups.map(group => ({
    ...group,
    host: hostMap.get(group.host_id) || {
      id: group.host_id,
      display_name: 'Unknown',
      age: null,
      position: null,
      photo_url: null,
      is_online: false,
      dth_active_until: null
    }
  }));
}

/**
 * Create a new group
 */
export async function createGroup(groupData: {
  name: string;
  type: GroupType;
  category?: string;
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

  // Try to get host's profile for location
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
  groupId: string,
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
export async function cancelGroup(groupId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Remove related data first (foreign key constraints)
  await supabase
    .from('group_messages')
    .delete()
    .eq('group_id', groupId);

  await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId);

  // Delete the group itself
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('host_id', user.id);

  if (error) throw error;
}

/**
 * Join a group
 */
export async function joinGroup(groupId: string): Promise<GroupMember> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if group exists and has space
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('attendees, max_attendees')
    .eq('id', groupId)
    .eq('is_active', true)
    .single();

  if (groupError) throw new Error('Group not found');
  if (group.attendees >= group.max_attendees) {
    throw new Error('Group is full');
  }

  const { data, error } = await supabase
    .from('group_members')
    .insert({
      group_id: groupId,
      user_id: user.id,
      role: 'member'
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
export async function leaveGroup(groupId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get group members
 */
export async function getGroupMembers(
  groupId: string,
  role?: GroupMemberRole
): Promise<(GroupMember & { profile: ProfilePreview })[]> {
  let query = supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId);

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query.order('joined_at', { ascending: true });

  if (error) throw error;

  // Fetch profiles separately
  const members = data || [];
  const userIds = members.map(m => m.user_id);

  const profiles = await Promise.all(
    userIds.map(id => fetchProfilePreview(id))
  );

  return members.map((member, i) => ({
    ...member,
    profile: profiles[i] || {
      id: member.user_id,
      display_name: 'Unknown',
      age: null,
      position: null,
      photo_url: null,
      is_online: false,
      dth_active_until: null
    }
  }));
}

/**
 * Promote a group member to admin (host only)
 */
export async function promoteMember(groupId: string, userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user is the host
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('host_id')
    .eq('id', groupId)
    .single();

  if (groupError || group.host_id !== user.id) {
    throw new Error('Only the host can promote members');
  }

  const { error } = await supabase
    .from('group_members')
    .update({ role: 'admin' })
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Remove a group member (host only)
 */
export async function removeMember(groupId: string, userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify user is the host
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('host_id')
    .eq('id', groupId)
    .single();

  if (groupError || group.host_id !== user.id) {
    throw new Error('Only the host can remove members');
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
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
export async function isGroupMember(groupId: string): Promise<GroupMemberRole | null> {
  try {
    if (!groupId || typeof groupId !== 'string') {
      console.warn('Invalid group ID passed to isGroupMember:', groupId);
      return null;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.warn('Error checking group membership:', error);
      return null;
    }

    return (data?.role as GroupMemberRole) || null;
  } catch (err) {
    console.warn('Failed to check group membership:', err);
    return null;
  }
}
