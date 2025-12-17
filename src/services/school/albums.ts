/**
 * Albums Service
 * Handles all Supabase queries for photo albums in mobile app
 */

import { supabase, getCurrentUser } from '../../config/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy'; // TODO: Migrate to new File API when implementing real compression (Option 3)
import { Image } from 'react-native';

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
  is_favorite?: boolean; // For parent view
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

const ALBUM_BUCKET = 'album-photos';

// TODO [COMPRESSION - Option 3 Implementation]:
// Current: These constants are defined but NOT USED - no compression happening
// Future: Use expo-image-manipulator to resize (MAX_LONG_EDGE) and compress (JPEG_QUALITY)
// Expected savings: 60-80% file size reduction (e.g., 4MB → 600KB)
// Package needed: npx expo install expo-image-manipulator
const MAX_LONG_EDGE = 1600;
const JPEG_QUALITY = 0.77;

/**
 * Resolve school identifier (name or UUID) to UUID
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    console.log('🏫 [Albums] Resolving school ID:', schoolIdentifier);
    
    // If it's already a valid UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      console.log('✅ [Albums] School ID is valid UUID:', schoolIdentifier);
      return schoolIdentifier;
    }

    // If it's an Airtable record ID (starts with 'rec'), try to find by name fallback
    if (schoolIdentifier.startsWith('rec')) {
      console.log('⚠️ [Albums] Detected Airtable record ID, using fallback');
      // Try common demo school names
      const fallbackNames = ['Tuto Demo School', 'Demo School', schoolIdentifier];
      
      for (const name of fallbackNames) {
        const { data, error } = await supabase
          .from('schools')
          .select('id')
          .ilike('name', name)
          .limit(1)
          .single();
        
        if (data && !error) {
          console.log('✅ [Albums] Found school by fallback name:', name, '→', data.id);
          return data.id;
        }
      }
    }

    // Try to find school by exact name match
    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error) {
      console.warn('⚠️ [Albums] School not found by exact name:', schoolIdentifier, error.message);
      
      // Try case-insensitive match as fallback
      const { data: dataIlike, error: errorIlike } = await supabase
        .from('schools')
        .select('id')
        .ilike('name', schoolIdentifier)
        .limit(1)
        .single();

      if (dataIlike && !errorIlike) {
        console.log('✅ [Albums] Found school by case-insensitive name:', dataIlike.id);
        return dataIlike.id;
      }

      // Last resort: get first school
      console.warn('⚠️ [Albums] Using first available school as fallback');
      const { data: firstSchool } = await supabase
        .from('schools')
        .select('id')
        .limit(1)
        .single();

      return firstSchool?.id || null;
    }

    console.log('✅ [Albums] Resolved school ID:', data.id);
    return data?.id || null;
  } catch (error) {
    console.error('❌ [Albums] Error resolving school ID:', error);
    return null;
  }
}

/**
 * Get current user ID from auth
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (error || !data) return null;
    return data.id;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Get image metadata (dimensions and size)
 * 
 * TODO [Option 3]: This function does NOT actually compress images yet!
 * Current: Only reads metadata (width, height, size) from original image
 * Future: Use expo-image-manipulator to resize and compress before upload
 * 
 * To implement real compression:
 * 1. import * as ImageManipulator from 'expo-image-manipulator'
 * 2. Use ImageManipulator.manipulateAsync() to resize/compress
 * 3. Return compressed image URI instead of original
 */
async function compressImage(uri: string): Promise<{
  uri: string;
  width: number;
  height: number;
  sizeBytes: number;
}> {
  try {
    // Get image info
    const imageInfo = await FileSystem.getInfoAsync(uri);
    if (!imageInfo.exists) {
      throw new Error('Image file not found');
    }

    // Get actual image dimensions
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });

    // Read file as base64 for upload
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Calculate size in bytes (base64 is ~33% larger than binary)
    const sizeBytes = Math.round(base64.length * 0.75);

    return {
      uri,
      width: dimensions.width,
      height: dimensions.height,
      sizeBytes,
    };
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

/**
 * Upload photo to Supabase Storage
 */
