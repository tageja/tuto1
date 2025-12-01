'use client';

import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';
import type { Photo } from '../../lib/api/albums';

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onFavoriteToggle?: (photo: Photo) => void;
  onDelete?: (photo: Photo) => void;
  showFavorites?: boolean;
  showDelete?: boolean;
}

export function PhotoLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onFavoriteToggle,
  onDelete,
  showFavorites = false,
  showDelete = false,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Previous button */}
      {photos.length > 1 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
          aria-label="Previous photo"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Next button */}
      {photos.length > 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full p-2 transition-colors z-10"
          aria-label="Next photo"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Photo */}
      <div className="relative max-w-7xl max-h-[90vh] mx-auto px-16">
        <img
          src={currentPhoto.public_url || ''}
          alt={`Photo ${currentIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain"
        />

        {/* Action buttons */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
          {showFavorites && onFavoriteToggle && (
            <button
              onClick={() => onFavoriteToggle(currentPhoto)}
              className={`p-3 rounded-full transition-all ${
                currentPhoto.is_favorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label={currentPhoto.is_favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-6 h-6 ${currentPhoto.is_favorited ? 'fill-current' : ''}`} />
            </button>
          )}

          {showDelete && onDelete && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this photo?')) {
                  onDelete(currentPhoto);
                  if (photos.length === 1) {
                    onClose();
                  } else {
                    handleNext();
                  }
                }
              }}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-red-500 transition-all"
              aria-label="Delete photo"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Photo counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 right-4 text-white text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}


