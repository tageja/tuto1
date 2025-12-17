/**
 * Settings Home Screen
 * Main Settings entry point with profile card and settings tiles
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUserProfile } from '../../hooks/settings/useUserProfile';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsTile {
  id: string;
  title: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

export default function SettingsHomeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { userData, clearUser } = useUser();
  const { currentSchool } = useSchool();
  const { profile, loading: profileLoading } = useUserProfile(userData?.id || null);
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const isAdmin = userData?.type === 'admin' || userData?.type === 'teacher';

  // Get user initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Settings tiles
  const settingsTiles: SettingsTile[] = [
    { id: 'account', title: t('settings.tabs.profile'), icon: 'person', route: 'AccountProfileSettings' },
    { id: 'preferences', title: t('settings.preferences.title'), icon: 'tune', route: 'AppPreferencesSettings' },
    { id: 'notifications', title: t('settings.tabs.notifications'), icon: 'notifications', route: 'NotificationPreferencesSettings' },
    { id: 'privacy', title: t('settings.tabs.privacy'), icon: 'lock', route: 'PrivacyDataSettings' },
    { id: 'school', title: t('settings.branding.title'), icon: 'school', route: 'SchoolSettings', adminOnly: true },
    { id: 'device', title: t('settings.device.title'), icon: 'smartphone', route: 'DeviceAndAppSettings' },
    { id: 'about', title: t('settings.about.title'), icon: 'info', route: 'AboutAndLegalSettings' },
  ];

  const visibleTiles = settingsTiles.filter(tile => !tile.adminOnly || isAdmin);

  const handleTilePress = (route: string) => {
    navigation.navigate(route as never);
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut.title'),
      t('settings.signOut.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut.confirm'),
          style: 'destructive',
          onPress: async () => {
            await clearUser();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('AccountProfileSettings' as never);
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
    profileCard: {
      backgroundColor: colors.background.primary,
      margin: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    avatarContainer: {
      marginRight: spacing.md,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
    },
    avatarPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.white,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.sm,
      marginBottom: 4,
    },
    roleText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.white,
      textTransform: 'uppercase',
    },
    schoolName: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    editProfileText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: spacing.xs,
    },
    tilesContainer: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    tileLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    tileTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
      marginLeft: spacing.md,
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.primary,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.xl,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.error,
    },
    signOutText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.error,
      marginLeft: spacing.sm,
    },
  });

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
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getInitials(profile?.full_name || userData?.name)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.full_name || userData?.name || t('settings.profile.fullNamePlaceholder')}
              </Text>
              <Text style={styles.profileEmail}>{userData?.email || ''}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {isAdmin ? t('settings.role.admin') : t('settings.role.parent')}
                </Text>
              </View>
              {currentSchool && (
                <Text style={styles.schoolName}>{currentSchool.name}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={20} color={colors.primary} />
            <Text style={styles.editProfileText}>{t('settings.profile.editProfile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Tiles */}
        <View style={styles.tilesContainer}>
          {visibleTiles.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.tile}
              onPress={() => handleTilePress(tile.route)}
            >
              <View style={styles.tileLeft}>
                <MaterialIcons name={tile.icon as any} size={24} color={colors.primary} />
                <Text style={styles.tileTitle}>{tile.title}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.disabled} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color={colors.error} />
          <Text style={styles.signOutText}>{t('settings.signOut.button')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
