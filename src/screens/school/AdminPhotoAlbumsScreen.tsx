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
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { AlbumCard } from '../../components/school/AlbumCard';
import { AlbumFilters } from '../../components/school/AlbumFilters';
import { useSchool } from '../../contexts/SchoolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  fetchAdminAlbums,
  getCurrentUserId,
  type Album,
  type AlbumTab,
} from '../../services/school/albums';

export default function AdminPhotoAlbumsScreen() {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AlbumTab>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

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
      marginBottom: spacing.md,
    },
    headerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    createButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
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
  });

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load user ID
  useEffect(() => {
    const loadUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  const loadData = useCallback(async () => {
    if (!currentSchool) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      const data = await fetchAdminAlbums(schoolId, activeTab, debouncedSearch, userId || undefined);

      setAlbums(data);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, activeTab, debouncedSearch, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreateAlbum = () => {
    navigation.navigate('AdminCreateAlbum');
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('SchoolAlbumDetail', { albumId: album.id });
  };

  const renderAlbumCard = ({ item }: { item: Album }) => (
    <AlbumCard
      album={item}
      onPress={() => handleAlbumPress(item)}
      showFavorite={false}
    />
  );

  const renderContent = () => {
    if (loading && albums.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
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
      <DashboardHeader
        schoolName={currentSchool?.name || ''}
        onNotificationPress={() => {}}
      />

      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>
          {t('school.photoAlbums.title')}
        </Text>
        <Text style={styles.headerSubtitle}>
          {t('school.photoAlbums.subtitle')}
        </Text>
        <View style={styles.headerActions}>
          <View />
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateAlbum}
          >
            <MaterialIcons name="add" size={20} color={colors.white} />
            <Text style={styles.createButtonText}>
              {t('school.photoAlbums.createButton')}
            </Text>
          </TouchableOpacity>
        </View>
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
        mode="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Albums Grid */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
}


