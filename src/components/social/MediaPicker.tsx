import React from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { pickImages } from '../../services/social/media.service';
import { useLanguage } from '../../contexts/LanguageContext';

const VIDEO_DURATION_LIMIT_SEC = 60;

export interface MediaAsset {
  uri:      string;
  type:     'image' | 'video';
  duration?: number; // seconds, for videos
}

interface Props {
  media:      MediaAsset[];
  onAdd:      (assets: MediaAsset[]) => void;
  onRemove:   (index: number) => void;
  maxImages?: number;
}

export default function MediaPicker({ media, onAdd, onRemove, maxImages = 4 }: Props) {
  const { t } = useLanguage();
  const canAddMore = media.length < maxImages;

  const handlePickImages = async () => {
    try {
      const remaining = maxImages - media.length;
      if (remaining <= 0) return;
      const picked = await pickImages(remaining);
      const assets: MediaAsset[] = picked.map((p) => ({ uri: p.uri, type: 'image' }));
      if (assets.length > 0) onAdd(assets);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  if (media.length === 0 && !canAddMore) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {/* Thumbnail previews */}
        {media.map((asset, i) => (
          <View key={`${asset.uri}-${i}`} style={styles.thumb}>
            <Image source={{ uri: asset.uri }} style={styles.thumbImg} resizeMode="cover" />
            {asset.type === 'video' && (
              <View style={styles.videoBadge}>
                <MaterialIcons name="play-circle-filled" size={20} color="#fff" />
              </View>
            )}
            <Pressable style={styles.removeBtn} onPress={() => onRemove(i)} hitSlop={8}>
              <MaterialIcons name="close" size={14} color="#fff" />
            </Pressable>
          </View>
        ))}

        {/* Add button */}
        {canAddMore && (
          <Pressable style={styles.addBtn} onPress={handlePickImages}>
            <MaterialIcons name="add-photo-alternate" size={28} color="#0B5FFF" />
            <Text style={styles.addLabel}>{t('community.composer.addMedia') as string}</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 8,
    gap:            10,
  },
  thumb: {
    width:        80,
    height:       80,
    borderRadius: 10,
    overflow:     'hidden',
    position:     'relative',
  },
  thumbImg: {
    width:  '100%',
    height: '100%',
  },
  videoBadge: {
    position:        'absolute',
    bottom:          4,
    left:            4,
  },
  removeBtn: {
    position:        'absolute',
    top:             4,
    right:           4,
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  addBtn: {
    width:           80,
    height:          80,
    borderRadius:    10,
    borderWidth:     1.5,
    borderColor:     '#CBD5E1',
    borderStyle:     'dashed',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             4,
    backgroundColor: '#F8FAFF',
  },
  addLabel: {
    fontSize:   10,
    color:      '#0B5FFF',
    fontWeight: '600',
    textAlign:  'center',
  },
});
