'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { AlbumGallery } from '../../../../../../components/photos/AlbumGallery';
import { PhotoLightbox } from '../../../../../../components/photos/PhotoLightbox';
import { getAlbum, addPhotosToAlbum, deletePhoto, updateAlbum, type Album, type Photo } from '../../../../../../lib/api/albums';
import { supabase } from '../../../../../../lib/supabase';

export default function AdminAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const albumId = params.albumId as string;
  const photoParam = searchParams.get('photo');

  const [album, setAlbum] = useState<(Album & { photos: Photo[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAddPhotos, setShowAddPhotos] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Open lightbox if photo param is present
  useEffect(() => {
    if (photoParam && album?.photos) {
      const index = album.photos.findIndex((p) => p.id === photoParam);
      if (index >= 0) {
        setLightboxIndex(index);
        setLightboxOpen(true);
      }
    }
  }, [photoParam, album]);

  // Fetch album
  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlbum(albumId);
        setAlbum(data);
      } catch (err: any) {
        console.error('Failed to fetch album:', err);
        setError(err.message || 'Failed to load album');
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbum();
    }
  }, [albumId]);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    router.push(`?photo=${photo.id}`, { scroll: false });
  };

  const handleAddPhotos = async (files: File[]) => {
    if (!album || files.length === 0) return;

    setUploading(true);
    try {
      const newPhotos = await addPhotosToAlbum(schoolId, album.id, files);
      setAlbum((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photos: [...prev.photos, ...newPhotos],
          photos_count: (prev.photos_count ?? 0) + newPhotos.length,
        };
      });
      setShowAddPhotos(false);
    } catch (err: any) {
      console.error('Failed to add photos:', err);
      alert(err.message || 'Failed to add photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!album) return;

    try {
      await deletePhoto(photo.id);
      setAlbum((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photos: prev.photos.filter((p) => p.id !== photo.id),
          photos_count: Math.max(0, (prev.photos_count ?? 0) - 1),
        };
      });
    } catch (err: any) {
      console.error('Failed to delete photo:', err);
      alert(err.message || 'Failed to delete photo');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      handleAddPhotos(imageFiles);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error || 'Album not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/admin/photo-albums`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Albums
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{album.title}</h1>
            {album.event_date && (
              <p className="text-gray-600 mt-1">
                {new Date(album.event_date).toLocaleDateString()}
              </p>
            )}
            {album.description && (
              <p className="text-gray-600 mt-2">{album.description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddPhotos(!showAddPhotos)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Photos
            </Button>
          </div>
        </div>

        {/* File input (hidden) */}
        {showAddPhotos && (
          <div className="mt-4">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
              id="add-photos-input"
            />
            <label
              htmlFor="add-photos-input"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Select Photos'}
            </label>
          </div>
        )}
      </div>

      {/* Gallery */}
      <AlbumGallery
        photos={album.photos}
        onPhotoClick={handlePhotoClick}
        onDelete={handleDeletePhoto}
        showDelete
      />

      {/* Lightbox */}
      {lightboxOpen && album.photos.length > 0 && (
        <PhotoLightbox
          photos={album.photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => {
            setLightboxOpen(false);
            router.push(window.location.pathname, { scroll: false });
          }}
          onDelete={handleDeletePhoto}
          showDelete
        />
      )}
    </div>
  );
}

