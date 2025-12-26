/**
 * Device Preferences Utility
 * Handles device-specific preferences stored in AsyncStorage
 * Structured to allow future Supabase sync if needed
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DevicePreferences } from '../types/settings';

const PREFERENCE_KEYS = {
  biometric_enabled: 'biometric_enabled',
  push_notifications_enabled: 'push_notifications_enabled',
  sound_alerts_enabled: 'sound_alerts_enabled',
  vibration_alerts_enabled: 'vibration_alerts_enabled',
  data_saver_enabled: 'data_saver_enabled',
  wifi_only_downloads_enabled: 'wifi_only_downloads_enabled',
} as const;

/**
 * Get a device preference value
 */
export async function getDevicePreference(key: keyof DevicePreferences): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PREFERENCE_KEYS[key]);
    return value === 'true';
  } catch (error) {
    console.error(`Error getting device preference ${key}:`, error);
    return false; // Default to false on error
  }
}

/**
 * Set a device preference value
 */
export async function setDevicePreference(
  key: keyof DevicePreferences,
  value: boolean
): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERENCE_KEYS[key], value.toString());
  } catch (error) {
    console.error(`Error setting device preference ${key}:`, error);
    throw error;
  }
}

/**
 * Get all device preferences
 */
export async function getAllDevicePreferences(): Promise<DevicePreferences> {
  const [biometric, push, sound, vibration, dataSaver, wifiOnly] = await Promise.all([
    getDevicePreference('biometric_enabled'),
    getDevicePreference('push_notifications_enabled'),
    getDevicePreference('sound_alerts_enabled'),
    getDevicePreference('vibration_alerts_enabled'),
    getDevicePreference('data_saver_enabled'),
    getDevicePreference('wifi_only_downloads_enabled'),
  ]);

  return {
    biometric_enabled: biometric,
    push_notifications_enabled: push,
    sound_alerts_enabled: sound,
    vibration_alerts_enabled: vibration,
    data_saver_enabled: dataSaver,
    wifi_only_downloads_enabled: wifiOnly,
  };
}

/**
 * Set all device preferences at once
 */
export async function setAllDevicePreferences(preferences: Partial<DevicePreferences>): Promise<void> {
  const promises = Object.entries(preferences).map(([key, value]) =>
    setDevicePreference(key as keyof DevicePreferences, value as boolean)
  );
  await Promise.all(promises);
}






