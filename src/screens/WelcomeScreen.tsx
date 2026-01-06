import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserSchoolAssociations, SchoolAssociation } from '../services/school.service';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { userData, setUserData } = useUser();
  const { setCurrentSchool, setIsSchoolMode } = useSchool();
  
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<SchoolAssociation[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Get the email directly from userData object
  const userEmail = userData?.email;

  useEffect(() => {
    console.log('🔄 WelcomeScreen useEffect triggered, userEmail:', userEmail);
    
    const loadSchoolAssociations = async () => {
      if (!userEmail) {
        console.log('❌ No user email found, waiting for user context...');
        // Don't set loading to false yet - keep showing loading state
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Checking school associations for:', userEmail);
        const associations = await getUserSchoolAssociations(userEmail);
        console.log('📚 School associations found:', associations.length, associations);
        setSchools(associations);
      } catch (err) {
        console.error('❌ Error loading schools:', err);
        setError('Failed to load schools');
      } finally {
        setLoading(false);
      }
    };
    
    loadSchoolAssociations();
  }, [userEmail]); // Re-run when userEmail changes

  const handleGoToSchoolDashboard = () => {
    if (schools.length === 0) {
      Alert.alert(t('common.error'), t('welcome.noSchoolsFound'));
      return;
    }

    if (schools.length === 1) {
      // Single school - navigate directly
      const school = schools[0];
      setCurrentSchool({
        id: school.school_id,
        name: school.school_name,
        code: '',
        address: '',
        phone: '',
        email: '',
        principalName: '',
        principalEmail: '',
        principalPhone: '',
        schoolType: 'Public',
        gradeLevels: [],
        studentCount: 0,
        teacherCount: 0,
        foundedYear: new Date().getFullYear(),
        status: 'active',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      });
      setIsSchoolMode(true);
      
      // Set user role based on school association
      if (userData) {
        setUserData({
          ...userData,
          type: school.role === 'admin' ? 'admin' : 'parent',
        });
      }
      
      navigation.replace('SchoolDashboard');
    } else {
      // Multiple schools - show selector
      navigation.navigate('SchoolSelector', { schools });
    }
  };

  const handleContinueToTuto = () => {
    // If user already has a role, go directly to Home
    // Otherwise, go to Role Selection for new users
    if (userData?.type) {
      console.log('🏠 User has role, navigating to Home:', userData.type);
      navigation.replace('Home');
    } else {
      console.log('🎭 No role set, navigating to RoleSelection');
      navigation.replace('RoleSelection');
    }
  };

  const handleJoinSchool = () => {
    navigation.navigate('SchoolInvitation');
  };

  const handleAdminOnboarding = () => {
    navigation.navigate('AdminOnboarding');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 120,
      height: 40,
      marginBottom: spacing.lg,
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
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
    },
    optionsContainer: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.lg,
    },
    optionCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 2,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    optionIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    optionIcon: {
      marginRight: spacing.md,
    },
    optionTitle: {
      flex: 1,
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    optionDescription: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    },
    adminLink: {
      marginTop: spacing.xl,
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    adminLinkText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      textDecorationLine: 'underline',
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
    },
    errorText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: 12,
    },
    retryButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semibold,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('welcome.loadingSchools')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.text.secondary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSchoolAssociations}>
            <Text style={styles.retryButtonText}>{t('common.refresh')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasSchools = schools.length > 0;
  const multipleSchools = schools.length > 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('welcome.title')}</Text>
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* School Dashboard Option - Only show if user has schools */}
          {hasSchools && (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleGoToSchoolDashboard}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <MaterialIcons
                  name="school"
                  size={32}
                  color={colors.primary}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionTitle}>
                  {multipleSchools ? t('welcome.selectSchool') : t('welcome.goToSchoolDashboard')}
                </Text>
              </View>
              <Text style={styles.optionDescription}>
                {multipleSchools
                  ? t('welcome.multipleSchools')
                  : schools[0]?.school_name}
              </Text>
            </TouchableOpacity>
          )}

          {/* Join School Option - Only show if user has no schools */}
          {!hasSchools && (
            <TouchableOpacity
              style={styles.optionCard}
              onPress={handleJoinSchool}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconContainer}>
                <MaterialIcons
                  name="person-add"
                  size={32}
                  color={colors.primary}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionTitle}>{t('welcome.joinSchool')}</Text>
              </View>
              <Text style={styles.optionDescription}>
                {t('school.invitation.subtitle')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Continue to Tuto Home - Always show */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleContinueToTuto}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialIcons
                name="home"
                size={32}
                color={colors.primary}
                style={styles.optionIcon}
              />
              <Text style={styles.optionTitle}>{t('welcome.continueToTuto')}</Text>
            </View>
            <Text style={styles.optionDescription}>
              {t('home.findTutorsAndConnect')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin Onboarding Link - Only show if user has no schools */}
        {!hasSchools && (
          <TouchableOpacity style={styles.adminLink} onPress={handleAdminOnboarding}>
            <Text style={styles.adminLinkText}>{t('welcome.adminOnboarding')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

