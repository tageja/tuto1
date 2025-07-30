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
import { Input } from '../components/common/Input';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAirtable } from '../hooks/useAirtable';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { createParent, loading, error, clearError } = useAirtable();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'parent' as 'parent' | 'teacher',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('auth.nameRequired');
    }

    if (!formData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!formData.phone) {
      newErrors.phone = t('auth.phoneRequired');
    }

    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsDoNotMatch');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('auth.addressRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      if (formData.role === 'parent') {
        // Create parent account
        await createParent({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        });

        Alert.alert(
          t('auth.registerSuccess'),
          t('auth.accountCreated'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        // For teachers, you would call createTeacher
        Alert.alert(
          t('auth.comingSoon'),
          t('auth.teacherRegistration'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      Alert.alert(t('auth.registerError'), t('auth.registrationFailed'));
    }
  };

  const handleRoleChange = (role: 'parent' | 'teacher') => {
    setFormData({ ...formData, role });
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>{t('auth.selectRole')}</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'parent' && styles.roleButtonActive,
              ]}
              onPress={() => handleRoleChange('parent')}
            >
              <MaterialIcons
                name="family-restroom"
                size={20}
                color={formData.role === 'parent' ? colors.secondary : colors.text.secondary}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === 'parent' && styles.roleButtonTextActive,
                ]}
              >
                {t('auth.parent')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === 'teacher' && styles.roleButtonActive,
              ]}
              onPress={() => handleRoleChange('teacher')}
            >
              <MaterialIcons
                name="school"
                size={20}
                color={formData.role === 'teacher' ? colors.secondary : colors.text.secondary}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === 'teacher' && styles.roleButtonTextActive,
                ]}
              >
                {t('auth.teacher')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Registration Form */}
        <View style={styles.form}>
          <Input
            label={t('auth.fullName')}
            placeholder={t('auth.fullNamePlaceholder')}
            value={formData.name}
            onChangeText={(text) => {
              setFormData({ ...formData, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            style={styles.input}
          />

          <Input
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.input}
          />

          <Input
            label={t('auth.phone')}
            placeholder={t('auth.phonePlaceholder')}
            value={formData.phone}
            onChangeText={(text) => {
              setFormData({ ...formData, phone: text });
              if (errors.phone) setErrors({ ...errors, phone: '' });
            }}
            keyboardType="phone-pad"
            error={errors.phone}
            style={styles.input}
          />

          <Input
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            value={formData.password}
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            secureTextEntry={!showPassword}
            error={errors.password}
            style={styles.input}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            }
          />

          <Input
            label={t('auth.confirmPassword')}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, confirmPassword: text });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
            }}
            secureTextEntry={!showConfirmPassword}
            error={errors.confirmPassword}
            style={styles.input}
            rightIcon={
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            }
          />

          <Input
            label={t('auth.address')}
            placeholder={t('auth.addressPlaceholder')}
            value={formData.address}
            onChangeText={(text) => {
              setFormData({ ...formData, address: text });
              if (errors.address) setErrors({ ...errors, address: '' });
            }}
            multiline
            numberOfLines={3}
            error={errors.address}
            style={styles.input}
          />

          {/* Register Button */}
          <Button
            title={t('auth.register')}
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

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

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              {t('auth.byRegistering')}{' '}
            </Text>
            <TouchableOpacity>
              <Text style={styles.termsLink}>
                {t('auth.termsAndConditions')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> {t('auth.and')} </Text>
            <TouchableOpacity>
              <Text style={styles.termsLink}>
                {t('auth.privacyPolicy')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {t('auth.alreadyHaveAccount')}{' '}
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>
                {t('auth.login')}
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
  roleContainer: {
    marginBottom: spacing.xl,
  },
  roleLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleButton: {
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
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  roleButtonTextActive: {
    color: colors.secondary,
  },
  form: {
    flex: 1,
  },
  input: {
    marginBottom: spacing.lg,
  },
  registerButton: {
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
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  termsLink: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
}); 