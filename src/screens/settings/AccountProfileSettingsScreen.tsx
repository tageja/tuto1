/**
 * Account & Profile Settings Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useUserProfile } from '../../hooks/settings/useUserProfile';
import { useTheme } from '../../contexts/ThemeContext';

export default function AccountProfileSettingsScreen() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { userData, refreshProfile } = useUser();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useUserProfile(userData?.id || null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Styles moved to component level to access dynamic theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text.primary,
    },
    saveButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    saveButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.primary,
    },
    content: {
      flex: 1,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.white,
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.white,
    },
    avatarHint: {
      marginTop: spacing.sm,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    fieldSection: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    label: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    charCount: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      textAlign: 'right',
    },
    readOnlyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      padding: spacing.md,
    },
    readOnlyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      flex: 1,
    },
    helperText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    resetPasswordButton: {
      marginTop: spacing.sm,
      paddingVertical: spacing.sm,
    },
    resetPasswordText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.primary,
    },
    twoFactorRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    twoFactorLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    twoFactorRight: {
      alignItems: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.xs,
    },
    statusEnabled: {
      backgroundColor: colors.status.success,
    },
    statusDisabled: {
      backgroundColor: colors.disabled,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.white,
      textTransform: 'uppercase',
    },
    setupButton: {
      paddingVertical: spacing.xs,
    },
    setupButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
    },
  });

  React.useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t('common.error'),
          t('settings.profile.avatarPermissionDenied') || 'Please allow photo library access to upload avatar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingAvatar(true);
        try {
          await uploadAvatar(result.assets[0].uri);
          await refreshProfile();
          Alert.alert(t('common.success'), t('settings.profile.avatarUploadSuccess') || 'Avatar updated successfully');
        } catch (error: any) {
          Alert.alert(t('common.error'), error.message || t('settings.profile.uploadError'));
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!userData?.id) return;

    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || undefined,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
      });
      await refreshProfile();
      Alert.alert(t('common.success'), t('settings.profile.updateSuccess') || 'Profile updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = () => {
    Linking.openURL('https://accounts.google.com/signin/recovery');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.profile.title')}</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
            {uploadingAvatar ? (
              <View style={styles.avatarContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {getInitials(fullName || profile?.full_name || userData?.name)}
                </Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <MaterialIcons name="camera-alt" size={20} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>{t('settings.profile.avatarHint')}</Text>
        </View>

        {/* Full Name */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>{t('settings.profile.fullName')}</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('settings.profile.fullNamePlaceholder')}
            placeholderTextColor={colors.disabled}
          />
        </View>

        {/* Email (Read-only) */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>{t('settings.profile.email')}</Text>
          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyText}>{userData?.email || ''}</Text>
            <MaterialIcons name="lock" size={20} color={colors.disabled} />
          </View>
          <Text style={styles.helperText}>{t('settings.profile.emailManaged')}</Text>
        </View>

        {/* Phone */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>{t('settings.profile.phone')}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder={t('settings.profile.phonePlaceholder') || '+84...'}
            placeholderTextColor={colors.disabled}
            keyboardType="phone-pad"
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>{t('settings.profile.bio')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder={t('settings.profile.bioPlaceholder')}
            placeholderTextColor={colors.disabled}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{bio.length}/500</Text>
        </View>

        {/* Password Section */}
        <View style={styles.fieldSection}>
          <Text style={styles.label}>{t('settings.profile.password')}</Text>
          <View style={styles.readOnlyContainer}>
            <Text style={styles.readOnlyText}>{t('settings.profile.passwordHint')}</Text>
          </View>
          <TouchableOpacity style={styles.resetPasswordButton} onPress={handleResetPassword}>
            <Text style={styles.resetPasswordText}>{t('settings.profile.resetPassword')}</Text>
          </TouchableOpacity>
        </View>

        {/* Two-Factor Authentication */}
        <View style={styles.fieldSection}>
          <View style={styles.twoFactorRow}>
            <View style={styles.twoFactorLeft}>
              <Text style={styles.label}>{t('settings.profile.twoFactor')}</Text>
              <Text style={styles.helperText}>{t('settings.profile.twoFactorHint')}</Text>
            </View>
            <View style={styles.twoFactorRight}>
              <View style={[styles.statusBadge, profile?.twofa_enabled ? styles.statusEnabled : styles.statusDisabled]}>
                <Text style={styles.statusText}>
                  {profile?.twofa_enabled ? t('settings.profile.enabled') : t('settings.profile.disabled')}
                </Text>
              </View>
              {/* TODO: Navigate to 2FA setup when implemented */}
              <TouchableOpacity style={styles.setupButton}>
                <Text style={styles.setupButtonText}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

