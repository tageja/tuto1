import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNotifications } from '../../hooks/useNotifications';

interface DashboardHeaderProps {
  schoolName: string;
  onMenuPress?: () => void;
  onNotificationPress: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  schoolName,
  onMenuPress,
  onNotificationPress,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };


  // Styles with dynamic theme colors
  // Add safe area top inset for Dynamic Island / notch support


  const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: insets.top + spacing.sm, // Account for status bar and Dynamic Island
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  schoolName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  languageSeparator: {
    fontSize: typography.fontSize.sm,
    color: colors.text.light,
    marginHorizontal: 4,
  },
  languageInactive: {
    fontSize: typography.fontSize.sm,
    color: colors.text.light,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  syncContainer: {
    paddingHorizontal: spacing.md,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderColor: '#D4E1FF',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  syncText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
});


  return (
    <View style={styles.container}>
      {/* Top row with hamburger, school name, language, notification */}
      <View style={styles.topRow}>
        {onMenuPress ? (
          <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
            <MaterialIcons name="menu" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconButton} />
        )}
        
        <View style={styles.centerContainer}>
          <Text style={styles.schoolName} numberOfLines={1}>{schoolName}</Text>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity onPress={toggleLanguage} style={styles.languageButton}>
            <Text style={styles.languageText}>{language.toUpperCase()}</Text>
            <Text style={styles.languageSeparator}>|</Text>
            <Text style={styles.languageInactive}>{language === 'en' ? 'VI' : 'EN'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onNotificationPress} style={styles.iconButton}>
            <MaterialIcons name="notifications-none" size={24} color={colors.text.primary} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync status */}
      <View style={styles.syncContainer}>
        <View style={styles.syncBadge}>
          <View style={styles.syncDot} />
          <MaterialIcons name="sync" size={12} color={colors.primary} />
          <Text style={styles.syncText}>Synced 2 min ago</Text>
        </View>
      </View>
    </View>
  );
};

