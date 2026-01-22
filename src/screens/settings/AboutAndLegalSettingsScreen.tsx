/**
 * About & Legal Settings Screen
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const PRIVACY_POLICY_URL = 'https://www.tutoglobal.com/legal/privacy';
const TERMS_URL = 'https://www.tutoglobal.com/legal/terms';
const HELP_CENTER_URL = 'https://www.tutoglobal.com/support';
const SUPPORT_EMAIL = 'support@tutoglobal.com';

const APP_VERSION = Constants.expoConfig?.version || '1.0.1';
const BUILD_NUMBER = Constants.expoConfig?.extra?.buildNumber || '20241220';
const PLATFORM = Platform.OS === 'ios' ? 'iOS' : 'Android';

export default function AboutAndLegalSettingsScreen() {
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
    appCard: {
      alignItems: 'center',
      padding: spacing.lg,
      margin: spacing.md,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    appIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    appIconText: {
      fontSize: typography.fontSize.xxxl,
      fontWeight: '700',
      color: colors.white,
    },
    appName: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    appTagline: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    versionBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    versionText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '700',
      color: colors.white,
      textTransform: 'uppercase',
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
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    infoLabel: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    infoValue: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    linkText: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    footer: {
      alignItems: 'center',
      padding: spacing.xl,
      paddingBottom: spacing.xxl,
    },
    copyright: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    madeWith: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
  });


  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), 'Could not open link');
    });
  };

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {
      Alert.alert(t('common.error'), 'Could not open email client');
    });
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
        <Text style={styles.headerTitle}>
          {t('settings.about.title') || 'About & Legal'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Header Card */}
        <View style={styles.appCard}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>T</Text>
          </View>
          <Text style={styles.appName}>Tuto Education Platform</Text>
          <Text style={styles.appTagline}>
            {t('settings.about.tagline') || 'Connecting schools, teachers, and families'}
          </Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v{APP_VERSION}</Text>
          </View>
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.about.appInfo') || 'App Information'}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.about.version') || 'Version'}
            </Text>
            <Text style={styles.infoValue}>{APP_VERSION}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.about.buildNumber') || 'Build Number'}
            </Text>
            <Text style={styles.infoValue}>{BUILD_NUMBER}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.about.platform') || 'Platform'}
            </Text>
            <Text style={styles.infoValue}>{PLATFORM}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.about.lastUpdated') || 'Last Updated'}
            </Text>
            <Text style={styles.infoValue}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Legal Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.about.legalDocuments') || 'Legal Documents'}
          </Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenURL(PRIVACY_POLICY_URL)}
          >
            <Text style={styles.linkText}>
              {t('settings.privacy.privacyPolicy') || 'Privacy Policy'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenURL(TERMS_URL)}
          >
            <Text style={styles.linkText}>
              {t('settings.privacy.termsOfService') || 'Terms of Service'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
          </TouchableOpacity>
        </View>

        {/* Resources & Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.about.resources') || 'Resources & Support'}
          </Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenURL(HELP_CENTER_URL)}
          >
            <MaterialIcons name="help" size={24} color={colors.primary} />
            <Text style={styles.linkText}>
              {t('settings.about.helpCenter') || 'Help Center'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={handleContactSupport}
          >
            <MaterialIcons name="email" size={24} color={colors.primary} />
            <Text style={styles.linkText}>
              {t('settings.about.contactSupport') || 'Contact Support'}
            </Text>
            <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2025 Tuto Education Platform
          </Text>
          <Text style={styles.madeWith}>
            {t('settings.about.madeWith') || 'Made with ❤️ for education'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}







