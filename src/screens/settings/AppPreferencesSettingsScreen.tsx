/**
 * App Preferences Settings Screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../hooks/settings/useUserPreferences';
import { TIMEZONES } from '../../types/settings';

export default function AppPreferencesSettingsScreen() {
  const navigation = useNavigation<any>();
  const { t, language, setLanguage } = useLanguage();
  const { userData } = useUser();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { preferences, loading, updatePreferences } = useUserPreferences(userData?.id || null);

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
    section: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    sectionTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    sectionHint: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    optionsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    optionButton: {
      flex: 1,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
    },
    optionButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    optionText: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
    },
    optionTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    timezoneContainer: {
      marginTop: spacing.sm,
    },
    timezoneOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.background.secondary,
      marginBottom: spacing.sm,
    },
    timezoneOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '20',
    },
    timezoneText: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
    },
    timezoneTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
  });


  const handleLanguageChange = async (newLang: 'en' | 'vi') => {
    if (!userData?.id) return;
    try {
      await updatePreferences({ locale: newLang });
      setLanguage(newLang);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to update language');
    }
  };

  const handleTimezoneChange = async (timezone: string) => {
    if (!userData?.id) return;
    try {
      await updatePreferences({ timezone });
      Alert.alert(t('common.success'), t('settings.preferences.timezoneUpdated') || 'Timezone updated');
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to update timezone');
    }
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
        <View>
          <Text style={styles.headerTitle}>{t('settings.preferences.title')}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences.language')}</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                (preferences?.locale ?? language) === 'en' && styles.optionButtonActive,
              ]}
              onPress={() => handleLanguageChange('en')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.optionText,
                  (preferences?.locale ?? language) === 'en' && styles.optionTextActive,
                ]}
              >
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                (preferences?.locale ?? language) === 'vi' && styles.optionButtonActive,
              ]}
              onPress={() => handleLanguageChange('vi')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.optionText,
                  (preferences?.locale ?? language) === 'vi' && styles.optionTextActive,
                ]}
              >
                Tiếng Việt
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences.timezone')}</Text>
          <View style={styles.timezoneContainer}>
            {TIMEZONES.map((tz) => (
              <TouchableOpacity
                key={tz}
                style={[
                  styles.timezoneOption,
                  preferences?.timezone === tz && styles.timezoneOptionActive,
                ]}
                onPress={() => handleTimezoneChange(tz)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.timezoneText,
                    preferences?.timezone === tz && styles.timezoneTextActive,
                  ]}
                >
                  {tz}
                </Text>
                {preferences?.timezone === tz && (
                  <MaterialIcons name="check" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


