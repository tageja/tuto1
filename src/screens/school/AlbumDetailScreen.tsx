import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { PhotoViewerModal } from '../../components/school/PhotoViewerModal';
import { fetchAlbum, togglePhotoFavorite, getCurrentUserId, type Album, type Photo } from '../../services/school/albums';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

const AlbumDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userType } = useUser();

  const styles = StyleSheet.create({
    topBar: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingHorizontal: 16, 
      paddingVertical: 12,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1, 
      borderBottomColor: colors.border.light 
    },
    iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '700', color: colors.text.primary, flex: 1, textAlign: 'center' },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text.secondary,
    },
    row: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: 10, 
      paddingHorizontal: 12, 
      backgroundColor: colors.surface, 
      borderRadius: 12, 
      marginBottom: 8, 
      borderWidth: 1, 
      borderColor: colors.border.light 
    },
    rowText: { marginLeft: 8, color: colors.text.primary, fontSize: 15 },
    card: { 
      backgroundColor: colors.surface, 
      borderRadius: 12, 
      padding: 12, 
      marginTop: 8,
      marginBottom: 16,
      borderWidth: 1, 
      borderColor: colors.border.light 
    },
    paragraph: { color: colors.text.secondary, lineHeight: 20, fontSize: 15 },
    photosHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 12,
    },
    photosHeaderText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    grid: { 
      flexDirection: 'row', 
      flexWrap: 'wrap',
      marginHorizontal: -4, // Negative margin to offset wrapper padding
    },
    photoWrapper: {
      width: '50%', // Each photo takes 50% of width
      padding: 4, // Spacing between photos
    },
    photo: { 
      width: '100%', // Fill wrapper
      aspectRatio: 1, 
      borderRadius: 12, 
      backgroundColor: colors.background.tertiary,
    },
    favoriteIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyPhotos: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 48,
      marginTop: 24,
    },
    emptyPhotosText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text.light,
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [albumData, setAlbumData] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  // Get album ID from params
  const albumId = route.params?.albumId;
  const albumFromParams = route.params?.album;
  
  const isParent = userType === 'parent';

  // Get user ID
  useEffect(() => {
    const loadUserId = async () => {
      const id = await getCurrentUserId();
      setUserId(id);
    };
    loadUserId();
  }, []);

  useEffect(() => {
    if (albumId && userId) {
      loadAlbumData();
    } else if (albumFromParams) {
      // Fallback: use album from params (for backward compatibility)
      setAlbumData(albumFromParams);
      setPhotos(albumFromParams.photos || []);
      setLoading(false);
    }
  }, [albumId, userId]);

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      console.log('[AlbumDetailScreen] Loading album:', albumId, 'userId:', userId);
      const data = await fetchAlbum(albumId, userId || undefined);
      console.log('[AlbumDetailScreen] Album data received:', data.title);
      console.log('[AlbumDetailScreen] Photos count:', data.photos?.length || 0);
      console.log('[AlbumDetailScreen] Sample photo:', data.photos?.[0]);
      setAlbumData(data);
      setPhotos(data.photos || []);
      console.log('[AlbumDetailScreen] Photos state set, length:', data.photos?.length || 0);
    } catch (error) {
      console.error('[AlbumDetailScreen] Error loading album:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhotoIndex(index);
    setViewerVisible(true);
  };

  const handleToggleFavorite = async (photo: Photo) => {
    if (!userId) return;

    try {
      const isFavorited = await togglePhotoFavorite(photo.id, userId);
      
      // Update local state
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) =>
          p.id === photo.id ? { ...p, is_favorited: isFavorited } : p
        )
      );
    } catch (error: any) {
      console.error('[AlbumDetailScreen] Error toggling favorite:', error);
      Alert.alert('Error', error.message || 'Failed to update favorite');
    }
  };

  if (loading) {

    // Styles with dynamic theme

    return (
      <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
        <SchoolHeader />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Loading...</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading album...</Text>
        </View>
      </View>
    );
  }

  if (!albumData) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
        <SchoolHeader />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Album Not Found</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.disabled} />
          <Text style={styles.loadingText}>Album not found</Text>
        </View>
      </View>
    );
  }

  const eventDate = albumData.event_date 
    ? format(new Date(albumData.event_date), 'MMMM d, yyyy')
    : null;

  const DetailRow = ({ icon, label }: { icon: any; label: string }) => (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={20} color={colors.text.secondary} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <SchoolHeader />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{albumData.title}</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Album Info */}
        {albumData.category && (
          <DetailRow icon="category" label={albumData.category.charAt(0).toUpperCase() + albumData.category.slice(1)} />
        )}
        {eventDate && <DetailRow icon="event" label={eventDate} />}
        {albumData.class_name && <DetailRow icon="school" label={albumData.class_name} />}
        {albumData.description && (
          <View style={styles.card}>
            <Text style={styles.paragraph}>{albumData.description}</Text>
          </View>
        )}
        
        {/* Photos Grid */}
        {photos.length > 0 ? (
          <>
            <View style={styles.photosHeader}>
              <MaterialIcons name="photo-library" size={20} color={colors.text.primary} />
              <Text style={styles.photosHeaderText}>
                {photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}
              </Text>
            </View>
            <View style={styles.grid}>
              {photos.map((photo, index) => {
                console.log(`[AlbumDetailScreen] Rendering photo ${index}:`, photo.id, photo.public_url);
                return (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handlePhotoClick(photo, index)}
                    >
                      <Image 
                        source={{ uri: photo.public_url }} 
                        style={styles.photo}
                        resizeMode="cover"
                        onError={(error) => console.error(`[AlbumDetailScreen] Image load error ${index}:`, error.nativeEvent)}
                        onLoad={() => console.log(`[AlbumDetailScreen] Image loaded ${index}`)}
                      />
                      
                      {/* Favorite Icon (Parents only) */}
                      {isParent && (
                        <TouchableOpacity
                          style={styles.favoriteIcon}
                          onPress={() => handleToggleFavorite(photo)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <MaterialIcons
                            name={photo.is_favorited ? 'favorite' : 'favorite-border'}
                            size={24}
                            color={photo.is_favorited ? colors.error : '#FFFFFF'}
                          />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
            <View style={styles.emptyPhotos}>
              <MaterialIcons name="photo-library" size={48} color={colors.disabled} />
              <Text style={styles.emptyPhotosText}>No photos in this album</Text>
            </View>
          )}
      </ScrollView>

      {/* Photo Viewer Modal */}
      <PhotoViewerModal
        visible={viewerVisible}
        photos={photos}
        initialIndex={selectedPhotoIndex}
        onClose={() => setViewerVisible(false)}
        onToggleFavorite={isParent ? handleToggleFavorite : undefined}
        showFavorites={isParent}
      />
    </View>
  );
};

export default AlbumDetailScreen;





































