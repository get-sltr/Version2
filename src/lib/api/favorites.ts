import { supabase } from '../supabase';
import type { Favorite, FavoriteWithProfile, ProfilePreview } from '@/types/database';

/**
 * Get all favorites for the current user
 */
export async function getMyFavorites(): Promise<FavoriteWithProfile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      *,
      profile:profiles!favorites_favorited_user_id_fkey (
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
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((fav: any) => ({
    ...fav,
    profile: fav.profile as ProfilePreview
  }));
}

/**
 * Check if a user is favorited
 */
export async function isFavorited(userId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('favorited_user_id', userId)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

/**
 * Add a user to favorites
 */
export async function addFavorite(userId: string, note?: string): Promise<Favorite> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: user.id,
      favorited_user_id: userId,
      note: note || null
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Already in favorites');
    }
    throw error;
  }

  return data;
}

/**
 * Remove a user from favorites
 */
export async function removeFavorite(userId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', user.id)
    .eq('favorited_user_id', userId);

  if (error) throw error;
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(userId: string): Promise<boolean> {
  const favorited = await isFavorited(userId);

  if (favorited) {
    await removeFavorite(userId);
    return false;
  } else {
    await addFavorite(userId);
    return true;
  }
}

/**
 * Update favorite note
 */
export async function updateFavoriteNote(userId: string, note: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('favorites')
    .update({ note })
    .eq('user_id', user.id)
    .eq('favorited_user_id', userId);

  if (error) throw error;
}

/**
 * Get count of users who favorited me
 */
export async function getFavoritedByCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('favorited_user_id', user.id);

  if (error) return 0;
  return count || 0;
}
