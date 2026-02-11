import { supabase } from '../supabase';

/**
 * Get or create the user's "Private Photos" album
 */
export async function getOrCreatePrivateAlbum() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Check if private album exists
  const { data: existing } = await supabase
    .from('profile_albums')
    .select('*')
    .eq('user_id', user.id)
    .eq('name', 'Private Photos')
    .eq('is_private', true)
    .maybeSingle();

  if (existing) return existing;

  // Create it
  const { data, error } = await supabase
    .from('profile_albums')
    .insert({
      user_id: user.id,
      name: 'Private Photos',
      description: 'Photos moved from profile',
      is_private: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Move a photo URL to the private album
 */
export async function movePhotoToPrivateAlbum(photoUrl: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const album = await getOrCreatePrivateAlbum();

  // Extract storage path from URL or generate a reference path
  // Profile photos are stored like: user_id/filename.ext
  let storagePath = `${user.id}/moved/${Date.now()}.jpg`;

  // Try to extract actual path from URL if it's from our storage
  const urlMatch = photoUrl.match(/profile-media\/(.+?)(\?|$)/);
  if (urlMatch) {
    storagePath = urlMatch[1];
  }

  // Add photo record to the private album
  const { data, error } = await supabase
    .from('profile_photos')
    .insert({
      user_id: user.id,
      album_id: album.id,
      storage_path: storagePath,
      public_url: photoUrl,
      is_private: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createAlbum(name: string, description = '', isPrivate = false) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profile_albums')
    .insert({
      user_id: user.id,
      name,
      description,
      is_private: isPrivate
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadAlbumPhoto(
  file: File,
  albumId: string,
  options?: { isPrivate?: boolean; caption?: string }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${user.id}/albums/${albumId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase
    .storage
    .from('profile-media')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase
    .storage
    .from('profile-media')
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from('profile_photos')
    .insert({
      user_id: user.id,
      album_id: albumId,
      storage_path: path,
      public_url: publicUrl,
      caption: options?.caption ?? null,
      is_private: options?.isPrivate ?? false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listMyAlbums() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profile_albums')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function listPhotosInAlbum(albumId: string) {
  const { data, error } = await supabase
    .from('profile_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function listUserAlbums(userId: string, includePrivate = false) {
  let query = supabase
    .from('profile_albums')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!includePrivate) {
    query = query.eq('is_private', false);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getAlbumById(albumId: string) {
  const { data, error } = await supabase
    .from('profile_albums')
    .select('*')
    .eq('id', albumId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAlbumWithPhotos(albumId: string) {
  const album = await getAlbumById(albumId);
  const photos = await listPhotosInAlbum(albumId);
  return { album, photos };
}

export async function deleteAlbum(albumId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, get all photos in the album to delete from storage
  const photos = await listPhotosInAlbum(albumId);

  // Delete photos from storage
  if (photos && photos.length > 0) {
    const paths = photos.map(p => p.storage_path).filter(Boolean);
    if (paths.length > 0) {
      await supabase.storage.from('profile-media').remove(paths);
    }

    // Delete photo records
    await supabase
      .from('profile_photos')
      .delete()
      .eq('album_id', albumId)
      .eq('user_id', user.id);
  }

  // Delete the album
  const { error } = await supabase
    .from('profile_albums')
    .delete()
    .eq('id', albumId)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}

export async function deleteAlbumPhoto(photoId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get the photo to find storage path
  const { data: photo, error: fetchError } = await supabase
    .from('profile_photos')
    .select('storage_path')
    .eq('id', photoId)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  if (photo?.storage_path) {
    await supabase.storage.from('profile-media').remove([photo.storage_path]);
  }

  // Delete record
  const { error } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
}
