import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import { useTheme } from '../contexts/ThemeContext';
import { SchoolAssociation } from '../services/school.service';

type SchoolSelectorRouteProp = RouteProp<{ params: { schools: SchoolAssociation[] } }, 'params'>;

const SchoolSelectorScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<SchoolSelectorRouteProp>();
  const { user, setUserData } = useUser();
  const { setCurrentSchool, setIsSchoolMode } = useSchool();

  const schools = route.params?.schools || [];

  const handleSelectSchool = async (school: SchoolAssociation) => {
    // Set the selected school
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

    // Set school mode
    setIsSchoolMode(true);

    // Update user role based on school association
    if (user) {
      await setUserData({
        ...user,
        type: school.role === 'admin' ? 'admin' : 'parent',
      });
    }

    // Navigate to school dashboard
    navigation.replace('SchoolDashboard' as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      padding: spacing.sm,
      marginRight: spacing.md,
    },
    headerTextContainer: {
      flex: 1,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    scrollContent: {
      padding: spacing.lg,
    },
    schoolCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    schoolHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    schoolLogo: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface,
      marginRight: spacing.md,
    },
    schoolLogoPlaceholder: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    schoolInfo: {
      flex: 1,
    },
    schoolName: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    schoolRole: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    roleLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginRight: spacing.xs,
    },
    roleBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: colors.primary + '20',
    },
    roleText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.semibold,
      color: colors.primary,
      textTransform: 'uppercase',
    },
    selectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    selectButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semibold,
      marginRight: spacing.xs,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
  });

  if (schools.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('schoolSelector.title')}</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="school" size={80} color={colors.text.secondary} />
          <Text style={styles.emptyText}>{t('schoolSelector.noSchools')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('schoolSelector.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('schoolSelector.subtitle')}</Text>
        </View>
      </View>

      {/* Schools List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {schools.map((school) => (
          <TouchableOpacity
            key={school.school_id}
            style={styles.schoolCard}
            onPress={() => handleSelectSchool(school)}
            activeOpacity={0.7}
          >
            <View style={styles.schoolHeader}>
              {school.school_logo_url ? (
                <Image
                  source={{ uri: school.school_logo_url }}
                  style={styles.schoolLogo}
                />
              ) : (
                <View style={styles.schoolLogoPlaceholder}>
                  <MaterialIcons name="school" size={32} color={colors.text.secondary} />
                </View>
              )}
              <View style={styles.schoolInfo}>
                <Text style={styles.schoolName}>{school.school_name}</Text>
                <View style={styles.schoolRole}>
                  <Text style={styles.roleLabel}>{t('schoolSelector.yourRole')}:</Text>
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {school.role === 'admin'
                        ? t('schoolSelector.admin')
                        : t('schoolSelector.parent')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => handleSelectSchool(school)}
            >
              <Text style={styles.selectButtonText}>{t('common.select')}</Text>
              <MaterialIcons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SchoolSelectorScreen;


