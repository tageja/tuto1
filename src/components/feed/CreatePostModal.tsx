import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { logDebug, logError, logWarn } from '../../services/logger';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { subjects } from '../../data/subjects';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: {
    text: string;
    subjects: string[];
    media?: {
      type: 'image' | 'video';
      url: string;
    };
  }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    cancelButton: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    postButton: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.primary,
    },
    postButtonDisabled: {
      color: colors.text.light,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    avatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
    },
    postPrivacy: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    textInput: {
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      minHeight: 120,
      paddingVertical: spacing.md,
      textAlignVertical: 'top',
    },
    mediaSection: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    mediaButtons: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    mediaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      flex: 1,
    },
    mediaButtonText: {
      marginLeft: spacing.xs,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
    },
    mediaPreview: {
      marginTop: spacing.md,
      position: 'relative',
    },
    mediaImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
    },
    removeMediaButton: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subjectsSection: {
      marginTop: spacing.lg,
    },
    subjectsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    subjectChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    selectedSubjectChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    subjectChipText: {
      marginLeft: spacing.xs,
      fontSize: typography.fontSize.xs,
      color: colors.text.primary,
    },
    selectedSubjectChipText: {
      color: colors.background.primary,
    },
    characterCount: {
      textAlign: 'right',
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
  }); 

  const { t } = useLanguage();
  const { userType } = useUser();
  
  const [postText, setPostText] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: 'image' | 'video';
    url: string;
  } | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleSubjectToggle = (subjectKey: string) => {
    if (selectedSubjects.includes(subjectKey)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subjectKey));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectKey]);
    }
  };

  const handlePickImage = async () => {
    try {
      logDebug('ImagePicker: requesting permission');
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        logWarn('ImagePicker: permission not granted', perm);
        Alert.alert('Permission required', 'Please allow photo library access to upload images.');
        return;
      }
      const hasNewApi = !!(ImagePicker as any).MediaType;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: (hasNewApi ? (['image'] as any) : (ImagePicker as any).MediaTypeOptions.Images),
        quality: 0.8,
        allowsMultipleSelection: false,
        selectionLimit: 1,
      } as any);
      logDebug('ImagePicker: result', result);
      if ((result as any).canceled) return;
      const asset = (result as any).assets && (result as any).assets.length > 0 ? (result as any).assets[0] : undefined;
      if (!asset?.uri) return;
      setSelectedMedia({ type: 'image', url: asset.uri });
      logDebug('ImagePicker: selected asset uri', asset.uri);
    } catch (e) {
      logError('Image picker failed:', e);
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  const handleMediaSelect = (type: 'video') => {
    Alert.alert('Coming soon', 'Video upload will be available soon.');
  };

  const handleSubmit = () => {
    if (!postText.trim()) {
      Alert.alert(t('feed.createPost.error'), t('feed.createPost.textRequired'));
      return;
    }

    if (selectedSubjects.length === 0) {
      Alert.alert(t('feed.createPost.error'), t('feed.createPost.subjectRequired'));
      return;
    }

    onSubmit({
      text: postText.trim(),
      subjects: selectedSubjects,
      media: selectedMedia || undefined,
    });

    // Reset form
    setPostText('');
    setSelectedSubjects([]);
    setSelectedMedia(null);
    onClose();
  };

  const handleCancel = () => {
    Alert.alert(
      t('feed.createPost.cancelTitle'),
      t('feed.createPost.cancelMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('feed.createPost.discard'), 
          style: 'destructive',
          onPress: () => {
            setPostText('');
            setSelectedSubjects([]);
            setSelectedMedia(null);
            onClose();
          }
        }
      ]
    );
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) return null;

    return (
      <View style={styles.mediaPreview}>
        <Image
          source={{ uri: selectedMedia.url }}
          style={styles.mediaImage}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.removeMediaButton}
          onPress={() => setSelectedMedia(null)}
        >
          <MaterialIcons name="close" size={20} color={colors.background.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('feed.createPost.title')}</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!postText.trim() || selectedSubjects.length === 0}
          >
            <Text style={[
              styles.postButton,
              (!postText.trim() || selectedSubjects.length === 0) && styles.postButtonDisabled
            ]}>
              {t('feed.createPost.post')}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={24} color={colors.text.light} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {userType === 'teacher' ? 'Teacher' : userType === 'parent' ? 'Parent' : 'Student'}
              </Text>
              <Text style={styles.postPrivacy}>{t('feed.privacy.public')}</Text>
            </View>
          </View>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder={t('feed.createPost.placeholder')}
            placeholderTextColor={colors.text.light}
            value={postText}
            onChangeText={setPostText}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />

          {/* Media Options */}
          <View style={styles.mediaSection}>
            <Text style={styles.sectionTitle}>{t('feed.createPost.addMedia')}</Text>
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={handlePickImage}
              >
                <MaterialIcons name="photo" size={24} color={colors.primary} />
                <Text style={styles.mediaButtonText}>{t('feed.createPost.photo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => handleMediaSelect('video')}
              >
                <MaterialIcons name="videocam" size={24} color={colors.primary} />
                <Text style={styles.mediaButtonText}>{t('feed.createPost.video')}</Text>
              </TouchableOpacity>
            </View>
            {renderMediaPreview()}
          </View>

          {/* Subject Selection */}
          <View style={styles.subjectsSection}>
            <Text style={styles.sectionTitle}>{t('feed.createPost.selectSubjects')}</Text>
            <View style={styles.subjectsGrid}>
              {subjects.slice(0, 12).map((subject) => (
                <TouchableOpacity
                  key={subject.key}
                  style={[
                    styles.subjectChip,
                    selectedSubjects.includes(subject.key) && styles.selectedSubjectChip
                  ]}
                  onPress={() => handleSubjectToggle(subject.key)}
                >
                  <MaterialIcons 
                    name={subject.icon} 
                    size={16} 
                    color={selectedSubjects.includes(subject.key) ? colors.background.primary : colors.primary} 
                  />
                  <Text style={[
                    styles.subjectChipText,
                    selectedSubjects.includes(subject.key) && styles.selectedSubjectChipText
                  ]}>
                    {t(`subjects.${subject.key}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Character Count */}
          <Text style={styles.characterCount}>
            {postText.length}/1000
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};
