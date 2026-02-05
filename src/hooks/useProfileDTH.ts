'use client';

import { useMemo } from 'react';

interface Profile {
  id: string;
  dth_active_until?: string | null;
  [key: string]: unknown;
}

export function useProfileDTH(profile: Profile | null) {
  const isDTHActive = useMemo(() => {
    if (!profile?.dth_active_until) return false;

    const activeUntil = new Date(profile.dth_active_until);
    const now = new Date();

    return activeUntil > now;
  }, [profile?.dth_active_until]);

  return isDTHActive;
}

export default useProfileDTH;
