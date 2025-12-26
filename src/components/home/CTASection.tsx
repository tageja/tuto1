import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

interface CTASectionProps {
  navigation: any;
}

export const CTASection: React.FC<CTASectionProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    card: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: spacing.xl,
      alignItems: 'center',
      ...shadows.lg,
      shadowColor: '#000',
      shadowOpacity: 0.2,
    },
    title: {
      fontSize: 28,
      fontFamily: typography.fontFamily.bold,
      color: colors.background.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      color: 'rgba(255, 255, 255, 0.9)',
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    buttonContainer: {
      width: '100%',
      gap: spacing.md,
    },
    primaryButton: {
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      width: '100%',
    },
    primaryButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.bold,
      color: colors.primary,
    },
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    secondaryButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.background.primary,
    },
  });

  const { t } = useLanguage();
  const { user } = useUser();

  const handlePrimaryPress = () => {
    if (user) {
      // If logged in, maybe go to dashboard or role selection
      navigation.navigate('RoleSelection');
    } else {
      navigation.navigate('Register');
    }
  };

  const handleSecondaryPress = () => {
    Linking.openURL('https://tutoglobal.com/contact').catch(err => 
      console.error("Couldn't load page", err)
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {t('landing.cta.title') || 'Ready to transform your school?'}
        </Text>
        <Text style={styles.subtitle}>
          {t('landing.cta.subtitle') || 'Join thousands of schools, teachers, and parents using Tuto today.'}
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePrimaryPress}>
            <Text style={styles.primaryButtonText}>
              {user ? (t('common.continue') || 'Continue') : (t('auth.createAccount') || 'Get Started')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSecondaryPress}>
            <Text style={styles.secondaryButtonText}>
              {t('landing.cta.contactSales') || 'Contact Sales'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};











