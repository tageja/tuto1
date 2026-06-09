import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { createPost } from '../../services/social/posts.service';
import type { SocialPost, PostVisibility } from '../../types/social';
import MediaPicker, { MediaAsset } from './MediaPicker';
import SubjectTagPicker from './SubjectTagPicker';

const CHAR_LIMIT = 500;

interface AudienceOption {
  key:   PostVisibility;
  label: string;
}

const AUDIENCE_OPTIONS: AudienceOption[] = [
  { key: 'school_only', label: 'Trường học' },
  { key: 'class_only',  label: 'Lớp học'   },
  { key: 'followers',   label: 'Người theo dõi' },
  { key: 'public',      label: 'Công khai'  },
];

interface Props {
  visible:   boolean;
  onClose:   () => void;
  onSuccess: (post: SocialPost) => void;
}

export default function CreatePostModal({ visible, onClose, onSuccess }: Props) {
  const { t } = useLanguage();

  const [content,    setContent]    = useState('');
  const [audience,   setAudience]   = useState<PostVisibility>('school_only');
  const [media,      setMedia]      = useState<MediaAsset[]>([]);
  const [subjects,   setSubjects]   = useState<string[]>([]);
  const [tagPickerVisible, setTagPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  const reset = useCallback(() => {
    setContent('');
    setAudience('school_only');
    setMedia([]);
    setSubjects([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createPost({
        postType:   'text',
        content:    content.trim(),
        visibility: audience,
        subjects,
        mediaUrls:  media.map((m) => m.uri),
      });
      reset();
      onSuccess(post);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Đăng bài thất bại. Thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  }, [content, audience, subjects, media, submitting, reset, onSuccess]);

  const handleAddMedia = (assets: MediaAsset[]) => setMedia((prev) => [...prev, ...assets]);
  const handleRemoveMedia = (index: number) => setMedia((prev) => prev.filter((_, i) => i !== index));

  const charsLeft = CHAR_LIMIT - content.length;
  const isOverLimit = charsLeft < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !submitting;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} hitSlop={8}>
              <MaterialIcons name="close" size={24} color="#374151" />
            </Pressable>
            <Text style={styles.headerTitle}>
              {t('community.composer.placeholder') as string}
            </Text>
            <Pressable
              style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {t('community.composer.submit') as string}
                </Text>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Audience selector */}
            <View style={styles.audienceRow}>
              <MaterialIcons name="group" size={16} color="#6B7280" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.audienceChips}>
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.key}
                      style={[styles.chip, audience === opt.key && styles.chipActive]}
                      onPress={() => setAudience(opt.key)}
                    >
                      <Text style={[styles.chipText, audience === opt.key && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Text input */}
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              multiline
              placeholder={t('community.composer.placeholder') as string}
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              maxLength={CHAR_LIMIT + 10}
              autoFocus
              textAlignVertical="top"
            />

            {/* Char counter */}
            <Text style={[styles.charCount, isOverLimit && styles.charCountOver]}>
              {`${content.length}/${CHAR_LIMIT}`}
            </Text>

            {/* Media picker */}
            <MediaPicker
              media={media}
              onAdd={handleAddMedia}
              onRemove={handleRemoveMedia}
              maxImages={4}
            />

            {/* Subject tags */}
            <View style={styles.subjectRow}>
              {subjects.map((tag) => (
                <View key={tag} style={styles.subjectChip}>
                  <Text style={styles.subjectChipText}>{tag}</Text>
                </View>
              ))}
              <Pressable
                style={styles.addSubjectsBtn}
                onPress={() => setTagPickerVisible(true)}
              >
                <Text style={styles.addSubjectsBtnText}>
                  {t('community.composer.addSubjects') as string}
                </Text>
              </Pressable>
            </View>

            {/* Moderation notice */}
            <Text style={styles.moderationNotice}>
              {t('community.composer.moderationNotice') as string}
            </Text>

            {/* Error */}
            {error && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Subject tag picker (nested modal) */}
      <SubjectTagPicker
        visible={tagPickerVisible}
        selected={subjects}
        onConfirm={setSubjects}
        onClose={() => setTagPickerVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex:            1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize:   16,
    fontWeight: '600',
    color:      '#374151',
    flex:       1,
    textAlign:  'center',
    marginHorizontal: 8,
  },
  submitBtn: {
    backgroundColor:   '#0B5FFF',
    paddingHorizontal: 16,
    paddingVertical:   8,
    borderRadius:      999,
    minWidth:          60,
    alignItems:        'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitBtnText: {
    color:      '#fff',
    fontWeight: '700',
    fontSize:   14,
  },
  body: {
    flex:    1,
    padding: 16,
  },
  audienceRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  12,
  },
  audienceChips: {
    flexDirection: 'row',
    gap:           8,
  },
  chip: {
    borderRadius:      999,
    borderWidth:       1,
    borderColor:       '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical:   6,
    backgroundColor:   '#F9FAFC',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor:     '#0B5FFF',
  },
  chipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      '#6B7280',
  },
  chipTextActive: {
    color: '#0B5FFF',
  },
  textInput: {
    fontSize:   16,
    color:      '#111827',
    minHeight:  120,
    lineHeight: 24,
    marginBottom: 8,
  },
  charCount: {
    fontSize:  12,
    color:     '#9CA3AF',
    textAlign: 'right',
    marginBottom: 12,
  },
  charCountOver: {
    color: '#EF4444',
  },
  subjectRow: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    alignItems:     'center',
    gap:            8,
    marginVertical: 12,
  },
  subjectChip: {
    borderRadius:      999,
    backgroundColor:   '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  subjectChipText: {
    fontSize:   13,
    fontWeight: '500',
    color:      '#0B5FFF',
  },
  addSubjectsBtn: {
    borderRadius:      999,
    borderWidth:       1,
    borderColor:       '#CBD5E1',
    borderStyle:       'dashed',
    paddingHorizontal: 12,
    paddingVertical:   6,
  },
  addSubjectsBtnText: {
    fontSize:   13,
    color:      '#6B7280',
  },
  moderationNotice: {
    fontSize:     12,
    color:        '#9CA3AF',
    lineHeight:   18,
    marginBottom: 8,
  },
  errorText: {
    fontSize:     13,
    color:        '#EF4444',
    marginTop:    8,
    textAlign:    'center',
  },
});
