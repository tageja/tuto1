/**
 * Privacy & Data Settings Screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const PRIVACY_POLICY_URL = 'https://www.tutoglobal.com/legal/privacy';
const TERMS_URL = 'https://www.tutoglobal.com/legal/terms';
const SUPPORT_EMAIL = 'support@tutoglobal.com';

export default function PrivacyDataSettingsScreen() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
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
    headerRight: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: colors.primary + '20',
      padding: spacing.lg,
      margin: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    infoCardTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    infoCardText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
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
      marginBottom: spacing.xs,
    },
    sectionDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    optionsContainer: {
      marginTop: spacing.sm,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    optionText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.primary,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.background.secondary,
    },
    actionButtonText: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    badge: {
      backgroundColor: colors.warning,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
    },
    badgeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.white,
      textTransform: 'uppercase',
    },
    warningBox: {
      flexDirection: 'row',
      backgroundColor: colors.error + '20',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    warningText: {
      flex: 1,
      marginLeft: spacing.sm,
    },
    warningTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '700',
      color: colors.error,
      marginBottom: 4,
    },
    warningDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.error,
      backgroundColor: colors.background.primary,
    },
    dangerButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.error,
      marginLeft: spacing.sm,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    linkText: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.primary,
    },
    rightsText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
    },
  });


  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('settings.privacy.openUrlError') || 'Could not open link');
    });
  };

  const handleContactAdmin = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Account Deletion Request`).catch(() => {
      Alert.alert(t('common.error'), t('settings.privacy.mailtoError') || 'Could not open email client');
    });
  };

  const handleExportData = () => {
    Alert.alert(
      t('settings.privacy.exportData.title'),
      t('settings.privacy.exportData.comingSoon') || 'Data export is coming soon',
      [{ text: t('common.ok') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.tabs.privacy')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Info Card */}
        <View style={styles.infoCard}>
          <MaterialIcons name="lock" size={32} color={colors.primary} />
          <Text style={styles.infoCardTitle}>{t('settings.privacy.matters') || 'Your Privacy Matters'}</Text>
          <Text style={styles.infoCardText}>
            {t('settings.privacy.description') || 'We take your privacy seriously and protect your data.'}
          </Text>
        </View>

        {/* Data Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy.dataVisibility') || 'Data Visibility'}</Text>
          <Text style={styles.sectionDescription}>
            {t('settings.privacy.dataVisibilityDescription') || 'Choose who can see your information'}
          </Text>
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>{t('settings.privacy.schoolOnly') || 'School Only'}</Text>
              <MaterialIcons name="check" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Your Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy.exportData.title') || 'Export Your Data'}</Text>
          <Text style={styles.sectionDescription}>
            {t('settings.privacy.exportData.description') || 'Download a copy of all your data'}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <MaterialIcons name="download" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>
              {t('settings.privacy.exportData.button') || 'Export Data'}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{t('common.comingSoon') || 'Coming Soon'}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delete Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy.deleteAccount.title') || 'Delete Account'}</Text>
          <Text style={styles.sectionDescription}>
            {t('settings.privacy.deleteAccount.description') || 'Permanently delete your account and all data'}
          </Text>
          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={24} color={colors.error} />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>
                {t('settings.privacy.deleteAccount.warning') || 'This action cannot be undone'}
              </Text>
              <Text style={styles.warningDescription}>
                {t('settings.privacy.deleteAccount.warningDescription') || 'All your data will be permanently deleted'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.dangerButton} onPress={handleContactAdmin}>
            <MaterialIcons name="email" size={24} color={colors.error} />
            <Text style={styles.dangerButtonText}>
              {t('settings.privacy.deleteAccount.contactAdmin') || 'Contact School Admin'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.privacy.legalDocuments') || 'Legal Documents'}</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenURL(PRIVACY_POLICY_URL)}
          >
            <Text style={styles.linkText}>{t('settings.privacy.privacyPolicy') || 'Privacy Policy'}</Text>
            <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenURL(TERMS_URL)}
          >
            <Text style={styles.linkText}>{t('settings.privacy.termsOfService') || 'Terms of Service'}</Text>
            <MaterialIcons name="open-in-new" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Privacy Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.privacy.yourRights') || 'Your Privacy Rights'}
          </Text>
          <Text style={styles.rightsText}>
            {t('settings.privacy.rightsDescription') ||
              'You have the right to access, correct, or delete your personal data. Contact us for assistance.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}







