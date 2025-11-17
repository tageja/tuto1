import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLanguage } from './LanguageContext';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onComplete?: () => void;
}

type TabType = 'signin' | 'register';
type RoleType = 'parent' | 'student' | 'teacher' | 'admin';

interface Role {
  value: RoleType;
  label: string;
}

export default function LoginScreen({ onComplete }: LoginScreenProps) {
  const { t, language, toggleLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<RoleType | ''>('');
  const [showRolePicker, setShowRolePicker] = useState<boolean>(false);
  
  // Form states
  const [signInEmail, setSignInEmail] = useState<string>('');
  const [signInPassword, setSignInPassword] = useState<string>('');
  const [registerName, setRegisterName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabChange = (tab: TabType) => {
    Animated.spring(slideAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 8,
    }).start();
    setActiveTab(tab);
  };

  const handleSubmit = () => {
    // Validate and submit
    if (onComplete) {
      onComplete();
    }
  };

  const roles: Role[] = [
    { value: 'parent', label: t('Parent', 'Phụ huynh') },
    { value: 'student', label: t('Student', 'Học sinh') },
    { value: 'teacher', label: t('Teacher', 'Giáo viên') },
    { value: 'admin', label: t('School Admin', 'Quản trị trường') },
  ];

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.5 - 48],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#F9FAFC', '#E8EEFF', '#F9FAFC']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo and Language Toggle */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#0B5FFF', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>Tuto</Text>
            </LinearGradient>
            
            <TouchableOpacity 
              style={styles.languageToggle}
              onPress={toggleLanguage}
            >
              <Text style={styles.languageText}>
                {language === 'en' ? '🇻🇳 VI' : '🇺🇸 EN'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Hero Image */}
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1589395937658-0557e7d89fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(249, 250, 252, 0)', 'rgba(249, 250, 252, 1)']}
              style={styles.heroGradientOverlay}
            />
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              {t(
                'Connect Teachers, Parents & Schools',
                'Kết nối Giáo viên, Phụ huynh & Trường học'
              )}
            </Text>
            <Text style={styles.heroSubtitle}>
              {t(
                'Join thousands of educators and learners',
                'Tham gia cùng hàng nghìn nhà giáo dục'
              )}
            </Text>
          </View>

          {/* Glass Card */}
          <View style={styles.cardContainer}>
            <BlurView intensity={20} tint="light" style={styles.blurCard}>
              <View style={styles.card}>
                {/* Custom Tabs */}
                <View style={styles.tabContainer}>
                  <View style={styles.tabBackground}>
                    <Animated.View
                      style={[
                        styles.tabIndicator,
                        { transform: [{ translateX }] },
                      ]}
                    >
                      <LinearGradient
                        colors={['#0B5FFF', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.tabIndicatorGradient}
                      />
                    </Animated.View>
                  </View>
                  
                  <View style={styles.tabButtons}>
                    <TouchableOpacity
                      style={styles.tabButton}
                      onPress={() => handleTabChange('signin')}
                    >
                      <Text
                        style={[
                          styles.tabButtonText,
                          activeTab === 'signin' && styles.tabButtonTextActive,
                        ]}
                      >
                        {t('Sign In', 'Đăng nhập')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.tabButton}
                      onPress={() => handleTabChange('register')}
                    >
                      <Text
                        style={[
                          styles.tabButtonText,
                          activeTab === 'register' && styles.tabButtonTextActive,
                        ]}
                      >
                        {t('Create Account', 'Tạo tài khoản')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Sign In Form */}
                {activeTab === 'signin' && (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('Email', 'Email')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={t('you@example.com', 'you@example.com')}
                        placeholderTextColor="#9CA3AF"
                        value={signInEmail}
                        onChangeText={setSignInEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t('Password', 'Mật khẩu')}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={signInPassword}
                        onChangeText={setSignInPassword}
                        secureTextEntry
                        autoComplete="password"
                      />
                    </View>

                    <View style={styles.rememberContainer}>
                      <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            rememberMe && styles.checkboxChecked,
                          ]}
                        >
                          {rememberMe && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>
                          {t('Remember me', 'Ghi nhớ đăng nhập')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text style={styles.forgotPassword}>
                          {t('Forgot password?', 'Quên mật khẩu?')}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={handleSubmit}
                    >
                      <LinearGradient
                        colors={['#0B5FFF', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.primaryButtonText}>
                          {t('Sign In', 'Đăng nhập')}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>
                        {t('or', 'hoặc')}
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton}>
                      <GoogleIcon />
                      <Text style={styles.googleButtonText}>
                        {t('Continue with Google', 'Tiếp tục với Google')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t('Full Name', 'Họ và tên')}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder={t('Nguyen Van A', 'Nguyễn Văn A')}
                        placeholderTextColor="#9CA3AF"
                        value={registerName}
                        onChangeText={setRegisterName}
                        autoComplete="name"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('Email', 'Email')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={t('you@example.com', 'you@example.com')}
                        placeholderTextColor="#9CA3AF"
                        value={registerEmail}
                        onChangeText={setRegisterEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t('Password', 'Mật khẩu')}
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={registerPassword}
                        onChangeText={setRegisterPassword}
                        secureTextEntry
                        autoComplete="password-new"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        {t('I am a...', 'Tôi là...')}
                      </Text>
                      <TouchableOpacity
                        style={styles.picker}
                        onPress={() => setShowRolePicker(!showRolePicker)}
                      >
                        <Text
                          style={[
                            styles.pickerText,
                            !selectedRole && styles.pickerPlaceholder,
                          ]}
                        >
                          {selectedRole
                            ? roles.find((r) => r.value === selectedRole)?.label
                            : t('Select role', 'Chọn vai trò')}
                        </Text>
                        <Text style={styles.pickerArrow}>▼</Text>
                      </TouchableOpacity>
                      {showRolePicker && (
                        <View style={styles.pickerOptions}>
                          {roles.map((role) => (
                            <TouchableOpacity
                              key={role.value}
                              style={styles.pickerOption}
                              onPress={() => {
                                setSelectedRole(role.value);
                                setShowRolePicker(false);
                              }}
                            >
                              <Text style={styles.pickerOptionText}>
                                {role.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={handleSubmit}
                    >
                      <LinearGradient
                        colors={['#0B5FFF', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.primaryButtonText}>
                          {t('Create Account', 'Tạo tài khoản')}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>
                        {t('or', 'hoặc')}
                      </Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton}>
                      <GoogleIcon />
                      <Text style={styles.googleButtonText}>
                        {t('Continue with Google', 'Tiếp tục với Google')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </BlurView>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {t(
              'By continuing, you agree to our Terms of Service and Privacy Policy',
              'Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi'
            )}
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// Google Icon Component
function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <Image
        source={{
          uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNMjIuNTYgMTIuMjVjMC0uNzgtLjA3LTEuNTMtLjItMi4yNUgxMnY0LjI2aDUuOTJjLS4yNiAxLjM3LTEuMDQgMi41My0yLjIxIDMuMzF2Mi43N2gzLjU3YzIuMDgtMS45MiAzLjI4LTQuNzQgMy4yOC04LjA5eiIvPjxwYXRoIGZpbGw9IiMzNEE4NTMiIGQ9Ik0xMiAyM2MyLjk3IDAgNS40Ni0uOTggNy4yOC0yLjY2bC0zLjU3LTIuNzdjLS45OC42Ni0yLjIzIDEuMDYtMy43MSAxLjA2LTIuODYgMC01LjI5LTEuOTMtNi4xNi00LjUzSDIuMTh2Mi44NEM0IDIwLjUzIDcuNyAyMyAxMiAyM3oiLz48cGF0aCBmaWxsPSIjRkJCQzA1IiBkPSJNNS44NCAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdIMi4xOEMxLjQzIDguNTUgMSAxMC4yMiAxIDEyczLjQzIDMuNDUgMS4xOCA0LjkzbDIuODUtMi4yMi44MS0uNjJ6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTEyIDUuMzhjMS42MiAwIDMuMDYuNTYgNC4yMSAxLjY0bDMuMTUtMy4xNUMxNy40NSAyLjA5IDE0Ljk3IDEgMTIgMSA3LjcgMSAzLjk5IDMuNDcgMi4xOCA3LjA3bDMuNjYgMi44NGMuODctMi42IDMuMy00LjUzIDYuMTYtNC41M3oiLz48L3N2Zz4=',
        }}
        style={{ width: 20, height: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  logoGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  languageToggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  heroContainer: {
    width: width - 48,
    height: 200,
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  heroTextContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardContainer: {
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#0B5FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  tabBackground: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    height: 48,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: width * 0.5 - 48,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabIndicatorGradient: {
    flex: 1,
    shadowColor: '#0B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButtons: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    zIndex: 10,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#1F2937',
  },
  pickerPlaceholder: {
    color: '#9CA3AF',
  },
  pickerArrow: {
    fontSize: 10,
    color: '#6B7280',
  },
  pickerOptions: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0B5FFF',
    borderColor: '#0B5FFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#0B5FFF',
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#0B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 40,
    marginTop: 24,
  },
});
