import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useAirtable } from '../hooks/useAirtable';
import { colors, borderRadius, spacing, typography } from '../theme';
import { AuthHeader } from '../components/ui/AuthHeader';
import { AuthContainer } from '../components/ui/AuthContainer';
import { FField } from '../components/ui/FField';
import { FButton } from '../components/ui/FButton';
import { getAuthSafe } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

type Mode = 'login' | 'register';

interface Props {
  navigation: any;
  route: { name?: string; params?: { mode?: Mode } };
}

const loginSchema = yup.object({
  email: yup.string().email().required().transform((v) => v?.toLowerCase()),
  password: yup.string().min(6).required(),
});

const registerSchema = yup.object({
  name: yup.string().min(2).required(),
  email: yup.string().email().required().transform((v) => v?.toLowerCase()),
  phone: yup.string().min(6).required(),
  address: yup.string().min(4).required(),
  password: yup.string().min(6).required(),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required(),
});

export const AuthUnifiedScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useLanguage();
  const defaultMode: Mode = useMemo(() => (route?.name === 'Register' || route?.params?.mode === 'register' ? 'register' : 'login'), [route]);
  const [mode, setMode] = useState<Mode>(defaultMode);

  const { setUserData } = useUser();
  const { authenticate, createParent, loading, error } = useAirtable();

  const loginForm = useForm<{ email: string; password: string }>({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  });

  const registerForm = useForm<{ name: string; email: string; phone: string; address: string; password: string; confirmPassword: string }>({
    defaultValues: { name: '', email: '', phone: '', address: '', password: '', confirmPassword: '' },
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
  });

  const handleFirebaseLogin = async (email: string, password: string) => {
    try {
      const auth = getAuthSafe();
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (_e) {
      return false;
    }
  };

  const onLoginSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      const normalizedEmail = email.toLowerCase();
      // 1) Try Firebase first
      const fbOk = await handleFirebaseLogin(normalizedEmail, password);
      if (fbOk) {
        // Minimal user object from email
        const userData = {
          id: `fb_${Date.now()}`,
          name: normalizedEmail.split('@')[0],
          email: normalizedEmail,
          type: 'parent' as const,
        };
        await setUserData(userData);
        Alert.alert(t('auth.loginSuccess'), `${t('auth.welcomeBack')} ${userData.name}`, [{ text: t('common.ok'), onPress: () => navigation.navigate('RoleSelection') }]);
        return;
      }

      // 2) Airtable-backed parent auth
      const user = await authenticate(normalizedEmail, password);
      if (user) {
        const userData = {
          id: user.id || `user_${Date.now()}`,
          name: user.name || 'Parent User',
          email: user.email || normalizedEmail,
          type: 'parent' as const,
        };
        await setUserData(userData);
        Alert.alert(t('auth.loginSuccess'), `${t('auth.welcomeBack')} ${userData.name}`, [{ text: t('common.ok'), onPress: () => navigation.navigate('RoleSelection') }]);
        return;
      }

      // 3) Dummy accounts remain for quick testing
      const dummyAccounts: Record<string, { type: 'parent' | 'student' | 'teacher'; password: string; name: string }> = {
        'parent@admin.com': { type: 'parent', password: 'password', name: 'Demo Parent' },
        'student@admin.com': { type: 'student', password: 'password', name: 'Demo Student' },
        'teacher@admin.com': { type: 'teacher', password: 'password', name: 'Demo Teacher' },
      };
      const account = dummyAccounts[normalizedEmail];
      if (account && account.password === password) {
        const userData = { id: `${account.type}_${Date.now()}`, name: account.name, email: normalizedEmail, type: account.type } as const;
        await setUserData(userData as any);
        Alert.alert(t('auth.loginSuccess'), `${t('auth.welcomeBack')} ${userData.name}`, [{ text: t('common.ok'), onPress: () => navigation.navigate('RoleSelection') }]);
        return;
      }

      Alert.alert(t('auth.loginError'), t('auth.invalidCredentials'));
    } catch (_e) {
      Alert.alert(t('auth.loginError'), t('auth.invalidCredentials'));
    }
  };

  const onRegisterSubmit = async (data: { name: string; email: string; phone: string; address: string; password: string; confirmPassword: string }) => {
    try {
      const email = data.email.toLowerCase();

      // 1) Create Firebase auth account
      try {
        const auth = getAuthSafe();
        await createUserWithEmailAndPassword(auth, email, data.password);
      } catch (_e) {
        // Non-blocking; we still create Airtable even if Firebase fails here
      }

      // 2) Create parent in Airtable
      await createParent({
        name: data.name,
        email,
        phone: data.phone,
        address: data.address,
        password: data.password,
      } as any);

      Alert.alert(t('auth.registerSuccess'), t('auth.accountCreated') || t('auth.registerSuccess'), [{ text: t('common.ok'), onPress: () => setMode('login') }]);
    } catch (_e) {
      Alert.alert(t('auth.registerError'), t('auth.registrationFailed'));
    }
  };

  const LoginForm = (
    <AuthContainer>
      <FField
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={(loginForm.getValues() as any)?.email || ''}
        onChangeText={(text) => loginForm.setValue('email', text)}
        keyboardType="email-address"
      />
      <FField
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        value={(loginForm.getValues() as any)?.password || ''}
        onChangeText={(text) => loginForm.setValue('password', text)}
        secureTextEntry
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="self-end mb-4">
        <Text className="text-sm font-medium text-primary">{t('auth.forgotPassword')}</Text>
      </TouchableOpacity>

      <FButton title={t('auth.login')} onPress={loginForm.handleSubmit(onLoginSubmit)} loading={loading} className="mb-4" />

      {/* Divider */}
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-onSurface/10" />
        <Text className="mx-3 text-sm font-medium text-onSurface/70">{t('auth.or')}</Text>
        <View className="flex-1 h-px bg-onSurface/10" />
      </View>

      {/* Social buttons (placeholder style) */}
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border border-onSurface/10 bg-background mx-1">
          <MaterialIcons name="g-translate" size={20} color="#DB4437" />
          <Text className="ml-2 text-sm font-medium text-onSurface">Google</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl border border-onSurface/10 bg-background mx-1">
          <MaterialIcons name="facebook" size={20} color="#4267B2" />
          <Text className="ml-2 text-sm font-medium text-onSurface">Facebook</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center">
        <Text className="text-base text-onSurface/70">{t('auth.noAccount')} </Text>
        <TouchableOpacity onPress={() => setMode('register')}>
          <Text className="text-base font-semibold text-primary">{t('auth.register')}</Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );

  const RegisterForm = (
    <AuthContainer>
      <FField
        label={t('auth.fullName')}
        placeholder={t('auth.fullNamePlaceholder')}
        value={(registerForm.getValues() as any)?.name || ''}
        onChangeText={(text) => registerForm.setValue('name', text)}
      />
      <FField
        label={t('auth.email')}
        placeholder={t('auth.emailPlaceholder')}
        value={(registerForm.getValues() as any)?.email || ''}
        onChangeText={(text) => registerForm.setValue('email', text.toLowerCase())}
        keyboardType="email-address"
      />
      <FField
        label={t('auth.phone')}
        placeholder={t('auth.phonePlaceholder')}
        value={(registerForm.getValues() as any)?.phone || ''}
        onChangeText={(text) => registerForm.setValue('phone', text)}
        keyboardType="phone-pad"
      />
      <FField
        label={t('auth.address')}
        placeholder={t('auth.addressPlaceholder')}
        value={(registerForm.getValues() as any)?.address || ''}
        onChangeText={(text) => registerForm.setValue('address', text)}
      />
      <FField
        label={t('auth.password')}
        placeholder={t('auth.passwordPlaceholder')}
        value={(registerForm.getValues() as any)?.password || ''}
        onChangeText={(text) => registerForm.setValue('password', text)}
        secureTextEntry
      />
      <FField
        label={t('auth.confirmPassword')}
        placeholder={t('auth.confirmPasswordPlaceholder')}
        value={(registerForm.getValues() as any)?.confirmPassword || ''}
        onChangeText={(text) => registerForm.setValue('confirmPassword', text)}
        secureTextEntry
      />

      <FButton title={t('auth.register')} onPress={registerForm.handleSubmit(onRegisterSubmit)} loading={loading} />

      <View className="flex-row items-center justify-center mt-4">
        <Text className="text-base text-onSurface/70">{t('auth.haveAccount')} </Text>
        <TouchableOpacity onPress={() => setMode('login')}>
          <Text className="text-base font-semibold text-primary">{t('auth.signIn')}</Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );

  return (
    <KeyboardAvoidingView className="flex-1 bg-background" behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.select({ ios: 0, android: 100 })}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <AuthHeader
          title={mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
          subtitle={mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
        />

        {/* Mode toggle */}
        <View className="mx-4 mb-2 flex-row bg-surface rounded-2xl p-1 border border-onSurface/10">
          <TouchableOpacity onPress={() => setMode('login')} className={`flex-1 py-3 rounded-xl items-center justify-center ${mode === 'login' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`text-base font-semibold ${mode === 'login' ? 'text-primary' : 'text-onSurface/70'}`}>{t('auth.signIn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('register')} className={`flex-1 py-3 rounded-xl items-center justify-center ${mode === 'register' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`text-base font-semibold ${mode === 'register' ? 'text-primary' : 'text-onSurface/70'}`}>{t('auth.register')}</Text>
          </TouchableOpacity>
        </View>

        {/* Forms */}
        {mode === 'login' ? LoginForm : RegisterForm}

        {/* Error bubble (non-blocking) */}
        {error ? (
          <View className="mx-4 my-4 flex-row items-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <MaterialIcons name="error" size={16} color={colors.status.error} />
            <Text className="ml-2 text-sm font-medium" style={{ color: colors.status.error }}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthUnifiedScreen;