async function uploadPhoto(
  schoolId: string,
  albumId: string,
  imageUri: string,
  filename: string
): Promise<{
  storagePath: string;
  publicUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}> {
  try {
    const compressed = await compressImage(imageUri);
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `${timestamp}-${safeName}`;
    const storagePath = `mobile/${schoolId}/${albumId}/${finalFilename}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to ArrayBuffer
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(ALBUM_BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType: 'image/jpeg',
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
      width: compressed.width,
      height: compressed.height,
      sizeBytes: compressed.sizeBytes,
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Fetch admin albums with filters
 */
export async function fetchAdminAlbums(
  schoolId: string,
  tab: AlbumTab = 'all',
  search: string = '',
  userId?: string
): Promise<Album[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    console.log('[fetchAdminAlbums] Input schoolId:', schoolId);
    console.log('[fetchAdminAlbums] Resolved schoolId:', resolvedSchoolId);
    
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    let query = supabase
      .from('school_albums')
      .select(`
        *,
        photos_count:school_album_photos(count),
        class:school_classes(name)
      `)
      .eq('school_id', resolvedSchoolId)
      .eq('status', 'active')
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    console.log('[fetchAdminAlbums] Tab:', tab, 'Search:', search);

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
    }

    // Apply search filter
    if (search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    console.log('[fetchAdminAlbums] Query result - data count:', data?.length || 0);
    console.log('[fetchAdminAlbums] Query error:', error);

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

    // Get cover photos
    if (albums.length > 0) {
      const albumIds = albums.map((a) => a.id);
      const covers = await getAlbumCovers(albumIds, 3);
      albums.forEach((album) => {
        album.cover_photos = covers[album.id] || [];
      });
    }

    return albums;
  } catch (error) {
    console.error('Error fetching admin albums:', error);
    throw error;
  }
}

/**
 * Fetch parent albums with filters
 */
export async function fetchParentAlbums(
  schoolId: string,
  parentId: string,
  childId: string | null,
  tab: AlbumTab = 'all',
  search: string = ''
): Promise<Album[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    let query = supabase
      .from('school_albums')
      .select(`
        *,
        photos_count:school_album_photos(count),
        class:school_classes(name)
      `)
      .eq('school_id', resolvedSchoolId)
      .eq('status', 'active')
      .order('event_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Apply tab filters
    if (tab === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.or(
        `event_date.gte.${thirtyDaysAgo.toISOString().split('T')[0]},created_at.gte.${thirtyDaysAgo.toISOString()}`
      );
    } else if (tab === 'class' || tab === 'classEvents') {
      query = query.not('class_id', 'is', null);
    } else if (tab === 'favorites') {
      // Get albums that have favorited photos
      const { data: favoritePhotos } = await supabase
        .from('school_photo_favorites')
        .select('photo_id, school_album_photos!inner(album_id)')
        .eq('user_id', parentId);

      if (!favoritePhotos || favoritePhotos.length === 0) {
        return [];
      }

      const albumIds = Array.from(
        new Set(
          favoritePhotos
            .map((fp: any) => fp.school_album_photos?.album_id)
            .filter(Boolean)
        )
      );

      if (albumIds.length === 0) {
        return [];
      }

      query = query.in('id', albumIds);
    }

    // Apply search filter
    if (search.trim()) {
      const searchTerm = search.trim();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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
      class: undefined,
    }));

    // Get cover photos
    if (albums.length > 0) {
      const albumIds = albums.map((a) => a.id);
      const covers = await getAlbumCovers(albumIds, 3);
      albums.forEach((album) => {
        album.cover_photos = covers[album.id] || [];
      });
    }

    // Get favorite status for albums (check if any photo in album is favorited)
    if (albums.length > 0 && parentId) {
      const albumIds = albums.map((a) => a.id);
      const { data: favorites } = await supabase
        .from('school_photo_favorites')
        .select('school_album_photos!inner(album_id)')
        .eq('user_id', parentId)
        .in('school_album_photos.album_id', albumIds);

      const favoritedAlbumIds = new Set(
        (favorites || []).map((f: any) => f.school_album_photos?.album_id).filter(Boolean)
      );

      albums.forEach((album) => {
        album.is_favorite = favoritedAlbumIds.has(album.id);
      });
    }

    return albums;
  } catch (error) {
    console.error('Error fetching parent albums:', error);
    throw error;
  }
}

/**
 * Get album covers for multiple albums
 */
async function getAlbumCovers(
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
      const { data: urlData } = supabase.storage.from(ALBUM_BUCKET).getPublicUrl(photo.storage_path);

      return {
        ...photo,
        public_url: urlData?.publicUrl,
      };
    });
  });

  return covers;
}

/**
 * Fetch single album with photos
 */
export async function fetchAlbum(albumId: string, userId?: string): Promise<Album & { photos: Photo[] }> {
  console.log('[fetchAlbum] Fetching album:', albumId);
  
  const { data: albumData, error: albumError } = await supabase
    .from('school_albums')
    .select(`
      *,
      class:school_classes(name)
    `)
    .eq('id', albumId)
    .single();

  if (albumError || !albumData) {
    console.error('[fetchAlbum] Album fetch error:', albumError);
    throw new Error(`Failed to fetch album: ${albumError?.message || 'Album not found'}`);
  }

  console.log('[fetchAlbum] Album data:', albumData.title);

  // Get photos
  const { data: photosData, error: photosError } = await supabase
    .from('school_album_photos')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: true });

  console.log('[fetchAlbum] Photos data count:', photosData?.length || 0);
  console.log('[fetchAlbum] Photos error:', photosError);

  if (photosError) {
    throw new Error(`Failed to fetch photos: ${photosError.message}`);
  }

  // Get public URLs
  const photos: Photo[] = (photosData || []).map((photo) => {
    const { data: urlData } = supabase.storage.from(ALBUM_BUCKET).getPublicUrl(photo.storage_path);
    console.log('[fetchAlbum] Photo storage_path:', photo.storage_path);
    console.log('[fetchAlbum] Photo public_url:', urlData?.publicUrl);

    return {
      ...photo,
      public_url: urlData?.publicUrl,
    };
  });

  console.log('[fetchAlbum] Total photos with URLs:', photos.length);

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

  return {
    ...albumData,
    photos_count: photos.length,
    photos,
    class_name: (albumData as any).class?.name || null,
  };
}

/**
 * Create album with photos
 */
export async function createAlbum(
  data: {
    school_id: string;
    title: string;
    category: AlbumCategory;
    event_date?: string | null;
    class_id?: string | null;
    visibility?: 'all_parents' | 'class_only';
    grade?: string | null;
    description?: string | null;
    status?: AlbumStatus;
    created_by: string;
  },
  photos: ImagePicker.ImagePickerAsset[],
  onProgress?: (current: number, total: number) => void
): Promise<Album> {
  const uploadedPaths: string[] = [];
  let albumId: string | null = null;

  try {
    // Step 1: Resolve school ID first
    console.log('[createAlbum] Resolving school ID:', data.school_id);
    const resolvedSchoolId = await resolveSchoolId(data.school_id);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }
    console.log('[createAlbum] Resolved school ID:', resolvedSchoolId);

    // Step 2: Create album record with resolved UUID
    const { data: albumData, error: albumError } = await supabase
      .from('school_albums')
      .insert({
        ...data,
        school_id: resolvedSchoolId, // Use resolved UUID instead of Airtable ID
        status: data.status || 'active',
        visibility: data.visibility || 'all_parents',
      })
      .select()
      .single();

    if (albumError || !albumData) {
      throw new Error(`Failed to create album: ${albumError?.message || 'Unknown error'}`);
    }

    albumId = albumData.id;
    console.log('[createAlbum] Album created with ID:', albumId);

    // Step 3: Upload photos
    if (photos.length > 0) {
      const photoRecords: Array<{
        album_id: string;
        storage_path: string;
        width: number;
        height: number;
        size_bytes: number;
      }> = [];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (onProgress) {
          onProgress(i + 1, photos.length);
        }

        // Upload photo
        const uploaded = await uploadPhoto(
          resolvedSchoolId,
          albumId,
          photo.uri,
          photo.fileName || `photo-${i}.jpg`
        );
        uploadedPaths.push(uploaded.storagePath);

        // Add to photo records
        photoRecords.push({
          album_id: albumId,
          storage_path: uploaded.storagePath,
          width: uploaded.width,
          height: uploaded.height,
          size_bytes: uploaded.sizeBytes,
        });
      }

      // Step 4: Insert all photo records
      if (photoRecords.length > 0) {
        const { error: photosError } = await supabase.from('school_album_photos').insert(photoRecords);

        if (photosError) {
          throw new Error(`Failed to save photo records: ${photosError.message}`);
        }

        // Update cover_photo_path to first photo
        if (photoRecords.length > 0) {
          await supabase
            .from('school_albums')
            .update({ cover_photo_path: photoRecords[0].storage_path })
            .eq('id', albumId);
        }
      }
    }

    return albumData;
  } catch (error: any) {
    // Rollback: Delete uploaded files
    if (uploadedPaths.length > 0) {
      try {
        await supabase.storage.from(ALBUM_BUCKET).remove(uploadedPaths);
      } catch (storageError) {
        console.error('Failed to rollback storage files:', storageError);
      }
    }

    // Rollback: Delete album record
    if (albumId) {
      try {
        await supabase.from('school_albums').delete().eq('id', albumId);
      } catch (dbError) {
        console.error('Failed to rollback album record:', dbError);
      }
    }

    throw error;
  }
}

/**
 * Toggle photo favorite
 */
export async function togglePhotoFavorite(photoId: string, userId: string): Promise<boolean> {
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
    const { error } = await supabase.from('school_photo_favorites').insert({
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
 * Toggle album favorite (checks if any photo in album is favorited)
 * Note: This is a helper that toggles the first photo's favorite status
 * In practice, favorites are photo-level, not album-level
 */
export async function toggleAlbumFavorite(albumId: string, parentId: string): Promise<boolean> {
  // Get first photo in album
  const { data: photos } = await supabase
    .from('school_album_photos')
    .select('id')
    .eq('album_id', albumId)
    .limit(1);

  if (!photos || photos.length === 0) {
    throw new Error('Album has no photos');
  }

  return togglePhotoFavorite(photos[0].id, parentId);
}

