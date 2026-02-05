'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const DTH_DURATION_HOURS = 2;
const DTH_DURATION_MS = DTH_DURATION_HOURS * 60 * 60 * 1000;

export function useDTH() {
  const [isActive, setIsActive] = useState(false);
  const [dthActiveUntil, setDthActiveUntil] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current DTH status
  const fetchStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('dth_active_until')
        .eq('id', user.id)
        .single();

      // Handle schema cache miss gracefully - column may not be recognized yet
      if (error) {
        if (error.message?.includes('schema cache') || error.code === 'PGRST204') {
          console.warn('DTH column not yet in schema cache. Please refresh Supabase schema.');
          setIsActive(false);
          setDthActiveUntil(null);
          return;
        }
        throw error;
      }

      if (data?.dth_active_until) {
        const activeUntil = new Date(data.dth_active_until);
        const now = new Date();

        if (activeUntil > now) {
          setIsActive(true);
          setDthActiveUntil(activeUntil);
        } else {
          // Expired - clean up
          setIsActive(false);
          setDthActiveUntil(null);
        }
      } else {
        setIsActive(false);
        setDthActiveUntil(null);
      }
    } catch (error) {
      console.error('Error fetching DTH status:', error);
      // Fail gracefully - don't break the app
      setIsActive(false);
      setDthActiveUntil(null);
    }
  }, []);

  // Toggle DTH on/off
  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isActive) {
        // Turn OFF
        const { error } = await supabase
          .from('profiles')
          .update({ dth_active_until: null })
          .eq('id', user.id);

        if (error) {
          // Handle schema cache miss
          if (error.message?.includes('schema cache')) {
            console.warn('DTH column not yet in schema cache. Please refresh Supabase schema.');
            return;
          }
          throw error;
        }

        setIsActive(false);
        setDthActiveUntil(null);
        setTimeRemaining(null);
      } else {
        // Turn ON (2 hours)
        const activeUntil = new Date(Date.now() + DTH_DURATION_MS);

        const { error } = await supabase
          .from('profiles')
          .update({ dth_active_until: activeUntil.toISOString() })
          .eq('id', user.id);

        if (error) {
          // Handle schema cache miss
          if (error.message?.includes('schema cache')) {
            console.warn('DTH column not yet in schema cache. Please refresh Supabase schema.');
            return;
          }
          throw error;
        }

        setIsActive(true);
        setDthActiveUntil(activeUntil);
      }
    } catch (error) {
      console.error('Error toggling DTH:', error);
    } finally {
      setLoading(false);
    }
  }, [isActive]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || !dthActiveUntil) {
      setTimeRemaining(null);
      return;
    }

    const updateRemaining = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((dthActiveUntil.getTime() - now.getTime()) / 1000));

      if (remaining <= 0) {
        setIsActive(false);
        setDthActiveUntil(null);
        setTimeRemaining(null);
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [isActive, dthActiveUntil]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    isActive,
    timeRemaining,
    toggle,
    loading,
    refetch: fetchStatus,
  };
}

export default useDTH;
