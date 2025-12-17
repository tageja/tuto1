import React, { useState, useEffect } from 'react';
import {
  View,
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../config/supabase';

interface ResetPasswordScreenProps {
  navigation: any;
  route: any;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation, route }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    background: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 120,
      height: 40,
    },
    cardContainer: {
      width: '100%',
      marginBottom: 24,
    },
    card: {
      backgroundColor: colors.background.primary,
      padding: 24,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      color: colors.text.secondary,
      marginBottom: 32,
      textAlign: 'center',
      lineHeight: 22,
    },
    formContainer: {
      gap: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: 12,
      marginBottom: 8,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
    },
    eyeButton: {
      padding: 12,
    },
    requirementsContainer: {
      backgroundColor: '#F9FAFB',
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#0B5FFF',
    },
    requirementsText: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    primaryButton: {
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#0B5FFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      backgroundColor: '#0B5FFF',
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    primaryButtonText: {
      color: colors.background.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    footerText: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: 16,
    },
    footerLink: {
      color: '#0B5FFF',
      fontWeight: '600',
    },
  });
  const { t, language } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if user has a valid session from the email link
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('⚠️ No session found. User may need to click the email link again.');
        Alert.alert(
          language === 'en' ? 'Session Expired' : 'Phiên đã hết hạn',
          language === 'en'
            ? 'Your reset link has expired. Please request a new one.'
            : 'Liên kết đặt lại của bạn đã hết hạn. Vui lòng yêu cầu liên kết mới.',
          [{ text: t('common.ok'), onPress: () => navigation.navigate('Login') }]
        );
      } else {
        console.log('✅ Valid session found for password reset');
      }
    } catch (error) {
      console.error('❌ Error checking session:', error);
    }
  };

  const handleResetPassword = async () => {
    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert(
        t('auth.loginError'),
        language === 'en'
          ? 'Please enter both password fields'
          : 'Vui lòng nhập cả hai trường mật khẩu'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        t('auth.loginError'),
        t('auth.passwordTooShort')
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('auth.loginError'),
        t('auth.passwordMismatch')
      );
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Updating password...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      console.log('✅ Password updated successfully');
      
      Alert.alert(
        language === 'en' ? 'Password Reset Successful' : 'Đặt lại mật khẩu thành công',
        language === 'en'
          ? 'Your password has been reset successfully. You can now sign in with your new password.'
          : 'Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
        [{ 
          text: t('common.ok'), 
          onPress: async () => {
            // Sign out to clear the reset session
            await supabase.auth.signOut();
            navigation.navigate('Login');
          }
        }]
      );
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      Alert.alert(
        t('auth.loginError'),
        language === 'en'
          ? 'Failed to reset password. Please try again or request a new reset link.'
          : 'Không thể đặt lại mật khẩu. Vui lòng thử lại hoặc yêu cầu liên kết đặt lại mới.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.background}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Logo */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/tuto-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* White Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <MaterialIcons name="lock-reset" size={48} color="#0B5FFF" />
              </View>

              {/* Title */}
              <Text style={styles.title}>
                {language === 'en' ? 'Reset Password' : 'Đặt lại mật khẩu'}
              </Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                {language === 'en'
                  ? 'Enter your new password below'
                  : 'Nhập mật khẩu mới của bạn bên dưới'}
              </Text>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* New Password Input */}
                <View>
                  <Text style={styles.label}>
                    {language === 'en' ? 'New Password' : 'Mật khẩu mới'}
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={language === 'en' ? 'Enter new password' : 'Nhập mật khẩu mới'}
                      placeholderTextColor="#9CA3AF"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View>
                  <Text style={styles.label}>
                    {t('auth.confirmPassword')}
                  </Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder={t('auth.confirmPasswordPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <MaterialIcons
                        name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Password Requirements */}
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsText}>
                    {language === 'en' 
                      ? '• Password must be at least 6 characters'
                      : '• Mật khẩu phải có ít nhất 6 ký tự'}
                  </Text>
                  <Text style={styles.requirementsText}>
                    {language === 'en'
                      ? '• Both passwords must match'
                      : '• Cả hai mật khẩu phải khớp'}
                  </Text>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {language === 'en' ? 'Reset Password' : 'Đặt lại mật khẩu'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {language === 'en' 
              ? 'Remember your password?' 
              : 'Nhớ mật khẩu của bạn?'}
            {' '}
            <Text 
              style={styles.footerLink}
              onPress={() => navigation.navigate('Login')}
            >
              {t('auth.signIn')}
            </Text>
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};







