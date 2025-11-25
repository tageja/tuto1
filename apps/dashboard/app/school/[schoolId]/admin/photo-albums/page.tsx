'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { Button } from '../../../../../components/ui/Button';
import { AlbumsFilters } from '../../../../../components/photos/AlbumsFilters';
import { AlbumCard } from '../../../../../components/photos/AlbumCard';
import { CreateAlbumModal } from '../../../../../components/photos/CreateAlbumModal';
import { getAlbums, type Album, type AlbumTab } from '../../../../../lib/api/albums';
import { supabase } from '../../../../../lib/supabase';

export default function PhotoAlbumsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL state
  const tabParam = (searchParams.get('tab') as AlbumTab) || 'all';

  // Local state
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AlbumTab>(tabParam);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classes, setClasses] = useState<Array<{ id: string; name: string; grade_level?: string | null }>>([]);
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

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('school_classes')
          .select('id, name, grade_level')
          .eq('school_id', schoolId)
          .or('status.eq.active,status.eq.Active') // Handle both cases
          .order('name');

        if (error) throw error;
        console.log('Fetched classes for school', schoolId, ':', data);
        setClasses(data || []);
      } catch (err: any) {
        console.error('Failed to fetch classes:', err);
      }
    };
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);

  // Fetch albums
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAlbums(schoolId, activeTab, userId || undefined);
        setAlbums(data);
      } catch (err: any) {
        console.error('Failed to fetch albums:', err);
        setError(err.message || 'Failed to load albums');
      } finally {
        setLoading(false);
      }
    };

    if (schoolId) {
      fetchAlbums();
    }
  }, [schoolId, activeTab, userId]);

  const handleTabChange = (tab: AlbumTab) => {
    setActiveTab(tab);
  };

  const handleAlbumClick = (albumId: string) => {
    router.push(`/school/${encodeURIComponent(schoolId)}/admin/photo-albums/${albumId}`);
  };

  const handleCreateSuccess = () => {
    // Refetch albums
    const fetchAlbums = async () => {
      try {
        const data = await getAlbums(schoolId, activeTab, userId || undefined);
        setAlbums(data);
      } catch (err: any) {
        console.error('Failed to refetch albums:', err);
      }
    };
    fetchAlbums();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.photos.title') || 'Photo Albums'}</h1>
          <p className="text-gray-600">{t('dashboard.photos.subtitle') || 'School events and activities photo galleries'} • {schoolId}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          {t('dashboard.photos.create.createButton') || 'Create Album'}
        </Button>
      </div>

      <div className="mb-6">
        <AlbumsFilters mode="admin" activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && albums.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t('dashboard.photos.empty.noAlbums') || 'No albums found'}</p>
          <p className="text-gray-400 text-sm mt-2">{t('dashboard.photos.empty.createFirst') || 'Create your first album to get started'}</p>
        </div>
      )}

      {!loading && !error && albums.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => handleAlbumClick(album.id)}
            />
          ))}
        </div>
      )}

      <CreateAlbumModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        schoolId={schoolId}
        classes={classes}
      />
    </div>
  );
}
