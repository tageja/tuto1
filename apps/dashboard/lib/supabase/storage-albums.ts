/**
 * Album Photo Storage Utilities
 * Handles client-side compression and upload to Supabase Storage
 */

import { supabase } from '../supabase';

const ALBUM_BUCKET = 'album-photos';
const MAX_LONG_EDGE = 1600;
const JPEG_QUALITY = 0.77; // 77% quality

export interface CompressedPhoto {
  file: File;
  width: number;
  height: number;
  sizeBytes: number;
  blurhash?: string; // Optional, can be generated later
}

/**
 * Get EXIF orientation from image
 */
function getOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer);
      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(1);
        return;
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (view.getUint16(offset, false) === 0xffe1) {
          offset += 2;
          if (view.getUint16(offset, false) !== 0x4578) {
            offset += 2;
            continue;
          }
          const little = view.getUint16((offset += 2), false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tag = view.getUint16(offset, little);
          offset += 2;
          if (tag === 0x0112) {
            resolve(view.getUint16(offset, little));
            return;
          }
        }
        offset += 2;
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Apply EXIF orientation to canvas
 */
function applyOrientation(canvas: HTMLCanvasElement, orientation: number): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;

  if (orientation > 4) {
    canvas.width = height;
    canvas.height = width;
  }

  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
  }

  return canvas;
}

/**
 * Compress image to target size with quality settings
 */
export async function compressImage(file: File): Promise<CompressedPhoto> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        // Get orientation
        const orientation = await getOrientation(file);

        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        const longEdge = Math.max(width, height);

        if (longEdge > MAX_LONG_EDGE) {
          const ratio = MAX_LONG_EDGE / longEdge;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Apply orientation if needed
        if (orientation !== 1) {
          applyOrientation(canvas, orientation);
        }

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              width,
              height,
              sizeBytes: blob.size,
            });
          },
          'image/jpeg',
          JPEG_QUALITY
        );

        URL.revokeObjectURL(url);
      } catch (error) {
        URL.revokeObjectURL(url);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Upload compressed photo to Supabase Storage
 */
export async function uploadAlbumPhoto(
  schoolId: string,
  albumId: string,
  photo: CompressedPhoto
): Promise<{
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}> {
  const timestamp = Date.now();
  const safeName = photo.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${safeName}`;
  const storagePath = `web/${schoolId}/${albumId}/${filename}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(ALBUM_BUCKET)
    .upload(storagePath, photo.file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(ALBUM_BUCKET).getPublicUrl(storagePath);

  if (!urlData?.publicUrl) {
    throw new Error('Failed to get public URL for uploaded photo');
  }

  return {
    storagePath,
    publicUrl: urlData.publicUrl,
    width: photo.width,
    height: photo.height,
    sizeBytes: photo.sizeBytes,
  };
}

/**
 * Upload multiple photos to an album
 */
export async function uploadAlbumPhotos(
  schoolId: string,
  albumId: string,
  files: File[]
): Promise<Array<{
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}>> {
  const results = [];

  for (const file of files) {
    // Compress image
    const compressed = await compressImage(file);

    // Upload
    const uploaded = await uploadAlbumPhoto(schoolId, albumId, compressed);
    results.push(uploaded);
  }

  return results;
}

/**
 * Delete photo from storage
 */
export async function deleteAlbumPhoto(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(ALBUM_BUCKET).remove([storagePath]);

  if (error) {
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
}


