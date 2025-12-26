/**
 * Admin Health Records Screen
 * Full-featured health records management for school admins
 * Displays KPIs, filters, and student list with health status badges
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import {
  fetchHealthKPIs,
  fetchHealthStudents,
  type HealthKPIs,
  type StudentHealthSummary,
  type HealthFilters,
} from '../../services/supabase-health';
import { fetchClassesForSchool } from '../../services/school/attendance';
import type { ClassOption } from '../../types/school/attendance';

const AdminHealthRecordsScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<HealthKPIs>({
    totalStudents: 0,
    allergies: 0,
    medications: 0,
    updatedThisMonth: 0,
  });
  const [students, setStudents] = useState<StudentHealthSummary[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [studentDropdownVisible, setStudentDropdownVisible] = useState(false);

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
    filtersContainer: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    dropdown: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    dropdownDisabled: {
      opacity: 0.5,
    },
    dropdownText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    dropdownTextDisabled: {
      color: colors.disabled,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    // Bottom Sheet Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.background.primary,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '60%',
      paddingBottom: spacing.xl,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border.medium,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
    },
    modalCloseButton: {
      padding: spacing.xs,
    },
    modalListContent: {
      padding: spacing.md,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.background.secondary,
    },
    modalItemSelected: {
      backgroundColor: `${colors.primary}15`,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    modalItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    modalItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    modalItemInfo: {
      flex: 1,
    },
    modalItemName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    modalItemSubtitle: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    kpiCard: {
      width: '48%',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    kpiIconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    kpiLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    kpiValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
    },
    studentList: {
      flex: 1,
      paddingHorizontal: spacing.md,
    },
    studentCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...shadows.sm,
    },
    studentInfo: {
      flex: 1,
      marginRight: spacing.sm,
    },
    studentName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    studentClass: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    badgeContainer: {
      flexDirection: 'row',
      gap: spacing.xs,
      alignItems: 'center',
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    badgeAllergy: {
      backgroundColor: '#EF444420',
    },
    badgeMedication: {
      backgroundColor: '#F59E0B20',
    },
    badgeNone: {
      backgroundColor: colors.background.tertiary,
    },
    arrowIcon: {
      marginLeft: spacing.sm,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg,
      elevation: 8,
    },
  });

  const loadData = useCallback(async () => {
    if (!currentSchool) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      // Load KPIs
      const kpisData = await fetchHealthKPIs(schoolId);
      setKpis(kpisData);

      // Load classes
      const classesData = await fetchClassesForSchool(schoolId);
      setClasses(classesData);

      // Load students with filters
      const filters: HealthFilters = {
        classId: selectedClassId || undefined,
        studentId: selectedStudentId || undefined,
        search: searchQuery || undefined,
      };
      const studentsData = await fetchHealthStudents(schoolId, filters);
      setStudents(studentsData);
    } catch (error: any) {
      console.error('Error loading health records:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || t('school.health.errors.loadFailed') || 'Failed to load health records'
      );
    } finally {
      setLoading(false);
    }
  }, [currentSchool, selectedClassId, selectedStudentId, searchQuery, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleStudentPress = useCallback(
    (studentId: string) => {
      navigation.navigate('StudentHealthDetail', { studentId });
    },
    [navigation]
  );

  const handleAddRecord = useCallback(() => {
    navigation.navigate('AddHealthRecord');
  }, [navigation]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(query) ||
        s.className.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const kpiItems = [
    {
      icon: 'people' as const,
      label: t('school.health.kpis.totalStudents') || 'Total Students',
      value: kpis.totalStudents,
      iconColor: colors.primary,
      iconBg: `${colors.primary}20`,
    },
    {
      icon: 'warning' as const,
      label: t('school.health.kpis.allergies') || 'Allergies',
      value: kpis.allergies,
      iconColor: '#EF4444',
      iconBg: '#EF444420',
    },
    {
      icon: 'medication' as const,
      label: t('school.health.kpis.medications') || 'Medications',
      value: kpis.medications,
      iconColor: '#F59E0B',
      iconBg: '#F59E0B20',
    },
    {
      icon: 'calendar-today' as const,
      label: t('school.health.kpis.updatedThisMonth') || 'Updates This Month',
      value: kpis.updatedThisMonth,
      iconColor: colors.status.success,
      iconBg: `${colors.status.success}20`,
    },
  ];

  const renderStudentCard = ({ item }: { item: StudentHealthSummary }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => handleStudentPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.fullName}</Text>
        <Text style={styles.studentClass}>{item.className}</Text>
      </View>
      <View style={styles.badgeContainer}>
        {item.hasAllergy && (
          <View style={[styles.badge, styles.badgeAllergy]}>
            <Text style={{ color: '#EF4444', fontSize: typography.fontSize.xs, fontWeight: '600' }}>
              Allergy
            </Text>
          </View>
        )}
        {item.hasMedication && (
          <View style={[styles.badge, styles.badgeMedication]}>
            <Text style={{ color: '#F59E0B', fontSize: typography.fontSize.xs, fontWeight: '600' }}>
              Medication
            </Text>
          </View>
        )}
        {!item.hasAllergy && !item.hasMedication && (
          <View style={[styles.badge, styles.badgeNone]}>
            <Text style={{ color: colors.text.secondary, fontSize: typography.fontSize.xs, fontWeight: '600' }}>
              None
            </Text>
          </View>
        )}
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.text.secondary}
          style={styles.arrowIcon}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
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
                {t('school.health.subtitle') || 'Student health monitoring and medical information'}
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

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setClassDropdownVisible(!classDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedClass ? selectedClass.name : t('school.health.filters.allClasses') || 'All Classes'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdown, !selectedClassId && styles.dropdownDisabled]}
              onPress={() => selectedClassId && setStudentDropdownVisible(!studentDropdownVisible)}
              disabled={!selectedClassId}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !selectedClassId && styles.dropdownTextDisabled,
                ]}
              >
                {selectedStudent
                  ? selectedStudent.fullName
                  : t('school.health.filters.allStudents') || 'All Students'}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={20}
                color={selectedClassId ? colors.text.secondary : colors.disabled}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('school.health.searchPlaceholder') || 'Search students...'}
              placeholderTextColor={colors.disabled}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

        </View>

        {/* Class Selector Bottom Sheet */}
        <Modal
          visible={classDropdownVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setClassDropdownVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setClassDropdownVisible(false)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('school.health.filters.selectClass') || 'Select Class'}
                </Text>
                <TouchableOpacity
                  onPress={() => setClassDropdownVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialIcons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[{ id: '', name: t('school.health.filters.allClasses') || 'All Classes' }, ...classes]}
                keyExtractor={(item) => item.id || 'all'}
                contentContainerStyle={styles.modalListContent}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedClassId;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                      onPress={() => {
                        setSelectedClassId(item.id);
                        setSelectedStudentId('');
                        setClassDropdownVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalItemContent}>
                        <View style={styles.modalItemIcon}>
                          <MaterialIcons name="class" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.modalItemInfo}>
                          <Text style={styles.modalItemName}>{item.name}</Text>
                        </View>
                      </View>
                      {isSelected && (
                        <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        {/* Student Selector Bottom Sheet */}
        <Modal
          visible={studentDropdownVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setStudentDropdownVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setStudentDropdownVisible(false)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t('school.health.filters.selectStudent') || 'Select Student'}
                </Text>
                <TouchableOpacity
                  onPress={() => setStudentDropdownVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <MaterialIcons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={[
                  { id: '', fullName: t('school.health.filters.allStudents') || 'All Students', classId: '', className: '' },
                  ...students.filter((s) => s.classId === selectedClassId),
                ]}
                keyExtractor={(item) => item.id || 'all'}
                contentContainerStyle={styles.modalListContent}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedStudentId;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                      onPress={() => {
                        setSelectedStudentId(item.id);
                        setStudentDropdownVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.modalItemContent}>
                        <View style={styles.modalItemIcon}>
                          <MaterialIcons name="person" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.modalItemInfo}>
                          <Text style={styles.modalItemName}>{item.fullName}</Text>
                          {item.className && (
                            <Text style={styles.modalItemSubtitle}>{item.className}</Text>
                          )}
                        </View>
                      </View>
                      {isSelected && (
                        <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {kpiItems.map((kpi, index) => (
            <View key={index} style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: kpi.iconBg }]}>
                <MaterialIcons name={kpi.icon} size={24} color={kpi.iconColor} />
              </View>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
            </View>
          ))}
        </View>

        {/* Student List */}
        <View style={styles.studentList}>
          {filteredStudents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>
                {t('school.health.empty.noStudents') || 'No students found'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredStudents}
              renderItem={renderStudentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListFooterComponent={<View style={{ height: spacing.xl }} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddRecord} activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

export default AdminHealthRecordsScreen;

