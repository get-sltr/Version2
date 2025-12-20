import { supabase } from '../supabase';
import type { Profile, TableUpdate } from '@/types/database';

/**
 * Profile API error class for consistent error handling
 */
export class ProfileApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ProfileApiError';
  }
}

/**
 * Get the current user's profile
 * @returns The user's profile or null if not authenticated
 * @throws ProfileApiError if there's a database error
 */
export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    // PGRST116 = No rows found, which is valid for new users
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new ProfileApiError(
      'Failed to fetch profile',
      error.code || 'UNKNOWN',
      500
    );
  }

  return data as Profile;
}

/**
 * Update the current user's profile
 * @param update - Partial profile data to update
 * @returns The updated profile data
 * @throws ProfileApiError if not authenticated or database error
 */
export async function saveMyProfile(
  update: TableUpdate<'profiles'>
): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new ProfileApiError(
      'Not authenticated',
      'UNAUTHORIZED',
      401
    );
  }

  // Remove any fields that shouldn't be updated by the user
  const safeUpdate = { ...update };
  delete (safeUpdate as Record<string, unknown>).id;
  delete (safeUpdate as Record<string, unknown>).created_at;
  delete (safeUpdate as Record<string, unknown>).is_verified;
  delete (safeUpdate as Record<string, unknown>).is_premium;
  delete (safeUpdate as Record<string, unknown>).premium_until;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, ...safeUpdate })
    .select()
    .single();

  if (error) {
    throw new ProfileApiError(
      'Failed to save profile',
      error.code || 'UNKNOWN',
      500
    );
  }

  return data as Profile;
}

/**
 * Get a profile by user ID (for viewing other profiles)
 * @param userId - The ID of the user to fetch
 * @returns The user's public profile or null if not found
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new ProfileApiError(
      'Failed to fetch profile',
      error.code || 'UNKNOWN',
      500
    );
  }

  return data as Profile;
}
