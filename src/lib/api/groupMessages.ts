import { supabase } from '../supabase';
import type { ProfilePreview } from '@/types/database';

export type GroupMessage = {
  id: string;
  group_id: string;
  sender_id: string;
  content: string | null;
  type: string;
  image_url: string | null;
  created_at: string;
};

export type GroupMessageWithSender = GroupMessage & {
  sender: ProfilePreview;
};

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
 * Get messages for a group
 */
export async function getGroupMessages(
  groupId: string,
  limit = 100
): Promise<GroupMessageWithSender[]> {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  const messages = data || [];

  // Get unique sender IDs
  const senderIds = Array.from(new Set(messages.map(m => m.sender_id)));

  // Fetch sender profiles
  const profiles = await Promise.all(
    senderIds.map(id => fetchProfilePreview(id))
  );

  const profileMap = new Map<string, ProfilePreview>();
  senderIds.forEach((id, i) => {
    if (profiles[i]) profileMap.set(id, profiles[i]!);
  });

  return messages.map(msg => ({
    ...msg,
    sender: profileMap.get(msg.sender_id) || {
      id: msg.sender_id,
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
 * Send a message to a group
 */
export async function sendGroupMessage(
  groupId: string,
  content: string,
  type = 'text',
  imageUrl?: string
): Promise<GroupMessage> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('group_messages')
    .insert({
      group_id: groupId,
      sender_id: user.id,
      content,
      type,
      image_url: imageUrl || null
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a message (own messages only)
 */
export async function deleteGroupMessage(messageId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('group_messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', user.id);

  if (error) throw error;
}
