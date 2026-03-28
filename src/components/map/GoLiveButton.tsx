'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const CHECK_IN_DURATION_MS = 60 * 60 * 1000; // 1 hour

interface GoLiveButtonProps {
  userId: string | null;
}

export function GoLiveButton({ userId }: GoLiveButtonProps) {
  const [isLive, setIsLive] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Check current check-in status on mount
  useEffect(() => {
    if (!userId) return;

    const checkStatus = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('map_checked_in_at')
        .eq('id', userId)
        .single();

      if (data?.map_checked_in_at) {
        const checkedInAt = new Date(data.map_checked_in_at).getTime();
        const expiresAt = checkedInAt + CHECK_IN_DURATION_MS;
        const remaining = expiresAt - Date.now();

        if (remaining > 0) {
          setIsLive(true);
          setRemainingMs(remaining);
        }
      }
    };

    checkStatus();
  }, [userId]);

  // Countdown timer
  useEffect(() => {
    if (!isLive || remainingMs <= 0) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    countdownRef.current = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          setIsLive(false);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isLive, remainingMs]);

  // Auto-expire timer
  useEffect(() => {
    if (!isLive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    timerRef.current = setTimeout(async () => {
      await goOffline();
    }, remainingMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const goLive = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ map_checked_in_at: new Date().toISOString() })
      .eq('id', userId);

    if (!error) {
      setIsLive(true);
      setRemainingMs(CHECK_IN_DURATION_MS);
    }
  }, [userId]);

  const goOffline = useCallback(async () => {
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({ map_checked_in_at: null })
      .eq('id', userId);

    if (!error) {
      setIsLive(false);
      setRemainingMs(0);
    }
  }, [userId]);

  // Clean up on unmount: go offline so user doesn't stay live after leaving map
  useEffect(() => {
    return () => {
      if (userId) {
        supabase
          .from('profiles')
          .update({ map_checked_in_at: null })
          .eq('id', userId)
          .then(() => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleToggle = () => {
    if (isLive) {
      goOffline();
    } else {
      goLive();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        position: 'absolute',
        bottom: '90px',
        right: '16px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: isLive ? '12px 18px' : '12px 20px',
        borderRadius: '24px',
        border: isLive
          ? '1px solid rgba(34, 197, 94, 0.4)'
          : '1px solid rgba(255, 107, 53, 0.4)',
        background: isLive
          ? 'rgba(34, 197, 94, 0.15)'
          : 'rgba(10, 22, 40, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: isLive ? '#22c55e' : '#FF6B35',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        boxShadow: isLive
          ? '0 0 20px rgba(34, 197, 94, 0.3), 0 4px 12px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Pulsing dot when live */}
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: isLive ? '#22c55e' : 'rgba(255, 107, 53, 0.6)',
          boxShadow: isLive ? '0 0 8px rgba(34, 197, 94, 0.6)' : 'none',
          animation: isLive ? 'goLivePulse 2s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      />

      <span>{isLive ? `Live ${formatTime(remainingMs)}` : 'Go Live'}</span>

      <style jsx>{`
        @keyframes goLivePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </button>
  );
}
