'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface UseBlockedUsersReturn {
  blockedIds: Set<string>;
  blockUser: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useBlockedUsers(): UseBlockedUsersReturn {
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const cachedRef = useRef<Set<string>>(new Set());

  const fetchBlocked = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_id')
      .eq('blocker_id', user.id);

    if (error) {
      console.error('Failed to load blocked users:', error);
      return;
    }

    const ids = new Set((data ?? []).map((row) => row.blocked_id));
    cachedRef.current = ids;
    setBlockedIds(ids);
  }, []);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const blockUser = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('blocked_users')
      .insert({ blocker_id: user.id, blocked_id: id });

    if (error) throw error;

    // Optimistically add to Set
    const next = new Set(cachedRef.current);
    next.add(id);
    cachedRef.current = next;
    setBlockedIds(next);
  }, []);

  return { blockedIds, blockUser, refresh: fetchBlocked };
}
