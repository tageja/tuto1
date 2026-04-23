import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { useNetwork } from '../hooks/network';
import { useSchool } from '../contexts/SchoolContext';

import { HeroSection } from '../components/home/HeroSection';
import { RoleGatewaySection } from '../components/home/RoleGatewaySection';
import { FeatureGridSection } from '../components/home/FeatureGridSection';
import { CTASection } from '../components/home/CTASection';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, isDark } = useTheme();
  const { userData } = useUser();
  const { isOffline, retryNow } = useNetwork();
  const { unreadCount, hasUrgentUnread } = useNotifications();
  const { currentSchool, isSchoolMode } = useSchool();

  const schoolLogoUrl = isSchoolMode && currentSchool?.logo_url ? currentSchool.logo_url : null;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    logo: { width: 72, height: 30, tintColor: isDark ? '#FFFFFF' : undefined },
    schoolLogoHeader: { width: 40, height: 40, borderRadius: 8 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    iconBtn: { padding: 4, position: 'relative' },
    badge: {
      position: 'absolute', top: 0, right: 0,
      backgroundColor: colors.status.error,
      borderRadius: 8, minWidth: 16, height: 16,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 1.5, borderColor: colors.background.primary,
    },
    badgeText: { color: colors.background.primary, fontSize: 10, fontWeight: 'bold' },
    avatarCircle: {
      width: 32, height: 32, borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 13, fontFamily: typography.fontFamily.bold },
    content: { flex: 1 },
    scrollContent: { paddingBottom: spacing.xxl },
    offlineBanner: {
      backgroundColor: colors.disabled,
      flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
      paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    },
    offlineText: { color: colors.background.primary, flex: 1, fontSize: 13 },
    offlineRetry: {
      backgroundColor: colors.background.primary,
      paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 8,
    },
    offlineRetryText: { color: colors.primary, fontFamily: typography.fontFamily.medium, fontSize: 12 },
    divider: { height: 8 },
  });

  const initials = userData?.name
    ? userData.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />

      {/* Header — logo + notification bell + avatar */}
      <View style={styles.header}>
        {schoolLogoUrl ? (
          <Image
            source={{ uri: schoolLogoUrl }}
            style={styles.schoolLogoHeader}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../assets/images/tuto-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
            <MaterialIcons
              name="notifications-none"
              size={26}
              color={hasUrgentUnread ? colors.status.error : unreadCount > 0 ? colors.primary : colors.text.primary}
            />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: hasUrgentUnread ? colors.status.error : colors.primary }]}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('UserProfile')}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="cloud-off" size={20} color={colors.background.primary} />
          <Text style={styles.offlineText}>You are offline. Showing cached data.</Text>
          <TouchableOpacity style={styles.offlineRetry} onPress={retryNow}>
            <Text style={styles.offlineRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Role-smart hero card */}
        <HeroSection />

        {/* Horizontal quick-access strip */}
        <View style={styles.divider} />
        <RoleGatewaySection navigation={navigation} />

        {/* Recent activity from Supabase */}
        <View style={styles.divider} />
        <FeatureGridSection navigation={navigation} />

        {/* Explore tuto */}
        <View style={styles.divider} />
        <CTASection navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};
