/**
 * Notification Preferences Settings Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useNotificationPreferences } from '../../hooks/settings/useNotificationPreferences';
import { NOTIFICATION_CHANNELS, NOTIFICATION_TOPICS, NotificationPrefItem } from '../../types/settings';
import { useTheme } from '../../contexts/ThemeContext';

export default function NotificationPreferencesSettingsScreen() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { userData } = useUser();
  const { preferences, loading, updatePreferences } = useNotificationPreferences(userData?.id || null);

  const [localPreferences, setLocalPreferences] = useState<NotificationPrefItem[]>([]);

  useEffect(() => {
    if (preferences.length > 0) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const togglePreference = (topic: string, channel: string, enabled: boolean) => {
    const updated = localPreferences.map((pref) =>
      pref.topic === topic && pref.channel === channel
        ? { ...pref, enabled }
        : pref
    );
    setLocalPreferences(updated);

    // Update immediately
    if (userData?.id) {
      updatePreferences(updated).catch((error: any) => {
        Alert.alert(t('common.error'), error.message || 'Failed to update preference');
        // Revert on error
        setLocalPreferences(preferences);
      });
    }
  };

  const getPreference = (topic: string, channel: string): boolean => {
    const pref = localPreferences.find((p) => p.topic === topic && p.channel === channel);
    return pref?.enabled ?? true;
  };


  // Styles moved inside component to access dynamic theme colors


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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.md,
  },
  bannerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bannerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  matrix: {
    margin: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  matrixHeaderCell: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixHeaderText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.text.primary,
    textTransform: 'uppercase',
  },
  matrixRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  matrixTopicCell: {
    flex: 2,
    padding: spacing.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border.light,
  },
  matrixTopicText: {
    fontSize: typography.fontSize.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  matrixCell: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.notifications.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Push Notifications Banner */}
        <View style={styles.banner}>
          <MaterialIcons name="notifications-active" size={24} color={colors.primary} />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>{t('settings.notifications.pushEnabled')}</Text>
            <Text style={styles.bannerSubtitle}>
              {t('settings.notifications.pushDescription') || 'Push notifications are enabled on this device'}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{t('settings.notifications.description')}</Text>

        {/* Notification Matrix */}
        <View style={styles.matrix}>
          {/* Header Row */}
          <View style={styles.matrixHeaderRow}>
            <View style={styles.matrixHeaderCell}>
              <Text style={styles.matrixHeaderText}>{t('settings.notifications.topic')}</Text>
            </View>
            {NOTIFICATION_CHANNELS.map((channel) => (
              <View key={channel} style={styles.matrixHeaderCell}>
                <Text style={styles.matrixHeaderText}>{t(`settings.notifications.channels.${channel}`)}</Text>
              </View>
            ))}
          </View>

          {/* Topic Rows */}
          {NOTIFICATION_TOPICS.map((topic) => (
            <View key={topic} style={styles.matrixRow}>
              <View style={styles.matrixTopicCell}>
                <Text style={styles.matrixTopicText}>
                  {t(`settings.notifications.topics.${topic}`)}
                </Text>
              </View>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <View key={channel} style={styles.matrixCell}>
                  <Switch
                    value={getPreference(topic, channel)}
                    onValueChange={(enabled) => togglePreference(topic, channel, enabled)}
                    trackColor={{ false: colors.border.light, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

