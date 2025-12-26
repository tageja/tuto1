import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { 
  formatEventDate, 
  formatEventTime,
  registerForEvent,
  unregisterFromEvent,
} from '../../services/school/events';
import { getCurrentUser, supabase } from '../../config/supabase';
import type { EventWithCounts } from '../../types/school/events';

const EventDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { userType } = useUser();

  const event = route.params?.event as EventWithCounts;
  const childId = route.params?.childId as string | undefined;
  const childName = route.params?.childName as string | undefined;
  const initialIsRegistered = route.params?.isRegistered as boolean | undefined;
  const isParent = route.params?.isParent === true || userType === 'parent';

  const [isRegistered, setIsRegistered] = useState(initialIsRegistered ?? false);
  const [registering, setRegistering] = useState(false);

  const handleRegister = useCallback(async () => {
    if (!childId || !currentSchool) {
      Alert.alert(t('common.error'), t('school.events.selectChildFirst'));
      return;
    }

    try {
      setRegistering(true);
      
      // Get parent's user ID
      const authUser = await getCurrentUser();
      if (!authUser) {
        Alert.alert(t('common.error'), t('common.notAuthenticated'));
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!userData) {
        Alert.alert(t('common.error'), t('common.userNotFound'));
        return;
      }

      const schoolId = currentSchool.id || currentSchool.name;

      await registerForEvent(event.id, childId, userData.id, schoolId);
      setIsRegistered(true);
      Alert.alert(
        t('common.success'),
        t('school.events.registrationSuccess', { childName: childName || '' })
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t('common.error'), t('school.events.registrationError'));
    } finally {
      setRegistering(false);
    }
  }, [childId, currentSchool, event.id, childName, t]);

  const handleUnregister = useCallback(async () => {
    if (!childId) return;

    Alert.alert(
      t('school.events.confirmUnregister'),
      t('school.events.confirmUnregisterMessage', { childName: childName || '' }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('school.events.unregister'),
          style: 'destructive',
          onPress: async () => {
            try {
              setRegistering(true);
              await unregisterFromEvent(event.id, childId);
              setIsRegistered(false);
              Alert.alert(t('common.success'), t('school.events.unregistrationSuccess'));
            } catch (error) {
              console.error('Unregistration error:', error);
              Alert.alert(t('common.error'), t('school.events.unregistrationError'));
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  }, [childId, childName, event.id, t]);

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <DashboardHeader schoolName={currentSchool?.name || ''} onNotificationPress={() => {}} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary }}>Event not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }}>
            <Text style={{ color: colors.primary }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    content: {
      flex: 1,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      flex: 1,
    },
    card: {
      backgroundColor: colors.background.primary,
      margin: spacing.md,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.sm,
    },
    categoryPill: {
      alignSelf: 'flex-start',
      backgroundColor: colors.background.tertiary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      marginBottom: spacing.md,
    },
    categoryText: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      textTransform: 'capitalize',
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    section: {
      marginTop: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    infoText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      flex: 1,
    },
    description: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      lineHeight: 24,
    },
    parentNoteContainer: {
      backgroundColor: '#E3F2FD',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
    },
    parentNoteLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    parentNoteText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    statsRow: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      gap: spacing.xl,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.primary,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginTop: 4,
    },
    registerButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      marginTop: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.sm,
    },
    registerButtonDisabled: {
      backgroundColor: colors.text.light,
    },
    unregisterButton: {
      backgroundColor: colors.background.primary,
      borderWidth: 2,
      borderColor: colors.status.error,
    },
    registerButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
    },
    unregisterButtonText: {
      color: colors.status.error,
    },
    registeredBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: '#E8F5E9',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.lg,
    },
    registeredBadgeText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.status.success,
    },
    childInfoBanner: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    childInfoText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      flex: 1,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader
        schoolName={currentSchool?.name || ''}
        onNotificationPress={() => {}}
      />
      
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('school.events.viewDetails')}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{t(`school.events.${event.category}`)}</Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>{formatEventDate(event.starts_at)}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="access-time" size={20} color={colors.text.secondary} />
            <Text style={styles.infoText}>
              {formatEventTime(event.starts_at, event.ends_at)}
            </Text>
          </View>

          {event.location && (
            <View style={styles.infoRow}>
              <MaterialIcons name="place" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>{event.location}</Text>
            </View>
          )}

          {event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('school.events.description')}</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {event.parent_note && (
            <View style={styles.parentNoteContainer}>
              <Text style={styles.parentNoteLabel}>{t('school.events.noteForParents')}</Text>
              <Text style={styles.parentNoteText}>{event.parent_note}</Text>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {event.registered_count || 0}
                {event.capacity ? `/${event.capacity}` : ''}
              </Text>
              <Text style={styles.statLabel}>{t('school.events.registered')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {event.status === 'published' ? t('school.events.published') : t('school.events.draft')}
              </Text>
              <Text style={styles.statLabel}>{t('school.events.status')}</Text>
            </View>
          </View>

          {/* Registration Section - Only for Parents */}
          {isParent && childId && (
            <>
              {/* Show which child this is for */}
              {childName && (
                <View style={styles.childInfoBanner}>
                  <MaterialIcons name="child-care" size={20} color={colors.text.secondary} />
                  <Text style={styles.childInfoText}>
                    {t('school.events.registeringFor', { childName })}
                  </Text>
                </View>
              )}

              {isRegistered ? (
                <>
                  <View style={styles.registeredBadge}>
                    <MaterialIcons name="check-circle" size={20} color={colors.status.success} />
                    <Text style={styles.registeredBadgeText}>
                      {t('school.events.alreadyRegistered')}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.registerButton, styles.unregisterButton]}
                    onPress={handleUnregister}
                    disabled={registering}
                  >
                    {registering ? (
                      <ActivityIndicator size="small" color={colors.status.error} />
                    ) : (
                      <>
                        <MaterialIcons name="cancel" size={20} color={colors.status.error} />
                        <Text style={[styles.registerButtonText, styles.unregisterButtonText]}>
                          {t('school.events.unregister')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    event.is_full && styles.registerButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={registering || event.is_full}
                >
                  {registering ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <>
                      <MaterialIcons name="how-to-reg" size={20} color={colors.white} />
                      <Text style={styles.registerButtonText}>
                        {event.is_full 
                          ? t('school.events.eventFull') 
                          : t('school.events.registerNow')}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetailScreen;

