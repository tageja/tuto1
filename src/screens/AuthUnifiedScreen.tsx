import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { supabase, signInWithEmail, signUpWithEmail, signInWithGoogle } from '../config/supabase';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

interface AuthUnifiedScreenProps {
  navigation: any;
  route?: { params?: { mode?: 'login' | 'register' } };
}

type TabType = 'signin' | 'register';
type RoleType = 'parent' | 'student' | 'teacher' | 'admin';

interface Role {
  value: RoleType;
  label: string;
  labelVi: string;
}

export const AuthUnifiedScreen: React.FC<AuthUnifiedScreenProps> = ({ navigation, route }) => {
  const { t, language, setLanguage } = useLanguage();
  const { setUserData } = useUser();
  
  const [activeTab, setActiveTab] = useState<TabType>(
    route?.params?.mode === 'register' ? 'register' : 'signin'
  );
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>('parent');
  const [showRolePicker, setShowRolePicker] = useState(false);

  // Form states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Debug: Log Supabase configuration on mount
  useEffect(() => {
    console.log('\n🔍 Supabase Auth Configuration:');
    console.log('═══════════════════════════════════════════');
    console.log('Supabase URL:', Constants.expoConfig?.extra?.supabaseUrl ? 'Configured ✅' : 'Missing ❌');
    console.log('Supabase Anon Key:', Constants.expoConfig?.extra?.supabaseAnonKey ? 'Configured ✅' : 'Missing ❌');
    console.log('App Scheme:', Constants.expoConfig?.scheme);
    console.log('═══════════════════════════════════════════\n');
  }, []);

  const roles: Role[] = [
    { value: 'parent', label: 'Parent', labelVi: 'Phụ huynh' },
    { value: 'student', label: 'Student', labelVi: 'Học sinh' },
    { value: 'teacher', label: 'Teacher', labelVi: 'Giáo viên' },
    { value: 'admin', label: 'School Admin', labelVi: 'Quản trị trường' },
  ];

  const handleTabChange = (tab: TabType) => {
    Animated.spring(slideAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      useNativeDriver: true,
      speed: 14,
      bounciness: 8,
    }).start();
    setActiveTab(tab);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const handleGoogleAuthCallback = async () => {
    setLoading(true);
    try {
      console.log('🔐 Google auth callback - signing in to Supabase...');
      
      // Supabase handles the OAuth flow automatically
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        console.log('✅ Supabase sign-in successful:', data.session.user.email);
        
        // Create or update user profile in database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .upsert({
            auth_user_id: data.session.user.id,
            email: data.session.user.email!,
            name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'User',
            role: selectedRole,
          }, { onConflict: 'auth_user_id' })
          .select()
          .single();
        
        const userData = {
          id: userProfile?.id || data.session.user.id,
          name: userProfile?.name || data.session.user.email?.split('@')[0] || 'User',
          email: data.session.user.email || '',
          type: (userProfile?.role || selectedRole) as 'parent' | 'student' | 'teacher',
        };
        
        await setUserData(userData);
        
        Alert.alert(
          t('auth.loginSuccess'),
          `${t('auth.welcomeBack')} ${userData.name}`,
          [{ text: t('common.ok'), onPress: () => navigation.navigate('RoleSelection') }]
        );
      }
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      Alert.alert(
        t('auth.loginError'), 
        t('auth.googleSignInFailed') || 'Google sign-in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('🚀 Launching Google sign-in with Supabase...');
      setLoading(true);
      
      // Use Supabase OAuth
      const { data, error } = await signInWithGoogle();
      
      if (error) throw error;
      
      if (data?.url) {
        // Open browser for OAuth
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'tuto://auth/callback'
        );
        
        if (result.type === 'success') {
          await handleGoogleAuthCallback();
        }
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      Alert.alert(
        t('auth.loginError'),
        language === 'en' 
          ? 'Google sign-in is being configured. Please use email/password for now.'
          : 'Đang cấu hình Google sign-in. Vui lòng dùng email/mật khẩu.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      Alert.alert(t('auth.loginError'), t('auth.pleaseEnterEmailPassword'));
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = signInEmail.toLowerCase().trim();
      
      console.log('🔐 Signing in with Supabase...');
      
      // Sign in with Supabase
      const { user, session } = await signInWithEmail(normalizedEmail, signInPassword);
      
      if (!user) {
        throw new Error('No user returned');
      }
      
      console.log('✅ Supabase sign-in successful:', user.email);
      
      // Fetch or create user profile
      let userProfile = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      // If no profile exists, create one
      if (userProfile.error || !userProfile.data) {
        const { data: newProfile } = await supabase
          .from('users')
          .insert({
            auth_user_id: user.id,
            email: normalizedEmail,
            name: user.user_metadata?.full_name || normalizedEmail.split('@')[0],
            role: 'parent',
          })
          .select()
          .single();
        
        userProfile = { data: newProfile, error: null };
      }
      
      // Set user data for app
      const userData = {
        id: userProfile.data?.id || user.id,
        name: userProfile.data?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        type: (userProfile.data?.role || 'parent') as 'parent' | 'student' | 'teacher',
      };
      
      await setUserData(userData);
      
      // Navigate to RoleSelection, then Home
      Alert.alert(
        t('auth.loginSuccess'),
        `${t('auth.welcomeBack')} ${userData.name}`,
        [{ text: t('common.ok'), onPress: () => navigation.navigate('RoleSelection') }]
      );
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle specific Supabase auth errors
      let errorMessage = t('auth.invalidCredentials');
      const message = error?.message || '';
      
      if (message.includes('Invalid login credentials') || message.includes('Email not confirmed')) {
        errorMessage = t('auth.invalidCredentials');
      } else if (message.includes('User not found')) {
        errorMessage = t('auth.userNotFound') || 'No account found with this email';
      } else if (message.includes('Email')) {
        errorMessage = t('auth.invalidEmail');
      }
      
      Alert.alert(t('auth.loginError'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName || !registerEmail || !registerPassword) {
      Alert.alert(t('auth.registerError'), t('auth.pleaseEnterAllFields'));
      return;
    }

    if (registerPassword.length < 6) {
      Alert.alert(t('auth.registerError'), t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = registerEmail.toLowerCase().trim();
      
      console.log('🔐 Creating account with Supabase...');
      
      // Create Supabase account
      const { user, session } = await signUpWithEmail(normalizedEmail, registerPassword, {
        full_name: registerName,
        role: selectedRole,
      });
      
      if (!user) {
        throw new Error('No user returned from signup');
      }
      
      console.log('✅ Supabase account created:', user.email);
      
      // Create user profile in database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          auth_user_id: user.id,
          email: normalizedEmail,
          name: registerName,
          role: selectedRole,
        })
        .select()
        .single();
      
      if (profileError) {
        console.warn('Profile creation warning:', profileError.message);
      }
      
      // Set user data with selected role
      const userData = {
        id: userProfile?.id || user.id,
        name: registerName,
        email: normalizedEmail,
        type: selectedRole as 'parent' | 'student' | 'teacher',
      };
      
      await setUserData(userData);
      
      Alert.alert(
        t('auth.registerSuccess'),
        t('auth.accountCreated'),
        [{ 
          text: t('common.ok'), 
          onPress: () => navigation.navigate('RoleSelection')
        }]
      );
    } catch (error: any) {
      console.error('Register error:', error);
      
      let errorMessage = t('auth.registrationFailed');
      const message = error?.message || '';
      
      if (message.includes('already registered') || message.includes('already exists')) {
        errorMessage = t('auth.emailAlreadyExists');
      } else if (message.includes('invalid email')) {
        errorMessage = t('auth.invalidEmail');
      } else if (message.includes('weak password') || message.includes('at least 6 characters')) {
        errorMessage = t('auth.weakPassword');
      }
      
      Alert.alert(t('auth.registerError'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (width - 96) * 0.5],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#F9FAFC', '#FFFFFF', '#F9FAFC']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo and Language Toggle */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/tuto-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.languageToggle}>
              <TouchableOpacity onPress={toggleLanguage}>
                <Text style={[styles.languageText, language === 'en' && styles.languageActive]}>
                  EN
                </Text>
              </TouchableOpacity>
              <Text style={styles.languageSeparator}>|</Text>
              <TouchableOpacity onPress={toggleLanguage}>
                <Text style={[styles.languageText, language === 'vi' && styles.languageActive]}>
                  VI
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Glass Card */}
          <View style={styles.cardContainer}>
            <BlurView intensity={10} tint="light" style={styles.blurCard}>
              <View style={styles.card}>
                {/* Custom Tabs - Fixed positioning */}
                <View style={styles.tabContainer}>
                  <View style={styles.tabBackground}>
                    <Animated.View
                      style={[
                        styles.tabIndicator,
                        { transform: [{ translateX }] },
                      ]}
                    />
                    
                    {/* Tab buttons on top of indicator */}
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
                          {t('auth.signIn')}
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
                          {t('auth.createAccount')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Sign In Form */}
                {activeTab === 'signin' && (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.email')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={t('auth.emailPlaceholder')}
                        placeholderTextColor="#9CA3AF"
                        value={signInEmail}
                        onChangeText={setSignInEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.password')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={signInPassword}
                        onChangeText={setSignInPassword}
                        secureTextEntry
                        autoComplete="password"
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.rememberContainer}>
                      <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setRememberMe(!rememberMe)}
                        disabled={loading}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            rememberMe && styles.checkboxChecked,
                          ]}
                        >
                          {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.checkboxLabel}>
                          {t('auth.rememberMe')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        disabled={loading}
                      >
                        <Text style={styles.forgotPassword}>
                          {t('auth.forgotPassword')}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, loading && styles.buttonDisabled]}
                      onPress={handleSignIn}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={['#0B5FFF', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.primaryButtonText}>
                            {t('auth.signIn')}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>{t('auth.or')}</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity 
                      style={styles.googleButton} 
                      disabled={loading || !request}
                      onPress={handleGoogleSignIn}
                    >
                      <GoogleIcon />
                      <Text style={styles.googleButtonText}>
                        {t('auth.continueWithGoogle')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Register Form */}
                {activeTab === 'register' && (
                  <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.fullName')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={
                          language === 'en' ? 'Nguyen Van A' : 'Nguyễn Văn A'
                        }
                        placeholderTextColor="#9CA3AF"
                        value={registerName}
                        onChangeText={setRegisterName}
                        autoComplete="name"
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.email')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder={t('auth.emailPlaceholder')}
                        placeholderTextColor="#9CA3AF"
                        value={registerEmail}
                        onChangeText={setRegisterEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.password')}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#9CA3AF"
                        value={registerPassword}
                        onChangeText={setRegisterPassword}
                        secureTextEntry
                        autoComplete="password-new"
                        editable={!loading}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>{t('auth.iAmA')}</Text>
                      <TouchableOpacity
                        style={styles.picker}
                        onPress={() => setShowRolePicker(!showRolePicker)}
                        disabled={loading}
                      >
                        <Text style={styles.pickerText}>
                          {language === 'en'
                            ? roles.find((r) => r.value === selectedRole)?.label
                            : roles.find((r) => r.value === selectedRole)?.labelVi}
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
                                {language === 'en' ? role.label : role.labelVi}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[styles.primaryButton, loading && styles.buttonDisabled]}
                      onPress={handleRegister}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={['#0B5FFF', '#6366F1']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        {loading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.primaryButtonText}>
                            {t('auth.createAccount')}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>{t('auth.or')}</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity 
                      style={styles.googleButton} 
                      disabled={loading || !request}
                      onPress={handleGoogleSignIn}
                    >
                      <GoogleIcon />
                      <Text style={styles.googleButtonText}>
                        {t('auth.continueWithGoogle')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </BlurView>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {language === 'en'
              ? 'By continuing, you agree to our Terms of Service and Privacy Policy'
              : 'Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi'}
          </Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Google Icon Component
function GoogleIcon() {
  return (
    <View style={{ width: 20, height: 20 }}>
      <Image
        source={{
          uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjNDI4NUY0IiBkPSJNMjIuNTYgMTIuMjVjMC0uNzgtLjA3LTEuNTMtLjItMi4yNUgxMnY0LjI2aDUuOTJjLS4yNiAxLjM3LTEuMDQgMi41My0yLjIxIDMuMzF2Mi43N2gzLjU3YzIuMDgtMS45MiAzLjI4LTQuNzQgMy4yOC04LjA5eiIvPjxwYXRoIGZpbGw9IiMzNEE4NTMiIGQ9Ik0xMiAyM2MyLjk3IDAgNS40Ni0uOTggNy4yOC0yLjY2bC0zLjU3LTIuNzdjLS45OC42Ni0yLjIzIDEuMDYtMy43MSAxLjA2LTIuODYgMC01LjI5LTEuOTMtNi4xNi00LjUzSDIuMTh2Mi44NEM0IDIwLjUzIDcuNyAyMyAxMiAyM3oiLz48cGF0aCBmaWxsPSIjRkJCQzA1IiBkPSJNNS44NCAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdIMi4xOEMxLjQzIDguNTUgMSAxMC4yMiAxIDEyczMuNDMgMy40NSAxLjE4IDQuOTNsMi44NS0yLjIyLjgxLS42MnoiLz48cGF0aCBmaWxsPSIjRUE0MzM1IiBkPSJNMTIgNS4zOGMxLjYyIDAgMy4wNi41NiA0LjIxIDEuNjRsMy4xNS0zLjE1QzE3LjQ1IDIuMDkgMTQuOTcgMSAxMiAxIDcuNyAxIDMuOTkgMy40NyAyLjE4IDcuMDdsMy42NiAyLjg0Yy44Ny0yLjYgMy4zLTQuNTMgNi4xNi00LjUzeiIvPjwvc3ZnPg==',
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 50,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  languageActive: {
    color: '#0B5FFF',
  },
  languageSeparator: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  cardContainer: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  blurCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  tabContainer: {
    marginBottom: 24,
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
    width: (width - 96) * 0.5,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0B5FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtons: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#1F2937',
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
  buttonDisabled: {
    opacity: 0.6,
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
    marginVertical: 4,
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
    marginTop: 32,
  },
});

export default AuthUnifiedScreen;
