'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Download, CheckCircle2, X, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { toggleFavorite, type FavoritePhoto } from '../../lib/api/albums';
import JSZip from 'jszip';

interface FavoritesPhotoGridProps {
  photos: FavoritePhoto[];
  schoolId: string;
  userId: string;
  onPhotoUnfavorited: (photoId: string) => void;
}

// Helper function to download a single photo
async function downloadSinglePhoto(photo: FavoritePhoto): Promise<boolean> {
  if (!photo.public_url) return false;
  
  try {
    const response = await fetch(photo.public_url);
    if (!response.ok) throw new Error('Failed to fetch');
    const blob = await response.blob();
    
    const fileName = photo.storage_path.split('/').pop() || `photo-${photo.id}.jpg`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Download failed, trying direct link:', error);
    window.open(photo.public_url, '_blank');
    return false;
  }
}

// Helper to download a photo and return blob
async function fetchPhotoBlob(url: string): Promise<{ blob: Blob; success: boolean }> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    return { blob, success: true };
  } catch (error) {
    console.error('Failed to fetch photo blob:', url, error);
    return { blob: new Blob(), success: false };
  }
}

export function FavoritesPhotoGrid({
  photos,
  schoolId,
  userId,
  onPhotoUnfavorited,
}: FavoritesPhotoGridProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const toggleSelection = useCallback((photoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(photos.map((p) => p.id)));
  }, [photos]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelecting(false);
  }, []);

  const handleUnfavorite = async (photoId: string) => {
    setRemovingId(photoId);
    try {
      await toggleFavorite(photoId, userId);
      onPhotoUnfavorited(photoId);
    } catch (error) {
      console.error('Failed to unfavorite photo:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const handleSingleDownload = async (e: React.MouseEvent, photo: FavoritePhoto) => {
    e.stopPropagation();
    setDownloadingId(photo.id);
    try {
      await downloadSinglePhoto(photo);
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePhotoClick = (photo: FavoritePhoto) => {
    if (isSelecting) {
      toggleSelection(photo.id);
    } else {
      // Navigate to album with photo selected
      router.push(
        `/school/${encodeURIComponent(schoolId)}/parent/photo-albums/${photo.album_id}?photo=${photo.id}`
      );
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) return;

    const selectedPhotos = photos.filter((p) => selectedIds.has(p.id));
    
    // If only 1 photo, download directly without zip
    if (selectedPhotos.length === 1) {
      setDownloading(true);
      try {
        await downloadSinglePhoto(selectedPhotos[0]);
        clearSelection();
      } finally {
        setDownloading(false);
      }
      return;
    }

    // Multiple photos - create zip
    setDownloading(true);
    try {
      const zip = new JSZip();
      let successCount = 0;
      let failedPhotos: string[] = [];

      // Download each photo sequentially to avoid overwhelming the browser
      for (let i = 0; i < selectedPhotos.length; i++) {
        const photo = selectedPhotos[i];
        if (!photo.public_url) {
          failedPhotos.push(photo.id);
          continue;
        }

        const { blob, success } = await fetchPhotoBlob(photo.public_url);
        
        if (success && blob.size > 0) {
          const fileName = photo.storage_path.split('/').pop() || `photo-${i + 1}.jpg`;
          zip.file(fileName, blob);
          successCount++;
        } else {
          failedPhotos.push(photo.id);
        }
      }

      if (successCount === 0) {
        alert('Failed to download any photos. Please try downloading them individually.');
        return;
      }

      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `favorites-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      // Show warning if some photos failed
      if (failedPhotos.length > 0) {
        alert(`Downloaded ${successCount} of ${selectedPhotos.length} photos. ${failedPhotos.length} photo(s) could not be included.`);
      }

      clearSelection();
    } catch (error) {
      console.error('Failed to download photos:', error);
      alert('Failed to create download. Please try downloading photos individually.');
    } finally {
      setDownloading(false);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No favorited photos yet</p>
        <p className="text-gray-400 text-sm mt-2">
          Browse albums and tap the heart icon on photos you love
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {!isSelecting ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSelecting(true)}
            >
              Select Photos
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                Select All ({photos.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>

        {selectedIds.size > 0 && (
          <Button
            onClick={handleDownloadSelected}
            disabled={downloading}
            size="sm"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {selectedIds.size === 1 ? 'Downloading...' : 'Creating zip...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download {selectedIds.size === 1 ? 'Photo' : `Selected (${selectedIds.size})`}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`relative aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all ${
              selectedIds.has(photo.id)
                ? 'ring-2 ring-blue-500 ring-offset-2'
                : 'hover:ring-2 hover:ring-gray-300'
            }`}
            onClick={() => handlePhotoClick(photo)}
          >
            {photo.public_url ? (
              <Image
                src={photo.public_url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}

            {/* Selection Checkbox */}
            {isSelecting && (
              <div
                className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  selectedIds.has(photo.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/80 text-gray-400 border border-gray-300'
                }`}
              >
                {selectedIds.has(photo.id) && <CheckCircle2 className="w-5 h-5" />}
              </div>
            )}

            {/* Action buttons on hover (when not selecting) */}
            {!isSelecting && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Download button */}
                <button
                  className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm"
                  onClick={(e) => handleSingleDownload(e, photo)}
                  disabled={downloadingId === photo.id}
                  title="Download photo"
                >
                  {downloadingId === photo.id ? (
                    <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 text-gray-600" />
                  )}
                </button>

                {/* Unfavorite button */}
                <button
                  className="p-1.5 bg-white/90 rounded-full hover:bg-red-50 transition-colors shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfavorite(photo.id);
                  }}
                  disabled={removingId === photo.id}
                  title="Remove from favorites"
                >
                  {removingId === photo.id ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  )}
                </button>
              </div>
            )}

            {/* Album Label */}
            {photo.album_title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.album_title}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
