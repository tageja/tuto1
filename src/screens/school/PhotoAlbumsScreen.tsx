import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useAirtable } from '../../hooks/useAirtable';
import { translations } from '../../translations';
import { theme } from '../../theme';
import SchoolHeader from '../../components/common/SchoolHeader';

interface PhotoAlbum {
  id: string;
  fields: {
    'Album Title': string;
    'School Name': string;
    'Event Type': string;
    'Date': string;
    'Description': string;
    'Class Name': string;
    'Privacy': string;
    'Status': string;
    'Created Date': string;
  };
}

const PhotoAlbumsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentSchool, isSchoolMode } = useSchool();
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'recent' | 'class' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { fetchRecords, createRecord, updateRecord } = useAirtable();

  const t = translations.en.school;

  useEffect(() => {
    if (!isSchoolMode || !currentSchool) {
      navigation.goBack();
      return;
    }
    loadAlbums();
  }, [isSchoolMode, currentSchool]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const records = await fetchRecords('TutoPhotoAlbums', {
        filterByFormula: `{School Name} = '${currentSchool?.name}'`,
        sort: [{ field: 'Date', direction: 'desc' }],
      });
      setAlbums(records);
    } catch (error) {
      console.error('Error loading albums:', error);
      Alert.alert('Error', 'Failed to load photo albums');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlbums();
    setRefreshing(false);
  };

  const getFilteredAlbums = () => {
    let filtered = albums;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(album =>
        album.fields['Album Title'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.fields['Description'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.fields['Event Type'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.fields['Class Name'].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'recent':
        filtered = filtered.filter(album => {
          const albumDate = new Date(album.fields['Date']);
          return albumDate >= thirtyDaysAgo;
        });
        break;
      case 'class':
        filtered = filtered.filter(album => album.fields['Class Name'] && album.fields['Class Name'].trim() !== '');
        break;
      case 'events':
        filtered = filtered.filter(album => 
          album.fields['Event Type'] && 
          ['Field Trip', 'Sports Day', 'Cultural Event', 'Graduation', 'Other'].includes(album.fields['Event Type'])
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#4CAF50';
      case 'Archived':
        return '#9E9E9E';
      default:
        return theme.colors.disabled;
    }
  };

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case 'Public':
        return 'public';
      case 'Private':
        return 'lock';
      case 'Class Only':
        return 'group';
      default:
        return 'public';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'Field Trip':
        return 'directions-bus';
      case 'Sports Day':
        return 'sports-soccer';
      case 'Cultural Event':
        return 'celebration';
      case 'Graduation':
        return 'school';
      case 'Class Activity':
        return 'class';
      default:
        return 'photo-album';
    }
  };

  const renderAlbumCard = (album: PhotoAlbum) => (
    <TouchableOpacity
      key={album.id}
      style={styles.albumCard}
      onPress={() => (navigation as any).navigate('SchoolAlbumDetail', { album })}
    >
      <View style={styles.albumImageContainer}>
        <View style={styles.albumImagePlaceholder}>
          <MaterialIcons 
            name={getEventTypeIcon(album.fields['Event Type']) as any} 
            size={48} 
            color={theme.colors.disabled} 
          />
        </View>
        <View style={styles.albumOverlay}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(album.fields['Status']) }]}>
            <Text style={styles.statusText}>{album.fields['Status']}</Text>
          </View>
          <View style={styles.privacyBadge}>
            <MaterialIcons 
              name={getPrivacyIcon(album.fields['Privacy']) as any} 
              size={16} 
              color="white" 
            />
          </View>
        </View>
      </View>

      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={2}>
          {album.fields['Album Title']}
        </Text>

        <View style={styles.albumDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="event" size={16} color={theme.colors.disabled} />
            <Text style={styles.detailText}>
              {formatDate(album.fields['Date'])}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="category" size={16} color={theme.colors.disabled} />
            <Text style={styles.detailText}>{album.fields['Event Type']}</Text>
          </View>

          {album.fields['Class Name'] && (
            <View style={styles.detailRow}>
              <MaterialIcons name="class" size={16} color={theme.colors.disabled} />
              <Text style={styles.detailText}>{album.fields['Class Name']}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <MaterialIcons name="security" size={16} color={theme.colors.disabled} />
            <Text style={styles.detailText}>{album.fields['Privacy']}</Text>
          </View>
        </View>

        {album.fields['Description'] && (
          <Text style={styles.albumDescription} numberOfLines={2}>
            {album.fields['Description']}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('all')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'all' && styles.filterButtonTextActive,
        ]}>
          {t.photoAlbums.all}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'recent' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('recent')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'recent' && styles.filterButtonTextActive,
        ]}>
          {t.photoAlbums.recent}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'class' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('class')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'class' && styles.filterButtonTextActive,
        ]}>
          {t.photoAlbums.class}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'events' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('events')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'events' && styles.filterButtonTextActive,
        ]}>
          {t.photoAlbums.events}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!isSchoolMode || !currentSchool) {
    return null;
  }

  const filteredAlbums = getFilteredAlbums();

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.photoAlbums.title}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('SchoolAlbumDetail' as never)}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={theme.colors.disabled} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.photoAlbums.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.disabled}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color={theme.colors.disabled} />
          </TouchableOpacity>
        )}
      </View>

      {renderFilterButtons()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t.common.loading}</Text>
          </View>
        ) : filteredAlbums.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="photo-album" size={64} color={theme.colors.disabled} />
            <Text style={styles.emptyTitle}>{t.photoAlbums.noAlbums}</Text>
            <Text style={styles.emptySubtitle}>{t.photoAlbums.noAlbumsSubtitle}</Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={() => (navigation as any).navigate('SchoolAddAlbum')}
            >
              <Text style={styles.addFirstButtonText}>{t.photoAlbums.addFirst}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.albumsGrid}>
            {filteredAlbums.map(renderAlbumCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.disabled,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.disabled,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.disabled,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  addFirstButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  albumsGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  albumCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  albumImageContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  albumImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  privacyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumInfo: {
    padding: 12,
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 8,
    lineHeight: 18,
  },
  albumDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.disabled,
    marginLeft: 4,
    flex: 1,
  },
  albumDescription: {
    fontSize: 12,
    color: theme.colors.disabled,
    lineHeight: 16,
  },
});

export default PhotoAlbumsScreen;

