/**
 * School Settings Screen (Admin only)
 * School Branding & Integrations
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useSchoolBranding } from '../../hooks/settings/useSchoolBranding';
import { useTheme } from '../../contexts/ThemeContext';

export default function SchoolSettingsScreen() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { userData } = useUser();
  const { currentSchool } = useSchool();
  const { branding, loading, updateBranding, uploadLogo, uploadHeader } = useSchoolBranding(
    currentSchool?.id || null,
    userData?.id || null
  );

  const [schoolName, setSchoolName] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [primaryHex, setPrimaryHex] = useState('#0B5FFF');
  const [accentHex, setAccentHex] = useState('#10B981');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (branding) {
      setSchoolName(branding.school_name || '');
      setSchoolEmail(branding.school_email || '');
      setSchoolPhone(branding.school_phone || '');
      setSchoolAddress(branding.school_address || '');
      setPrimaryHex(branding.primary_hex || '#0B5FFF');
      setAccentHex(branding.accent_hex || '#10B981');
    }
  }, [branding]);

  const handleUploadLogo = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), 'Please allow photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0] && currentSchool?.id && userData?.id) {
        setUploadingLogo(true);
        try {
          await uploadLogo(result.assets[0].uri);
          Alert.alert(t('common.success'), 'Logo updated successfully');
        } catch (error: any) {
          Alert.alert(t('common.error'), error.message || 'Failed to upload logo');
        } finally {
          setUploadingLogo(false);
        }
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to pick image');
    }
  };

  const handleUploadHeader = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('common.error'), 'Please allow photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets[0] && currentSchool?.id && userData?.id) {
        setUploadingHeader(true);
        try {
          await uploadHeader(result.assets[0].uri);
          Alert.alert(t('common.success'), 'Header image updated successfully');
        } catch (error: any) {
          Alert.alert(t('common.error'), error.message || 'Failed to upload header image');
        } finally {
          setUploadingHeader(false);
        }
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    if (!currentSchool?.id || !userData?.id) return;

    setSaving(true);
    try {
      await updateBranding({
        primary_hex: primaryHex,
        accent_hex: accentHex,
      });
      Alert.alert(t('common.success'), 'Branding updated successfully');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to update branding');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {

    // Styles moved inside component to access dynamic theme colors

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
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  readOnlyValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.light,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: borderRadius.md,
    resizeMode: 'contain',
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.disabled,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border.light,
  },
  headerImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  colorInput: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  integrationLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.disabled,
  },
  statusConnected: {
    backgroundColor: colors.status.success,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.white,
    textTransform: 'uppercase',
  },
});

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.branding.title')}</Text>
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
        {/* School Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.branding.schoolInfo')}</Text>
          <Text style={styles.label}>{t('settings.branding.schoolNameLabel')}</Text>
          <Text style={styles.readOnlyValue}>{schoolName}</Text>
          <Text style={styles.label}>{t('settings.branding.schoolEmail')}</Text>
          <Text style={styles.readOnlyValue}>{schoolEmail}</Text>
          <Text style={styles.label}>{t('settings.branding.schoolPhone')}</Text>
          <Text style={styles.readOnlyValue}>{schoolPhone}</Text>
          <Text style={styles.label}>{t('settings.branding.schoolAddress')}</Text>
          <Text style={styles.readOnlyValue}>{schoolAddress}</Text>
        </View>

        {/* Logo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.branding.logo')}</Text>
          <TouchableOpacity onPress={handleUploadLogo} disabled={uploadingLogo}>
            {uploadingLogo ? (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : branding?.logo_url ? (
              <Image source={{ uri: branding.logo_url }} style={styles.logo} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="add-photo-alternate" size={48} color={colors.disabled} />
                <Text style={styles.placeholderText}>{t('settings.branding.logoHint')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Header Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.branding.headerImage')}</Text>
          <TouchableOpacity onPress={handleUploadHeader} disabled={uploadingHeader}>
            {uploadingHeader ? (
              <View style={styles.headerPlaceholder}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : branding?.header_img_url ? (
              <Image source={{ uri: branding.header_img_url }} style={styles.headerImage} />
            ) : (
              <View style={styles.headerPlaceholder}>
                <MaterialIcons name="add-photo-alternate" size={48} color={colors.disabled} />
                <Text style={styles.placeholderText}>{t('settings.branding.headerHint')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.branding.primaryColor')}</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorPreview, { backgroundColor: primaryHex }]} />
            <TextInput
              style={styles.colorInput}
              value={primaryHex}
              onChangeText={setPrimaryHex}
              placeholder="#0B5FFF"
              placeholderTextColor={colors.disabled}
            />
          </View>
          <Text style={styles.sectionTitle}>{t('settings.branding.accentColor')}</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorPreview, { backgroundColor: accentHex }]} />
            <TextInput
              style={styles.colorInput}
              value={accentHex}
              onChangeText={setAccentHex}
              placeholder="#10B981"
              placeholderTextColor={colors.disabled}
            />
          </View>
        </View>

        {/* Integrations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.integrations.title') || 'Integrations'}</Text>
          <Text style={styles.sectionDescription}>
            {t('settings.integrations.description') || 'Manage third-party integrations'}
          </Text>
          <View style={styles.integrationRow}>
            <Text style={styles.integrationLabel}>
              {t('settings.integrations.payments') || 'Payments'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {t('settings.integrations.notConnected') || 'Not Connected'}
              </Text>
            </View>
          </View>
          <View style={styles.integrationRow}>
            <Text style={styles.integrationLabel}>
              {t('settings.integrations.pushNotifications') || 'Push Notifications'}
            </Text>
            <View style={[styles.statusBadge, styles.statusConnected]}>
              <Text style={styles.statusText}>
                {t('settings.integrations.connected') || 'Connected'}
              </Text>
            </View>
          </View>
          <View style={styles.integrationRow}>
            <Text style={styles.integrationLabel}>
              {t('settings.integrations.sms') || 'SMS'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {t('settings.integrations.notConnected') || 'Not Connected'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

