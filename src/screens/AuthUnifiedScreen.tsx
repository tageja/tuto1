import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { supabase, signInWithEmail, signUpWithEmail, signInWithGoogle } from '../config/supabase';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

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
      backgroundColor: colors.background.primary,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.light,
      gap: 8,
    },
    languageText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.light,
    },
    languageActive: {
      color: '#0B5FFF',
    },
    languageSeparator: {
      fontSize: 14,
      color: colors.border.medium,
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
    card: {
      backgroundColor: colors.background.primary,
      padding: 24,
      borderRadius: 20,
    },
    tabContainer: {
      marginBottom: 24,
    },
    tabBackground: {
      backgroundColor: colors.background.tertiary,
      borderRadius: 12,
      padding: 4,
      height: 48,
      flexDirection: 'row',
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 40,
      borderRadius: 10,
      backgroundColor: 'transparent',
    },
    tabButtonActive: {
      backgroundColor: '#0B5FFF',
    },
    tabButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    tabButtonTextActive: {
      color: colors.background.primary,
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
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
    },
    picker: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    pickerText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    pickerArrow: {
      fontSize: 10,
      color: colors.text.secondary,
    },
    pickerOptions: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
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
      borderBottomColor: colors.background.tertiary,
    },
    pickerOptionText: {
      fontSize: 16,
      color: colors.text.primary,
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
      borderColor: colors.border.medium,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#0B5FFF',
      borderColor: '#0B5FFF',
    },
    checkmark: {
      color: colors.background.primary,
      fontSize: 12,
      fontWeight: 'bold',
    },
    checkboxLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    forgotPassword: {
      fontSize: 14,
      color: '#0B5FFF',
      fontWeight: '600',
    },
    primaryButton: {
      backgroundColor: '#0B5FFF',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#0B5FFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.background.primary,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border.light,
    },
    dividerText: {
      paddingHorizontal: 16,
      fontSize: 14,
      color: colors.text.light,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: 12,
      paddingVertical: 14,
      gap: 12,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    footerText: {
      fontSize: 12,
      color: colors.text.light,
      textAlign: 'center',
      lineHeight: 18,
      paddingHorizontal: 40,
      marginTop: 32,
    },
    debugButton: {
      marginHorizontal: 24,
      marginTop: 16,
      marginBottom: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    debugButtonText: {
      fontSize: 13,
      color: '#991B1B',
      textAlign: 'center',
      fontWeight: '600',
    },
  });
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
      console.log('📞 Getting session from Supabase...');
      const { data, error } = await supabase.auth.getSession();
      
      console.log('📦 Session response:', {
        hasSession: !!data?.session,
        hasError: !!error,
        userId: data?.session?.user?.id,
        userEmail: data?.session?.user?.email,
      });
      
      if (error) {
        console.error('❌ Session error:', error);
        throw error;
      }
      
      if (data.session) {
        console.log('✅ Supabase sign-in successful:', data.session.user.email);
        console.log('👤 User metadata:', data.session.user.user_metadata);
        
        // First, check if user already exists to get their existing role
        console.log('🔍 Checking for existing user profile...');
        const { data: existingProfile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', data.session.user.id)
          .single();
        
        console.log('📋 Existing profile:', existingProfile ? {
          id: existingProfile.id,
          role: existingProfile.role,
          email: existingProfile.email,
        } : 'None found');
        
        // Check if user is a school admin (mobile app specific check)
        console.log('🔍 Checking for school admin role in school_users...');
        const { data: schoolUserRole } = await supabase
          .from('school_users')
          .select('role, school_id')
          .eq('user_id', existingProfile?.id || data.session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        console.log('📋 School user role:', schoolUserRole ? {
          role: schoolUserRole.role,
          school_id: schoolUserRole.school_id,
        } : 'None found');
        
        // Priority: school_users.role (if admin) > users.role
        // For new users without existing profile, don't assign default role
        const userRole = schoolUserRole?.role || existingProfile?.role;
        console.log('👤 Final role determined:', userRole);
        
        // Create or update user profile in database
        console.log('💾 Creating/updating user profile in database...');
        const profileData = {
          auth_user_id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.full_name || existingProfile?.name || data.session.user.email?.split('@')[0] || 'User',
          ...(userRole && { role: userRole }), // Only set role if we have one
        };

        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .upsert(profileData, { onConflict: 'auth_user_id' })
          .select()
          .single();
        
        console.log('💾 Profile result:', {
          hasProfile: !!userProfile,
          hasError: !!profileError,
          profileId: userProfile?.id,
        });
        
        if (profileError) {
          console.warn('⚠️ Profile error (non-fatal):', profileError);
        }
        
        const finalRole = userProfile?.role || userRole;
        const userData = {
          id: userProfile?.id || data.session.user.id,
          name: userProfile?.name || data.session.user.email?.split('@')[0] || 'User',
          email: data.session.user.email || '',
          type: finalRole as UserType, // Will be null for new users without roles
        };
        
        console.log('👤 Setting user data:', userData);
        await setUserData(userData);
        
        console.log('🎉 Google auth successful, navigating to Welcome screen...');
        
        // After successful Google login, navigate to Welcome screen
        // Welcome screen will check school associations and route accordingly
        const navigationTarget = 'Welcome';
        
        console.log('🧭 Navigation: Navigating to Welcome screen');
        
        // Navigate directly without alert (clean UX)
        console.log(`🧭 Navigating to ${navigationTarget}...`);
        navigation.navigate(navigationTarget);
      } else {
        console.warn('⚠️ No session found after OAuth callback');
        Alert.alert(
          t('auth.loginError'),
          'No session found. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('❌ Google auth callback error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
      });
      Alert.alert(
        t('auth.loginError'), 
        error?.message || (t('auth.googleSignInFailed') || 'Google sign-in failed. Please try again.')
      );
    } finally {
      console.log('🏁 Callback complete, resetting loading state');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Prevent multiple simultaneous calls
    if (loading) {
      console.log('⚠️ Google sign-in already in progress, ignoring...');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Launching Google sign-in with Supabase...');
      
      // Use Supabase OAuth
      console.log('📞 Calling signInWithGoogle()...');
      const { data, error } = await signInWithGoogle();
      
      console.log('📦 Response from signInWithGoogle:', { 
        hasData: !!data, 
        hasUrl: !!data?.url, 
        hasError: !!error,
        errorMessage: error?.message 
      });
      
      if (error) {
        console.error('❌ Supabase OAuth error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('🌐 Opening browser with URL:', data.url.substring(0, 50) + '...');
        
        // Open browser for OAuth
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'tuto://auth/callback'
        );
        
        console.log('📱 Browser result:', result);
        
        if (result.type === 'success') {
          console.log('✅ Browser returned success, handling callback...');
          console.log('🔗 Callback URL:', result.url);
          
          // Parse the URL to extract tokens
          const url = result.url;
          const params = new URLSearchParams(url.split('#')[1]);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          
          console.log('🔑 Extracted tokens:', {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token,
          });
          
          if (access_token && refresh_token) {
            // Set the session with the tokens
            console.log('💾 Setting session with extracted tokens...');
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            
            console.log('📦 Set session result:', {
              hasSession: !!sessionData?.session,
              hasError: !!sessionError,
              userId: sessionData?.session?.user?.id,
            });
            
            if (sessionError) {
              console.error('❌ Session error:', sessionError);
              throw sessionError;
            }
            
            if (sessionData?.session) {
              await handleGoogleAuthCallback();
            } else {
              console.warn('⚠️ No session created from tokens');
              Alert.alert(
                t('auth.loginError'),
                'Failed to create session. Please try again.'
              );
            }
          } else {
            console.error('❌ Missing tokens in callback URL');
            Alert.alert(
              t('auth.loginError'),
              'Missing authentication tokens. Please try again.'
            );
          }
        } else if (result.type === 'cancel') {
          console.log('🚫 User cancelled Google sign-in');
        } else if (result.type === 'dismiss') {
          console.log('🚫 User dismissed Google sign-in');
        } else {
          console.log('⚠️ Unexpected browser result type:', result.type);
        }
      } else {
        console.warn('⚠️ No URL returned from Supabase OAuth');
        Alert.alert(
          t('auth.loginError'),
          'Failed to initialize Google sign-in. Please try again.'
        );
      }
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack?.substring(0, 200)
      });
      Alert.alert(
        t('auth.loginError'),
        error?.message || (language === 'en' 
          ? 'Google sign-in failed. Please try again.'
          : 'Đăng nhập Google thất bại. Vui lòng thử lại.')
      );
    } finally {
      console.log('🏁 Google sign-in flow complete, resetting loading state');
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
      
      // Block access until email is confirmed (Supabase may allow sign-in depending on project settings)
      const emailConfirmed = (user as { email_confirmed_at?: string | null }).email_confirmed_at != null;
      if (!emailConfirmed) {
        await supabase.auth.signOut();
        setLoading(false);
        Alert.alert(
          t('auth.loginError'),
          t('auth.checkEmailToConfirm'),
          [{ text: t('common.ok') }]
        );
        return;
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
      
      // Check if user is a school admin (mobile app specific check)
      console.log('🔍 Checking for school admin role in school_users...');
      const { data: schoolUserRole } = await supabase
        .from('school_users')
        .select('role, school_id')
        .eq('user_id', userProfile.data?.id || user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      console.log('📋 School user role:', schoolUserRole ? {
        role: schoolUserRole.role,
        school_id: schoolUserRole.school_id,
      } : 'None found');

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a822f593-e642-4290-8168-6f61447cf8e7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a8c1a9'},body:JSON.stringify({sessionId:'a8c1a9',location:'AuthUnifiedScreen.tsx:role-resolution',message:'Role resolution inputs',data:{email:normalizedEmail,usersTableRole:userProfile.data?.role,schoolUserAdminRow:schoolUserRole ? {role:schoolUserRole.role,school_id:schoolUserRole.school_id} : null},hypothesisId:'A-B-C-D',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      // Also check school_teachers to handle teacher accounts
      const userId = userProfile.data?.id || user.id;
      const { data: teacherRows } = await supabase
        .from('school_teachers')
        .select('id, email, status')
        .ilike('email', normalizedEmail)
        .limit(1);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a822f593-e642-4290-8168-6f61447cf8e7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a8c1a9'},body:JSON.stringify({sessionId:'a8c1a9',location:'AuthUnifiedScreen.tsx:teacher-lookup',message:'school_teachers lookup result',data:{email:normalizedEmail,teacherRows:teacherRows||[],hasTeacherRow:!!(teacherRows && teacherRows.length>0)},hypothesisId:'E',timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      const isTeacherInSchool = !!(teacherRows && teacherRows.length > 0);

      // Priority: school_teachers (teacher) > school_users.role (if admin) > users.role > 'parent'
      // If user is found in school_teachers, they should always get teacher role
      const finalRole = isTeacherInSchool ? 'teacher' : (schoolUserRole?.role || userProfile.data?.role || 'parent');
      console.log('👤 Final role determined:', finalRole);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a822f593-e642-4290-8168-6f61447cf8e7',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a8c1a9'},body:JSON.stringify({sessionId:'a8c1a9',location:'AuthUnifiedScreen.tsx:final-role',message:'Final role assigned',data:{email:normalizedEmail,finalRole,isTeacherInSchool,usersTableRole:userProfile.data?.role,schoolUserAdminRow:!!schoolUserRole},hypothesisId:'A-B-E',timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      
      // Set user data for app
      const userData = {
        id: userProfile.data?.id || user.id,
        name: userProfile.data?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        type: finalRole as 'parent' | 'student' | 'teacher' | 'admin',
      };
      
      await setUserData(userData);
      
      // After successful login, always navigate to Welcome screen
      // Welcome screen will check school associations and route accordingly
      const navigationTarget = 'Welcome';
      
      console.log('🧭 Navigation decision: Navigating to Welcome screen');
      
      // Navigate to Welcome screen (no alert, just navigate)
      console.log(`🧭 Navigating to ${navigationTarget}...`);
      navigation.navigate(navigationTarget);
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
      
      // When "Confirm email" is enabled, Supabase sends the email but may still return a session
      // or set email_confirmed_at in the client response. To guarantee the confirm step is shown,
      // we always treat new sign-ups as "confirm required": create profile, sign out, show message.
      // User will sign in after clicking the confirmation link.
      await supabase.from('users').insert({
        auth_user_id: user.id,
        email: normalizedEmail,
        name: registerName,
        role: selectedRole,
      }).then(() => {}).catch(() => {}); // ignore duplicate/errors
      await supabase.auth.signOut();
      Alert.alert(
        t('auth.registerSuccess'),
        t('auth.checkEmailToConfirm'),
        [{ text: t('common.ok') }]
      );
      return;
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.background}>
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

          {/* White Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Segmented Control Tabs */}
              <View style={styles.tabContainer}>
                <View style={styles.tabBackground}>
                  <TouchableOpacity
                    style={[
                      styles.tabButton,
                      activeTab === 'signin' && styles.tabButtonActive,
                    ]}
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
                    style={[
                      styles.tabButton,
                      activeTab === 'register' && styles.tabButtonActive,
                    ]}
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
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          {t('auth.signIn')}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>{t('auth.or')}</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity 
                      style={[styles.googleButton, loading && styles.buttonDisabled]} 
                      disabled={loading}
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
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.primaryButtonText}>
                          {t('auth.createAccount')}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>{t('auth.or')}</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity 
                      style={[styles.googleButton, loading && styles.buttonDisabled]} 
                      disabled={loading}
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
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {language === 'en'
              ? 'By continuing, you agree to our Terms of Service and Privacy Policy'
              : 'Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi'}
          </Text>

          {/* Debug: Clear Session Button - only shown in development */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.debugButton}
              onPress={async () => {
                try {
                  console.log('🧹 Clearing all sessions...');
                  await supabase.auth.signOut();
                  await setUserData(null);
                  Alert.alert('✅ Success', 'Session cleared! You can now try Google sign-in.');
                  console.log('✅ All sessions cleared');
                } catch (error) {
                  console.error('Error clearing session:', error);
                  Alert.alert('Error', 'Failed to clear session');
                }
              }}
            >
              <Text style={styles.debugButtonText}>
                🧹 Clear Session (Debug)
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
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


export default AuthUnifiedScreen;
