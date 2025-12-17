/**
 * Admin Students Screen
 * Full-featured student management for school admins
 * Mirrors web admin/students page with mobile-optimized UI
 */

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import SchoolHeader from '../../components/common/SchoolHeader';
import { StudentListItem } from '../../components/school/StudentListItem';
import { KpiRow, KpiItem } from '../../components/kpi/KpiRow';
import { FilterChips, FilterOption } from '../../components/filters/FilterChips';
import { AddStudentModal } from '../../components/school/AddStudentModal';
import {
  getStudents,
  getStudentKPIs,
  getStudentClasses,
  getStudentGrades,
  exportStudentsCSV,
  SchoolStudent,
  StudentKPI,
} from '../../services/supabase-students';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../contexts/ThemeContext';

// Try to import expo-sharing, but handle if not available
let Sharing: any = null;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  console.warn('expo-sharing not available');
}

const StudentsScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    headerTextContainer: {
      flex: 1,
      marginRight: 12,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    screenSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#0B5FFF',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      gap: 6,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.background.primary,
    },
    syncBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: '#EEF2FF',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginTop: 8,
    },
    syncDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#10B981',
      marginRight: 6,
    },
    syncText: {
      fontSize: 12,
      color: '#4338CA',
      fontWeight: '500',
    },
    exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      marginHorizontal: 16,
      marginBottom: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
      gap: 8,
    },
    exportButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    exportButtonTextDisabled: {
      color: colors.text.secondary,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 16,
      color: colors.text.primary,
    },
    filterRow: {
      flexDirection: 'row',
      marginHorizontal: 16,
      marginBottom: 12,
      gap: 8,
    },
    filterDropdown: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.primary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    filterDropdownText: {
      fontSize: 14,
      color: colors.text.primary,
      flex: 1,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    resultsText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    loadingWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    loadingText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 12,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 64,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      color: colors.text.primary,
      marginTop: 16,
      fontWeight: '600',
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyListContent: {
      flexGrow: 1,
    },
    loadMoreButton: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    loadMoreText: {
      fontSize: 14,
      color: '#0B5FFF',
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 16,
      maxHeight: '70%',
      width: '80%',
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalItemText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    modalItemTextSelected: {
      color: '#0B5FFF',
      fontWeight: '600',
    },
  });
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const navigation = useNavigation();

  // State
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [kpis, setKpis] = useState<StudentKPI>({
    total: 0,
    active: 0,
    inactive: 0,
    avgAttendance: 0,
  });
  const [classes, setClasses] = useState<
    Array<{ id: string; name: string; grade_level?: string | null }>
  >([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | string[]>('all');
  const [selectedGrade, setSelectedGrade] = useState<string | string[]>('all');
  const [selectedStatus, setSelectedStatus] = useState<string | string[]>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dropdown modals
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Add student modal
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load KPIs
  const loadKPIs = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      const kpisData = await getStudentKPIs(currentSchool.id);
      setKpis(kpisData);
    } catch (error) {
      console.error('Error loading student KPIs:', error);
    }
  }, [currentSchool]);

  // Load classes for filter
  const loadClasses = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      const classesData = await getStudentClasses(currentSchool.id);
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, [currentSchool]);

  // Load grades for filter
  const loadGrades = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      const gradesData = await getStudentGrades(currentSchool.id);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  }, [currentSchool]);

  // Load students
  const loadStudents = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      setLoading(true);

      // Apply quick filter to status
      let statusFilter = selectedStatus;
      if (quickFilter === 'active') {
        statusFilter = 'active';
      } else if (quickFilter === 'inactive') {
        statusFilter = 'inactive';
      } else if (quickFilter === 'all') {
        statusFilter = 'all';
      }

      const { students: studentsData, total, hasMore: hasMoreData, pageSize } =
        await getStudents(currentSchool.id, {
          search: debouncedSearch,
          classId: selectedClass !== 'all' ? selectedClass : undefined,
          grade: selectedGrade !== 'all' ? selectedGrade : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          page: currentPage,
          limit: 10,
        });

      if (currentPage === 1) {
        setStudents(studentsData);
      } else {
        setStudents((prev) => [...prev, ...studentsData]);
      }

      setTotalCount(total);
      setHasMore(hasMoreData);
      setTotalPages(Math.ceil(total / pageSize));
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    currentSchool,
    debouncedSearch,
    selectedClass,
    selectedGrade,
    selectedStatus,
    quickFilter,
    currentPage,
  ]);

  // Initial load
  useEffect(() => {
    loadKPIs();
    loadClasses();
    loadGrades();
  }, [loadKPIs, loadClasses, loadGrades]);

  // Load students when filters change
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadKPIs();
    loadClasses();
    loadGrades();
    // loadStudents will be called by useEffect
  }, [loadKPIs, loadClasses, loadGrades]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [loading, hasMore]);

  // Handle student press
  const handleStudentPress = useCallback(
    (studentId: string) => {
      // @ts-ignore - Navigation types to be added
      navigation.navigate('StudentDetail', { studentId });
    },
    [navigation]
  );

  // Handle quick filter change
  const handleQuickFilterChange = useCallback(
    (filter: 'all' | 'active' | 'inactive') => {
      setQuickFilter(filter);
      setCurrentPage(1);
    },
    []
  );

  // Handle export CSV
  const handleExportCSV = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      setExporting(true);

      // Apply quick filter to status
      let statusFilter = selectedStatus;
      if (quickFilter === 'active') {
        statusFilter = 'active';
      } else if (quickFilter === 'inactive') {
        statusFilter = 'inactive';
      } else if (quickFilter === 'all') {
        statusFilter = 'all';
      }

      const csvContent = await exportStudentsCSV(currentSchool.id, {
        search: debouncedSearch,
        classId: selectedClass !== 'all' ? selectedClass : undefined,
        grade: selectedGrade !== 'all' ? selectedGrade : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      // Save to file
      const fileName = `students-${currentSchool.id}-${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      if (Sharing) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: t('school.students.export.button'),
          });
        } else {
          Alert.alert(
            t('school.students.export.error'),
            'Sharing is not available on this device'
          );
        }
      } else {
        // Fallback: Just show success message
        Alert.alert(
          t('common.success'),
          `CSV exported to: ${fileName}`
        );
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert(
        t('school.students.export.error'),
        t('school.students.export.error')
      );
    } finally {
      setExporting(false);
    }
  }, [
    currentSchool,
    debouncedSearch,
    selectedClass,
    selectedGrade,
    selectedStatus,
    quickFilter,
    t,
  ]);

  // Build KPI items
  const kpiItems: KpiItem[] = [
    {
      icon: 'people',
      label: t('school.students.kpis.total'),
      value: kpis.total,
      color: '#0B5FFF',
      iconColor: '#0B5FFF',
    },
    {
      icon: 'check-circle',
      label: t('school.students.kpis.active'),
      value: kpis.active,
      color: '#10B981',
      iconColor: '#10B981',
    },
    {
      icon: 'cancel',
      label: t('school.students.kpis.inactive'),
      value: kpis.inactive,
      color: colors.text.secondary,
      iconColor: colors.text.secondary,
    },
    {
      icon: 'trending-up',
      label: t('school.students.kpis.avgAttendance'),
      value: `${kpis.avgAttendance}%`,
      color: '#8B5CF6',
      iconColor: '#8B5CF6',
    },
  ];

  // Quick filter options
  const quickFilterOptions: FilterOption[] = [
    { id: 'all', label: t('school.students.filters.all') },
    { id: 'active', label: t('school.students.status.active') },
    { id: 'inactive', label: t('school.students.status.inactive') },
  ];

  // Get selected class display
  const getSelectedClassDisplay = () => {
    if (selectedClass === 'all') return t('school.students.filters.allClasses');
    if (Array.isArray(selectedClass)) {
      return `${selectedClass.length} ${t('common.selected') || 'selected'}`;
    }
    const cls = classes.find((c) => c.id === selectedClass);
    return cls?.name || t('school.students.filters.allClasses');
  };

  // Get selected grade display
  const getSelectedGradeDisplay = () => {
    if (selectedGrade === 'all') return t('school.students.filters.allGrades');
    if (Array.isArray(selectedGrade)) {
      return `${selectedGrade.length} ${t('common.selected') || 'selected'}`;
    }
    return selectedGrade;
  };

  // Get selected status display
  const getSelectedStatusDisplay = () => {
    if (selectedStatus === 'all') return t('school.students.filters.allStatus');
    if (Array.isArray(selectedStatus)) {
      return `${selectedStatus.length} ${t('common.selected') || 'selected'}`;
    }
    return selectedStatus;
  };

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.headerRow}>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.screenTitle}>
                    {t('school.students.title')}
                  </Text>
                  <Text style={styles.screenSubtitle}>
                  {t('school.students.subtitle')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setAddModalVisible(true)}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>
                    {t('common.add')}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Sync Badge */}
              <View style={styles.syncBadge}>
                <View style={styles.syncDot} />
                <Text style={styles.syncText}>
                  {t('common.synced') || 'Synced'} 2 min ago
                </Text>
              </View>
            </View>

            {/* KPI Cards */}
            <KpiRow kpis={kpiItems} />

            {/* Export CSV Button */}
            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExportCSV}
              disabled={exporting}
            >
              <MaterialIcons
                name="download"
                size={20}
                color={exporting ? colors.text.secondary : colors.text.primary}
              />
              <Text
                style={[
                  styles.exportButtonText,
                  exporting && styles.exportButtonTextDisabled,
                ]}
              >
                {exporting
                  ? t('school.students.export.exporting')
                  : t('school.students.export.button')}
              </Text>
            </TouchableOpacity>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color={colors.text.secondary} />
              <TextInput
                placeholder={t('school.students.searchPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>

            {/* Filter Dropdowns */}
            <View style={styles.filterRow}>
              {/* Class Filter */}
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => setShowClassDropdown(true)}
              >
                <Text style={styles.filterDropdownText}>
                  {getSelectedClassDisplay()}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              {/* Grade Filter */}
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => setShowGradeDropdown(true)}
              >
                <Text style={styles.filterDropdownText}>
                  {getSelectedGradeDisplay()}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              {/* Status Filter */}
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => setShowStatusDropdown(true)}
              >
                <Text style={styles.filterDropdownText}>
                  {getSelectedStatusDisplay()}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Quick Filter Chips */}
            <FilterChips
              options={quickFilterOptions}
              selected={quickFilter}
              onSelect={(id) =>
                handleQuickFilterChange(id as 'all' | 'active' | 'inactive')
              }
            />

            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {t('school.students.showing')} {students.length}{' '}
                {t('school.students.of')} {totalCount}{' '}
                {t('school.students.students')}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <StudentListItem
            student={item}
            onPress={() => handleStudentPress(item.id)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#0B5FFF" size="large" />
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="people" size={64} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>
                {t('school.students.noStudents')}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t('school.students.noStudentsSubtitle')}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          hasMore && !loading ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>
                {t('common.loadMore') || 'Load More'} (
                {totalCount - students.length} {t('common.remaining') || 'remaining'})
              </Text>
            </TouchableOpacity>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0B5FFF"
            colors={['#0B5FFF']}
          />
        }
        contentContainerStyle={
          students.length === 0 ? styles.emptyListContent : undefined
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={() => {
          // Reload students list and KPIs after successful creation
          loadStudents();
          loadKPIs();
          setAddModalVisible(false);
        }}
      />

      {/* Class Dropdown Modal */}
      <Modal
        visible={showClassDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClassDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowClassDropdown(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedClass('all');
                  setShowClassDropdown(false);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedClass === 'all' && styles.modalItemTextSelected,
                  ]}
                >
                  {t('school.students.filters.allClasses')}
                </Text>
                {selectedClass === 'all' && (
                  <MaterialIcons name="check" size={20} color="#0B5FFF" />
                )}
              </TouchableOpacity>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedClass(cls.id);
                    setShowClassDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedClass === cls.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {cls.name}
                  </Text>
                  {selectedClass === cls.id && (
                    <MaterialIcons name="check" size={20} color="#0B5FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Grade Dropdown Modal */}
      <Modal
        visible={showGradeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGradeDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGradeDropdown(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedGrade('all');
                  setShowGradeDropdown(false);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedGrade === 'all' && styles.modalItemTextSelected,
                  ]}
                >
                  {t('school.students.filters.allGrades')}
                </Text>
                {selectedGrade === 'all' && (
                  <MaterialIcons name="check" size={20} color="#0B5FFF" />
                )}
              </TouchableOpacity>
              {grades.map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedGrade(grade);
                    setShowGradeDropdown(false);
                    setCurrentPage(1);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedGrade === grade && styles.modalItemTextSelected,
                    ]}
                  >
                    {grade}
                  </Text>
                  {selectedGrade === grade && (
                    <MaterialIcons name="check" size={20} color="#0B5FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Status Dropdown Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStatusDropdown(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedStatus('all');
                  setShowStatusDropdown(false);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedStatus === 'all' && styles.modalItemTextSelected,
                  ]}
                >
                  {t('school.students.filters.allStatus')}
                </Text>
                {selectedStatus === 'all' && (
                  <MaterialIcons name="check" size={20} color="#0B5FFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedStatus('active');
                  setShowStatusDropdown(false);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedStatus === 'active' && styles.modalItemTextSelected,
                  ]}
                >
                  {t('school.students.status.active')}
                </Text>
                {selectedStatus === 'active' && (
                  <MaterialIcons name="check" size={20} color="#0B5FFF" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedStatus('inactive');
                  setShowStatusDropdown(false);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedStatus === 'inactive' && styles.modalItemTextSelected,
                  ]}
                >
                  {t('school.students.status.inactive')}
                </Text>
                {selectedStatus === 'inactive' && (
                  <MaterialIcons name="check" size={20} color="#0B5FFF" />
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default StudentsScreen;


