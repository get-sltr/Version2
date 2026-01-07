import { supabase } from '../supabase';
import type { ProfilePreview } from '@/types/database';

export interface ProfileViewWithViewer {
  id: string;
  viewer_id: string;
  viewed_id: string;
  created_at: string;
  seen_at: string | null;
  viewer: ProfilePreview;
}

/**
 * Get profile views for the current user (who viewed me)
 */
export async function getProfileViews(): Promise<ProfileViewWithViewer[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profile_views')
    .select(`
      *,
      viewer:profiles!profile_views_viewer_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        is_dtfn,
        lat,
        lng
      )
    `)
    .eq('viewed_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;

  return (data || []).map((view: any) => ({
    ...view,
    viewer: view.viewer as ProfilePreview
  }));
}

/**
 * Record a profile view
 */
export async function recordProfileView(viewedId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('[recordProfileView] No authenticated user');
    return;
  }

  // Don't record views of own profile
  if (viewedId === user.id) {
    console.log('[recordProfileView] Skipping - viewing own profile');
    return;
  }

  console.log('[recordProfileView] Recording view:', { viewer: user.id, viewed: viewedId });

  // Upsert to avoid duplicates and update timestamp
  const { error } = await supabase
    .from('profile_views')
    .upsert({
      viewer_id: user.id,
      viewed_id: viewedId,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'viewer_id,viewed_id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('[recordProfileView] Error inserting view:', error);
    throw error;
  }

  console.log('[recordProfileView] View recorded successfully');
}

/**
 * Mark a profile view as seen
 */
export async function markViewSeen(viewId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profile_views')
    .update({ seen_at: new Date().toISOString() })
    .eq('id', viewId)
    .eq('viewed_id', user.id);

  if (error) throw error;
}

/**
 * Mark all profile views as seen
 */
export async function markAllViewsSeen(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profile_views')
    .update({ seen_at: new Date().toISOString() })
    .eq('viewed_id', user.id)
    .is('seen_at', null)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Get count of unseen profile views
 */
export async function getUnseenViewCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('profile_views')
    .select('*', { count: 'exact', head: true })
    .eq('viewed_id', user.id)
    .is('seen_at', null);

  if (error) return 0;
  return count || 0;
}
