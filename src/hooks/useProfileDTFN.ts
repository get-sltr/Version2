'use client';

import { useMemo } from 'react';

interface Profile {
  id: string;
  dtfn_active_until?: string | null;
  [key: string]: unknown;
}

export function useProfileDTFN(profile: Profile | null) {
  const isDTFNActive = useMemo(() => {
    if (!profile?.dtfn_active_until) return false;

    const activeUntil = new Date(profile.dtfn_active_until);
    const now = new Date();

    return activeUntil > now;
  }, [profile?.dtfn_active_until]);

  return isDTFNActive;
}

export default useProfileDTFN;
