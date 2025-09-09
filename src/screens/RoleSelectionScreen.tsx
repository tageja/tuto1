import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, typography } from '../theme';
import { Backend } from '../services/backend';
import { getAuthSafe } from '../config/firebase';

const { width, height } = Dimensions.get('window');

interface RoleSelectionScreenProps {
  navigation: any;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { setUserType } = useUser();
  const [pending, setPending] = useState(false);

  const handleRoleSelection = async (role: 'parent' | 'student' | 'teacher') => {
    try {
      setPending(true);
      // Try server upsert first if we have a Firebase user (ID token is attached automatically)
      try {
        const uid = getAuthSafe().currentUser?.uid;
        if (uid) {
          await Backend.upsertUserRole(uid, role);
        }
      } catch (e) {
        // Safe fallback: proceed locally if backend not ready/auth not present
        console.warn('[ROLE] upsertUserRole failed or no auth, using local role only');
      }

      await setUserType(role);
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

              {/* Student Option */}
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => handleRoleSelection('student')}
                activeOpacity={0.8}
                disabled={pending}
              >
                <View style={styles.roleIconContainer}>
                  <MaterialIcons name="school" size={64} color={colors.primary} />
                </View>
                <Text style={styles.roleTitle}>{t('roleSelection.student')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('roleSelection.canChangeLater')}</Text>
        </View>
      </View>
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
}); 