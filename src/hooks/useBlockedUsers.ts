'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface UseBlockedUsersReturn {
  blockedIds: Set<string>;
  blockUser: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  isReady: boolean;
}

export function useBlockedUsers(): UseBlockedUsersReturn {
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);
  const cachedRef = useRef<Set<string>>(new Set());

  const fetchBlocked = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setIsReady(true);
      return;
    }

    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_user_id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Failed to load blocked users:', error.message, error.code, error.details);
      setIsReady(true);
      return;
    }

    const ids = new Set((data ?? []).map((row) => row.blocked_user_id));
    cachedRef.current = ids;
    setBlockedIds(ids);
    setIsReady(true);
  }, []);

  // Fetch on mount AND on auth state change (login/logout/token refresh)
  useEffect(() => {
    fetchBlocked();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchBlocked();
      }
      if (event === 'SIGNED_OUT') {
        cachedRef.current = new Set();
        setBlockedIds(new Set());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchBlocked]);

  const blockUser = useCallback(async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error('Not authenticated');

    const userId = session.user.id;

    // Optimistically add to Set immediately
    const next = new Set(cachedRef.current);
    next.add(id);
    cachedRef.current = next;
    setBlockedIds(next);

    // Check if already blocked first
    const { data: existing } = await supabase
      .from('blocks')
      .select('id')
      .eq('user_id', userId)
      .eq('blocked_user_id', id)
      .maybeSingle();

    if (existing) return; // Already blocked, optimistic update is correct

    // Insert the block — check .error (Supabase doesn't throw)
    const { error } = await supabase
      .from('blocks')
      .insert({ user_id: userId, blocked_user_id: id });

    if (error) {
      // Duplicate key = already blocked, treat as success
      if (error.code === '23505') return;

      // Real failure — revert optimistic update
      const reverted = new Set(cachedRef.current);
      reverted.delete(id);
      cachedRef.current = reverted;
      setBlockedIds(reverted);
      throw new Error(error.message);
    }
  }, []);

  return { blockedIds, blockUser, refresh: fetchBlocked, isReady };
}
