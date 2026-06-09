import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../../contexts/LanguageContext';
import { createStory } from '../../services/social/stories.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'CreateStory'>;

const AUDIENCE_OPTIONS = [
  { value: 'public' as const, labelKey: 'community.audience.public' },
  { value: 'school' as const, labelKey: 'community.audience.schoolOnly' },
  { value: 'followers' as const, labelKey: 'community.audience.followers' },
];

export default function CreateStoryScreen() {
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();

  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [textOverlay, setTextOverlay] = useState('');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [audience, setAudience] = useState<'public' | 'school' | 'followers'>('school');
  const [uploading, setUploading] = useState(false);

  const handlePickMedia = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.9,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset) return;

    const type = asset.type === 'video' ? 'video' : 'photo';
    setMediaType(type);
    setMediaUri(asset.uri);
  }, []);

  const handleShare = useCallback(async () => {
    if (!mediaUri) return;

    setUploading(true);
    try {
      await createStory({
        mediaUri,
        mediaType,
        textOverlay: textOverlay.trim() || undefined,
        textColor,
        audience,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Lỗi', (err as Error).message ?? 'Không thể đăng story.');
    } finally {
      setUploading(false);
    }
  }, [mediaUri, mediaType, textOverlay, textColor, audience, navigation]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeBtn}>
          <MaterialIcons name="close" size={28} color="#333" />
        </Pressable>
        <Text style={styles.title}>{t('community.stories.addStory') as string}</Text>
        <Pressable
          onPress={handleShare}
          disabled={!mediaUri || uploading}
          style={[styles.shareBtn, (!mediaUri || uploading) && styles.shareBtnDisabled]}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.shareBtnText}>{t('common.done') as string}</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {mediaUri ? (
          <View style={styles.previewWrap}>
            {mediaType === 'video' ? (
              <Image source={{ uri: mediaUri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.preview} resizeMode="cover" />
            )}
            {textOverlay ? (
              <Text style={[styles.previewText, { color: textColor }]}>{textOverlay}</Text>
            ) : null}
          </View>
        ) : (
          <Pressable style={styles.pickArea} onPress={handlePickMedia}>
            <MaterialIcons name="add-photo-alternate" size={64} color="#9CA3AF" />
            <Text style={styles.pickLabel}>{t('community.composer.addMedia') as string}</Text>
          </Pressable>
        )}

        {mediaUri && (
          <>
            <Text style={styles.sectionLabel}>{t('community.stories.addText') as string}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('community.stories.addText') as string}
              placeholderTextColor="#9CA3AF"
              value={textOverlay}
              onChangeText={setTextOverlay}
              maxLength={100}
            />

            <Text style={styles.sectionLabel}>{t('community.stories.audience') as string}</Text>
            <View style={styles.audienceRow}>
              {AUDIENCE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.audienceChip, audience === opt.value && styles.audienceChipActive]}
                  onPress={() => setAudience(opt.value)}
                >
                  <Text
                    style={[
                      styles.audienceChipText,
                      audience === opt.value && styles.audienceChipTextActive,
                    ]}
                  >
                    {t(opt.labelKey) as string}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeBtn: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  shareBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0B5FFF',
    borderRadius: 8,
  },
  shareBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  shareBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
  },
  previewWrap: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 400,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  previewText: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  pickArea: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickLabel: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  audienceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  audienceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  audienceChipActive: {
    backgroundColor: '#0B5FFF',
  },
  audienceChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  audienceChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
