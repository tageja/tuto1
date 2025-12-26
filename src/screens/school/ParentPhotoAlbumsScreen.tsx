import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SchoolHeader from '../../components/common/SchoolHeader';
import { AlbumCard } from '../../components/school/AlbumCard';
import { AlbumFilters } from '../../components/school/AlbumFilters';
import { ChildSelectorBottomSheet } from '../../components/school/ChildSelectorBottomSheet';
import { PhotoGrid } from '../../components/school/PhotoGrid';
import { PhotoViewerModal } from '../../components/school/PhotoViewerModal';
import { useSchool } from '../../contexts/SchoolContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  fetchParentAlbums,
  fetchFavoritePhotos,
  toggleAlbumFavorite,
  togglePhotoFavorite,
  getCurrentUserId,
  type Album,
  type AlbumTab,
  type Photo,
} from '../../services/school/albums';
import { fetchParentChildren, type ParentChild } from '../../services/supabase-health';

export default function ParentPhotoAlbumsScreen() {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { userData } = useUser();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [favoritePhotos, setFavoritePhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AlbumTab>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childSelectorVisible, setChildSelectorVisible] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  // Photo Viewer State
  const [viewerVisible, setViewerVisible] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerCard: {
      backgroundColor: colors.background.primary,
      padding: spacing.md,
      margin: spacing.md,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    childInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    childInfoText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      flex: 1,
    },
    childSelectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      gap: spacing.xs,
    },
    childSelectorText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      marginHorizontal: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchIcon: {
      marginRight: spacing.xs,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
    },
    albumsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
      paddingHorizontal: spacing.md,
    },
    emptyIcon: {
      marginBottom: spacing.md,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    emptySubtext: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.light,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    photoGridContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
    },
  });

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load parent ID and children
  useEffect(() => {
    const loadData = async () => {
      if (!currentSchool || !userData) return;

      const id = await getCurrentUserId();
      setParentId(id);

      try {
        const schoolId = currentSchool.id || currentSchool.name;
        const childrenData = await fetchParentChildren(schoolId);
        setChildren(childrenData);

        // Auto-select first child if available
        if (childrenData.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenData[0].id);
        }
      } catch (error) {
        console.error('Error loading children:', error);
      }
    };
    loadData();
  }, [currentSchool, userData]);

  const loadData = useCallback(async () => {
    if (!currentSchool || !parentId || !selectedChildId) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      if (activeTab === 'favorites') {
        const photos = await fetchFavoritePhotos(schoolId, parentId);
        setFavoritePhotos(photos);
        setAlbums([]); // Clear albums when in favorites mode
      } else {
        const data = await fetchParentAlbums(
          schoolId,
          parentId,
          selectedChildId,
          activeTab,
          debouncedSearch
        );
        setAlbums(data);
        setFavoritePhotos([]); // Clear favorite photos when in album mode
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, parentId, selectedChildId, activeTab, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('SchoolAlbumDetail', { albumId: album.id });
  };

  const handleFavoritePress = async (album: Album) => {
    if (!parentId) return;

    try {
      await toggleAlbumFavorite(album.id, parentId);
      // Refresh data to update favorite status
      loadData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handlePhotoPress = (photo: Photo, index: number) => {
    setInitialPhotoIndex(index);
    setViewerVisible(true);
  };

  const handleTogglePhotoFavorite = async (photo: Photo) => {
    if (!parentId) return;

    try {
      // Optimistic update
      setFavoritePhotos((prev) =>
        prev.filter((p) => p.id !== photo.id)
      );

      const isFavorited = await togglePhotoFavorite(photo.id, parentId);
      
      // If adding back (shouldn't happen in favorites tab usually, but good to handle)
      if (isFavorited) {
        loadData(); // Reload to get correct order/data
      }
    } catch (error) {
      console.error('Error toggling photo favorite:', error);
      loadData(); // Revert on error
    }
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const renderAlbumCard = ({ item }: { item: Album }) => (
    <AlbumCard
      album={item}
      onPress={() => handleAlbumPress(item)}
      onFavoritePress={() => handleFavoritePress(item)}
      showFavorite={true}
      isFavorite={item.is_favorite || false}
    />
  );

  const renderContent = () => {
    if (loading && albums.length === 0 && favoritePhotos.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      );
    }

    if (activeTab === 'favorites') {
      if (favoritePhotos.length === 0) {
        return (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="favorite-border"
              size={64}
              color={colors.disabled}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              {t('school.photoAlbums.noFavorites')}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('school.photoAlbums.noFavoritesSubtitle')}
            </Text>
          </View>
        );
      }

      return (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.photoGridContainer}>
            <PhotoGrid
              photos={favoritePhotos}
              onPhotoPress={handlePhotoPress}
              onToggleFavorite={handleTogglePhotoFavorite}
              showFavorites={true}
            />
          </View>
        </ScrollView>
      );
    }

    if (albums.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="photo-album"
            size={64}
            color={colors.disabled}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyText}>
            {t('school.photoAlbums.noAlbums')}
          </Text>
          <Text style={styles.emptySubtext}>
            {t('school.photoAlbums.noAlbumsSubtitle')}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={albums}
        renderItem={renderAlbumCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.albumsGrid}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <SchoolHeader />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>
          {t('school.photoAlbums.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('school.photoAlbums.subtitleParent')}
        </Text>
        {selectedChild && (
          <View style={styles.childInfoRow}>
            <Text style={styles.childInfoText}>
              {t('school.photoAlbums.showingAlbumsFor')} {selectedChild.fullName}
              {selectedChild.className && ` - ${selectedChild.className}`}
            </Text>
            <TouchableOpacity
              style={styles.childSelectorButton}
              onPress={() => setChildSelectorVisible(true)}
            >
              <Text style={styles.childSelectorText}>
                {t('school.photoAlbums.selectChild')}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={20}
                color={colors.text.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={t('school.photoAlbums.searchPlaceholder')}
          placeholderTextColor={colors.text.light}
          value={searchInput}
          onChangeText={setSearchInput}
        />
      </View>

      {/* Filters */}
      <AlbumFilters
        mode="parent"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Child Selector Bottom Sheet */}
      <ChildSelectorBottomSheet
        children={children.map((c) => ({
          id: c.id,
          firstName: c.firstName,
          lastName: c.lastName,
          className: c.className,
        }))}
        selectedId={selectedChildId}
        visible={childSelectorVisible}
        onSelect={(childId) => {
          setSelectedChildId(childId);
          setChildSelectorVisible(false);
        }}
        onClose={() => setChildSelectorVisible(false)}
      />

      {/* Photo Viewer */}
      <PhotoViewerModal
        visible={viewerVisible}
        photos={favoritePhotos}
        initialIndex={initialPhotoIndex}
        onClose={() => setViewerVisible(false)}
        onToggleFavorite={handleTogglePhotoFavorite}
      />
    </SafeAreaView>
  );
}
