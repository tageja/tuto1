import * as FileSystem from 'expo-file-system';
import { uploadUserFileBase64 } from './storage';
import { logDebug, logError, logWarn } from './logger';

export async function uploadImageToCloudinary(localUri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing Cloudinary env: EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME or EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET');
  }

  // Ensure file exists and convert to base64 to avoid platform-specific multipart issues
  const info = await FileSystem.getInfoAsync(localUri);
  if (!info.exists) throw new Error('Local image not found');
  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: `data:image/jpeg;base64,${base64}`,
      upload_preset: uploadPreset,
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || 'Upload failed');
  }
  return json.secure_url as string;
}

export async function uploadImageAuto(localUri: string, userId: string): Promise<string> {
  try {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;
    if (cloudName && uploadPreset) {
      logDebug('Upload: trying Cloudinary env');
      return await uploadImageToCloudinary(localUri);
    }
    // Try Cloudinary demo as a temporary fallback for testing
    logDebug('Upload: trying Cloudinary demo fallback');
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) throw new Error('Local image not found');
    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const res = await fetch(`https://api.cloudinary.com/v1_1/demo/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: `data:image/jpeg;base64,${base64}`,
        upload_preset: 'docs_upload_example_us_preset',
      }),
    });
    const json = await res.json();
    if (res.ok && json.secure_url) {
      return json.secure_url as string;
    }
    logWarn('Upload: Cloudinary demo failed', json);
  } catch (e) {
    logError('Upload: Cloudinary path failed', e);
  }

  // Final fallback to Firebase Storage base64 uploader
  try {
    logDebug('Upload: falling back to Firebase Storage base64');
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) throw new Error('Local image not found');
    const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
    const name = `post-${Date.now()}.jpg`;
    return await uploadUserFileBase64(userId || 'guest', 'posts', name, base64);
  } catch (e) {
    logError('Upload: Firebase Storage base64 failed', e);
    // As a last resort, return local URI so at least local preview works
    return localUri;
  }
}

