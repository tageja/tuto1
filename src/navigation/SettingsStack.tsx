/**
 * Settings Stack Navigator
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsHomeScreen from '../screens/settings/SettingsHomeScreen';
import AccountProfileSettingsScreen from '../screens/settings/AccountProfileSettingsScreen';
import AppPreferencesSettingsScreen from '../screens/settings/AppPreferencesSettingsScreen';
import NotificationPreferencesSettingsScreen from '../screens/settings/NotificationPreferencesSettingsScreen';
import PrivacyDataSettingsScreen from '../screens/settings/PrivacyDataSettingsScreen';
import SchoolSettingsScreen from '../screens/settings/SchoolSettingsScreen';
import DeviceAndAppSettingsScreen from '../screens/settings/DeviceAndAppSettingsScreen';
import AboutAndLegalSettingsScreen from '../screens/settings/AboutAndLegalSettingsScreen';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountProfileSettings: undefined;
  AppPreferencesSettings: undefined;
  NotificationPreferencesSettings: undefined;
  PrivacyDataSettings: undefined;
  SchoolSettings: undefined;
  DeviceAndAppSettings: undefined;
  AboutAndLegalSettings: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="SettingsHome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsHomeScreen} />
      <Stack.Screen name="AccountProfileSettings" component={AccountProfileSettingsScreen} />
      <Stack.Screen name="AppPreferencesSettings" component={AppPreferencesSettingsScreen} />
      <Stack.Screen name="NotificationPreferencesSettings" component={NotificationPreferencesSettingsScreen} />
      <Stack.Screen name="PrivacyDataSettings" component={PrivacyDataSettingsScreen} />
      <Stack.Screen name="SchoolSettings" component={SchoolSettingsScreen} />
      <Stack.Screen name="DeviceAndAppSettings" component={DeviceAndAppSettingsScreen} />
      <Stack.Screen name="AboutAndLegalSettings" component={AboutAndLegalSettingsScreen} />
    </Stack.Navigator>
  );
};


