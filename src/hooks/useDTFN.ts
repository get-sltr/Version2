'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const DTFN_DURATION_HOURS = 2;
const DTFN_DURATION_MS = DTFN_DURATION_HOURS * 60 * 60 * 1000;

export function useDTFN() {
  const [isActive, setIsActive] = useState(false);
  const [dtfnActiveUntil, setDtfnActiveUntil] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch current DTFN status
  const fetchStatus = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('dtfn_active_until')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.dtfn_active_until) {
        const activeUntil = new Date(data.dtfn_active_until);
        const now = new Date();

        if (activeUntil > now) {
          setIsActive(true);
          setDtfnActiveUntil(activeUntil);
        } else {
          // Expired - clean up
          setIsActive(false);
          setDtfnActiveUntil(null);
        }
      } else {
        setIsActive(false);
        setDtfnActiveUntil(null);
      }
    } catch (error) {
      console.error('Error fetching DTFN status:', error);
    }
  }, []);

  // Toggle DTFN on/off
  const toggle = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isActive) {
        // Turn OFF
        const { error } = await supabase
          .from('profiles')
          .update({ dtfn_active_until: null })
          .eq('id', user.id);

        if (error) throw error;

        setIsActive(false);
        setDtfnActiveUntil(null);
        setTimeRemaining(null);
      } else {
        // Turn ON (2 hours)
        const activeUntil = new Date(Date.now() + DTFN_DURATION_MS);

        const { error } = await supabase
          .from('profiles')
          .update({ dtfn_active_until: activeUntil.toISOString() })
          .eq('id', user.id);

        if (error) throw error;

        setIsActive(true);
        setDtfnActiveUntil(activeUntil);
      }
    } catch (error) {
      console.error('Error toggling DTFN:', error);
    } finally {
      setLoading(false);
    }
  }, [isActive]);

  // Countdown timer
  useEffect(() => {
    if (!isActive || !dtfnActiveUntil) {
      setTimeRemaining(null);
      return;
    }

    const updateRemaining = () => {
      const now = new Date();
      const remaining = Math.max(0, Math.floor((dtfnActiveUntil.getTime() - now.getTime()) / 1000));

      if (remaining <= 0) {
        setIsActive(false);
        setDtfnActiveUntil(null);
        setTimeRemaining(null);
      } else {
        setTimeRemaining(remaining);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [isActive, dtfnActiveUntil]);

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

export default useDTFN;
