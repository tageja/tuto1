'use client';

import { Card } from '../ui/Card';
import { StatusBadge } from '../school/shared/StatusBadge';
import { InlineCarousel } from '../ui/InlineCarousel';
import type { Album } from '../../lib/api/albums';
import { format } from 'date-fns';
import { Heart } from 'lucide-react';

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
  showFavoriteCount?: boolean;
}

export function AlbumCard({ album, onClick, showFavoriteCount = false }: AlbumCardProps) {
  const coverImages = (album.cover_photos || []).map((photo) => ({
    url: photo.public_url || '',
    alt: album.title,
  }));

  const eventDate = album.event_date
    ? format(new Date(album.event_date), 'MMM d, yyyy')
    : null;

  const fallbackImage = (
    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
      <span className="text-4xl">📷</span>
    </div>
  );

  return (
    <Card
      className="overflow-hidden cursor-pointer"
      hover
      padding="none"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden">
        {coverImages.length > 0 ? (
          <InlineCarousel images={coverImages} className="w-full h-full" />
        ) : (
          fallbackImage
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{album.title}</h3>
          {showFavoriteCount && album.favorite_count !== undefined && album.favorite_count > 0 && (
            <div className="flex items-center gap-1 text-red-500 ml-2">
              <Heart className="w-4 h-4 fill-current" />
              <span className="text-xs font-medium">{album.favorite_count}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {eventDate && <span>{eventDate}</span>}
            {eventDate && album.photos_count !== undefined && <span> • </span>}
            {album.photos_count !== undefined && (
              <span>{album.photos_count} {album.photos_count === 1 ? 'photo' : 'photos'}</span>
            )}
          </div>
          <StatusBadge status={album.status} variant="success" />
        </div>
      </div>
    </Card>
  );
}


