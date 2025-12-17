import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useTheme } from '../../contexts/ThemeContext';
import { Photo } from '../../services/school/albums';

interface PhotoViewerModalProps {
  visible: boolean;
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  onToggleFavorite?: (photo: Photo) => void;
  showFavorites?: boolean;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  visible,
  photos,
  initialIndex,
  onClose,
  onToggleFavorite,
  showFavorites = false,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [downloading, setDownloading] = useState(false);

  const currentPhoto = photos[currentIndex];

  // Convert photos to ImageViewing format
  const images = photos.map((photo) => ({
    uri: photo.public_url,
  }));

  const handleFavoritePress = () => {
    if (onToggleFavorite && currentPhoto) {
      onToggleFavorite(currentPhoto);
    }
  };

  const handleDownload = async () => {
    if (!currentPhoto) return;

    try {
      setDownloading(true);

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to save photos to your device.');
        return;
      }

      // Download the image
      const fileUri = `${FileSystem.documentDirectory}${Date.now()}.jpg`;
      const downloadResult = await FileSystem.downloadAsync(currentPhoto.public_url, fileUri);

      if (downloadResult.status !== 200) {
        throw new Error('Failed to download image');
      }

      // Save to media library
      await MediaLibrary.createAssetAsync(downloadResult.uri);

      Alert.alert('Success', 'Photo saved to gallery!');
    } catch (error) {
      console.error('Error downloading photo:', error);
      Alert.alert('Error', 'Failed to download photo. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  // Custom header with close button and counter
  const HeaderComponent = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.iconButton}>
        <MaterialIcons name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.counter}>
        {currentIndex + 1} / {photos.length}
      </Text>
      <View style={styles.placeholder} />
    </View>
  );

  // Custom footer with favorite and download buttons
  const FooterComponent = () => (
    <View style={styles.footer}>
      <View style={styles.actionsRow}>
        {showFavorites && onToggleFavorite && currentPhoto && (
          <TouchableOpacity
            onPress={handleFavoritePress}
            style={styles.iconButton}
          >
            <MaterialIcons
              name={currentPhoto.is_favorited ? 'favorite' : 'favorite-border'}
              size={28}
              color={currentPhoto.is_favorited ? colors.error : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
        <View style={styles.spacer} />
        <TouchableOpacity
          onPress={handleDownload}
          style={styles.iconButton}
          disabled={downloading}
        >
          <MaterialIcons
            name={downloading ? 'hourglass-empty' : 'download'}
            size={28}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  counter: {
    color: colors.background.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    width: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 20,
  },
});


  return (
    <ImageViewing
      images={images}
      imageIndex={initialIndex}
      visible={visible}
      onRequestClose={onClose}
      onImageIndexChange={setCurrentIndex}
      HeaderComponent={HeaderComponent}
      FooterComponent={FooterComponent}
      backgroundColor="#000000"
      swipeToCloseEnabled={true}
      doubleTapToZoomEnabled={true}
      presentationStyle="overFullScreen"
    />
  );
};
