'use client';

import { Tabs, TabsList, TabsTrigger } from '../ui/Tabs';
import type { AlbumTab } from '../../lib/api/albums';
import { useI18n } from '../../contexts/I18nContext';

interface AlbumsFiltersProps {
  mode: 'admin' | 'parent';
  activeTab: AlbumTab;
  onTabChange: (tab: AlbumTab) => void;
}

export function AlbumsFilters({ mode, activeTab, onTabChange }: AlbumsFiltersProps) {
  const { t } = useI18n();
  
  if (mode === 'admin') {
    return (
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AlbumTab)}>
        <TabsList>
          <TabsTrigger value="all">{t('dashboard.photos.filters.all') || 'All'}</TabsTrigger>
          <TabsTrigger value="recent">{t('dashboard.photos.filters.recent') || 'Recent'}</TabsTrigger>
          <TabsTrigger value="events">{t('dashboard.photos.filters.events') || 'Events'}</TabsTrigger>
          <TabsTrigger value="class">{t('dashboard.photos.filters.class') || 'Class Activities'}</TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AlbumTab)}>
      <TabsList>
        <TabsTrigger value="all">{t('dashboard.photos.filters.allAlbums') || 'All Albums'}</TabsTrigger>
        <TabsTrigger value="recent">{t('dashboard.photos.filters.recent') || 'Recent'}</TabsTrigger>
        <TabsTrigger value="class">{t('dashboard.photos.filters.classEvents') || 'Class Events'}</TabsTrigger>
        <TabsTrigger value="favorites">{t('dashboard.photos.filters.favorites') || 'Favorites'}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

