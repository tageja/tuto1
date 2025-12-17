import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSchool } from '../../contexts/SchoolContext';

interface RoleGatewaySectionProps {
  navigation: any;
}

export const RoleGatewaySection: React.FC<RoleGatewaySectionProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    header: {
      marginBottom: spacing.lg,
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
      textAlign: 'center',
    },
    sectionSubtitle: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    cardsContainer: {
      gap: spacing.md,
    },
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: 20,
      padding: spacing.lg,
      alignItems: 'center',
      ...shadows.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    cardDescription: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.lg,
      lineHeight: 22,
    },
    cardButton: {
      width: '100%',
      paddingVertical: 12,
      backgroundColor: colors.background.primary,
      borderWidth: 2,
      borderColor: colors.border.light,
      borderRadius: 12,
      alignItems: 'center',
    },
    cardButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
    },
  });

  const { t } = useLanguage();
  const { user } = useUser();
  const { joinedSchools } = useSchool();

  const handleAdminPress = () => {
    // Logic matching RoleSelectionScreen/Web behavior
    if (joinedSchools.length > 0) {
      // Already joined, go to selection or dashboard
      navigation.navigate('SchoolSelection');
    } else {
      // Need code
      navigation.navigate('SchoolInvitation');
    }
  };

  const handleTeacherPress = () => {
    // If teacher logic needed, typically "apply" or "login"
    // For now, mirroring web 'get access' which usually means join/register flow
    // or if already a teacher, go to schedule
    if (user?.type === 'teacher') {
      navigation.navigate('Schedule');
    } else {
      navigation.navigate('TeacherProfile', { mode: 'edit' }); // Or generic teacher landing
    }
  };

  const handleParentPress = () => {
    if (user?.type === 'parent') {
      navigation.navigate('UserProfile'); // Or children list
    } else {
      // Just a generic navigation to login if not logged in, but we are inside app
      // So navigate to a parent-relevant screen
      navigation.navigate('UserProfile');
    }
  };

  const RoleCard = ({ 
    title, 
    description, 
    icon, 
    color, 
    bg, 
    onPress, 
    buttonText 
  }: { 
    title: string; 
    description: string; 
    icon: keyof typeof MaterialIcons.glyphMap; 
    color: string; 
    bg: string; 
    onPress: () => void;
    buttonText: string;
  }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: bg }]}>
        <MaterialIcons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      <TouchableOpacity style={styles.cardButton} onPress={onPress}>
        <Text style={styles.cardButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('landing.roles.title') || 'Choose your role'}</Text>
        <Text style={styles.sectionSubtitle}>{t('landing.roles.subtitle') || 'Dedicated portals for every user type'}</Text>
      </View>

      <View style={styles.cardsContainer}>
        {/* School Admin */}
        <RoleCard
          title={t('landing.roles.admin.title') || 'School Admin'}
          description={t('landing.roles.admin.desc') || 'Manage school operations'}
          icon="admin-panel-settings"
          color="#2563EB" // blue-600
          bg="#EFF6FF" // blue-50
          onPress={handleAdminPress}
          buttonText={t('landing.roles.getAccess') || 'Get Access'}
        />

        {/* Teacher */}
        <RoleCard
          title={t('landing.roles.teacher.title') || 'Teacher'}
          description={t('landing.roles.teacher.desc') || 'Manage classes & schedule'}
          icon="school"
          color="#9333EA" // purple-600
          bg="#FAF5FF" // purple-50
          onPress={handleTeacherPress}
          buttonText={t('landing.roles.getAccess') || 'Get Access'}
        />

        {/* Parent */}
        <RoleCard
          title={t('landing.roles.parent.title') || 'Parent'}
          description={t('landing.roles.parent.desc') || 'Track child progress'}
          icon="family-restroom"
          color="#16A34A" // green-600
          bg="#F0FDF4" // green-50
          onPress={handleParentPress}
          buttonText={t('landing.roles.accessPortal') || 'Access Portal'}
        />
      </View>
    </View>
  );
};







