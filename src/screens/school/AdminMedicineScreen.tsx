import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import {
  fetchMedicineKPIs,
  fetchMedicineReminders,
  type MedicineKPIs,
  type MedicineReminder,
  type MedicineFilters,
} from '../../services/supabase-medicine';
import { fetchClassesForSchool } from '../../services/school/attendance';
import { supabase } from '../../config/supabase';
import { resolveSchoolId } from '../../services/school-id';
import type { ClassOption } from '../../types/school/attendance';

const AdminMedicineScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();
  const { userType } = useUser();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kpis, setKpis] = useState<MedicineKPIs>({
    totalReminders: 0,
    active: 0,
    dueToday: 0,
    completedToday: 0,
  });
  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<Array<{ id: string; first_name: string; last_name: string; class_id: string | null }>>([]);
  
  // Filters
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [studentDropdownVisible, setStudentDropdownVisible] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    scrollContent: {
      padding: spacing.md,
    },
    headerCard: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.md,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700' as any,
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    kpiCard: {
      width: '48%',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    kpiIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.sm,
    },
    kpiValue: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: '700' as any,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    kpiLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
    },
    filtersCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    filterLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600' as any,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    filterButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    filterButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      flex: 1,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    reminderCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadows.sm,
    },
    reminderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    studentName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600' as any,
      color: colors.text.primary,
    },
    studentClass: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs / 2,
    },
    statusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: borderRadius.full,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600' as any,
    },
    medicineName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600' as any,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    medicineDetails: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs / 2,
    },
    reminderActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    logButton: {
      backgroundColor: colors.primary,
    },
    viewButton: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    actionButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600' as any,
    },
    fab: {
      position: 'absolute',
      bottom: spacing.xl,
      right: spacing.xl,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: spacing['2xl'],
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      marginTop: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      marginTop: spacing.xs,
      maxHeight: 200,
      ...shadows.md,
      zIndex: 1000,
    },
    dropdownItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    dropdownItemText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      width: '80%',
      maxHeight: '60%',
      ...shadows.lg,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalList: {
      maxHeight: 300,
    },
    modalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalItemText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    modalItemTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  useEffect(() => {
    if (currentSchool) {
      loadData();
    }
  }, [currentSchool]);

  useEffect(() => {
    if (currentSchool) {
      loadReminders();
    }
  }, [currentSchool, selectedClass, selectedStudent, searchQuery]);

  const loadData = async () => {
    if (!currentSchool) return;
    setLoading(true);
    try {
      await Promise.all([
        loadKPIs(),
        loadClasses(),
        loadStudents(),
        loadReminders(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(
        t('common.error') || 'Error',
        t('school.medicine.admin.loadError') || 'Failed to load medicine data'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadKPIs = async () => {
    if (!currentSchool) return;
    try {
      const data = await fetchMedicineKPIs(currentSchool.id || currentSchool.name);
      setKpis(data);
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  const loadClasses = async () => {
    if (!currentSchool) return;
    try {
      const data = await fetchClassesForSchool(currentSchool.id || currentSchool.name);
      setClasses(data || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    if (!currentSchool) return;
    try {
      const schoolId = await resolveSchoolId(currentSchool.id || currentSchool.name);
      if (!schoolId) return;

      const { data, error } = await supabase
        .from('school_students')
        .select('id, first_name, last_name, class_id')
        .eq('school_id', schoolId)
        .order('first_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadReminders = async () => {
    if (!currentSchool) return;
    try {
      const filters: MedicineFilters = {
        classId: selectedClass,
        studentId: selectedStudent,
        search: searchQuery || undefined,
      };
      const data = await fetchMedicineReminders(
        currentSchool.id || currentSchool.name,
        filters
      );
      setReminders(data);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: '#E8F5E9',
          color: '#4CAF50',
        };
      case 'paused':
        return {
          backgroundColor: '#FFF3E0',
          color: '#FF9800',
        };
      case 'ended':
        return {
          backgroundColor: colors.background.secondary,
          color: colors.text.secondary,
        };
      default:
        return {
          backgroundColor: colors.background.secondary,
          color: colors.text.secondary,
        };
    }
  };

  const formatFrequency = (freq: string) => {
    const map: Record<string, string> = {
      once: t('school.medicine.frequency.once') || 'Once',
      daily: t('school.medicine.frequency.daily') || 'Daily',
      twice_daily: t('school.medicine.frequency.twiceDaily') || 'Twice Daily',
      as_needed: t('school.medicine.frequency.asNeeded') || 'As Needed',
    };
    return map[freq] || freq;
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const renderKPICard = (
    icon: string,
    value: number,
    label: string,
    bgColor: string,
    iconColor: string
  ) => (
    <View style={styles.kpiCard}>
      <View style={[styles.kpiIconContainer, { backgroundColor: bgColor }]}>
        <MaterialIcons name={icon as any} size={24} color={iconColor} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );

  const renderReminderCard = ({ item }: { item: MedicineReminder }) => {
    const statusStyle = getStatusStyle(item.status);
    const student = item.school_students;

    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.studentName}>
              {student?.first_name} {student?.last_name}
            </Text>
            <Text style={styles.studentClass}>
              {t('school.medicine.class') || 'Class'}: {student?.class_id || 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.medicineName}>{item.medicine_name}</Text>
        {item.dosage && (
          <Text style={styles.medicineDetails}>
            {t('school.medicine.dosage') || 'Dosage'}: {item.dosage}
          </Text>
        )}
        <Text style={styles.medicineDetails}>
          {t('school.medicine.log.frequency') || 'Frequency'}: {formatFrequency(item.frequency)}
        </Text>
        {item.time_of_day && item.time_of_day.length > 0 && (
          <Text style={styles.medicineDetails}>
            {t('school.medicine.time') || 'Time'}: {item.time_of_day.map(formatTime).join(', ')}
          </Text>
        )}

        <View style={styles.reminderActions}>
          {item.status === 'active' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.logButton]}
              onPress={() => navigation.navigate('LogMedicine' as never, { reminderId: item.id } as never)}
            >
              <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                {t('school.medicine.logButton') || 'Log'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => Alert.alert('View', `View reminder ${item.id}`)}
          >
            <MaterialIcons name="visibility" size={16} color={colors.text.primary} />
            <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>
              {t('school.medicine.view') || 'View'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <DashboardHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { marginTop: spacing.md }]}>
            {t('common.loading') || 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  const filteredStudents = selectedClass
    ? students.filter(s => s.class_id === selectedClass)
    : students;

  return (
    <View style={styles.container}>
      <DashboardHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>
            {t('school.medicine.admin.title') || 'Medicine Management'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('school.medicine.admin.subtitle') ||
              'Manage medicine reminders and administration logs'}
          </Text>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {renderKPICard(
            'local-pharmacy',
            kpis.totalReminders,
            t('school.medicine.kpi.totalReminders') || 'Total Reminders',
            '#E3F2FD',
            '#2196F3'
          )}
          {renderKPICard(
            'schedule',
            kpis.active,
            t('school.medicine.kpi.active') || 'Active',
            '#E8F5E9',
            '#4CAF50'
          )}
          {renderKPICard(
            'event',
            kpis.dueToday,
            t('school.medicine.kpi.dueToday') || 'Due Today',
            '#FFF3E0',
            '#FF9800'
          )}
          {renderKPICard(
            'check-circle',
            kpis.completedToday,
            t('school.medicine.kpi.completedToday') || 'Completed Today',
            '#F3E5F5',
            '#9C27B0'
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersCard}>
          <Text style={styles.filterLabel}>
            {t('school.medicine.filters') || 'Filters'}
          </Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setClassDropdownVisible(!classDropdownVisible)}
            >
              <Text style={styles.filterButtonText}>
                {selectedClass
                  ? classes.find(c => c.id === selectedClass)?.name || t('common.all') || 'All'
                  : t('school.medicine.allClasses') || 'All Classes'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setStudentDropdownVisible(!studentDropdownVisible)}
            >
              <Text style={styles.filterButtonText}>
                {selectedStudent
                  ? (() => {
                      const s = students.find(st => st.id === selectedStudent);
                      return s ? `${s.first_name} ${s.last_name}` : t('common.all') || 'All';
                    })()
                  : t('school.medicine.allStudents') || 'All Students'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('school.medicine.search') || 'Search students or medicine...'}
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="local-pharmacy" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyText}>
              {t('school.medicine.noReminders') || 'No reminders found'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={reminders}
            renderItem={renderReminderCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddMedicineReminder' as never)}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Class Dropdown Modal */}
      <Modal
        visible={classDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setClassDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setClassDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('school.medicine.filters') || 'Select Class'}
            </Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedClass(null);
                  setSelectedStudent(null);
                  setClassDropdownVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, !selectedClass && styles.modalItemTextSelected]}>
                  {t('school.medicine.allClasses') || 'All Classes'}
                </Text>
                {!selectedClass && (
                  <MaterialIcons name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              {classes.map(cls => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedClass(cls.id);
                    setSelectedStudent(null);
                    setClassDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedClass === cls.id && styles.modalItemTextSelected]}>
                    {cls.name}
                  </Text>
                  {selectedClass === cls.id && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Student Dropdown Modal */}
      <Modal
        visible={studentDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStudentDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStudentDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('school.medicine.allStudents') || 'Select Student'}
            </Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedStudent(null);
                  setStudentDropdownVisible(false);
                }}
              >
                <Text style={[styles.modalItemText, !selectedStudent && styles.modalItemTextSelected]}>
                  {t('school.medicine.allStudents') || 'All Students'}
                </Text>
                {!selectedStudent && (
                  <MaterialIcons name="check" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
              {filteredStudents.map(student => (
                <TouchableOpacity
                  key={student.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedStudent(student.id);
                    setStudentDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, selectedStudent === student.id && styles.modalItemTextSelected]}>
                    {student.first_name} {student.last_name}
                  </Text>
                  {selectedStudent === student.id && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AdminMedicineScreen;



