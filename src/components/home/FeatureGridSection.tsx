import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

export const FeatureGridSection: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.background.secondary, // surface
    },
    header: {
      marginBottom: spacing.xl,
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    sectionSubtitle: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    featureItem: {
      width: '47%', // roughly 2 columns with gap
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.sm,
      ...shadows.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    featureLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      textAlign: 'center',
    },
  });

  const { t } = useLanguage();

  const features = [
    { id: 'attendance', icon: 'calendar-today', label: t('landing.features.attendance') || 'Attendance', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'homework', icon: 'menu-book', label: t('landing.features.homework') || 'Homework', color: '#6366F1', bg: '#EEF2FF' },
    { id: 'events', icon: 'emoji-events', label: t('landing.features.events') || 'Events', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'progress', icon: 'trending-up', label: t('landing.features.progress') || 'Progress', color: '#A855F7', bg: '#FAF5FF' },
    { id: 'health', icon: 'favorite', label: t('landing.features.health') || 'Health', color: '#F43F5E', bg: '#FFF1F2' },
    { id: 'medicine', icon: 'medication', label: t('landing.features.medicine') || 'Medicine', color: '#EC4899', bg: '#FDF2F8' },
    { id: 'photos', icon: 'image', label: t('landing.features.photos') || 'Photos', color: '#06B6D4', bg: '#ECFEFF' },
    { id: 'payments', icon: 'credit-card', label: t('landing.features.payments') || 'Payments', color: '#10B981', bg: '#ECFDF5' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('landing.features.title') || 'Platform Features'}</Text>
        <Text style={styles.sectionSubtitle}>{t('landing.features.subtitle') || 'Everything you need in one place'}</Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature) => (
          <View key={feature.id} style={styles.featureItem}>
            <View style={[styles.iconContainer, { backgroundColor: feature.bg }]}>
              <MaterialIcons name={feature.icon as any} size={28} color={feature.color} />
            </View>
            <Text style={styles.featureLabel}>{feature.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};











