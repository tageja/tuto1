/**
 * Album API Functions
 * Handles all Supabase queries for photo albums
 */

import { supabase } from '../supabase';
import { compressImage, uploadAlbumPhoto, deleteAlbumPhoto, type CompressedPhoto } from '../supabase/storage-albums';

export type AlbumCategory = 'school' | 'class' | 'competition' | 'workshop' | 'outing' | 'practice' | 'celebration';
export type AlbumStatus = 'active' | 'archived';
export type AlbumTab = 'all' | 'recent' | 'events' | 'class' | 'favorites';

export interface Album {
  id: string;
  school_id: string;
  title: string;
  category: AlbumCategory;
  status: AlbumStatus;
  event_date: string | null;
  class_id: string | null;
  grade: string | null;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  photos_count?: number;
  cover_photos?: Photo[];
  favorite_count?: number;
  class_name?: string;
}

export interface Photo {
  id: string;
  album_id: string;
  storage_path: string;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  blurhash: string | null;
  created_at: string;
  public_url?: string;
  is_favorited?: boolean;
}

export interface FavoritePhoto extends Photo {
  album_title?: string;
}

/**
 * Get albums for a school with optional filtering
 */
export async function getAlbums(
  schoolId: string,
  tab: AlbumTab = 'all',
  userId?: string
): Promise<Album[]> {
  let query = supabase
    .from('school_albums')
    .select(`
      *,
      photos_count:school_album_photos(count),
      class:school_classes(name)
    `)
    .eq('school_id', schoolId)
    .order('event_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  // Apply tab filters
  if (tab === 'recent') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.or(
      `event_date.gte.${thirtyDaysAgo.toISOString().split('T')[0]},created_at.gte.${thirtyDaysAgo.toISOString()}`
    );
  } else if (tab === 'events') {
    query = query.in('category', ['school', 'competition', 'workshop', 'celebration']);
  } else if (tab === 'class') {
    query = query.not('class_id', 'is', null);
  } else if (tab === 'favorites' && userId) {
    // For favorites tab, we now return albums that have favorited photos (not used in new photo grid view)
    const { data: favoritePhotos } = await supabase
      .from('school_photo_favorites')
      .select('photo_id, school_album_photos(album_id)')
      .eq('user_id', userId);

    if (!favoritePhotos || favoritePhotos.length === 0) {
      return [];
    }

    const albumIds = Array.from(new Set(
      favoritePhotos
        .map((fp: any) => fp.school_album_photos?.album_id)
        .filter(Boolean)
    ));

    if (albumIds.length === 0) {
      return [];
    }

    query = query.in('id', albumIds);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch albums: ${error.message}`);
  }

  // Transform data
  const albums: Album[] = (data || []).map((album: any) => ({
    ...album,
    photos_count: album.photos_count?.[0]?.count || 0,
    class_name: album.class?.name || null,
    class: undefined, // Remove nested object
  }));

  // Get cover photos for albums
  if (albums.length > 0) {
    const albumIds = albums.map((a) => a.id);
    const covers = await getAlbumCovers(albumIds, 3);
    albums.forEach((album) => {
      album.cover_photos = covers[album.id] || [];
    });
  }

  // Get favorite counts if userId provided
  if (userId && albums.length > 0) {
    const albumIds = albums.map((a) => a.id);
    const favoriteCounts = await getFavoriteCountsByAlbum(albumIds, userId);
    albums.forEach((album) => {
      album.favorite_count = favoriteCounts[album.id] || 0;
    });
  }

  return albums;
}

/**
 * Get single album with photos
 */
export async function getAlbum(albumId: string, userId?: string): Promise<Album & { photos: Photo[] }> {
  const { data: albumData, error: albumError } = await supabase
    .from('school_albums')
    .select(`
      *,
      class:school_classes(name)
    `)
    .eq('id', albumId)
    .single();

  if (albumError || !albumData) {
    throw new Error(`Failed to fetch album: ${albumError?.message || 'Album not found'}`);
  }

  // Get photos
  const { data: photosData, error: photosError } = await supabase
    .from('school_album_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: true });

  if (photosError) {
    throw new Error(`Failed to fetch photos: ${photosError.message}`);
  }

  // Get public URLs
  const photos: Photo[] = (photosData || []).map((photo) => {
    const { data: urlData } = supabase.storage
      .from('album-photos')
      .getPublicUrl(photo.storage_path);

    return {
      ...photo,
      public_url: urlData?.publicUrl,
    };
  });

  // Get favorite status if userId provided
  if (userId && photos.length > 0) {
    const photoIds = photos.map((p) => p.id);
    const { data: favorites } = await supabase
      .from('school_photo_favorites')
      .select('photo_id')
      .eq('user_id', userId)
      .in('photo_id', photoIds);

    const favoritedIds = new Set((favorites || []).map((f) => f.photo_id));
    photos.forEach((photo) => {
      photo.is_favorited = favoritedIds.has(photo.id);
    });
  }

  // Get photo count
  const photosCount = photos.length;

  return {
    ...albumData,
    photos_count: photosCount,
    photos,
    class_name: (albumData as any).class?.name || null,
  };
}

/**
 * Get cover photos for multiple albums
 */
export async function getAlbumCovers(
  albumIds: string[],
  limitPerAlbum: number = 3
): Promise<Record<string, Photo[]>> {
  if (albumIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('school_album_photos')
    .select('*')
    .in('album_id', albumIds)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch cover photos:', error);
    return {};
  }

  // Group by album_id and take first N
  const covers: Record<string, Photo[]> = {};
  const grouped: Record<string, Photo[]> = {};

  (data || []).forEach((photo) => {
    if (!grouped[photo.album_id]) {
      grouped[photo.album_id] = [];
    }
    grouped[photo.album_id].push(photo);
  });

  // Get public URLs and limit
  Object.keys(grouped).forEach((albumId) => {
    const albumPhotos = grouped[albumId].slice(0, limitPerAlbum);
    covers[albumId] = albumPhotos.map((photo) => {
      const { data: urlData } = supabase.storage
        .from('album-photos')
        .getPublicUrl(photo.storage_path);

      return {
        ...photo,
        public_url: urlData?.publicUrl,
      };
    });
  });

  return covers;
}

/**
 * Get favorite counts by album
 */
async function getFavoriteCountsByAlbum(
  albumIds: string[],
  userId: string
): Promise<Record<string, number>> {
  if (albumIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from('school_photo_favorites')
    .select('photo_id, school_album_photos!inner(album_id)')
    .eq('user_id', userId)
    .in('school_album_photos.album_id', albumIds);

  if (error) {
    console.error('Failed to fetch favorite counts:', error);
    return {};
  }

  const counts: Record<string, number> = {};
  (data || []).forEach((item: any) => {
    const albumId = item.school_album_photos?.album_id;
    if (albumId) {
      counts[albumId] = (counts[albumId] || 0) + 1;
    }
  });

  return counts;
}

/**
 * Create new album with photos
 * Includes proper error handling with rollback on failure
 */
export async function createAlbum(
  data: {
    school_id: string;
    title: string;
    category: AlbumCategory;
    event_date?: string | null;
    class_id?: string | null;
    grade?: string | null;
    description?: string | null;
    status?: AlbumStatus;
    created_by: string;
  },
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Album> {
  // Track uploaded files for rollback
  const uploadedPaths: string[] = [];
  let albumId: string | null = null;

  try {
    // Step 1: Create album record
    const { data: albumData, error: albumError } = await supabase
      .from('school_albums')
      .insert({
        ...data,
        status: data.status || 'active',
      })
      .select()
      .single();

    if (albumError || !albumData) {
      throw new Error(`Failed to create album: ${albumError?.message || 'Unknown error'}`);
    }

    albumId = albumData.id;
    const currentAlbumId = albumId; // Capture for use in loop

    // Step 2: Upload photos one by one with progress
    if (files.length > 0) {
      const photoRecords: Array<{
        album_id: string;
        storage_path: string;
        width: number;
        height: number;
        size_bytes: number;
      }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Report progress
        if (onProgress) {
          onProgress(i + 1, files.length);
        }

        // Compress image
        const compressed: CompressedPhoto = await compressImage(file);

        // Upload to storage
        const uploaded = await uploadAlbumPhoto(data.school_id, currentAlbumId, compressed);
        uploadedPaths.push(uploaded.storagePath);

        // Add to photo records
        photoRecords.push({
          album_id: currentAlbumId,
          storage_path: uploaded.storagePath,
          width: uploaded.width,
          height: uploaded.height,
          size_bytes: uploaded.sizeBytes,
        });
      }

      // Step 3: Insert all photo records in one batch
      if (photoRecords.length > 0) {
        const { error: photosError } = await supabase
          .from('school_album_photos')
          .insert(photoRecords);

        if (photosError) {
          throw new Error(`Failed to save photo records: ${photosError.message}`);
        }
      }
    }

    return albumData;
  } catch (error: any) {
    // Rollback: Delete uploaded files from storage
    if (uploadedPaths.length > 0) {
      console.log('Rolling back uploaded files:', uploadedPaths);
      try {
        await supabase.storage.from('album-photos').remove(uploadedPaths);
      } catch (storageError) {
        console.error('Failed to rollback storage files:', storageError);
      }
    }

    // Rollback: Delete album record if created
    if (albumId) {
      console.log('Rolling back album record:', albumId);
      try {
        await supabase.from('school_albums').delete().eq('id', albumId);
      } catch (dbError) {
        console.error('Failed to rollback album record:', dbError);
      }
    }

    // Re-throw the original error
    throw error;
  }
}

/**
 * Update album metadata
 */
export async function updateAlbum(
  albumId: string,
  data: {
    title?: string;
    category?: AlbumCategory;
    event_date?: string | null;
    class_id?: string | null;
    grade?: string | null;
    description?: string | null;
    status?: AlbumStatus;
  }
): Promise<Album> {
  const { data: albumData, error } = await supabase
    .from('school_albums')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', albumId)
    .select()
    .single();

  if (error || !albumData) {
    throw new Error(`Failed to update album: ${error?.message || 'Unknown error'}`);
  }

  return albumData;
}

/**
 * Add photos to existing album
 */
export async function addPhotosToAlbum(
  schoolId: string,
  albumId: string,
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<Photo[]> {
  const uploadedPaths: string[] = [];

  try {
    const photoRecords: Array<{
      album_id: string;
      storage_path: string;
      width: number;
      height: number;
      size_bytes: number;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }

      // Compress and upload
      const compressed = await compressImage(file);
      const uploaded = await uploadAlbumPhoto(schoolId, albumId, compressed);
      uploadedPaths.push(uploaded.storagePath);

      photoRecords.push({
        album_id: albumId,
        storage_path: uploaded.storagePath,
        width: uploaded.width,
        height: uploaded.height,
        size_bytes: uploaded.sizeBytes,
      });
    }

    const { data, error } = await supabase
      .from('school_album_photos')
      .insert(photoRecords)
      .select();

    if (error || !data) {
      throw new Error(`Failed to add photos: ${error?.message || 'Unknown error'}`);
    }

    // Get public URLs
    return data.map((photo) => {
      const { data: urlData } = supabase.storage
        .from('album-photos')
        .getPublicUrl(photo.storage_path);

      return {
        ...photo,
        public_url: urlData?.publicUrl,
      };
    });
  } catch (error) {
    // Rollback uploaded files on error
    if (uploadedPaths.length > 0) {
      try {
        await supabase.storage.from('album-photos').remove(uploadedPaths);
      } catch (storageError) {
        console.error('Failed to rollback uploaded files:', storageError);
      }
    }
    throw error;
  }
}

/**
 * Delete photo
 */
export async function deletePhoto(photoId: string): Promise<void> {
  // Get photo record to get storage path
  const { data: photoData, error: fetchError } = await supabase
    .from('school_album_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single();

  if (fetchError || !photoData) {
    throw new Error(`Failed to fetch photo: ${fetchError?.message || 'Photo not found'}`);
  }

  // Delete from storage
  try {
    await deleteAlbumPhoto(photoData.storage_path);
  } catch (storageError: any) {
    console.error('Failed to delete from storage:', storageError);
    // Continue to delete DB record even if storage delete fails
  }

  // Delete from database (cascade will handle favorites)
  const { error: deleteError } = await supabase
    .from('school_album_photos')
    .delete()
    .eq('id', photoId);

  if (deleteError) {
    throw new Error(`Failed to delete photo: ${deleteError.message}`);
  }
}

/**
 * Toggle favorite for a photo
 */
export async function toggleFavorite(photoId: string, userId: string): Promise<boolean> {
  // Check if already favorited
  const { data: existing } = await supabase
    .from('school_photo_favorites')
    .select('id')
    .eq('photo_id', photoId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('school_photo_favorites')
      .delete()
      .eq('photo_id', photoId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    return false;
  } else {
    // Add favorite
    const { error } = await supabase
      .from('school_photo_favorites')
      .insert({
        photo_id: photoId,
        user_id: userId,
      });

    if (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }

    return true;
  }
}

/**
 * Get user's favorited photos with album info
 */
export async function getFavoritePhotos(userId: string, schoolId: string): Promise<FavoritePhoto[]> {
  const { data, error } = await supabase
    .from('school_photo_favorites')
    .select(`
      photo_id,
      school_album_photos!inner(
        *,
        album:school_albums!inner(id, title, school_id)
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch favorites: ${error.message}`);
  }

  // Filter by school and map to photos
  const photos: FavoritePhoto[] = (data || [])
    .map((item: any) => {
      const photo = item.school_album_photos;
      if (!photo || photo.album?.school_id !== schoolId) return null;

      const { data: urlData } = supabase.storage
        .from('album-photos')
        .getPublicUrl(photo.storage_path);

      return {
        ...photo,
        album: undefined, // Remove nested
        album_title: photo.album?.title,
        public_url: urlData?.publicUrl,
        is_favorited: true,
      };
    })
    .filter(Boolean) as FavoritePhoto[];

  return photos;
}

/**
 * Get signed URLs for downloading photos
 */
export async function getSignedUrls(storagePaths: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const path of storagePaths) {
    const { data, error } = await supabase.storage
      .from('album-photos')
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error || !data?.signedUrl) {
      console.error(`Failed to get signed URL for ${path}:`, error);
      // Use public URL as fallback
      const { data: publicData } = supabase.storage
        .from('album-photos')
        .getPublicUrl(path);
      urls.push(publicData.publicUrl);
    } else {
      urls.push(data.signedUrl);
    }
  }

  return urls;
}
