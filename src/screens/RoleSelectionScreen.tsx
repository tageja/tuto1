import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import { validateSchoolCode } from '../services/schoolCode';
import { colors, spacing, typography } from '../theme';
import { Backend } from '../services/backend';
import { getAuthSafe } from '../config/firebase';

const { width, height } = Dimensions.get('window');

interface RoleSelectionScreenProps {
  navigation: any;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation }) => {
  const { t, language } = useLanguage();
  const { setUserType } = useUser();
  const { joinSchool } = useSchool();
  const [pending, setPending] = useState(false);
  const [schoolCodeModal, setSchoolCodeModal] = useState<{
    visible: boolean;
    role: 'admin' | 'teacher' | null;
  }>({ visible: false, role: null });
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolCodeLoading, setSchoolCodeLoading] = useState(false);

  const handleRoleSelection = async (role: 'parent' | 'admin' | 'teacher') => {
    if (role === 'parent') {
      // Parent goes directly to home (no school code needed)
      await setRoleAndNavigate(role);
    } else if (role === 'admin' || role === 'teacher') {
      // Admin and Teacher need school code
      setSchoolCodeModal({ visible: true, role });
    }
  };

  const handleSchoolCodeSubmit = async () => {
    if (!schoolCode.trim()) {
      Alert.alert(
        language === 'en' ? 'School Code Required' : 'Cần mã trường học',
        language === 'en' ? 'Please enter a school code' : 'Vui lòng nhập mã trường học'
      );
      return;
    }

    setSchoolCodeLoading(true);
    try {
      if (schoolCodeModal.role === 'admin') {
        // Use new RPC validation for admins
        const result = await validateSchoolCode(schoolCode.trim());
        
        if (result.success) {
           const role = schoolCodeModal.role!;
           // Optionally refresh user context if needed, but setRoleAndNavigate handles the local state
           await setRoleAndNavigate(role);
        } else {
           Alert.alert(
            language === 'en' ? 'Invalid School Code' : 'Mã trường học không hợp lệ',
            result.message || (language === 'en' ? 'Please check your school code.' : 'Vui lòng kiểm tra mã trường học.')
          );
        }
      } else {
        // Keep existing logic for teachers (or others) using joinSchool
        const success = await joinSchool(schoolCode.trim().toUpperCase());

        if (success) {
          // School join successful, now set the role
          const role = schoolCodeModal.role!;
          await setRoleAndNavigate(role);
        } else {
          Alert.alert(
            language === 'en' ? 'Invalid School Code' : 'Mã trường học không hợp lệ',
            language === 'en' ? 'Please check your school code and try again' : 'Vui lòng kiểm tra mã trường học và thử lại'
          );
        }
      }
    } catch (error) {
      console.error('School code validation error:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Lỗi',
        language === 'en' ? 'Failed to validate school code. Please try again.' : 'Không thể xác thực mã trường học. Vui lòng thử lại.'
      );
    } finally {
      setSchoolCodeLoading(false);
    }
  };

  const setRoleAndNavigate = async (role: 'parent' | 'admin' | 'teacher') => {
    try {
      setPending(true);

      // Get current user info
      const { supabase } = await import('../config/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Update database profile with selected role
        const { error } = await supabase
          .from('users')
          .update({ role })
          .eq('auth_user_id', session.user.id);

        if (error) {
          console.warn('Failed to update user role in database:', error);
        }

        // Set complete user data
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          type: role,
        };

        await setUserData(userData);
      } else {
        // Fallback to just setting the type locally
        await setUserType(role);
      }

      navigation.replace('Home');
    } catch (error) {
      console.error('Error setting user role:', error);
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/tuto-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('roleSelection.whoIsUsing')}</Text>
          <Text style={styles.subtitle}>{t('roleSelection.chooseRole')}</Text>
        </View>

        {/* Role Options */}
        <View style={styles.roleContainer}>
          {pending ? (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* Parent Option */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('parent')}
                activeOpacity={0.8}
                disabled={pending}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons name="family-restroom" size={64} color={colors.primary} />
                </View>
                <Text style={styles.roleTitle}>{t('roleSelection.parent')}</Text>
              </TouchableOpacity>

              {/* School Admin Option */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('admin')}
                activeOpacity={0.8}
                disabled={pending}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons name="admin-panel-settings" size={64} color={colors.primary} />
                </View>
                <Text style={styles.roleTitle}>{t('roleSelection.schoolAdmin')}</Text>
              </TouchableOpacity>

              {/* Teacher Option */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('teacher')}
                activeOpacity={0.8}
                disabled={pending}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons name="school" size={64} color={colors.primary} />
                </View>
                <Text style={styles.roleTitle}>{t('roleSelection.teacher')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('roleSelection.canChangeLater')}</Text>
        </View>
      </View>

      {/* School Code Modal */}
      <Modal
        visible={schoolCodeModal.visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSchoolCodeModal({ visible: false, role: null })}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSchoolCodeModal({ visible: false, role: null })}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {language === 'en' ? 'Enter School Code' : 'Nhập mã trường học'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Content */}
            <View style={styles.modalBody}>
              <MaterialIcons name="school" size={64} color={colors.primary} style={styles.schoolIcon} />

              <Text style={styles.modalSubtitle}>
                {language === 'en'
                  ? `To continue as a ${schoolCodeModal.role === 'admin' ? 'School Admin' : 'Teacher'}, please enter your school invitation code.`
                  : `Để tiếp tục với vai trò ${schoolCodeModal.role === 'admin' ? 'Quản trị viên trường' : 'Giáo viên'}, vui lòng nhập mã mời của trường học.`}
              </Text>

              <View style={styles.inputContainer}>
                <MaterialIcons name="vpn-key" size={24} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder={language === 'en' ? 'Enter school code' : 'Nhập mã trường học'}
                  value={schoolCode}
                  onChangeText={setSchoolCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  editable={!schoolCodeLoading}
                  maxLength={10}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, schoolCodeLoading && styles.disabledButton]}
                onPress={handleSchoolCodeSubmit}
                disabled={schoolCodeLoading}
              >
                {schoolCodeLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {language === 'en' ? 'Continue' : 'Tiếp tục'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSchoolCodeModal({ visible: false, role: null })}
                disabled={schoolCodeLoading}
              >
                <Text style={styles.cancelButtonText}>
                  {language === 'en' ? 'Cancel' : 'Hủy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  logo: {
    height: 40,
    width: 120,
    marginBottom: spacing.xl,
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
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal * typography.fontSize.md,
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  roleIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  roleTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalBody: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  schoolIcon: {
    marginBottom: spacing.lg,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    width: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
}); 