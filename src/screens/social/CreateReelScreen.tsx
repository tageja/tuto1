import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ensureSocialProfile } from '../../services/social/auth.service';
import { createReel } from '../../services/social/reels.service';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'CreateReel'>;

type AudienceOption = 'public' | 'school' | 'followers';

const AUDIENCE_OPTIONS: { value: AudienceOption; labelKey: string }[] = [
  { value: 'public', labelKey: 'community.audience.public' },
  { value: 'school', labelKey: 'community.audience.schoolOnly' },
  { value: 'followers', labelKey: 'community.audience.followers' },
];

const SUBJECT_TAGS = [
  'Toán',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'Lịch sử',
  'Địa lý',
  'Văn học',
  'Tin học',
  'Mỹ thuật',
];

export default function CreateReelScreen() {
  const { t } = useLanguage();
  const navigation = useNavigation<NavProp>();

  const [step, setStep] = useState<1 | 2>(1);
  const [videoAsset, setVideoAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [audience, setAudience] = useState<AudienceOption>('public');
  const [posting, setPosting] = useState(false);

  const pickVideo = useCallback(async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('common.warning') as string,
        'Please allow media access to pick a video.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos' as const,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets[0]) {
      setVideoAsset(result.assets[0]);
    }
  }, [t]);

  const toggleSubject = useCallback((subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!videoAsset?.uri) return;
    setPosting(true);
    try {
      const profile = await ensureSocialProfile();
      if (!profile) {
        Alert.alert(t('common.error') as string, 'Please sign in to create a reel.');
        setPosting(false);
        return;
      }
      const durationSeconds = videoAsset.duration
        ? Math.round(videoAsset.duration / 1000)
        : 0;
      await createReel(profile.id, profile.schoolId ?? null, {
        videoUri: videoAsset.uri,
        description: description.trim() || undefined,
        subjects,
        audience,
        durationSeconds,
      });
      Alert.alert(
        t('common.success') as string,
        'Đang chờ kiểm duyệt',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      Alert.alert(
        t('common.error') as string,
        (err as Error).message || 'Could not upload reel. Please try again.',
      );
      setPosting(false);
    }
  }, [videoAsset, description, subjects, audience, t, navigation]);

  const canNext = !!videoAsset;
  const canSubmit = !posting;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialIcons name="close" size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo Reel</Text>
        <View style={styles.headerRight} />
      </View>

      {step === 1 ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.stepContent}>
          <Pressable style={styles.chooseBtn} onPress={pickVideo}>
            <MaterialIcons name="videocam" size={48} color="#0B5FFF" />
            <Text style={styles.chooseText}>Chọn video</Text>
          </Pressable>
          {videoAsset && (
            <View style={styles.previewWrap}>
              <Video
                source={{ uri: videoAsset.uri }}
                style={styles.previewVideo}
                resizeMode={ResizeMode.COVER}
                isMuted
                shouldPlay={false}
                useNativeControls={false}
              />
              {videoAsset.duration ? (
                <Text style={styles.duration}>
                  {Math.round(videoAsset.duration / 1000)}s
                </Text>
              ) : null}
            </View>
          )}
          <Pressable
            style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
            onPress={() => setStep(2)}
            disabled={!canNext}
          >
            <Text style={styles.nextBtnText}>Tiếp theo →</Text>
          </Pressable>
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Mô tả (tùy chọn)</Text>
            <TextInput
              style={styles.descInput}
              placeholder="Thêm mô tả..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={150}
            />
            <Text style={styles.charCount}>{description.length}/150</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Chủ đề</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {SUBJECT_TAGS.map((tag) => (
                  <Pressable
                    key={tag}
                    style={[
                      styles.subjectChip,
                      subjects.includes(tag) && styles.subjectChipActive,
                    ]}
                    onPress={() => toggleSubject(tag)}
                  >
                    <Text
                      style={[
                        styles.subjectChipText,
                        subjects.includes(tag) && styles.subjectChipTextActive,
                      ]}
                    >
                      #{tag}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {(t('community.composer.audience') as string) ?? 'Đối tượng'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {AUDIENCE_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.audienceChip,
                      audience === opt.value && styles.audienceChipActive,
                    ]}
                    onPress={() => setAudience(opt.value)}
                  >
                    <Text
                      style={[
                        styles.audienceChipText,
                        audience === opt.value && styles.audienceChipTextActive,
                      ]}
                    >
                      {t(opt.labelKey as never) as string}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            {posting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Đăng Reel</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 24,
  },
  scroll: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
    alignItems: 'center',
  },
  chooseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 48,
    width: '100%',
    marginBottom: 24,
  },
  chooseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B5FFF',
    marginTop: 12,
  },
  previewWrap: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: 300,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 12,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nextBtn: {
    backgroundColor: '#0B5FFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descInput: {
    minHeight: 80,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  subjectChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
  },
  subjectChipActive: {
    backgroundColor: '#0B5FFF',
    borderColor: '#0B5FFF',
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0B5FFF',
  },
  subjectChipTextActive: {
    color: '#fff',
  },
  audienceChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  audienceChipActive: {
    backgroundColor: '#0B5FFF',
    borderColor: '#0B5FFF',
  },
  audienceChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  audienceChipTextActive: {
    color: '#fff',
  },
  submitBtn: {
    margin: 24,
    backgroundColor: '#0B5FFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
