import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

interface SearchScreenProps {
  navigation: any;
  route: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  }); 

  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('search.title')}</Text>
      <Text style={styles.subtitle}>{t('search.comingSoon')}</Text>
    </View>
  );
};
