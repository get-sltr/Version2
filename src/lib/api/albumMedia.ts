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
