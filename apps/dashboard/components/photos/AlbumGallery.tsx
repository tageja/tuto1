'use client';

import { useState, useEffect, useRef } from 'react';
import type { Photo } from '../../lib/api/albums';
import { Heart, Trash2, Download, Loader2 } from 'lucide-react';

interface AlbumGalleryProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo, index: number) => void;
  onFavoriteToggle?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  showFavorites?: boolean;
  showDelete?: boolean;
  showDownload?: boolean;
  userId?: string;
}

// Helper function to download a single photo
async function downloadPhoto(photo: Photo) {
  if (!photo.public_url) return;
  
  try {
    // Fetch the image as blob to trigger download with correct filename
    const response = await fetch(photo.public_url);
    if (!response.ok) throw new Error('Failed to fetch');
    const blob = await response.blob();
    
    // Extract filename from storage path
    const fileName = photo.storage_path.split('/').pop() || `photo-${photo.id}.jpg`;
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed, trying direct link:', error);
    // Fallback: open in new tab for manual save
    window.open(photo.public_url, '_blank');
  }
}

export function AlbumGallery({
  photos,
  onPhotoClick,
  onFavoriteToggle,
  onDelete,
  showFavorites = false,
  showDelete = false,
  showDownload = true, // Show download by default
  userId,
}: AlbumGalleryProps) {
  const [visiblePhotos, setVisiblePhotos] = useState<Photo[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const photoRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Lazy load photos
  useEffect(() => {
    // Start with first 12 photos
    setVisiblePhotos(photos.slice(0, 12));

    // Set up intersection observer for remaining photos
    if (photos.length > 12) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const photoId = entry.target.getAttribute('data-photo-id');
              if (photoId) {
                const photoIndex = photos.findIndex((p) => p.id === photoId);
                if (photoIndex >= 0 && photoIndex < photos.length) {
                  setVisiblePhotos((prev) => {
                    if (prev.length < photos.length) {
                      const nextBatch = photos.slice(0, Math.min(prev.length + 12, photos.length));
                      return nextBatch;
                    }
                    return prev;
                  });
                }
              }
            }
          });
        },
        { rootMargin: '200px' }
      );

      // Observe photos beyond the first batch
      photos.slice(12).forEach((photo) => {
        const element = photoRefs.current.get(photo.id);
        if (element) {
          observerRef.current?.observe(element);
        }
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [photos]);

  const handleDownload = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    setDownloadingId(photo.id);
    try {
      await downloadPhoto(photo);
    } finally {
      setDownloadingId(null);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos in this album</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {visiblePhotos.map((photo, index) => (
        <div
          key={photo.id}
          ref={(el) => {
            if (el) photoRefs.current.set(photo.id, el);
          }}
          data-photo-id={photo.id}
          className="relative group aspect-square cursor-pointer"
          onClick={() => onPhotoClick?.(photo, index)}
        >
          <img
            src={photo.public_url || ''}
            alt={`Photo ${index + 1}`}
            className="w-full h-full object-cover rounded-lg"
            loading={index < 12 ? 'eager' : 'lazy'}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />

          {/* Action buttons - top right corner */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Download button */}
            {showDownload && (
              <button
                type="button"
                onClick={(e) => handleDownload(e, photo)}
                disabled={downloadingId === photo.id}
                className="p-1.5 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:text-blue-600 transition-all shadow-sm"
                aria-label="Download photo"
                title="Download photo"
              >
                {downloadingId === photo.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Favorite button */}
            {showFavorites && userId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle?.(photo);
                }}
                className={`p-1.5 rounded-full transition-all shadow-sm ${
                  photo.is_favorited
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-white hover:text-red-500'
                }`}
                aria-label={photo.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
                title={photo.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-4 h-4 ${photo.is_favorited ? 'fill-current' : ''}`}
                />
              </button>
            )}

            {/* Delete button */}
            {showDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(photo);
                }}
                className="p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white transition-all shadow-sm"
                aria-label="Delete photo"
                title="Delete photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Favorite indicator (always visible when favorited) */}
          {showFavorites && photo.is_favorited && (
            <div className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 shadow-sm group-hover:opacity-0 transition-opacity">
              <Heart className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
