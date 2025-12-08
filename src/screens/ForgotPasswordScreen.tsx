import React, { useState } from 'react';
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
import { useLanguage } from '../contexts/LanguageContext';
import { resetPassword } from '../config/supabase';

interface ForgotPasswordScreenProps {
  navigation: any;
  route: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation, route }) => {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        t('auth.loginError'),
        language === 'en' 
          ? 'Please enter your email address' 
          : 'Vui lòng nhập địa chỉ email của bạn'
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        t('auth.loginError'),
        t('auth.invalidEmail')
      );
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      console.log('📧 Sending password reset email to:', normalizedEmail);
      
      await resetPassword(normalizedEmail);
      
      console.log('✅ Password reset email sent successfully');
      setEmailSent(true);
      
      Alert.alert(
        language === 'en' ? 'Email Sent' : 'Đã gửi Email',
        language === 'en' 
          ? `A password reset link has been sent to ${normalizedEmail}. Please check your inbox.`
          : `Liên kết đặt lại mật khẩu đã được gửi đến ${normalizedEmail}. Vui lòng kiểm tra hộp thư của bạn.`,
        [{ 
          text: t('common.ok'), 
          onPress: () => navigation.goBack()
        }]
      );
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      Alert.alert(
        t('auth.loginError'),
        language === 'en'
          ? 'Failed to send reset email. Please try again.'
          : 'Không thể gửi email đặt lại. Vui lòng thử lại.'
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
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <MaterialIcons name="arrow-back" size={24} color="#6B7280" />
                <Text style={styles.backButtonText}>
                  {language === 'en' ? 'Back to Login' : 'Quay lại Đăng nhập'}
                </Text>
              </TouchableOpacity>

              {/* Title */}
              <Text style={styles.title}>
                {t('auth.forgotPassword')}
              </Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                {language === 'en'
                  ? 'Enter your email address and we\'ll send you a link to reset your password'
                  : 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu'}
              </Text>

              {/* Email Input */}
              <View style={styles.formContainer}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />

                {/* Send Reset Link Button */}
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      {language === 'en' ? 'Send Reset Link' : 'Gửi liên kết đặt lại'}
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
              onPress={() => navigation.goBack()}
            >
              {t('auth.signIn')}
            </Text>
          </Text>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#F9FAFC',
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
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  footerLink: {
    color: '#0B5FFF',
    fontWeight: '600',
  },
}); 