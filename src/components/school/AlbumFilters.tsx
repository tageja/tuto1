import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { AlbumTab } from '../../services/school/albums';

interface AlbumFiltersProps {
  mode: 'admin' | 'parent';
  activeTab: AlbumTab;
  onTabChange: (tab: AlbumTab) => void;
}

const ADMIN_TABS: AlbumTab[] = ['all', 'recent', 'events', 'class'];
const PARENT_TABS: AlbumTab[] = ['all', 'recent', 'class', 'favorites'];

export const AlbumFilters: React.FC<AlbumFiltersProps> = ({ mode, activeTab, onTabChange }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    tabsContainer: {
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    tab: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background.secondary,
      marginRight: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.white,
      fontFamily: typography.fontFamily.semiBold,
    },
  });

  const { t } = useLanguage();
  const tabs = mode === 'admin' ? ADMIN_TABS : PARENT_TABS;

  const getTabLabel = (tab: AlbumTab): string => {
    if (mode === 'admin') {
      switch (tab) {
        case 'all':
          return t('school.photoAlbums.all');
        case 'recent':
          return t('school.photoAlbums.recent');
        case 'events':
          return t('school.photoAlbums.events');
        case 'class':
          return t('school.photoAlbums.classEvents');
        default:
          return '';
      }
    } else {
      switch (tab) {
        case 'all':
          return t('school.photoAlbums.all');
        case 'recent':
          return t('school.photoAlbums.recent');
        case 'class':
          return t('school.photoAlbums.classEvents');
        case 'favorites':
          return t('school.photoAlbums.favorites');
        default:
          return '';
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabChange(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {getTabLabel(tab)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};



