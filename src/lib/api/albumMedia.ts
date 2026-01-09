import { supabase } from '../supabase';

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
