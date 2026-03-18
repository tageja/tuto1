import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { createPost }    from '../../services/social/posts.service';
import { pickImages, uploadImages } from '../../services/social/media.service';
import { useLanguage }   from '../../contexts/LanguageContext';
import type { PostVisibility } from '../../types/social';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'CreatePost'>;

type VisibilityOption = {
  value: PostVisibility;
  labelKey: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

const VISIBILITY_OPTIONS: VisibilityOption[] = [
  { value: 'public',     labelKey: 'community.audience.public',     icon: 'public' },
  { value: 'schoolOnly', labelKey: 'community.audience.schoolOnly',  icon: 'school' },
  { value: 'classOnly',  labelKey: 'community.audience.classOnly',   icon: 'people' },
  { value: 'followers',  labelKey: 'community.audience.followers',   icon: 'person' },
];

const SUBJECT_TAGS = [
  'Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
  'Lịch sử', 'Địa lý', 'Văn học', 'Tin học', 'Mỹ thuật',
];

export default function CreatePostScreen() {
  const { t }     = useLanguage();
  const navigation = useNavigation<NavProp>();

  const [content,     setContent]     = useState('');
  const [visibility,  setVisibility]  = useState<PostVisibility>('schoolOnly');
  const [subjects,    setSubjects]    = useState<string[]>([]);
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [posting,     setPosting]     = useState(false);

  const handlePickImages = useCallback(async () => {
    try {
      const picked = await pickImages(4 - localImages.length);
      setLocalImages((prev) => [...prev, ...picked.map((p) => p.uri)].slice(0, 4));
    } catch (err) {
      Alert.alert('Error', 'Could not access photos.');
    }
  }, [localImages.length]);

  const removeImage = useCallback((uri: string) => {
    setLocalImages((prev) => prev.filter((u) => u !== uri));
  }, []);

  const toggleSubject = useCallback((subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject],
    );
  }, []);

  const handlePost = useCallback(async () => {
    if (!content.trim() && localImages.length === 0) return;
    setPosting(true);

    try {
      let mediaUrls: string[] = [];
      if (localImages.length > 0) {
        mediaUrls = await uploadImages(localImages);
      }

      await createPost({
        postType:   localImages.length > 0 ? 'photo' : 'text',
        content:    content.trim(),
        mediaUrls,
        visibility,
        subjects,
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not publish post. Please try again.');
    } finally {
      setPosting(false);
    }
  }, [content, localImages, visibility, subjects, navigation]);

  const canPost = (content.trim().length > 0 || localImages.length > 0) && !posting;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <MaterialIcons name="close" size={24} color="#374151" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {t('community.composer.post') as string}
        </Text>
        <Pressable
          style={[styles.postBtn, !canPost && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={!canPost}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>
              {t('community.composer.post') as string}
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Audience selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {t('community.composer.audience') as string}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.audienceRow}>
              {VISIBILITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[
                    styles.audienceChip,
                    visibility === opt.value && styles.audienceChipActive,
                  ]}
                  onPress={() => setVisibility(opt.value)}
                >
                  <MaterialIcons
                    name={opt.icon}
                    size={15}
                    color={visibility === opt.value ? '#fff' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.audienceChipText,
                      visibility === opt.value && styles.audienceChipTextActive,
                    ]}
                  >
                    {t(opt.labelKey as never) as string}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Text input */}
        <TextInput
          style={styles.textInput}
          placeholder={t('community.composer.placeholder') as string}
          placeholderTextColor="#9CA3AF"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        {/* Image preview grid */}
        {localImages.length > 0 && (
          <View style={styles.imageGrid}>
            {localImages.map((uri) => (
              <View key={uri} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <Pressable style={styles.removeImage} onPress={() => removeImage(uri)}>
                  <MaterialIcons name="close" size={16} color="#fff" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Subject tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Chủ đề</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.audienceRow}>
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

        {/* Moderation notice */}
        <View style={styles.moderationNotice}>
          <MaterialIcons name="info-outline" size={16} color="#6B7280" />
          <Text style={styles.moderationText}>
            {t('community.composer.moderationNotice') as string}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom toolbar */}
      <View style={styles.toolbar}>
        <Pressable
          style={[styles.toolbarBtn, localImages.length >= 4 && styles.toolbarBtnDisabled]}
          onPress={handlePickImages}
          disabled={localImages.length >= 4}
        >
          <MaterialIcons
            name="photo-library"
            size={22}
            color={localImages.length >= 4 ? '#D1D5DB' : '#6B7280'}
          />
        </Pressable>
        <Text style={styles.charCount}>{content.length}/2000</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:            1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical:   14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize:   17,
    fontWeight: '700',
    color:      '#111827',
  },
  postBtn: {
    backgroundColor: '#0B5FFF',
    borderRadius:    999,
    paddingHorizontal: 18,
    paddingVertical:   8,
    minWidth:          72,
    alignItems:        'center',
  },
  postBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  postBtnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   15,
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop:        16,
    paddingBottom:     8,
  },
  sectionLabel: {
    fontSize:     13,
    fontWeight:   '600',
    color:        '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  audienceRow: {
    flexDirection: 'row',
    gap:           8,
    paddingRight:  16,
  },
  audienceChip: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              5,
    borderRadius:     999,
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderWidth:      1.5,
    borderColor:      '#E5E7EB',
    backgroundColor:  '#fff',
  },
  audienceChipActive: {
    backgroundColor: '#0B5FFF',
    borderColor:     '#0B5FFF',
  },
  audienceChipText: {
    fontSize:   14,
    color:      '#6B7280',
    fontWeight: '500',
  },
  audienceChipTextActive: {
    color: '#fff',
  },
  textInput: {
    minHeight:         140,
    padding:           16,
    fontSize:          17,
    color:             '#111827',
    lineHeight:        26,
  },
  imageGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            8,
    paddingHorizontal: 16,
    marginBottom:   12,
  },
  imageWrapper: {
    position: 'relative',
    width:    '48%',
  },
  imageThumb: {
    width:        '100%',
    aspectRatio:  1,
    borderRadius: 10,
  },
  removeImage: {
    position:        'absolute',
    top:             6,
    right:           6,
    width:           24,
    height:          24,
    borderRadius:    12,
    backgroundColor: '#00000080',
    alignItems:      'center',
    justifyContent:  'center',
  },
  subjectChip: {
    borderRadius:      999,
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderWidth:       1.5,
    borderColor:       '#DBEAFE',
    backgroundColor:   '#EFF6FF',
  },
  subjectChipActive: {
    backgroundColor: '#0B5FFF',
    borderColor:     '#0B5FFF',
  },
  subjectChipText: {
    fontSize:   14,
    fontWeight: '500',
    color:      '#0B5FFF',
  },
  subjectChipTextActive: {
    color: '#fff',
  },
  moderationNotice: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            8,
    margin:         16,
    padding:        12,
    backgroundColor: '#F9FAFC',
    borderRadius:   10,
    borderWidth:    1,
    borderColor:    '#E5E7EB',
  },
  moderationText: {
    flex:      1,
    fontSize:  13,
    color:     '#6B7280',
    lineHeight: 18,
  },
  toolbar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderTopWidth:    1,
    borderTopColor:    '#F3F4F6',
    backgroundColor:   '#fff',
  },
  toolbarBtn: {
    padding: 6,
  },
  toolbarBtnDisabled: {
    opacity: 0.5,
  },
  charCount: {
    fontSize: 13,
    color:    '#9CA3AF',
  },
});
