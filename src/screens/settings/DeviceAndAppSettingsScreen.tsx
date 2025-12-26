/**
 * Device & App Settings Screen
 * Mobile-specific settings (biometric, sound, vibration, data saver)
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
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getAllDevicePreferences,
  setDevicePreference,
  type DevicePreferences,
} from '../../utils/devicePreferences';
import { useTheme } from '../../contexts/ThemeContext';

export default function DeviceAndAppSettingsScreen() {
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
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    settingLeft: {
      flex: 1,
      marginRight: spacing.md,
    },
    settingLabel: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    tipBox: {
      flexDirection: 'row',
      backgroundColor: colors.primary + '20',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
    },
    tipText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginLeft: spacing.sm,
    },
  });


  const [preferences, setPreferences] = useState<DevicePreferences>({
    biometric_enabled: false,
    push_notifications_enabled: false,
    sound_alerts_enabled: false,
    vibration_alerts_enabled: false,
    data_saver_enabled: false,
    wifi_only_downloads_enabled: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const prefs = await getAllDevicePreferences();
    setPreferences(prefs);
  };

  const handleToggle = async (key: keyof DevicePreferences, value: boolean) => {
    try {
      await setDevicePreference(key, value);
      setPreferences({ ...preferences, [key]: value });
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || 'Failed to update setting');
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
        <Text style={styles.headerTitle}>
          {t('settings.device.title') || 'Device & App'}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security & Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.device.security') || 'Security & Authentication'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>
                {Platform.OS === 'ios' ? 'Face ID' : 'Biometric Login'}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.device.biometricHint') ||
                  'Use Face ID or fingerprint to unlock the app'}
              </Text>
            </View>
            <Switch
              value={preferences.biometric_enabled}
              onValueChange={(value) => handleToggle('biometric_enabled', value)}
              trackColor={{ false: colors.border.light, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          {/* TODO: Implement actual biometric authentication handler */}
        </View>

        {/* Notifications & Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.device.notifications') || 'Notifications & Alerts'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>
                {t('settings.device.pushNotifications') || 'Push Notifications'}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.device.pushDescription') ||
                  'Receive push notifications on this device'}
              </Text>
            </View>
            <Switch
              value={preferences.push_notifications_enabled}
              onValueChange={(value) => handleToggle('push_notifications_enabled', value)}
              trackColor={{ false: colors.border.light, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>
                {t('settings.device.soundAlerts') || 'Sound Alerts'}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.device.soundDescription') ||
                  'Play sounds for in-app notifications'}
              </Text>
            </View>
            <Switch
              value={preferences.sound_alerts_enabled}
              onValueChange={(value) => handleToggle('sound_alerts_enabled', value)}
              trackColor={{ false: colors.border.light, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>
                {t('settings.device.vibrationAlerts') || 'Vibration Alerts'}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.device.vibrationDescription') ||
                  'Vibrate for in-app notifications'}
              </Text>
            </View>
            <Switch
              value={preferences.vibration_alerts_enabled}
              onValueChange={(value) => handleToggle('vibration_alerts_enabled', value)}
              trackColor={{ false: colors.border.light, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Data Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.device.dataUsage') || 'Data Usage'}
          </Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>
                {t('settings.device.dataSaver') || 'Data Saver'}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.device.dataSaverDescription') ||
                  'Load lower-resolution images to save data'}
              </Text>
            </View>
            <Switch
              value={preferences.data_saver_enabled}
              onValueChange={(value) => handleToggle('data_saver_enabled', value)}
              trackColor={{ false: colors.border.light, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>
                {t('settings.device.wifiOnly') || 'Download over Wi-Fi Only'}
              </Text>
              <Text style={styles.settingDescription}>
                {t('settings.device.wifiOnlyDescription') ||
                  'Only download heavy media when on Wi-Fi'}
              </Text>
            </View>
            <Switch
              value={preferences.wifi_only_downloads_enabled}
              onValueChange={(value) => handleToggle('wifi_only_downloads_enabled', value)}
              trackColor={{ false: colors.border.light, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.tipBox}>
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <Text style={styles.tipText}>
              {t('settings.device.dataUsageTip') ||
                'These settings help you save data and reduce your mobile data usage.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}







