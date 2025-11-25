'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { AlbumsFilters } from '../../../../../components/photos/AlbumsFilters';
import { AlbumCard } from '../../../../../components/photos/AlbumCard';
import { FavoritesPhotoGrid } from '../../../../../components/photos/FavoritesPhotoGrid';
import { getAlbums, getFavoritePhotos, type Album, type AlbumTab, type FavoritePhoto } from '../../../../../lib/api/albums';
import { supabase } from '../../../../../lib/supabase';

export default function ParentPhotoAlbumsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL state
  const tabParam = (searchParams.get('tab') as AlbumTab) || 'all';

  // Local state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [favoritePhotos, setFavoritePhotos] = useState<FavoritePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AlbumTab>(tabParam);
  const [userId, setUserId] = useState<string | null>(null);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'all') {
      params.set('tab', activeTab);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router]);

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

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        if (activeTab === 'favorites') {
          // Fetch individual favorited photos
          const photos = await getFavoritePhotos(userId, schoolId);
          setFavoritePhotos(photos);
          setAlbums([]);
        } else {
          // Fetch albums
          const data = await getAlbums(schoolId, activeTab, userId);
          setAlbums(data);
          setFavoritePhotos([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (schoolId && userId) {
      fetchData();
    }
  }, [schoolId, activeTab, userId]);

  const handleTabChange = (tab: AlbumTab) => {
    setActiveTab(tab);
  };

  const handleAlbumClick = (albumId: string) => {
    router.push(`/school/${encodeURIComponent(schoolId)}/parent/photo-albums/${albumId}`);
  };

  const handlePhotoUnfavorited = (photoId: string) => {
    setFavoritePhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Photo Albums</h1>
        <p className="text-gray-600">School events and activities</p>
      </div>

      <div className="mb-6">
        <AlbumsFilters mode="parent" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
              {activeTab !== 'favorites' && (
                <>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Favorites Tab - Show individual photos */}
      {!loading && !error && activeTab === 'favorites' && userId && (
        <FavoritesPhotoGrid
          photos={favoritePhotos}
          schoolId={schoolId}
          userId={userId}
          onPhotoUnfavorited={handlePhotoUnfavorited}
        />
      )}

      {/* Other Tabs - Show album cards */}
      {!loading && !error && activeTab !== 'favorites' && (
        <>
          {albums.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No albums found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {albums.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onClick={() => handleAlbumClick(album.id)}
                  showFavoriteCount
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
