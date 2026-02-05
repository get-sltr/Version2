import { supabase } from '../supabase';
import type { Notification, NotificationWithUser, NotificationType, ProfilePreview } from '@/types/database';

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  limit = 50,
  offset = 0,
  type?: NotificationType
): Promise<NotificationWithUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('notifications')
    .select(`
      *,
      from_user:profiles!notifications_from_user_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        dth_active_until,
        lat,
        lng
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((notif: any) => ({
    ...notif,
    from_user: notif.from_user as ProfilePreview | null
  }));
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(): Promise<NotificationWithUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      from_user:profiles!notifications_from_user_id_fkey (
        id,
        display_name,
        age,
        position,
        photo_url,
        is_online,
        dth_active_until,
        lat,
        lng
      )
    `)
    .eq('user_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data || []).map((notif: any) => ({
    ...notif,
    from_user: notif.from_user as ProfilePreview | null
  }));
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)
    .select();

  if (error) throw error;
  return data?.length || 0;
}

/**
 * Mark notification as clicked
 */
export async function markNotificationClicked(notificationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
      clicked_at: new Date().toISOString()
    })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) return 0;
  return count || 0;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  callback: (notification: NotificationWithUser) => void
) {
  return supabase
    .channel('notifications-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      },
      async (payload) => {
        const notification = payload.new as Notification;

        // Fetch the from_user data
        if (notification.from_user_id) {
          const { data } = await supabase
            .from('profiles')
            .select('id, display_name, age, position, photo_url, is_online, dth_active_until, lat, lng')
            .eq('id', notification.from_user_id)
            .single();

          callback({
            ...notification,
            from_user: data as ProfilePreview | null
          });
        } else {
          callback({
            ...notification,
            from_user: null
          });
        }
      }
    )
    .subscribe();
}
