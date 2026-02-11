'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface UseBlockedUsersReturn {
  /** All user IDs that should be hidden (users I blocked + users who blocked me) */
  blockedIds: Set<string>;
  /** Block a user */
  blockUser: (id: string) => Promise<void>;
  /** Refresh the blocked list */
  refresh: () => Promise<void>;
  /** Whether the initial load is complete */
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

    // Try to use the database function for bidirectional blocks
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_all_blocked_ids');

    if (!rpcError && rpcData) {
      // Function exists and returned data
      const ids = new Set((rpcData as { blocked_id: string }[]).map((row) => row.blocked_id));
      cachedRef.current = ids;
      setBlockedIds(ids);
      setIsReady(true);
      return;
    }

    // Fallback: fetch both directions manually if function doesn't exist yet
    // This handles the case before migration is run
    const userId = session.user.id;

    // Users I have blocked
    const { data: blockedByMe, error: error1 } = await supabase
      .from('blocks')
      .select('blocked_user_id')
      .eq('user_id', userId);

    // Users who have blocked me (requires new RLS policy)
    const { data: blockedMe, error: error2 } = await supabase
      .from('blocks')
      .select('user_id')
      .eq('blocked_user_id', userId);

    if (error1) {
      console.error('Failed to load blocked users:', error1.message);
    }
    if (error2) {
      // This might fail if RLS policy isn't updated yet - that's ok
      console.warn('Could not load users who blocked me (RLS may need update):', error2.message);
    }

    const ids = new Set<string>();

    // Add users I blocked
    (blockedByMe ?? []).forEach((row) => ids.add(row.blocked_user_id));

    // Add users who blocked me
    (blockedMe ?? []).forEach((row) => ids.add(row.user_id));

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
    console.log('[BLOCK] Starting block for user:', id);

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[BLOCK] Session error:', sessionError);
      throw new Error('Session error: ' + sessionError.message);
    }

    if (!session?.user) {
      console.error('[BLOCK] No session or user');
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;
    console.log('[BLOCK] Current user ID:', userId);
    console.log('[BLOCK] Blocking user ID:', id);

    // Optimistically add to Set immediately
    const next = new Set(cachedRef.current);
    next.add(id);
    cachedRef.current = next;
    setBlockedIds(next);

    // Check if already blocked first
    const { data: existing, error: checkError } = await supabase
      .from('blocks')
      .select('id')
      .eq('user_id', userId)
      .eq('blocked_user_id', id)
      .maybeSingle();

    if (checkError) {
      console.error('[BLOCK] Error checking existing block:', checkError);
    }

    if (existing) {
      console.log('[BLOCK] Already blocked, skipping insert');
      return;
    }

    // Insert the block
    console.log('[BLOCK] Inserting block...');
    const { data: insertData, error } = await supabase
      .from('blocks')
      .insert({ user_id: userId, blocked_user_id: id })
      .select();

    console.log('[BLOCK] Insert result - data:', insertData, 'error:', error);

    if (error) {
      console.error('[BLOCK] Insert error:', error.message, error.code, error.details, error.hint);

      // Duplicate key = already blocked, treat as success
      if (error.code === '23505') {
        console.log('[BLOCK] Duplicate key - already blocked');
        return;
      }

      // Real failure — revert optimistic update
      const reverted = new Set(cachedRef.current);
      reverted.delete(id);
      cachedRef.current = reverted;
      setBlockedIds(reverted);
      throw new Error(error.message);
    }

    console.log('[BLOCK] Block successful!');
  }, []);

  return { blockedIds, blockUser, refresh: fetchBlocked, isReady };
}
