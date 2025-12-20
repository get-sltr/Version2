import { supabase } from '../supabase';

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Auth error:', authError);
    throw new Error('Not authenticated');
  }
  
  const ext = file.name.split('.').pop() || 'jpg';
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
