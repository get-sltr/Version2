import { supabase } from '../supabase';
import { computePhotoHash, isPhotoSimilarToRejected } from '@/lib/photoHash';

// Allowed image MIME types and their extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Auth error:', authError);
    throw new Error('Not authenticated');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }

  // Validate MIME type
  const ext = ALLOWED_MIME_TYPES[file.type];
  if (!ext) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
  }

  // Check if this photo was previously rejected
  try {
    const hash = await computePhotoHash(file);
    const { rejected } = await isPhotoSimilarToRejected(hash);
    if (rejected) {
      throw new Error('This photo has been previously removed by moderation and cannot be re-uploaded.');
    }
  } catch (err: any) {
    if (err?.message?.includes('previously removed')) throw err;
    console.warn('[PhotoHash] Hash check failed, allowing upload:', err);
  }

  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(path);

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_url: publicUrl })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }
  } else {
    // Insert new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ 
        id: user.id,
        photo_url: publicUrl
      });
    
    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }
  }

  return publicUrl;
}
