// tuto.social — Media service (image picking + Supabase Storage upload)

import * as ImagePicker from 'expo-image-picker';
import { socialSupabase } from './api.client';

const SOCIAL_MEDIA_BUCKET = 'social-media';

export interface PickedImage {
  uri:    string;
  width:  number;
  height: number;
  type:   string;
}

// --------------------------------------------------------------------------
// Pick images from device library (up to maxCount)
// --------------------------------------------------------------------------

export async function pickImages(maxCount = 4): Promise<PickedImage[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Media library permission not granted');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 0.85,
    exif: false,
  });

  if (result.canceled) return [];

  return result.assets.map((asset) => ({
    uri:    asset.uri,
    width:  asset.width,
    height: asset.height,
    type:   asset.mimeType ?? 'image/jpeg',
  }));
}

// --------------------------------------------------------------------------
// Upload a local image URI to Supabase Storage
// --------------------------------------------------------------------------

export async function uploadToStorage(
  localUri: string,
  bucket: string = SOCIAL_MEDIA_BUCKET,
): Promise<string> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  // Build a unique path per user
  const ext = localUri.split('.').pop() ?? 'jpg';
  const fileName = `${user.id}/${Date.now()}.${ext}`;

  // Fetch as blob
  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await socialSupabase.storage
    .from(bucket)
    .upload(fileName, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  return getMediaUrl(fileName, bucket);
}

// --------------------------------------------------------------------------
// Get public URL for a storage path
// --------------------------------------------------------------------------

export function getMediaUrl(path: string, bucket: string = SOCIAL_MEDIA_BUCKET): string {
  const { data } = socialSupabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// --------------------------------------------------------------------------
// Upload multiple images and return all public URLs
// --------------------------------------------------------------------------

export async function uploadImages(
  localUris: string[],
  bucket: string = SOCIAL_MEDIA_BUCKET,
): Promise<string[]> {
  return Promise.all(localUris.map((uri) => uploadToStorage(uri, bucket)));
}
