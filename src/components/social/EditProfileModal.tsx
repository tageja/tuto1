import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { updateProfile, uploadAvatar, uploadCoverPhoto } from '../../services/social/profile.service';
import { pickImages } from '../../services/social/media.service';
import SubjectTagPicker from './SubjectTagPicker';
import type { SocialProfile } from '../../types/social';

const BIO_MAX = 150;
const SUBJECTS = [
  'Toán', 'Tiếng Anh', 'Vật lý', 'Hóa học', 'Sinh học',
  'Lịch sử', 'Địa lý', 'IELTS', 'STEM', 'Tin học',
];

interface Props {
  visible: boolean;
  profile: SocialProfile;
  onClose: () => void;
  onSuccess: (profile: SocialProfile) => void;
}

export default function EditProfileModal({
  visible,
  profile,
  onClose,
  onSuccess,
}: Props) {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [subjects, setSubjects] = useState<string[]>(profile.subjects ?? []);
  const [subjectPickerVisible, setSubjectPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDisplayName(profile.displayName);
      setUsername(profile.username);
      setBio(profile.bio ?? '');
      setSubjects(profile.subjects ?? []);
      setError(null);
    }
  }, [visible, profile]);

  const handleSave = async () => {
    const u = username.trim().toLowerCase().replace(/\s/g, '_');
    if (!u || u.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (!/^[a-z0-9_]+$/.test(u)) {
      setError('Username: lowercase letters, numbers, underscores only');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateProfile(profile.id, {
        displayName: displayName.trim() || profile.displayName,
        username: u,
        bio: bio.trim().slice(0, BIO_MAX),
        subjects,
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPress = async () => {
    try {
      const picked = await pickImages(1);
      if (picked.length === 0) return;
      setUploadingAvatar(true);
      const url = await uploadAvatar(picked[0].uri);
      onSuccess({ ...profile, avatarUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverPress = async () => {
    try {
      const picked = await pickImages(1);
      if (picked.length === 0) return;
      setUploadingCover(true);
      const url = await uploadCoverPhoto(picked[0].uri);
      onSuccess({ ...profile, coverUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const bioCount = bio.length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} disabled={saving}>
            <Text style={styles.cancel}>{t('common.cancel') as string}</Text>
          </Pressable>
          <Text style={styles.title}>{t('community.profile.edit_button') as string}</Text>
          <Pressable onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#0B5FFF" />
            ) : (
              <Text style={styles.save}>{t('common.save') as string}</Text>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {error ? (
            <View style={styles.errorWrap}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : null}

          {/* Cover */}
          <Pressable style={styles.coverWrap} onPress={handleCoverPress} disabled={uploadingCover}>
            {profile.coverUrl ? (
              <Image source={{ uri: profile.coverUrl }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]} />
            )}
            <View style={styles.overlay}>
              {uploadingCover ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <MaterialIcons name="camera-alt" size={24} color="#fff" />
              )}
            </View>
          </Pressable>

          {/* Avatar */}
          <Pressable style={styles.avatarWrap} onPress={handleAvatarPress} disabled={uploadingAvatar}>
            {profile.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{profile.displayName?.charAt(0) ?? '?'}</Text>
              </View>
            )}
            <View style={styles.avatarOverlay}>
              {uploadingAvatar ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialIcons name="camera-alt" size={20} color="#fff" />
              )}
            </View>
          </Pressable>

          <View style={styles.fields}>
            <Text style={styles.label}>{t('settings.profile.fullName') as string}</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('settings.profile.fullNamePlaceholder') as string}
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.label}>Username (@)</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(v) => setUsername(v.toLowerCase().replace(/\s/g, '_'))}
              placeholder="username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>{t('settings.profile.bio') as string}</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder={t('settings.profile.bioPlaceholder') as string}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={BIO_MAX}
            />
            <Text style={styles.counter}>{bioCount}/{BIO_MAX}</Text>

            <Text style={styles.label}>{t('community.composer.subjects') as string}</Text>
            <Pressable
              style={styles.subjectBtn}
              onPress={() => setSubjectPickerVisible(true)}
            >
              <Text style={styles.subjectBtnText}>
                {subjects.length > 0
                  ? subjects.join(', ')
                  : (t('community.composer.addSubjects') as string)}
              </Text>
              <MaterialIcons name="chevron-right" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      <SubjectTagPicker
        visible={subjectPickerVisible}
        selected={subjects}
        onConfirm={setSubjects}
        onClose={() => setSubjectPickerVisible(false)}
      />
    </Modal>
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
    borderBottomColor: '#F3F4F6',
  },
  cancel: {
    fontSize: 15,
    color: '#6B7280',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  save: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B5FFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  errorWrap: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
  },
  coverWrap: {
    height: 120,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#9CA3AF',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    alignSelf: 'center',
    marginTop: -40,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6B7280',
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fields: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -8,
    marginBottom: 16,
  },
  subjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subjectBtnText: {
    fontSize: 16,
    color: '#374151',
  },
});
