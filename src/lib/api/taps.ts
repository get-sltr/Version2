import { supabase } from '../supabase';
import type { Tap, TapWithUser, TapType, ProfilePreview } from '@/types/database';

/**
 * Get received taps for the current user
 */
export async function getReceivedTaps(): Promise<TapWithUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('taps')
    .select(`
      *,
      user:profiles!taps_sender_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        is_dth,
        lat,
        lng
      )
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data || []).map((tap: any) => ({
    ...tap,
    user: tap.user as ProfilePreview
  }));
}

/**
 * Get sent taps for the current user
 */
export async function getSentTaps(): Promise<TapWithUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('taps')
    .select(`
      *,
      user:profiles!taps_recipient_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        is_dth,
        lat,
        lng
      )
    `)
    .eq('sender_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data || []).map((tap: any) => ({
    ...tap,
    user: tap.user as ProfilePreview
  }));
}

/**
 * Send a tap to another user
 */
export async function sendTap(recipientId: string, tapType: TapType = 'flame'): Promise<Tap> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (recipientId === user.id) {
    throw new Error('Cannot tap yourself');
  }

  const { data, error } = await supabase
    .from('taps')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      tap_type: tapType
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already tapped this user');
    }
    throw error;
  }

  return data;
}

/**
 * Delete a sent tap
 */
export async function deleteTap(tapId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('taps')
    .delete()
    .eq('id', tapId)
    .eq('sender_id', user.id);

  if (error) throw error;
}

/**
 * Mark a received tap as viewed
 */
export async function markTapViewed(tapId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('taps')
    .update({ viewed_at: new Date().toISOString() })
    .eq('id', tapId)
    .eq('recipient_id', user.id);

  if (error) throw error;
}

/**
 * Mark all received taps as viewed
 */
export async function markAllTapsViewed(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('taps')
    .update({ viewed_at: new Date().toISOString() })
    .eq('recipient_id', user.id)
    .is('viewed_at', null)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Get count of unviewed taps
 */
export async function getUnviewedTapCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('taps')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .is('viewed_at', null);

  if (error) return 0;
  return count || 0;
}

/**
 * Check if user has tapped another user
 */
export async function hasTapped(recipientId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('taps')
    .select('id')
    .eq('sender_id', user.id)
    .eq('recipient_id', recipientId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}
