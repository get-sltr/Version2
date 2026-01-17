import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface NavBadgeCounts {
  taps: number;
  messages: number;
  views: number;
}

/**
 * Hook to fetch and subscribe to real-time navigation badge counts
 */
export function useNavBadgeCounts() {
  const [counts, setCounts] = useState<NavBadgeCounts>({ taps: 0, messages: 0, views: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch unread taps count
      const { count: tapsCount } = await supabase
        .from('taps')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('viewed_at', null);

      // Fetch unread messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      // Fetch unread views count (profile_views table)
      const { count: viewsCount } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_id', user.id)
        .is('seen_at', null);

      setCounts({
        taps: tapsCount || 0,
        messages: messagesCount || 0,
        views: viewsCount || 0,
      });
      setLoading(false);
    };

    fetchCounts();

    // Subscribe to real-time updates
    const tapsChannel = supabase
      .channel('nav-badge-taps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'taps' }, fetchCounts)
      .subscribe();

    const messagesChannel = supabase
      .channel('nav-badge-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchCounts)
      .subscribe();

    const viewsChannel = supabase
      .channel('nav-badge-views')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profile_views' }, fetchCounts)
      .subscribe();

    return () => {
      supabase.removeChannel(tapsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, []);

  return { counts, loading };
}
