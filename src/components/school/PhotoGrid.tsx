import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Photo } from '../../services/school/albums';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoPress: (photo: Photo, index: number) => void;
  onToggleFavorite?: (photo: Photo) => void;
  showFavorites?: boolean;
  columns?: number;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoPress,
  onToggleFavorite,
  showFavorites = false,
  columns = 2,
}) => {
  const { colors, spacing, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.xs,
    },
    photoWrapper: {
      width: `${100 / columns}%`,
      padding: spacing.xs,
    },
    photoContainer: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      backgroundColor: colors.background.tertiary,
      position: 'relative',
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    favoriteButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl * 2,
      marginTop: spacing.lg,
    },
    emptyText: {
      marginTop: spacing.md,
      fontSize: 16,
      color: colors.text.light,
    },
  });

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={48} color={colors.disabled} />
        <Text style={styles.emptyText}>No photos available</Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        <View key={photo.id} style={styles.photoWrapper}>
          <TouchableOpacity
            style={styles.photoContainer}
            activeOpacity={0.9}
            onPress={() => onPhotoPress(photo, index)}
          >
            {photo.public_url ? (
              <Image
                source={{ uri: photo.public_url }}
                style={styles.photo}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.photo, { backgroundColor: colors.background.tertiary }]}>
                <MaterialIcons name="image" size={32} color={colors.disabled} />
              </View>
            )}

            {/* Favorite Icon */}
            {showFavorites && onToggleFavorite && (
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(photo);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons
                  name={photo.is_favorited ? 'favorite' : 'favorite-border'}
                  size={20}
                  color={photo.is_favorited ? colors.error : '#FFFFFF'}
                />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};



