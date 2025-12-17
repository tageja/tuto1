import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Album } from '../../services/school/albums';

interface AlbumCardProps {
  album: Album;
  onPress?: () => void;
  onFavoritePress?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
}

const getGradientColors = (index: number): string[] => {
  const gradients = [
    ['#E3F2FD', '#BBDEFB'], // Light blue
    ['#F3E5F5', '#E1BEE7'], // Light purple
    ['#FFF3E0', '#FFE0B2'], // Light orange
    ['#E8F5E9', '#C8E6C9'], // Light green
  ];
  return gradients[index % gradients.length];
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onPress,
  onFavoritePress,
  showFavorite = false,
  isFavorite = false,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();
  const coverPhoto = album.cover_photos?.[0];
  const gradientColors = getGradientColors(album.id.charCodeAt(0) % 4);


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoContainer: {
    padding: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    minHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.background.primary,
  },
  classBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  classText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
});


  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Image/Gradient Background */}
      <View style={styles.imageContainer}>
        {coverPhoto?.public_url ? (
          <Image
            source={{ uri: coverPhoto.public_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.gradient, { backgroundColor: gradientColors[0] }]}>
            <MaterialIcons name="photo-album" size={48} color={gradientColors[1]} />
          </View>
        )}

        {/* Favorite Icon */}
        {showFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress?.();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={isFavorite ? '#E91E63' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Info Overlay */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {album.title}
        </Text>
        <View style={styles.metaRow}>
          {album.event_date && (
            <>
              <Text style={styles.metaText}>{formatDate(album.event_date)}</Text>
              {album.photos_count !== undefined && <Text style={styles.metaText}> • </Text>}
            </>
          )}
          {album.photos_count !== undefined && (
            <Text style={styles.metaText}>
              {album.photos_count} {album.photos_count === 1 ? 'photo' : 'photos'}
            </Text>
          )}
        </View>
        <View style={styles.footerRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{t('school.photoAlbums.active')}</Text>
          </View>
          {album.class_name && (
            <View style={styles.classBadge}>
              <Text style={styles.classText}>{album.class_name}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

