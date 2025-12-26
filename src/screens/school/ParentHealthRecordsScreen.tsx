/**
 * Parent Health Records Screen
 * Read-only health records view for parents
 * Displays child's medical information, allergies, medications, contacts, vaccinations, and growth trends
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { ChildSelectorBottomSheet } from '../../components/school/ChildSelectorBottomSheet';
import {
  fetchParentChildren,
  fetchStudentHealthDetail,
  fetchStudentVitals,
  type StudentHealthDetail,
  type ParentChild,
  type VitalsRecord,
} from '../../services/supabase-health';

const ParentHealthRecordsScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<StudentHealthDetail | null>(null);
  const [vitals, setVitals] = useState<VitalsRecord[]>([]);
  const [vitalsRange] = useState<3 | 6 | 12>(12);
  const [childDropdownVisible, setChildDropdownVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerSection: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    headerTextContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    screenTitle: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    screenSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    syncBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.background.tertiary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    syncDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.status.success,
      marginRight: spacing.xs,
    },
    syncText: {
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    },
    childSelector: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    childSelectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      minHeight: 44,
    },
    childSelectorText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      fontWeight: '500',
    },
    childSelectorPlaceholder: {
      fontSize: typography.fontSize.md,
      color: colors.disabled,
    },
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.xl,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    infoLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      fontWeight: '600',
      flex: 1,
      textAlign: 'right',
    },
    listItem: {
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    listItemLast: {
      borderBottomWidth: 0,
    },
    allergyName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    allergyNotes: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    medicationName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    medicationDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    medicationDetail: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    contactRow: {
      marginBottom: spacing.md,
    },
    contactLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    contactName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    contactPhone: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    vaccineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    vaccineInfo: {
      flex: 1,
    },
    vaccineName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    vaccineDate: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
    },
    severityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    scheduleBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    chartPlaceholder: {
      height: 200,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
      borderStyle: 'dashed',
    },
    chartPlaceholderText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    emptySection: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Growth Summary Styles
    growthContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    growthMetricCard: {
      width: '48%',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    growthMetricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    growthMetricIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    growthMetricLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    growthCurrentValue: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    growthValueLarge: {
      fontSize: 32,
      fontWeight: '700',
    },
    growthUnit: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.secondary,
      marginRight: spacing.sm,
    },
    growthChangeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      gap: 4,
    },
    growthChangeText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
    },
    growthDate: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    growthPreviousRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    growthTimelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border.medium,
      marginRight: spacing.sm,
    },
    growthPreviousInfo: {
      flex: 1,
    },
    growthPreviousValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.text.primary,
    },
    growthPreviousDate: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
    },
    growthNoData: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: spacing.md,
    },
  });

  const loadChildren = useCallback(async () => {
    if (!currentSchool) return;

    try {
      const schoolId = currentSchool.id || currentSchool.name;
      const childrenData = await fetchParentChildren(schoolId);
      // Transform to Child type for ChildSelectorBottomSheet
      const transformedChildren = childrenData.map(child => ({
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        classId: child.classId,
        className: child.className,
      }));
      setChildren(transformedChildren as any);
      if (transformedChildren.length > 0 && !selectedChildId) {
        setSelectedChildId(transformedChildren[0].id);
      }
    } catch (error: any) {
      console.error('Error loading children:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || 'Failed to load children'
      );
    }
  }, [currentSchool, selectedChildId, t]);

  const loadHealthData = useCallback(async () => {
    if (!selectedChildId) return;

    try {
      setLoading(true);
      const [health, vitalsData] = await Promise.all([
        fetchStudentHealthDetail(selectedChildId),
        fetchStudentVitals(selectedChildId, vitalsRange),
      ]);
      setHealthData(health);
      setVitals(vitalsData);
    } catch (error: any) {
      console.error('Error loading health data:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || 'Failed to load health data'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedChildId, vitalsRange, t]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (selectedChildId) {
      loadHealthData();
    }
  }, [selectedChildId, loadHealthData]);

  useEffect(() => {
    if (selectedChildId) {
      loadHealthData();
    }
  }, [vitalsRange, selectedChildId, loadHealthData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadChildren(), selectedChildId ? loadHealthData() : Promise.resolve()]);
    setRefreshing(false);
  }, [loadChildren, loadHealthData, selectedChildId]);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return colors.status.success;
      case 'scheduled':
        return colors.primary;
      case 'pending':
        return colors.status.warning;
      default:
        return colors.text.secondary;
    }
  };

  const renderGrowthSummary = () => {
    // Get height and weight data separately
    const heightData = vitals
      .filter((v) => v.heightCm !== null)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    
    const weightData = vitals
      .filter((v) => v.weightKg !== null)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    if (heightData.length === 0 && weightData.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            {t('school.health.empty.noVitals') || 'No vitals data available'}
          </Text>
        </View>
      );
    }

    const latestHeight = heightData[0];
    const previousHeight = heightData[1];
    const latestWeight = weightData[0];
    const previousWeight = weightData[1];

    const heightChange = latestHeight && previousHeight
      ? (latestHeight.heightCm || 0) - (previousHeight.heightCm || 0)
      : null;
    const weightChange = latestWeight && previousWeight
      ? (latestWeight.weightKg || 0) - (previousWeight.weightKg || 0)
      : null;

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderMetricCard = (
      label: string,
      icon: 'height' | 'fitness-center',
      currentValue: number | null,
      unit: string,
      change: number | null,
      currentDate: string | null,
      previousValue: number | null,
      previousDate: string | null,
      color: string
    ) => (
      <View style={styles.growthMetricCard}>
        {/* Header */}
        <View style={styles.growthMetricHeader}>
          <View style={[styles.growthMetricIcon, { backgroundColor: `${color}15` }]}>
            <MaterialIcons name={icon} size={20} color={color} />
          </View>
          <Text style={styles.growthMetricLabel}>{label}</Text>
        </View>

        {currentValue !== null ? (
          <>
            {/* Current Value */}
            <View style={styles.growthCurrentValue}>
              <Text style={[styles.growthValueLarge, { color }]}>
                {currentValue.toFixed(1)}
              </Text>
              <Text style={styles.growthUnit}>{unit}</Text>
              {change !== null && (
                <View style={[
                  styles.growthChangeBadge,
                  { backgroundColor: change >= 0 ? '#10B98115' : '#EF444415' }
                ]}>
                  <MaterialIcons
                    name={change >= 0 ? 'trending-up' : 'trending-down'}
                    size={14}
                    color={change >= 0 ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[
                    styles.growthChangeText,
                    { color: change >= 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {change >= 0 ? '+' : ''}{change.toFixed(1)} {unit}
                  </Text>
                </View>
              )}
            </View>

            {/* Date */}
            <Text style={styles.growthDate}>
              {t('school.health.growthTrends.lastRecorded') || 'Last recorded'}: {currentDate ? formatDate(currentDate) : '-'}
            </Text>

            {/* Previous comparison */}
            {previousValue !== null && previousDate && (
              <View style={styles.growthPreviousRow}>
                <View style={styles.growthTimelineDot} />
                <View style={styles.growthPreviousInfo}>
                  <Text style={styles.growthPreviousValue}>
                    {previousValue.toFixed(1)} {unit}
                  </Text>
                  <Text style={styles.growthPreviousDate}>
                    {formatDate(previousDate)}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.growthNoData}>
            {t('school.health.empty.noData') || 'No data'}
          </Text>
        )}
      </View>
    );

    return (
      <View style={styles.growthContainer}>
        {renderMetricCard(
          t('school.health.parent.height') || 'Height',
          'height',
          latestHeight?.heightCm || null,
          'cm',
          heightChange,
          latestHeight?.recordedAt || null,
          previousHeight?.heightCm || null,
          previousHeight?.recordedAt || null,
          colors.primary
        )}
        {renderMetricCard(
          t('school.health.parent.weight') || 'Weight',
          'fitness-center',
          latestWeight?.weightKg || null,
          'kg',
          weightChange,
          latestWeight?.recordedAt || null,
          previousWeight?.weightKg || null,
          previousWeight?.recordedAt || null,
          '#10B981'
        )}
      </View>
    );
  };

  if (loading && !refreshing && !healthData) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>
            {t('common.loading') || 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.screenTitle}>
                {t('school.health.title') || 'Health Records'}
              </Text>
              <Text style={styles.screenSubtitle}>
                {selectedChild
                  ? `${selectedChild.fullName} - ${t('school.health.subtitle') || 'Comprehensive health information'}`
                  : t('school.health.subtitle') || 'Comprehensive health information'}
              </Text>
            </View>
          </View>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>
              {t('common.synced') || 'Synced'} 2 min ago
            </Text>
          </View>
        </View>

        {/* Child Selector */}
        <View style={styles.childSelector}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setChildDropdownVisible(true)}
          >
            <Text
              style={
                selectedChild
                  ? styles.childSelectorText
                  : styles.childSelectorPlaceholder
              }
            >
              {selectedChild
                ? `${selectedChild.firstName} ${selectedChild.lastName} - ${selectedChild.className}`
                : t('school.health.selectChild') || 'Select Child'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Child Selector Bottom Sheet */}
        <ChildSelectorBottomSheet
          children={children as any}
          selectedId={selectedChildId}
          visible={childDropdownVisible}
          onSelect={(childId) => setSelectedChildId(childId)}
          onClose={() => setChildDropdownVisible(false)}
        />

        {/* Growth Trends - Shown at top when data is available */}
        {selectedChildId && vitals.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
            <Text style={styles.sectionTitle}>
              {t('school.health.sections.growthTrends') || 'Growth Trends'}
            </Text>
            {renderGrowthSummary()}
          </View>
        )}

        {!healthData ? (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>
              {t('school.health.empty.noData') || 'No health data available'}
            </Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Medical Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('school.health.sections.medicalInfo') || 'Medical Information'}
              </Text>
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Student Name</Text>
                  <Text style={styles.infoValue}>{healthData.student.fullName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Class</Text>
                  <Text style={styles.infoValue}>{healthData.student.className}</Text>
                </View>
                {healthData.student.dateOfBirth && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date of Birth</Text>
                    <Text style={styles.infoValue}>
                      {new Date(healthData.student.dateOfBirth).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                {healthData.notes.length > 0 && (
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.infoLabel}>General Notes</Text>
                    <Text style={styles.infoValue}>
                      {healthData.notes[0]?.details?.notes || healthData.notes[0]?.title || 'No notes'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Allergies & Conditions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('school.health.sections.allergies') || 'Allergies & Conditions'}
              </Text>
              <View style={styles.card}>
                {healthData.allergies.length > 0 ? (
                  healthData.allergies.map((allergy, index) => (
                    <View
                      key={allergy.id}
                      style={[
                        styles.listItem,
                        index === healthData.allergies.length - 1 && styles.listItemLast,
                      ]}
                    >
                      <Text style={styles.allergyName}>{allergy.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <View
                          style={[
                            styles.severityBadge,
                            {
                              backgroundColor: `${getSeverityColor(allergy.severity)}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badge,
                              { color: getSeverityColor(allergy.severity) },
                            ]}
                          >
                            {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                          </Text>
                        </View>
                      </View>
                      {allergy.notes && (
                        <Text style={styles.allergyNotes}>{allergy.notes}</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>
                      {t('school.health.empty.noAllergies') || 'No allergies recorded'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Medications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('school.health.sections.medications') || 'Medications'}
              </Text>
              <View style={styles.card}>
                {healthData.medications.length > 0 ? (
                  healthData.medications.map((med, index) => (
                    <View
                      key={med.id}
                      style={[
                        styles.listItem,
                        index === healthData.medications.length - 1 && styles.listItemLast,
                      ]}
                    >
                      <Text style={styles.medicationName}>{med.name}</Text>
                      <View style={styles.medicationDetails}>
                        {med.dose && (
                          <Text style={styles.medicationDetail}>Dose: {med.dose}</Text>
                        )}
                        {med.schedule && (
                          <View
                            style={[
                              styles.scheduleBadge,
                              { backgroundColor: `${colors.primary}20` },
                            ]}
                          >
                            <Text style={[styles.badge, { color: colors.primary }]}>
                              {med.schedule}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>
                      {t('school.health.empty.noMedications') || 'No medications recorded'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Emergency Contacts */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('school.health.sections.emergencyContacts') || 'Emergency Contacts'}
              </Text>
              <View style={styles.card}>
                {healthData.emergencyContacts.primaryName ? (
                  <View style={styles.contactRow}>
                    <Text style={styles.contactLabel}>Primary Contact</Text>
                    <Text style={styles.contactName}>{healthData.emergencyContacts.primaryName}</Text>
                    <Text style={styles.contactPhone}>
                      {healthData.emergencyContacts.primaryPhone}
                    </Text>
                  </View>
                ) : null}
                {healthData.emergencyContacts.altName ? (
                  <View style={[styles.contactRow, { marginBottom: 0 }]}>
                    <Text style={styles.contactLabel}>Secondary Contact</Text>
                    <Text style={styles.contactName}>{healthData.emergencyContacts.altName}</Text>
                    <Text style={styles.contactPhone}>{healthData.emergencyContacts.altPhone}</Text>
                  </View>
                ) : null}
                {!healthData.emergencyContacts.primaryName &&
                  !healthData.emergencyContacts.altName && (
                    <View style={styles.emptySection}>
                      <Text style={styles.emptyText}>
                        {t('school.health.empty.noContacts') || 'No emergency contacts on file'}
                      </Text>
                    </View>
                  )}
              </View>
            </View>

            {/* Vaccination Records */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('school.health.sections.vaccinations') || 'Vaccination Records'}
              </Text>
              <View style={styles.card}>
                {healthData.vaccinations.length > 0 ? (
                  healthData.vaccinations.map((vaccine, index) => (
                    <View
                      key={vaccine.id}
                      style={[
                        styles.vaccineRow,
                        index === healthData.vaccinations.length - 1 && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.vaccineInfo}>
                        <Text style={styles.vaccineName}>{vaccine.vaccine}</Text>
                        <Text style={styles.vaccineDate}>
                          {new Date(vaccine.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(vaccine.status)}20` },
                        ]}
                      >
                        <Text style={[styles.badge, { color: getStatusColor(vaccine.status) }]}>
                          {vaccine.status.charAt(0).toUpperCase() + vaccine.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptySection}>
                    <Text style={styles.emptyText}>
                      {t('school.health.empty.noVaccinations') || 'No vaccinations recorded'}
                    </Text>
                  </View>
                )}
              </View>
            </View>

          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ParentHealthRecordsScreen;



