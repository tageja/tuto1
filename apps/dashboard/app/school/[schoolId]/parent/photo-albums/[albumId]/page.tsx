'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../../../components/ui/Button';
import { AlbumGallery } from '../../../../../../components/photos/AlbumGallery';
import { PhotoLightbox } from '../../../../../../components/photos/PhotoLightbox';
import { getAlbum, toggleFavorite, type Album, type Photo } from '../../../../../../lib/api/albums';
import { supabase } from '../../../../../../lib/supabase';

export default function ParentAlbumPage() {
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
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', authUser.id)
          .single();
        if (userData) {
          setUserId(userData.id);
        }
      }
    };
    fetchUserId();
  }, []);

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
      if (!userId) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getAlbum(albumId, userId);
        setAlbum(data);
      } catch (err: any) {
        console.error('Failed to fetch album:', err);
        setError(err.message || 'Failed to load album');
      } finally {
        setLoading(false);
      }
    };

    if (albumId && userId) {
      fetchAlbum();
    }
  }, [albumId, userId]);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    router.push(`?photo=${photo.id}`, { scroll: false });
  };

  const handleFavoriteToggle = async (photo: Photo) => {
    if (!userId) return;

    try {
      const isFavorited = await toggleFavorite(photo.id, userId);
      setAlbum((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          photos: prev.photos.map((p) =>
            p.id === photo.id ? { ...p, is_favorited: isFavorited } : p
          ),
        };
      });
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      alert(err.message || 'Failed to update favorite');
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
          onClick={() => router.push(`/school/${encodeURIComponent(schoolId)}/parent/photo-albums`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Albums
        </Button>

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
      </div>

      {/* Gallery */}
      <AlbumGallery
        photos={album.photos}
        onPhotoClick={handlePhotoClick}
        onFavoriteToggle={handleFavoriteToggle}
        showFavorites
        userId={userId || undefined}
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
          onFavoriteToggle={handleFavoriteToggle}
          showFavorites
        />
      )}
    </div>
  );
}


