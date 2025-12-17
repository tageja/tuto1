import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { LanguageToggle } from '../components/LanguageToggle';

// New Home Components
import { HeroSection } from '../components/home/HeroSection';
import { RoleGatewaySection } from '../components/home/RoleGatewaySection';
import { FeatureGridSection } from '../components/home/FeatureGridSection';
import { LiveKpisSection } from '../components/home/LiveKpisSection';
import { CTASection } from '../components/home/CTASection';
import { useNetwork } from '../hooks/network';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      zIndex: 10,
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    logo: {
      width: 80,
      height: 32,
      tintColor: isDark ? '#FFFFFF' : undefined,
    },
    iconButton: {
      padding: 4,
      position: 'relative',
    },
    notificationBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.status.error,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: colors.background.primary,
    },
    notificationBadgeText: {
      color: colors.background.primary,
      fontSize: 10,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      paddingBottom: spacing.xxl,
    },
    offlineBanner: {
      backgroundColor: colors.disabled,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    offlineText: {
      color: colors.background.primary,
      flex: 1,
      fontSize: 13,
    },
    offlineRetry: {
      backgroundColor: colors.background.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      borderRadius: 8,
    },
    offlineRetryText: {
      color: colors.primary,
      fontFamily: typography.fontFamily.medium,
      fontSize: 12,
    },
  });

  const { t } = useLanguage();
  const { clearUser } = useUser();
  const { isOffline, retryNow } = useNetwork();

  const handleLogout = async () => {
    await clearUser();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/tuto-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications-none" size={26} color={colors.text.primary} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <MaterialIcons name="person-outline" size={26} color={colors.text.primary} />
          </TouchableOpacity>

          <LanguageToggle />
          
          <TouchableOpacity 
            style={[styles.iconButton, { marginLeft: 4 }]}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Banner */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="cloud-off" size={20} color={colors.background.primary} />
          <Text style={styles.offlineText}>{t('common.offline') || 'You are offline. Showing cached data.'}</Text>
          <TouchableOpacity style={styles.offlineRetry} onPress={retryNow}>
            <Text style={styles.offlineRetryText}>{t('common.tryAgain') || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroSection navigation={navigation} />
        <RoleGatewaySection navigation={navigation} />
        <FeatureGridSection />
        <LiveKpisSection />
        <CTASection navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

