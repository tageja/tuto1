import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import { useTheme } from '../contexts/ThemeContext';
import { redeemAdminCode } from '../services/school.service';

const AdminOnboardingScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { user, setUserData } = useUser();
  const { setCurrentSchool, setIsSchoolMode } = useSchool();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim()) {
      Alert.alert(t('common.error'), t('adminOnboarding.placeholder'));
      return;
    }

    if (!user?.id || !user?.email) {
      Alert.alert(t('common.error'), 'User information not found');
      return;
    }

    setLoading(true);
    try {
      const result = await redeemAdminCode(code.trim(), user.id, user.email);

      if (result.success && result.schoolId) {
        // Update user type to admin
        await setUserData({
          ...user,
          type: 'admin',
        });

        // Set school mode
        setIsSchoolMode(true);

        // Show success message
        Alert.alert(
          t('common.success'),
          t('adminOnboarding.success'),
          [
            {
              text: t('common.ok'),
              onPress: () => {
                // Navigate to school dashboard
                navigation.replace('SchoolDashboard' as never);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          t('common.error'),
          result.message || t('adminOnboarding.error')
        );
      }
    } catch (error) {
      console.error('❌ Admin code redemption error:', error);
      Alert.alert(t('common.error'), t('adminOnboarding.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: spacing.xl,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: typography.lineHeight.normal * typography.fontSize.md,
    },
    form: {
      marginBottom: spacing.xl,
    },
    label: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semibold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      marginLeft: spacing.sm,
      fontFamily: typography.fontFamily.regular,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginBottom: spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semibold,
    },
    cancelButton: {
      paddingVertical: spacing.md,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: colors.text.secondary,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
    },
    infoContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: spacing.md,
      marginTop: spacing.xl,
    },
    infoText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginLeft: spacing.sm,
      lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="admin-panel-settings" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>{t('adminOnboarding.title')}</Text>
            <Text style={styles.subtitle}>{t('adminOnboarding.subtitle')}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>{t('adminOnboarding.codeLabel')}</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="vpn-key" size={24} color={colors.text.secondary} />
              <TextInput
                style={styles.input}
                placeholder={t('adminOnboarding.placeholder')}
                placeholderTextColor={colors.text.secondary}
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!loading}
                maxLength={20}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>{t('adminOnboarding.submit')}</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoContainer}>
            <MaterialIcons name="info" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              This code is provided by a Tuto executive for school administrators. If you don't have a code, please contact support.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminOnboardingScreen;

