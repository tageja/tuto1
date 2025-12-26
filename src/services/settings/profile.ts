/**
 * Profile Settings Service
 * Handles user profile data operations with Supabase
 */

import { supabase } from '../../config/supabase';
import type { ProfileInput, ProfileData } from '../../types/settings';
import * as FileSystem from 'expo-file-system';

const MAX_FILE_SIZE = 1572864; // 1.5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Get user profile (merged from users + user_profiles tables)
 */
export async function getUserProfile(userId: string): Promise<ProfileData> {
  // Get base user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, name, role, avatar, phone')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Get extended profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userData.id)
    .single();

  // Merge base user data with profile
  const mergedProfile: ProfileData = {
    id: userData.id,
    email: userData.email,
    full_name: profile?.full_name || userData.name,
    phone: profile?.phone || userData.phone || null,
    avatar_url: profile?.avatar_url || userData.avatar || null,
    bio: profile?.bio || null,
    locale: profile?.locale || 'vi',
    theme: profile?.theme || 'system',
    timezone: profile?.timezone || 'Asia/Ho_Chi_Minh',
    twofa_enabled: profile?.twofa_enabled || false,
    updated_at: profile?.updated_at || null,
  };

  return mergedProfile;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: ProfileInput): Promise<ProfileData> {
  // Verify user exists
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Upsert profile
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userData.id,
      ...data,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (profileError) {
    console.error('Error updating profile:', profileError);
    throw new Error('Failed to update profile');
  }

  // Also update name in users table if full_name changed
  if (data.full_name) {
    await supabase
      .from('users')
      .update({ name: data.full_name, updated_at: new Date().toISOString() })
      .eq('id', userData.id);
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userData.id,
    action: 'profile.update',
    entity_type: 'user_profiles',
    entity_id: userData.id,
    meta: { fields: Object.keys(data) },
  });

  // Return updated profile
  return getUserProfile(userId);
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(userId: string, fileUri: string): Promise<string> {
  // Verify user exists
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    throw new Error('User not found');
  }

  // Get file info
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error('File not found');
  }

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine content type from file extension
  const ext = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
  let contentType = 'image/jpeg';
  if (ext === 'png') contentType = 'image/png';
  else if (ext === 'webp') contentType = 'image/webp';
  else if (ext === 'gif') contentType = 'image/gif';

  // Validate file type
  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
  }

  // Validate file size
  if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
    throw new Error('File too large. Maximum size is 1.5MB');
  }

  // Convert base64 to blob
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Determine file extension for storage
  const storageExt = ext === 'jpg' || ext === 'jpeg' ? 'jpg' : ext;
  const filePath = `${userData.id}/avatar.${storageExt}`;

  // Delete old avatar first (if exists)
  await supabase.storage.from('user-avatars').remove([
    `${userData.id}/avatar.jpg`,
    `${userData.id}/avatar.png`,
    `${userData.id}/avatar.webp`,
    `${userData.id}/avatar.gif`,
  ]);

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, byteArray, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw new Error('Failed to upload avatar');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // Update user profile with new avatar URL
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userData.id,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (profileError) {
    console.error('Error updating profile with avatar:', profileError);
  }

  // Also update users table avatar
  await supabase
    .from('users')
    .update({ avatar: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', userData.id);

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userData.id,
    action: 'avatar.upload',
    entity_type: 'user_profiles',
    entity_id: userData.id,
    meta: { file_type: contentType, file_size: fileInfo.size },
  });

  return avatarUrl;
}






