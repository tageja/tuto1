import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/common/Button';
import { FormTextInput } from '../components/common/FormTextInput';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAirtable } from '../hooks/useAirtable';
import { useUser } from '../contexts/UserContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface LoginScreenProps {
  navigation: any;
}

const schema = yup.object({
  email: yup.string().email().required().transform(value => value?.toLowerCase()),
  password: yup.string().min(6).required(),
});

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { loading, error, clearError, authenticate } = useAirtable();
  const { setUserType, setUserData } = useUser();
  
  const [showPassword, setShowPassword] = useState(false);
  const { control, handleSubmit } = useForm<{ email: string; password: string }>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      const normalizedEmail = email.toLowerCase();
      console.log('Login attempt:', normalizedEmail);
      
      // 1) Try Airtable-backed authentication for parents
      const user = await authenticate(normalizedEmail, password);
      if (user) {
        // Store complete user data
        const userData = {
          id: user.id || `user_${Date.now()}`,
          name: user.name || 'Parent User',
          email: user.email || normalizedEmail,
          type: 'parent' as const
        };
        await setUserData(userData);
        Alert.alert(
          t('auth.loginSuccess'),
          `${t('auth.welcomeBack')} ${userData.name}`,
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.navigate('RoleSelection'),
            },
          ]
        );
        return;
      }

      // 2) Fallback to dummy accounts for student/teacher testing
      const dummyAccounts: Record<string, { type: 'parent' | 'student' | 'teacher'; password: string; name: string }> = {
        'parent@admin.com': { type: 'parent', password: 'password', name: 'Demo Parent' },
        'student@admin.com': { type: 'student', password: 'password', name: 'Demo Student' },
        'teacher@admin.com': { type: 'teacher', password: 'password', name: 'Demo Teacher' },
      };
      const account = dummyAccounts[normalizedEmail];
      if (account && account.password === password) {
        // Store complete user data for dummy accounts
        const userData = {
          id: `${account.type}_${Date.now()}`,
          name: account.name,
          email: normalizedEmail,
          type: account.type
        };
        await setUserData(userData);
        Alert.alert(
          t('auth.loginSuccess'),
          `${t('auth.welcomeBack')} ${userData.name}`,
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.navigate('RoleSelection'),
            },
          ]
        );
        return;
      }

      Alert.alert(t('auth.loginError'), t('auth.invalidCredentials'));
    } catch (error) {
      Alert.alert(t('auth.loginError'), t('auth.invalidCredentials'));
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    Alert.alert(
      t('auth.socialLogin'),
      `${t('auth.comingSoon')} ${provider}`,
      [{ text: t('common.ok') }]
    );
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 100 })}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <FormTextInput
            control={control}
            name="email"
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            // Auto focus first field to ensure keyboard shows reliably
            autoFocus
            
          />

          <FormTextInput
            control={control}
            name="password"
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            }
          />

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              {t('auth.forgotPassword')}
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button title={t('auth.login')} onPress={handleSubmit(onSubmit)} loading={loading} style={styles.loginButton} />

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons
                name="error"
                size={16}
                color={colors.status.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={() => handleSocialLogin('google')}
            >
              <MaterialIcons name="g-translate" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleSocialLogin('facebook')}
            >
              <MaterialIcons name="facebook" size={20} color="#4267B2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              {t('auth.noAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>
                {t('auth.register')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.error + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.status.error,
    marginLeft: spacing.sm,
    flex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.xs,
  },
  googleButton: {
    borderColor: '#DB4437',
  },
  facebookButton: {
    borderColor: '#4267B2',
  },
  socialButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  registerLink: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
}); 