import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeroSectionProps {
  navigation: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      alignItems: 'center',
    },
    title: {
      fontSize: 32, // Mobile friendly large size
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
      lineHeight: 40,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: spacing.md,
      flexWrap: 'wrap',
      justifyContent: 'center',
      width: '100%',
    },
    primaryButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.md,
      shadowColor: '#000',
    },
    primaryButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.background.primary,
      marginRight: spacing.sm,
    },
    secondaryButton: {
      backgroundColor: colors.background.tertiary, // Light gray from Login/Register tabs
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    secondaryButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.secondary,
    },
  });

  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('landing.hero.title') || 'The Learning Platform for Schools, Teachers & Families'}
      </Text>
      <Text style={styles.subtitle}>
        {t('landing.hero.subtitle') || 'Connect with expert teachers, manage school activities, and track student progress all in one place.'}
      </Text>

      <View style={styles.buttonContainer}>
        {/* Find Teachers Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('AllSubjects')}
        >
          <Text style={styles.primaryButtonText}>
            {t('landing.cta.findTeachers') || 'Find Teachers'}
          </Text>
          <MaterialIcons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Explore Feed Button */}
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Feed')}
        >
          <Text style={styles.secondaryButtonText}>
            {t('landing.cta.exploreFeed') || 'Explore Feed'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};











